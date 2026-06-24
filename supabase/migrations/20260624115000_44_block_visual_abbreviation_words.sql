-- ============================================================
-- PATXANGA - MIGRATION 44: Block visual abbreviation words
-- Purpose: keep easy bot away from acronym/abbreviation-like words
-- observed in full visual playthroughs.
-- ============================================================

insert into public.patxanga_bot_word_policy_overrides (
    language,
    word_normalized,
    policy_status,
    reason
)
values
    ('pt-PT', 'CES', 'blocked_easy', 'abbreviation-like playthrough word'),
    ('pt-PT', 'OUT', 'blocked_easy', 'abbreviation-like playthrough word')
on conflict (language, word_normalized, policy_status) do update
set reason = excluded.reason;
