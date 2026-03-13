do
$$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_current_user_id uuid;
    v_other_player_id uuid;
    v_forced_rack jsonb;
    v_submit_result jsonb;
    v_context jsonb;
begin
    v_match_id := public.create_patxanga_match(
        p_language := 'pt-BR',
        p_host_user_id := v_user1,
        p_host_guest_name := 'Host Pending Context Test',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2,
        p_guest_name := 'Guest Pending Context Test'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    select user_id
    into v_current_user_id
    from patxanga_players
    where id = v_current_player_id;

    select id
    into v_other_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_current_player_id
    limit 1;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid(), 'letter', 'T', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid(), 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid(), 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid(), 'letter', 'M', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid(), 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid(), 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid(), 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_current_player_id;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_forced_rack->0->>'id', 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_forced_rack->1->>'id', 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    v_context := public.get_patxanga_pending_vote_context(v_match_id, v_current_user_id);

    raise notice 'submit result: %', v_submit_result;
    raise notice 'context: %', v_context;

    if v_submit_result->>'status' <> 'pending_vote' then
        raise exception 'Expected pending_vote submit result';
    end if;

    if v_context->>'match_status' <> 'voting' then
        raise exception 'Expected match_status voting in pending context';
    end if;

    if v_context->'pending_move' is null then
        raise exception 'Expected pending_move in pending vote context';
    end if;

    if v_context->'pending_move'->>'status' <> 'pending_vote' then
        raise exception 'Expected pending_move.status pending_vote';
    end if;

    if jsonb_array_length(v_context->'pending_move'->'placed_tiles') <> 2 then
        raise exception 'Expected 2 placed tiles in pending context';
    end if;
end;
$$;
