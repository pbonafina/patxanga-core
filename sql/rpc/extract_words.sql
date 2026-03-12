-- ============================================================
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
to authenticated, anon;