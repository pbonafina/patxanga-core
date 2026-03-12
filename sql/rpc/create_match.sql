-- ============================================================
-- PATXANGA - RPC: create_match()
-- Version: 1.0
-- Mode: Synchronous
-- ============================================================

create or replace function public.create_patxanga_match(
    p_language text,
    p_match_mode text default 'synchronous',
    p_turn_time_seconds integer default null,
    p_hint_mode_enabled boolean default false,
    p_host_user_id uuid default null,
    p_host_guest_name text default null,
    p_max_players integer default 4
)
returns uuid
language plpgsql
security definer
as
$$
declare
    v_match_id uuid;
    v_board_state jsonb;
    v_bag_state jsonb;
begin

    -- =============================
    -- Validations
    -- =============================

    if p_language not in ('pt-BR', 'pt-PT') then
        raise exception 'Invalid language';
    end if;

    if p_match_mode not in ('synchronous', 'asynchronous') then
        raise exception 'Invalid match mode';
    end if;

    if p_max_players < 2 or p_max_players > 4 then
        raise exception 'Invalid number of players';
    end if;

    -- =============================
    -- Initialize Board (15x15 empty)
    -- Represented as 2D array stored in JSONB
    -- Each cell: null initially
    -- =============================

    v_board_state :=
    (
        select jsonb_agg(row_data)
        from (
            select jsonb_agg(null) as row_data
            from generate_series(1,15)
        ) rows,
        generate_series(1,15)
    );

    -- =============================
    -- Initialize Bag State
    -- Placeholder: will be replaced
    -- by real distribution later
    -- =============================

    v_bag_state := jsonb_build_object(
        'tiles', jsonb_build_array(),
        'remaining', 0
    );

    -- =============================
    -- Create Match
    -- =============================

    insert into patxanga_matches (
        status,
        match_mode,
        language,
        host_user_id,
        host_guest_name,
        max_players,
        turn_time_seconds,
        hint_mode_enabled,
        board_state,
        bag_state,
        turn_number,
        created_at,
        updated_at
    )
    values (
        'waiting',
        p_match_mode,
        p_language,
        p_host_user_id,
        p_host_guest_name,
        p_max_players,
        p_turn_time_seconds,
        p_hint_mode_enabled,
        v_board_state,
        v_bag_state,
        0,
        now(),
        now()
    )
    returning id into v_match_id;

    -- =============================
    -- Replay Event: match_created
    -- =============================

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        v_match_id,
        'match_created',
        jsonb_build_object(
            'language', p_language,
            'mode', p_match_mode,
            'max_players', p_max_players
        ),
        0,
        now()
    );

    return v_match_id;

end;
$$;

grant execute on function public.create_patxanga_match(
    text,
    text,
    integer,
    boolean,
    uuid,
    text,
    integer
) to authenticated, anon;