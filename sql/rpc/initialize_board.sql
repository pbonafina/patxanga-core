-- ============================================================
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
to authenticated, anon;