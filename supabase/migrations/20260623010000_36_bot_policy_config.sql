-- ============================================================
-- PATXANGA - BOT POLICY CONFIG
-- Purpose: expose deterministic bot difficulty/profile parameters
-- ============================================================

create or replace function public.get_patxanga_bot_policy_config(
    p_bot_level text default 'easy',
    p_bot_profile text default 'balanced'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as
$$
declare
    v_level text := lower(coalesce(nullif(trim(p_bot_level), ''), 'easy'));
    v_profile text := lower(coalesce(nullif(trim(p_bot_profile), ''), 'balanced'));
    v_level_config jsonb;
    v_profile_config jsonb;
begin
    if v_level not in ('easy', 'medium', 'hard') then
        raise exception 'Unsupported bot level: %', p_bot_level;
    end if;

    if v_profile not in ('aggressive', 'balanced', 'defensive') then
        raise exception 'Unsupported bot profile: %', p_bot_profile;
    end if;

    v_level_config := case v_level
        when 'easy' then jsonb_build_object(
            'candidate_limit', 10,
            'connected_candidate_limit', 10,
            'max_word_length', 5,
            'max_anchor_count', 12,
            'preview_required', true,
            'allow_exchange', false,
            'unknown_word_vote_policy', 'reject',
            'thinking_delay_ms', 350
        )
        when 'medium' then jsonb_build_object(
            'candidate_limit', 35,
            'connected_candidate_limit', 25,
            'max_word_length', 7,
            'max_anchor_count', 28,
            'preview_required', true,
            'allow_exchange', true,
            'unknown_word_vote_policy', 'reject_unless_secondary_signal',
            'thinking_delay_ms', 650
        )
        else jsonb_build_object(
            'candidate_limit', 90,
            'connected_candidate_limit', 60,
            'max_word_length', 10,
            'max_anchor_count', 60,
            'preview_required', true,
            'allow_exchange', true,
            'unknown_word_vote_policy', 'reject_unless_trusted_source',
            'thinking_delay_ms', 900
        )
    end;

    v_profile_config := case v_profile
        when 'aggressive' then jsonb_build_object(
            'score_weight', 1.35,
            'rack_balance_weight', 0.55,
            'defensive_risk_weight', 0.4,
            'prefer_bingo_pressure', true,
            'exchange_bias', 0.25
        )
        when 'balanced' then jsonb_build_object(
            'score_weight', 1.0,
            'rack_balance_weight', 1.0,
            'defensive_risk_weight', 1.0,
            'prefer_bingo_pressure', false,
            'exchange_bias', 0.5
        )
        else jsonb_build_object(
            'score_weight', 0.75,
            'rack_balance_weight', 1.2,
            'defensive_risk_weight', 1.45,
            'prefer_bingo_pressure', false,
            'exchange_bias', 0.8
        )
    end;

    return jsonb_build_object(
        'bot_level', v_level,
        'bot_profile', v_profile,
        'level_config', v_level_config,
        'profile_config', v_profile_config,
        'candidate_limit', (v_level_config->>'candidate_limit')::integer,
        'connected_candidate_limit', (v_level_config->>'connected_candidate_limit')::integer,
        'max_word_length', (v_level_config->>'max_word_length')::integer,
        'max_anchor_count', (v_level_config->>'max_anchor_count')::integer,
        'preview_required', (v_level_config->>'preview_required')::boolean,
        'allow_exchange', (v_level_config->>'allow_exchange')::boolean,
        'unknown_word_vote_policy', v_level_config->>'unknown_word_vote_policy',
        'thinking_delay_ms', (v_level_config->>'thinking_delay_ms')::integer,
        'score_weight', (v_profile_config->>'score_weight')::numeric,
        'rack_balance_weight', (v_profile_config->>'rack_balance_weight')::numeric,
        'defensive_risk_weight', (v_profile_config->>'defensive_risk_weight')::numeric,
        'prefer_bingo_pressure', (v_profile_config->>'prefer_bingo_pressure')::boolean,
        'exchange_bias', (v_profile_config->>'exchange_bias')::numeric
    );
end;
$$;

revoke all on function public.get_patxanga_bot_policy_config(text, text)
from public, anon, authenticated;

grant execute on function public.get_patxanga_bot_policy_config(text, text)
to authenticated, anon;
