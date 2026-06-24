-- ============================================================
-- PATXANGA - MIGRATION 47: Easy bot non-news frequency gate
-- Purpose: avoid news-only proper-name/acronym noise promoted by corpus
-- frequency, while keeping medium/hard policies broader.
-- ============================================================

create or replace function public.is_patxanga_bot_policy_word(
    p_word text,
    p_language text,
    p_bot_level text default 'easy'
)
returns boolean
language sql
stable
set search_path = public
as
$$
    with normalized as (
        select
            public.normalize_patxanga_word(p_word) as word,
            lower(coalesce(nullif(trim(p_bot_level), ''), 'easy')) as bot_level
    ),
    easy_short_allowlist(word) as (
        values
            ('ACO'), ('AMA'), ('ANO'), ('ASA'), ('ATE'), ('ATO'), ('AVO'),
            ('BOA'), ('BOM'), ('CAI'), ('CHA'), ('COM'), ('DAI'), ('DAS'),
            ('DEI'), ('DEU'), ('DIA'), ('DIZ'), ('DOU'), ('DOS'), ('ECO'),
            ('ELA'), ('ELE'), ('ERA'), ('FIA'), ('FIM'), ('FOI'), ('LEI'),
            ('LER'), ('LUA'), ('LUZ'), ('MAE'), ('MAO'), ('MAR'), ('MAU'),
            ('MEU'), ('NAO'), ('NAS'), ('NEM'), ('NOS'), ('OVO'), ('PAI'),
            ('PAO'), ('POR'), ('QUE'), ('REI'), ('RIO'), ('RUA'), ('SAI'),
            ('SAO'), ('SEI'), ('SEM'), ('SER'), ('SEU'), ('SIM'), ('SOL'),
            ('SUA'), ('TAL'), ('TEM'), ('TEU'), ('TIA'), ('TIO'), ('TUA'),
            ('UMA'), ('UNS'), ('USA'), ('USO'), ('VAI'), ('VEM'), ('VER'),
            ('VIA'), ('VOU')
    ),
    language_frequency as (
        select exists (
            select 1
            from public.patxanga_word_frequency frequency
            where frequency.language = p_language
        ) as has_frequency
    ),
    easy_non_news_quality as (
        select exists (
            select 1
            from public.patxanga_word_frequency frequency
            join normalized on true
            where frequency.language = p_language
              and frequency.word_normalized = normalized.word
              and coalesce(frequency.source_domain, '') <> 'news'
              and frequency.common_score >= 0.18
        ) as has_non_news_support
    ),
    policy as (
        select
            exists (
                select 1
                from public.patxanga_bot_word_policy_overrides override
                join normalized on true
                where override.language = p_language
                  and override.word_normalized = normalized.word
                  and override.policy_status = 'preferred'
            ) as is_preferred,
            exists (
                select 1
                from public.patxanga_bot_word_policy_overrides override
                join normalized on true
                where override.language = p_language
                  and override.word_normalized = normalized.word
                  and (
                      override.policy_status = 'blocked_medium'
                      or (
                          override.policy_status = 'blocked_easy'
                          and normalized.bot_level = 'easy'
                      )
                  )
            ) as is_blocked
    )
    select
        public.is_patxanga_playable_bot_word(normalized.word)
        and (
            normalized.bot_level <> 'easy'
            or char_length(normalized.word) <> 3
            or exists (
                select 1
                from easy_short_allowlist allowlist
                where allowlist.word = normalized.word
            )
        )
        and (
            normalized.bot_level <> 'easy'
            or char_length(normalized.word) <= 3
            or not language_frequency.has_frequency
            or easy_non_news_quality.has_non_news_support
        )
        and (
            normalized.bot_level = 'hard'
            or normalized.word !~ '[KWY]'
        )
        and not policy.is_blocked
        and (
            normalized.bot_level = 'hard'
            or not language_frequency.has_frequency
            or policy.is_preferred
            or public.get_patxanga_word_common_score(normalized.word, p_language) >= case
                when normalized.bot_level = 'medium' then 0.18
                else 0.35
            end
        )
    from normalized, language_frequency, easy_non_news_quality, policy;
$$;

revoke all on function public.is_patxanga_bot_policy_word(text, text, text)
from public, anon, authenticated;

grant execute on function public.is_patxanga_bot_policy_word(text, text, text)
to authenticated, anon;
