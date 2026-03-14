-- ============================================================
-- PATXANGA - PREVIEW MOVE RPC
-- Version: 1.0
-- Purpose: Simulate move validation and score without persistence
-- ============================================================

create or replace function public.preview_patxanga_move(
    p_match_id uuid,
    p_player_id uuid,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player record;
    v_hydrated_placed_tiles jsonb;
    v_virtual_board jsonb;
    v_words jsonb;
    v_score jsonb;
    v_word jsonb;
    v_is_valid boolean;
    v_has_invalid_word boolean := false;
    v_main_word text := null;
    v_secondary_words jsonb := '[]'::jsonb;
begin
    select *
    into v_match
    from patxanga_matches
    where id = p_match_id;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'active' then
        raise exception 'Match not active';
    end if;

    if v_match.current_turn_player_id <> p_player_id then
        raise exception 'Not your turn';
    end if;

    select *
    into v_player
    from patxanga_players
    where match_id = p_match_id
      and id = p_player_id;

    if not found then
        raise exception 'Player not found';
    end if;

    perform public.validate_patxanga_tile_ownership(
        v_player.rack_state,
        p_placed_tiles
    );

    perform public.validate_patxanga_move_alignment(
        v_match.board_state,
        p_placed_tiles
    );

    v_hydrated_placed_tiles :=
        public.hydrate_patxanga_placed_tiles(
            v_player.rack_state,
            p_placed_tiles
        );

    v_virtual_board :=
        public.build_patxanga_virtual_board(
            v_match.board_state,
            v_hydrated_placed_tiles
        );

    v_words :=
        public.extract_patxanga_words(
            v_virtual_board,
            v_hydrated_placed_tiles
        );

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        if (v_word->>'type') = 'main' then
            v_main_word := v_word->>'word';
        else
            v_secondary_words := v_secondary_words || jsonb_build_array(v_word);
        end if;
    end loop;

    if char_length(coalesce(v_main_word, '')) < 2 then
        raise exception 'Main word must have at least 2 letters';
    end if;

    v_score :=
        public.calculate_patxanga_score(
            v_words,
            v_match.board_state,
            p_placed_tiles
        );

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        v_is_valid := public.validate_word(v_word->>'word');

        if not v_is_valid then
            v_has_invalid_word := true;
            exit;
        end if;
    end loop;

    return jsonb_build_object(
        'status', 'ok',
        'main_word', v_main_word,
        'secondary_words', v_secondary_words,
        'words', v_words,
        'score', v_score,
        'requires_vote', v_has_invalid_word,
        'is_dictionary_recognized', not v_has_invalid_word,
        'error', null
    );
exception
    when others then
        return jsonb_build_object(
            'status', 'invalid',
            'error', SQLERRM
        );
end;
$$;

grant execute on function public.preview_patxanga_move(uuid, uuid, jsonb)
to authenticated, anon;
