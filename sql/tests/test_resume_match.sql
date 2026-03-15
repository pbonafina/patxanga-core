-- ============================================================
-- PATXANGA - RESUME MATCH TEST
-- Version: 1.0
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_player2_id uuid;
    v_result jsonb;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    v_player2_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    update patxanga_match_presence
    set is_online = false
    where match_id = v_match_id
      and player_id = v_player2_id;

    v_result := public.resume_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    raise notice 'Resume result: %', v_result;

    raise notice 'Presence online after resume: %',
    (
        select is_online
        from patxanga_match_presence
        where match_id = v_match_id
          and player_id = v_player2_id
    );
end $$;
