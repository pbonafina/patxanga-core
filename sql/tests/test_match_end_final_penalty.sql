-- ============================================================
-- PATXANGA - MATCH END TEST (final penalties)
-- Version: 1.0
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_other_player_id uuid;
    v_forced_rack_current jsonb;
    v_forced_rack_other jsonb;
    v_tile1_id uuid := gen_random_uuid();
    v_tile2_id uuid := gen_random_uuid();
    v_tile3_id uuid := gen_random_uuid();
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

    -- Force bag empty
    update patxanga_matches
    set bag_state = jsonb_build_object(
        'tiles', '[]'::jsonb,
        'remaining', 0
    )
    where id = v_match_id;

    -- Current player has exactly SOL and will empty rack
    v_forced_rack_current := jsonb_build_array(
        jsonb_build_object('id', v_tile1_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile2_id::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile3_id::text, 'letter', 'L', 'points', 2, 'is_special', false, 'special_type', null)
    );

    -- Other player keeps 2 tiles worth 4 total
    v_forced_rack_other := jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack_current,
        score = 0
    where id = v_current_player_id;

    update patxanga_players
    set rack_state = v_forced_rack_other,
        score = 0
    where id = v_other_player_id;

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

    raise notice 'Current player final score: %',
    (
        select score
        from patxanga_players
        where id = v_current_player_id
    );

    raise notice 'Other player final score: %',
    (
        select score
        from patxanga_players
        where id = v_other_player_id
    );
end $$;
