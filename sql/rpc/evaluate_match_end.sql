-- ============================================================
-- PATXANGA - RPC: evaluate_patxanga_match_end()
-- Version: 1.0
-- Purpose: Evaluate and finalize match end conditions
-- ============================================================

create or replace function public.evaluate_patxanga_match_end(
    p_match_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_bag_remaining integer;
    v_any_empty_rack boolean := false;
    v_all_passed boolean := false;
    v_player_count integer;
    v_passed_count integer;
    v_winner_player_id uuid;
begin
    select *
    into v_match
    from patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status not in ('active') then
        return jsonb_build_object(
            'finished', false,
            'reason', 'match_not_active'
        );
    end if;

    v_bag_remaining := coalesce((v_match.bag_state->>'remaining')::integer, 0);

    -- If bag still has tiles, no end condition applies yet
    if v_bag_remaining > 0 then
        return jsonb_build_object(
            'finished', false,
            'reason', 'bag_not_empty'
        );
    end if;

    -- Type 1: bag empty + any player rack empty
    select exists (
        select 1
        from patxanga_players
        where match_id = p_match_id
          and jsonb_array_length(rack_state) = 0
    )
    into v_any_empty_rack;

    -- Type 2: bag empty + all players passed
    select count(*)
    into v_player_count
    from patxanga_players
    where match_id = p_match_id;

    select count(*)
    into v_passed_count
    from patxanga_players
    where match_id = p_match_id
      and has_passed_last_cycle = true;

    v_all_passed := (v_player_count > 0 and v_passed_count = v_player_count);

    if not v_any_empty_rack and not v_all_passed then
        return jsonb_build_object(
            'finished', false,
            'reason', 'no_end_condition_met'
        );
    end if;

    -- Winner = highest score (simple rule for now)
    select id
    into v_winner_player_id
    from patxanga_players
    where match_id = p_match_id
    order by score desc, turn_order asc
    limit 1;

    update patxanga_matches
    set status = 'finished',
        winner_player_id = v_winner_player_id,
        finished_at = now(),
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
        'match_finished',
        jsonb_build_object(
            'winner_player_id', v_winner_player_id,
            'bag_remaining', v_bag_remaining,
            'ended_by_empty_rack', v_any_empty_rack,
            'ended_by_all_passed', v_all_passed
        ),
        v_match.turn_number,
        now()
    );

    return jsonb_build_object(
        'finished', true,
        'winner_player_id', v_winner_player_id,
        'ended_by_empty_rack', v_any_empty_rack,
        'ended_by_all_passed', v_all_passed
    );
end;
$$;

grant execute on function public.evaluate_patxanga_match_end(uuid)
to authenticated, anon;
