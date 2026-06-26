-- ============================================================
-- PATXANGA - TEST: dictionary contract and real-word validation
-- Purpose: validate language, normalization, inactive entries and engine path
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_pt_pt_user1 uuid := gen_random_uuid();
    v_pt_pt_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_pt_pt_match_id uuid;
    v_current_player_id uuid;
    v_pt_pt_player_id uuid;
    v_tile_c_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_tile_s_id uuid := gen_random_uuid();
    v_tile_a2_id uuid := gen_random_uuid();
    v_pt_pt_tile_c_id uuid := gen_random_uuid();
    v_pt_pt_tile_a_id uuid := gen_random_uuid();
    v_pt_pt_tile_s_id uuid := gen_random_uuid();
    v_pt_pt_tile_a2_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_pt_pt_forced_rack jsonb;
    v_pt_pt_preview_result jsonb;
    v_pt_pt_submit_result jsonb;
    v_submit_result jsonb;
    v_dictionary_row_count integer;
    v_dictionary_import_column_count integer;
    v_real_seed_count integer;
    v_pt_pt_seed_count integer;
    v_accepted_move_count integer;
    v_pt_pt_accepted_move_count integer;
begin
    insert into public.patxanga_dictionary (
        language,
        word_original,
        word_normalized,
        source,
        is_active
    )
    values
        ('pt-BR', 'AMOR', public.normalize_patxanga_word('AMOR'), 'dictionary_contract_test_seed', true),
        ('pt-BR', 'ACAO', public.normalize_patxanga_word('ACAO'), 'dictionary_contract_test_seed', true),
        ('pt-BR', 'CASA', public.normalize_patxanga_word('CASA'), 'dictionary_contract_test_seed', true),
        ('pt-BR', 'DOSAS', public.normalize_patxanga_word('DOSAS'), 'dictionary_contract_test_seed', true),
        ('pt-BR', 'MESA', public.normalize_patxanga_word('MESA'), 'dictionary_contract_test_seed', true),
        ('pt-BR', 'MIEM', public.normalize_patxanga_word('MIEM'), 'dictionary_contract_test_seed', true),
        ('pt-BR', 'PAO', public.normalize_patxanga_word('PAO'), 'dictionary_contract_test_seed', true),
        ('pt-PT', 'AMOR', public.normalize_patxanga_word('AMOR'), 'dictionary_contract_test_seed', true),
        ('pt-PT', 'ACAO', public.normalize_patxanga_word('ACAO'), 'dictionary_contract_test_seed', true),
        ('pt-PT', 'CASA', public.normalize_patxanga_word('CASA'), 'dictionary_contract_test_seed', true),
        ('pt-PT', 'DOSAS', public.normalize_patxanga_word('DOSAS'), 'dictionary_contract_test_seed', true),
        ('pt-PT', 'MESA', public.normalize_patxanga_word('MESA'), 'dictionary_contract_test_seed', true),
        ('pt-PT', 'MIEM', public.normalize_patxanga_word('MIEM'), 'dictionary_contract_test_seed', true),
        ('pt-PT', 'PAO', public.normalize_patxanga_word('PAO'), 'dictionary_contract_test_seed', true)
    on conflict (language, word_normalized) do update
    set word_original = excluded.word_original,
        source = excluded.source,
        is_active = excluded.is_active,
        updated_at = now();

    select count(*)
    into v_dictionary_row_count
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'patxanga_dictionary'
      and column_name in ('language', 'source', 'is_active', 'created_at', 'updated_at');

    if v_dictionary_row_count <> 5 then
        raise exception 'Expected dictionary contract columns to exist, got %', v_dictionary_row_count;
    end if;

    select count(*)
    into v_dictionary_import_column_count
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'patxanga_dictionary'
      and column_name in (
          'source_version',
          'license_name',
          'license_url',
          'source_url',
          'import_batch_id',
          'imported_at'
      );

    if v_dictionary_import_column_count <> 6 then
        raise exception 'Expected dictionary import metadata columns to exist, got %',
            v_dictionary_import_column_count;
    end if;

    select count(*)
    into v_real_seed_count
    from patxanga_dictionary
    where language = 'pt-BR'
      and is_active = true
      and word_normalized in ('AMOR', 'ACAO', 'CASA', 'DOSAS', 'MESA', 'MIEM', 'PAO');

    if v_real_seed_count <> 7 then
        raise exception 'Expected 7 active real seed words, got %', v_real_seed_count;
    end if;

    select count(*)
    into v_pt_pt_seed_count
    from patxanga_dictionary
    where language = 'pt-PT'
      and is_active = true
      and word_normalized in ('AMOR', 'ACAO', 'CASA', 'DOSAS', 'MESA', 'MIEM', 'PAO');

    if v_pt_pt_seed_count <> 7 then
        raise exception 'Expected 7 active pt-PT seed words, got %', v_pt_pt_seed_count;
    end if;

    if public.validate_word('ação', 'pt-BR') is not true then
        raise exception 'Expected lowercase accented ação to validate in pt-BR';
    end if;

    if public.validate_word('ACAO', 'pt-BR') is not true then
        raise exception 'Expected unaccented ACAO to validate in pt-BR';
    end if;

    if public.validate_word('dosas', 'pt-BR') is not true then
        raise exception 'Expected lowercase DOSAS to validate in pt-BR';
    end if;

    if public.validate_word('miem', 'pt-BR') is not true then
        raise exception 'Expected lowercase MIEM to validate in pt-BR';
    end if;

    if public.validate_word('ação', 'es-ES') is not false then
        raise exception 'Expected ação not to validate in es-ES';
    end if;

    if public.validate_word('AÇÃO', '') is not false then
        raise exception 'Expected empty language not to validate';
    end if;

    if public.validate_word('CASA', 'pt-PT') is not true then
        raise exception 'Expected CASA to validate in pt-PT through pt-PT seed';
    end if;

    if public.validate_word('DOSAS', 'pt-PT') is not true then
        raise exception 'Expected DOSAS to validate in pt-PT through pt-PT seed';
    end if;

    if public.validate_word('MIEM', 'pt-PT') is not true then
        raise exception 'Expected MIEM to validate in pt-PT through pt-PT seed';
    end if;

    update patxanga_dictionary
    set is_active = false,
        updated_at = now()
    where language = 'pt-BR'
      and word_normalized = public.normalize_patxanga_word('AÇÃO');

    if public.validate_word('AÇÃO', 'pt-BR') is not false then
        raise exception 'Expected inactive AÇÃO not to validate';
    end if;

    update patxanga_dictionary
    set is_active = true,
        updated_at = now()
    where language = 'pt-BR'
      and word_normalized = public.normalize_patxanga_word('AÇÃO');

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

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_c_id::text, 'letter', 'C', 'points', 3, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_a2_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
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
            jsonb_build_object('tile_id', v_tile_c_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_s_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_a2_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_submit_result->>'status' <> 'success' then
        raise exception 'Expected CASA move success through real dictionary seed, got %', v_submit_result;
    end if;

    if v_submit_result->>'move_id' is null then
        raise exception 'Expected CASA move_id, got %', v_submit_result;
    end if;

    select count(*)
    into v_accepted_move_count
    from patxanga_moves
    where id = (v_submit_result->>'move_id')::uuid
      and match_id = v_match_id
      and player_id = v_current_player_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'CASA'
      and is_dictionary_recognized = true;

    if v_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted CASA move, got %', v_accepted_move_count;
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
    from patxanga_matches
    where id = v_pt_pt_match_id;

    v_pt_pt_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_pt_pt_tile_c_id::text, 'letter', 'C', 'points', 3, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_pt_pt_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_pt_pt_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_pt_pt_tile_a2_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_pt_pt_forced_rack,
        updated_at = now()
    where id = v_pt_pt_player_id;

    v_pt_pt_preview_result := public.preview_patxanga_move(
        v_pt_pt_match_id,
        v_pt_pt_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_pt_pt_tile_c_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_s_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_a2_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_pt_pt_preview_result->>'status' <> 'ok' then
        raise exception 'Expected pt-PT CASA preview ok structurally, got %', v_pt_pt_preview_result;
    end if;

    if v_pt_pt_preview_result->>'main_word' <> 'CASA' then
        raise exception 'Expected pt-PT preview main_word CASA, got %', v_pt_pt_preview_result;
    end if;

    if coalesce((v_pt_pt_preview_result->>'requires_vote')::boolean, true) is not false then
        raise exception 'Expected pt-PT CASA preview not to require vote, got %', v_pt_pt_preview_result;
    end if;

    if coalesce((v_pt_pt_preview_result->>'is_dictionary_recognized')::boolean, false) is not true then
        raise exception 'Expected pt-PT CASA preview to be dictionary-recognized, got %', v_pt_pt_preview_result;
    end if;

    v_pt_pt_submit_result := public.submit_patxanga_move(
        v_pt_pt_match_id,
        v_pt_pt_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_pt_pt_tile_c_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_s_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_a2_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_pt_pt_submit_result->>'status' <> 'success' then
        raise exception 'Expected pt-PT CASA submit success, got %', v_pt_pt_submit_result;
    end if;

    if v_pt_pt_submit_result->>'move_id' is null then
        raise exception 'Expected pt-PT CASA move_id, got %', v_pt_pt_submit_result;
    end if;

    select count(*)
    into v_pt_pt_accepted_move_count
    from patxanga_moves
    where id = (v_pt_pt_submit_result->>'move_id')::uuid
      and match_id = v_pt_pt_match_id
      and player_id = v_pt_pt_player_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'CASA'
      and is_dictionary_recognized = true
      and requires_vote = false;

    if v_pt_pt_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 pt-PT accepted CASA move, got %', v_pt_pt_accepted_move_count;
    end if;

    raise notice 'Dictionary contract test passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'pt_pt_match_id=%', v_pt_pt_match_id;
    raise notice 'submit_result=%', v_submit_result;
    raise notice 'pt_pt_preview_result=%', v_pt_pt_preview_result;
    raise notice 'pt_pt_submit_result=%', v_pt_pt_submit_result;
    raise notice 'real_seed_count=%', v_real_seed_count;
    raise notice 'pt_pt_seed_count=%', v_pt_pt_seed_count;
end $$;
