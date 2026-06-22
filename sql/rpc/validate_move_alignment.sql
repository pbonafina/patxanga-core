-- ============================================================
-- PATXANGA - RPC: validate_patxanga_move_alignment()
-- Version: 1.1
-- Purpose: Validate geometric integrity of placed tiles
-- ============================================================

create or replace function public.validate_patxanga_move_alignment(
    p_board_state jsonb,
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
    v_covered_count integer;
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
        select min(r), max(r)
        into v_min_row, v_max_row
        from unnest(v_rows) r;

        select min(c), max(c)
        into v_min_col, v_max_col
        from unnest(v_cols) c;

        v_expected_count := v_max_col - v_min_col + 1;

        select count(*)
        into v_covered_count
        from generate_series(v_min_col, v_max_col) as c
        where exists (
            select 1
            from jsonb_array_elements(p_placed_tiles) tile
            where (tile->>'row')::integer = v_min_row
              and (tile->>'col')::integer = c
        )
        or coalesce(
            jsonb_typeof(p_board_state -> (v_min_row - 1) -> (c - 1) -> 'tile') = 'object',
            false
        );

        if v_covered_count <> v_expected_count then
            raise exception 'Horizontal move contains gaps';
        end if;

    elsif v_distinct_cols = 1 then
        -- Vertical word
        select min(c), max(c)
        into v_min_col, v_max_col
        from unnest(v_cols) c;

        select min(r), max(r)
        into v_min_row, v_max_row
        from unnest(v_rows) r;

        v_expected_count := v_max_row - v_min_row + 1;

        select count(*)
        into v_covered_count
        from generate_series(v_min_row, v_max_row) as r
        where exists (
            select 1
            from jsonb_array_elements(p_placed_tiles) tile
            where (tile->>'row')::integer = r
              and (tile->>'col')::integer = v_min_col
        )
        or coalesce(
            jsonb_typeof(p_board_state -> (r - 1) -> (v_min_col - 1) -> 'tile') = 'object',
            false
        );

        if v_covered_count <> v_expected_count then
            raise exception 'Vertical move contains gaps';
        end if;
    end if;

end;
$$;

create or replace function public.validate_patxanga_move_alignment(
    p_placed_tiles jsonb
)
returns void
language plpgsql
immutable
as
$$
begin
    perform public.validate_patxanga_move_alignment(
        null,
        p_placed_tiles
    );
end;
$$;

grant execute on function public.validate_patxanga_move_alignment(jsonb, jsonb)
to authenticated, anon;

grant execute on function public.validate_patxanga_move_alignment(jsonb)
to authenticated, anon;
