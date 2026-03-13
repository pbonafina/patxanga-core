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
