-- ============================================================
-- PATXANGA - RPC: list_patxanga_user_resumable_matches()
-- Version: 1.0
-- Purpose: List matches the user can resume
-- ============================================================

create or replace function public.list_patxanga_user_resumable_matches(
    p_user_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_result jsonb;
begin
    select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    into v_result
    from (
        select
            m.id as match_id,
            m.status as match_status,
            m.match_mode,
            m.language,
            m.turn_number,
            m.current_turn_player_id,
            m.winner_player_id,
            m.created_at,
            m.started_at,
            m.finished_at,
            p.id as player_id,
            p.display_name,
            p.score,
            p.seat_index,
            p.turn_order,
            p.has_forfeited,
            mp.is_online,
            mp.last_ping_at
        from patxanga_players p
        join patxanga_matches m
          on m.id = p.match_id
        left join patxanga_match_presence mp
          on mp.match_id = p.match_id
         and mp.player_id = p.id
        where p.user_id = p_user_id
          and p.has_forfeited = false
          and m.status not in ('finished', 'cancelled')
        order by m.updated_at desc nulls last, m.created_at desc
    ) t;

    return v_result;
end;
$$;

grant execute on function public.list_patxanga_user_resumable_matches(uuid)
to authenticated, anon;
