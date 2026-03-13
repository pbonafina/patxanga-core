-- ============================================================
-- PATXANGA - RPC: create_patxanga_match_lobby()
-- Version: 1.0
-- Purpose: Create match + direct lobby
-- ============================================================

create or replace function public.create_patxanga_match_lobby(
    p_language text,
    p_match_mode text default 'synchronous',
    p_turn_time_seconds integer default null,
    p_hint_mode_enabled boolean default false,
    p_host_user_id uuid default null,
    p_host_guest_name text default null,
    p_max_players integer default 4
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match_id uuid;
    v_host_player_id uuid;
    v_lobby_id uuid;
begin
    v_match_id := public.create_patxanga_match(
        p_language := p_language,
        p_match_mode := p_match_mode,
        p_turn_time_seconds := p_turn_time_seconds,
        p_hint_mode_enabled := p_hint_mode_enabled,
        p_host_user_id := p_host_user_id,
        p_host_guest_name := p_host_guest_name,
        p_max_players := p_max_players
    );

    select id
    into v_host_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = p_host_user_id
    limit 1;

    if v_host_player_id is null then
        raise exception 'Host player not found after match creation';
    end if;

    insert into patxanga_match_lobbies (
        match_id,
        host_player_id,
        status,
        invite_mode,
        open_pool_slots,
        created_at,
        updated_at
    )
    values (
        v_match_id,
        v_host_player_id,
        'open',
        'direct',
        null,
        now(),
        now()
    )
    returning id into v_lobby_id;

    return jsonb_build_object(
        'match_id', v_match_id,
        'lobby_id', v_lobby_id,
        'host_player_id', v_host_player_id,
        'status', 'open',
        'invite_mode', 'direct'
    );
end;
$$;

grant execute on function public.create_patxanga_match_lobby(
    text,
    text,
    integer,
    boolean,
    uuid,
    text,
    integer
) to authenticated, anon;
