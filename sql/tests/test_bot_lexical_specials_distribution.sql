-- ============================================================
-- PATXANGA - TEST: bot lexical policy, special tiles and distribution
-- ============================================================

do $$
declare
    v_kwy_count integer;
    v_total integer;
    v_c_quantity integer;
    v_policy_easy_kir boolean;
    v_policy_hard_kir boolean;
    v_policy_easy_casa boolean;
    v_policy_easy_queza boolean;
    v_user_id uuid;
    v_guest_id uuid;
    v_match_id uuid;
    v_player_id uuid;
    v_bot_player_id uuid;
    v_c uuid;
    v_a uuid;
    v_s uuid;
    v_pr uuid;
    v_wild uuid;
    v_result jsonb;
    v_candidates jsonb;
    v_move record;
begin
    select
        coalesce(sum(quantity) filter (where letter in ('K', 'W', 'Y')), 0),
        sum(quantity),
        max(quantity) filter (where letter = 'C')
    into v_kwy_count, v_total, v_c_quantity
    from public.patxanga_letter_distribution
    where language = 'pt-PT';

    if v_kwy_count <> 0 then
        raise exception 'Expected no K/W/Y in pt-PT distribution, got %', v_kwy_count;
    end if;

    if v_total <> 110 then
        raise exception 'Expected pt-PT distribution total 110, got %', v_total;
    end if;

    if v_c_quantity <> 5 then
        raise exception 'Expected C quantity 5 after cedilha folding, got %', v_c_quantity;
    end if;

    select
        public.is_patxanga_bot_policy_word('KIR', 'pt-PT', 'easy'),
        public.is_patxanga_bot_policy_word('KIR', 'pt-PT', 'hard'),
        public.is_patxanga_bot_policy_word('CASA', 'pt-PT', 'easy'),
        public.is_patxanga_bot_policy_word('QUEZA', 'pt-PT', 'easy')
    into
        v_policy_easy_kir,
        v_policy_hard_kir,
        v_policy_easy_casa,
        v_policy_easy_queza;

    if v_policy_easy_kir is not false
       or v_policy_hard_kir is not true
       or v_policy_easy_casa is not true
       or v_policy_easy_queza is not false then
        raise exception 'Unexpected lexical policy: easy_kir=%, hard_kir=%, easy_casa=%, easy_queza=%',
            v_policy_easy_kir,
            v_policy_hard_kir,
            v_policy_easy_casa,
            v_policy_easy_queza;
    end if;

    -- Patxanga Real must double main-word score.
    v_user_id := gen_random_uuid();
    v_guest_id := gen_random_uuid();
    v_c := gen_random_uuid();
    v_a := gen_random_uuid();
    v_s := gen_random_uuid();
    v_pr := gen_random_uuid();

    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user_id,
        p_host_guest_name := 'PR Score Test',
        p_language := 'pt-PT',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(v_match_id, v_guest_id, 'Other');
    perform public.start_patxanga_match(v_match_id);

    select id
    into v_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and user_id = v_user_id;

    update public.patxanga_matches
    set current_turn_player_id = v_player_id,
        turn_number = 1,
        updated_at = now()
    where id = v_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_c::text, 'letter', 'C', 'points', 3, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_a::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_s::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_pr::text, 'letter', 'PR', 'points', 0, 'is_special', true, 'special_type', 'patxanga_real'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_player_id;

    v_result := public.submit_patxanga_move(
        v_match_id,
        v_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_c::text, 'row', 8, 'col', 7, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_s::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pr::text, 'row', 8, 'col', 10, 'declared_letter', 'A')
        )
    );

    select *
    into v_move
    from public.patxanga_moves
    where match_id = v_match_id
    order by created_at desc
    limit 1;

    if v_move.used_patxanga_real is not true
       or coalesce((v_move.score_breakdown->'final_score'->>'patxanga_real_applied')::boolean, false) is not true
       or v_move.score_total <> 20 then
        raise exception 'Expected PR CASA score 20 with applied flag, got move=% result=%', row_to_json(v_move), v_result;
    end if;

    -- Easy bot must be able to use wildcard as a declared letter when no normal word is available.
    v_user_id := gen_random_uuid();
    v_guest_id := gen_random_uuid();
    v_wild := gen_random_uuid();

    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user_id,
        p_host_guest_name := 'Human',
        p_language := 'pt-PT',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );
    v_bot_player_id := public.join_patxanga_match(v_match_id, v_guest_id, 'Bot Easy', true, 'easy', 'balanced');
    perform public.start_patxanga_match(v_match_id);

    update public.patxanga_matches
    set current_turn_player_id = v_bot_player_id,
        turn_number = 1,
        updated_at = now()
    where id = v_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_wild::text, 'letter', '*', 'points', 0, 'is_special', true, 'special_type', 'wildcard'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn')
        ),
        updated_at = now()
    where id = v_bot_player_id;

    v_candidates := public.find_patxanga_playable_bot_candidate_moves(v_match_id, v_bot_player_id, 5);

    if jsonb_array_length(v_candidates) = 0
       or coalesce((v_candidates->0->>'wildcard_count')::integer, 0) < 1 then
        raise exception 'Expected wildcard bot candidate, got %', v_candidates;
    end if;

    -- Easy bot must be able to use PR and receive doubled score.
    v_user_id := gen_random_uuid();
    v_guest_id := gen_random_uuid();
    v_pr := gen_random_uuid();

    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user_id,
        p_host_guest_name := 'Human',
        p_language := 'pt-PT',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );
    v_bot_player_id := public.join_patxanga_match(v_match_id, v_guest_id, 'Bot Easy', true, 'easy', 'balanced');
    perform public.start_patxanga_match(v_match_id);

    update public.patxanga_matches
    set current_turn_player_id = v_bot_player_id,
        turn_number = 1,
        updated_at = now()
    where id = v_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_pr::text, 'letter', 'PR', 'points', 0, 'is_special', true, 'special_type', 'patxanga_real'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn'),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'SKIP', 'points', 0, 'is_special', true, 'special_type', 'skip_turn')
        ),
        updated_at = now()
    where id = v_bot_player_id;

    v_result := public.submit_patxanga_easy_bot_turn(v_match_id, v_bot_player_id);

    if v_result->>'bot_action' <> 'place_word'
       or coalesce((v_result->'score'->>'patxanga_real_applied')::boolean, false) is not true then
        raise exception 'Expected PR bot move with applied score, got %', v_result;
    end if;

    raise notice 'Bot lexical/special/distribution test passed';
end $$;
