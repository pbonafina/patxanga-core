-- ============================================================
-- PATXANGA - FULL AUTO ENGINE TEST
-- submit_patxanga_move()
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match jsonb;
    v_match_id uuid;
    v_tile jsonb;
    v_tile_id uuid;
    v_submit_result jsonb;
begin

    -- =====================================
    -- Create match
    -- =====================================

    v_match := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'PT',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    v_match_id := (v_match->>'match_id')::uuid;

    -- =====================================
    -- Join second player
    -- =====================================

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    -- =====================================
    -- Start match
    -- =====================================

    perform public.start_patxanga_match(v_match_id);

    -- =====================================
    -- Get one tile from player 1 rack
    -- =====================================

    select value
    into v_tile
    from patxanga_players,
         jsonb_array_elements(rack_state)
    where match_id = v_match_id
      and user_id = v_user1
    limit 1;

    v_tile_id := (v_tile->>'id')::uuid;

    -- =====================================
    -- Submit move at center (8,8)
    -- =====================================

    v_submit_result :=
        public.submit_patxanga_move(
            v_match_id,
            v_user1,
            jsonb_build_array(
                jsonb_build_object(
                    'tile_id', v_tile_id,
                    'row', 8,
                    'col', 8,
                    'declared_letter', null
                )
            )
        );

    raise notice 'Submit result: %', v_submit_result;

    -- =====================================
    -- Final State Debug
    -- =====================================

    raise notice 'Board: %',
        (select board_state from patxanga_matches where id = v_match_id);

    raise notice 'Bag remaining: %',
        (select bag_state->>'remaining'
         from patxanga_matches where id = v_match_id);

    raise notice 'Player 1 score: %',
        (select score
         from patxanga_players
         where match_id = v_match_id
           and user_id = v_user1);

end $$;