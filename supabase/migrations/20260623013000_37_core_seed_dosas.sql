-- ============================================================
-- PATXANGA - CORE SEED DOSAS
-- Purpose: accept common Portuguese verb form "dosas" in pt-BR and pt-PT
-- ============================================================

insert into public.patxanga_dictionary (
    language,
    word_original,
    word_normalized,
    source,
    is_active
)
values
    ('pt-BR', 'DOSAS', public.normalize_patxanga_word('DOSAS'), 'pt_br_core_seed', true),
    ('pt-PT', 'DOSAS', public.normalize_patxanga_word('DOSAS'), 'pt_pt_core_seed', true)
on conflict (language, word_normalized) do update
set word_original = excluded.word_original,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = now();
