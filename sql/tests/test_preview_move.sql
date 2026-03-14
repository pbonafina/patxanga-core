-- ============================================================
-- PATXANGA - TEST: preview move
-- Purpose: ensure preview returns score without mutating match state
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_player_id uuid;
    v_tile_1 uuid := gen_random_uuid();
    v_tile_2 uuid := gen_random_uuid();
    v_rack jsonb;
    v_preview jsonb;
    v_invalid_preview jsonb;
    v_center_tile jsonb;
    v_rack_after jsonb;
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
    into v_player_id
    from patxanga_matches
    where id = v_match_id;

    v_rack := jsonb_build_array(
        jsonb_build_object(
            'id', v_tile_1::text,
            'letter', 'D',
            'points', 2,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object(
            'id', v_tile_2::text,
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
    set rack_state = v_rack,
        updated_at = now()
    where id = v_player_id;

    v_preview := public.preview_patxanga_move(
        v_match_id,
        v_player_id,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_tile_1::text,
                'row', 8,
                'col', 8,
                'declared_letter', null
            ),
            jsonb_build_object(
                'tile_id', v_tile_2::text,
                'row', 8,
                'col', 9,
                'declared_letter', null
            )
        )
    );

    if v_preview->>'status' <> 'ok' then
        raise exception 'Expected preview ok, got %', v_preview;
    end if;

    if v_preview->>'main_word' <> 'DA' then
        raise exception 'Expected main word DA, got %', v_preview->>'main_word';
    end if;

    if coalesce((v_preview->'score'->>'total_score')::integer, -1) <> 6 then
        raise exception 'Expected preview total_score 6, got %', v_preview->'score'->>'total_score';
    end if;

    if coalesce((v_preview->>'requires_vote')::boolean, true) then
        raise exception 'Expected preview to be dictionary-recognized, got %', v_preview;
    end if;

    select board_state->7->7->'tile'
    into v_center_tile
    from patxanga_matches
    where id = v_match_id;

    if coalesce(jsonb_typeof(v_center_tile), 'null') <> 'null' then
        raise exception 'Preview should not mutate board_state, but center tile became %', v_center_tile;
    end if;

    select rack_state
    into v_rack_after
    from patxanga_players
    where id = v_player_id;

    if v_rack_after <> v_rack then
        raise exception 'Preview should not mutate rack_state';
    end if;

    v_invalid_preview := public.preview_patxanga_move(
        v_match_id,
        v_player_id,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_tile_1::text,
                'row', 8,
                'col', 8,
                'declared_letter', null
            ),
            jsonb_build_object(
                'tile_id', v_tile_2::text,
                'row', 8,
                'col', 10,
                'declared_letter', null
            )
        )
    );

    if v_invalid_preview->>'status' <> 'invalid' then
        raise exception 'Expected invalid preview for gap move, got %', v_invalid_preview;
    end if;

    if position('Horizontal move contains gaps' in coalesce(v_invalid_preview->>'error', '')) = 0 then
        raise exception 'Expected gap error in preview, got %', v_invalid_preview;
    end if;
end $$;
