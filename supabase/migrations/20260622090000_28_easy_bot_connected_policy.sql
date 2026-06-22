-- ============================================================
-- PATXANGA - RPC: submit_patxanga_easy_bot_turn()
-- Purpose: easy bot can place an opening word or a simple connected word
-- ============================================================

create or replace function public.submit_patxanga_easy_bot_turn(
    p_match_id uuid,
    p_player_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as
$$
declare
    v_match record;
    v_player record;
    v_existing_tile_count integer;
    v_candidate_word text;
    v_candidate_direction text;
    v_anchor_row integer;
    v_anchor_col integer;
    v_placed_tiles jsonb;
    v_result jsonb;
    v_pass_reason text;
begin
    select *
    into v_match
    from patxanga_matches
    where id = p_match_id
    for update;

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
    where id = p_player_id
      and match_id = p_match_id
    for update;

    if not found then
        raise exception 'Player not found';
    end if;

    if coalesce(v_player.is_bot, false) is not true then
        raise exception 'Player is not a bot';
    end if;

    if coalesce(v_player.bot_level, '') <> 'easy' then
        raise exception 'Only easy bot policy is supported';
    end if;

    select count(*)
    into v_existing_tile_count
    from jsonb_array_elements(v_match.board_state) as board_row(row_data)
    cross join jsonb_array_elements(board_row.row_data) as board_cell(cell_data)
    where jsonb_typeof(board_cell.cell_data->'tile') = 'object';

    if v_existing_tile_count > 0 then
        with rack_tiles as (
            select
                rack_tile.tile->>'id' as tile_id,
                public.normalize_patxanga_word(rack_tile.tile->>'letter') as letter,
                row_number() over (
                    partition by public.normalize_patxanga_word(rack_tile.tile->>'letter')
                    order by rack_tile.ordinality
                ) as occurrence
            from jsonb_array_elements(v_player.rack_state)
                with ordinality as rack_tile(tile, ordinality)
            where coalesce((rack_tile.tile->>'is_special')::boolean, false) is false
              and nullif(coalesce(rack_tile.tile->>'special_type', ''), '') is null
              and char_length(public.normalize_patxanga_word(rack_tile.tile->>'letter')) = 1
        ),
        board_tiles as (
            select
                board_row.row_index::integer as board_row,
                board_cell.col_index::integer as board_col,
                public.normalize_patxanga_word(
                    coalesce(
                        board_cell.cell_data->'tile'->>'declared_letter',
                        board_cell.cell_data->'tile'->>'letter'
                    )
                ) as letter
            from jsonb_array_elements(v_match.board_state)
                with ordinality as board_row(row_data, row_index)
            cross join jsonb_array_elements(board_row.row_data)
                with ordinality as board_cell(cell_data, col_index)
            where jsonb_typeof(board_cell.cell_data->'tile') = 'object'
        ),
        candidate_words as (
            select
                dictionary.word_normalized,
                char_length(dictionary.word_normalized) as word_len
            from patxanga_dictionary dictionary
            where dictionary.language = v_match.language
              and dictionary.is_active = true
              and char_length(dictionary.word_normalized) between 2 and 7
              and dictionary.word_normalized ~ '^[A-Z]+$'
        ),
        candidate_anchors as (
            select
                candidate_words.word_normalized,
                candidate_words.word_len,
                board_tiles.board_row as anchor_row,
                board_tiles.board_col as anchor_col,
                anchor_position.i as anchor_position,
                direction.direction,
                case
                    when direction.direction = 'H' then board_tiles.board_row
                    else board_tiles.board_row - anchor_position.i + 1
                end as start_row,
                case
                    when direction.direction = 'H' then board_tiles.board_col - anchor_position.i + 1
                    else board_tiles.board_col
                end as start_col
            from candidate_words
            cross join board_tiles
            cross join lateral generate_series(1, candidate_words.word_len) as anchor_position(i)
            cross join (values ('H'), ('V')) as direction(direction)
            where substring(candidate_words.word_normalized from anchor_position.i for 1) = board_tiles.letter
        ),
        bounded_anchors as (
            select *
            from candidate_anchors
            where start_row between 1 and 15
              and start_col between 1 and 15
              and (
                  (direction = 'H' and start_col + word_len - 1 <= 15)
                  or
                  (direction = 'V' and start_row + word_len - 1 <= 15)
              )
              and not (direction = 'V' and word_len = 2)
        ),
        candidate_positions as (
            select
                bounded_anchors.*,
                word_position.i as position,
                target.target_row,
                target.target_col,
                target.letter,
                target_board.letter as target_board_letter,
                side_a.letter as side_a_letter,
                side_b.letter as side_b_letter
            from bounded_anchors
            cross join lateral generate_series(1, bounded_anchors.word_len) as word_position(i)
            cross join lateral (
                select
                    case
                        when bounded_anchors.direction = 'H' then bounded_anchors.anchor_row
                        else bounded_anchors.start_row + word_position.i - 1
                    end as target_row,
                    case
                        when bounded_anchors.direction = 'H' then bounded_anchors.start_col + word_position.i - 1
                        else bounded_anchors.anchor_col
                    end as target_col,
                    substring(bounded_anchors.word_normalized from word_position.i for 1) as letter
            ) target
            left join board_tiles target_board
              on target_board.board_row = target.target_row
             and target_board.board_col = target.target_col
            left join board_tiles side_a
              on side_a.board_row = case
                    when bounded_anchors.direction = 'H' then target.target_row - 1
                    else target.target_row
                 end
             and side_a.board_col = case
                    when bounded_anchors.direction = 'H' then target.target_col
                    else target.target_col - 1
                 end
            left join board_tiles side_b
              on side_b.board_row = case
                    when bounded_anchors.direction = 'H' then target.target_row + 1
                    else target.target_row
                 end
             and side_b.board_col = case
                    when bounded_anchors.direction = 'H' then target.target_col
                    else target.target_col + 1
                 end
        ),
        candidate_ok as (
            select
                word_normalized,
                word_len,
                direction,
                anchor_row,
                anchor_col,
                anchor_position,
                start_row,
                start_col
            from candidate_positions
            group by
                word_normalized,
                word_len,
                direction,
                anchor_row,
                anchor_col,
                anchor_position,
                start_row,
                start_col
            having bool_and(
                case
                    when position = anchor_position then
                        target_row = anchor_row
                        and target_col = anchor_col
                        and target_board_letter = letter
                    else
                        target_board_letter is null
                        and side_a_letter is null
                        and side_b_letter is null
                end
            )
        ),
        candidate_open as (
            select candidate_ok.*
            from candidate_ok
            left join board_tiles before_tile
              on before_tile.board_row = case
                    when candidate_ok.direction = 'H' then candidate_ok.start_row
                    else candidate_ok.start_row - 1
                 end
             and before_tile.board_col = case
                    when candidate_ok.direction = 'H' then candidate_ok.start_col - 1
                    else candidate_ok.start_col
                 end
            left join board_tiles after_tile
              on after_tile.board_row = case
                    when candidate_ok.direction = 'H' then candidate_ok.start_row
                    else candidate_ok.start_row + candidate_ok.word_len
                 end
             and after_tile.board_col = case
                    when candidate_ok.direction = 'H' then candidate_ok.start_col + candidate_ok.word_len
                    else candidate_ok.start_col
                 end
            where before_tile.board_row is null
              and after_tile.board_row is null
        ),
        required_letters as (
            select
                candidate_open.*,
                word_position.i as position,
                target.target_row,
                target.target_col,
                target.letter,
                row_number() over (
                    partition by
                        candidate_open.word_normalized,
                        candidate_open.direction,
                        candidate_open.anchor_row,
                        candidate_open.anchor_col,
                        candidate_open.anchor_position,
                        target.letter
                    order by word_position.i
                ) as occurrence
            from candidate_open
            cross join lateral generate_series(1, candidate_open.word_len) as word_position(i)
            cross join lateral (
                select
                    case
                        when candidate_open.direction = 'H' then candidate_open.anchor_row
                        else candidate_open.start_row + word_position.i - 1
                    end as target_row,
                    case
                        when candidate_open.direction = 'H' then candidate_open.start_col + word_position.i - 1
                        else candidate_open.anchor_col
                    end as target_col,
                    substring(candidate_open.word_normalized from word_position.i for 1) as letter
            ) target
            where word_position.i <> candidate_open.anchor_position
        ),
        mapped_required_letters as (
            select
                required_letters.*,
                rack_tiles.tile_id
            from required_letters
            left join rack_tiles
              on rack_tiles.letter = required_letters.letter
             and rack_tiles.occurrence = required_letters.occurrence
        ),
        placement_candidates as (
            select
                word_normalized,
                word_len,
                direction,
                anchor_row,
                anchor_col,
                anchor_position,
                start_row,
                start_col,
                jsonb_agg(
                    jsonb_build_object(
                        'tile_id', tile_id,
                        'row', target_row,
                        'col', target_col,
                        'declared_letter', null
                    )
                    order by position
                ) as placed_tiles,
                count(*) as needed_count,
                count(tile_id) as mapped_count
            from mapped_required_letters
            group by
                word_normalized,
                word_len,
                direction,
                anchor_row,
                anchor_col,
                anchor_position,
                start_row,
                start_col
            having count(*) = count(tile_id)
               and count(*) between 1 and 6
        )
        select
            word_normalized,
            direction,
            anchor_row,
            anchor_col,
            placed_tiles
        into
            v_candidate_word,
            v_candidate_direction,
            v_anchor_row,
            v_anchor_col,
            v_placed_tiles
        from placement_candidates
        order by
            word_len,
            word_normalized,
            case direction when 'H' then 1 else 2 end,
            anchor_row,
            anchor_col,
            anchor_position
        limit 1;

        if v_candidate_word is null then
            v_pass_reason := 'no_connected_word';
        else
            v_result := public.submit_patxanga_move(
                p_match_id,
                p_player_id,
                v_placed_tiles
            );

            return v_result || jsonb_build_object(
                'bot_action', 'place_word',
                'bot_strategy', 'easy_connected_dictionary_word',
                'main_word', v_candidate_word,
                'direction', v_candidate_direction,
                'anchor', jsonb_build_object(
                    'row', v_anchor_row,
                    'col', v_anchor_col
                ),
                'placed_tiles', v_placed_tiles
            );
        end if;
    else
        with rack_letter_counts as (
            select
                public.normalize_patxanga_word(rack_tile.tile->>'letter') as letter,
                count(*) as available
            from jsonb_array_elements(v_player.rack_state) as rack_tile(tile)
            where coalesce((rack_tile.tile->>'is_special')::boolean, false) is false
              and nullif(coalesce(rack_tile.tile->>'special_type', ''), '') is null
              and char_length(public.normalize_patxanga_word(rack_tile.tile->>'letter')) = 1
            group by 1
        )
        select dictionary.word_normalized
        into v_candidate_word
        from patxanga_dictionary dictionary
        where dictionary.language = v_match.language
          and dictionary.is_active = true
          and char_length(dictionary.word_normalized) between 2 and 7
          and dictionary.word_normalized ~ '^[A-Z]+$'
          and not exists (
              select 1
              from (
                  select
                      substring(dictionary.word_normalized from letter_index.i for 1) as letter,
                      count(*) as needed
                  from generate_series(1, char_length(dictionary.word_normalized)) as letter_index(i)
                  group by 1
              ) required_letters
              left join rack_letter_counts rack_letters
                on rack_letters.letter = required_letters.letter
              where required_letters.needed > coalesce(rack_letters.available, 0)
          )
        order by char_length(dictionary.word_normalized), dictionary.word_normalized
        limit 1;

        if v_candidate_word is null then
            v_pass_reason := 'no_opening_word';
        else
            with needed_letters as (
                select
                    letter_index.i as position,
                    substring(v_candidate_word from letter_index.i for 1) as letter,
                    row_number() over (
                        partition by substring(v_candidate_word from letter_index.i for 1)
                        order by letter_index.i
                    ) as occurrence
                from generate_series(1, char_length(v_candidate_word)) as letter_index(i)
            ),
            rack_tiles as (
                select
                    rack_tile.tile->>'id' as tile_id,
                    public.normalize_patxanga_word(rack_tile.tile->>'letter') as letter,
                    row_number() over (
                        partition by public.normalize_patxanga_word(rack_tile.tile->>'letter')
                        order by rack_tile.ordinality
                    ) as occurrence
                from jsonb_array_elements(v_player.rack_state)
                    with ordinality as rack_tile(tile, ordinality)
                where coalesce((rack_tile.tile->>'is_special')::boolean, false) is false
                  and nullif(coalesce(rack_tile.tile->>'special_type', ''), '') is null
                  and char_length(public.normalize_patxanga_word(rack_tile.tile->>'letter')) = 1
            )
            select jsonb_agg(
                jsonb_build_object(
                    'tile_id', rack_tiles.tile_id,
                    'row', 8,
                    'col', 8 + needed_letters.position - 1,
                    'declared_letter', null
                )
                order by needed_letters.position
            )
            into v_placed_tiles
            from needed_letters
            join rack_tiles
              on rack_tiles.letter = needed_letters.letter
             and rack_tiles.occurrence = needed_letters.occurrence;

            if v_placed_tiles is null
               or jsonb_array_length(v_placed_tiles) <> char_length(v_candidate_word) then
                v_pass_reason := 'opening_tile_mapping_failed';
            else
                v_result := public.submit_patxanga_move(
                    p_match_id,
                    p_player_id,
                    v_placed_tiles
                );

                return v_result || jsonb_build_object(
                    'bot_action', 'place_word',
                    'bot_strategy', 'easy_opening_dictionary_word',
                    'main_word', v_candidate_word,
                    'placed_tiles', v_placed_tiles
                );
            end if;
        end if;
    end if;

    v_result := public.submit_patxanga_pass_turn(
        p_match_id,
        p_player_id
    );

    return v_result || jsonb_build_object(
        'bot_action', 'pass',
        'bot_strategy', 'easy_dictionary_word',
        'pass_reason', v_pass_reason
    );
end;
$$;

grant execute on function public.submit_patxanga_easy_bot_turn(uuid, uuid)
to authenticated, anon;
