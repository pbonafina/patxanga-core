-- ============================================================
-- PATXANGA - TEST: full-rack bonus
-- Purpose: using all 7 rack tiles grants +50 points beyond board score.
-- ============================================================

do $$
declare
    v_board jsonb;
    v_words jsonb;
    v_placed_tiles jsonb;
    v_score jsonb;
begin
    select jsonb_agg(board_row.cells order by board_row.row_number)
    into v_board
    from (
        select
            row_number,
            jsonb_agg(
                jsonb_build_object('tile', null, 'multiplier_type', 'NM')
                order by col_number
            ) as cells
        from generate_series(1, 15) row_number
        cross join generate_series(1, 15) col_number
        group by row_number
    ) board_row;

    v_words := jsonb_build_array(
        jsonb_build_object(
            'type', 'main',
            'word', 'ENSAIAD',
            'direction', 'H',
            'tiles', jsonb_build_array(
                jsonb_build_object('row', 8, 'col', 1, 'tile', jsonb_build_object('id', 'tile-e', 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null)),
                jsonb_build_object('row', 8, 'col', 2, 'tile', jsonb_build_object('id', 'tile-n', 'letter', 'N', 'points', 1, 'is_special', false, 'special_type', null)),
                jsonb_build_object('row', 8, 'col', 3, 'tile', jsonb_build_object('id', 'tile-s', 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null)),
                jsonb_build_object('row', 8, 'col', 4, 'tile', jsonb_build_object('id', 'tile-a1', 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null)),
                jsonb_build_object('row', 8, 'col', 5, 'tile', jsonb_build_object('id', 'tile-i', 'letter', 'I', 'points', 1, 'is_special', false, 'special_type', null)),
                jsonb_build_object('row', 8, 'col', 6, 'tile', jsonb_build_object('id', 'tile-a2', 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null)),
                jsonb_build_object('row', 8, 'col', 7, 'tile', jsonb_build_object('id', 'tile-d', 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null))
            )
        )
    );

    v_placed_tiles := jsonb_build_array(
        jsonb_build_object('tile_id', 'tile-e', 'row', 8, 'col', 1, 'declared_letter', null),
        jsonb_build_object('tile_id', 'tile-n', 'row', 8, 'col', 2, 'declared_letter', null),
        jsonb_build_object('tile_id', 'tile-s', 'row', 8, 'col', 3, 'declared_letter', null),
        jsonb_build_object('tile_id', 'tile-a1', 'row', 8, 'col', 4, 'declared_letter', null),
        jsonb_build_object('tile_id', 'tile-i', 'row', 8, 'col', 5, 'declared_letter', null),
        jsonb_build_object('tile_id', 'tile-a2', 'row', 8, 'col', 6, 'declared_letter', null),
        jsonb_build_object('tile_id', 'tile-d', 'row', 8, 'col', 7, 'declared_letter', null)
    );

    v_score := public.calculate_patxanga_score(v_words, v_board, v_placed_tiles);

    if (v_score->>'bonus_7')::integer <> 50 then
        raise exception 'Expected full-rack bonus_7 50, got %', v_score;
    end if;

    if (v_score->>'total_score')::integer <> 58 then
        raise exception 'Expected total_score 58 including base letters and +50 bonus, got %', v_score;
    end if;
end;
$$;
