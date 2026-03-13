-- ============================================================
-- PATXANGA - RPC: start_patxanga_match_from_lobby()
-- Version: 1.0
-- Purpose: Start a ready lobby and mark it started
-- ============================================================

create or replace function public.start_patxanga_match_from_lobby(
    p_match_id uuid,
    p_host_player_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_lobby record;
    v_start_result jsonb;
begin
    select *
    into v_lobby
    from patxanga_match_lobbies
    where match_id = p_match_id
    for update;

    if not found then
        raise exception 'Lobby not found';
    end if;

    if v_lobby.host_player_id <> p_host_player_id then
        raise exception 'Only lobby host can start the match';
    end if;

    if v_lobby.status not in ('ready', 'open') then
        raise exception 'Lobby is not startable';
    end if;

    v_start_result := public.start_patxanga_match(p_match_id);

    update patxanga_match_lobbies
    set status = 'started',
        started_at = now(),
        updated_at = now()
    where match_id = p_match_id;

    return jsonb_build_object(
        'lobby_status', 'started',
        'match_result', v_start_result
    );
end;
$$;

grant execute on function public.start_patxanga_match_from_lobby(uuid, uuid)
to authenticated, anon;
