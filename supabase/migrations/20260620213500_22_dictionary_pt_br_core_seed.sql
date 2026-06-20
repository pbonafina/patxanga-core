-- ============================================================
-- PATXANGA - PT-BR CORE DICTIONARY SEED
-- Purpose: small real-word seed for deterministic QA
-- ============================================================

insert into public.patxanga_dictionary (
    language,
    word_original,
    word_normalized,
    source,
    is_active
)
values
('pt-BR', 'AMOR', public.normalize_patxanga_word('AMOR'), 'pt_br_core_seed', true),
('pt-BR', 'AÇÃO', public.normalize_patxanga_word('AÇÃO'), 'pt_br_core_seed', true),
('pt-BR', 'BOLA', public.normalize_patxanga_word('BOLA'), 'pt_br_core_seed', true),
('pt-BR', 'CASA', public.normalize_patxanga_word('CASA'), 'pt_br_core_seed', true),
('pt-BR', 'GATO', public.normalize_patxanga_word('GATO'), 'pt_br_core_seed', true),
('pt-BR', 'JOGO', public.normalize_patxanga_word('JOGO'), 'pt_br_core_seed', true),
('pt-BR', 'LIVRO', public.normalize_patxanga_word('LIVRO'), 'pt_br_core_seed', true),
('pt-BR', 'LUA', public.normalize_patxanga_word('LUA'), 'pt_br_core_seed', true),
('pt-BR', 'MÃO', public.normalize_patxanga_word('MÃO'), 'pt_br_core_seed', true),
('pt-BR', 'MAR', public.normalize_patxanga_word('MAR'), 'pt_br_core_seed', true),
('pt-BR', 'MESA', public.normalize_patxanga_word('MESA'), 'pt_br_core_seed', true),
('pt-BR', 'PÃO', public.normalize_patxanga_word('PÃO'), 'pt_br_core_seed', true),
('pt-BR', 'PATO', public.normalize_patxanga_word('PATO'), 'pt_br_core_seed', true),
('pt-BR', 'PORTA', public.normalize_patxanga_word('PORTA'), 'pt_br_core_seed', true),
('pt-BR', 'RUA', public.normalize_patxanga_word('RUA'), 'pt_br_core_seed', true),
('pt-BR', 'SOL', public.normalize_patxanga_word('SOL'), 'pt_br_core_seed', true),
('pt-BR', 'TEMPO', public.normalize_patxanga_word('TEMPO'), 'pt_br_core_seed', true),
('pt-BR', 'VIDA', public.normalize_patxanga_word('VIDA'), 'pt_br_core_seed', true)
on conflict (language, word_normalized) do update
set word_original = excluded.word_original,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = now();
