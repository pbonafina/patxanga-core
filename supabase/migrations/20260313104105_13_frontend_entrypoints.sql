-- GENERATED FILE - DO NOT EDIT DIRECTLY
-- Regenerate with: zsh scripts/sync-supabase-entrypoint-migrations.sh
-- Source set: sql/rpc/list_user_pending_invites.sql + sql/rpc/list_user_resumable_matches.sql + sql/rpc/start_match_from_lobby.sql

-- ============================================================
-- PATXANGA - RPC: list_patxanga_user_pending_invites()
-- Version: 1.0
-- Purpose: List pending direct invites for a user
-- ============================================================

create or replace function public.list_patxanga_user_pending_invites(
    p_user_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_result jsonb;
begin
    select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    into v_result
    from (
        select
            i.id as invite_id,
            i.match_id,
            i.status as invite_status,
            i.created_at,
            i.expires_at,
            l.id as lobby_id,
            l.status as lobby_status,
            l.invite_mode,
            m.match_mode,
            m.language,
            m.max_players,
            m.host_user_id,
            m.host_guest_name
        from patxanga_match_invites i
        join patxanga_match_lobbies l
          on l.match_id = i.match_id
        join patxanga_matches m
          on m.id = i.match_id
        where i.invited_user_id = p_user_id
          and i.status = 'pending'
          and l.status in ('open', 'ready')
        order by i.created_at desc
    ) t;

    return v_result;
end;
$$;

grant execute on function public.list_patxanga_user_pending_invites(uuid)
to authenticated, anon;


-- ============================================================
-- PATXANGA - RPC: list_patxanga_user_resumable_matches()
-- Version: 1.0
-- Purpose: List matches the user can resume
-- ============================================================

create or replace function public.list_patxanga_user_resumable_matches(
    p_user_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_result jsonb;
begin
    select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    into v_result
    from (
        select
            m.id as match_id,
            m.status as match_status,
            m.match_mode,
            m.language,
            m.turn_number,
            m.current_turn_player_id,
            m.winner_player_id,
            m.created_at,
            m.started_at,
            m.finished_at,
            p.id as player_id,
            p.display_name,
            p.score,
            p.seat_index,
            p.turn_order,
            p.has_forfeited,
            mp.is_online,
            mp.last_ping_at
        from patxanga_players p
        join patxanga_matches m
          on m.id = p.match_id
        left join patxanga_match_presence mp
          on mp.match_id = p.match_id
         and mp.player_id = p.id
        where p.user_id = p_user_id
          and p.has_forfeited = false
          and m.status not in ('finished', 'cancelled')
        order by m.updated_at desc nulls last, m.created_at desc
    ) t;

    return v_result;
end;
$$;

grant execute on function public.list_patxanga_user_resumable_matches(uuid)
to authenticated, anon;


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
