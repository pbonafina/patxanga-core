-- ============================================================
-- PATXANGA - BOT SIMULATION PENDING VOTE
-- Purpose: deterministic bot scenarios for pending_vote rejection and acceptance
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_author_player_id uuid;
    v_voter_player_id uuid;
    v_tile_t_id uuid := gen_random_uuid();
    v_tile_s_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_submit_result jsonb;
    v_vote_result jsonb;
    v_move_id uuid;
    v_pending_move_count integer;
    v_vote_count integer;
    v_replay_vote_count integer;
    v_replay_rejected_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Pending Reject Author',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_author_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Pending Reject Author',
        updated_at = now()
    where id = v_author_player_id;

    v_voter_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Pending Reject Voter',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'defensive'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_author_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_voter_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_author_player_id
    limit 1;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_t_id::text, 'letter', 'T', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_author_player_id;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_author_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile_t_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_s_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    if v_submit_result->>'status' <> 'pending_vote' then
        raise exception 'Expected pending_vote submit result in reject scenario, got %', v_submit_result;
    end if;

    if v_submit_result->>'move_id' is null then
        raise exception 'Expected pending move_id in reject scenario, got %', v_submit_result;
    end if;

    if v_submit_result->>'match_status' <> 'voting' then
        raise exception 'Expected match_status voting in reject scenario, got %', v_submit_result;
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'voting' then
        raise exception 'Expected match to be voting after pending submit';
    end if;

    if (select board_state #>> '{7,7,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected board center to remain empty while move is pending_vote';
    end if;

    v_move_id := (v_submit_result->>'move_id')::uuid;

    select count(*)
    into v_pending_move_count
    from patxanga_moves
    where id = v_move_id
      and match_id = v_match_id
      and player_id = v_author_player_id
      and move_type = 'place_word'
      and status = 'pending_vote'
      and main_word = 'TS'
      and is_dictionary_recognized = false
      and requires_vote = true;

    if v_pending_move_count <> 1 then
        raise exception 'Expected exactly 1 pending_vote place_word move in reject scenario, got %', v_pending_move_count;
    end if;

    v_vote_result := public.submit_patxanga_vote(
        v_move_id,
        v_voter_player_id,
        true
    );

    if v_vote_result->>'status' <> 'rejected' then
        raise exception 'Expected vote rejection result, got %', v_vote_result;
    end if;

    if (select status from patxanga_moves where id = v_move_id) <> 'rejected' then
        raise exception 'Expected move status rejected after bot vote';
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'active' then
        raise exception 'Expected match active after vote rejection';
    end if;

    if (select current_turn_player_id from patxanga_matches where id = v_match_id) <> v_author_player_id then
        raise exception 'Expected turn to return to pending move author after rejection';
    end if;

    if (select board_state #>> '{7,7,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected board center to remain empty after rejection';
    end if;

    select count(*)
    into v_vote_count
    from patxanga_votes
    where move_id = v_move_id
      and voter_player_id = v_voter_player_id
      and vote_reject = true;

    if v_vote_count <> 1 then
        raise exception 'Expected exactly 1 rejecting bot vote, got %', v_vote_count;
    end if;

    select count(*)
    into v_replay_vote_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'vote_cast';

    if v_replay_vote_count <> 1 then
        raise exception 'Expected exactly 1 vote_cast replay event in reject scenario, got %', v_replay_vote_count;
    end if;

    select count(*)
    into v_replay_rejected_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'word_rejected';

    if v_replay_rejected_count < 1 then
        raise exception 'Expected at least 1 word_rejected replay event in reject scenario, got %', v_replay_rejected_count;
    end if;

    raise notice 'Bot pending_vote rejection simulation passed';
    raise notice 'reject_match_id=%', v_match_id;
    raise notice 'reject_author_player_id=%', v_author_player_id;
    raise notice 'reject_voter_player_id=%', v_voter_player_id;
    raise notice 'reject_submit_result=%', v_submit_result;
    raise notice 'reject_vote_result=%', v_vote_result;
end $$;

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_author_player_id uuid;
    v_voter_player_id uuid;
    v_tile_t_id uuid := gen_random_uuid();
    v_tile_s_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_submit_result jsonb;
    v_vote_result jsonb;
    v_move_id uuid;
    v_pending_move_count integer;
    v_vote_count integer;
    v_accepted_word_count integer;
    v_replay_vote_count integer;
    v_replay_validated_count integer;
    v_move_score integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Pending Accept Author',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_author_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Pending Accept Author',
        updated_at = now()
    where id = v_author_player_id;

    v_voter_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Pending Accept Voter',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'aggressive'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_author_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_voter_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_author_player_id
    limit 1;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_t_id::text, 'letter', 'T', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_author_player_id;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_author_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile_t_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_s_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    if v_submit_result->>'status' <> 'pending_vote' then
        raise exception 'Expected pending_vote submit result in accept scenario, got %', v_submit_result;
    end if;

    if v_submit_result->>'move_id' is null then
        raise exception 'Expected pending move_id in accept scenario, got %', v_submit_result;
    end if;

    if v_submit_result->>'match_status' <> 'voting' then
        raise exception 'Expected match_status voting in accept scenario, got %', v_submit_result;
    end if;

    if (select board_state #>> '{7,7,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected board center to remain empty before acceptance';
    end if;

    v_move_id := (v_submit_result->>'move_id')::uuid;

    select count(*)
    into v_pending_move_count
    from patxanga_moves
    where id = v_move_id
      and match_id = v_match_id
      and player_id = v_author_player_id
      and move_type = 'place_word'
      and status = 'pending_vote'
      and main_word = 'TS'
      and is_dictionary_recognized = false
      and requires_vote = true;

    if v_pending_move_count <> 1 then
        raise exception 'Expected exactly 1 pending_vote place_word move in accept scenario, got %', v_pending_move_count;
    end if;

    v_vote_result := public.submit_patxanga_vote(
        v_move_id,
        v_voter_player_id,
        false
    );

    if v_vote_result->>'status' <> 'accepted' then
        raise exception 'Expected vote acceptance result, got %', v_vote_result;
    end if;

    if (select status from patxanga_moves where id = v_move_id) <> 'accepted' then
        raise exception 'Expected move status accepted after bot vote';
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'active' then
        raise exception 'Expected match active after vote acceptance';
    end if;

    if (select current_turn_player_id from patxanga_matches where id = v_match_id) <> v_voter_player_id then
        raise exception 'Expected turn to advance to voter after acceptance';
    end if;

    if (select board_state #>> '{7,7,tile,letter}' from patxanga_matches where id = v_match_id) <> 'T' then
        raise exception 'Expected accepted T tile at board center after vote acceptance';
    end if;

    if (select board_state #>> '{7,8,tile,letter}' from patxanga_matches where id = v_match_id) <> 'S' then
        raise exception 'Expected accepted S tile next to board center after vote acceptance';
    end if;

    select score_total
    into v_move_score
    from patxanga_moves
    where id = v_move_id;

    if v_move_score <= 0 then
        raise exception 'Expected accepted pending_vote move to have positive score, got %', v_move_score;
    end if;

    select count(*)
    into v_vote_count
    from patxanga_votes
    where move_id = v_move_id
      and voter_player_id = v_voter_player_id
      and vote_reject = false;

    if v_vote_count <> 1 then
        raise exception 'Expected exactly 1 accepting bot vote, got %', v_vote_count;
    end if;

    select count(*)
    into v_accepted_word_count
    from patxanga_match_accepted_words
    where match_id = v_match_id
      and move_id = v_move_id
      and word = 'TS'
      and accepted_reason = 'community_vote';

    if v_accepted_word_count <> 1 then
        raise exception 'Expected accepted community word TS, got %', v_accepted_word_count;
    end if;

    select count(*)
    into v_replay_vote_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'vote_cast';

    if v_replay_vote_count <> 1 then
        raise exception 'Expected exactly 1 vote_cast replay event in accept scenario, got %', v_replay_vote_count;
    end if;

    select count(*)
    into v_replay_validated_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'word_validated';

    if v_replay_validated_count <> 1 then
        raise exception 'Expected exactly 1 word_validated replay event in accept scenario, got %', v_replay_validated_count;
    end if;

    raise notice 'Bot pending_vote acceptance simulation passed';
    raise notice 'accept_match_id=%', v_match_id;
    raise notice 'accept_author_player_id=%', v_author_player_id;
    raise notice 'accept_voter_player_id=%', v_voter_player_id;
    raise notice 'accept_submit_result=%', v_submit_result;
    raise notice 'accept_vote_result=%', v_vote_result;
    raise notice 'accept_move_score=%', v_move_score;
end $$;
