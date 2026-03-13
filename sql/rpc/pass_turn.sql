-- ============================================================
-- PATXANGA - RPC: submit_patxanga_pass_turn()
-- Version: 1.0
-- Purpose: Pass turn without changing board/rack/bag
-- ============================================================

create or replace function public.submit_patxanga_pass_turn(
    p_match_id uuid,
    p_player_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player record;
    v_next_player uuid;
    v_new_turn integer;
    v_move_id uuid;
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
        'pass',
        'accepted',
        null,
        null,
        null,
        null,
        null,
        false,
        false,
        false,
        null,
        null,
        0,
        jsonb_build_object(
            'move_type', 'pass',
            'score', 0
        ),
        true,
        false,
        now(),
        now()
    )
    returning id into v_move_id;

    -- Mark pass state for player
    update patxanga_players
    set has_passed_last_cycle = true,
        updated_at = now()
    where id = p_player_id;

    -- Find next player
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

    -- Advance turn
    update patxanga_matches
    set current_turn_player_id = v_next_player,
        turn_number = v_new_turn,
        updated_at = now()
    where id = p_match_id;

    -- Replay: turn_passed
    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        p_match_id,
        'turn_passed',
        jsonb_build_object(
            'move_id', v_move_id,
            'player_id', p_player_id
        ),
        v_new_turn,
        now()
    );

    -- Replay: turn_changed
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
        'next_player', v_next_player,
        'turn_number', v_new_turn
    );

end;
$$;

grant execute on function public.submit_patxanga_pass_turn(uuid, uuid)
to authenticated, anon;
