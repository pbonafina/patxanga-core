-- ============================================================
-- PATXANGA - TEST: bot policy config
-- Purpose: bot difficulty/profile contract is deterministic and distinct
-- ============================================================

do $$
declare
    v_easy_balanced jsonb;
    v_medium_balanced jsonb;
    v_hard_aggressive jsonb;
    v_hard_defensive jsonb;
    v_error_message text;
begin
    v_easy_balanced := public.get_patxanga_bot_policy_config('easy', 'balanced');
    v_medium_balanced := public.get_patxanga_bot_policy_config('medium', 'balanced');
    v_hard_aggressive := public.get_patxanga_bot_policy_config('hard', 'aggressive');
    v_hard_defensive := public.get_patxanga_bot_policy_config('hard', 'defensive');

    if v_easy_balanced->>'bot_level' <> 'easy' then
        raise exception 'Expected easy level, got %', v_easy_balanced;
    end if;

    if v_easy_balanced->>'bot_profile' <> 'balanced' then
        raise exception 'Expected balanced profile, got %', v_easy_balanced;
    end if;

    if (v_medium_balanced->>'candidate_limit')::integer <= (v_easy_balanced->>'candidate_limit')::integer then
        raise exception 'Expected medium candidate limit > easy, got easy=% medium=%',
            v_easy_balanced,
            v_medium_balanced;
    end if;

    if (v_hard_aggressive->>'candidate_limit')::integer <= (v_medium_balanced->>'candidate_limit')::integer then
        raise exception 'Expected hard candidate limit > medium, got medium=% hard=%',
            v_medium_balanced,
            v_hard_aggressive;
    end if;

    if (v_hard_aggressive->>'score_weight')::numeric <= (v_hard_defensive->>'score_weight')::numeric then
        raise exception 'Expected aggressive score_weight > defensive, got aggressive=% defensive=%',
            v_hard_aggressive,
            v_hard_defensive;
    end if;

    if (v_hard_defensive->>'defensive_risk_weight')::numeric <= (v_hard_aggressive->>'defensive_risk_weight')::numeric then
        raise exception 'Expected defensive risk weight > aggressive, got aggressive=% defensive=%',
            v_hard_aggressive,
            v_hard_defensive;
    end if;

    if (public.get_patxanga_bot_policy_config(null, null)->>'bot_level') <> 'easy' then
        raise exception 'Expected null level to default to easy';
    end if;

    begin
        perform public.get_patxanga_bot_policy_config('expert', 'balanced');
        raise exception 'Expected unsupported level to fail';
    exception
        when others then
            get stacked diagnostics v_error_message = message_text;

            if v_error_message not like 'Unsupported bot level:%' then
                raise exception 'Expected unsupported level error, got %', v_error_message;
            end if;
    end;

    begin
        perform public.get_patxanga_bot_policy_config('easy', 'reckless');
        raise exception 'Expected unsupported profile to fail';
    exception
        when others then
            get stacked diagnostics v_error_message = message_text;

            if v_error_message not like 'Unsupported bot profile:%' then
                raise exception 'Expected unsupported profile error, got %', v_error_message;
            end if;
    end;

    raise notice 'Bot policy config test passed';
    raise notice 'easy_balanced=%', v_easy_balanced;
    raise notice 'hard_aggressive=%', v_hard_aggressive;
    raise notice 'hard_defensive=%', v_hard_defensive;
end $$;
