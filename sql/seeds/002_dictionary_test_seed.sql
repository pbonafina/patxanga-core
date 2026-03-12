-- ============================================================
-- PATXANGA - DICTIONARY TEST SEED
-- Version: 1.0
-- Purpose: Minimal lexical seed for engine validation
-- ============================================================

insert into patxanga_dictionary (word_original, word_normalized)
values
('SE', 'SE'),
('DE', 'DE'),
('EM', 'EM'),
('ME', 'ME'),
('TE', 'TE'),
('DA', 'DA'),
('DO', 'DO'),
('EU', 'EU'),
('TU', 'TU'),
('NO', 'NO'),
('NA', 'NA'),
('RE', 'RE')
on conflict (word_original) do nothing;