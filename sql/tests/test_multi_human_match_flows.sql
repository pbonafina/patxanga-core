do $$
declare
    v_users uuid[] := array[
        gen_random_uuid(),
        gen_random_uuid(),
        gen_random_uuid(),
        gen_random_uuid()
    ];
    v_match_id uuid;
    v_players uuid[];
    v_initial_turn_player_id uuid;
    v_current_player_id uuid;
    v_pass_result jsonb;
    i integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_users[1],
        p_host_guest_name := 'Multi Pass Host',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 4
    );

    for i in 2..4 loop
        perform public.join_patxanga_match(
            p_match_id := v_match_id,
            p_user_id := v_users[i],
            p_guest_name := format('Multi Pass Player %s', i)
        );
    end loop;

    perform public.start_patxanga_match(v_match_id);

    select array_agg(id order by turn_order)
    into v_players
    from public.patxanga_players
    where match_id = v_match_id;

    if array_length(v_players, 1) <> 4 then
        raise exception 'Expected 4 players in pass scenario';
    end if;

    select current_turn_player_id
    into v_initial_turn_player_id
    from public.patxanga_matches
    where id = v_match_id;

    for i in 1..3 loop
        select current_turn_player_id
        into v_current_player_id
        from public.patxanga_matches
        where id = v_match_id;

        v_pass_result := public.submit_patxanga_pass_turn(
            v_match_id,
            v_current_player_id
        );

        if v_pass_result->>'status' <> 'success' then
            raise exception 'Expected pass success in multi-player turn cycle, got %', v_pass_result;
        end if;
    end loop;

    if (
        select status
        from public.patxanga_matches
        where id = v_match_id
    ) <> 'active' then
        raise exception 'Expected match to stay active before every player passes';
    end if;

    if (
        select turn_number
        from public.patxanga_matches
        where id = v_match_id
    ) <> 4 then
        raise exception 'Expected turn number 4 after three passes';
    end if;

    if (
        select count(*)
        from public.patxanga_moves
        where match_id = v_match_id
          and move_type = 'pass'
          and status = 'accepted'
    ) <> 3 then
        raise exception 'Expected three accepted pass moves';
    end if;

    raise notice 'Multi-human four-player pass cycle test passed';
    raise notice 'match_id=% first_player_id=%', v_match_id, v_initial_turn_player_id;
end;
$$;

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_second_user_id uuid := gen_random_uuid();
    v_third_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_author_player_id uuid;
    v_voter_one_player_id uuid;
    v_voter_two_player_id uuid;
    v_t_tile_id uuid := gen_random_uuid();
    v_s_tile_id uuid := gen_random_uuid();
    v_submit_result jsonb;
    v_first_vote_result jsonb;
    v_second_vote_result jsonb;
    v_move_id uuid;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Multi Vote Host',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 3
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_second_user_id,
        p_guest_name := 'Multi Vote Second'
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_third_user_id,
        p_guest_name := 'Multi Vote Third'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_author_player_id
    from public.patxanga_matches
    where id = v_match_id;

    select id
    into v_voter_one_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and id <> v_author_player_id
    order by turn_order
    limit 1;

    select id
    into v_voter_two_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and id not in (v_author_player_id, v_voter_one_player_id)
    order by turn_order
    limit 1;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object(
                'id', v_t_tile_id::text,
                'letter', 'T',
                'points', 2,
                'is_special', false,
                'special_type', null
            ),
            jsonb_build_object(
                'id', v_s_tile_id::text,
                'letter', 'S',
                'points', 1,
                'is_special', false,
                'special_type', null
            ),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_author_player_id;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_author_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_t_tile_id::text, 'row', 8, 'col', 8),
            jsonb_build_object('tile_id', v_s_tile_id::text, 'row', 8, 'col', 9)
        )
    );

    if v_submit_result->>'status' <> 'pending_vote' then
        raise exception 'Expected TS to enter pending vote in 3-player match, got %', v_submit_result;
    end if;

    v_move_id := (v_submit_result->>'move_id')::uuid;

    v_first_vote_result := public.submit_patxanga_vote(
        v_move_id,
        v_voter_one_player_id,
        false
    );

    if v_first_vote_result->>'status' <> 'pending_vote' then
        raise exception 'Expected first approval to keep vote pending, got %', v_first_vote_result;
    end if;

    if (v_first_vote_result->>'votes_required')::integer <> 2 then
        raise exception 'Expected two approvals required in 3-player match, got %', v_first_vote_result;
    end if;

    v_second_vote_result := public.submit_patxanga_vote(
        v_move_id,
        v_voter_two_player_id,
        false
    );

    if v_second_vote_result->>'status' <> 'accepted' then
        raise exception 'Expected second approval to accept pending word, got %', v_second_vote_result;
    end if;

    if (
        select status
        from public.patxanga_matches
        where id = v_match_id
    ) <> 'active' then
        raise exception 'Expected match to return active after multi-vote acceptance';
    end if;

    if (
        select count(*)
        from public.patxanga_votes
        where move_id = v_move_id
    ) <> 2 then
        raise exception 'Expected two persisted votes for 3-player pending word';
    end if;

    raise notice 'Multi-human three-player vote quorum test passed';
    raise notice 'match_id=% move_id=%', v_match_id, v_move_id;
end;
$$;
