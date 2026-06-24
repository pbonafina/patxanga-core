-- ============================================================
-- PATXANGA - BOT SIMULATION SMOKE
-- Purpose: deterministic bot-vs-bot simulation for QA
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_bot_alpha_player_id uuid;
    v_bot_beta_player_id uuid;
    v_bot_count integer;
    v_current_player_id uuid;
    v_next_player_id uuid;
    v_tile_s_id uuid := gen_random_uuid();
    v_tile_o_id uuid := gen_random_uuid();
    v_tile_l_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_submit_result jsonb;
    v_pass_result jsonb;
    v_total_score integer;
    v_accepted_place_word_count integer;
    v_pass_move_count integer;
    v_move_replay_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Alpha',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_bot_alpha_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Alpha',
        updated_at = now()
    where id = v_bot_alpha_player_id;

    v_bot_beta_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    select count(*)
    into v_bot_count
    from patxanga_players
    where match_id = v_match_id
      and is_bot = true;

    if v_bot_count <> 2 then
        raise exception 'Expected 2 bot players, got %', v_bot_count;
    end if;

    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    if not exists (
        select 1
        from patxanga_players
        where id = v_current_player_id
          and match_id = v_match_id
          and is_bot = true
    ) then
        raise exception 'Current player is not a bot: %', v_current_player_id;
    end if;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object(
            'id', v_tile_s_id::text,
            'letter', 'S',
            'points', 1,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object(
            'id', v_tile_o_id::text,
            'letter', 'O',
            'points', 1,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object('id', v_tile_l_id::text, 'letter', 'L', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_current_player_id;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_tile_s_id::text,
                'row', 8,
                'col', 8,
                'declared_letter', null
            ),
            jsonb_build_object(
                'tile_id', v_tile_o_id::text,
                'row', 8,
                'col', 9,
                'declared_letter', null
            ),
            jsonb_build_object(
                'tile_id', v_tile_l_id::text,
                'row', 8,
                'col', 10,
                'declared_letter', null
            )
        )
    );

    if v_submit_result->>'status' <> 'success' then
        raise exception 'Expected bot move success, got %', v_submit_result;
    end if;

    if v_submit_result->>'move_id' is null then
        raise exception 'Expected accepted move_id in bot move result, got %', v_submit_result;
    end if;

    v_total_score := (v_submit_result->'score'->>'total_score')::integer;

    if v_total_score <> 8 then
        raise exception 'Expected opening SOL score 8, got % from %', v_total_score, v_submit_result;
    end if;

    select current_turn_player_id
    into v_next_player_id
    from patxanga_matches
    where id = v_match_id;

    if v_next_player_id = v_current_player_id then
        raise exception 'Turn did not advance after bot move';
    end if;

    if not exists (
        select 1
        from patxanga_players
        where id = v_next_player_id
          and match_id = v_match_id
          and is_bot = true
    ) then
        raise exception 'Next player is not a bot: %', v_next_player_id;
    end if;

    select count(*)
    into v_accepted_place_word_count
    from patxanga_moves
    where match_id = v_match_id
      and player_id = v_current_player_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'SOL'
      and score_total = 8;

    if v_accepted_place_word_count <> 1 then
        raise exception 'Expected exactly 1 accepted bot place_word move, got %', v_accepted_place_word_count;
    end if;

    v_pass_result := public.submit_patxanga_pass_turn(
        v_match_id,
        v_next_player_id
    );

    if v_pass_result->>'status' <> 'success' then
        raise exception 'Expected bot pass success, got %', v_pass_result;
    end if;

    select count(*)
    into v_pass_move_count
    from patxanga_moves
    where match_id = v_match_id
      and player_id = v_next_player_id
      and move_type = 'pass'
      and status = 'accepted';

    if v_pass_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted bot pass move, got %', v_pass_move_count;
    end if;

    select count(*)
    into v_move_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'move_submitted';

    if v_move_replay_count <> 1 then
        raise exception 'Expected exactly 1 move_submitted replay event, got %', v_move_replay_count;
    end if;

    raise notice 'Bot simulation smoke passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'bot_alpha_player_id=%', v_bot_alpha_player_id;
    raise notice 'bot_beta_player_id=%', v_bot_beta_player_id;
    raise notice 'first_bot_player_id=%', v_current_player_id;
    raise notice 'second_bot_player_id=%', v_next_player_id;
    raise notice 'opening_result=%', v_submit_result;
    raise notice 'pass_result=%', v_pass_result;
    raise notice 'accepted_place_word_count=%', v_accepted_place_word_count;
    raise notice 'accepted_pass_move_count=%', v_pass_move_count;
    raise notice 'move_submitted_replay_count=%', v_move_replay_count;
end $$;
