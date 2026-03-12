-- ============================================================
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
to authenticated, anon;