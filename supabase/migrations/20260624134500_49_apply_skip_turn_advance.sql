-- ============================================================
-- PATXANGA - MIGRATION 49: Apply skip-turn advancement
-- Purpose: accepted moves that use a skip_turn tile must skip the next
-- player instead of giving that player an automatic turn.
-- ============================================================

create or replace function public.apply_patxanga_skip_turn_after_match_turn_update()
returns trigger
language plpgsql
security definer
set search_path = public
as
$$
declare
    v_move record;
    v_skipped_player_id uuid;
    v_next_player_id uuid;
begin
    if pg_trigger_depth() > 1 then
        return new;
    end if;

    if new.status <> 'active' then
        return new;
    end if;

    if new.current_turn_player_id is null then
        return new;
    end if;

    if old.current_turn_player_id is not distinct from new.current_turn_player_id
       and old.turn_number is not distinct from new.turn_number then
        return new;
    end if;

    select move.*
    into v_move
    from public.patxanga_moves move
    where move.match_id = new.id
      and move.move_type = 'place_word'
      and move.status = 'accepted'
    order by move.created_at desc
    limit 1;

    if not found then
        return new;
    end if;

    if v_move.used_skip_tile is not true then
        return new;
    end if;

    if v_move.target_player_skipped_id is not null then
        return new;
    end if;

    if v_move.player_id = new.current_turn_player_id then
        return new;
    end if;

    v_skipped_player_id := new.current_turn_player_id;

    select player_after_skip.id
    into v_next_player_id
    from public.patxanga_players skipped_player
    join public.patxanga_players player_after_skip
      on player_after_skip.match_id = skipped_player.match_id
     and player_after_skip.turn_order > skipped_player.turn_order
     and player_after_skip.has_forfeited is false
    where skipped_player.id = v_skipped_player_id
      and skipped_player.match_id = new.id
    order by player_after_skip.turn_order
    limit 1;

    if v_next_player_id is null then
        select player_after_skip.id
        into v_next_player_id
        from public.patxanga_players player_after_skip
        where player_after_skip.match_id = new.id
          and player_after_skip.has_forfeited is false
        order by player_after_skip.turn_order
        limit 1;
    end if;

    if v_next_player_id is null then
        return new;
    end if;

    update public.patxanga_moves
    set target_player_skipped_id = v_skipped_player_id
    where id = v_move.id;

    update public.patxanga_matches
    set current_turn_player_id = v_next_player_id,
        turn_number = new.turn_number + 1,
        updated_at = now()
    where id = new.id;

    insert into public.patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        new.id,
        'turn_skipped',
        jsonb_build_object(
            'move_id', v_move.id,
            'player_id', v_move.player_id,
            'skipped_player_id', v_skipped_player_id,
            'next_player', v_next_player_id
        ),
        new.turn_number + 1,
        now()
    );

    return new;
end;
$$;

drop trigger if exists trg_apply_patxanga_skip_turn_after_match_turn_update
on public.patxanga_matches;

create trigger trg_apply_patxanga_skip_turn_after_match_turn_update
after update of current_turn_player_id, turn_number on public.patxanga_matches
for each row
execute function public.apply_patxanga_skip_turn_after_match_turn_update();

revoke all on function public.apply_patxanga_skip_turn_after_match_turn_update()
from public, anon, authenticated;
