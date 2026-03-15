-- ============================================================
-- PATXANGA - LOBBY / INVITE DIRECT SCHEMA
-- Version: 1.0
-- ============================================================

create table if not exists patxanga_match_lobbies (
    id uuid primary key default uuid_generate_v4(),

    match_id uuid not null unique references patxanga_matches(id) on delete cascade,
    host_player_id uuid null references patxanga_players(id) on delete set null,

    status text not null check (
        status in ('open', 'ready', 'closed', 'started')
    ),

    invite_mode text not null check (
        invite_mode in ('direct', 'open_pool')
    ),

    open_pool_slots integer null,

    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    started_at timestamp null,
    closed_at timestamp null
);

create table if not exists patxanga_match_invites (
    id uuid primary key default uuid_generate_v4(),

    match_id uuid not null references patxanga_matches(id) on delete cascade,
    invited_user_id uuid not null,
    invited_by_player_id uuid not null references patxanga_players(id) on delete cascade,

    status text not null check (
        status in ('pending', 'accepted', 'declined', 'expired', 'cancelled')
    ),

    created_at timestamp not null default now(),
    responded_at timestamp null,
    expires_at timestamp null,
    updated_at timestamp not null default now(),

    unique(match_id, invited_user_id)
);

create index if not exists idx_patxanga_lobbies_match_id
on patxanga_match_lobbies(match_id);

create index if not exists idx_patxanga_invites_match_id
on patxanga_match_invites(match_id);

create index if not exists idx_patxanga_invites_invited_user_id
on patxanga_match_invites(invited_user_id);

create index if not exists idx_patxanga_invites_status
on patxanga_match_invites(status);
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
-- ============================================================
-- PATXANGA - RPC: decline_patxanga_invite()
-- Version: 1.0
-- Purpose: Decline direct invite
-- ============================================================

create or replace function public.decline_patxanga_invite(
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

    update patxanga_match_invites
    set status = 'declined',
        responded_at = now(),
        updated_at = now()
    where id = p_invite_id;

    return jsonb_build_object(
        'invite_id', p_invite_id,
        'match_id', v_invite.match_id,
        'invite_status', 'declined'
    );
end;
$$;

grant execute on function public.decline_patxanga_invite(uuid, uuid)
to authenticated, anon;
