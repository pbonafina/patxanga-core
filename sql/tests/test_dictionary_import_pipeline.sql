-- ============================================================
-- PATXANGA - TEST: dictionary import pipeline
-- Purpose: validate audited, idempotent dictionary imports
-- ============================================================

do $$
declare
    v_result jsonb;
    v_second_result jsonb;
    v_error_caught boolean := false;
    v_batch_count integer;
    v_dictionary_count integer;
    v_active_count integer;
    v_inactive_count integer;
    v_metadata jsonb;
begin
    if has_function_privilege(
        'anon',
        'public.import_patxanga_dictionary_entries(text,text,text,jsonb,text,text,text,text,jsonb,boolean)',
        'execute'
    ) then
        raise exception 'Expected anon not to execute dictionary import RPC';
    end if;

    if has_function_privilege(
        'authenticated',
        'public.import_patxanga_dictionary_entries(text,text,text,jsonb,text,text,text,text,jsonb,boolean)',
        'execute'
    ) then
        raise exception 'Expected authenticated not to execute dictionary import RPC';
    end if;

    if has_function_privilege(
        'service_role',
        'public.import_patxanga_dictionary_entries(text,text,text,jsonb,text,text,text,text,jsonb,boolean)',
        'execute'
    ) is not true then
        raise exception 'Expected service_role to execute dictionary import RPC';
    end if;

    delete from public.patxanga_dictionary
    where source = 'import_pipeline_test';

    delete from public.patxanga_dictionary
    where language = 'pt-BR'
      and word_normalized in ('RATO', 'ARVORE', 'PEIXE');

    delete from public.patxanga_dictionary_import_batches
    where source = 'import_pipeline_test';

    select public.import_patxanga_dictionary_entries(
        p_language := 'pt-BR',
        p_source := 'import_pipeline_test',
        p_license_name := 'Test License',
        p_entries := jsonb_build_array(
            jsonb_build_object('word', 'RATO'),
            jsonb_build_object('word', 'árvore'),
            jsonb_build_object('word', 'rato'),
            jsonb_build_object('word', ''),
            jsonb_build_object('word', 'PEIXE', 'is_active', false)
        ),
        p_source_version := 'fixture-v1',
        p_license_url := 'https://example.test/license',
        p_source_url := 'https://example.test/source',
        p_imported_by := 'sql-test',
        p_metadata := jsonb_build_object('fixture', true),
        p_deactivate_missing := false
    )
    into v_result;

    if v_result->>'status' <> 'success' then
        raise exception 'Expected import success, got %', v_result;
    end if;

    if (v_result->>'total_rows')::integer <> 5 then
        raise exception 'Expected 5 total rows, got %', v_result;
    end if;

    if (v_result->>'valid_rows')::integer <> 3 then
        raise exception 'Expected 3 distinct valid rows, got %', v_result;
    end if;

    if (v_result->>'inserted_count')::integer <> 3 then
        raise exception 'Expected 3 inserted rows, got %', v_result;
    end if;

    if (v_result->>'skipped_count')::integer <> 2 then
        raise exception 'Expected 2 skipped rows, got %', v_result;
    end if;

    if public.validate_word('arvore', 'pt-BR') is not true then
        raise exception 'Expected imported ARVORE to validate';
    end if;

    if public.validate_word('PEIXE', 'pt-BR') is not false then
        raise exception 'Expected imported inactive PEIXE not to validate';
    end if;

    select count(*)
    into v_dictionary_count
    from public.patxanga_dictionary
    where language = 'pt-BR'
      and source = 'import_pipeline_test'
      and source_version = 'fixture-v1'
      and license_name = 'Test License'
      and import_batch_id = (v_result->>'batch_id')::uuid
      and word_normalized in ('RATO', 'ARVORE', 'PEIXE');

    if v_dictionary_count <> 3 then
        raise exception 'Expected 3 dictionary rows linked to first import batch, got %', v_dictionary_count;
    end if;

    select count(*), metadata
    into v_batch_count, v_metadata
    from public.patxanga_dictionary_import_batches
    where id = (v_result->>'batch_id')::uuid
    group by metadata;

    if v_batch_count <> 1 then
        raise exception 'Expected first import batch row, got %', v_batch_count;
    end if;

    if v_metadata->>'fixture' <> 'true' then
        raise exception 'Expected metadata fixture=true, got %', v_metadata;
    end if;

    select public.import_patxanga_dictionary_entries(
        p_language := 'pt-BR',
        p_source := 'import_pipeline_test',
        p_license_name := 'Test License',
        p_entries := jsonb_build_array(
            jsonb_build_object('word', 'RATO')
        ),
        p_source_version := 'fixture-v2',
        p_license_url := 'https://example.test/license',
        p_source_url := 'https://example.test/source',
        p_imported_by := 'sql-test',
        p_metadata := jsonb_build_object('fixture', true, 'replacement', true),
        p_deactivate_missing := true
    )
    into v_second_result;

    if (v_second_result->>'inserted_count')::integer <> 0 then
        raise exception 'Expected second import to insert 0 rows, got %', v_second_result;
    end if;

    if (v_second_result->>'updated_count')::integer <> 1 then
        raise exception 'Expected second import to update RATO, got %', v_second_result;
    end if;

    if (v_second_result->>'deactivated_count')::integer <> 1 then
        raise exception 'Expected second import to deactivate ARVORE only, got %', v_second_result;
    end if;

    select count(*)
    into v_active_count
    from public.patxanga_dictionary
    where language = 'pt-BR'
      and source = 'import_pipeline_test'
      and is_active = true;

    if v_active_count <> 1 then
        raise exception 'Expected one active row after replacement import, got %', v_active_count;
    end if;

    select count(*)
    into v_inactive_count
    from public.patxanga_dictionary
    where language = 'pt-BR'
      and source = 'import_pipeline_test'
      and is_active = false
      and word_normalized in ('ARVORE', 'PEIXE');

    if v_inactive_count <> 2 then
        raise exception 'Expected ARVORE and PEIXE inactive after replacement, got %', v_inactive_count;
    end if;

    begin
        perform public.import_patxanga_dictionary_entries(
            p_language := 'es-ES',
            p_source := 'import_pipeline_test',
            p_license_name := 'Test License',
            p_entries := '[]'::jsonb
        );
    exception
        when others then
            v_error_caught := true;
    end;

    if v_error_caught is not true then
        raise exception 'Expected unsupported language import to fail';
    end if;

    raise notice 'Dictionary import pipeline test passed';
    raise notice 'first_result=%', v_result;
    raise notice 'second_result=%', v_second_result;

    delete from public.patxanga_dictionary
    where source = 'import_pipeline_test';

    delete from public.patxanga_dictionary
    where language = 'pt-BR'
      and word_normalized in ('RATO', 'ARVORE', 'PEIXE');

    delete from public.patxanga_dictionary_import_batches
    where source = 'import_pipeline_test';
end $$;
