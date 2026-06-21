-- ============================================================
-- PATXANGA - TEST: lexical policy voting path
-- Purpose: unrecognized policy-edge words require voting and do not mutate board
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_n_id uuid := gen_random_uuid();
    v_a1_id uuid := gen_random_uuid();
    v_s_id uuid := gen_random_uuid();
    v_a2_id uuid := gen_random_uuid();
    v_preview_result jsonb;
    v_submit_result jsonb;
    v_pending_move_count integer;
    v_board_center jsonb;
begin
    if public.validate_word('NASA', 'pt-BR') is true then
        raise exception 'Expected policy-edge word NASA not to validate before voting';
    end if;

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
    from public.patxanga_matches
    where id = v_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_n_id::text, 'letter', 'N', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_a1_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_a2_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_current_player_id;

    v_preview_result := public.preview_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_n_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a1_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_s_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a2_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_preview_result->>'status' <> 'ok' then
        raise exception 'Expected NASA preview to be structurally ok, got %',
            v_preview_result;
    end if;

    if v_preview_result->>'main_word' <> 'NASA' then
        raise exception 'Expected preview main_word NASA, got %', v_preview_result;
    end if;

    if coalesce((v_preview_result->>'requires_vote')::boolean, false) is not true then
        raise exception 'Expected unrecognized NASA preview to require vote, got %',
            v_preview_result;
    end if;

    if coalesce((v_preview_result->>'is_dictionary_recognized')::boolean, true) is not false then
        raise exception 'Expected unrecognized NASA preview not dictionary-recognized, got %',
            v_preview_result;
    end if;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_n_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a1_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_s_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a2_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_submit_result->>'status' <> 'pending_vote' then
        raise exception 'Expected NASA submit to enter pending_vote, got %',
            v_submit_result;
    end if;

    if v_submit_result->>'main_word' <> 'NASA' then
        raise exception 'Expected pending vote main_word NASA, got %',
            v_submit_result;
    end if;

    select count(*)
    into v_pending_move_count
    from public.patxanga_moves
    where id = (v_submit_result->>'move_id')::uuid
      and match_id = v_match_id
      and player_id = v_current_player_id
      and main_word = 'NASA'
      and status = 'pending_vote'
      and is_dictionary_recognized = false
      and requires_vote = true;

    if v_pending_move_count <> 1 then
        raise exception 'Expected exactly 1 pending_vote NASA move, got %',
            v_pending_move_count;
    end if;

    select board_state->7->7->'tile'
    into v_board_center
    from public.patxanga_matches
    where id = v_match_id;

    if v_board_center <> 'null'::jsonb then
        raise exception 'Expected board center to remain empty before vote resolution, got %',
            v_board_center;
    end if;

    if (
        select status
        from public.patxanga_matches
        where id = v_match_id
    ) <> 'voting' then
        raise exception 'Expected match to be in voting status after NASA submit';
    end if;

    raise notice 'Dictionary policy voting path test passed';
    raise notice 'preview_result=%', v_preview_result;
    raise notice 'submit_result=%', v_submit_result;
end $$;
