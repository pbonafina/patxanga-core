-- ============================================================
-- PATXANGA - MIGRATION 43: End blocked boards by pass cycle
-- Purpose: all players passing closes the match even if the bag is not empty
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
    v_empty_rack_player_id uuid;
    v_total_penalties integer := 0;
    v_player record;
    v_tile jsonb;
    v_penalty integer;
begin
    select *
    into v_match
    from patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'active' then
        return jsonb_build_object(
            'finished', false,
            'reason', 'match_not_active'
        );
    end if;

    select exists (
        select 1
        from patxanga_players
        where match_id = p_match_id
          and jsonb_array_length(rack_state) = 0
    )
    into v_any_empty_rack;

    select id
    into v_empty_rack_player_id
    from patxanga_players
    where match_id = p_match_id
      and jsonb_array_length(rack_state) = 0
    order by turn_order
    limit 1;

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
    v_bag_remaining := coalesce((v_match.bag_state->>'remaining')::integer, 0);

    if v_bag_remaining > 0 and not v_all_passed then
        return jsonb_build_object(
            'finished', false,
            'reason', 'bag_not_empty'
        );
    end if;

    if not v_any_empty_rack and not v_all_passed then
        return jsonb_build_object(
            'finished', false,
            'reason', 'no_end_condition_met'
        );
    end if;

    for v_player in
        select *
        from patxanga_players
        where match_id = p_match_id
        for update
    loop
        v_penalty := 0;

        for v_tile in
            select value
            from jsonb_array_elements(v_player.rack_state)
        loop
            v_penalty := v_penalty + coalesce((v_tile->>'points')::integer, 0);
        end loop;

        if v_penalty > 0 then
            update patxanga_players
            set score = score - v_penalty,
                updated_at = now()
            where id = v_player.id;

            v_total_penalties := v_total_penalties + v_penalty;
        end if;
    end loop;

    if v_any_empty_rack and v_empty_rack_player_id is not null and v_total_penalties > 0 then
        update patxanga_players
        set score = score + v_total_penalties,
            updated_at = now()
        where id = v_empty_rack_player_id;
    end if;

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
            'ended_by_all_passed', v_all_passed,
            'total_penalties', v_total_penalties,
            'empty_rack_player_id', v_empty_rack_player_id
        ),
        v_match.turn_number,
        now()
    );

    return jsonb_build_object(
        'finished', true,
        'winner_player_id', v_winner_player_id,
        'ended_by_empty_rack', v_any_empty_rack,
        'ended_by_all_passed', v_all_passed,
        'total_penalties', v_total_penalties,
        'empty_rack_player_id', v_empty_rack_player_id
    );
end;
$$;

grant execute on function public.evaluate_patxanga_match_end(uuid)
to authenticated, anon;
