-- ============================================================
-- PATXANGA - RPC: submit_patxanga_move()
-- Version: 1.7 (Persistent pending_vote + game end)
-- ============================================================

create or replace function public.submit_patxanga_move(
    p_match_id uuid,
    p_player_id uuid,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player record;
    v_hydrated_placed_tiles jsonb;
    v_virtual_board jsonb;
    v_words jsonb;
    v_score jsonb;
    v_word jsonb;
    v_is_valid boolean;
    v_has_invalid_word boolean := false;
    v_main_word text := null;
    v_secondary_words jsonb := '[]'::jsonb;
    v_pending_move_id uuid;
    v_accepted_move_id uuid;
    v_next_player uuid;
    v_new_turn integer;
    v_new_rack jsonb;
    v_draw_result jsonb;
    v_drawn_tiles jsonb;
    v_new_bag jsonb;
    v_tiles_to_draw integer;
    v_end_result jsonb;
begin

    select *
    into v_match
    from patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'active' then
        raise exception 'Match not active';
    end if;

    if v_match.current_turn_player_id <> p_player_id then
        raise exception 'Not your turn';
    end if;

    select *
    into v_player
    from patxanga_players
    where match_id = p_match_id
      and id = p_player_id
    for update;

    if not found then
        raise exception 'Player not found';
    end if;

    perform public.validate_patxanga_tile_ownership(
        v_player.rack_state,
        p_placed_tiles
    );

    perform public.validate_patxanga_move_alignment(
        v_match.board_state,
        p_placed_tiles
    );

    v_hydrated_placed_tiles :=
        public.hydrate_patxanga_placed_tiles(
            v_player.rack_state,
            p_placed_tiles
        );

    v_virtual_board :=
        public.build_patxanga_virtual_board(
            v_match.board_state,
            v_hydrated_placed_tiles
        );

    v_words :=
        public.extract_patxanga_words(
            v_virtual_board,
            v_hydrated_placed_tiles
        );

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        if (v_word->>'type') = 'main' then
            v_main_word := v_word->>'word';
        else
            v_secondary_words := v_secondary_words || jsonb_build_array(v_word);
        end if;
    end loop;

    if char_length(coalesce(v_main_word, '')) < 2 then
        raise exception 'Main word must have at least 2 letters';
    end if;

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        v_is_valid := public.validate_word(v_word->>'word');

        if not v_is_valid then
            v_has_invalid_word := true;
            exit;
        end if;
    end loop;

    -- =========================================
    -- PERSISTENT PENDING_VOTE BRANCH
    -- =========================================
    if v_has_invalid_word then
        insert into patxanga_moves (
            match_id,
            player_id,
            move_type,
            status,
            main_word,
            secondary_words,
            placed_tiles,
            board_diff,
            used_tiles_from_rack,
            used_blank_tile,
            used_skip_tile,
            used_patxanga_real,
            patxanga_real_target_word,
            target_player_skipped_id,
            score_total,
            score_breakdown,
            is_dictionary_recognized,
            requires_vote,
            created_at,
            resolved_at
        )
        values (
            p_match_id,
            p_player_id,
            'place_word',
            'pending_vote',
            v_main_word,
            v_secondary_words,
            p_placed_tiles,
            v_hydrated_placed_tiles,
            p_placed_tiles,
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') = 'wildcard'
            ),
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') = 'skip_turn'
            ),
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') in ('patxanga_real', 'PATXANGA_REAL')
            ),
            null,
            null,
            0,
            jsonb_build_object(
                'status', 'pending_vote',
                'words', v_words
            ),
            false,
            true,
            now(),
            null
        )
        returning id into v_pending_move_id;

        update patxanga_matches
        set status = 'voting',
            updated_at = now()
        where id = p_match_id;

        insert into patxanga_replay_events (
            match_id,
            event_type,
            event_payload,
            turn_number,
            created_at
        )
        values (
            p_match_id,
            'word_rejected',
            jsonb_build_object(
                'move_id', v_pending_move_id,
                'player_id', p_player_id,
                'main_word', v_main_word,
                'words', v_words,
                'requires_vote', true
            ),
            v_match.turn_number,
            now()
        );

        return jsonb_build_object(
            'status', 'pending_vote',
            'move_id', v_pending_move_id,
            'main_word', v_main_word,
            'words', v_words,
            'match_status', 'voting'
        );
    end if;

    -- =========================================
    -- SUCCESS BRANCH
    -- =========================================

    v_score :=
        public.calculate_patxanga_score(
            v_words,
            v_match.board_state,
            p_placed_tiles
        );

    v_new_rack :=
        public.remove_patxanga_tiles_from_rack(
            v_player.rack_state,
            p_placed_tiles
        );

    v_tiles_to_draw := 7 - jsonb_array_length(v_new_rack);

    v_draw_result :=
        public.draw_patxanga_tiles_from_bag(
            v_match.bag_state,
            v_tiles_to_draw
        );

    v_drawn_tiles := v_draw_result->'drawn_tiles';
    v_new_bag := v_draw_result->'new_bag_state';

    v_new_rack := v_new_rack || v_drawn_tiles;

    insert into patxanga_moves (
        match_id,
        player_id,
        move_type,
        status,
        main_word,
        secondary_words,
        placed_tiles,
        board_diff,
        used_tiles_from_rack,
        used_blank_tile,
        used_skip_tile,
        used_patxanga_real,
        patxanga_real_target_word,
        target_player_skipped_id,
        score_total,
        score_breakdown,
        is_dictionary_recognized,
        requires_vote,
        created_at,
        resolved_at
    )
    values (
        p_match_id,
        p_player_id,
        'place_word',
        'accepted',
        v_main_word,
        v_secondary_words,
        p_placed_tiles,
        v_hydrated_placed_tiles,
        p_placed_tiles,
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') = 'wildcard'
        ),
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') = 'skip_turn'
        ),
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') in ('patxanga_real', 'PATXANGA_REAL')
        ),
        null,
        null,
        (v_score->>'total_score')::integer,
        jsonb_build_object(
            'words', v_words,
            'final_score', v_score
        ),
        true,
        false,
        now(),
        now()
    )
    returning id into v_accepted_move_id;

    update patxanga_matches
    set board_state = v_virtual_board,
        bag_state = v_new_bag,
        updated_at = now()
    where id = p_match_id;

    update patxanga_players
    set score = score + (v_score->>'total_score')::integer,
        rack_state = v_new_rack,
        has_passed_last_cycle = false,
        updated_at = now()
    where match_id = p_match_id
      and id = p_player_id;

    -- valid move breaks stagnation cycle for everyone
    update patxanga_players
    set has_passed_last_cycle = false,
        updated_at = now()
    where match_id = p_match_id;

    select id
    into v_next_player
    from patxanga_players
    where match_id = p_match_id
      and turn_order >
          (
              select turn_order
              from patxanga_players
              where match_id = p_match_id
                and id = p_player_id
          )
    order by turn_order
    limit 1;

    if v_next_player is null then
        select id
        into v_next_player
        from patxanga_players
        where match_id = p_match_id
        order by turn_order
        limit 1;
    end if;

    v_new_turn := v_match.turn_number + 1;

    update patxanga_matches
    set current_turn_player_id = v_next_player,
        turn_number = v_new_turn,
        updated_at = now()
    where id = p_match_id;

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        p_match_id,
        'move_submitted',
        jsonb_build_object(
            'move_id', v_accepted_move_id,
            'player_id', p_player_id,
            'placed_tiles', p_placed_tiles,
            'words', v_words,
            'score_breakdown', v_score,
            'tiles_drawn', v_drawn_tiles,
            'next_player', v_next_player
        ),
        v_new_turn,
        now()
    );

    -- Evaluate match end after successful move
    v_end_result := public.evaluate_patxanga_match_end(p_match_id);

    return jsonb_build_object(
        'status', 'success',
        'move_id', v_accepted_move_id,
        'score', v_score,
        'next_player', v_next_player,
        'turn_number', v_new_turn,
        'end_state', v_end_result
    );

end;
$$;

grant execute on function public.submit_patxanga_move(uuid, uuid, jsonb)
to authenticated, anon;
