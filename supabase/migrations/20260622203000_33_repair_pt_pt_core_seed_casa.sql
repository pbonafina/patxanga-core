-- ============================================================
-- PATXANGA - REPAIR PT-PT CORE SEED CASA
-- Purpose: keep the deterministic pt-PT baseline aligned with SQL tests
-- ============================================================

insert into public.patxanga_dictionary (
    language,
    word_original,
    word_normalized,
    source,
    is_active
)
values (
    'pt-PT',
    'CASA',
    public.normalize_patxanga_word('CASA'),
    'pt_pt_core_seed',
    true
)
on conflict (language, word_normalized) do update
set word_original = excluded.word_original,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = now();
