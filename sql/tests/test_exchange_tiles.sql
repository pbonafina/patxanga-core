-- ============================================================
-- PATXANGA - DETERMINISTIC EXCHANGE TILES TEST
-- Version: 1.0
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_rack_before jsonb;
    v_tile1_id uuid;
    v_tile2_id uuid;
    v_bag_before integer;
    v_result jsonb;
begin

    -- 1. Create match
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    -- 2. Join second player
    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    -- 3. Start match
    perform public.start_patxanga_match(v_match_id);

    -- 4. Current turn player
    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    -- 5. Read rack and bag before
    select rack_state
    into v_rack_before
    from patxanga_players
    where id = v_current_player_id;

    if jsonb_array_length(v_rack_before) < 2 then
        raise exception 'Rack has fewer than 2 tiles';
    end if;

    v_tile1_id := (v_rack_before->0->>'id')::uuid;
    v_tile2_id := (v_rack_before->1->>'id')::uuid;

    select (bag_state->>'remaining')::integer
    into v_bag_before
    from patxanga_matches
    where id = v_match_id;

    raise notice 'Current turn player_id: %', v_current_player_id;
    raise notice 'Tile 1 chosen for exchange: %', v_tile1_id;
    raise notice 'Tile 2 chosen for exchange: %', v_tile2_id;
    raise notice 'Bag before: %', v_bag_before;

    -- 6. Exchange two tiles
    v_result := public.submit_patxanga_exchange_tiles(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            v_tile1_id::text,
            v_tile2_id::text
        )
    );

    raise notice 'Exchange result: %', v_result;

    raise notice 'Turn number after: %',
    (
        select turn_number
        from patxanga_matches
        where id = v_match_id
    );

    raise notice 'Current turn player after: %',
    (
        select current_turn_player_id
        from patxanga_matches
        where id = v_match_id
    );

    raise notice 'Bag after: %',
    (
        select bag_state->>'remaining'
        from patxanga_matches
        where id = v_match_id
    );

    raise notice 'Rack size after: %',
    (
        select jsonb_array_length(rack_state)
        from patxanga_players
        where id = v_current_player_id
    );

    raise notice 'Exchange move count: %',
    (
        select count(*)
        from patxanga_moves
        where match_id = v_match_id
          and move_type = 'exchange_tiles'
          and status = 'accepted'
    );

end $$;
