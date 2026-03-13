-- ============================================================
-- PATXANGA - RPC: get_patxanga_match_bootstrap()
-- Version: 1.0
-- Purpose: Return minimal server-authoritative bootstrap payload for frontend
-- ============================================================

create or replace function public.get_patxanga_match_bootstrap(
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
    v_players_summary jsonb;
begin
    select
        m.id,
        m.status,
        m.board_state,
        m.current_turn_player_id,
        m.turn_number,
        m.winner_player_id,
        m.started_at,
        m.finished_at
    into v_match
    from patxanga_matches m
    where m.id = p_match_id;

    if not found then
        raise exception 'Match not found';
    end if;

    select
        p.id,
        p.user_id,
        p.display_name,
        p.rack_state,
        p.score,
        p.seat_index,
        p.turn_order,
        p.has_forfeited
    into v_player
    from patxanga_players p
    where p.match_id = p_match_id
      and p.user_id = p_user_id
    order by p.created_at asc
    limit 1;

    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'player_id', p.id,
                'display_name', p.display_name,
                'score', p.score,
                'seat_index', p.seat_index,
                'turn_order', p.turn_order,
                'has_forfeited', p.has_forfeited
            )
            order by p.turn_order asc, p.created_at asc
        ),
        '[]'::jsonb
    )
    into v_players_summary
    from patxanga_players p
    where p.match_id = p_match_id;

    return jsonb_build_object(
        'match_id', v_match.id,
        'status', v_match.status,
        'board_state', v_match.board_state,
        'current_turn_player_id', v_match.current_turn_player_id,
        'turn_number', v_match.turn_number,
        'winner_player_id', v_match.winner_player_id,
        'started_at', v_match.started_at,
        'finished_at', v_match.finished_at,
        'player_context',
            case
                when v_player.id is null then null
                else jsonb_build_object(
                    'player_id', v_player.id,
                    'user_id', v_player.user_id,
                    'display_name', v_player.display_name,
                    'rack_state', v_player.rack_state,
                    'score', v_player.score,
                    'seat_index', v_player.seat_index,
                    'turn_order', v_player.turn_order,
                    'has_forfeited', v_player.has_forfeited
                )
            end,
        'players_summary', v_players_summary
    );
end;
$$;

grant execute on function public.get_patxanga_match_bootstrap(uuid, uuid)
to authenticated, anon;
