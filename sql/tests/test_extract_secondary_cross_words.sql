-- ============================================================
-- PATXANGA - TEST: secondary cross-word extraction
-- Purpose: reject moves that create invalid perpendicular words
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_opening_player_id uuid;
    v_second_player_id uuid;
    v_m uuid := gen_random_uuid();
    v_a uuid := gen_random_uuid();
    v_t uuid := gen_random_uuid();
    v_e uuid := gen_random_uuid();
    v_b uuid := gen_random_uuid();
    v_o uuid := gen_random_uuid();
    v_r uuid := gen_random_uuid();
    v_i uuid := gen_random_uuid();
    v_s uuid := gen_random_uuid();
    v_result jsonb;
    v_secondary_words jsonb;
begin
    insert into public.patxanga_dictionary (
        language,
        word_original,
        word_normalized,
        source,
        is_active
    )
    values
        ('pt-PT', 'MATE', public.normalize_patxanga_word('MATE'), 'cross_word_test', true),
        ('pt-PT', 'BORIS', public.normalize_patxanga_word('BORIS'), 'cross_word_test', true)
    on conflict (language, word_normalized) do update
    set word_original = excluded.word_original,
        source = excluded.source,
        is_active = excluded.is_active,
        updated_at = now();

    if public.validate_word('AB', 'pt-PT') is true then
        raise exception 'Test setup expects AB to be absent from pt-PT dictionary';
    end if;

    if public.validate_word('ER', 'pt-PT') is true then
        raise exception 'Test setup expects ER to be absent from pt-PT dictionary';
    end if;

    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'pt-PT',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_opening_player_id
    from public.patxanga_matches
    where id = v_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_m::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_a::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_t::text, 'letter', 'T', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_e::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'N', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'L', 'points', 2, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_opening_player_id;

    v_result := public.submit_patxanga_move(
        v_match_id,
        v_opening_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_m::text, 'row', 8, 'col', 1, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a::text, 'row', 8, 'col', 2, 'declared_letter', null),
            jsonb_build_object('tile_id', v_t::text, 'row', 8, 'col', 3, 'declared_letter', null),
            jsonb_build_object('tile_id', v_e::text, 'row', 8, 'col', 4, 'declared_letter', null)
        )
    );

    if v_result->>'status' <> 'success' then
        raise exception 'Expected MATE opening success, got %', v_result;
    end if;

    update public.patxanga_matches
    set board_state = jsonb_set(
            board_state,
            array['8', '2', 'tile'],
            jsonb_build_object(
                'id', v_o::text,
                'letter', 'O',
                'points', 1,
                'is_special', false,
                'special_type', null,
                'row', 9,
                'col', 3,
                'declared_letter', null
            ),
            false
        ),
        updated_at = now()
    where id = v_match_id;

    select current_turn_player_id
    into v_second_player_id
    from public.patxanga_matches
    where id = v_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_b::text, 'letter', 'B', 'points', 3, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_r::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_i::text, 'letter', 'I', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_s::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'C', 'points', 3, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'F', 'points', 4, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_second_player_id;

    v_result := public.submit_patxanga_move(
        v_match_id,
        v_second_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_b::text, 'row', 9, 'col', 2, 'declared_letter', null),
            jsonb_build_object('tile_id', v_r::text, 'row', 9, 'col', 4, 'declared_letter', null),
            jsonb_build_object('tile_id', v_i::text, 'row', 9, 'col', 5, 'declared_letter', null),
            jsonb_build_object('tile_id', v_s::text, 'row', 9, 'col', 6, 'declared_letter', null)
        )
    );

    if v_result->>'status' <> 'pending_vote' then
        raise exception 'Expected BORIS crossing AB/ER to require vote, got %', v_result;
    end if;

    select coalesce(jsonb_agg(word_item.value), '[]'::jsonb)
    into v_secondary_words
    from jsonb_array_elements(coalesce(v_result->'words', '[]'::jsonb)) as word_item(value)
    where word_item.value->>'type' = 'secondary';

    if not exists (
        select 1
        from jsonb_array_elements(v_secondary_words) as word_item(value)
        where word_item.value->>'word' = 'AB'
    ) then
        raise exception 'Expected secondary word AB, got %', v_secondary_words;
    end if;

    if not exists (
        select 1
        from jsonb_array_elements(v_secondary_words) as word_item(value)
        where word_item.value->>'word' = 'ER'
    ) then
        raise exception 'Expected secondary word ER, got %', v_secondary_words;
    end if;
end $$;
