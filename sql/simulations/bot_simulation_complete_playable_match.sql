-- ============================================================
-- PATXANGA - COMPLETE PLAYABLE BOT MATCH SIMULATION
-- Purpose: bot-vs-bot reaches finished status through official RPCs
-- ============================================================

do $$
declare
    v_user_alpha uuid := gen_random_uuid();
    v_user_beta uuid := gen_random_uuid();
    v_match_id uuid;
    v_alpha_player_id uuid;
    v_beta_player_id uuid;
    v_alpha_s_id uuid := gen_random_uuid();
    v_alpha_o_id uuid := gen_random_uuid();
    v_alpha_l_id uuid := gen_random_uuid();
    v_beta_u_id uuid := gen_random_uuid();
    v_beta_a_id uuid := gen_random_uuid();
    v_result_1 jsonb;
    v_result_2 jsonb;
    v_result_3 jsonb;
    v_result_4 jsonb;
    v_finished_status text;
    v_total_moves integer;
    v_bad_word_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user_alpha,
        p_host_guest_name := 'Playable Bot Alpha',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_alpha_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and user_id = v_user_alpha;

    update public.patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Playable Bot Alpha',
        updated_at = now()
    where id = v_alpha_player_id;

    v_beta_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user_beta,
        p_guest_name := 'Playable Bot Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    update public.patxanga_matches
    set bag_state = jsonb_build_object('tiles', '[]'::jsonb, 'remaining', 0),
        current_turn_player_id = v_alpha_player_id,
        updated_at = now()
    where id = v_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_alpha_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_alpha_o_id::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_alpha_l_id::text, 'letter', 'L', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Q', 'points', 6, 'is_special', false, 'special_type', null)
        ),
        has_passed_last_cycle = false,
        updated_at = now()
    where id = v_alpha_player_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_beta_u_id::text, 'letter', 'U', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_beta_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Q', 'points', 6, 'is_special', false, 'special_type', null)
        ),
        has_passed_last_cycle = false,
        updated_at = now()
    where id = v_beta_player_id;

    v_result_1 := public.submit_patxanga_easy_bot_turn(v_match_id, v_alpha_player_id);

    if v_result_1->>'main_word' <> 'SOL' then
        raise exception 'Expected first playable bot word SOL, got %', v_result_1;
    end if;

    v_result_2 := public.submit_patxanga_easy_bot_turn(v_match_id, v_beta_player_id);

    if v_result_2->>'main_word' <> 'LUA' then
        raise exception 'Expected second playable bot word LUA, got %', v_result_2;
    end if;

    v_result_3 := public.submit_patxanga_easy_bot_turn(v_match_id, v_alpha_player_id);

    if v_result_3->>'bot_action' <> 'pass' then
        raise exception 'Expected alpha pass after no playable word, got %', v_result_3;
    end if;

    v_result_4 := public.submit_patxanga_easy_bot_turn(v_match_id, v_beta_player_id);

    if v_result_4->>'bot_action' <> 'pass' then
        raise exception 'Expected beta pass after no playable word, got %', v_result_4;
    end if;

    if coalesce((v_result_4->'end_state'->>'ended_by_all_passed')::boolean, false) is not true then
        raise exception 'Expected complete playable match to finish by all passed, got %', v_result_4;
    end if;

    select status
    into v_finished_status
    from public.patxanga_matches
    where id = v_match_id;

    if v_finished_status <> 'finished' then
        raise exception 'Expected complete playable match status finished, got %', v_finished_status;
    end if;

    select count(*)
    into v_total_moves
    from public.patxanga_moves
    where match_id = v_match_id;

    if v_total_moves <> 4 then
        raise exception 'Expected 4 moves in complete playable match, got %', v_total_moves;
    end if;

    select count(*)
    into v_bad_word_count
    from public.patxanga_moves
    where match_id = v_match_id
      and move_type = 'place_word'
      and main_word in ('AA', 'EE', 'BO');

    if v_bad_word_count <> 0 then
        raise exception 'Expected no weak words in complete playable match, got %', v_bad_word_count;
    end if;

    raise notice 'Complete playable bot match simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'result_1=%', v_result_1;
    raise notice 'result_2=%', v_result_2;
    raise notice 'result_3=%', v_result_3;
    raise notice 'result_4=%', v_result_4;
end $$;
