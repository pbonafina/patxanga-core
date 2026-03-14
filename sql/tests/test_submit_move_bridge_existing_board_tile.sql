-- ============================================================
-- PATXANGA - TEST: submit move bridging existing board tile
-- Purpose: ensure continuity allows fixed board tiles between placed tiles
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_opening_player_id uuid;
    v_second_player_id uuid;
    v_opening_tile_1 uuid := gen_random_uuid();
    v_opening_tile_2 uuid := gen_random_uuid();
    v_bridge_tile_1 uuid := gen_random_uuid();
    v_bridge_tile_2 uuid := gen_random_uuid();
    v_opening_rack jsonb;
    v_bridge_rack jsonb;
    v_opening_result jsonb;
    v_bridge_result jsonb;
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
    into v_opening_player_id
    from patxanga_matches
    where id = v_match_id;

    v_opening_rack := jsonb_build_array(
        jsonb_build_object(
            'id', v_opening_tile_1::text,
            'letter', 'D',
            'points', 2,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object(
            'id', v_opening_tile_2::text,
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
    set rack_state = v_opening_rack,
        updated_at = now()
    where id = v_opening_player_id;

    v_opening_result := public.submit_patxanga_move(
        v_match_id,
        v_opening_player_id,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_opening_tile_1::text,
                'row', 8,
                'col', 8,
                'declared_letter', null
            ),
            jsonb_build_object(
                'tile_id', v_opening_tile_2::text,
                'row', 8,
                'col', 9,
                'declared_letter', null
            )
        )
    );

    if v_opening_result->>'status' <> 'success' then
        raise exception 'Expected opening move success, got %', v_opening_result;
    end if;

    select current_turn_player_id
    into v_second_player_id
    from patxanga_matches
    where id = v_match_id;

    if v_second_player_id = v_opening_player_id then
        raise exception 'Expected turn to advance to second player';
    end if;

    v_bridge_rack := jsonb_build_array(
        jsonb_build_object(
            'id', v_bridge_tile_1::text,
            'letter', 'D',
            'points', 2,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object(
            'id', v_bridge_tile_2::text,
            'letter', 'R',
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
            'letter', 'T',
            'points', 1,
            'is_special', false,
            'special_type', null
        )
    );

    update patxanga_players
    set rack_state = v_bridge_rack,
        updated_at = now()
    where id = v_second_player_id;

    v_bridge_result := public.submit_patxanga_move(
        v_match_id,
        v_second_player_id,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_bridge_tile_1::text,
                'row', 7,
                'col', 9,
                'declared_letter', null
            ),
            jsonb_build_object(
                'tile_id', v_bridge_tile_2::text,
                'row', 9,
                'col', 9,
                'declared_letter', null
            )
        )
    );

    if v_bridge_result->>'status' <> 'pending_vote' then
        raise exception 'Expected pending_vote for bridged move, got %', v_bridge_result;
    end if;

    if v_bridge_result->>'match_status' <> 'voting' then
        raise exception 'Expected match status voting, got %', v_bridge_result->>'match_status';
    end if;
end $$;
