-- ============================================================
-- PATXANGA - RPC: accept_patxanga_invite()
-- Version: 1.0
-- Purpose: Accept direct invite and join match
-- ============================================================

create or replace function public.accept_patxanga_invite(
    p_invite_id uuid,
    p_user_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_invite record;
    v_lobby record;
    v_match record;
    v_player_id uuid;
    v_player_count integer;
begin
    select *
    into v_invite
    from patxanga_match_invites
    where id = p_invite_id
    for update;

    if not found then
        raise exception 'Invite not found';
    end if;

    if v_invite.invited_user_id <> p_user_id then
        raise exception 'Invite does not belong to this user';
    end if;

    if v_invite.status <> 'pending' then
        raise exception 'Invite is not pending';
    end if;

    if v_invite.expires_at is not null and v_invite.expires_at < now() then
        update patxanga_match_invites
        set status = 'expired',
            responded_at = now(),
            updated_at = now()
        where id = p_invite_id;

        raise exception 'Invite expired';
    end if;

    select *
    into v_lobby
    from patxanga_match_lobbies
    where match_id = v_invite.match_id
    for update;

    if not found then
        raise exception 'Lobby not found';
    end if;

    if v_lobby.status not in ('open', 'ready') then
        raise exception 'Lobby not accepting entries';
    end if;

    select *
    into v_match
    from patxanga_matches
    where id = v_invite.match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if exists (
        select 1
        from patxanga_players
        where match_id = v_invite.match_id
          and user_id = p_user_id
    ) then
        raise exception 'User already joined this match';
    end if;

    select count(*)
    into v_player_count
    from patxanga_players
    where match_id = v_invite.match_id;

    if v_player_count >= v_match.max_players then
        raise exception 'Match is full';
    end if;

    v_player_id := public.join_patxanga_match(
        p_match_id := v_invite.match_id,
        p_user_id := p_user_id
    );

    update patxanga_match_invites
    set status = 'accepted',
        responded_at = now(),
        updated_at = now()
    where id = p_invite_id;

    select count(*)
    into v_player_count
    from patxanga_players
    where match_id = v_invite.match_id;

    update patxanga_match_lobbies
    set status = case
        when v_player_count >= 2 then 'ready'
        else 'open'
    end,
    updated_at = now()
    where match_id = v_invite.match_id;

    return jsonb_build_object(
        'invite_id', p_invite_id,
        'match_id', v_invite.match_id,
        'player_id', v_player_id,
        'invite_status', 'accepted',
        'lobby_status', case
            when v_player_count >= 2 then 'ready'
            else 'open'
        end
    );
end;
$$;

grant execute on function public.accept_patxanga_invite(uuid, uuid)
to authenticated, anon;
