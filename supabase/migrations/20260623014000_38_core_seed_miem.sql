-- ============================================================
-- PATXANGA - CORE SEED MIEM
-- Purpose: accept common Portuguese verb form "miem" in pt-BR and pt-PT
-- ============================================================

insert into public.patxanga_dictionary (
    language,
    word_original,
    word_normalized,
    source,
    is_active
)
values
    ('pt-BR', 'MIEM', public.normalize_patxanga_word('MIEM'), 'pt_br_core_seed', true),
    ('pt-PT', 'MIEM', public.normalize_patxanga_word('MIEM'), 'pt_pt_core_seed', true)
on conflict (language, word_normalized) do update
set word_original = excluded.word_original,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = now();
