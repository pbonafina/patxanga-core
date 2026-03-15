-- ============================================================
-- PATXANGA - MATCH END TEST (bag empty + all passed)
-- Version: 1.0
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_p1 uuid;
    v_p2 uuid;
    v_result1 jsonb;
    v_result2 jsonb;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    perform public.start_patxanga_match(v_match_id);

    -- Force bag empty
    update patxanga_matches
    set bag_state = jsonb_build_object(
        'tiles', '[]'::jsonb,
        'remaining', 0
    )
    where id = v_match_id;

    select current_turn_player_id
    into v_p1
    from patxanga_matches
    where id = v_match_id;

    v_result1 := public.submit_patxanga_pass_turn(
        v_match_id,
        v_p1
    );

    raise notice 'Pass 1 result: %', v_result1;

    select current_turn_player_id
    into v_p2
    from patxanga_matches
    where id = v_match_id;

    v_result2 := public.submit_patxanga_pass_turn(
        v_match_id,
        v_p2
    );

    raise notice 'Pass 2 result: %', v_result2;

    raise notice 'Match status: %',
    (
        select status
        from patxanga_matches
        where id = v_match_id
    );

    raise notice 'Winner player id: %',
    (
        select winner_player_id
        from patxanga_matches
        where id = v_match_id
    );
end $$;
