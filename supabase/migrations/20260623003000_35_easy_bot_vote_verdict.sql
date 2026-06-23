-- ============================================================
-- PATXANGA - EASY BOT VOTE VERDICT
-- Purpose: allow bot players to cast explainable pending-vote verdicts
-- ============================================================

create or replace function public.get_patxanga_easy_bot_word_verdict(
    p_match_id uuid,
    p_player_id uuid,
    p_word text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as
$$
declare
    v_match record;
    v_player record;
    v_word text := coalesce(nullif(trim(p_word), ''), '');
    v_normalized text;
begin
    select *
    into v_match
    from public.patxanga_matches
    where id = p_match_id;

    if not found then
        raise exception 'Match not found';
    end if;

    select *
    into v_player
    from public.patxanga_players
    where id = p_player_id
      and match_id = p_match_id;

    if not found then
        raise exception 'Player not found';
    end if;

    if coalesce(v_player.is_bot, false) is not true then
        raise exception 'Player is not a bot';
    end if;

    if coalesce(v_player.bot_level, '') <> 'easy' then
        raise exception 'Only easy bot verdict policy is supported';
    end if;

    v_normalized := public.normalize_patxanga_word(v_word);

    if v_normalized is null or v_normalized = '' or v_normalized !~ '^[A-Z]+$' then
        return jsonb_build_object(
            'verdict', 'reject',
            'vote_reject', true,
            'reason', 'invalid_lexical_form',
            'word', v_word,
            'normalized_word', v_normalized,
            'language', v_match.language
        );
    end if;

    if public.validate_word(v_normalized, v_match.language) is true then
        return jsonb_build_object(
            'verdict', 'accept',
            'vote_reject', false,
            'reason', 'dictionary_recognized',
            'word', v_word,
            'normalized_word', v_normalized,
            'language', v_match.language
        );
    end if;

    return jsonb_build_object(
        'verdict', 'reject',
        'vote_reject', true,
        'reason', 'unknown_word_for_easy_bot',
        'word', v_word,
        'normalized_word', v_normalized,
        'language', v_match.language
    );
end;
$$;

create or replace function public.submit_patxanga_easy_bot_vote(
    p_match_id uuid,
    p_player_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as
$$
declare
    v_match record;
    v_player record;
    v_pending_move record;
    v_verdict jsonb;
    v_vote_result jsonb;
begin
    select *
    into v_match
    from public.patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'voting' then
        raise exception 'Match is not in voting status';
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
        raise exception 'Only easy bot vote policy is supported';
    end if;

    select *
    into v_pending_move
    from public.patxanga_moves
    where match_id = p_match_id
      and status = 'pending_vote'
    order by created_at desc
    limit 1;

    if not found then
        raise exception 'Pending vote move not found';
    end if;

    if v_pending_move.player_id = p_player_id then
        raise exception 'Bot author cannot vote on own move';
    end if;

    v_verdict := public.get_patxanga_easy_bot_word_verdict(
        p_match_id,
        p_player_id,
        v_pending_move.main_word
    );

    v_vote_result := public.submit_patxanga_vote(
        v_pending_move.id,
        p_player_id,
        (v_verdict->>'vote_reject')::boolean
    );

    return v_vote_result || jsonb_build_object(
        'bot_action', 'vote',
        'bot_strategy', 'easy_dictionary_verdict',
        'bot_verdict', v_verdict->>'verdict',
        'bot_vote_reject', (v_verdict->>'vote_reject')::boolean,
        'bot_verdict_reason', v_verdict->>'reason',
        'main_word', v_pending_move.main_word
    );
end;
$$;

revoke all on function public.get_patxanga_easy_bot_word_verdict(uuid, uuid, text)
from public, anon, authenticated;

revoke all on function public.submit_patxanga_easy_bot_vote(uuid, uuid)
from public, anon, authenticated;

grant execute on function public.get_patxanga_easy_bot_word_verdict(uuid, uuid, text)
to authenticated, anon;

grant execute on function public.submit_patxanga_easy_bot_vote(uuid, uuid)
to authenticated, anon;
