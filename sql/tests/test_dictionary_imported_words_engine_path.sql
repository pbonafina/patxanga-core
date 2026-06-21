-- ============================================================
-- PATXANGA - TEST: imported dictionary words through engine path
-- Purpose: validate imported words in validate, preview and submit
-- ============================================================

do $$
declare
    v_pt_br_user1 uuid := gen_random_uuid();
    v_pt_br_user2 uuid := gen_random_uuid();
    v_pt_pt_user1 uuid := gen_random_uuid();
    v_pt_pt_user2 uuid := gen_random_uuid();
    v_pt_br_match_id uuid;
    v_pt_pt_match_id uuid;
    v_pt_br_player_id uuid;
    v_pt_pt_player_id uuid;
    v_pt_br_import_result jsonb;
    v_pt_pt_import_result jsonb;
    v_pt_br_preview_result jsonb;
    v_pt_pt_preview_result jsonb;
    v_pt_br_submit_result jsonb;
    v_pt_pt_submit_result jsonb;
    v_pt_br_accepted_move_count integer;
    v_pt_pt_accepted_move_count integer;
    v_pt_br_source_row_count integer;
    v_pt_pt_source_row_count integer;
    v_n_id uuid := gen_random_uuid();
    v_e_id uuid := gen_random_uuid();
    v_x_id uuid := gen_random_uuid();
    v_o_id uuid := gen_random_uuid();
    v_a1_id uuid := gen_random_uuid();
    v_b_id uuid := gen_random_uuid();
    v_a2_id uuid := gen_random_uuid();
    v_c_id uuid := gen_random_uuid();
    v_o2_id uuid := gen_random_uuid();
begin
    delete from public.patxanga_dictionary
    where source = 'imported_words_engine_test';

    delete from public.patxanga_dictionary_import_batches
    where source = 'imported_words_engine_test';

    if public.validate_word('NEXO', 'pt-BR') is true then
        raise exception 'Fixture word NEXO unexpectedly validates before import';
    end if;

    if public.validate_word('ABACO', 'pt-PT') is true then
        raise exception 'Fixture word ABACO unexpectedly validates before import';
    end if;

    select public.import_patxanga_dictionary_entries(
        p_language := 'pt-BR',
        p_source := 'imported_words_engine_test',
        p_license_name := 'Test Fixture License',
        p_entries := jsonb_build_array(
            jsonb_build_object('word', 'NEXO'),
            jsonb_build_object('word', 'FALSO', 'is_active', false)
        ),
        p_source_version := 'fixture-v1',
        p_license_url := 'https://example.test/license',
        p_source_url := 'https://example.test/pt-br-source',
        p_imported_by := 'sql-test',
        p_metadata := jsonb_build_object(
            'fixture', true,
            'policy', 'docs/lexical-policy-v1.0.md'
        ),
        p_deactivate_missing := false
    )
    into v_pt_br_import_result;

    select public.import_patxanga_dictionary_entries(
        p_language := 'pt-PT',
        p_source := 'imported_words_engine_test',
        p_license_name := 'Test Fixture License',
        p_entries := jsonb_build_array(
            jsonb_build_object('word', 'ÁBACO')
        ),
        p_source_version := 'fixture-v1',
        p_license_url := 'https://example.test/license',
        p_source_url := 'https://example.test/pt-pt-source',
        p_imported_by := 'sql-test',
        p_metadata := jsonb_build_object(
            'fixture', true,
            'policy', 'docs/lexical-policy-v1.0.md'
        ),
        p_deactivate_missing := false
    )
    into v_pt_pt_import_result;

    if (v_pt_br_import_result->>'inserted_count')::integer <> 2 then
        raise exception 'Expected pt-BR fixture import to insert 2 rows, got %',
            v_pt_br_import_result;
    end if;

    if (v_pt_pt_import_result->>'inserted_count')::integer <> 1 then
        raise exception 'Expected pt-PT fixture import to insert 1 row, got %',
            v_pt_pt_import_result;
    end if;

    if public.validate_word('NEXO', 'pt-BR') is not true then
        raise exception 'Expected imported pt-BR NEXO to validate';
    end if;

    if public.validate_word('FALSO', 'pt-BR') is not false then
        raise exception 'Expected inactive imported pt-BR FALSO not to validate';
    end if;

    if public.validate_word('nexo', 'pt-PT') is not false then
        raise exception 'Expected imported pt-BR NEXO not to leak into pt-PT';
    end if;

    if public.validate_word('ABACO', 'pt-PT') is not true then
        raise exception 'Expected imported pt-PT ABACO to validate from ÁBACO';
    end if;

    if public.validate_word('ábaco', 'pt-PT') is not true then
        raise exception 'Expected lowercase accented pt-PT ábaco to validate';
    end if;

    select count(*)
    into v_pt_br_source_row_count
    from public.patxanga_dictionary
    where language = 'pt-BR'
      and source = 'imported_words_engine_test'
      and word_normalized in ('NEXO', 'FALSO');

    if v_pt_br_source_row_count <> 2 then
        raise exception 'Expected 2 pt-BR imported source rows, got %',
            v_pt_br_source_row_count;
    end if;

    select count(*)
    into v_pt_pt_source_row_count
    from public.patxanga_dictionary
    where language = 'pt-PT'
      and source = 'imported_words_engine_test'
      and word_normalized = 'ABACO';

    if v_pt_pt_source_row_count <> 1 then
        raise exception 'Expected 1 pt-PT imported source row, got %',
            v_pt_pt_source_row_count;
    end if;

    v_pt_br_match_id := public.create_patxanga_match(
        p_host_user_id := v_pt_br_user1,
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_pt_br_match_id,
        p_user_id := v_pt_br_user2
    );

    perform public.start_patxanga_match(v_pt_br_match_id);

    select current_turn_player_id
    into v_pt_br_player_id
    from public.patxanga_matches
    where id = v_pt_br_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_n_id::text, 'letter', 'N', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_e_id::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_x_id::text, 'letter', 'X', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_o_id::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_pt_br_player_id;

    v_pt_br_preview_result := public.preview_patxanga_move(
        v_pt_br_match_id,
        v_pt_br_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_n_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_e_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_x_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_o_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_pt_br_preview_result->>'status' <> 'ok' then
        raise exception 'Expected pt-BR imported NEXO preview ok, got %',
            v_pt_br_preview_result;
    end if;

    if v_pt_br_preview_result->>'main_word' <> 'NEXO' then
        raise exception 'Expected pt-BR preview main_word NEXO, got %',
            v_pt_br_preview_result;
    end if;

    if coalesce((v_pt_br_preview_result->>'requires_vote')::boolean, true) is not false then
        raise exception 'Expected imported pt-BR NEXO not to require vote, got %',
            v_pt_br_preview_result;
    end if;

    v_pt_br_submit_result := public.submit_patxanga_move(
        v_pt_br_match_id,
        v_pt_br_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_n_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_e_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_x_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_o_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_pt_br_submit_result->>'status' <> 'success' then
        raise exception 'Expected imported pt-BR NEXO submit success, got %',
            v_pt_br_submit_result;
    end if;

    select count(*)
    into v_pt_br_accepted_move_count
    from public.patxanga_moves
    where id = (v_pt_br_submit_result->>'move_id')::uuid
      and match_id = v_pt_br_match_id
      and player_id = v_pt_br_player_id
      and main_word = 'NEXO'
      and status = 'accepted'
      and is_dictionary_recognized = true
      and requires_vote = false;

    if v_pt_br_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted imported pt-BR NEXO move, got %',
            v_pt_br_accepted_move_count;
    end if;

    v_pt_pt_match_id := public.create_patxanga_match(
        p_host_user_id := v_pt_pt_user1,
        p_language := 'pt-PT',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_pt_pt_match_id,
        p_user_id := v_pt_pt_user2
    );

    perform public.start_patxanga_match(v_pt_pt_match_id);

    select current_turn_player_id
    into v_pt_pt_player_id
    from public.patxanga_matches
    where id = v_pt_pt_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_a1_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_b_id::text, 'letter', 'B', 'points', 3, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_a2_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_c_id::text, 'letter', 'C', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_o2_id::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_pt_pt_player_id;

    v_pt_pt_preview_result := public.preview_patxanga_move(
        v_pt_pt_match_id,
        v_pt_pt_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_a1_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_b_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a2_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_c_id::text, 'row', 8, 'col', 11, 'declared_letter', null),
            jsonb_build_object('tile_id', v_o2_id::text, 'row', 8, 'col', 12, 'declared_letter', null)
        )
    );

    if v_pt_pt_preview_result->>'status' <> 'ok' then
        raise exception 'Expected pt-PT imported ABACO preview ok, got %',
            v_pt_pt_preview_result;
    end if;

    if v_pt_pt_preview_result->>'main_word' <> 'ABACO' then
        raise exception 'Expected pt-PT preview main_word ABACO, got %',
            v_pt_pt_preview_result;
    end if;

    if coalesce((v_pt_pt_preview_result->>'requires_vote')::boolean, true) is not false then
        raise exception 'Expected imported pt-PT ABACO not to require vote, got %',
            v_pt_pt_preview_result;
    end if;

    v_pt_pt_submit_result := public.submit_patxanga_move(
        v_pt_pt_match_id,
        v_pt_pt_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_a1_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_b_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a2_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_c_id::text, 'row', 8, 'col', 11, 'declared_letter', null),
            jsonb_build_object('tile_id', v_o2_id::text, 'row', 8, 'col', 12, 'declared_letter', null)
        )
    );

    if v_pt_pt_submit_result->>'status' <> 'success' then
        raise exception 'Expected imported pt-PT ABACO submit success, got %',
            v_pt_pt_submit_result;
    end if;

    select count(*)
    into v_pt_pt_accepted_move_count
    from public.patxanga_moves
    where id = (v_pt_pt_submit_result->>'move_id')::uuid
      and match_id = v_pt_pt_match_id
      and player_id = v_pt_pt_player_id
      and main_word = 'ABACO'
      and status = 'accepted'
      and is_dictionary_recognized = true
      and requires_vote = false;

    if v_pt_pt_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted imported pt-PT ABACO move, got %',
            v_pt_pt_accepted_move_count;
    end if;

    raise notice 'Dictionary imported words engine path test passed';
    raise notice 'pt_br_import_result=%', v_pt_br_import_result;
    raise notice 'pt_pt_import_result=%', v_pt_pt_import_result;
    raise notice 'pt_br_preview_result=%', v_pt_br_preview_result;
    raise notice 'pt_pt_preview_result=%', v_pt_pt_preview_result;
    raise notice 'pt_br_submit_result=%', v_pt_br_submit_result;
    raise notice 'pt_pt_submit_result=%', v_pt_pt_submit_result;

    delete from public.patxanga_dictionary
    where source = 'imported_words_engine_test';

    delete from public.patxanga_dictionary_import_batches
    where source = 'imported_words_engine_test';
end $$;
