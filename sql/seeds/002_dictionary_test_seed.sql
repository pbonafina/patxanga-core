-- ============================================================
-- PATXANGA - DICTIONARY TEST SEED
-- Version: 1.0
-- Purpose: Minimal lexical seed for engine validation
-- ============================================================

insert into patxanga_dictionary (
    language,
    word_original,
    word_normalized,
    source,
    is_active
)
values
('pt-BR', 'SE', 'SE', 'test_seed', true),
('pt-BR', 'DE', 'DE', 'test_seed', true),
('pt-BR', 'EM', 'EM', 'test_seed', true),
('pt-BR', 'ME', 'ME', 'test_seed', true),
('pt-BR', 'TE', 'TE', 'test_seed', true),
('pt-BR', 'DA', 'DA', 'test_seed', true),
('pt-BR', 'DO', 'DO', 'test_seed', true),
('pt-BR', 'EU', 'EU', 'test_seed', true),
('pt-BR', 'TU', 'TU', 'test_seed', true),
('pt-BR', 'NO', 'NO', 'test_seed', true),
('pt-BR', 'NA', 'NA', 'test_seed', true),
('pt-BR', 'RE', 'RE', 'test_seed', true)
on conflict (language, word_normalized) do update
set word_original = excluded.word_original,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = now();
