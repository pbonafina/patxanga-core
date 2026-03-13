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
