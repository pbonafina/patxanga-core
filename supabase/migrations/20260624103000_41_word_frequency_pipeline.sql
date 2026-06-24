-- ============================================================
-- PATXANGA - WORD FREQUENCY PIPELINE
-- Purpose: maintain corpus-derived frequency data and use it in bot lexical policy
-- ============================================================

create table if not exists public.patxanga_word_frequency_import_batches (
    id uuid primary key default gen_random_uuid(),
    language text not null check (language in ('pt-BR', 'pt-PT')),
    source text not null,
    source_domain text not null check (
        source_domain in ('web', 'wiki', 'news', 'subtitles', 'books', 'parliament', 'mixed', 'qa')
    ),
    source_version text null,
    license_name text not null,
    license_url text null,
    source_url text null,
    imported_by text null,
    metadata jsonb not null default '{}'::jsonb,
    total_rows integer not null default 0,
    valid_rows integer not null default 0,
    inserted_count integer not null default 0,
    updated_count integer not null default 0,
    created_at timestamp with time zone not null default now()
);

create table if not exists public.patxanga_word_frequency (
    language text not null check (language in ('pt-BR', 'pt-PT')),
    word_normalized text not null,
    source text not null,
    source_domain text not null check (
        source_domain in ('web', 'wiki', 'news', 'subtitles', 'books', 'parliament', 'mixed', 'qa')
    ),
    token_count bigint not null check (token_count >= 0),
    document_count bigint not null default 0 check (document_count >= 0),
    frequency_per_million numeric not null default 0,
    rank integer null,
    common_score numeric not null default 0,
    source_version text null,
    import_batch_id uuid null references public.patxanga_word_frequency_import_batches(id) on delete set null,
    imported_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    primary key (language, source, word_normalized)
);

create index if not exists idx_patxanga_word_frequency_lookup
on public.patxanga_word_frequency (language, word_normalized, common_score desc);

create index if not exists idx_patxanga_word_frequency_rank
on public.patxanga_word_frequency (language, source, rank);

create or replace function public.get_patxanga_word_common_score(
    p_word text,
    p_language text
)
returns numeric
language sql
stable
set search_path = public
as
$$
    select coalesce(max(frequency.common_score), 0)
    from public.patxanga_word_frequency frequency
    where frequency.language = p_language
      and frequency.word_normalized = public.normalize_patxanga_word(p_word);
$$;

create or replace function public.import_patxanga_word_frequency_entries(
    p_language text,
    p_source text,
    p_source_domain text,
    p_license_name text,
    p_entries jsonb,
    p_source_version text default null,
    p_license_url text default null,
    p_source_url text default null,
    p_imported_by text default null,
    p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as
$$
declare
    v_batch_id uuid;
    v_total_rows integer;
    v_valid_rows integer;
    v_inserted_count integer;
    v_updated_count integer;
    v_total_tokens numeric;
begin
    if p_language not in ('pt-BR', 'pt-PT') then
        raise exception 'Invalid language: %', p_language;
    end if;

    if p_source is null or trim(p_source) = '' then
        raise exception 'Source is required';
    end if;

    if p_source_domain not in ('web', 'wiki', 'news', 'subtitles', 'books', 'parliament', 'mixed', 'qa') then
        raise exception 'Invalid source_domain: %', p_source_domain;
    end if;

    if p_license_name is null or trim(p_license_name) = '' then
        raise exception 'License name is required';
    end if;

    if jsonb_typeof(p_entries) <> 'array' then
        raise exception 'Entries must be a JSON array';
    end if;

    create temporary table if not exists patxanga_word_frequency_stage (
        word_original text,
        word_normalized text,
        token_count bigint,
        document_count bigint
    ) on commit drop;

    truncate table patxanga_word_frequency_stage;

    insert into patxanga_word_frequency_stage (
        word_original,
        word_normalized,
        token_count,
        document_count
    )
    select
        entry.value->>'word',
        public.normalize_patxanga_word(entry.value->>'word'),
        greatest(coalesce((entry.value->>'token_count')::bigint, 0), 0),
        greatest(coalesce((entry.value->>'document_count')::bigint, 0), 0)
    from jsonb_array_elements(p_entries) as entry(value);

    select count(*)
    into v_total_rows
    from patxanga_word_frequency_stage;

    delete from patxanga_word_frequency_stage
    where word_normalized is null
       or word_normalized = ''
       or word_normalized !~ '^[A-Z]+$'
       or token_count <= 0;

    select count(*)
    into v_valid_rows
    from patxanga_word_frequency_stage;

    select coalesce(sum(token_count), 0)
    into v_total_tokens
    from patxanga_word_frequency_stage;

    insert into public.patxanga_word_frequency_import_batches (
        language,
        source,
        source_domain,
        source_version,
        license_name,
        license_url,
        source_url,
        imported_by,
        metadata,
        total_rows,
        valid_rows
    )
    values (
        p_language,
        p_source,
        p_source_domain,
        p_source_version,
        p_license_name,
        p_license_url,
        p_source_url,
        coalesce(p_imported_by, current_user),
        coalesce(p_metadata, '{}'::jsonb),
        v_total_rows,
        v_valid_rows
    )
    returning id into v_batch_id;

    with deduped as (
        select
            word_normalized,
            sum(token_count) as token_count,
            sum(document_count) as document_count
        from patxanga_word_frequency_stage
        group by word_normalized
    ),
    ranked as (
        select
            word_normalized,
            token_count,
            document_count,
            case
                when v_total_tokens > 0 then round((token_count::numeric / v_total_tokens) * 1000000, 8)
                else 0
            end as frequency_per_million,
            row_number() over (order by token_count desc, word_normalized)::integer as rank,
            round(
                least(
                    1.0::numeric,
                    (ln(token_count::numeric + 1) / ln(greatest(v_total_tokens, 2)::numeric + 1))::numeric
                ),
                8
            ) as common_score
        from deduped
    ),
    upserted as (
        insert into public.patxanga_word_frequency (
            language,
            word_normalized,
            source,
            source_domain,
            token_count,
            document_count,
            frequency_per_million,
            rank,
            common_score,
            source_version,
            import_batch_id,
            imported_at,
            updated_at
        )
        select
            p_language,
            ranked.word_normalized,
            p_source,
            p_source_domain,
            ranked.token_count,
            ranked.document_count,
            ranked.frequency_per_million,
            ranked.rank,
            ranked.common_score,
            p_source_version,
            v_batch_id,
            now(),
            now()
        from ranked
        on conflict (language, source, word_normalized) do update
        set source_domain = excluded.source_domain,
            token_count = excluded.token_count,
            document_count = excluded.document_count,
            frequency_per_million = excluded.frequency_per_million,
            rank = excluded.rank,
            common_score = excluded.common_score,
            source_version = excluded.source_version,
            import_batch_id = excluded.import_batch_id,
            updated_at = now()
        returning (xmax = 0) as inserted
    )
    select
        count(*) filter (where inserted),
        count(*) filter (where not inserted)
    into v_inserted_count, v_updated_count
    from upserted;

    update public.patxanga_word_frequency_import_batches
    set inserted_count = coalesce(v_inserted_count, 0),
        updated_count = coalesce(v_updated_count, 0)
    where id = v_batch_id;

    insert into public.patxanga_bot_word_policy_overrides (
        language,
        word_normalized,
        policy_status,
        reason
    )
    select
        frequency.language,
        frequency.word_normalized,
        'preferred',
        'frequency import: ' || frequency.source
    from public.patxanga_word_frequency frequency
    join public.patxanga_dictionary dictionary
      on dictionary.language = frequency.language
     and dictionary.word_normalized = frequency.word_normalized
     and dictionary.is_active = true
    where frequency.language = p_language
      and frequency.source = p_source
      and frequency.common_score >= 0.35
      and coalesce(frequency.rank, 999999) <= 50000
      and frequency.word_normalized !~ '[KWY]'
    on conflict (language, word_normalized, policy_status) do update
    set reason = excluded.reason;

    return jsonb_build_object(
        'status', 'success',
        'batch_id', v_batch_id,
        'language', p_language,
        'source', p_source,
        'source_domain', p_source_domain,
        'total_rows', v_total_rows,
        'valid_rows', v_valid_rows,
        'inserted_count', coalesce(v_inserted_count, 0),
        'updated_count', coalesce(v_updated_count, 0)
    );
end;
$$;

create or replace function public.is_patxanga_bot_policy_word(
    p_word text,
    p_language text,
    p_bot_level text default 'easy'
)
returns boolean
language sql
stable
set search_path = public
as
$$
    with normalized as (
        select
            public.normalize_patxanga_word(p_word) as word,
            lower(coalesce(nullif(trim(p_bot_level), ''), 'easy')) as bot_level
    ),
    language_frequency as (
        select exists (
            select 1
            from public.patxanga_word_frequency frequency
            where frequency.language = p_language
        ) as has_frequency
    ),
    policy as (
        select
            exists (
                select 1
                from public.patxanga_bot_word_policy_overrides override
                join normalized on true
                where override.language = p_language
                  and override.word_normalized = normalized.word
                  and override.policy_status = 'preferred'
            ) as is_preferred,
            exists (
                select 1
                from public.patxanga_bot_word_policy_overrides override
                join normalized on true
                where override.language = p_language
                  and override.word_normalized = normalized.word
                  and (
                      override.policy_status = 'blocked_medium'
                      or (
                          override.policy_status = 'blocked_easy'
                          and normalized.bot_level = 'easy'
                      )
                  )
            ) as is_blocked
    )
    select
        public.is_patxanga_playable_bot_word(normalized.word)
        and (
            normalized.bot_level = 'hard'
            or normalized.word !~ '[KWY]'
        )
        and not policy.is_blocked
        and (
            normalized.bot_level = 'hard'
            or not language_frequency.has_frequency
            or policy.is_preferred
            or public.get_patxanga_word_common_score(normalized.word, p_language) >= case
                when normalized.bot_level = 'medium' then 0.18
                else 0.35
            end
        )
    from normalized, language_frequency, policy;
$$;

insert into public.patxanga_word_frequency_import_batches (
    language,
    source,
    source_domain,
    source_version,
    license_name,
    imported_by,
    metadata,
    total_rows,
    valid_rows,
    inserted_count,
    updated_count
)
select
    'pt-PT',
    'pt_pt_frequency_bootstrap_qa',
    'qa',
    '2026-06-24',
    'Internal QA bootstrap; replace with corpus-derived import',
    'migration 41',
    jsonb_build_object(
        'purpose', 'seed common words until corpus frequency import is available',
        'not_corpus_derived', true
    ),
    21,
    21,
    21,
    0
where not exists (
    select 1
    from public.patxanga_word_frequency_import_batches existing
    where existing.language = 'pt-PT'
      and existing.source = 'pt_pt_frequency_bootstrap_qa'
      and existing.source_version = '2026-06-24'
);

with bootstrap(word_normalized, token_count, document_count) as (
    values
        ('CASA', 120000, 50000),
        ('QUE', 110000, 60000),
        ('VIDA', 98000, 42000),
        ('TEMPO', 94000, 39000),
        ('AMOR', 89000, 36000),
        ('BOM', 85000, 35000),
        ('MESA', 78000, 28000),
        ('PORTA', 76000, 26000),
        ('RUA', 72000, 26000),
        ('MAR', 70000, 24000),
        ('LUA', 65000, 22000),
        ('SOL', 64000, 22000),
        ('BOLA', 60000, 20000),
        ('GATO', 56000, 18000),
        ('JOGO', 52000, 18000),
        ('LIVRO', 50000, 17000),
        ('METRO', 48000, 16000),
        ('PATO', 42000, 14000),
        ('FIXE', 38000, 12000),
        ('BEIRA', 36000, 11000),
        ('TACTO', 34000, 10000)
),
ranked as (
    select
        word_normalized,
        token_count,
        document_count,
        round((token_count::numeric / sum(token_count) over ()) * 1000000, 8) as frequency_per_million,
        row_number() over (order by token_count desc, word_normalized)::integer as rank,
        round(
            least(
                1.0::numeric,
                (ln(token_count::numeric + 1) / ln((sum(token_count) over ())::numeric + 1))::numeric
            ),
            8
        ) as common_score
    from bootstrap
),
batch as (
    select id
    from public.patxanga_word_frequency_import_batches
    where language = 'pt-PT'
      and source = 'pt_pt_frequency_bootstrap_qa'
    order by created_at desc
    limit 1
)
insert into public.patxanga_word_frequency (
    language,
    word_normalized,
    source,
    source_domain,
    token_count,
    document_count,
    frequency_per_million,
    rank,
    common_score,
    source_version,
    import_batch_id
)
select
    'pt-PT',
    ranked.word_normalized,
    'pt_pt_frequency_bootstrap_qa',
    'qa',
    ranked.token_count,
    ranked.document_count,
    ranked.frequency_per_million,
    ranked.rank,
    ranked.common_score,
    '2026-06-24',
    batch.id
from ranked
cross join batch
on conflict (language, source, word_normalized) do update
set token_count = excluded.token_count,
    document_count = excluded.document_count,
    frequency_per_million = excluded.frequency_per_million,
    rank = excluded.rank,
    common_score = excluded.common_score,
    updated_at = now();

revoke all on function public.get_patxanga_word_common_score(text, text)
from public, anon, authenticated;

revoke all on function public.import_patxanga_word_frequency_entries(
    text,
    text,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    jsonb
)
from public, anon, authenticated;

grant execute on function public.get_patxanga_word_common_score(text, text)
to authenticated, anon;

grant execute on function public.import_patxanga_word_frequency_entries(
    text,
    text,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    jsonb
)
to authenticated, anon;

grant execute on function public.is_patxanga_bot_policy_word(text, text, text)
to authenticated, anon;
