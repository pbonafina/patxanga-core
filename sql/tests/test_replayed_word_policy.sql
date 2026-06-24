-- ============================================================
-- PATXANGA - TEST: replayed word policy
-- Purpose: accepted words cannot be replayed in the same match
-- ============================================================

do $$
declare
    v_user_id uuid := gen_random_uuid();
    v_guest_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_player_id uuid;
    v_bot_player_id uuid;
    v_duplicate_rejected boolean := false;
    v_bot_result jsonb;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user_id,
        p_host_guest_name := 'Replay Human',
        p_language := 'pt-PT',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(v_match_id, v_guest_id, 'Replay Other');
    perform public.start_patxanga_match(v_match_id);

    select id
    into v_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and user_id = v_user_id;

    insert into public.patxanga_moves (
        match_id,
        player_id,
        move_type,
        status,
        main_word,
        secondary_words,
        placed_tiles,
        board_diff,
        used_tiles_from_rack,
        score_total,
        score_breakdown,
        is_dictionary_recognized,
        requires_vote,
        resolved_at
    )
    values (
        v_match_id,
        v_player_id,
        'place_word',
        'accepted',
        'CASA',
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        10,
        '{}'::jsonb,
        true,
        false,
        now()
    );

    begin
        insert into public.patxanga_moves (
            match_id,
            player_id,
            move_type,
            status,
            main_word,
            secondary_words,
            placed_tiles,
            board_diff,
            used_tiles_from_rack,
            score_total,
            score_breakdown,
            is_dictionary_recognized,
            requires_vote,
            resolved_at
        )
        values (
            v_match_id,
            v_player_id,
            'place_word',
            'accepted',
            'CASA',
            '[]'::jsonb,
            '[]'::jsonb,
            '[]'::jsonb,
            '[]'::jsonb,
            8,
            '{}'::jsonb,
            true,
            false,
            now()
        );
    exception
        when others then
            if sqlerrm like 'Word already played in this match%' then
                v_duplicate_rejected := true;
            else
                raise;
            end if;
    end;

    if v_duplicate_rejected is not true then
        raise exception 'Expected duplicate accepted word CASA to be rejected';
    end if;

    v_match_id := public.create_patxanga_match(
        p_host_user_id := gen_random_uuid(),
        p_host_guest_name := 'Replay Bot Host',
        p_language := 'pt-PT',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    v_bot_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Replay Bot',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    update public.patxanga_matches
    set current_turn_player_id = v_bot_player_id,
        updated_at = now()
    where id = v_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'C', 'points', 3, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn')
        ),
        updated_at = now()
    where id = v_bot_player_id;

    insert into public.patxanga_moves (
        match_id,
        player_id,
        move_type,
        status,
        main_word,
        secondary_words,
        placed_tiles,
        board_diff,
        used_tiles_from_rack,
        score_total,
        score_breakdown,
        is_dictionary_recognized,
        requires_vote,
        resolved_at
    )
    values (
        v_match_id,
        v_bot_player_id,
        'place_word',
        'accepted',
        'CASA',
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        10,
        '{}'::jsonb,
        true,
        false,
        now()
    );

    v_bot_result := public.submit_patxanga_easy_bot_turn(
        v_match_id,
        v_bot_player_id
    );

    if v_bot_result->>'bot_action' = 'place_word'
       and v_bot_result->>'main_word' = 'CASA' then
        raise exception 'Expected easy bot not to replay CASA, got %', v_bot_result;
    end if;

    raise notice 'Replayed word policy test passed';
    raise notice 'bot_result=%', v_bot_result;
end $$;
