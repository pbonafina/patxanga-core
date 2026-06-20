-- ============================================================
-- PATXANGA - RPC: import_patxanga_dictionary_entries()
-- Version: 1.0
-- Purpose: administrative, audited dictionary import from normalized payloads
-- ============================================================

drop function if exists public.import_patxanga_dictionary_entries(
    text,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    jsonb,
    boolean
);

create or replace function public.import_patxanga_dictionary_entries(
    p_language text,
    p_source text,
    p_license_name text,
    p_entries jsonb,
    p_source_version text default null,
    p_license_url text default null,
    p_source_url text default null,
    p_imported_by text default null,
    p_metadata jsonb default '{}'::jsonb,
    p_deactivate_missing boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as
$$
declare
    v_language text := trim(coalesce(p_language, ''));
    v_source text := nullif(trim(coalesce(p_source, '')), '');
    v_license_name text := nullif(trim(coalesce(p_license_name, '')), '');
    v_source_version text := nullif(trim(coalesce(p_source_version, '')), '');
    v_license_url text := nullif(trim(coalesce(p_license_url, '')), '');
    v_source_url text := nullif(trim(coalesce(p_source_url, '')), '');
    v_imported_by text := nullif(trim(coalesce(p_imported_by, '')), '');
    v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
    v_total_rows integer := 0;
    v_valid_rows integer := 0;
    v_inserted_count integer := 0;
    v_updated_count integer := 0;
    v_skipped_count integer := 0;
    v_deactivated_count integer := 0;
    v_batch_id uuid;
begin
    if v_language not in ('pt-BR', 'pt-PT') then
        raise exception 'Unsupported dictionary language: %', p_language;
    end if;

    if v_source is null then
        raise exception 'Dictionary import source is required';
    end if;

    if v_license_name is null then
        raise exception 'Dictionary import license_name is required';
    end if;

    if p_entries is null or jsonb_typeof(p_entries) <> 'array' then
        raise exception 'Dictionary import entries must be a JSON array';
    end if;

    if jsonb_typeof(v_metadata) <> 'object' then
        raise exception 'Dictionary import metadata must be a JSON object';
    end if;

    v_total_rows := jsonb_array_length(p_entries);

    if to_regclass('pg_temp.patxanga_dictionary_import_stage') is null then
        create temporary table patxanga_dictionary_import_stage (
            word_original text not null,
            word_normalized text not null,
            is_active boolean not null
        ) on commit drop;
    else
        truncate table patxanga_dictionary_import_stage;
    end if;

    insert into patxanga_dictionary_import_stage (
        word_original,
        word_normalized,
        is_active
    )
    with raw_entries as (
        select
            entry.value,
            entry.ordinality
        from jsonb_array_elements(p_entries) with ordinality as entry(value, ordinality)
    ),
    prepared_entries as (
        select
            nullif(trim(coalesce(value->>'word_original', value->>'word', '')), '') as word_original,
            public.normalize_patxanga_word(
                nullif(trim(coalesce(value->>'word_original', value->>'word', '')), '')
            ) as word_normalized,
            coalesce(nullif(trim(value->>'is_active'), ''), 'true')::boolean as is_active,
            ordinality
        from raw_entries
    )
    select distinct on (word_normalized)
        word_original,
        word_normalized,
        is_active
    from prepared_entries
    where word_original is not null
      and word_normalized is not null
      and word_normalized <> ''
    order by word_normalized, ordinality;

    select count(*)
    into v_valid_rows
    from patxanga_dictionary_import_stage;

    select count(*)
    into v_inserted_count
    from patxanga_dictionary_import_stage stage
    where not exists (
        select 1
        from public.patxanga_dictionary dictionary
        where dictionary.language = v_language
          and dictionary.word_normalized = stage.word_normalized
    );

    v_updated_count := v_valid_rows - v_inserted_count;
    v_skipped_count := v_total_rows - v_valid_rows;

    insert into public.patxanga_dictionary_import_batches (
        language,
        source,
        source_version,
        license_name,
        license_url,
        source_url,
        imported_by,
        total_rows,
        valid_rows,
        inserted_count,
        updated_count,
        skipped_count,
        metadata
    )
    values (
        v_language,
        v_source,
        v_source_version,
        v_license_name,
        v_license_url,
        v_source_url,
        v_imported_by,
        v_total_rows,
        v_valid_rows,
        v_inserted_count,
        v_updated_count,
        v_skipped_count,
        v_metadata
    )
    returning id into v_batch_id;

    insert into public.patxanga_dictionary (
        language,
        word_original,
        word_normalized,
        source,
        is_active,
        source_version,
        license_name,
        license_url,
        source_url,
        import_batch_id,
        imported_at,
        updated_at
    )
    select
        v_language,
        stage.word_original,
        stage.word_normalized,
        v_source,
        stage.is_active,
        v_source_version,
        v_license_name,
        v_license_url,
        v_source_url,
        v_batch_id,
        now(),
        now()
    from patxanga_dictionary_import_stage stage
    on conflict (language, word_normalized) do update
    set word_original = excluded.word_original,
        source = excluded.source,
        is_active = excluded.is_active,
        source_version = excluded.source_version,
        license_name = excluded.license_name,
        license_url = excluded.license_url,
        source_url = excluded.source_url,
        import_batch_id = excluded.import_batch_id,
        imported_at = excluded.imported_at,
        updated_at = excluded.updated_at;

    if p_deactivate_missing then
        update public.patxanga_dictionary dictionary
        set is_active = false,
            import_batch_id = v_batch_id,
            imported_at = now(),
            updated_at = now()
        where dictionary.language = v_language
          and dictionary.source = v_source
          and dictionary.is_active = true
          and not exists (
              select 1
              from patxanga_dictionary_import_stage stage
              where stage.word_normalized = dictionary.word_normalized
          );

        get diagnostics v_deactivated_count = row_count;

        update public.patxanga_dictionary_import_batches
        set deactivated_count = v_deactivated_count
        where id = v_batch_id;
    end if;

    return jsonb_build_object(
        'status', 'success',
        'batch_id', v_batch_id,
        'language', v_language,
        'source', v_source,
        'source_version', v_source_version,
        'license_name', v_license_name,
        'total_rows', v_total_rows,
        'valid_rows', v_valid_rows,
        'inserted_count', v_inserted_count,
        'updated_count', v_updated_count,
        'skipped_count', v_skipped_count,
        'deactivated_count', v_deactivated_count,
        'deactivate_missing', p_deactivate_missing
    );
end;
$$;

revoke all on function public.import_patxanga_dictionary_entries(
    text,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    jsonb,
    boolean
) from public, anon, authenticated;

grant execute on function public.import_patxanga_dictionary_entries(
    text,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    jsonb,
    boolean
) to service_role;
