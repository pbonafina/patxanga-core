-- ============================================================
-- PATXANGA - RPC: submit_patxanga_vote()
-- Version: 1.0
-- Purpose: Resolve persisted pending_vote moves
-- ============================================================

create or replace function public.submit_patxanga_vote(
    p_move_id uuid,
    p_voter_player_id uuid,
    p_vote_reject boolean
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_move record;
    v_match record;
    v_voter record;
    v_move_player record;
    v_votes_required integer;
    v_approvals integer;
    v_rejects integer;
    v_words jsonb;
    v_score jsonb;
    v_new_board jsonb;
    v_new_rack jsonb;
    v_draw_result jsonb;
    v_drawn_tiles jsonb;
    v_new_bag jsonb;
    v_tiles_to_draw integer;
    v_next_player uuid;
    v_new_turn integer;
    v_secondary jsonb;
begin

    -- Lock move
    select *
    into v_move
    from patxanga_moves
    where id = p_move_id
    for update;

    if not found then
        raise exception 'Move not found';
    end if;

    if v_move.status <> 'pending_vote' then
        raise exception 'Move is not pending_vote';
    end if;

    -- Lock match
    select *
    into v_match
    from patxanga_matches
    where id = v_move.match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'voting' then
        raise exception 'Match is not in voting status';
    end if;

    -- Lock voter
    select *
    into v_voter
    from patxanga_players
    where id = p_voter_player_id
      and match_id = v_move.match_id
    for update;

    if not found then
        raise exception 'Voter not found';
    end if;

    if v_voter.id = v_move.player_id then
        raise exception 'Move author cannot vote on own move';
    end if;

    if exists (
        select 1
        from patxanga_votes
        where move_id = p_move_id
          and voter_player_id = p_voter_player_id
    ) then
        raise exception 'Player has already voted on this move';
    end if;

    -- Persist vote
    insert into patxanga_votes (
        move_id,
        match_id,
        voter_player_id,
        vote_reject,
        created_at
    )
    values (
        p_move_id,
        v_move.match_id,
        p_voter_player_id,
        p_vote_reject,
        now()
    );

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        v_move.match_id,
        'vote_cast',
        jsonb_build_object(
            'move_id', p_move_id,
            'voter_player_id', p_voter_player_id,
            'vote_reject', p_vote_reject
        ),
        v_match.turn_number,
        now()
    );

    -- Count votes
    select count(*)
    into v_votes_required
    from patxanga_players
    where match_id = v_move.match_id
      and id <> v_move.player_id;

    select count(*)
    into v_approvals
    from patxanga_votes
    where move_id = p_move_id
      and vote_reject = false;

    select count(*)
    into v_rejects
    from patxanga_votes
    where move_id = p_move_id
      and vote_reject = true;

    -- =========================================
    -- REJECTION BRANCH
    -- =========================================
    if v_rejects > 0 then
        update patxanga_moves
        set status = 'rejected',
            is_dictionary_recognized = false,
            requires_vote = true,
            resolved_at = now(),
            score_breakdown = jsonb_build_object(
                'resolution', 'rejected',
                'approvals', v_approvals,
                'rejects', v_rejects,
                'words', coalesce(v_move.score_breakdown->'words', '[]'::jsonb)
            )
        where id = p_move_id;

        update patxanga_matches
        set status = 'active',
            current_turn_player_id = v_move.player_id,
            updated_at = now()
        where id = v_move.match_id;

        insert into patxanga_replay_events (
            match_id,
            event_type,
            event_payload,
            turn_number,
            created_at
        )
        values (
            v_move.match_id,
            'word_rejected',
            jsonb_build_object(
                'move_id', p_move_id,
                'player_id', v_move.player_id,
                'approvals', v_approvals,
                'rejects', v_rejects
            ),
            v_match.turn_number,
            now()
        );

        return jsonb_build_object(
            'status', 'rejected',
            'move_id', p_move_id,
            'match_status', 'active',
            'current_turn_player_id', v_move.player_id,
            'approvals', v_approvals,
            'rejects', v_rejects
        );
    end if;

    -- Still pending if not all required approvals were cast
    if v_approvals < v_votes_required then
        return jsonb_build_object(
            'status', 'pending_vote',
            'move_id', p_move_id,
            'approvals', v_approvals,
            'rejects', v_rejects,
            'votes_required', v_votes_required
        );
    end if;

    -- =========================================
    -- ACCEPTANCE BRANCH
    -- =========================================

    select *
    into v_move_player
    from patxanga_players
    where id = v_move.player_id
      and match_id = v_move.match_id
    for update;

    if not found then
        raise exception 'Move player not found';
    end if;

    v_words := v_move.score_breakdown->'words';

    if v_words is null then
        raise exception 'Pending move is missing words context';
    end if;

    v_score :=
        public.calculate_patxanga_score(
            v_words,
            v_match.board_state,
            v_move.placed_tiles
        );

    v_new_board :=
        public.build_patxanga_virtual_board(
            v_match.board_state,
            v_move.board_diff
        );

    v_new_rack :=
        public.remove_patxanga_tiles_from_rack(
            v_move_player.rack_state,
            v_move.placed_tiles
        );

    v_tiles_to_draw := 7 - jsonb_array_length(v_new_rack);

    v_draw_result :=
        public.draw_patxanga_tiles_from_bag(
            v_match.bag_state,
            v_tiles_to_draw
        );

    v_drawn_tiles := v_draw_result->'drawn_tiles';
    v_new_bag := v_draw_result->'new_bag_state';

    v_new_rack := v_new_rack || v_drawn_tiles;

    update patxanga_players
    set score = score + (v_score->>'total_score')::integer,
        rack_state = v_new_rack,
        updated_at = now()
    where id = v_move.player_id;

    update patxanga_moves
    set status = 'accepted',
        score_total = (v_score->>'total_score')::integer,
        score_breakdown = jsonb_build_object(
            'words', v_words,
            'final_score', v_score,
            'approvals', v_approvals,
            'rejects', v_rejects
        ),
        is_dictionary_recognized = false,
        requires_vote = true,
        resolved_at = now()
    where id = p_move_id;

    -- Record accepted words
    insert into patxanga_match_accepted_words (
        match_id,
        move_id,
        word,
        normalized_word,
        accepted_reason,
        created_at
    )
    values (
        v_move.match_id,
        p_move_id,
        v_move.main_word,
        public.normalize_patxanga_word(v_move.main_word),
        'community_vote',
        now()
    );

    for v_secondary in
        select value from jsonb_array_elements(coalesce(v_move.secondary_words, '[]'::jsonb))
    loop
        insert into patxanga_match_accepted_words (
            match_id,
            move_id,
            word,
            normalized_word,
            accepted_reason,
            created_at
        )
        values (
            v_move.match_id,
            p_move_id,
            v_secondary->>'word',
            public.normalize_patxanga_word(v_secondary->>'word'),
            'community_vote',
            now()
        );
    end loop;

    -- Advance turn
    select id
    into v_next_player
    from patxanga_players
    where match_id = v_move.match_id
      and turn_order >
          (
              select turn_order
              from patxanga_players
              where id = v_move.player_id
          )
    order by turn_order
    limit 1;

    if v_next_player is null then
        select id
        into v_next_player
        from patxanga_players
        where match_id = v_move.match_id
        order by turn_order
        limit 1;
    end if;

    v_new_turn := v_match.turn_number + 1;

    update patxanga_matches
    set status = 'active',
        board_state = v_new_board,
        bag_state = v_new_bag,
        current_turn_player_id = v_next_player,
        turn_number = v_new_turn,
        updated_at = now()
    where id = v_move.match_id;

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        v_move.match_id,
        'word_validated',
        jsonb_build_object(
            'move_id', p_move_id,
            'player_id', v_move.player_id,
            'score', v_score,
            'approvals', v_approvals,
            'rejects', v_rejects
        ),
        v_new_turn,
        now()
    );

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        v_move.match_id,
        'turn_changed',
        jsonb_build_object(
            'current_turn_player_id', v_next_player
        ),
        v_new_turn,
        now()
    );

    return jsonb_build_object(
        'status', 'accepted',
        'move_id', p_move_id,
        'match_status', 'active',
        'score', v_score,
        'next_player', v_next_player,
        'turn_number', v_new_turn
    );

end;
$$;

grant execute on function public.submit_patxanga_vote(uuid, uuid, boolean)
to authenticated, anon;
