-- ============================================================
-- PATXANGA - Extract secondary cross words
-- Purpose: validate and score perpendicular words formed by new tiles
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
    v_tile jsonb;
    v_row integer;
    v_col integer;
    v_direction text;
    v_perpendicular_direction text;
    v_word text;
    v_words jsonb := '[]'::jsonb;
    v_letter text;
    v_current jsonb;
    v_tiles jsonb;
    v_start_row integer;
    v_start_col integer;
    v_scan_row integer;
    v_scan_col integer;
begin

    if p_virtual_board is null then
        raise exception 'Virtual board cannot be null';
    end if;

    if p_placed_tiles is null or jsonb_array_length(p_placed_tiles) = 0 then
        raise exception 'No placed tiles';
    end if;

    -- Determine main direction. For a single placed tile, prefer the axis
    -- where the tile connects to existing neighbours.
    if jsonb_array_length(p_placed_tiles) = 1 then
        v_first_tile := p_placed_tiles->0;
        v_row := (v_first_tile->>'row')::integer;
        v_col := (v_first_tile->>'col')::integer;

        if (
            (v_row > 1 and (p_virtual_board->(v_row - 2)->(v_col - 1)->>'tile') is not null)
            or (v_row < 15 and (p_virtual_board->v_row->(v_col - 1)->>'tile') is not null)
        )
        and not (
            (v_col > 1 and (p_virtual_board->(v_row - 1)->(v_col - 2)->>'tile') is not null)
            or (v_col < 15 and (p_virtual_board->(v_row - 1)->v_col->>'tile') is not null)
        ) then
            v_direction := 'V';
        else
            v_direction := 'H';
        end if;
    else
        if (p_placed_tiles->0->>'row') = (p_placed_tiles->1->>'row') then
            v_direction := 'H';
        else
            v_direction := 'V';
        end if;
    end if;

    v_first_tile := p_placed_tiles->0;
    v_start_row := (v_first_tile->>'row')::integer;
    v_start_col := (v_first_tile->>'col')::integer;

    -- Expand backwards to find the start of the main word.
    if v_direction = 'H' then
        while v_start_col > 1 loop
            v_current := p_virtual_board->(v_start_row - 1)->(v_start_col - 2);
            exit when v_current->>'tile' is null;
            v_start_col := v_start_col - 1;
        end loop;
    else
        while v_start_row > 1 loop
            v_current := p_virtual_board->(v_start_row - 2)->(v_start_col - 1);
            exit when v_current->>'tile' is null;
            v_start_row := v_start_row - 1;
        end loop;
    end if;

    -- Traverse forward and build the main word.
    v_word := '';
    v_tiles := '[]'::jsonb;
    v_scan_row := v_start_row;
    v_scan_col := v_start_col;

    loop
        v_current := p_virtual_board->(v_scan_row - 1)->(v_scan_col - 1);
        exit when v_current is null;
        exit when v_current->>'tile' is null;

        v_letter := coalesce(
            v_current->'tile'->>'declared_letter',
            v_current->'tile'->>'letter'
        );

        v_word := v_word || v_letter;
        v_tiles := v_tiles || jsonb_build_array(
            jsonb_build_object(
                'row', v_scan_row,
                'col', v_scan_col,
                'tile', v_current->'tile'
            )
        );

        if v_direction = 'H' then
            v_scan_col := v_scan_col + 1;
            exit when v_scan_col > 15;
        else
            v_scan_row := v_scan_row + 1;
            exit when v_scan_row > 15;
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

    -- Build every perpendicular word formed by newly placed tiles.
    v_perpendicular_direction := case when v_direction = 'H' then 'V' else 'H' end;

    for v_tile in
        select value from jsonb_array_elements(p_placed_tiles)
    loop
        v_start_row := (v_tile->>'row')::integer;
        v_start_col := (v_tile->>'col')::integer;

        if v_perpendicular_direction = 'H' then
            while v_start_col > 1 loop
                v_current := p_virtual_board->(v_start_row - 1)->(v_start_col - 2);
                exit when v_current->>'tile' is null;
                v_start_col := v_start_col - 1;
            end loop;
        else
            while v_start_row > 1 loop
                v_current := p_virtual_board->(v_start_row - 2)->(v_start_col - 1);
                exit when v_current->>'tile' is null;
                v_start_row := v_start_row - 1;
            end loop;
        end if;

        v_word := '';
        v_tiles := '[]'::jsonb;
        v_scan_row := v_start_row;
        v_scan_col := v_start_col;

        loop
            v_current := p_virtual_board->(v_scan_row - 1)->(v_scan_col - 1);
            exit when v_current is null;
            exit when v_current->>'tile' is null;

            v_letter := coalesce(
                v_current->'tile'->>'declared_letter',
                v_current->'tile'->>'letter'
            );

            v_word := v_word || v_letter;
            v_tiles := v_tiles || jsonb_build_array(
                jsonb_build_object(
                    'row', v_scan_row,
                    'col', v_scan_col,
                    'tile', v_current->'tile'
                )
            );

            if v_perpendicular_direction = 'H' then
                v_scan_col := v_scan_col + 1;
                exit when v_scan_col > 15;
            else
                v_scan_row := v_scan_row + 1;
                exit when v_scan_row > 15;
            end if;
        end loop;

        if char_length(v_word) >= 2 then
            v_words := v_words || jsonb_build_array(
                jsonb_build_object(
                    'type', 'secondary',
                    'direction', v_perpendicular_direction,
                    'word', v_word,
                    'tiles', v_tiles
                )
            );
        end if;
    end loop;

    return v_words;

end;
$$;

grant execute on function public.extract_patxanga_words(jsonb, jsonb)
to authenticated, anon;
