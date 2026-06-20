-- ============================================================
-- PATXANGA - BOT SIMULATION EXCHANGE TILES
-- Purpose: deterministic bot scenario for exchanging tiles
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_exchange_player_id uuid;
    v_next_player_id uuid;
    v_tile_d_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_result jsonb;
    v_move_id uuid;
    v_bag_before integer;
    v_bag_after integer;
    v_rack_size_after integer;
    v_exchange_move_count integer;
    v_tiles_exchanged_replay_count integer;
    v_turn_changed_replay_count integer;
    v_exchanged_tiles_still_in_rack integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Exchange Alpha',
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
        display_name = 'Bot Exchange Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Exchange Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_exchange_player_id
    from patxanga_matches
    where id = v_match_id;

    if not exists (
        select 1
        from patxanga_players
        where id = v_exchange_player_id
          and match_id = v_match_id
          and is_bot = true
    ) then
        raise exception 'Current player is not a bot: %', v_exchange_player_id;
    end if;

    select id
    into v_next_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_exchange_player_id
    limit 1;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_exchange_player_id;

    select (bag_state->>'remaining')::integer
    into v_bag_before
    from patxanga_matches
    where id = v_match_id;

    if v_bag_before < 2 then
        raise exception 'Expected at least 2 tiles in bag before exchange, got %', v_bag_before;
    end if;

    v_result := public.submit_patxanga_exchange_tiles(
        v_match_id,
        v_exchange_player_id,
        jsonb_build_array(
            v_tile_d_id::text,
            v_tile_a_id::text
        )
    );

    if v_result->>'status' <> 'success' then
        raise exception 'Expected bot exchange success, got %', v_result;
    end if;

    if v_result->>'move_id' is null then
        raise exception 'Expected move_id in bot exchange result, got %', v_result;
    end if;

    if (v_result->>'exchanged_count')::integer <> 2 then
        raise exception 'Expected exchanged_count 2, got %', v_result;
    end if;

    if (v_result->>'next_player')::uuid <> v_next_player_id then
        raise exception 'Expected next player %, got %', v_next_player_id, v_result->>'next_player';
    end if;

    if (v_result->>'turn_number')::integer <> 2 then
        raise exception 'Expected turn_number 2 after exchange, got %', v_result;
    end if;

    v_move_id := (v_result->>'move_id')::uuid;

    select (bag_state->>'remaining')::integer
    into v_bag_after
    from patxanga_matches
    where id = v_match_id;

    if v_bag_after <> v_bag_before then
        raise exception 'Expected bag remaining to stay %, got %', v_bag_before, v_bag_after;
    end if;

    if (select current_turn_player_id from patxanga_matches where id = v_match_id) <> v_next_player_id then
        raise exception 'Expected current turn to advance to next bot';
    end if;

    if (select turn_number from patxanga_matches where id = v_match_id) <> 2 then
        raise exception 'Expected persisted turn_number 2 after exchange';
    end if;

    select jsonb_array_length(rack_state)
    into v_rack_size_after
    from patxanga_players
    where id = v_exchange_player_id;

    if v_rack_size_after <> 7 then
        raise exception 'Expected bot rack size 7 after exchange, got %', v_rack_size_after;
    end if;

    select count(*)
    into v_exchanged_tiles_still_in_rack
    from patxanga_players p
    cross join jsonb_array_elements(p.rack_state) tile
    where p.id = v_exchange_player_id
      and tile->>'id' in (v_tile_d_id::text, v_tile_a_id::text);

    if v_exchanged_tiles_still_in_rack <> 0 then
        raise exception 'Expected exchanged tiles removed from rack, still found %', v_exchanged_tiles_still_in_rack;
    end if;

    select count(*)
    into v_exchange_move_count
    from patxanga_moves
    where id = v_move_id
      and match_id = v_match_id
      and player_id = v_exchange_player_id
      and move_type = 'exchange_tiles'
      and status = 'accepted'
      and score_total = 0
      and used_tiles_from_rack = jsonb_build_array(v_tile_d_id::text, v_tile_a_id::text)
      and score_breakdown->'exchanged_tile_ids' = jsonb_build_array(v_tile_d_id::text, v_tile_a_id::text)
      and (score_breakdown->>'drawn_tiles_count')::integer = 2;

    if v_exchange_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted exchange_tiles move, got %', v_exchange_move_count;
    end if;

    select count(*)
    into v_tiles_exchanged_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'tiles_exchanged'
      and event_payload->>'move_id' = v_move_id::text
      and (event_payload->>'tile_count')::integer = 2;

    if v_tiles_exchanged_replay_count <> 1 then
        raise exception 'Expected exactly 1 tiles_exchanged replay event, got %', v_tiles_exchanged_replay_count;
    end if;

    select count(*)
    into v_turn_changed_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'turn_changed'
      and event_payload->>'current_turn_player_id' = v_next_player_id::text;

    if v_turn_changed_replay_count < 1 then
        raise exception 'Expected at least 1 turn_changed replay event for next player, got %', v_turn_changed_replay_count;
    end if;

    raise notice 'Bot exchange_tiles simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'exchange_player_id=%', v_exchange_player_id;
    raise notice 'next_player_id=%', v_next_player_id;
    raise notice 'exchange_result=%', v_result;
    raise notice 'bag_before=%', v_bag_before;
    raise notice 'bag_after=%', v_bag_after;
    raise notice 'rack_size_after=%', v_rack_size_after;
    raise notice 'exchange_move_count=%', v_exchange_move_count;
    raise notice 'tiles_exchanged_replay_count=%', v_tiles_exchanged_replay_count;
    raise notice 'turn_changed_replay_count=%', v_turn_changed_replay_count;
end $$;
