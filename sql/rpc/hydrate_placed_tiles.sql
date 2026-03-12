-- ============================================================
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
to authenticated, anon;