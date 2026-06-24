-- ============================================================
-- PATXANGA - MIGRATION 45: Block short technical/prefix words
-- Purpose: keep easy bot vocabulary closer to common standalone words.
-- ============================================================

insert into public.patxanga_bot_word_policy_overrides (
    language,
    word_normalized,
    policy_status,
    reason
)
values
    ('pt-PT', 'BITS', 'blocked_easy', 'technical foreign-looking playthrough word'),
    ('pt-PT', 'DES', 'blocked_easy', 'prefix-like playthrough word'),
    ('pt-PT', 'NET', 'blocked_easy', 'technical foreign-looking playthrough word')
on conflict (language, word_normalized, policy_status) do update
set reason = excluded.reason;
