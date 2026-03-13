-- ============================================================
-- PATXANGA - RPC: submit_patxanga_exchange_tiles()
-- Version: 1.0
-- Purpose: Exchange tiles and pass turn
-- ============================================================

create or replace function public.submit_patxanga_exchange_tiles(
    p_match_id uuid,
    p_player_id uuid,
    p_tile_ids jsonb
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player record;
    v_tile_count integer;
    v_tile_id_text text;
    v_new_rack jsonb;
    v_bag_tiles jsonb;
    v_returned_tiles jsonb := '[]'::jsonb;
    v_rack_tile jsonb;
    v_new_bag_state jsonb;
    v_draw_result jsonb;
    v_drawn_tiles jsonb;
    v_final_rack jsonb;
    v_next_player uuid;
    v_new_turn integer;
    v_move_id uuid;
begin

    if p_tile_ids is null then
        raise exception 'Tile ids cannot be null';
    end if;

    if jsonb_typeof(p_tile_ids) <> 'array' then
        raise exception 'Tile ids must be a json array';
    end if;

    v_tile_count := jsonb_array_length(p_tile_ids);

    if v_tile_count < 1 then
        raise exception 'At least one tile must be exchanged';
    end if;

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

    -- Lock player
    select *
    into v_player
    from patxanga_players
    where id = p_player_id
      and match_id = p_match_id
    for update;

    if not found then
        raise exception 'Player not found';
    end if;

    if jsonb_array_length(v_player.rack_state) < v_tile_count then
        raise exception 'Not enough tiles in rack to exchange';
    end if;

    -- Build returned tile objects from rack
    for v_tile_id_text in
        select value #>> '{}'
        from jsonb_array_elements(p_tile_ids)
    loop
        select value
        into v_rack_tile
        from jsonb_array_elements(v_player.rack_state)
        where value->>'id' = v_tile_id_text
        limit 1;

        if v_rack_tile is null then
            raise exception 'Tile % not found in rack', v_tile_id_text;
        end if;

        v_returned_tiles := v_returned_tiles || jsonb_build_array(v_rack_tile);
    end loop;

    -- Remove exchanged tiles from rack
    v_new_rack := v_player.rack_state;

    for v_tile_id_text in
        select value #>> '{}'
        from jsonb_array_elements(p_tile_ids)
    loop
        select coalesce(jsonb_agg(value), '[]'::jsonb)
        into v_new_rack
        from jsonb_array_elements(v_new_rack)
        where value->>'id' <> v_tile_id_text;
    end loop;

    -- Put returned tiles back into bag
    v_bag_tiles := coalesce(v_match.bag_state->'tiles', '[]'::jsonb) || v_returned_tiles;

    v_new_bag_state := jsonb_build_object(
        'tiles', v_bag_tiles,
        'remaining', jsonb_array_length(v_bag_tiles)
    );

    -- Draw same number of tiles from updated bag
    v_draw_result := public.draw_patxanga_tiles_from_bag(
        v_new_bag_state,
        v_tile_count
    );

    v_drawn_tiles := v_draw_result->'drawn_tiles';
    v_new_bag_state := v_draw_result->'new_bag_state';

    -- Final rack after draw
    v_final_rack := v_new_rack || v_drawn_tiles;

    -- Persist player rack
    update patxanga_players
    set rack_state = v_final_rack,
        updated_at = now()
    where id = p_player_id;

    -- Persist bag
    update patxanga_matches
    set bag_state = v_new_bag_state,
        updated_at = now()
    where id = p_match_id;

    -- Persist move
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
        'exchange_tiles',
        'accepted',
        null,
        null,
        null,
        null,
        p_tile_ids,
        false,
        false,
        false,
        null,
        null,
        0,
        jsonb_build_object(
            'exchanged_tile_ids', p_tile_ids,
            'drawn_tiles_count', v_tile_count
        ),
        true,
        false,
        now(),
        now()
    )
    returning id into v_move_id;

    -- Advance turn
    select id
    into v_next_player
    from patxanga_players
    where match_id = p_match_id
      and turn_order >
          (
              select turn_order
              from patxanga_players
              where id = p_player_id
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

    -- Replay exchange
    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        p_match_id,
        'tiles_exchanged',
        jsonb_build_object(
            'move_id', v_move_id,
            'player_id', p_player_id,
            'tile_count', v_tile_count
        ),
        v_new_turn,
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
            'current_turn_player_id', v_next_player
        ),
        v_new_turn,
        now()
    );

    return jsonb_build_object(
        'status', 'success',
        'move_id', v_move_id,
        'exchanged_count', v_tile_count,
        'next_player', v_next_player,
        'turn_number', v_new_turn
    );

end;
$$;

grant execute on function public.submit_patxanga_exchange_tiles(uuid, uuid, jsonb)
to authenticated, anon;
