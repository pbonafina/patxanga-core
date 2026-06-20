-- ============================================================
-- PATXANGA - BOT SIMULATION INVALID MOVE EXPECTED ERROR
-- Purpose: deterministic bot scenarios where illegal moves must fail cleanly
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_current_player_id uuid;
    v_other_player_id uuid;
    v_tile_d_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_missing_tile_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_board_before jsonb;
    v_bag_before jsonb;
    v_rack_before jsonb;
    v_status_before text;
    v_current_turn_before uuid;
    v_turn_number_before integer;
    v_move_count_before integer;
    v_replay_count_before integer;
    v_error_message text;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Invalid Missing Tile Alpha',
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
        display_name = 'Bot Invalid Missing Tile Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Invalid Missing Tile Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_other_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_current_player_id
    limit 1;

    if not exists (
        select 1
        from patxanga_players
        where id in (v_current_player_id, v_other_player_id)
          and match_id = v_match_id
          and is_bot = true
        group by match_id
        having count(*) = 2
    ) then
        raise exception 'Expected both players to be bots';
    end if;

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
    where id = v_current_player_id;

    select status, current_turn_player_id, turn_number, board_state, bag_state
    into v_status_before, v_current_turn_before, v_turn_number_before, v_board_before, v_bag_before
    from patxanga_matches
    where id = v_match_id;

    select rack_state
    into v_rack_before
    from patxanga_players
    where id = v_current_player_id;

    select count(*)
    into v_move_count_before
    from patxanga_moves
    where match_id = v_match_id;

    select count(*)
    into v_replay_count_before
    from patxanga_replay_events
    where match_id = v_match_id;

    begin
        perform public.submit_patxanga_move(
            v_match_id,
            v_current_player_id,
            jsonb_build_array(
                jsonb_build_object('tile_id', v_missing_tile_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
                jsonb_build_object('tile_id', v_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
            )
        );
    exception
        when others then
            v_error_message := sqlerrm;
    end;

    if v_error_message is null then
        raise exception 'Expected missing rack tile error, but submit succeeded';
    end if;

    if position('does not belong to player rack' in v_error_message) = 0 then
        raise exception 'Expected missing rack tile ownership error, got %', v_error_message;
    end if;

    if exists (
        select 1
        from patxanga_matches
        where id = v_match_id
          and (
              status <> v_status_before
              or current_turn_player_id <> v_current_turn_before
              or turn_number <> v_turn_number_before
              or board_state <> v_board_before
              or bag_state <> v_bag_before
          )
    ) then
        raise exception 'Match state changed after missing rack tile error';
    end if;

    if exists (
        select 1
        from patxanga_players
        where id = v_current_player_id
          and rack_state <> v_rack_before
    ) then
        raise exception 'Rack state changed after missing rack tile error';
    end if;

    if (
        select count(*)
        from patxanga_moves
        where match_id = v_match_id
    ) <> v_move_count_before then
        raise exception 'Move count changed after missing rack tile error';
    end if;

    if (
        select count(*)
        from patxanga_replay_events
        where match_id = v_match_id
    ) <> v_replay_count_before then
        raise exception 'Replay count changed after missing rack tile error';
    end if;

    raise notice 'Bot invalid missing rack tile simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'current_player_id=%', v_current_player_id;
    raise notice 'missing_tile_id=%', v_missing_tile_id;
    raise notice 'expected_error=%', v_error_message;
end $$;

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_current_player_id uuid;
    v_other_player_id uuid;
    v_tile_d_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_board_before jsonb;
    v_bag_before jsonb;
    v_other_rack_before jsonb;
    v_status_before text;
    v_current_turn_before uuid;
    v_turn_number_before integer;
    v_move_count_before integer;
    v_replay_count_before integer;
    v_error_message text;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Invalid Turn Alpha',
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
        display_name = 'Bot Invalid Turn Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Invalid Turn Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_other_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_current_player_id
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
    where id = v_other_player_id;

    select status, current_turn_player_id, turn_number, board_state, bag_state
    into v_status_before, v_current_turn_before, v_turn_number_before, v_board_before, v_bag_before
    from patxanga_matches
    where id = v_match_id;

    select rack_state
    into v_other_rack_before
    from patxanga_players
    where id = v_other_player_id;

    select count(*)
    into v_move_count_before
    from patxanga_moves
    where match_id = v_match_id;

    select count(*)
    into v_replay_count_before
    from patxanga_replay_events
    where match_id = v_match_id;

    begin
        perform public.submit_patxanga_move(
            v_match_id,
            v_other_player_id,
            jsonb_build_array(
                jsonb_build_object('tile_id', v_tile_d_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
                jsonb_build_object('tile_id', v_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
            )
        );
    exception
        when others then
            v_error_message := sqlerrm;
    end;

    if v_error_message is null then
        raise exception 'Expected not-your-turn error, but submit succeeded';
    end if;

    if position('Not your turn' in v_error_message) = 0 then
        raise exception 'Expected Not your turn error, got %', v_error_message;
    end if;

    if exists (
        select 1
        from patxanga_matches
        where id = v_match_id
          and (
              status <> v_status_before
              or current_turn_player_id <> v_current_turn_before
              or turn_number <> v_turn_number_before
              or board_state <> v_board_before
              or bag_state <> v_bag_before
          )
    ) then
        raise exception 'Match state changed after not-your-turn error';
    end if;

    if exists (
        select 1
        from patxanga_players
        where id = v_other_player_id
          and rack_state <> v_other_rack_before
    ) then
        raise exception 'Rack state changed after not-your-turn error';
    end if;

    if (
        select count(*)
        from patxanga_moves
        where match_id = v_match_id
    ) <> v_move_count_before then
        raise exception 'Move count changed after not-your-turn error';
    end if;

    if (
        select count(*)
        from patxanga_replay_events
        where match_id = v_match_id
    ) <> v_replay_count_before then
        raise exception 'Replay count changed after not-your-turn error';
    end if;

    raise notice 'Bot invalid out-of-turn move simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'current_player_id=%', v_current_player_id;
    raise notice 'out_of_turn_player_id=%', v_other_player_id;
    raise notice 'expected_error=%', v_error_message;
end $$;
