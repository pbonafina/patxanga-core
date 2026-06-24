-- ============================================================
-- PATXANGA - MATCH END TEST (all passed, even with non-empty bag)
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

    if v_result1->'end_state'->>'reason' <> 'bag_not_empty' then
        raise exception 'Expected first pass not to end because bag is not empty, got %', v_result1;
    end if;

    if coalesce((v_result2->'end_state'->>'finished')::boolean, false) is not true then
        raise exception 'Expected second consecutive pass to finish match, got %', v_result2;
    end if;

    if coalesce((v_result2->'end_state'->>'ended_by_all_passed')::boolean, false) is not true then
        raise exception 'Expected ended_by_all_passed true, got %', v_result2;
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'finished' then
        raise exception 'Expected finished match after all players passed';
    end if;
end $$;
