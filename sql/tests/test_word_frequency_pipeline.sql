-- ============================================================
-- PATXANGA - TEST: word frequency pipeline
-- ============================================================

do $$
declare
    v_result jsonb;
    v_casa_score numeric;
    v_rare_score numeric;
    v_easy_casa boolean;
    v_easy_rare boolean;
    v_medium_aluz boolean;
    v_hard_rare boolean;
    v_preferred_count integer;
    v_rank integer;
begin
    v_result := public.import_patxanga_word_frequency_entries(
        p_language := 'pt-PT',
        p_source := 'word_frequency_pipeline_test',
        p_source_domain := 'qa',
        p_license_name := 'Test Fixture License',
        p_entries := jsonb_build_array(
            jsonb_build_object('word', 'CASA', 'token_count', 1000, 'document_count', 100),
            jsonb_build_object('word', 'QZXQ', 'token_count', 3, 'document_count', 2),
            jsonb_build_object('word', 'ALUZ', 'token_count', 2, 'document_count', 1),
            jsonb_build_object('word', 'KIR', 'token_count', 500, 'document_count', 50),
            jsonb_build_object('word', '123', 'token_count', 20, 'document_count', 1),
            jsonb_build_object('word', '', 'token_count', 20, 'document_count', 1)
        ),
        p_source_version := 'fixture-v1',
        p_imported_by := 'sql/tests/test_word_frequency_pipeline.sql',
        p_metadata := jsonb_build_object('test', true)
    );

    if v_result->>'status' <> 'success' then
        raise exception 'Expected import success, got %', v_result;
    end if;

    if (v_result->>'total_rows')::integer <> 6 or (v_result->>'valid_rows')::integer <> 4 then
        raise exception 'Expected total_rows=6 valid_rows=4, got %', v_result;
    end if;

    select rank
    into v_rank
    from public.patxanga_word_frequency
    where language = 'pt-PT'
      and source = 'word_frequency_pipeline_test'
      and word_normalized = 'CASA';

    if v_rank <> 1 then
        raise exception 'Expected CASA rank 1, got %', v_rank;
    end if;

    v_casa_score := public.get_patxanga_word_common_score('casa', 'pt-PT');
    v_rare_score := public.get_patxanga_word_common_score('qzxq', 'pt-PT');

    if v_casa_score <= v_rare_score then
        raise exception 'Expected CASA score > QZXQ score, got CASA=% QZXQ=%', v_casa_score, v_rare_score;
    end if;

    select
        public.is_patxanga_bot_policy_word('CASA', 'pt-PT', 'easy'),
        public.is_patxanga_bot_policy_word('QZXQ', 'pt-PT', 'easy'),
        public.is_patxanga_bot_policy_word('ALUZ', 'pt-PT', 'medium'),
        public.is_patxanga_bot_policy_word('QZXQ', 'pt-PT', 'hard')
    into
        v_easy_casa,
        v_easy_rare,
        v_medium_aluz,
        v_hard_rare;

    if v_easy_casa is not true then
        raise exception 'Expected CASA to be easy-playable from frequency pipeline';
    end if;

    if v_easy_rare is not false then
        raise exception 'Expected low-frequency QZXQ to be blocked for easy';
    end if;

    if v_medium_aluz is not false then
        raise exception 'Expected very low-frequency ALUZ to be blocked for medium';
    end if;

    if v_hard_rare is not true then
        raise exception 'Expected hard bot to allow QZXQ';
    end if;

    select count(*)
    into v_preferred_count
    from public.patxanga_bot_word_policy_overrides
    where language = 'pt-PT'
      and word_normalized = 'CASA'
      and policy_status = 'preferred'
      and reason = 'frequency import: word_frequency_pipeline_test';

    if v_preferred_count <> 1 then
        raise exception 'Expected CASA preferred override from frequency import, got %', v_preferred_count;
    end if;

    raise notice 'Word frequency pipeline test passed';
end $$;
