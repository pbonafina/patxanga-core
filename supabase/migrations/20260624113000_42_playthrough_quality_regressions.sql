-- ============================================================
-- PATXANGA - MIGRATION 42: Playthrough quality regressions
-- Purpose:
--   - prevent replaying accepted words inside the same match
--   - route easy bot turns through the playable bot candidate catalog
--   - block acronym-like short words observed in visual playthroughs
-- ============================================================

insert into public.patxanga_bot_word_policy_overrides (
    language,
    word_normalized,
    policy_status,
    reason
)
values
    ('pt-PT', 'COI', 'blocked_easy', 'acronym-like playthrough word')
on conflict (language, word_normalized, policy_status) do update
set reason = excluded.reason;

create or replace function public.patxanga_move_words_for_replay_check(
    p_main_word text,
    p_secondary_words jsonb
)
returns table(word_normalized text)
language sql
stable
set search_path = public
as
$$
    select public.normalize_patxanga_word(p_main_word)
    where nullif(public.normalize_patxanga_word(p_main_word), '') is not null

    union

    select public.normalize_patxanga_word(word_item.value->>'word')
    from jsonb_array_elements(coalesce(p_secondary_words, '[]'::jsonb)) as word_item(value)
    where nullif(public.normalize_patxanga_word(word_item.value->>'word'), '') is not null;
$$;

create or replace function public.reject_patxanga_replayed_accepted_word()
returns trigger
language plpgsql
security definer
set search_path = public
as
$$
begin
    if new.move_type <> 'place_word'
       or new.status <> 'accepted' then
        return new;
    end if;

    if exists (
        with new_words as (
            select word_normalized
            from public.patxanga_move_words_for_replay_check(
                new.main_word,
                new.secondary_words
            )
        ),
        previous_words as (
            select existing_words.word_normalized
            from public.patxanga_moves existing_move
            cross join lateral public.patxanga_move_words_for_replay_check(
                existing_move.main_word,
                existing_move.secondary_words
            ) existing_words
            where existing_move.match_id = new.match_id
              and existing_move.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
              and existing_move.move_type = 'place_word'
              and existing_move.status = 'accepted'
        )
        select 1
        from new_words
        join previous_words using (word_normalized)
    ) then
        raise exception 'Word already played in this match';
    end if;

    return new;
end;
$$;

drop trigger if exists trg_reject_patxanga_replayed_accepted_word
on public.patxanga_moves;

create trigger trg_reject_patxanga_replayed_accepted_word
before insert or update of status, main_word, secondary_words
on public.patxanga_moves
for each row
execute function public.reject_patxanga_replayed_accepted_word();

create or replace function public.submit_patxanga_easy_bot_turn(
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
        50
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

revoke all on function public.patxanga_move_words_for_replay_check(text, jsonb)
from public, anon, authenticated;

revoke all on function public.reject_patxanga_replayed_accepted_word()
from public, anon, authenticated;

grant execute on function public.patxanga_move_words_for_replay_check(text, jsonb)
to authenticated, anon;

grant execute on function public.submit_patxanga_easy_bot_turn(uuid, uuid)
to authenticated, anon;
