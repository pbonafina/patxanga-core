-- ============================================================
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