-- ============================================================
-- PATXANGA - TEST: easy bot vote verdict
-- Purpose: bot accepts dictionary words as verdict and rejects unknown pending words
-- ============================================================

do $$
declare
    v_human_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_human_player_id uuid;
    v_bot_player_id uuid;
    v_tile_t_id uuid := gen_random_uuid();
    v_tile_s_id uuid := gen_random_uuid();
    v_submit_result jsonb;
    v_vote_result jsonb;
    v_accept_verdict jsonb;
    v_reject_verdict jsonb;
    v_vote_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_human_user_id,
        p_host_guest_name := 'Human Vote SQL',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_human_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and user_id = v_human_user_id;

    v_bot_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Voter',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    v_accept_verdict := public.get_patxanga_easy_bot_word_verdict(
        v_match_id,
        v_bot_player_id,
        'CASA'
    );

    if v_accept_verdict->>'verdict' <> 'accept' then
        raise exception 'Expected bot verdict accept for CASA, got %',
            v_accept_verdict;
    end if;

    if v_accept_verdict->>'reason' <> 'dictionary_recognized' then
        raise exception 'Expected dictionary_recognized reason, got %',
            v_accept_verdict;
    end if;

    v_reject_verdict := public.get_patxanga_easy_bot_word_verdict(
        v_match_id,
        v_bot_player_id,
        'TS'
    );

    if v_reject_verdict->>'verdict' <> 'reject' then
        raise exception 'Expected bot verdict reject for TS, got %',
            v_reject_verdict;
    end if;

    if v_reject_verdict->>'reason' <> 'unknown_word_for_easy_bot' then
        raise exception 'Expected unknown_word_for_easy_bot reason, got %',
            v_reject_verdict;
    end if;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_tile_t_id::text, 'letter', 'T', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_human_player_id;

    update public.patxanga_matches
    set current_turn_player_id = v_human_player_id,
        updated_at = now()
    where id = v_match_id;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_human_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile_t_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_s_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    if v_submit_result->>'status' <> 'pending_vote' then
        raise exception 'Expected TS to enter pending_vote, got %',
            v_submit_result;
    end if;

    v_vote_result := public.submit_patxanga_easy_bot_vote(
        v_match_id,
        v_bot_player_id
    );

    if v_vote_result->>'bot_action' <> 'vote' then
        raise exception 'Expected bot vote action, got %', v_vote_result;
    end if;

    if v_vote_result->>'bot_verdict' <> 'reject' then
        raise exception 'Expected bot reject verdict, got %', v_vote_result;
    end if;

    if v_vote_result->>'status' <> 'rejected' then
        raise exception 'Expected pending word rejected by bot, got %',
            v_vote_result;
    end if;

    select count(*)
    into v_vote_count
    from public.patxanga_votes
    where match_id = v_match_id
      and voter_player_id = v_bot_player_id
      and vote_reject = true;

    if v_vote_count <> 1 then
        raise exception 'Expected exactly 1 reject vote by bot, got %',
            v_vote_count;
    end if;

    raise notice 'Easy bot vote verdict test passed';
    raise notice 'accept_verdict=%', v_accept_verdict;
    raise notice 'reject_verdict=%', v_reject_verdict;
    raise notice 'vote_result=%', v_vote_result;
end $$;
