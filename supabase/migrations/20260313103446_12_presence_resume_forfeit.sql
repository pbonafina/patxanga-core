-- GENERATED FILE - DO NOT EDIT DIRECTLY
-- Regenerate with: zsh scripts/sync-supabase-entrypoint-migrations.sh
-- Source set: sql/migrations/012_presence_resume_forfeit_schema.sql + sql/rpc/resume_match.sql + sql/rpc/forfeit_match.sql

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


-- ============================================================
-- PATXANGA - RPC: resume_patxanga_match()
-- Version: 1.0
-- Purpose: Resume a previously joined match
-- ============================================================

create or replace function public.resume_patxanga_match(
    p_match_id uuid,
    p_user_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player record;
begin
    select *
    into v_match
    from patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        return jsonb_build_object(
            'can_resume', false,
            'reason', 'match_not_found'
        );
    end if;

    if v_match.status in ('finished', 'cancelled') then
        return jsonb_build_object(
            'can_resume', false,
            'reason', 'match_closed',
            'match_status', v_match.status
        );
    end if;

    select *
    into v_player
    from patxanga_players
    where match_id = p_match_id
      and user_id = p_user_id
    limit 1;

    if not found then
        return jsonb_build_object(
            'can_resume', false,
            'reason', 'player_not_in_match'
        );
    end if;

    if v_player.has_forfeited then
        return jsonb_build_object(
            'can_resume', false,
            'reason', 'player_forfeited'
        );
    end if;

    update patxanga_match_presence
    set is_online = true,
        last_ping_at = now(),
        updated_at = now()
    where match_id = p_match_id
      and player_id = v_player.id;

    return jsonb_build_object(
        'can_resume', true,
        'match_id', p_match_id,
        'player_id', v_player.id,
        'match_status', v_match.status,
        'current_turn_player_id', v_match.current_turn_player_id
    );
end;
$$;

grant execute on function public.resume_patxanga_match(uuid, uuid)
to authenticated, anon;


-- ============================================================
-- PATXANGA - RPC: forfeit_patxanga_match()
-- Version: 1.0
-- Purpose: Allow player to forfeit a match
-- ============================================================

create or replace function public.forfeit_patxanga_match(
    p_match_id uuid,
    p_player_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player record;
    v_next_player uuid;
    v_everyone_forfeited boolean := false;
    v_active_remaining integer := 0;
    v_new_turn integer;
    v_was_current_turn boolean := false;
begin
    select *
    into v_match
    from patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status in ('finished', 'cancelled') then
        raise exception 'Match already closed';
    end if;

    select *
    into v_player
    from patxanga_players
    where id = p_player_id
      and match_id = p_match_id
    for update;

    if not found then
        raise exception 'Player not found';
    end if;

    if v_player.has_forfeited then
        raise exception 'Player already forfeited';
    end if;

    v_was_current_turn := (v_match.current_turn_player_id = p_player_id);

    update patxanga_players
    set has_forfeited = true,
        forfeited_at = now(),
        updated_at = now()
    where id = p_player_id;

    update patxanga_match_presence
    set is_online = false,
        updated_at = now()
    where match_id = p_match_id
      and player_id = p_player_id;

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        p_match_id,
        'player_forfeited',
        jsonb_build_object(
            'player_id', p_player_id
        ),
        v_match.turn_number,
        now()
    );

    select count(*)
    into v_active_remaining
    from patxanga_players
    where match_id = p_match_id
      and has_forfeited = false;

    if v_active_remaining = 0 then
        v_everyone_forfeited := true;

        update patxanga_matches
        set status = 'cancelled',
            updated_at = now()
        where id = p_match_id;

        insert into patxanga_replay_events (
            match_id,
            event_type,
            event_payload,
            turn_number,
            created_at
        )
        values (
            p_match_id,
            'match_cancelled',
            jsonb_build_object(
                'reason', 'all_players_forfeited'
            ),
            v_match.turn_number,
            now()
        );

        return jsonb_build_object(
            'status', 'cancelled',
            'match_status', 'cancelled',
            'everyone_forfeited', true
        );
    end if;

    if v_was_current_turn then
        select id
        into v_next_player
        from patxanga_players
        where match_id = p_match_id
          and has_forfeited = false
          and turn_order >
              (
                  select turn_order
                  from patxanga_players
                  where id = p_player_id
              )
        order by turn_order
        limit 1;

        if v_next_player is null then
            select id
            into v_next_player
            from patxanga_players
            where match_id = p_match_id
              and has_forfeited = false
            order by turn_order
            limit 1;
        end if;

        v_new_turn := v_match.turn_number + 1;

        update patxanga_matches
        set current_turn_player_id = v_next_player,
            turn_number = v_new_turn,
            updated_at = now()
        where id = p_match_id;

        insert into patxanga_replay_events (
            match_id,
            event_type,
            event_payload,
            turn_number,
            created_at
        )
        values (
            p_match_id,
            'turn_changed',
            jsonb_build_object(
                'current_turn_player_id', v_next_player,
                'reason', 'forfeit'
            ),
            v_new_turn,
            now()
        );

        return jsonb_build_object(
            'status', 'success',
            'match_status', v_match.status,
            'player_forfeited', p_player_id,
            'next_player', v_next_player,
            'turn_number', v_new_turn,
            'everyone_forfeited', false
        );
    end if;

    return jsonb_build_object(
        'status', 'success',
        'match_status', v_match.status,
        'player_forfeited', p_player_id,
        'everyone_forfeited', false
    );
end;
$$;

grant execute on function public.forfeit_patxanga_match(uuid, uuid)
to authenticated, anon;
