-- ============================================================
-- PATXANGA - FULL AUTO ENGINE TEST
-- submit_patxanga_move()
-- Version: 1.5 (Two-letter opening move)
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_rack jsonb;
    v_tile1 jsonb;
    v_tile2 jsonb;
    v_tile1_id uuid;
    v_tile2_id uuid;
    v_submit_result jsonb;
begin

    -- 1. Create match (host = user1)
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    raise notice 'Match created: %', v_match_id;

    -- 2. Join second player
    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    raise notice 'Second player joined: %', v_user2;

    raise notice 'Players in match: %',
    (
        select count(*)
        from patxanga_players
        where match_id = v_match_id
    );

    -- 3. Start match
    perform public.start_patxanga_match(v_match_id);

    raise notice 'Match started';

    -- 4. Discover current turn PLAYER id
    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    raise notice 'Current turn player_id: %', v_current_player_id;

    -- 5. Get current player's rack
    select rack_state
    into v_rack
    from patxanga_players
    where match_id = v_match_id
      and id = v_current_player_id;

    if v_rack is null then
        raise exception 'Current player rack is null';
    end if;

    if jsonb_array_length(v_rack) < 2 then
        raise exception 'Current player rack has fewer than 2 tiles';
    end if;

    v_tile1 := v_rack->0;
    v_tile2 := v_rack->1;

    if v_tile1 is null or v_tile2 is null then
        raise exception 'Could not extract first two tiles from rack';
    end if;

    v_tile1_id := (v_tile1->>'id')::uuid;
    v_tile2_id := (v_tile2->>'id')::uuid;

    raise notice 'Selected tile 1: % (%)', v_tile1_id, v_tile1->>'letter';
    raise notice 'Selected tile 2: % (%)', v_tile2_id, v_tile2->>'letter';

    -- 6. Submit 2-letter move at center: (8,8) and (8,9)
    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_tile1_id::text,
                'row', 8,
                'col', 8,
                'declared_letter', null
            ),
            jsonb_build_object(
                'tile_id', v_tile2_id::text,
                'row', 8,
                'col', 9,
                'declared_letter', null
            )
        )
    );

    raise notice 'Submit result: %', v_submit_result;

end $$;