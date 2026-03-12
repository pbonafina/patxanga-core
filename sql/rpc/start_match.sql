-- ============================================================
-- PATXANGA - RPC: start_patxanga_match()
-- Version: 1.1
-- Mode: Synchronous
-- ============================================================

create or replace function public.start_patxanga_match(
    p_match_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player_count integer;

    v_bag jsonb;
    v_tiles jsonb;
    v_total_tiles integer;

    v_board jsonb;

    v_remaining_tiles jsonb;
    v_current_index integer := 0;

    v_player record;
    v_shuffled_player_ids uuid[];
    v_first_player_id uuid;

    v_player_rack jsonb;
    i integer;
begin

    -- =============================
    -- Validate match
    -- =============================

    select *
    into v_match
    from patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'waiting' then
        raise exception 'Match is not in waiting status';
    end if;

    if v_match.match_mode <> 'synchronous' then
        raise exception 'Only synchronous matches supported in v1.1';
    end if;

    -- =============================
    -- Validate player count
    -- =============================

    select count(*)
    into v_player_count
    from patxanga_players
    where match_id = p_match_id;

    if v_player_count < 2 then
        raise exception 'At least 2 players are required to start';
    end if;

    if v_player_count > v_match.max_players then
        raise exception 'Player count exceeds match capacity';
    end if;

    -- =============================
    -- Initialize bag
    -- =============================

    v_bag := public.initialize_patxanga_bag(v_match.language);
    v_tiles := v_bag->'tiles';
    v_total_tiles := jsonb_array_length(v_tiles);

    if v_total_tiles < (v_player_count * 7) then
        raise exception 'Not enough tiles to start match';
    end if;

    -- =============================
    -- Initialize board
    -- =============================

    v_board := public.initialize_patxanga_board();

    -- =============================
    -- Shuffle player order
    -- =============================

    select array_agg(id order by random())
    into v_shuffled_player_ids
    from patxanga_players
    where match_id = p_match_id;

    if v_shuffled_player_ids is null
       or array_length(v_shuffled_player_ids, 1) is null then
        raise exception 'Could not determine player order';
    end if;

    -- =============================
    -- Update turn_order for players
    -- =============================

    for i in 1..array_length(v_shuffled_player_ids, 1) loop
        update patxanga_players
        set
            turn_order = i,
            updated_at = now()
        where id = v_shuffled_player_ids[i];
    end loop;

    v_first_player_id := v_shuffled_player_ids[1];

    -- =============================
    -- Distribute 7 tiles per player
    -- =============================

    for v_player in
        select id
        from patxanga_players
        where match_id = p_match_id
        order by turn_order
    loop

        select jsonb_agg(tile)
        into v_player_rack
        from (
            select value as tile
            from jsonb_array_elements(v_tiles)
            with ordinality
            where ordinality > v_current_index
              and ordinality <= v_current_index + 7
            order by ordinality
        ) rack_slice;

        if v_player_rack is null then
            v_player_rack := '[]'::jsonb;
        end if;

        update patxanga_players
        set
            rack_state = v_player_rack,
            updated_at = now()
        where id = v_player.id;

        insert into patxanga_replay_events (
            match_id,
            event_type,
            event_payload,
            turn_number,
            created_at
        )
        values (
            p_match_id,
            'tiles_drawn',
            jsonb_build_object(
                'player_id', v_player.id,
                'tile_count', 7
            ),
            1,
            now()
        );

        v_current_index := v_current_index + 7;
    end loop;

    -- =============================
    -- Remaining bag
    -- =============================

    select jsonb_agg(tile)
    into v_remaining_tiles
    from (
        select value as tile
        from jsonb_array_elements(v_tiles)
        with ordinality
        where ordinality > v_current_index
        order by ordinality
    ) remaining_slice;

    if v_remaining_tiles is null then
        v_remaining_tiles := '[]'::jsonb;
    end if;

    -- =============================
    -- Activate match
    -- =============================

    update patxanga_matches
    set
        status = 'active',
        board_state = v_board,
        bag_state = jsonb_build_object(
            'tiles', v_remaining_tiles,
            'remaining', jsonb_array_length(v_remaining_tiles)
        ),
        current_turn_player_id = v_first_player_id,
        turn_number = 1,
        started_at = now(),
        updated_at = now()
    where id = p_match_id;

    -- =============================
    -- Replay events
    -- =============================

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        p_match_id,
        'match_started',
        jsonb_build_object(
            'player_count', v_player_count,
            'first_player_id', v_first_player_id
        ),
        1,
        now()
    );

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        p_match_id,
        'turn_changed',
        jsonb_build_object(
            'current_turn_player_id', v_first_player_id
        ),
        1,
        now()
    );

    -- =============================
    -- Return summary
    -- =============================

    return jsonb_build_object(
        'match_id', p_match_id,
        'status', 'active',
        'turn_number', 1,
        'current_turn_player_id', v_first_player_id,
        'remaining_tiles', jsonb_array_length(v_remaining_tiles)
    );

end;
$$;

grant execute on function public.start_patxanga_match(uuid)
to authenticated, anon;