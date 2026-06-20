-- ============================================================
-- PATXANGA - DICTIONARY CONTRACT WITH LANGUAGE
-- Purpose: prepare dictionary validation for real lexical sources
-- ============================================================

alter table public.patxanga_dictionary
add column if not exists language text;

alter table public.patxanga_dictionary
add column if not exists source text;

alter table public.patxanga_dictionary
add column if not exists is_active boolean;

alter table public.patxanga_dictionary
add column if not exists created_at timestamptz;

alter table public.patxanga_dictionary
add column if not exists updated_at timestamptz;

update public.patxanga_dictionary
set language = coalesce(nullif(language, ''), 'pt-BR'),
    source = coalesce(nullif(source, ''), 'test_seed'),
    is_active = coalesce(is_active, true),
    created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now());

alter table public.patxanga_dictionary
alter column language set default 'pt-BR',
alter column language set not null,
alter column source set default 'test_seed',
alter column source set not null,
alter column is_active set default true,
alter column is_active set not null,
alter column created_at set default now(),
alter column created_at set not null,
alter column updated_at set default now(),
alter column updated_at set not null;

alter table public.patxanga_dictionary
drop constraint if exists patxanga_dictionary_pkey;

alter table public.patxanga_dictionary
drop constraint if exists patxanga_dictionary_word_normalized_key;

alter table public.patxanga_dictionary
add constraint patxanga_dictionary_pkey
primary key (language, word_normalized);

drop index if exists public.idx_patxanga_dictionary_normalized;

create index if not exists idx_patxanga_dictionary_active_lookup
on public.patxanga_dictionary (language, word_normalized)
where is_active = true;

create index if not exists idx_patxanga_dictionary_source
on public.patxanga_dictionary (source);

drop function if exists public.validate_word(text);
drop function if exists public.validate_word(text, text);

create or replace function public.validate_word(
    p_word text,
    p_language text default 'pt-BR'
)
returns boolean
language plpgsql
stable
as
$$
declare
    v_normalized text;
    v_exists integer;
begin
    if p_word is null then
        return false;
    end if;

    if coalesce(nullif(trim(p_language), ''), '') = '' then
        return false;
    end if;

    v_normalized := public.normalize_patxanga_word(p_word);

    select 1
    into v_exists
    from patxanga_dictionary
    where word_normalized = v_normalized
      and language = p_language
      and is_active = true
    limit 1;

    return v_exists is not null;
end;
$$;

grant execute on function public.validate_word(text, text)
to authenticated, anon;
