-- ============================================================
-- PATXANGA - INITIAL SCHEMA
-- Version: 1.0
-- Mode: Synchronous
-- ============================================================

-- =============================
-- EXTENSIONS
-- =============================

create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: patxanga_matches
-- ============================================================

create table patxanga_matches (
    id uuid primary key default uuid_generate_v4(),

    status text not null check (
        status in ('waiting', 'active', 'voting', 'finished', 'cancelled')
    ),

    match_mode text not null check (
        match_mode in ('synchronous', 'asynchronous')
    ),

    language text not null check (
        language in ('pt-BR', 'pt-PT')
    ),

    host_user_id uuid null,
    host_guest_name text null,

    max_players integer not null default 4 check (max_players between 2 and 4),

    turn_time_seconds integer null,
    hint_mode_enabled boolean not null default false,

    board_state jsonb not null,
    bag_state jsonb not null,

    current_turn_player_id uuid null,

    turn_number integer not null default 0,
    turn_expires_at timestamp null,

    winner_player_id uuid null,

    created_at timestamp not null default now(),
    started_at timestamp null,
    finished_at timestamp null,
    updated_at timestamp not null default now()
);

-- ============================================================
-- TABLE: patxanga_players
-- ============================================================

create table patxanga_players (
    id uuid primary key default uuid_generate_v4(),

    match_id uuid not null references patxanga_matches(id) on delete cascade,

    user_id uuid null,
    guest_name text null,

    display_name text not null,

    seat_index integer not null,
    turn_order integer not null,

    is_bot boolean not null default false,
    bot_level text null check (bot_level in ('easy','medium','hard')),
    bot_profile text null check (bot_profile in ('aggressive','balanced','defensive')),

    rack_state jsonb not null,

    score integer not null default 0,
    skip_next_turn boolean not null default false,
    has_passed_last_cycle boolean not null default false,

    is_connected boolean not null default true,

    joined_at timestamp not null default now(),
    last_seen_at timestamp null,

    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),

    unique(match_id, seat_index),
    unique(match_id, turn_order)
);

-- ============================================================
-- TABLE: patxanga_moves
-- ============================================================

create table patxanga_moves (
    id uuid primary key default uuid_generate_v4(),

    match_id uuid not null references patxanga_matches(id) on delete cascade,
    player_id uuid not null references patxanga_players(id) on delete cascade,

    move_type text not null check (
        move_type in ('place_word','exchange_tiles','pass','timeout_pass')
    ),

    status text not null check (
        status in ('pending_validation','pending_vote','accepted','rejected')
    ),

    main_word text null,
    secondary_words jsonb null,

    placed_tiles jsonb null,
    board_diff jsonb null,

    used_tiles_from_rack jsonb null,

    used_blank_tile boolean not null default false,
    used_skip_tile boolean not null default false,
    used_patxanga_real boolean not null default false,

    patxanga_real_target_word text null,

    target_player_skipped_id uuid null references patxanga_players(id),

    score_total integer not null default 0,
    score_breakdown jsonb null,

    is_dictionary_recognized boolean null,
    requires_vote boolean not null default false,

    created_at timestamp not null default now(),
    resolved_at timestamp null
);

-- ============================================================
-- TABLE: patxanga_votes
-- ============================================================

create table patxanga_votes (
    id uuid primary key default uuid_generate_v4(),

    move_id uuid not null references patxanga_moves(id) on delete cascade,
    match_id uuid not null references patxanga_matches(id) on delete cascade,
    voter_player_id uuid not null references patxanga_players(id) on delete cascade,

    vote_reject boolean not null,

    created_at timestamp not null default now(),

    unique(move_id, voter_player_id)
);

-- ============================================================
-- TABLE: patxanga_match_presence
-- ============================================================

create table patxanga_match_presence (
    id uuid primary key default uuid_generate_v4(),

    match_id uuid not null references patxanga_matches(id) on delete cascade,
    player_id uuid not null references patxanga_players(id) on delete cascade,

    is_online boolean not null default true,
    last_ping_at timestamp not null default now(),

    updated_at timestamp not null default now(),

    unique(match_id, player_id)
);

-- ============================================================
-- TABLE: patxanga_replay_events
-- ============================================================

create table patxanga_replay_events (
    id uuid primary key default uuid_generate_v4(),

    match_id uuid not null references patxanga_matches(id) on delete cascade,

    event_type text not null,
    event_payload jsonb not null,

    turn_number integer not null,

    created_at timestamp not null default now()
);

-- ============================================================
-- TABLE: patxanga_dictionary_entries
-- ============================================================

create table patxanga_dictionary_entries (
    id bigserial primary key,

    language text not null check (language in ('pt-BR','pt-PT')),
    word text not null,
    normalized_word text not null,

    source text null,
    is_active boolean not null default true,

    created_at timestamp not null default now()
);

create unique index idx_dictionary_unique_word
on patxanga_dictionary_entries(language, normalized_word);

-- ============================================================
-- TABLE: patxanga_match_accepted_words
-- ============================================================

create table patxanga_match_accepted_words (
    id uuid primary key default uuid_generate_v4(),

    match_id uuid not null references patxanga_matches(id) on delete cascade,
    move_id uuid not null references patxanga_moves(id) on delete cascade,

    word text not null,
    normalized_word text not null,

    accepted_reason text not null,

    created_at timestamp not null default now()
);

-- ============================================================
-- INDEXES IMPORTANT FOR PERFORMANCE
-- ============================================================

create index idx_matches_status on patxanga_matches(status);
create index idx_moves_match on patxanga_moves(match_id);
create index idx_votes_move on patxanga_votes(move_id);
create index idx_players_match on patxanga_players(match_id);
create index idx_replay_match on patxanga_replay_events(match_id);

-- ============================================================
-- END OF INITIAL SCHEMA
-- ============================================================