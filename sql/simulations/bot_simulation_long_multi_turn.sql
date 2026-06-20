-- ============================================================
-- PATXANGA - BOT SIMULATION LONG MULTI TURN
-- Purpose: deterministic multi-action bot-vs-bot integration scenario
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_first_player_id uuid;
    v_second_player_id uuid;
    v_bot_count integer;

    v_opening_tile_d_id uuid := gen_random_uuid();
    v_opening_tile_a_id uuid := gen_random_uuid();
    v_exchange_tile_s_id uuid := gen_random_uuid();
    v_exchange_tile_e_id uuid := gen_random_uuid();
    v_bridge_tile_x_id uuid := gen_random_uuid();
    v_bridge_tile_z_id uuid := gen_random_uuid();

    v_first_rack jsonb;
    v_second_exchange_rack jsonb;
    v_second_bridge_rack jsonb;

    v_opening_result jsonb;
    v_exchange_result jsonb;
    v_first_pass_result jsonb;
    v_bridge_result jsonb;
    v_vote_result jsonb;
    v_second_pass_result jsonb;
    v_pending_move_id uuid;

    v_bag_after_start integer;
    v_bag_after_opening integer;
    v_bag_after_exchange integer;
    v_first_score integer;
    v_second_score integer;
    v_first_player_passed boolean;
    v_second_player_passed boolean;
    v_match_status text;
    v_current_turn_player_id uuid;
    v_turn_number integer;

    v_total_move_count integer;
    v_accepted_place_word_count integer;
    v_rejected_place_word_count integer;
    v_exchange_move_count integer;
    v_pass_move_count integer;
    v_vote_count integer;
    v_move_submitted_replay_count integer;
    v_tiles_exchanged_replay_count integer;
    v_turn_passed_replay_count integer;
    v_vote_cast_replay_count integer;
    v_word_rejected_replay_count integer;
    v_turn_changed_replay_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Long Alpha',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_host_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Long Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Long Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'defensive'
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

    select current_turn_player_id, (bag_state->>'remaining')::integer
    into v_first_player_id, v_bag_after_start
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_second_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_first_player_id
    limit 1;

    if v_bag_after_start < 4 then
        raise exception 'Expected at least 4 tiles in bag after start, got %', v_bag_after_start;
    end if;

    v_first_rack := jsonb_build_array(
        jsonb_build_object('id', v_opening_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_opening_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_first_rack,
        updated_at = now()
    where id = v_first_player_id;

    v_opening_result := public.submit_patxanga_move(
        v_match_id,
        v_first_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_opening_tile_d_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_opening_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    if v_opening_result->>'status' <> 'success' then
        raise exception 'Expected opening move success, got %', v_opening_result;
    end if;

    if v_opening_result->>'move_id' is null then
        raise exception 'Expected opening move_id, got %', v_opening_result;
    end if;

    if (v_opening_result->'score'->>'total_score')::integer <> 6 then
        raise exception 'Expected opening DA score 6, got %', v_opening_result;
    end if;

    if (v_opening_result->>'next_player')::uuid <> v_second_player_id then
        raise exception 'Expected opening next player %, got %', v_second_player_id, v_opening_result->>'next_player';
    end if;

    if (v_opening_result->>'turn_number')::integer <> 2 then
        raise exception 'Expected opening turn_number 2, got %', v_opening_result;
    end if;

    select (bag_state->>'remaining')::integer
    into v_bag_after_opening
    from patxanga_matches
    where id = v_match_id;

    if v_bag_after_opening <> v_bag_after_start - 2 then
        raise exception 'Expected bag remaining % after opening, got %', v_bag_after_start - 2, v_bag_after_opening;
    end if;

    if (select board_state #>> '{7,7,tile,letter}' from patxanga_matches where id = v_match_id) <> 'D' then
        raise exception 'Expected D at board center after opening';
    end if;

    if (select board_state #>> '{7,8,tile,letter}' from patxanga_matches where id = v_match_id) <> 'A' then
        raise exception 'Expected A next to board center after opening';
    end if;

    v_second_exchange_rack := jsonb_build_array(
        jsonb_build_object('id', v_exchange_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_exchange_tile_e_id::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'T', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'L', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_second_exchange_rack,
        updated_at = now()
    where id = v_second_player_id;

    v_exchange_result := public.submit_patxanga_exchange_tiles(
        v_match_id,
        v_second_player_id,
        jsonb_build_array(v_exchange_tile_s_id::text, v_exchange_tile_e_id::text)
    );

    if v_exchange_result->>'status' <> 'success' then
        raise exception 'Expected exchange success, got %', v_exchange_result;
    end if;

    if (v_exchange_result->>'exchanged_count')::integer <> 2 then
        raise exception 'Expected exchanged_count 2, got %', v_exchange_result;
    end if;

    if (v_exchange_result->>'next_player')::uuid <> v_first_player_id then
        raise exception 'Expected exchange next player %, got %', v_first_player_id, v_exchange_result->>'next_player';
    end if;

    if (v_exchange_result->>'turn_number')::integer <> 3 then
        raise exception 'Expected exchange turn_number 3, got %', v_exchange_result;
    end if;

    select (bag_state->>'remaining')::integer
    into v_bag_after_exchange
    from patxanga_matches
    where id = v_match_id;

    if v_bag_after_exchange <> v_bag_after_opening then
        raise exception 'Expected exchange to preserve bag remaining %, got %', v_bag_after_opening, v_bag_after_exchange;
    end if;

    v_first_pass_result := public.submit_patxanga_pass_turn(
        v_match_id,
        v_first_player_id
    );

    if v_first_pass_result->>'status' <> 'success' then
        raise exception 'Expected first pass success, got %', v_first_pass_result;
    end if;

    if (v_first_pass_result->>'next_player')::uuid <> v_second_player_id then
        raise exception 'Expected first pass next player %, got %', v_second_player_id, v_first_pass_result->>'next_player';
    end if;

    if (v_first_pass_result->>'turn_number')::integer <> 4 then
        raise exception 'Expected first pass turn_number 4, got %', v_first_pass_result;
    end if;

    if coalesce((v_first_pass_result->'end_state'->>'finished')::boolean, true) is not false then
        raise exception 'Expected first pass not to finish match, got %', v_first_pass_result;
    end if;

    if v_first_pass_result->'end_state'->>'reason' <> 'bag_not_empty' then
        raise exception 'Expected first pass end_state bag_not_empty, got %', v_first_pass_result;
    end if;

    v_second_bridge_rack := jsonb_build_array(
        jsonb_build_object('id', v_bridge_tile_x_id::text, 'letter', 'X', 'points', 8, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_bridge_tile_z_id::text, 'letter', 'Z', 'points', 10, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'T', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_second_bridge_rack,
        updated_at = now()
    where id = v_second_player_id;

    v_bridge_result := public.submit_patxanga_move(
        v_match_id,
        v_second_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_bridge_tile_x_id::text, 'row', 7, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_bridge_tile_z_id::text, 'row', 9, 'col', 9, 'declared_letter', null)
        )
    );

    if v_bridge_result->>'status' <> 'pending_vote' then
        raise exception 'Expected bridge move pending_vote, got %', v_bridge_result;
    end if;

    if v_bridge_result->>'main_word' <> 'XAZ' then
        raise exception 'Expected bridge main_word XAZ, got %', v_bridge_result;
    end if;

    if v_bridge_result->>'match_status' <> 'voting' then
        raise exception 'Expected bridge match_status voting, got %', v_bridge_result;
    end if;

    v_pending_move_id := (v_bridge_result->>'move_id')::uuid;

    if v_pending_move_id is null then
        raise exception 'Expected bridge pending move_id, got %', v_bridge_result;
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'voting' then
        raise exception 'Expected match status voting after bridge pending_vote';
    end if;

    if (select board_state #>> '{6,8,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected upper bridge tile not to be applied while pending_vote';
    end if;

    if (select board_state #>> '{8,8,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected lower bridge tile not to be applied while pending_vote';
    end if;

    v_vote_result := public.submit_patxanga_vote(
        v_pending_move_id,
        v_first_player_id,
        true
    );

    if v_vote_result->>'status' <> 'rejected' then
        raise exception 'Expected bridge vote rejection, got %', v_vote_result;
    end if;

    if (v_vote_result->>'current_turn_player_id')::uuid <> v_second_player_id then
        raise exception 'Expected turn to return to bridge author %, got %', v_second_player_id, v_vote_result;
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'active' then
        raise exception 'Expected match active after bridge rejection';
    end if;

    if (select current_turn_player_id from patxanga_matches where id = v_match_id) <> v_second_player_id then
        raise exception 'Expected current turn to be bridge author after rejection';
    end if;

    if (select board_state #>> '{6,8,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected upper bridge tile not to be applied after rejection';
    end if;

    if (select board_state #>> '{8,8,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected lower bridge tile not to be applied after rejection';
    end if;

    v_second_pass_result := public.submit_patxanga_pass_turn(
        v_match_id,
        v_second_player_id
    );

    if v_second_pass_result->>'status' <> 'success' then
        raise exception 'Expected second pass success, got %', v_second_pass_result;
    end if;

    if (v_second_pass_result->>'next_player')::uuid <> v_first_player_id then
        raise exception 'Expected second pass next player %, got %', v_first_player_id, v_second_pass_result->>'next_player';
    end if;

    if (v_second_pass_result->>'turn_number')::integer <> 5 then
        raise exception 'Expected second pass turn_number 5, got %', v_second_pass_result;
    end if;

    if coalesce((v_second_pass_result->'end_state'->>'finished')::boolean, true) is not false then
        raise exception 'Expected second pass not to finish match with bag not empty, got %', v_second_pass_result;
    end if;

    if v_second_pass_result->'end_state'->>'reason' <> 'bag_not_empty' then
        raise exception 'Expected second pass end_state bag_not_empty, got %', v_second_pass_result;
    end if;

    select status, current_turn_player_id, turn_number
    into v_match_status, v_current_turn_player_id, v_turn_number
    from patxanga_matches
    where id = v_match_id;

    if v_match_status <> 'active' then
        raise exception 'Expected final match status active, got %', v_match_status;
    end if;

    if v_current_turn_player_id <> v_first_player_id then
        raise exception 'Expected final current turn player %, got %', v_first_player_id, v_current_turn_player_id;
    end if;

    if v_turn_number <> 5 then
        raise exception 'Expected final turn_number 5, got %', v_turn_number;
    end if;

    select score, has_passed_last_cycle
    into v_first_score, v_first_player_passed
    from patxanga_players
    where id = v_first_player_id;

    select score, has_passed_last_cycle
    into v_second_score, v_second_player_passed
    from patxanga_players
    where id = v_second_player_id;

    if v_first_score <> 6 then
        raise exception 'Expected first bot score 6, got %', v_first_score;
    end if;

    if v_second_score <> 0 then
        raise exception 'Expected second bot score 0, got %', v_second_score;
    end if;

    if v_first_player_passed is not true or v_second_player_passed is not true then
        raise exception 'Expected both bots marked passed, got first=% second=%', v_first_player_passed, v_second_player_passed;
    end if;

    select count(*)
    into v_total_move_count
    from patxanga_moves
    where match_id = v_match_id;

    if v_total_move_count <> 5 then
        raise exception 'Expected exactly 5 persisted moves, got %', v_total_move_count;
    end if;

    select count(*)
    into v_accepted_place_word_count
    from patxanga_moves
    where match_id = v_match_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'DA'
      and score_total = 6;

    if v_accepted_place_word_count <> 1 then
        raise exception 'Expected exactly 1 accepted DA move, got %', v_accepted_place_word_count;
    end if;

    select count(*)
    into v_rejected_place_word_count
    from patxanga_moves
    where id = v_pending_move_id
      and match_id = v_match_id
      and player_id = v_second_player_id
      and move_type = 'place_word'
      and status = 'rejected'
      and main_word = 'XAZ'
      and score_total = 0
      and is_dictionary_recognized = false
      and requires_vote = true;

    if v_rejected_place_word_count <> 1 then
        raise exception 'Expected exactly 1 rejected XAZ move, got %', v_rejected_place_word_count;
    end if;

    select count(*)
    into v_exchange_move_count
    from patxanga_moves
    where match_id = v_match_id
      and player_id = v_second_player_id
      and move_type = 'exchange_tiles'
      and status = 'accepted'
      and used_tiles_from_rack = jsonb_build_array(v_exchange_tile_s_id::text, v_exchange_tile_e_id::text);

    if v_exchange_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted exchange move, got %', v_exchange_move_count;
    end if;

    select count(*)
    into v_pass_move_count
    from patxanga_moves
    where match_id = v_match_id
      and move_type = 'pass'
      and status = 'accepted';

    if v_pass_move_count <> 2 then
        raise exception 'Expected exactly 2 accepted pass moves, got %', v_pass_move_count;
    end if;

    select count(*)
    into v_vote_count
    from patxanga_votes
    where move_id = v_pending_move_id
      and match_id = v_match_id
      and voter_player_id = v_first_player_id
      and vote_reject = true;

    if v_vote_count <> 1 then
        raise exception 'Expected exactly 1 rejecting vote, got %', v_vote_count;
    end if;

    select count(*)
    into v_move_submitted_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'move_submitted';

    if v_move_submitted_replay_count <> 1 then
        raise exception 'Expected exactly 1 move_submitted replay event, got %', v_move_submitted_replay_count;
    end if;

    select count(*)
    into v_tiles_exchanged_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'tiles_exchanged';

    if v_tiles_exchanged_replay_count <> 1 then
        raise exception 'Expected exactly 1 tiles_exchanged replay event, got %', v_tiles_exchanged_replay_count;
    end if;

    select count(*)
    into v_turn_passed_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'turn_passed';

    if v_turn_passed_replay_count <> 2 then
        raise exception 'Expected exactly 2 turn_passed replay events, got %', v_turn_passed_replay_count;
    end if;

    select count(*)
    into v_vote_cast_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'vote_cast';

    if v_vote_cast_replay_count <> 1 then
        raise exception 'Expected exactly 1 vote_cast replay event, got %', v_vote_cast_replay_count;
    end if;

    select count(*)
    into v_word_rejected_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'word_rejected';

    if v_word_rejected_replay_count <> 2 then
        raise exception 'Expected exactly 2 word_rejected replay events, got %', v_word_rejected_replay_count;
    end if;

    select count(*)
    into v_turn_changed_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'turn_changed';

    if v_turn_changed_replay_count < 3 then
        raise exception 'Expected at least 3 turn_changed replay events, got %', v_turn_changed_replay_count;
    end if;

    raise notice 'Bot long multi-turn simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'first_bot_player_id=%', v_first_player_id;
    raise notice 'second_bot_player_id=%', v_second_player_id;
    raise notice 'opening_result=%', v_opening_result;
    raise notice 'exchange_result=%', v_exchange_result;
    raise notice 'first_pass_result=%', v_first_pass_result;
    raise notice 'bridge_result=%', v_bridge_result;
    raise notice 'vote_result=%', v_vote_result;
    raise notice 'second_pass_result=%', v_second_pass_result;
    raise notice 'bag_after_start=%', v_bag_after_start;
    raise notice 'bag_after_opening=%', v_bag_after_opening;
    raise notice 'bag_after_exchange=%', v_bag_after_exchange;
    raise notice 'total_move_count=%', v_total_move_count;
    raise notice 'word_rejected_replay_count=%', v_word_rejected_replay_count;
end $$;
