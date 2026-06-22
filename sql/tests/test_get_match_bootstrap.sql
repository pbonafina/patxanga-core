do
$$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_player2_id uuid;
    v_pt_pt_user1 uuid := gen_random_uuid();
    v_pt_pt_user2 uuid := gen_random_uuid();
    v_pt_pt_match_id uuid;
    v_result jsonb;
    v_pt_pt_result jsonb;
    v_pt_pt_import_result jsonb;
begin
    delete from public.patxanga_dictionary
    where source = 'bootstrap_pt_pt_dictionary_summary_test';

    delete from public.patxanga_dictionary_import_batches
    where source = 'bootstrap_pt_pt_dictionary_summary_test';

    v_match_id := public.create_patxanga_match(
        p_language := 'pt-BR',
        p_host_user_id := v_user1,
        p_host_guest_name := 'Host Bootstrap Test',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2,
        p_guest_name := 'Guest Bootstrap Test'
    );

    perform public.start_patxanga_match(v_match_id);

    select id
    into v_player2_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_user2
    limit 1;

    v_result := public.get_patxanga_match_bootstrap(v_match_id, v_user2);

    raise notice 'Bootstrap result: %', v_result;
    raise notice 'match_id: %', v_result->>'match_id';
    raise notice 'status: %', v_result->>'status';
    raise notice 'language: %', v_result->>'language';
    raise notice 'player_context.player_id: %', v_result->'player_context'->>'player_id';
    raise notice 'players_summary length: %', jsonb_array_length(v_result->'players_summary');
    raise notice 'dictionary_summary: %', v_result->'dictionary_summary';

    if v_result->>'match_id' <> v_match_id::text then
        raise exception 'Unexpected match_id in bootstrap payload';
    end if;

    if v_result->>'status' <> 'active' then
        raise exception 'Expected active match status in bootstrap payload';
    end if;

    if v_result->>'language' <> 'pt-BR' then
        raise exception 'Expected pt-BR language in bootstrap payload';
    end if;

    if v_result->'player_context'->>'player_id' <> v_player2_id::text then
        raise exception 'Expected player_context.player_id to match joined player';
    end if;

    if jsonb_typeof(v_result->'board_state') <> 'array' then
        raise exception 'Expected board_state to be a JSON array';
    end if;

    if jsonb_array_length(v_result->'players_summary') <> 2 then
        raise exception 'Expected players_summary with 2 players';
    end if;

    if not (v_result ? 'end_summary') then
        raise exception 'Expected end_summary key in bootstrap payload';
    end if;

    if v_result->'end_summary' <> 'null'::jsonb then
        raise exception 'Expected null end_summary for active match';
    end if;

    if v_result->'dictionary_summary'->>'language' <> 'pt-BR' then
        raise exception 'Expected dictionary_summary language pt-BR';
    end if;

    if coalesce((v_result->'dictionary_summary'->>'active_words_count')::integer, -1) < 0 then
        raise exception 'Expected non-negative active_words_count';
    end if;

    if jsonb_typeof(v_result->'dictionary_summary'->'sample_sources') <> 'array' then
        raise exception 'Expected dictionary_summary.sample_sources to be an array';
    end if;

    select public.import_patxanga_dictionary_entries(
        p_language := 'pt-PT',
        p_source := 'bootstrap_pt_pt_dictionary_summary_test',
        p_license_name := 'Test Fixture License',
        p_entries := jsonb_build_array(
            jsonb_build_object('word', 'ÁBACO'),
            jsonb_build_object('word', 'CASA')
        ),
        p_source_version := 'fixture-v1',
        p_license_url := 'https://example.test/license',
        p_source_url := 'https://example.test/pt-pt-source',
        p_imported_by := 'sql-test',
        p_metadata := jsonb_build_object('fixture', true),
        p_deactivate_missing := false
    )
    into v_pt_pt_import_result;

    if v_pt_pt_import_result->>'status' <> 'success' then
        raise exception 'Expected pt-PT bootstrap fixture import success, got %',
            v_pt_pt_import_result;
    end if;

    if (v_pt_pt_import_result->>'valid_rows')::integer <> 2 then
        raise exception 'Expected pt-PT bootstrap fixture import to accept 2 valid rows, got %',
            v_pt_pt_import_result;
    end if;

    v_pt_pt_match_id := public.create_patxanga_match(
        p_language := 'pt-PT',
        p_host_user_id := v_pt_pt_user1,
        p_host_guest_name := 'Host Bootstrap pt-PT Test',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_pt_pt_match_id,
        p_user_id := v_pt_pt_user2,
        p_guest_name := 'Guest Bootstrap pt-PT Test'
    );

    perform public.start_patxanga_match(v_pt_pt_match_id);

    v_pt_pt_result := public.get_patxanga_match_bootstrap(v_pt_pt_match_id, v_pt_pt_user1);

    if v_pt_pt_result->>'language' <> 'pt-PT' then
        raise exception 'Expected pt-PT language in bootstrap payload';
    end if;

    if v_pt_pt_result->'dictionary_summary'->>'language' <> 'pt-PT' then
        raise exception 'Expected dictionary_summary language pt-PT';
    end if;

    if coalesce((v_pt_pt_result->'dictionary_summary'->>'active_words_count')::integer, -1) < 2 then
        raise exception 'Expected pt-PT dictionary_summary to include imported active words, got %',
            v_pt_pt_result->'dictionary_summary';
    end if;

    if coalesce((v_pt_pt_result->'dictionary_summary'->>'active_sources_count')::integer, -1) < 1 then
        raise exception 'Expected pt-PT dictionary_summary to include imported source, got %',
            v_pt_pt_result->'dictionary_summary';
    end if;

    if not (v_pt_pt_result->'dictionary_summary'->'sample_sources' ? 'bootstrap_pt_pt_dictionary_summary_test') then
        raise exception 'Expected pt-PT dictionary_summary sample_sources to include fixture source, got %',
            v_pt_pt_result->'dictionary_summary';
    end if;

    delete from public.patxanga_dictionary
    where source = 'bootstrap_pt_pt_dictionary_summary_test';

    delete from public.patxanga_dictionary_import_batches
    where source = 'bootstrap_pt_pt_dictionary_summary_test';
end;
$$;
