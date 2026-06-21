-- ============================================================
-- PATXANGA - TEST: easy bot turn policy
-- Purpose: bot tries a valid opening word before pass fallback
-- ============================================================

do $$
declare
    v_human_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_human_player_id uuid;
    v_bot_player_id uuid;
    v_tile_s_id uuid := gen_random_uuid();
    v_tile_o_id uuid := gen_random_uuid();
    v_tile_l_id uuid := gen_random_uuid();
    v_result jsonb;
    v_accepted_move_count integer;
    v_current_turn_player_id uuid;

    v_fallback_human_user_id uuid := gen_random_uuid();
    v_fallback_bot_user_id uuid := gen_random_uuid();
    v_fallback_match_id uuid;
    v_fallback_bot_player_id uuid;
    v_fallback_result jsonb;
    v_pass_move_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_human_user_id,
        p_host_guest_name := 'Human SQL',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_human_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and user_id = v_human_user_id;

    v_bot_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Easy',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_tile_o_id::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_tile_l_id::text, 'letter', 'L', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Q', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'X', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Z', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'K', 'points', 7, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_bot_player_id;

    update public.patxanga_matches
    set current_turn_player_id = v_bot_player_id,
        updated_at = now()
    where id = v_match_id;

    v_result := public.submit_patxanga_easy_bot_turn(
        v_match_id,
        v_bot_player_id
    );

    if v_result->>'status' <> 'success' then
        raise exception 'Expected easy bot turn success, got %', v_result;
    end if;

    if v_result->>'bot_action' <> 'place_word' then
        raise exception 'Expected easy bot to place a word, got %', v_result;
    end if;

    if v_result->>'main_word' <> 'SOL' then
        raise exception 'Expected easy bot opening word SOL, got %', v_result;
    end if;

    if (v_result->'score'->>'total_score')::integer <> 8 then
        raise exception 'Expected SOL opening score 8, got %', v_result;
    end if;

    if (select board_state #>> '{7,7,tile,letter}' from public.patxanga_matches where id = v_match_id) <> 'S' then
        raise exception 'Expected S at board center after bot opening';
    end if;

    if (select board_state #>> '{7,8,tile,letter}' from public.patxanga_matches where id = v_match_id) <> 'O' then
        raise exception 'Expected O after board center after bot opening';
    end if;

    if (select board_state #>> '{7,9,tile,letter}' from public.patxanga_matches where id = v_match_id) <> 'L' then
        raise exception 'Expected L after board center after bot opening';
    end if;

    select count(*)
    into v_accepted_move_count
    from public.patxanga_moves
    where match_id = v_match_id
      and player_id = v_bot_player_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'SOL'
      and score_total = 8;

    if v_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted SOL bot move, got %',
            v_accepted_move_count;
    end if;

    select current_turn_player_id
    into v_current_turn_player_id
    from public.patxanga_matches
    where id = v_match_id;

    if v_current_turn_player_id <> v_human_player_id then
        raise exception 'Expected turn to return to human after bot move, got %',
            v_current_turn_player_id;
    end if;

    v_fallback_match_id := public.create_patxanga_match(
        p_host_user_id := v_fallback_human_user_id,
        p_host_guest_name := 'Human Fallback SQL',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    v_fallback_bot_player_id := public.join_patxanga_match(
        p_match_id := v_fallback_match_id,
        p_user_id := v_fallback_bot_user_id,
        p_guest_name := 'Bot Fallback',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_fallback_match_id);

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Q', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'X', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Z', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'K', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Y', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'W', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'H', 'points', 4, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_fallback_bot_player_id;

    update public.patxanga_matches
    set current_turn_player_id = v_fallback_bot_player_id,
        updated_at = now()
    where id = v_fallback_match_id;

    v_fallback_result := public.submit_patxanga_easy_bot_turn(
        v_fallback_match_id,
        v_fallback_bot_player_id
    );

    if v_fallback_result->>'status' <> 'success' then
        raise exception 'Expected fallback bot turn success, got %',
            v_fallback_result;
    end if;

    if v_fallback_result->>'bot_action' <> 'pass' then
        raise exception 'Expected fallback bot action pass, got %',
            v_fallback_result;
    end if;

    if v_fallback_result->>'pass_reason' <> 'no_opening_word' then
        raise exception 'Expected fallback reason no_opening_word, got %',
            v_fallback_result;
    end if;

    select count(*)
    into v_pass_move_count
    from public.patxanga_moves
    where match_id = v_fallback_match_id
      and player_id = v_fallback_bot_player_id
      and move_type = 'pass'
      and status = 'accepted';

    if v_pass_move_count <> 1 then
        raise exception 'Expected exactly 1 fallback pass move, got %',
            v_pass_move_count;
    end if;

    raise notice 'Easy bot turn policy test passed';
    raise notice 'opening_result=%', v_result;
    raise notice 'fallback_result=%', v_fallback_result;
end $$;
