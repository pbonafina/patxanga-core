-- ============================================================
-- PATXANGA - Migration 002
-- Dictionary Structure
-- Version: 1.0
-- ============================================================

create table if not exists patxanga_dictionary (
    word_original text primary key,
    word_normalized text not null unique
);

create index if not exists idx_patxanga_dictionary_normalized
on patxanga_dictionary (word_normalized);