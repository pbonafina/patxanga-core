-- ============================================================
-- PATXANGA - RPC: create_patxanga_match()
-- Version: 1.1
-- ============================================================

create or replace function public.create_patxanga_match(
    p_language text,
    p_match_mode text default 'synchronous',
    p_turn_time_seconds integer default null,
    p_hint_mode_enabled boolean default false,
    p_host_user_id uuid default null,
    p_host_guest_name text default null,
    p_max_players integer default 4
)
returns uuid
language plpgsql
security definer
as
$$
declare
    v_match_id uuid;
    v_board_state jsonb;
    v_bag_state jsonb;
    v_host_player_id uuid;
    v_host_display_name text;
begin

    if p_language not in ('pt-BR', 'pt-PT') then
        raise exception 'Invalid language';
    end if;

    if p_host_user_id is null and p_host_guest_name is null then
        raise exception 'Host identity is required';
    end if;

    -- 15x15 empty board
    v_board_state :=
    (
        select jsonb_agg(row_data)
        from (
            select jsonb_agg(null::jsonb) as row_data
            from generate_series(1,15)
        ) rows,
        generate_series(1,15)
    );

    v_bag_state := jsonb_build_object(
        'tiles', jsonb_build_array(),
        'remaining', 0
    );

    v_host_display_name := coalesce(p_host_guest_name, 'Host');

    insert into patxanga_matches (
        status,
        match_mode,
        language,
        host_user_id,
        host_guest_name,
        max_players,
        turn_time_seconds,
        hint_mode_enabled,
        board_state,
        bag_state,
        turn_number,
        created_at,
        updated_at
    )
    values (
        'waiting',
        p_match_mode,
        p_language,
        p_host_user_id,
        p_host_guest_name,
        p_max_players,
        p_turn_time_seconds,
        p_hint_mode_enabled,
        v_board_state,
        v_bag_state,
        0,
        now(),
        now()
    )
    returning id into v_match_id;

    -- Insert Host as First Player
    insert into patxanga_players (
        match_id,
        user_id,
        guest_name,
        display_name,
        seat_index,
        turn_order,
        is_bot,
        bot_level,
        bot_profile,
        rack_state,
        score,
        created_at,
        updated_at
    )
    values (
        v_match_id,
        p_host_user_id,
        p_host_guest_name,
        v_host_display_name,
        1,
        0,
        false,
        null,
        null,
        jsonb_build_array(),
        0,
        now(),
        now()
    )
    returning id into v_host_player_id;

    insert into patxanga_match_presence (
        match_id,
        player_id,
        is_online,
        last_ping_at,
        updated_at
    )
    values (
        v_match_id,
        v_host_player_id,
        true,
        now(),
        now()
    );

    return v_match_id;

end;
$$;

grant execute on function public.create_patxanga_match(
    text,
    text,
    integer,
    boolean,
    uuid,
    text,
    integer
) to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: join_patxanga_match()
-- Version: 1.1
-- Mode: Synchronous
-- ============================================================

create or replace function public.join_patxanga_match(
    p_match_id uuid,
    p_user_id uuid default null,
    p_guest_name text default null,
    p_is_bot boolean default false,
    p_bot_level text default null,
    p_bot_profile text default null
)
returns uuid
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_current_count integer;
    v_seat_index integer;
    v_player_id uuid;
begin

    -- =============================
    -- Validate match
    -- =============================

    select *
    into v_match
    from patxanga_matches
    where id = p_match_id;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'waiting' then
        raise exception 'Match not open for joining';
    end if;

    -- =============================
    -- Validate capacity
    -- =============================

    select count(*)
    into v_current_count
    from patxanga_players
    where match_id = p_match_id;

    if v_current_count >= v_match.max_players then
        raise exception 'Match is full';
    end if;

    -- =============================
    -- Determine seat only
    -- =============================

    select coalesce(max(seat_index), 0) + 1
    into v_seat_index
    from patxanga_players
    where match_id = p_match_id;

    -- =============================
    -- Validate bot parameters
    -- =============================

    if p_is_bot = true then

        if p_bot_level not in ('easy','medium','hard') then
            raise exception 'Invalid bot level';
        end if;

        if p_bot_profile not in ('aggressive','balanced','defensive') then
            raise exception 'Invalid bot profile';
        end if;

    end if;

    -- =============================
    -- Insert player (turn_order = NULL)
    -- =============================

    insert into patxanga_players (
    match_id,
    user_id,
    guest_name,
    display_name,
    seat_index,
    turn_order,
    is_bot,
    bot_level,
    bot_profile,
    rack_state,
    score,
    created_at,
    updated_at
)
values (
    p_match_id,
    p_user_id,
    p_guest_name,
    coalesce(p_guest_name, 'Player'),
    v_seat_index,
    v_seat_index, -- turn_order temporario ate o start redefinir a ordem final
    p_is_bot,
    p_bot_level,
    p_bot_profile,
    jsonb_build_array(),
    0,
    now(),
    now()
)
returning id into v_player_id;

    -- =============================
    -- Insert presence
    -- =============================

    insert into patxanga_match_presence (
        match_id,
        player_id,
        is_online,
        last_ping_at,
        updated_at
    )
    values (
        p_match_id,
        v_player_id,
        true,
        now(),
        now()
    );

    -- =============================
    -- Replay event
    -- =============================

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        p_match_id,
        'player_joined',
        jsonb_build_object(
            'player_id', v_player_id,
            'seat_index', v_seat_index,
            'is_bot', p_is_bot
        ),
        0,
        now()
    );

    return v_player_id;

end;
$$;

grant execute on function public.join_patxanga_match(
    uuid,
    uuid,
    text,
    boolean,
    text,
    text
) to authenticated, anon;-- ============================================================
-- PATXANGA - FUNCTION: initialize_patxanga_bag()
-- Version: 1.0
-- ============================================================

create or replace function public.initialize_patxanga_bag(
    p_language text
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_tile_record record;
    v_tiles jsonb := '[]'::jsonb;
    v_tile_id uuid;
    v_shuffled jsonb;
    i integer;
begin

    if p_language not in ('pt-BR','pt-PT') then
        raise exception 'Invalid language';
    end if;

    for v_tile_record in
        select *
        from patxanga_letter_distribution
        where language = p_language
    loop
        for i in 1..v_tile_record.quantity loop
            v_tile_id := uuid_generate_v4();

            v_tiles :=
                v_tiles ||
                jsonb_build_array(
                    jsonb_build_object(
                        'id', v_tile_id,
                        'letter', v_tile_record.letter,
                        'points', v_tile_record.points,
                        'is_special', v_tile_record.is_special,
                        'special_type', v_tile_record.special_type
                    )
                );
        end loop;
    end loop;

    select jsonb_agg(tile)
    into v_shuffled
    from (
        select tile
        from jsonb_array_elements(v_tiles) as tile
        order by random()
    ) shuffled_tiles;

    return jsonb_build_object(
        'tiles', v_shuffled,
        'remaining', jsonb_array_length(v_shuffled)
    );

end;
$$;

grant execute on function public.initialize_patxanga_bag(text)
to authenticated, anon;-- ============================================================
-- PATXANGA - FUNCTION: initialize_patxanga_board()
-- Version: 1.0
-- ============================================================

create or replace function public.initialize_patxanga_board()
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_board jsonb := '[]'::jsonb;
    v_row jsonb;
    v_cell jsonb;
    r integer;
    c integer;
    v_multiplier text;
begin

    for r in 1..15 loop
        v_row := '[]'::jsonb;

        for c in 1..15 loop

            -- =============================
            -- Define multiplier by position
            -- =============================

            v_multiplier := 'NM';

            -- PT (cantos)
            if (r = 1 and c = 1) or
               (r = 1 and c = 15) or
               (r = 15 and c = 1) or
               (r = 15 and c = 15) then
                v_multiplier := 'PT';

            -- PD (layout oficial)
            elsif (r, c) in (
                (1,8),(2,2),(2,14),(3,3),(3,13),
                (4,4),(4,12),(5,5),(5,11),
                (8,1),(8,8),(8,15),
                (11,5),(11,11),(12,4),(12,12),
                (13,3),(13,13),(14,2),(14,14),
                (15,8)
            ) then
                v_multiplier := 'PD';

            -- LT
            elsif (r, c) in (
                (2,6),(2,10),(6,2),(6,6),(6,10),(6,14),
                (10,2),(10,6),(10,10),(10,14),
                (14,6),(14,10)
            ) then
                v_multiplier := 'LT';

            -- LD
            elsif (r, c) in (
                (1,4),(1,12),
                (4,1),(4,8),(4,15),
                (7,3),(7,7),(7,9),(7,13),
                (8,4),(8,12),
                (9,3),(9,7),(9,9),(9,13),
                (12,1),(12,8),(12,15),
                (15,4),(15,12)
            ) then
                v_multiplier := 'LD';
            end if;

            -- =============================
            -- Build cell
            -- =============================

            v_cell := jsonb_build_object(
                'tile', null,
                'multiplier_type', v_multiplier
            );

            v_row := v_row || jsonb_build_array(v_cell);

        end loop;

        v_board := v_board || jsonb_build_array(v_row);

    end loop;

    return v_board;

end;
$$;

grant execute on function public.initialize_patxanga_board()
to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: start_patxanga_match()
-- Version: 1.1
-- Mode: Synchronous
-- ============================================================

create or replace function public.start_patxanga_match(
    p_match_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player_count integer;

    v_bag jsonb;
    v_tiles jsonb;
    v_total_tiles integer;

    v_board jsonb;

    v_remaining_tiles jsonb;
    v_current_index integer := 0;

    v_player record;
    v_shuffled_player_ids uuid[];
    v_first_player_id uuid;

    v_player_rack jsonb;
    i integer;
begin

    -- =============================
    -- Validate match
    -- =============================

    select *
    into v_match
    from patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'waiting' then
        raise exception 'Match is not in waiting status';
    end if;

    if v_match.match_mode <> 'synchronous' then
        raise exception 'Only synchronous matches supported in v1.1';
    end if;

    -- =============================
    -- Validate player count
    -- =============================

    select count(*)
    into v_player_count
    from patxanga_players
    where match_id = p_match_id;

    if v_player_count < 2 then
        raise exception 'At least 2 players are required to start';
    end if;

    if v_player_count > v_match.max_players then
        raise exception 'Player count exceeds match capacity';
    end if;

    -- =============================
    -- Initialize bag
    -- =============================

    v_bag := public.initialize_patxanga_bag(v_match.language);
    v_tiles := v_bag->'tiles';
    v_total_tiles := jsonb_array_length(v_tiles);

    if v_total_tiles < (v_player_count * 7) then
        raise exception 'Not enough tiles to start match';
    end if;

    -- =============================
    -- Initialize board
    -- =============================

    v_board := public.initialize_patxanga_board();

    -- =============================
    -- Shuffle player order
    -- =============================

    select array_agg(id order by random())
    into v_shuffled_player_ids
    from patxanga_players
    where match_id = p_match_id;

    if v_shuffled_player_ids is null
       or array_length(v_shuffled_player_ids, 1) is null then
        raise exception 'Could not determine player order';
    end if;

    -- =============================
    -- Update turn_order for players
    -- =============================

    for i in 1..array_length(v_shuffled_player_ids, 1) loop
        update patxanga_players
        set
            turn_order = i,
            updated_at = now()
        where id = v_shuffled_player_ids[i];
    end loop;

    v_first_player_id := v_shuffled_player_ids[1];

    -- =============================
    -- Distribute 7 tiles per player
    -- =============================

    for v_player in
        select id
        from patxanga_players
        where match_id = p_match_id
        order by turn_order
    loop

        select jsonb_agg(tile)
        into v_player_rack
        from (
            select value as tile
            from jsonb_array_elements(v_tiles)
            with ordinality
            where ordinality > v_current_index
              and ordinality <= v_current_index + 7
            order by ordinality
        ) rack_slice;

        if v_player_rack is null then
            v_player_rack := '[]'::jsonb;
        end if;

        update patxanga_players
        set
            rack_state = v_player_rack,
            updated_at = now()
        where id = v_player.id;

        insert into patxanga_replay_events (
            match_id,
            event_type,
            event_payload,
            turn_number,
            created_at
        )
        values (
            p_match_id,
            'tiles_drawn',
            jsonb_build_object(
                'player_id', v_player.id,
                'tile_count', 7
            ),
            1,
            now()
        );

        v_current_index := v_current_index + 7;
    end loop;

    -- =============================
    -- Remaining bag
    -- =============================

    select jsonb_agg(tile)
    into v_remaining_tiles
    from (
        select value as tile
        from jsonb_array_elements(v_tiles)
        with ordinality
        where ordinality > v_current_index
        order by ordinality
    ) remaining_slice;

    if v_remaining_tiles is null then
        v_remaining_tiles := '[]'::jsonb;
    end if;

    -- =============================
    -- Activate match
    -- =============================

    update patxanga_matches
    set
        status = 'active',
        board_state = v_board,
        bag_state = jsonb_build_object(
            'tiles', v_remaining_tiles,
            'remaining', jsonb_array_length(v_remaining_tiles)
        ),
        current_turn_player_id = v_first_player_id,
        turn_number = 1,
        started_at = now(),
        updated_at = now()
    where id = p_match_id;

    -- =============================
    -- Replay events
    -- =============================

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        p_match_id,
        'match_started',
        jsonb_build_object(
            'player_count', v_player_count,
            'first_player_id', v_first_player_id
        ),
        1,
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
        p_match_id,
        'turn_changed',
        jsonb_build_object(
            'current_turn_player_id', v_first_player_id
        ),
        1,
        now()
    );

    -- =============================
    -- Return summary
    -- =============================

    return jsonb_build_object(
        'match_id', p_match_id,
        'status', 'active',
        'turn_number', 1,
        'current_turn_player_id', v_first_player_id,
        'remaining_tiles', jsonb_array_length(v_remaining_tiles)
    );

end;
$$;

grant execute on function public.start_patxanga_match(uuid)
to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: normalize_patxanga_word()
-- Version: 1.0
-- ============================================================

create or replace function public.normalize_patxanga_word(
    p_word text
)
returns text
language plpgsql
immutable
as
$$
declare
    v_word text;
begin
    if p_word is null then
        return null;
    end if;

    v_word := upper(p_word);

    -- Remover acentos manualmente
    v_word := translate(
        v_word,
        'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
        'AAAAAEEEEIIIIOOOOOUUUUC'
    );

    return v_word;
end;
$$;

grant execute on function public.normalize_patxanga_word(text)
to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: validate_word()
-- Version: 1.0
-- ============================================================

create or replace function public.validate_word(
    p_word text
)
returns boolean
language plpgsql
stable
as
$$
declare
    v_normalized text;
    v_exists integer;
begin
    if p_word is null then
        return false;
    end if;

    v_normalized := public.normalize_patxanga_word(p_word);

    select 1
    into v_exists
    from patxanga_dictionary
    where word_normalized = v_normalized
    limit 1;

    return v_exists is not null;
end;
$$;

grant execute on function public.validate_word(text)
to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: validate_patxanga_move_alignment()
-- Version: 1.0
-- Purpose: Validate geometric integrity of placed tiles
-- ============================================================

create or replace function public.validate_patxanga_move_alignment(
    p_placed_tiles jsonb
)
returns void
language plpgsql
immutable
as
$$
declare
    v_count integer;
    v_rows integer[];
    v_cols integer[];
    v_min_row integer;
    v_max_row integer;
    v_min_col integer;
    v_max_col integer;
    v_distinct_rows integer;
    v_distinct_cols integer;
    v_expected_count integer;
begin

    -- --------------------------------------------------------
    -- 1. Payload must not be empty
    -- --------------------------------------------------------

    v_count := jsonb_array_length(p_placed_tiles);

    if v_count is null or v_count = 0 then
        raise exception 'No tiles provided in move';
    end if;

    if v_count > 7 then
        raise exception 'Cannot place more than 7 tiles';
    end if;

    -- --------------------------------------------------------
    -- 2. Extract rows and columns
    -- --------------------------------------------------------

    select array_agg((tile->>'row')::integer),
           array_agg((tile->>'col')::integer)
    into v_rows, v_cols
    from jsonb_array_elements(p_placed_tiles) tile;

    -- --------------------------------------------------------
    -- 3. Validate coordinate range
    -- --------------------------------------------------------

    if exists (
        select 1
        from unnest(v_rows) r
        where r < 1 or r > 15
    ) then
        raise exception 'Row out of bounds (must be between 1 and 15)';
    end if;

    if exists (
        select 1
        from unnest(v_cols) c
        where c < 1 or c > 15
    ) then
        raise exception 'Column out of bounds (must be between 1 and 15)';
    end if;

    -- --------------------------------------------------------
    -- 4. Validate no duplicate coordinates
    -- --------------------------------------------------------

    if (
        select count(*)
        from (
            select (tile->>'row')::integer as r,
                   (tile->>'col')::integer as c
            from jsonb_array_elements(p_placed_tiles) tile
            group by r, c
        ) s
    ) <> v_count then
        raise exception 'Duplicate coordinates detected in move';
    end if;

    -- --------------------------------------------------------
    -- 5. Detect alignment
    -- --------------------------------------------------------

    select count(distinct r), count(distinct c)
    into v_distinct_rows, v_distinct_cols
    from (
        select (tile->>'row')::integer as r,
               (tile->>'col')::integer as c
        from jsonb_array_elements(p_placed_tiles) tile
    ) s;

    if v_distinct_rows > 1 and v_distinct_cols > 1 then
        raise exception 'Tiles must be aligned horizontally or vertically';
    end if;

    -- --------------------------------------------------------
    -- 6. Validate continuity (no internal gaps)
    -- --------------------------------------------------------

    if v_distinct_rows = 1 then
        -- Horizontal word
        select min(c), max(c)
        into v_min_col, v_max_col
        from unnest(v_cols) c;

        v_expected_count := v_max_col - v_min_col + 1;

        if v_expected_count <> v_count then
            raise exception 'Horizontal move contains gaps';
        end if;

    elsif v_distinct_cols = 1 then
        -- Vertical word
        select min(r), max(r)
        into v_min_row, v_max_row
        from unnest(v_rows) r;

        v_expected_count := v_max_row - v_min_row + 1;

        if v_expected_count <> v_count then
            raise exception 'Vertical move contains gaps';
        end if;
    end if;

end;
$$;

grant execute on function public.validate_patxanga_move_alignment(jsonb)
to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: validate_patxanga_tile_ownership()
-- Version: 1.0
-- Purpose: Ensure all placed tiles belong to player's rack
-- ============================================================

create or replace function public.validate_patxanga_tile_ownership(
    p_rack_state jsonb,
    p_placed_tiles jsonb
)
returns void
language plpgsql
stable
as
$$
declare
    v_tile jsonb;
    v_tile_id uuid;
    v_count integer;
begin

    if p_rack_state is null then
        raise exception 'Rack state is null';
    end if;

    if p_placed_tiles is null then
        raise exception 'Placed tiles cannot be null';
    end if;

    -- Prevent duplicate UUIDs in payload
    select count(*) into v_count
    from (
        select (value->>'tile_id') as id
        from jsonb_array_elements(p_placed_tiles)
        group by id
        having count(*) > 1
    ) dup;

    if v_count > 0 then
        raise exception 'Duplicate tile_id in move payload';
    end if;

    -- Validate ownership
    for v_tile in
        select value from jsonb_array_elements(p_placed_tiles)
    loop
        v_tile_id := (v_tile->>'tile_id')::uuid;

        if not exists (
            select 1
            from jsonb_array_elements(p_rack_state) r
            where (r->>'id')::uuid = v_tile_id
        ) then
            raise exception 'Tile % does not belong to player rack', v_tile_id;
        end if;

    end loop;

end;
$$;

grant execute on function public.validate_patxanga_tile_ownership(jsonb, jsonb)
to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: hydrate_patxanga_placed_tiles()
-- Version: 1.0
-- Purpose: Expand placed tile payload using full rack tile objects
-- ============================================================

create or replace function public.hydrate_patxanga_placed_tiles(
    p_rack_state jsonb,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
stable
as
$$
declare
    v_result jsonb := '[]'::jsonb;
    v_input_tile jsonb;
    v_rack_tile jsonb;
    v_tile_id uuid;
    v_found boolean;
begin

    if p_rack_state is null then
        raise exception 'Rack state cannot be null';
    end if;

    if p_placed_tiles is null then
        raise exception 'Placed tiles cannot be null';
    end if;

    for v_input_tile in
        select value
        from jsonb_array_elements(p_placed_tiles)
    loop
        v_found := false;
        v_tile_id := (v_input_tile->>'tile_id')::uuid;

        select rack_tile
        into v_rack_tile
        from (
            select value as rack_tile
            from jsonb_array_elements(p_rack_state)
        ) r
        where (r.rack_tile->>'id')::uuid = v_tile_id
        limit 1;

        if v_rack_tile is null then
            raise exception 'Tile % not found in rack_state', v_tile_id;
        end if;

        v_found := true;

        v_result := v_result || jsonb_build_array(
            v_rack_tile
            || jsonb_build_object(
                'row', (v_input_tile->>'row')::integer,
                'col', (v_input_tile->>'col')::integer,
                'declared_letter', v_input_tile->>'declared_letter'
            )
        );
    end loop;

    return v_result;
end;
$$;

grant execute on function public.hydrate_patxanga_placed_tiles(jsonb, jsonb)
to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: build_patxanga_virtual_board()
-- Version: 1.0
-- Purpose: Merge current board with placed tiles (no persistence)
-- ============================================================

create or replace function public.build_patxanga_virtual_board(
    p_board_state jsonb,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
stable
as
$$
declare
    v_virtual_board jsonb;
    v_tile jsonb;
    v_row integer;
    v_col integer;
    v_existing_cell jsonb;
begin

    if p_board_state is null then
        raise exception 'Board state is null';
    end if;

    if p_placed_tiles is null then
        raise exception 'Placed tiles cannot be null';
    end if;

    -- Clone board to avoid mutation
    v_virtual_board := p_board_state;

    -- Iterate over placed tiles
    for v_tile in
        select value
        from jsonb_array_elements(p_placed_tiles)
    loop
        v_row := (v_tile->>'row')::integer;
        v_col := (v_tile->>'col')::integer;

        -- Extract existing cell
        v_existing_cell :=
            v_virtual_board
            -> (v_row - 1)
            -> (v_col - 1);

        if v_existing_cell is null then
            raise exception 'Invalid board coordinate';
        end if;

        -- Validate cell is empty
        if (v_existing_cell->>'tile') is not null then
            raise exception 'Cannot place tile on occupied cell';
        end if;

        -- Inject tile object into virtual board
        v_virtual_board :=
            jsonb_set(
                v_virtual_board,
                array[
                    (v_row - 1)::text,
                    (v_col - 1)::text,
                    'tile'
                ],
                v_tile,
                false
            );

    end loop;

    return v_virtual_board;

end;
$$;

grant execute on function public.build_patxanga_virtual_board(jsonb, jsonb)
to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: extract_patxanga_words()
-- Version: 1.0
-- Purpose: Extract main and secondary words from virtual board
-- ============================================================

create or replace function public.extract_patxanga_words(
    p_virtual_board jsonb,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
stable
as
$$
declare
    v_first_tile jsonb;
    v_row integer;
    v_col integer;
    v_direction text;
    v_word text;
    v_words jsonb := '[]'::jsonb;
    v_letter text;
    v_current jsonb;
    v_tiles jsonb := '[]'::jsonb;
    r integer;
    c integer;
begin

    if p_virtual_board is null then
        raise exception 'Virtual board cannot be null';
    end if;

    if jsonb_array_length(p_placed_tiles) = 0 then
        raise exception 'No placed tiles';
    end if;

    -- Determine direction from first two tiles
    if jsonb_array_length(p_placed_tiles) = 1 then
        v_direction := 'H';
    else
        if (p_placed_tiles->0->>'row') = (p_placed_tiles->1->>'row') then
            v_direction := 'H';
        else
            v_direction := 'V';
        end if;
    end if;

    -- Take first tile as anchor
    v_first_tile := p_placed_tiles->0;
    v_row := (v_first_tile->>'row')::integer;
    v_col := (v_first_tile->>'col')::integer;

    -- Expand backwards to find start
    if v_direction = 'H' then
        while v_col > 1 loop
            v_current := p_virtual_board->(v_row-1)->(v_col-2);
            exit when v_current->>'tile' is null;
            v_col := v_col - 1;
        end loop;
    else
        while v_row > 1 loop
            v_current := p_virtual_board->(v_row-2)->(v_col-1);
            exit when v_current->>'tile' is null;
            v_row := v_row - 1;
        end loop;
    end if;

    -- Traverse forward and build main word
    loop
        v_current := p_virtual_board->(v_row-1)->(v_col-1);
        exit when v_current is null;
        exit when v_current->>'tile' is null;

        v_letter := v_current->'tile'->>'declared_letter';
        if v_letter is null then
            v_letter := v_current->'tile'->>'letter';
        end if;

        v_word := coalesce(v_word, '') || v_letter;

        v_tiles := v_tiles || jsonb_build_array(
            jsonb_build_object(
                'row', v_row,
                'col', v_col,
                'tile', v_current->'tile'
            )
        );

        if v_direction = 'H' then
            v_col := v_col + 1;
            exit when v_col > 15;
        else
            v_row := v_row + 1;
            exit when v_row > 15;
        end if;
    end loop;

    v_words := v_words || jsonb_build_array(
        jsonb_build_object(
            'type', 'main',
            'direction', v_direction,
            'word', v_word,
            'tiles', v_tiles
        )
    );

    return v_words;

end;
$$;

grant execute on function public.extract_patxanga_words(jsonb, jsonb)
to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: calculate_patxanga_score()
-- Version: 1.1
-- Purpose: Calculate score breakdown (no persistence)
-- ============================================================

create or replace function public.calculate_patxanga_score(
    p_words jsonb,
    p_board_state jsonb,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
stable
as
$$
declare
    v_word jsonb;
    v_tile jsonb;
    v_score_main integer := 0;
    v_score_secondary integer := 0;
    v_word_score integer;
    v_letter_score integer;
    v_word_multiplier integer;
    v_is_main boolean;
    v_is_new boolean;
    v_bonus_7 integer := 0;
    v_has_patxanga_real boolean := false;
    v_total integer := 0;
    v_multiplier_type text;
    v_breakdown jsonb := '{}'::jsonb;
begin

    if p_words is null then
        raise exception 'Words cannot be null';
    end if;

    if p_placed_tiles is null then
        raise exception 'Placed tiles cannot be null';
    end if;

    -- Detect if 7 tiles used
    if jsonb_array_length(p_placed_tiles) = 7 then
        v_bonus_7 := 20;
    end if;

    -- Detect Patxanga Real usage
    for v_tile in
        select value from jsonb_array_elements(p_placed_tiles)
    loop
        if coalesce(v_tile->>'special_type', '') = 'PATXANGA_REAL'
           or coalesce(v_tile->>'special_type', '') = 'patxanga_real' then
            v_has_patxanga_real := true;
        end if;
    end loop;

    -- Iterate through words
    for v_word in
        select value from jsonb_array_elements(p_words)
    loop
        v_word_score := 0;
        v_word_multiplier := 1;
        v_is_main := (v_word->>'type') = 'main';

        -- Iterate through tiles of word
        for v_tile in
            select value from jsonb_array_elements(v_word->'tiles')
        loop
            v_letter_score := coalesce((v_tile->'tile'->>'points')::integer, 0);

            -- Check if tile is newly placed
            v_is_new := exists (
                select 1
                from jsonb_array_elements(p_placed_tiles) pt
                where (pt->>'tile_id') = coalesce(v_tile->'tile'->>'id', pt->>'tile_id')
            );

            if v_is_new then
                v_multiplier_type :=
                    p_board_state
                    -> ((v_tile->>'row')::integer - 1)
                    -> ((v_tile->>'col')::integer - 1)
                    ->> 'multiplier_type';

                case coalesce(v_multiplier_type, 'NM')
                    when 'LD' then
                        v_letter_score := v_letter_score * 2;
                    when 'LT' then
                        v_letter_score := v_letter_score * 3;
                    when 'PD' then
                        v_word_multiplier := v_word_multiplier * 2;
                    when 'PT' then
                        v_word_multiplier := v_word_multiplier * 3;
                    when 'NM' then
                        null;
                    else
                        null;
                end case;
            end if;

            v_word_score := v_word_score + v_letter_score;
        end loop;

        v_word_score := v_word_score * v_word_multiplier;

        if v_is_main then
            v_score_main := v_word_score;
        else
            v_score_secondary := v_score_secondary + v_word_score;
        end if;
    end loop;

    -- Apply bonus before Patxanga Real
    v_score_main := v_score_main + v_bonus_7;

    -- Apply Patxanga Real only to main word
    if v_has_patxanga_real then
        v_score_main := v_score_main * 2;
    end if;

    v_total := v_score_main + v_score_secondary;

    v_breakdown := jsonb_build_object(
        'main_word_score', v_score_main,
        'secondary_words_score', v_score_secondary,
        'bonus_7', v_bonus_7,
        'patxanga_real_applied', v_has_patxanga_real,
        'total_score', v_total
    );

    return v_breakdown;
end;
$$;

grant execute on function public.calculate_patxanga_score(jsonb, jsonb, jsonb)
to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: remove_patxanga_tiles_from_rack()
-- Version: 1.0
-- Purpose: Remove placed tiles from rack_state safely
-- ============================================================

create or replace function public.remove_patxanga_tiles_from_rack(
    p_rack_state jsonb,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
immutable
as
$$
declare
    v_new_rack jsonb := '[]'::jsonb;
    v_rack_tile jsonb;
    v_tile_id uuid;
    v_should_remove boolean;
begin

    if p_rack_state is null then
        raise exception 'Rack state cannot be null';
    end if;

    if p_placed_tiles is null then
        raise exception 'Placed tiles cannot be null';
    end if;

    -- Iterate through rack
    for v_rack_tile in
        select value from jsonb_array_elements(p_rack_state)
    loop
        v_should_remove := false;

        -- Check if this rack tile exists in placed tiles
        for v_tile_id in
            select (value->>'tile_id')::uuid
            from jsonb_array_elements(p_placed_tiles)
        loop
            if (v_rack_tile->>'id')::uuid = v_tile_id then
                v_should_remove := true;
                exit;
            end if;
        end loop;

        -- If not used, keep it
        if not v_should_remove then
            v_new_rack := v_new_rack || jsonb_build_array(v_rack_tile);
        end if;

    end loop;

    return v_new_rack;

end;
$$;

grant execute on function public.remove_patxanga_tiles_from_rack(jsonb, jsonb)
to authenticated, anon;-- ============================================================
-- PATXANGA - RPC: draw_patxanga_tiles_from_bag()
-- Version: 1.0
-- Purpose: Draw tiles from bag safely
-- ============================================================

create or replace function public.draw_patxanga_tiles_from_bag(
    p_bag_state jsonb,
    p_quantity integer
)
returns jsonb
language plpgsql
stable
as
$$
declare
    v_tiles jsonb;
    v_remaining integer;
    v_draw_count integer;
    v_drawn jsonb := '[]'::jsonb;
    v_new_tiles jsonb := '[]'::jsonb;
    v_index integer;
begin

    if p_bag_state is null then
        raise exception 'Bag state cannot be null';
    end if;

    v_tiles := p_bag_state->'tiles';
    v_remaining := coalesce((p_bag_state->>'remaining')::integer, 0);

    if v_tiles is null then
        raise exception 'Bag tiles missing';
    end if;

    if v_remaining <= 0 then
        return jsonb_build_object(
            'drawn_tiles', '[]'::jsonb,
            'new_bag_state', p_bag_state
        );
    end if;

    v_draw_count := least(p_quantity, v_remaining);

    -- Draw from top of array
    for v_index in 0..v_draw_count - 1 loop
        v_drawn := v_drawn || jsonb_build_array(
            v_tiles->v_index
        );
    end loop;

    -- Build remaining bag
    for v_index in v_draw_count..v_remaining - 1 loop
        v_new_tiles := v_new_tiles || jsonb_build_array(
            v_tiles->v_index
        );
    end loop;

    return jsonb_build_object(
        'drawn_tiles', v_drawn,
        'new_bag_state', jsonb_build_object(
            'tiles', v_new_tiles,
            'remaining', jsonb_array_length(v_new_tiles)
        )
    );

end;
$$;

grant execute on function public.draw_patxanga_tiles_from_bag(jsonb, integer)
to authenticated, anon;
