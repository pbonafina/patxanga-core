-- ============================================================
-- PATXANGA - PT-PT CORE DICTIONARY SEED
-- Version: 1.0
-- Purpose: Small real-word seed for deterministic QA
-- ============================================================

insert into patxanga_dictionary (
    language,
    word_original,
    word_normalized,
    source,
    is_active
)
values
('pt-PT', 'AMOR', public.normalize_patxanga_word('AMOR'), 'pt_pt_core_seed', true),
('pt-PT', 'AÇÃO', public.normalize_patxanga_word('AÇÃO'), 'pt_pt_core_seed', true),
('pt-PT', 'BOLA', public.normalize_patxanga_word('BOLA'), 'pt_pt_core_seed', true),
('pt-PT', 'CASA', public.normalize_patxanga_word('CASA'), 'pt_pt_core_seed', true),
('pt-PT', 'GATO', public.normalize_patxanga_word('GATO'), 'pt_pt_core_seed', true),
('pt-PT', 'JOGO', public.normalize_patxanga_word('JOGO'), 'pt_pt_core_seed', true),
('pt-PT', 'LIVRO', public.normalize_patxanga_word('LIVRO'), 'pt_pt_core_seed', true),
('pt-PT', 'LUA', public.normalize_patxanga_word('LUA'), 'pt_pt_core_seed', true),
('pt-PT', 'MÃO', public.normalize_patxanga_word('MÃO'), 'pt_pt_core_seed', true),
('pt-PT', 'MAR', public.normalize_patxanga_word('MAR'), 'pt_pt_core_seed', true),
('pt-PT', 'MESA', public.normalize_patxanga_word('MESA'), 'pt_pt_core_seed', true),
('pt-PT', 'PÃO', public.normalize_patxanga_word('PÃO'), 'pt_pt_core_seed', true),
('pt-PT', 'PATO', public.normalize_patxanga_word('PATO'), 'pt_pt_core_seed', true),
('pt-PT', 'PORTA', public.normalize_patxanga_word('PORTA'), 'pt_pt_core_seed', true),
('pt-PT', 'RUA', public.normalize_patxanga_word('RUA'), 'pt_pt_core_seed', true),
('pt-PT', 'SOL', public.normalize_patxanga_word('SOL'), 'pt_pt_core_seed', true),
('pt-PT', 'TEMPO', public.normalize_patxanga_word('TEMPO'), 'pt_pt_core_seed', true),
('pt-PT', 'VIDA', public.normalize_patxanga_word('VIDA'), 'pt_pt_core_seed', true)
on conflict (language, word_normalized) do update
set word_original = excluded.word_original,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = now();
