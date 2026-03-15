-- ============================================================
-- PATXANGA - DETERMINISTIC PENDING VOTE REJECT TEST
-- Version: 1.0
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_other_player_id uuid;
    v_forced_rack jsonb;
    v_tile1_id uuid := gen_random_uuid();
    v_tile2_id uuid := gen_random_uuid();
    v_submit_result jsonb;
    v_move_id uuid;
    v_vote_result jsonb;
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

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile1_id::text, 'letter', 'T', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile2_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_current_player_id;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile1_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile2_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    v_move_id := (v_submit_result->>'move_id')::uuid;

    raise notice 'Pending move id: %', v_move_id;

    v_vote_result := public.submit_patxanga_vote(
        v_move_id,
        v_other_player_id,
        true
    );

    raise notice 'Vote result: %', v_vote_result;

    raise notice 'Match status: %',
    (
        select status
        from patxanga_matches
        where id = v_match_id
    );

    raise notice 'Move status: %',
    (
        select status
        from patxanga_moves
        where id = v_move_id
    );

    raise notice 'Board center tile: %',
    (
        select board_state->7->7->'tile'
        from patxanga_matches
        where id = v_match_id
    );
end $$;
