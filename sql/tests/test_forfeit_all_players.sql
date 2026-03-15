-- ============================================================
-- PATXANGA - FORFEIT ALL PLAYERS TEST
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

    v_p2 := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    select id
    into v_p1
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_user1
    limit 1;

    v_result1 := public.forfeit_patxanga_match(
        p_match_id := v_match_id,
        p_player_id := v_p1
    );

    raise notice 'Forfeit 1 result: %', v_result1;

    v_result2 := public.forfeit_patxanga_match(
        p_match_id := v_match_id,
        p_player_id := v_p2
    );

    raise notice 'Forfeit 2 result: %', v_result2;

    raise notice 'Match status: %',
    (
        select status
        from patxanga_matches
        where id = v_match_id
    );
end $$;
