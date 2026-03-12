-- ============================================================
-- PATXANGA - RPC: submit_patxanga_move()
-- Version: 1.3 (Player-ID aligned)
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
    v_virtual_board jsonb;
    v_words jsonb;
    v_score jsonb;
    v_word jsonb;
    v_is_valid boolean;
    v_next_player uuid;
    v_new_turn integer;
    v_new_rack jsonb;
    v_draw_result jsonb;
    v_drawn_tiles jsonb;
    v_new_bag jsonb;
    v_tiles_to_draw integer;
begin

    -- Lock match
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

    -- Lock player (PLAYER ID, not USER ID)
    select *
    into v_player
    from patxanga_players
    where match_id = p_match_id
      and id = p_player_id
    for update;

    if not found then
        raise exception 'Player not found';
    end if;

    -- Validate ownership
    perform public.validate_patxanga_tile_ownership(
        v_player.rack_state,
        p_placed_tiles
    );

    -- Validate alignment
    perform public.validate_patxanga_move_alignment(
        p_placed_tiles
    );

    -- Build virtual board
    v_virtual_board :=
        public.build_patxanga_virtual_board(
            v_match.board_state,
            p_placed_tiles
        );

    -- Extract words
    v_words :=
        public.extract_patxanga_words(
            v_virtual_board,
            p_placed_tiles
        );

    -- Validate words
    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        v_is_valid :=
            public.validate_word(v_word->>'word');

        if not v_is_valid then
            return jsonb_build_object(
                'status', 'pending_vote',
                'words', v_words
            );
        end if;
    end loop;

    -- Calculate score
    v_score :=
        public.calculate_patxanga_score(
            v_words,
            v_match.board_state,
            p_placed_tiles
        );

    -- Remove tiles from rack
    v_new_rack :=
        public.remove_patxanga_tiles_from_rack(
            v_player.rack_state,
            p_placed_tiles
        );

    -- Draw tiles from bag
    v_tiles_to_draw := 7 - jsonb_array_length(v_new_rack);

    v_draw_result :=
        public.draw_patxanga_tiles_from_bag(
            v_match.bag_state,
            v_tiles_to_draw
        );

    v_drawn_tiles := v_draw_result->'drawn_tiles';
    v_new_bag := v_draw_result->'new_bag_state';

    -- Add drawn tiles to rack
    v_new_rack := v_new_rack || v_drawn_tiles;

    -- Persist board + bag
    update patxanga_matches
    set board_state = v_virtual_board,
        bag_state = v_new_bag
    where id = p_match_id;

    -- Persist player score + rack (PLAYER ID)
    update patxanga_players
    set score = score + (v_score->>'total_score')::integer,
        rack_state = v_new_rack
    where match_id = p_match_id
      and id = p_player_id;

    -- Advance turn: next PLAYER ID
    select id
    into v_next_player
    from patxanga_players
    where match_id = p_match_id
      and turn_order >
          (select turn_order
           from patxanga_players
           where match_id = p_match_id
             and id = p_player_id)
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
        turn_number = v_new_turn
    where id = p_match_id;

    -- Replay
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
            'player_id', p_player_id,
            'words', v_words,
            'score_breakdown', v_score,
            'tiles_drawn', v_drawn_tiles
        ),
        v_new_turn,
        now()
    );

    return jsonb_build_object(
        'status', 'success',
        'score', v_score,
        'next_player', v_next_player,
        'turn_number', v_new_turn
    );

end;
$$;

grant execute on function public.submit_patxanga_move(uuid, uuid, jsonb)
to authenticated, anon;