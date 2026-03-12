-- ============================================================
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
to authenticated, anon;