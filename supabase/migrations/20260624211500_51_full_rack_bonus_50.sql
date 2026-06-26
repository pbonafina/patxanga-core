-- ============================================================
-- PATXANGA - MIGRATION 51: Full-rack bonus 50
-- Purpose: using all 7 rack tiles in one move grants +50 points.
-- ============================================================

create or replace function public.calculate_patxanga_score(
    p_words jsonb,
    p_board_state jsonb,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
stable
as
$$
declare
    v_word jsonb;
    v_tile jsonb;
    v_score_main integer := 0;
    v_score_secondary integer := 0;
    v_word_score integer;
    v_letter_score integer;
    v_word_multiplier integer;
    v_is_main boolean;
    v_is_new boolean;
    v_bonus_7 integer := 0;
    v_has_patxanga_real boolean := false;
    v_total integer := 0;
    v_multiplier_type text;
    v_breakdown jsonb := '{}'::jsonb;
begin
    if p_words is null then
        raise exception 'Words cannot be null';
    end if;

    if p_placed_tiles is null then
        raise exception 'Placed tiles cannot be null';
    end if;

    if jsonb_array_length(p_placed_tiles) = 7 then
        v_bonus_7 := 50;
    end if;

    -- p_placed_tiles contains only client placement data. Special metadata is
    -- available in the hydrated tiles embedded in p_words.
    select exists (
        select 1
        from jsonb_array_elements(p_words) as word_data(word_json)
        cross join jsonb_array_elements(word_data.word_json->'tiles') as tile_data(tile_json)
        where lower(coalesce(tile_data.tile_json->'tile'->>'special_type', '')) = 'patxanga_real'
    )
    into v_has_patxanga_real;

    for v_word in
        select value from jsonb_array_elements(p_words)
    loop
        v_word_score := 0;
        v_word_multiplier := 1;
        v_is_main := (v_word->>'type') = 'main';

        for v_tile in
            select value from jsonb_array_elements(v_word->'tiles')
        loop
            v_letter_score := coalesce((v_tile->'tile'->>'points')::integer, 0);

            v_is_new := exists (
                select 1
                from jsonb_array_elements(p_placed_tiles) pt
                where (pt->>'tile_id') = coalesce(v_tile->'tile'->>'id', pt->>'tile_id')
            );

            if v_is_new then
                v_multiplier_type :=
                    p_board_state
                    -> ((v_tile->>'row')::integer - 1)
                    -> ((v_tile->>'col')::integer - 1)
                    ->> 'multiplier_type';

                case coalesce(v_multiplier_type, 'NM')
                    when 'LD' then
                        v_letter_score := v_letter_score * 2;
                    when 'LT' then
                        v_letter_score := v_letter_score * 3;
                    when 'PD' then
                        v_word_multiplier := v_word_multiplier * 2;
                    when 'PT' then
                        v_word_multiplier := v_word_multiplier * 3;
                    else
                        null;
                end case;
            end if;

            v_word_score := v_word_score + v_letter_score;
        end loop;

        v_word_score := v_word_score * v_word_multiplier;

        if v_is_main then
            v_score_main := v_word_score;
        else
            v_score_secondary := v_score_secondary + v_word_score;
        end if;
    end loop;

    v_score_main := v_score_main + v_bonus_7;

    if v_has_patxanga_real then
        v_score_main := v_score_main * 2;
    end if;

    v_total := v_score_main + v_score_secondary;

    v_breakdown := jsonb_build_object(
        'main_word_score', v_score_main,
        'secondary_words_score', v_score_secondary,
        'bonus_7', v_bonus_7,
        'patxanga_real_applied', v_has_patxanga_real,
        'total_score', v_total
    );

    return v_breakdown;
end;
$$;

grant execute on function public.calculate_patxanga_score(jsonb, jsonb, jsonb)
to authenticated, anon;
