-- ============================================================
-- PATXANGA - FULL AUTO ENGINE TEST
-- submit_patxanga_move()
-- Version: 1.1
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_tile jsonb;
    v_tile_id uuid;
    v_submit_result jsonb;
begin

    -- =====================================
    -- 1. Create match
    -- =====================================

    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    raise notice 'Match created: %', v_match_id;

    -- =====================================
    -- 2. Join second player
    -- =====================================

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    raise notice 'Second player joined: %', v_user2;

    -- =====================================
    -- 3. Start match
    -- =====================================

    perform public.start_patxanga_match(v_match_id);

    raise notice 'Match started';

    -- =====================================
    -- 4. Get one tile from player 1 rack
    -- =====================================

    select value
    into v_tile
    from patxanga_players,
         jsonb_array_elements(rack_state)
    where match_id = v_match_id
      and user_id = v_user1
    limit 1;

    if v_tile is null then
        raise exception 'No tile found in player 1 rack';
    end if;

    v_tile_id := (v_tile->>'id')::uuid;

    raise notice 'Selected tile id: %', v_tile_id;

    -- =====================================
    -- 5. Submit move at center (8,8)
    -- =====================================

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_user1,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_tile_id::text,
                'row', 8,
                'col', 8,
                'declared_letter', null
            )
        )
    );

    raise notice 'Submit result: %', v_submit_result;

    -- =====================================
    -- 6. Final state debug
    -- =====================================

    raise notice 'Board: %',
        (select board_state
         from patxanga_matches
         where id = v_match_id);

    raise notice 'Bag remaining: %',
        (select bag_state->>'remaining'
         from patxanga_matches
         where id = v_match_id);

    raise notice 'Player 1 score: %',
        (select score
         from patxanga_players
         where match_id = v_match_id
           and user_id = v_user1);

    raise notice 'Player 1 rack size: %',
        (select jsonb_array_length(rack_state)
         from patxanga_players
         where match_id = v_match_id
           and user_id = v_user1);

    raise notice 'Replay count: %',
        (select count(*)
         from patxanga_replay_events
         where match_id = v_match_id);

end $$;