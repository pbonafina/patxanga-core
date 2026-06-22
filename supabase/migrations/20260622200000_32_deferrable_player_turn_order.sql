-- ============================================================
-- PATXANGA - Deferrable player turn order uniqueness
-- Purpose: allow start_patxanga_match() to reshuffle turn_order safely for 3+ players
-- ============================================================

alter table public.patxanga_players
drop constraint if exists patxanga_players_match_id_turn_order_key;

alter table public.patxanga_players
add constraint patxanga_players_match_id_turn_order_key
unique (match_id, turn_order)
deferrable initially deferred;
