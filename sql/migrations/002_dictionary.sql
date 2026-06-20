-- ============================================================
-- PATXANGA - Migration 002
-- Dictionary Structure
-- Version: 1.0
-- ============================================================

create table if not exists patxanga_dictionary (
    language text not null default 'pt-BR',
    word_original text not null,
    word_normalized text not null,
    source text not null default 'test_seed',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (language, word_normalized)
);

create index if not exists idx_patxanga_dictionary_active_lookup
on patxanga_dictionary (language, word_normalized)
where is_active = true;

create index if not exists idx_patxanga_dictionary_source
on patxanga_dictionary (source);
