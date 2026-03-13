-- ============================================================
-- PATXANGA - RPC: invite_patxanga_player()
-- Version: 1.0
-- Purpose: Create direct invite for a logged user
-- ============================================================

create or replace function public.invite_patxanga_player(
    p_match_id uuid,
    p_invited_by_player_id uuid,
    p_invited_user_id uuid,
    p_expires_at timestamp default null
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_lobby record;
    v_inviter record;
    v_invite_id uuid;
begin
    select *
    into v_lobby
    from patxanga_match_lobbies
    where match_id = p_match_id
    for update;

    if not found then
        raise exception 'Lobby not found';
    end if;

    if v_lobby.status <> 'open' then
        raise exception 'Lobby not open';
    end if;

    if v_lobby.invite_mode <> 'direct' then
        raise exception 'Lobby is not in direct invite mode';
    end if;

    select *
    into v_inviter
    from patxanga_players
    where id = p_invited_by_player_id
      and match_id = p_match_id
    limit 1;

    if not found then
        raise exception 'Inviter not found in match';
    end if;

    if exists (
        select 1
        from patxanga_players
        where match_id = p_match_id
          and user_id = p_invited_user_id
    ) then
        raise exception 'User already joined this match';
    end if;

    insert into patxanga_match_invites (
        match_id,
        invited_user_id,
        invited_by_player_id,
        status,
        created_at,
        responded_at,
        expires_at,
        updated_at
    )
    values (
        p_match_id,
        p_invited_user_id,
        p_invited_by_player_id,
        'pending',
        now(),
        null,
        p_expires_at,
        now()
    )
    on conflict (match_id, invited_user_id)
    do update set
        invited_by_player_id = excluded.invited_by_player_id,
        status = 'pending',
        responded_at = null,
        expires_at = excluded.expires_at,
        updated_at = now()
    returning id into v_invite_id;

    return jsonb_build_object(
        'invite_id', v_invite_id,
        'match_id', p_match_id,
        'invited_user_id', p_invited_user_id,
        'status', 'pending'
    );
end;
$$;

grant execute on function public.invite_patxanga_player(uuid, uuid, uuid, timestamp)
to authenticated, anon;
