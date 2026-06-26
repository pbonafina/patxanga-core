-- ============================================================
-- PATXANGA - TEST: skip-turn advancement
-- Purpose: accepted moves using SKIP must skip the next player and return
-- control to the following eligible player.
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_opening_player_id uuid;
    v_skipped_player_id uuid;
    v_l uuid := gen_random_uuid();
    v_a uuid := gen_random_uuid();
    v_d uuid := gen_random_uuid();
    v_o uuid := gen_random_uuid();
    v_skip uuid := gen_random_uuid();
    v_result jsonb;
    v_current_turn_player_id uuid;
    v_turn_number integer;
    v_target_player_skipped_id uuid;
begin
    insert into public.patxanga_dictionary (
        language,
        word_original,
        word_normalized,
        source,
        is_active
    )
    values (
        'pt-PT',
        'LADOS',
        public.normalize_patxanga_word('LADOS'),
        'skip_turn_test',
        true
    )
    on conflict (language, word_normalized) do update
    set word_original = excluded.word_original,
        source = excluded.source,
        is_active = excluded.is_active,
        updated_at = now();

    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'pt-PT',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_opening_player_id
    from public.patxanga_matches
    where id = v_match_id;

    select id
    into v_skipped_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and id <> v_opening_player_id
    order by turn_order
    limit 1;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_l::text, 'letter', 'L', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_a::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_d::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_o::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_skip::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'N', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_opening_player_id;

    v_result := public.submit_patxanga_move(
        v_match_id,
        v_opening_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_l::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_d::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_o::text, 'row', 8, 'col', 11, 'declared_letter', null),
            jsonb_build_object('tile_id', v_skip::text, 'row', 8, 'col', 12, 'declared_letter', 'S')
        )
    );

    if v_result->>'status' <> 'success' then
        raise exception 'Expected SKIP move success, got %', v_result;
    end if;

    select current_turn_player_id, turn_number
    into v_current_turn_player_id, v_turn_number
    from public.patxanga_matches
    where id = v_match_id;

    if v_current_turn_player_id <> v_opening_player_id then
        raise exception 'Expected turn to return to opening player %, got %',
            v_opening_player_id,
            v_current_turn_player_id;
    end if;

    if v_turn_number <> 3 then
        raise exception 'Expected turn_number 3 after skipped player, got %', v_turn_number;
    end if;

    select target_player_skipped_id
    into v_target_player_skipped_id
    from public.patxanga_moves
    where match_id = v_match_id
      and move_type = 'place_word'
      and status = 'accepted'
    order by created_at desc
    limit 1;

    if v_target_player_skipped_id <> v_skipped_player_id then
        raise exception 'Expected skipped player %, got %',
            v_skipped_player_id,
            v_target_player_skipped_id;
    end if;

    if not exists (
        select 1
        from public.patxanga_replay_events
        where match_id = v_match_id
          and event_type = 'turn_skipped'
    ) then
        raise exception 'Expected turn_skipped replay event';
    end if;
end;
$$;
