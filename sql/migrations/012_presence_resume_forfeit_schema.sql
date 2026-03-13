-- ============================================================
-- PATXANGA - PRESENCE / RESUME / FORFEIT SCHEMA
-- Version: 1.0
-- ============================================================

alter table patxanga_players
add column if not exists has_forfeited boolean not null default false;

alter table patxanga_players
add column if not exists forfeited_at timestamp null;

create index if not exists idx_patxanga_players_match_forfeit
on patxanga_players(match_id, has_forfeited);
