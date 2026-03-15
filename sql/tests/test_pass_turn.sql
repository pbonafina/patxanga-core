-- ============================================================
-- PATXANGA - DETERMINISTIC PASS TURN TEST
-- Version: 1.0
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_pass_result jsonb;
begin

    -- 1. Create match
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    -- 2. Join second player
    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    -- 3. Start match
    perform public.start_patxanga_match(v_match_id);

    -- 4. Current turn player
    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    raise notice 'Current turn player_id: %', v_current_player_id;

    -- 5. Pass turn
    v_pass_result := public.submit_patxanga_pass_turn(
        v_match_id,
        v_current_player_id
    );

    raise notice 'Pass result: %', v_pass_result;

    raise notice 'Match turn_number: %',
    (
        select turn_number
        from patxanga_matches
        where id = v_match_id
    );

    raise notice 'Match current_turn_player_id: %',
    (
        select current_turn_player_id
        from patxanga_matches
        where id = v_match_id
    );

    raise notice 'Move count pass: %',
    (
        select count(*)
        from patxanga_moves
        where match_id = v_match_id
          and move_type = 'pass'
          and status = 'accepted'
    );

    raise notice 'Player has_passed_last_cycle: %',
    (
        select has_passed_last_cycle
        from patxanga_players
        where id = v_current_player_id
    );

end $$;
