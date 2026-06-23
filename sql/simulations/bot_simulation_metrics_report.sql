-- ============================================================
-- PATXANGA - BOT SIMULATION METRICS REPORT
-- Purpose: deterministic multi-step bot quality metrics smoke
-- ============================================================

do $$
declare
    v_user_alpha uuid := gen_random_uuid();
    v_user_beta uuid := gen_random_uuid();
    v_match_id uuid;
    v_alpha_player_id uuid;
    v_beta_player_id uuid;
    v_tile_s_id uuid := gen_random_uuid();
    v_tile_o_id uuid := gen_random_uuid();
    v_tile_l_id uuid := gen_random_uuid();
    v_tile_u_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_tile_x_id uuid := gen_random_uuid();
    v_tile_z_id uuid := gen_random_uuid();
    v_opening_result jsonb;
    v_connected_result jsonb;
    v_pending_result jsonb;
    v_vote_result jsonb;
    v_pass_result jsonb;
    v_metrics jsonb;
    v_total_moves integer;
    v_accepted_words integer;
    v_rejected_words integer;
    v_passes integer;
    v_exchanges integer;
    v_votes integer;
    v_final_turn integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user_alpha,
        p_host_guest_name := 'Metrics Bot Alpha',
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
        display_name = 'Metrics Bot Alpha',
        updated_at = now()
    where id = v_alpha_player_id;

    v_beta_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user_beta,
        p_guest_name := 'Metrics Bot Beta',
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
    where id = v_alpha_player_id;

    update public.patxanga_matches
    set current_turn_player_id = v_alpha_player_id,
        updated_at = now()
    where id = v_match_id;

    v_opening_result := public.submit_patxanga_easy_bot_turn(v_match_id, v_alpha_player_id);

    if v_opening_result->>'main_word' <> 'SOL' then
        raise exception 'Expected metrics opening SOL, got %', v_opening_result;
    end if;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_tile_u_id::text, 'letter', 'U', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Q', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'X', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Z', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'K', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Y', 'points', 7, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_beta_player_id;

    v_connected_result := public.submit_patxanga_easy_bot_turn(v_match_id, v_beta_player_id);

    if v_connected_result->>'main_word' <> 'LUA' then
        raise exception 'Expected metrics connected LUA, got %', v_connected_result;
    end if;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_tile_x_id::text, 'letter', 'X', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_tile_z_id::text, 'letter', 'Z', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Q', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'K', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Y', 'points', 7, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_alpha_player_id;

    v_pending_result := public.submit_patxanga_move(
        v_match_id,
        v_alpha_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile_x_id::text, 'row', 7, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_z_id::text, 'row', 9, 'col', 8, 'declared_letter', null)
        )
    );

    if v_pending_result->>'status' <> 'pending_vote' then
        raise exception 'Expected metrics pending vote, got %', v_pending_result;
    end if;

    v_vote_result := public.submit_patxanga_easy_bot_vote(v_match_id, v_beta_player_id);

    if v_vote_result->>'status' <> 'rejected' then
        raise exception 'Expected metrics bot rejection, got %', v_vote_result;
    end if;

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
    where id = v_alpha_player_id;

    v_pass_result := public.submit_patxanga_easy_bot_turn(v_match_id, v_alpha_player_id);

    if v_pass_result->>'bot_action' <> 'pass' then
        raise exception 'Expected metrics fallback pass, got %', v_pass_result;
    end if;

    select
        count(*),
        count(*) filter (where move_type = 'place_word' and status = 'accepted'),
        count(*) filter (where move_type = 'place_word' and status = 'rejected'),
        count(*) filter (where move_type = 'pass'),
        count(*) filter (where move_type = 'exchange')
    into
        v_total_moves,
        v_accepted_words,
        v_rejected_words,
        v_passes,
        v_exchanges
    from public.patxanga_moves
    where match_id = v_match_id;

    select count(*)
    into v_votes
    from public.patxanga_votes
    where match_id = v_match_id;

    select turn_number
    into v_final_turn
    from public.patxanga_matches
    where id = v_match_id;

    if v_accepted_words < 2 then
        raise exception 'Expected at least 2 accepted words, got %', v_accepted_words;
    end if;

    if v_rejected_words < 1 then
        raise exception 'Expected at least 1 rejected word, got %', v_rejected_words;
    end if;

    if v_passes < 1 then
        raise exception 'Expected at least 1 pass, got %', v_passes;
    end if;

    if v_votes < 1 then
        raise exception 'Expected at least 1 vote, got %', v_votes;
    end if;

    v_metrics := jsonb_build_object(
        'match_id', v_match_id,
        'turn_number', v_final_turn,
        'total_moves', v_total_moves,
        'accepted_place_words', v_accepted_words,
        'rejected_place_words', v_rejected_words,
        'passes', v_passes,
        'exchanges', v_exchanges,
        'votes', v_votes,
        'opening_word', v_opening_result->>'main_word',
        'connected_word', v_connected_result->>'main_word',
        'bot_vote_verdict', v_vote_result->>'bot_verdict',
        'fallback_action', v_pass_result->>'bot_action'
    );

    raise notice 'Bot metrics simulation passed';
    raise notice 'metrics=%', v_metrics;
end $$;
