-- ============================================================
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
to authenticated, anon;