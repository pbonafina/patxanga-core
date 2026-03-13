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
