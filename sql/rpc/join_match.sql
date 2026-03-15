-- ============================================================
-- PATXANGA - RPC: join_patxanga_match()
-- Version: 1.1
-- Mode: Synchronous
-- ============================================================

create or replace function public.join_patxanga_match(
    p_match_id uuid,
    p_user_id uuid default null,
    p_guest_name text default null,
    p_is_bot boolean default false,
    p_bot_level text default null,
    p_bot_profile text default null
)
returns uuid
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_current_count integer;
    v_seat_index integer;
    v_player_id uuid;
begin

    -- =============================
    -- Validate match
    -- =============================

    select *
    into v_match
    from patxanga_matches
    where id = p_match_id;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'waiting' then
        raise exception 'Match not open for joining';
    end if;

    -- =============================
    -- Validate capacity
    -- =============================

    select count(*)
    into v_current_count
    from patxanga_players
    where match_id = p_match_id;

    if v_current_count >= v_match.max_players then
        raise exception 'Match is full';
    end if;

    -- =============================
    -- Determine seat only
    -- =============================

    select coalesce(max(seat_index), 0) + 1
    into v_seat_index
    from patxanga_players
    where match_id = p_match_id;

    -- =============================
    -- Validate bot parameters
    -- =============================

    if p_is_bot = true then

        if p_bot_level not in ('easy','medium','hard') then
            raise exception 'Invalid bot level';
        end if;

        if p_bot_profile not in ('aggressive','balanced','defensive') then
            raise exception 'Invalid bot profile';
        end if;

    end if;

    -- =============================
    -- Insert player (turn_order = NULL)
    -- =============================

    insert into patxanga_players (
    match_id,
    user_id,
    guest_name,
    display_name,
    seat_index,
    turn_order,
    is_bot,
    bot_level,
    bot_profile,
    rack_state,
    score,
    created_at,
    updated_at
)
values (
    p_match_id,
    p_user_id,
    p_guest_name,
    coalesce(p_guest_name, 'Player'),
    v_seat_index,
    v_seat_index, -- turn_order temporario ate o start redefinir a ordem final
    p_is_bot,
    p_bot_level,
    p_bot_profile,
    jsonb_build_array(),
    0,
    now(),
    now()
)
returning id into v_player_id;

    -- =============================
    -- Insert presence
    -- =============================

    insert into patxanga_match_presence (
        match_id,
        player_id,
        is_online,
        last_ping_at,
        updated_at
    )
    values (
        p_match_id,
        v_player_id,
        true,
        now(),
        now()
    );

    -- =============================
    -- Replay event
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
        'player_joined',
        jsonb_build_object(
            'player_id', v_player_id,
            'seat_index', v_seat_index,
            'is_bot', p_is_bot
        ),
        0,
        now()
    );

    return v_player_id;

end;
$$;

grant execute on function public.join_patxanga_match(
    uuid,
    uuid,
    text,
    boolean,
    text,
    text
) to authenticated, anon;