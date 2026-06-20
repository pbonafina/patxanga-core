-- ============================================================
-- PATXANGA - BOT SIMULATION ALL PASSED END
-- Purpose: deterministic bot scenario for ending a match after all players pass
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_first_pass_player_id uuid;
    v_second_pass_player_id uuid;
    v_first_rack jsonb;
    v_second_rack jsonb;
    v_pass_1_result jsonb;
    v_pass_2_result jsonb;
    v_first_pass_move_id uuid;
    v_second_pass_move_id uuid;
    v_first_player_score integer;
    v_second_player_score integer;
    v_first_player_passed boolean;
    v_second_player_passed boolean;
    v_pass_move_count integer;
    v_turn_passed_replay_count integer;
    v_turn_changed_replay_count integer;
    v_match_finished_replay_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot All Passed Alpha',
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
        bot_profile = 'defensive',
        display_name = 'Bot All Passed Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot All Passed Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'defensive'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_first_pass_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_second_pass_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_first_pass_player_id
    limit 1;

    if not exists (
        select 1
        from patxanga_players
        where id in (v_first_pass_player_id, v_second_pass_player_id)
          and match_id = v_match_id
          and is_bot = true
        group by match_id
        having count(*) = 2
    ) then
        raise exception 'Expected both players to be bots';
    end if;

    update patxanga_matches
    set bag_state = jsonb_build_object(
            'tiles', '[]'::jsonb,
            'remaining', 0
        ),
        updated_at = now()
    where id = v_match_id;

    v_first_rack := jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null)
    );

    v_second_rack := jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_first_rack,
        score = 5,
        has_passed_last_cycle = false,
        updated_at = now()
    where id = v_first_pass_player_id;

    update patxanga_players
    set rack_state = v_second_rack,
        score = 0,
        has_passed_last_cycle = false,
        updated_at = now()
    where id = v_second_pass_player_id;

    v_pass_1_result := public.submit_patxanga_pass_turn(
        v_match_id,
        v_first_pass_player_id
    );

    if v_pass_1_result->>'status' <> 'success' then
        raise exception 'Expected first pass success, got %', v_pass_1_result;
    end if;

    if v_pass_1_result->>'move_id' is null then
        raise exception 'Expected first pass move_id, got %', v_pass_1_result;
    end if;

    if coalesce((v_pass_1_result->'end_state'->>'finished')::boolean, true) is not false then
        raise exception 'Expected first pass not to finish match, got %', v_pass_1_result;
    end if;

    if v_pass_1_result->'end_state'->>'reason' <> 'no_end_condition_met' then
        raise exception 'Expected first pass reason no_end_condition_met, got %', v_pass_1_result;
    end if;

    if (v_pass_1_result->>'next_player')::uuid <> v_second_pass_player_id then
        raise exception 'Expected first pass next player %, got %', v_second_pass_player_id, v_pass_1_result->>'next_player';
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'active' then
        raise exception 'Expected match active after first pass';
    end if;

    v_first_pass_move_id := (v_pass_1_result->>'move_id')::uuid;

    v_pass_2_result := public.submit_patxanga_pass_turn(
        v_match_id,
        v_second_pass_player_id
    );

    if v_pass_2_result->>'status' <> 'success' then
        raise exception 'Expected second pass success, got %', v_pass_2_result;
    end if;

    if v_pass_2_result->>'move_id' is null then
        raise exception 'Expected second pass move_id, got %', v_pass_2_result;
    end if;

    if coalesce((v_pass_2_result->'end_state'->>'finished')::boolean, false) is not true then
        raise exception 'Expected second pass to finish match, got %', v_pass_2_result;
    end if;

    if coalesce((v_pass_2_result->'end_state'->>'ended_by_all_passed')::boolean, false) is not true then
        raise exception 'Expected ended_by_all_passed true, got %', v_pass_2_result;
    end if;

    if coalesce((v_pass_2_result->'end_state'->>'ended_by_empty_rack')::boolean, true) is not false then
        raise exception 'Expected ended_by_empty_rack false, got %', v_pass_2_result;
    end if;

    if v_pass_2_result->'end_state'->>'empty_rack_player_id' is not null then
        raise exception 'Expected empty_rack_player_id null, got %', v_pass_2_result;
    end if;

    if (v_pass_2_result->'end_state'->>'total_penalties')::integer <> 3 then
        raise exception 'Expected total_penalties 3, got %', v_pass_2_result;
    end if;

    if (v_pass_2_result->'end_state'->>'winner_player_id')::uuid <> v_first_pass_player_id then
        raise exception 'Expected winner_player_id %, got %', v_first_pass_player_id, v_pass_2_result->'end_state'->>'winner_player_id';
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'finished' then
        raise exception 'Expected match status finished after all passed';
    end if;

    if (select winner_player_id from patxanga_matches where id = v_match_id) <> v_first_pass_player_id then
        raise exception 'Expected persisted winner to be first pass player';
    end if;

    if (select finished_at from patxanga_matches where id = v_match_id) is null then
        raise exception 'Expected finished_at to be set';
    end if;

    v_second_pass_move_id := (v_pass_2_result->>'move_id')::uuid;

    select score, has_passed_last_cycle
    into v_first_player_score, v_first_player_passed
    from patxanga_players
    where id = v_first_pass_player_id;

    select score, has_passed_last_cycle
    into v_second_player_score, v_second_player_passed
    from patxanga_players
    where id = v_second_pass_player_id;

    if v_first_player_score <> 4 then
        raise exception 'Expected first player final score 4, got %', v_first_player_score;
    end if;

    if v_second_player_score <> -2 then
        raise exception 'Expected second player final score -2, got %', v_second_player_score;
    end if;

    if v_first_player_passed is not true or v_second_player_passed is not true then
        raise exception 'Expected both players marked passed, got first=% second=%', v_first_player_passed, v_second_player_passed;
    end if;

    select count(*)
    into v_pass_move_count
    from patxanga_moves
    where match_id = v_match_id
      and move_type = 'pass'
      and status = 'accepted'
      and id in (v_first_pass_move_id, v_second_pass_move_id);

    if v_pass_move_count <> 2 then
        raise exception 'Expected exactly 2 accepted pass moves, got %', v_pass_move_count;
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
    into v_turn_changed_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'turn_changed'
      and turn_number in (2, 3);

    if v_turn_changed_replay_count <> 2 then
        raise exception 'Expected exactly 2 pass-generated turn_changed replay events, got %', v_turn_changed_replay_count;
    end if;

    select count(*)
    into v_match_finished_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'match_finished'
      and event_payload->>'winner_player_id' = v_first_pass_player_id::text
      and coalesce((event_payload->>'ended_by_all_passed')::boolean, false) = true
      and coalesce((event_payload->>'ended_by_empty_rack')::boolean, true) = false
      and event_payload->>'empty_rack_player_id' is null
      and (event_payload->>'total_penalties')::integer = 3;

    if v_match_finished_replay_count <> 1 then
        raise exception 'Expected exactly 1 match_finished replay event, got %', v_match_finished_replay_count;
    end if;

    raise notice 'Bot all passed end simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'first_pass_player_id=%', v_first_pass_player_id;
    raise notice 'second_pass_player_id=%', v_second_pass_player_id;
    raise notice 'pass_1_result=%', v_pass_1_result;
    raise notice 'pass_2_result=%', v_pass_2_result;
    raise notice 'first_player_score=%', v_first_player_score;
    raise notice 'second_player_score=%', v_second_player_score;
    raise notice 'match_finished_replay_count=%', v_match_finished_replay_count;
end $$;
