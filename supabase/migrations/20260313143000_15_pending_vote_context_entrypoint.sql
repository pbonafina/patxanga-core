-- ============================================================
-- PATXANGA - RPC: get_patxanga_pending_vote_context()
-- Version: 1.0
-- Purpose: Return pending vote context for frontend overlay during voting
-- ============================================================

create or replace function public.get_patxanga_pending_vote_context(
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
    v_request_player record;
    v_pending_move record;
begin
    select
        m.id,
        m.status,
        m.current_turn_player_id,
        m.turn_number
    into v_match
    from patxanga_matches m
    where m.id = p_match_id;

    if not found then
        raise exception 'Match not found';
    end if;

    select
        p.id,
        p.user_id,
        p.display_name
    into v_request_player
    from patxanga_players p
    where p.match_id = p_match_id
      and p.user_id = p_user_id
    order by p.created_at asc
    limit 1;

    select
        mv.id,
        mv.match_id,
        mv.player_id,
        mv.status,
        mv.main_word,
        mv.secondary_words,
        mv.placed_tiles,
        mv.board_diff,
        mv.score_total,
        mv.requires_vote,
        mv.created_at,
        author.display_name as author_display_name
    into v_pending_move
    from patxanga_moves mv
    join patxanga_players author
      on author.id = mv.player_id
    where mv.match_id = p_match_id
      and mv.status = 'pending_vote'
    order by mv.created_at desc
    limit 1;

    return jsonb_build_object(
        'match_id', v_match.id,
        'match_status', v_match.status,
        'current_turn_player_id', v_match.current_turn_player_id,
        'turn_number', v_match.turn_number,
        'request_player',
            case
                when v_request_player.id is null then null
                else jsonb_build_object(
                    'player_id', v_request_player.id,
                    'user_id', v_request_player.user_id,
                    'display_name', v_request_player.display_name
                )
            end,
        'pending_move',
            case
                when v_pending_move.id is null then null
                else jsonb_build_object(
                    'move_id', v_pending_move.id,
                    'player_id', v_pending_move.player_id,
                    'author_display_name', v_pending_move.author_display_name,
                    'status', v_pending_move.status,
                    'main_word', v_pending_move.main_word,
                    'secondary_words', coalesce(v_pending_move.secondary_words, '[]'::jsonb),
                    'placed_tiles', coalesce(v_pending_move.placed_tiles, '[]'::jsonb),
                    'board_diff', coalesce(v_pending_move.board_diff, '[]'::jsonb),
                    'score_total', v_pending_move.score_total,
                    'requires_vote', v_pending_move.requires_vote,
                    'created_at', v_pending_move.created_at
                )
            end
    );
end;
$$;

grant execute on function public.get_patxanga_pending_vote_context(uuid, uuid)
to authenticated, anon;
