-- ============================================================
-- PATXANGA - MIGRATION 48: Bot turn timeout budget
-- Purpose: keep browser/API bot turns from failing under anon's 3s
-- statement_timeout once the board is dense enough for candidate search.
-- ============================================================

create or replace function public.submit_patxanga_easy_bot_turn(
    p_match_id uuid,
    p_player_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
set statement_timeout = '45s'
as
$$
declare
    v_match record;
    v_player record;
    v_candidates jsonb;
    v_candidate jsonb;
    v_result jsonb;
begin
    select *
    into v_match
    from public.patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'active' then
        raise exception 'Match not active';
    end if;

    if v_match.current_turn_player_id <> p_player_id then
        raise exception 'Not your turn';
    end if;

    select *
    into v_player
    from public.patxanga_players
    where id = p_player_id
      and match_id = p_match_id
    for update;

    if not found then
        raise exception 'Player not found';
    end if;

    if coalesce(v_player.is_bot, false) is not true then
        raise exception 'Player is not a bot';
    end if;

    if coalesce(v_player.bot_level, '') <> 'easy' then
        raise exception 'Only easy bot policy is supported';
    end if;

    v_candidates := public.find_patxanga_playable_bot_candidate_moves(
        p_match_id,
        p_player_id,
        coalesce((public.get_patxanga_bot_policy_config(
            v_player.bot_level,
            v_player.bot_profile
        )->>'candidate_limit')::integer, 10)
    );

    for v_candidate in
        select candidate.value
        from jsonb_array_elements(v_candidates) as candidate(value)
        where not exists (
            select 1
            from public.patxanga_moves existing_move
            cross join lateral public.patxanga_move_words_for_replay_check(
                existing_move.main_word,
                existing_move.secondary_words
            ) existing_words
            where existing_move.match_id = p_match_id
              and existing_move.move_type = 'place_word'
              and existing_move.status = 'accepted'
              and existing_words.word_normalized = public.normalize_patxanga_word(candidate.value->>'main_word')
        )
        order by coalesce((candidate.value->>'candidate_rank')::integer, 999999)
    loop
        v_result := public.submit_patxanga_move(
            p_match_id,
            p_player_id,
            v_candidate->'placed_tiles'
        );

        return v_result || jsonb_build_object(
            'bot_action', 'place_word',
            'bot_strategy', v_candidate->>'bot_strategy',
            'main_word', v_candidate->>'main_word',
            'direction', v_candidate->>'direction',
            'anchor', v_candidate->'anchor',
            'placed_tiles', v_candidate->'placed_tiles',
            'wildcard_count', coalesce((v_candidate->>'wildcard_count')::integer, 0),
            'patxanga_real_count', coalesce((v_candidate->>'patxanga_real_count')::integer, 0)
        );
    end loop;

    v_result := public.submit_patxanga_pass_turn(
        p_match_id,
        p_player_id
    );

    return v_result || jsonb_build_object(
        'bot_action', 'pass',
        'bot_strategy', 'playable_dictionary_word',
        'pass_reason', 'no_playable_word'
    );
end;
$$;

revoke all on function public.submit_patxanga_easy_bot_turn(uuid, uuid)
from public, anon, authenticated;

grant execute on function public.submit_patxanga_easy_bot_turn(uuid, uuid)
to authenticated, anon;
