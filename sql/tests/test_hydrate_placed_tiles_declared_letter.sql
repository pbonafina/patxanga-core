do
$$
declare
    v_wildcard_id uuid := gen_random_uuid();
    v_skip_id uuid := gen_random_uuid();
    v_pr_id uuid := gen_random_uuid();
    v_normal_id uuid := gen_random_uuid();
    v_rack jsonb;
    v_result jsonb;
begin
    v_rack := jsonb_build_array(
        jsonb_build_object(
            'id', v_wildcard_id,
            'letter', null,
            'points', 0,
            'is_special', true,
            'special_type', 'wildcard'
        ),
        jsonb_build_object(
            'id', v_skip_id,
            'letter', 'SKIP',
            'points', 0,
            'is_special', true,
            'special_type', 'skip_turn'
        ),
        jsonb_build_object(
            'id', v_pr_id,
            'letter', 'PR',
            'points', 0,
            'is_special', true,
            'special_type', 'patxanga_real'
        ),
        jsonb_build_object(
            'id', v_normal_id,
            'letter', 'A',
            'points', 1,
            'is_special', false,
            'special_type', null
        )
    );

    begin
        perform public.hydrate_patxanga_placed_tiles(
            v_rack,
            jsonb_build_array(
                jsonb_build_object(
                    'tile_id', v_wildcard_id,
                    'row', 8,
                    'col', 8,
                    'declared_letter', null
                )
            )
        );
        raise exception 'ERRO: wildcard sem declared_letter deveria falhar';
    exception
        when others then
            if position('declared_letter is required for special tile' in SQLERRM) = 0 then
                raise;
            end if;
    end;

    begin
        perform public.hydrate_patxanga_placed_tiles(
            v_rack,
            jsonb_build_array(
                jsonb_build_object(
                    'tile_id', v_skip_id,
                    'row', 8,
                    'col', 8,
                    'declared_letter', null
                )
            )
        );
        raise exception 'ERRO: skip_turn sem declared_letter deveria falhar';
    exception
        when others then
            if position('declared_letter is required for special tile' in SQLERRM) = 0 then
                raise;
            end if;
    end;

    begin
        perform public.hydrate_patxanga_placed_tiles(
            v_rack,
            jsonb_build_array(
                jsonb_build_object(
                    'tile_id', v_pr_id,
                    'row', 8,
                    'col', 8,
                    'declared_letter', null
                )
            )
        );
        raise exception 'ERRO: patxanga_real sem declared_letter deveria falhar';
    exception
        when others then
            if position('declared_letter is required for special tile' in SQLERRM) = 0 then
                raise;
            end if;
    end;

    v_result := public.hydrate_patxanga_placed_tiles(
        v_rack,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_wildcard_id,
                'row', 8,
                'col', 8,
                'declared_letter', 'a'
            )
        )
    );

    if v_result->0->>'declared_letter' <> 'A' then
        raise exception 'ERRO: declared_letter deveria ser normalizado para A, mas veio %', v_result->0->>'declared_letter';
    end if;

    v_result := public.hydrate_patxanga_placed_tiles(
        v_rack,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_skip_id,
                'row', 8,
                'col', 8,
                'declared_letter', 'p'
            )
        )
    );

    if v_result->0->>'declared_letter' <> 'P' then
        raise exception 'ERRO: declared_letter de skip_turn deveria ser normalizado para P, mas veio %', v_result->0->>'declared_letter';
    end if;

    v_result := public.hydrate_patxanga_placed_tiles(
        v_rack,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_pr_id,
                'row', 8,
                'col', 8,
                'declared_letter', 'r'
            )
        )
    );

    if v_result->0->>'declared_letter' <> 'R' then
        raise exception 'ERRO: declared_letter de patxanga_real deveria ser normalizado para R, mas veio %', v_result->0->>'declared_letter';
    end if;

    v_result := public.hydrate_patxanga_placed_tiles(
        v_rack,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_normal_id,
                'row', 8,
                'col', 9,
                'declared_letter', 'Z'
            )
        )
    );

    if (v_result->0->>'declared_letter') is not null then
        raise exception 'ERRO: tile normal nao deveria persistir declared_letter';
    end if;

    raise notice 'OK: hydrate_patxanga_placed_tiles exige e normaliza declared_letter para todas as pecas especiais';
end;
$$;
