-- ============================================================
-- PATXANGA - BOT SIMULATION EMPTY RACK END
-- Purpose: deterministic bot scenario for ending a match by empty rack
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_empty_rack_player_id uuid;
    v_other_player_id uuid;
    v_tile_d_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_emptying_rack jsonb;
    v_other_rack jsonb;
    v_result jsonb;
    v_move_id uuid;
    v_empty_player_score integer;
    v_other_player_score integer;
    v_empty_player_rack_size integer;
    v_other_player_rack_size integer;
    v_accepted_move_count integer;
    v_match_finished_replay_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Empty Rack Alpha',
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
        display_name = 'Bot Empty Rack Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Empty Rack Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_empty_rack_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_other_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_empty_rack_player_id
    limit 1;

    if not exists (
        select 1
        from patxanga_players
        where id in (v_empty_rack_player_id, v_other_player_id)
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

    v_emptying_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null)
    );

    v_other_rack := jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_emptying_rack,
        score = 0,
        updated_at = now()
    where id = v_empty_rack_player_id;

    update patxanga_players
    set rack_state = v_other_rack,
        score = 0,
        updated_at = now()
    where id = v_other_player_id;

    v_result := public.submit_patxanga_move(
        v_match_id,
        v_empty_rack_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile_d_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    if v_result->>'status' <> 'success' then
        raise exception 'Expected empty rack move success, got %', v_result;
    end if;

    if v_result->>'move_id' is null then
        raise exception 'Expected move_id in empty rack move result, got %', v_result;
    end if;

    if coalesce((v_result->'end_state'->>'finished')::boolean, false) is not true then
        raise exception 'Expected finished end_state, got %', v_result;
    end if;

    if coalesce((v_result->'end_state'->>'ended_by_empty_rack')::boolean, false) is not true then
        raise exception 'Expected ended_by_empty_rack true, got %', v_result;
    end if;

    if coalesce((v_result->'end_state'->>'ended_by_all_passed')::boolean, true) is not false then
        raise exception 'Expected ended_by_all_passed false, got %', v_result;
    end if;

    if (v_result->'end_state'->>'empty_rack_player_id')::uuid <> v_empty_rack_player_id then
        raise exception 'Expected empty_rack_player_id %, got %', v_empty_rack_player_id, v_result->'end_state'->>'empty_rack_player_id';
    end if;

    if (v_result->'end_state'->>'winner_player_id')::uuid <> v_empty_rack_player_id then
        raise exception 'Expected winner_player_id %, got %', v_empty_rack_player_id, v_result->'end_state'->>'winner_player_id';
    end if;

    if (v_result->'end_state'->>'total_penalties')::integer <> 4 then
        raise exception 'Expected total_penalties 4, got %', v_result;
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'finished' then
        raise exception 'Expected match status finished after empty rack end';
    end if;

    if (select winner_player_id from patxanga_matches where id = v_match_id) <> v_empty_rack_player_id then
        raise exception 'Expected persisted winner to be empty rack player';
    end if;

    if (select finished_at from patxanga_matches where id = v_match_id) is null then
        raise exception 'Expected finished_at to be set';
    end if;

    v_move_id := (v_result->>'move_id')::uuid;

    select score, jsonb_array_length(rack_state)
    into v_empty_player_score, v_empty_player_rack_size
    from patxanga_players
    where id = v_empty_rack_player_id;

    select score, jsonb_array_length(rack_state)
    into v_other_player_score, v_other_player_rack_size
    from patxanga_players
    where id = v_other_player_id;

    if v_empty_player_score <> 10 then
        raise exception 'Expected empty rack player final score 10, got %', v_empty_player_score;
    end if;

    if v_other_player_score <> -4 then
        raise exception 'Expected other player final score -4, got %', v_other_player_score;
    end if;

    if v_empty_player_rack_size <> 0 then
        raise exception 'Expected empty rack player rack size 0, got %', v_empty_player_rack_size;
    end if;

    if v_other_player_rack_size <> 2 then
        raise exception 'Expected other player rack size 2, got %', v_other_player_rack_size;
    end if;

    select count(*)
    into v_accepted_move_count
    from patxanga_moves
    where id = v_move_id
      and match_id = v_match_id
      and player_id = v_empty_rack_player_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'DA'
      and score_total = 6;

    if v_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted DA move, got %', v_accepted_move_count;
    end if;

    select count(*)
    into v_match_finished_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'match_finished'
      and event_payload->>'winner_player_id' = v_empty_rack_player_id::text
      and coalesce((event_payload->>'ended_by_empty_rack')::boolean, false) = true
      and coalesce((event_payload->>'ended_by_all_passed')::boolean, true) = false
      and (event_payload->>'total_penalties')::integer = 4;

    if v_match_finished_replay_count <> 1 then
        raise exception 'Expected exactly 1 match_finished replay event, got %', v_match_finished_replay_count;
    end if;

    raise notice 'Bot empty rack end simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'empty_rack_player_id=%', v_empty_rack_player_id;
    raise notice 'other_player_id=%', v_other_player_id;
    raise notice 'move_result=%', v_result;
    raise notice 'empty_player_score=%', v_empty_player_score;
    raise notice 'other_player_score=%', v_other_player_score;
    raise notice 'match_finished_replay_count=%', v_match_finished_replay_count;
end $$;
