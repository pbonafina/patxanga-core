-- ============================================================
-- PATXANGA - FORFEIT SINGLE PLAYER TEST
-- Version: 1.0
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_other_player_id uuid;
    v_result jsonb;
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
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_other_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_current_player_id
    limit 1;

    v_result := public.forfeit_patxanga_match(
        p_match_id := v_match_id,
        p_player_id := v_current_player_id
    );

    raise notice 'Forfeit result: %', v_result;

    raise notice 'Current turn after forfeit: %',
    (
        select current_turn_player_id
        from patxanga_matches
        where id = v_match_id
    );

    raise notice 'Forfeited flag: %',
    (
        select has_forfeited
        from patxanga_players
        where id = v_current_player_id
    );

    raise notice 'Match status: %',
    (
        select status
        from patxanga_matches
        where id = v_match_id
    );
end $$;
