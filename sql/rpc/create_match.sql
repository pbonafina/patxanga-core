-- ============================================================
-- PATXANGA - RPC: create_patxanga_match()
-- Version: 1.1
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
    v_host_player_id uuid;
    v_host_display_name text;
begin

    if p_language not in ('pt-BR', 'pt-PT') then
        raise exception 'Invalid language';
    end if;

    if p_host_user_id is null and p_host_guest_name is null then
        raise exception 'Host identity is required';
    end if;

    -- 15x15 empty board
    v_board_state :=
    (
        select jsonb_agg(row_data)
        from (
            select jsonb_agg(null::jsonb) as row_data
            from generate_series(1,15)
        ) rows,
        generate_series(1,15)
    );

    v_bag_state := jsonb_build_object(
        'tiles', jsonb_build_array(),
        'remaining', 0
    );

    v_host_display_name := coalesce(p_host_guest_name, 'Host');

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

    -- Insert Host as First Player
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
        v_match_id,
        p_host_user_id,
        p_host_guest_name,
        v_host_display_name,
        1,
        0,
        false,
        null,
        null,
        jsonb_build_array(),
        0,
        now(),
        now()
    )
    returning id into v_host_player_id;

    insert into patxanga_match_presence (
        match_id,
        player_id,
        is_online,
        last_ping_at,
        updated_at
    )
    values (
        v_match_id,
        v_host_player_id,
        true,
        now(),
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