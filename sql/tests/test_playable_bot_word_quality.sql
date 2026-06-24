-- ============================================================
-- PATXANGA - TEST: playable bot word quality
-- Purpose: bot candidates must avoid weak dictionary entries like AA/BO
-- ============================================================

do $$
declare
    v_human_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_bot_player_id uuid;
    v_candidates jsonb;
begin
    insert into public.patxanga_dictionary (
        language,
        word_original,
        word_normalized,
        source,
        is_active
    )
    values
        ('pt-BR', 'AA', public.normalize_patxanga_word('AA'), 'playable_bot_quality_test', true),
        ('pt-BR', 'BO', public.normalize_patxanga_word('BO'), 'playable_bot_quality_test', true),
        ('pt-BR', 'FIXE', public.normalize_patxanga_word('FIXE'), 'playable_bot_quality_test', true)
    on conflict (language, word_normalized) do update
    set word_original = excluded.word_original,
        source = excluded.source,
        is_active = excluded.is_active,
        updated_at = now();

    if public.is_patxanga_playable_bot_word('AA') is true then
        raise exception 'Expected AA to be rejected by playable bot word policy';
    end if;

    if public.is_patxanga_playable_bot_word('BO') is true then
        raise exception 'Expected BO to be rejected by playable bot word policy';
    end if;

    if public.is_patxanga_playable_bot_word('FIXE') is not true then
        raise exception 'Expected FIXE to be accepted by playable bot word policy';
    end if;

    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_human_user_id,
        p_host_guest_name := 'Human Quality SQL',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    v_bot_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Quality',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'F', 'points', 4, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'I', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'X', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'B', 'points', 3, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_bot_player_id;

    update public.patxanga_matches
    set current_turn_player_id = v_bot_player_id,
        updated_at = now()
    where id = v_match_id;

    v_candidates := public.find_patxanga_playable_bot_candidate_moves(
        v_match_id,
        v_bot_player_id,
        10
    );

    if jsonb_array_length(v_candidates) = 0 then
        raise exception 'Expected playable bot candidates, got %', v_candidates;
    end if;

    if v_candidates @> '[{"main_word":"AA"}]'::jsonb then
        raise exception 'Expected playable bot candidates not to include AA, got %', v_candidates;
    end if;

    if v_candidates @> '[{"main_word":"BO"}]'::jsonb then
        raise exception 'Expected playable bot candidates not to include BO, got %', v_candidates;
    end if;

    if not exists (
        select 1
        from jsonb_array_elements(v_candidates) candidate(value)
        where candidate.value->>'main_word' = 'FIXE'
    ) then
        raise exception 'Expected playable bot candidates to include FIXE, got %', v_candidates;
    end if;

    raise notice 'Playable bot word quality test passed';
    raise notice 'candidates=%', v_candidates;
end $$;
