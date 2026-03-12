-- ============================================================
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
to authenticated, anon;