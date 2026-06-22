-- ============================================================
-- PATXANGA - MIGRATION 30: bootstrap demo/end/dictionary contract
-- Purpose: expose match end and dictionary summaries to frontend bootstrap
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
    v_end_summary jsonb;
    v_dictionary_summary jsonb;
begin
    select
        m.id,
        m.language,
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
        p.has_forfeited,
        p.is_bot,
        p.bot_level,
        p.bot_profile
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
                'has_forfeited', p.has_forfeited,
                'is_bot', p.is_bot,
                'bot_level', p.bot_level,
                'bot_profile', p.bot_profile
            )
            order by p.turn_order asc, p.created_at asc
        ),
        '[]'::jsonb
    )
    into v_players_summary
    from patxanga_players p
    where p.match_id = p_match_id;

    select
        case
            when v_match.status = 'cancelled' then
                jsonb_build_object(
                    'reason', 'cancelled',
                    'ended_by_empty_rack', false,
                    'ended_by_all_passed', false,
                    'total_penalties', 0,
                    'empty_rack_player_id', null
                )
            when v_match.status = 'finished' then
                coalesce(
                    (
                        select jsonb_build_object(
                            'reason',
                                case
                                    when coalesce((event.event_payload->>'ended_by_empty_rack')::boolean, false) then 'empty_rack'
                                    when coalesce((event.event_payload->>'ended_by_all_passed')::boolean, false) then 'all_passed'
                                    else 'finished'
                                end,
                            'ended_by_empty_rack', coalesce((event.event_payload->>'ended_by_empty_rack')::boolean, false),
                            'ended_by_all_passed', coalesce((event.event_payload->>'ended_by_all_passed')::boolean, false),
                            'total_penalties', coalesce((event.event_payload->>'total_penalties')::integer, 0),
                            'empty_rack_player_id', event.event_payload->>'empty_rack_player_id'
                        )
                        from patxanga_replay_events event
                        where event.match_id = p_match_id
                          and event.event_type = 'match_finished'
                        order by event.created_at desc
                        limit 1
                    ),
                    jsonb_build_object(
                        'reason', 'finished',
                        'ended_by_empty_rack', false,
                        'ended_by_all_passed', false,
                        'total_penalties', 0,
                        'empty_rack_player_id', null
                    )
                )
            else null
        end
    into v_end_summary;

    select jsonb_build_object(
        'language', v_match.language,
        'active_words_count', count(*) filter (where dictionary.is_active = true),
        'active_sources_count', count(distinct dictionary.source) filter (where dictionary.is_active = true),
        'sample_sources', coalesce(
            jsonb_agg(distinct dictionary.source) filter (
                where dictionary.is_active = true
                  and dictionary.source is not null
            ),
            '[]'::jsonb
        )
    )
    into v_dictionary_summary
    from patxanga_dictionary dictionary
    where dictionary.language = v_match.language;

    return jsonb_build_object(
        'match_id', v_match.id,
        'language', v_match.language,
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
                    'has_forfeited', v_player.has_forfeited,
                    'is_bot', v_player.is_bot,
                    'bot_level', v_player.bot_level,
                    'bot_profile', v_player.bot_profile
                )
            end,
        'players_summary', v_players_summary,
        'end_summary', v_end_summary,
        'dictionary_summary', v_dictionary_summary
    );
end;
$$;

grant execute on function public.get_patxanga_match_bootstrap(uuid, uuid)
to authenticated, anon;
