-- ============================================================
-- PATXANGA - DETERMINISTIC AUTO ENGINE TEST
-- submit_patxanga_move()
-- Version: 1.7 (Forced valid opening rack)
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_forced_rack jsonb;
    v_tile1_id uuid := gen_random_uuid();
    v_tile2_id uuid := gen_random_uuid();
    v_submit_result jsonb;
    v_accepted_move_count integer;
begin

    -- 1. Create match
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    raise notice 'Match created: %', v_match_id;

    -- 2. Join second player
    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    raise notice 'Second player joined: %', v_user2;

    raise notice 'Players in match: %',
    (
        select count(*)
        from patxanga_players
        where match_id = v_match_id
    );

    -- 3. Start match
    perform public.start_patxanga_match(v_match_id);

    raise notice 'Match started';

    -- 4. Discover current turn PLAYER id
    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    raise notice 'Current turn player_id: %', v_current_player_id;

    -- 5. Force a deterministic rack with valid opening word "DA"
    v_forced_rack := jsonb_build_array(
        jsonb_build_object(
            'id', v_tile1_id::text,
            'letter', 'D',
            'points', 2,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object(
            'id', v_tile2_id::text,
            'letter', 'A',
            'points', 1,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'letter', 'S',
            'points', 1,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'letter', 'E',
            'points', 1,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'letter', 'M',
            'points', 2,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'letter', 'O',
            'points', 1,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object(
            'id', gen_random_uuid()::text,
            'letter', 'R',
            'points', 1,
            'is_special', false,
            'special_type', null
        )
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_current_player_id;

    raise notice 'Forced rack injected for current player';

    -- 6. Submit valid opening word "DA"
    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_tile1_id::text,
                'row', 8,
                'col', 8,
                'declared_letter', null
            ),
            jsonb_build_object(
                'tile_id', v_tile2_id::text,
                'row', 8,
                'col', 9,
                'declared_letter', null
            )
        )
    );

    raise notice 'Submit result: %', v_submit_result;

    if v_submit_result->>'status' <> 'success' then
        raise exception 'Expected success status, got %', v_submit_result;
    end if;

    if v_submit_result->>'move_id' is null then
        raise exception 'Expected accepted move_id in success result, got %', v_submit_result;
    end if;

    select count(*)
    into v_accepted_move_count
    from patxanga_moves
    where match_id = v_match_id
      and player_id = v_current_player_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'DA'
      and score_total = 6;

    if v_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted place_word move, got %', v_accepted_move_count;
    end if;

    raise notice 'Accepted place_word move count: %', v_accepted_move_count;

    raise notice 'Board state: %',
    (
        select board_state
        from patxanga_matches
        where id = v_match_id
    );

    raise notice 'Bag remaining: %',
    (
        select bag_state->>'remaining'
        from patxanga_matches
        where id = v_match_id
    );

    raise notice 'Current player score: %',
    (
        select score
        from patxanga_players
        where id = v_current_player_id
    );

    raise notice 'Current player rack size: %',
    (
        select jsonb_array_length(rack_state)
        from patxanga_players
        where id = v_current_player_id
    );

end $$;
