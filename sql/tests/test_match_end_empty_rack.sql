-- ============================================================
-- PATXANGA - MATCH END TEST (bag empty + rack empty)
-- Version: 1.0
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
    v_tile3_id uuid := gen_random_uuid();
    v_result jsonb;
    v_bootstrap jsonb;
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

    -- Force bag empty
    update patxanga_matches
    set bag_state = jsonb_build_object(
        'tiles', '[]'::jsonb,
        'remaining', 0
    )
    where id = v_match_id;

    -- Force rack with exactly SOL
    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile1_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile2_id::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile3_id::text, 'letter', 'L', 'points', 2, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack
    where id = v_current_player_id;

    v_result := public.submit_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile1_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile2_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile3_id::text, 'row', 8, 'col', 10, 'declared_letter', null)
        )
    );

    raise notice 'Move result: %', v_result;

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

    v_bootstrap := public.get_patxanga_match_bootstrap(v_match_id, v_user1);

    raise notice 'Bootstrap end summary: %', v_bootstrap->'end_summary';

    if v_bootstrap->>'status' <> 'finished' then
        raise exception 'Expected finished status after empty rack end, got %', v_bootstrap->>'status';
    end if;

    if v_bootstrap->'end_summary'->>'reason' <> 'empty_rack' then
        raise exception 'Expected empty_rack end reason, got %', v_bootstrap->'end_summary'->>'reason';
    end if;

    if not coalesce((v_bootstrap->'end_summary'->>'ended_by_empty_rack')::boolean, false) then
        raise exception 'Expected ended_by_empty_rack true in bootstrap end summary';
    end if;

    if coalesce((v_bootstrap->'end_summary'->>'ended_by_all_passed')::boolean, true) then
        raise exception 'Expected ended_by_all_passed false in bootstrap end summary';
    end if;

    if v_bootstrap->'end_summary'->>'empty_rack_player_id' <> v_current_player_id::text then
        raise exception 'Expected empty_rack_player_id to match current player';
    end if;

    if coalesce((v_bootstrap->'end_summary'->>'total_penalties')::integer, -1) < 0 then
        raise exception 'Expected non-negative total_penalties in bootstrap end summary';
    end if;
end $$;
