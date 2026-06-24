-- ============================================================
-- PATXANGA - PLAYABLE BOT POLICY
-- Purpose: make product bot choose dictionary-valid, board-valid useful words
-- ============================================================

create or replace function public.is_patxanga_playable_bot_word(
    p_word text
)
returns boolean
language sql
immutable
as
$$
    select
        p_word is not null
        and char_length(p_word) between 3 and 7
        and p_word ~ '^[A-Z]+$'
        and p_word !~ '^(.)\1+$'
        and p_word not in (
            'AAA',
            'EEE',
            'III',
            'OOO',
            'UUU'
        );
$$;

create or replace function public.find_patxanga_playable_bot_candidate_moves(
    p_match_id uuid,
    p_player_id uuid,
    p_limit integer default 10
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
    v_limit integer := greatest(1, least(coalesce(p_limit, 10), 50));
    v_bot_policy jsonb;
    v_max_word_length integer;
    v_candidates jsonb;
begin
    select *
    into v_match
    from public.patxanga_matches
    where id = p_match_id;

    if not found then
        raise exception 'Match not found';
    end if;

    select *
    into v_player
    from public.patxanga_players
    where id = p_player_id
      and match_id = p_match_id;

    if not found then
        raise exception 'Player not found';
    end if;

    if coalesce(v_player.is_bot, false) is not true then
        raise exception 'Player is not a bot';
    end if;

    v_bot_policy := public.get_patxanga_bot_policy_config(
        v_player.bot_level,
        v_player.bot_profile
    );
    v_max_word_length := greatest(
        3,
        least(coalesce((v_bot_policy->>'max_word_length')::integer, 5), 7)
    );

    select count(*)
    into v_existing_tile_count
    from jsonb_array_elements(v_match.board_state) as board_row(row_data)
    cross join jsonb_array_elements(board_row.row_data) as board_cell(cell_data)
    where jsonb_typeof(board_cell.cell_data->'tile') = 'object';

    if v_existing_tile_count = 0 then
        with rack_tiles as (
            select
                rack_tile.tile->>'id' as tile_id,
                public.normalize_patxanga_word(rack_tile.tile->>'letter') as letter,
                coalesce((rack_tile.tile->>'points')::integer, 0) as points,
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
        candidate_words as (
            select
                dictionary.word_normalized,
                char_length(dictionary.word_normalized) as word_len
            from public.patxanga_dictionary dictionary
            where dictionary.language = v_match.language
              and dictionary.is_active = true
              and public.is_patxanga_playable_bot_word(dictionary.word_normalized)
              and char_length(dictionary.word_normalized) <= v_max_word_length
              and dictionary.word_normalized ~ (
                  select '^[' || string_agg(distinct rack_tiles.letter, '') || ']+$'
                  from rack_tiles
              )
        ),
        required_letters as (
            select
                candidate_words.word_normalized,
                candidate_words.word_len,
                letter_index.i as position,
                substring(candidate_words.word_normalized from letter_index.i for 1) as letter,
                row_number() over (
                    partition by
                        candidate_words.word_normalized,
                        substring(candidate_words.word_normalized from letter_index.i for 1)
                    order by letter_index.i
                ) as occurrence
            from candidate_words
            cross join lateral generate_series(1, candidate_words.word_len) as letter_index(i)
        ),
        mapped_letters as (
            select
                required_letters.*,
                rack_tiles.tile_id,
                rack_tiles.points
            from required_letters
            left join rack_tiles
              on rack_tiles.letter = required_letters.letter
             and rack_tiles.occurrence = required_letters.occurrence
        ),
        placement_candidates as (
            select
                word_normalized,
                word_len,
                jsonb_agg(
                    jsonb_build_object(
                        'tile_id', tile_id,
                        'row', 8,
                        'col', 8 + position - 1,
                        'declared_letter', null
                    )
                    order by position
                ) as placed_tiles,
                sum(points) as rack_points
            from mapped_letters
            group by word_normalized, word_len
            having count(*) = count(tile_id)
        ),
        ranked as (
            select
                row_number() over (
                    order by rack_points desc, word_len desc, word_normalized
                ) as candidate_rank,
                *
            from placement_candidates
            order by rack_points desc, word_len desc, word_normalized
            limit v_limit
        )
        select coalesce(
            jsonb_agg(
                jsonb_build_object(
                    'candidate_rank', candidate_rank,
                    'bot_strategy', 'playable_opening_dictionary_word',
                    'main_word', word_normalized,
                    'direction', 'H',
                    'estimated_rack_points', rack_points,
                    'placed_tiles', placed_tiles
                )
                order by candidate_rank
            ),
            '[]'::jsonb
        )
        into v_candidates
        from ranked;

        return v_candidates;
    end if;

    with rack_tiles as (
        select
            rack_tile.tile->>'id' as tile_id,
            public.normalize_patxanga_word(rack_tile.tile->>'letter') as letter,
            coalesce((rack_tile.tile->>'points')::integer, 0) as points,
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
    rack_letter_counts as (
        select letter, count(*) as available
        from rack_tiles
        group by letter
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
    board_letters as (
        select distinct letter
        from board_tiles
    ),
    allowed_letters as (
        select letter from rack_tiles
        union
        select letter from board_tiles
    ),
    allowed_letter_pattern as (
        select '^[' || string_agg(distinct letter, '') || ']+$' as pattern
        from allowed_letters
    ),
    candidate_words as (
        select
            dictionary.word_normalized,
            char_length(dictionary.word_normalized) as word_len
        from public.patxanga_dictionary dictionary
        where dictionary.language = v_match.language
          and dictionary.is_active = true
          and public.is_patxanga_playable_bot_word(dictionary.word_normalized)
          and char_length(dictionary.word_normalized) <= v_max_word_length
          and dictionary.word_normalized ~ (
              select pattern
              from allowed_letter_pattern
          )
          and exists (
              select 1
              from board_letters
              where dictionary.word_normalized like '%' || board_letters.letter || '%'
          )
          and not exists (
              select 1
              from (
                  select
                      substring(dictionary.word_normalized from letter_index.i for 1) as letter,
                      count(*) as needed
                  from generate_series(1, char_length(dictionary.word_normalized)) as letter_index(i)
                  group by 1
              ) required
              left join rack_letter_counts rack_counts
                on rack_counts.letter = required.letter
              left join (
                  select letter, count(*) as available
                  from board_tiles
                  group by letter
              ) board_counts
                on board_counts.letter = required.letter
              where required.needed > coalesce(rack_counts.available, 0) + coalesce(board_counts.available, 0)
          )
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
            rack_tiles.tile_id,
            rack_tiles.points
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
            sum(points) as rack_points
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
    ),
    ranked as (
        select
            row_number() over (
                order by rack_points desc, word_len desc, word_normalized, direction, anchor_row, anchor_col
            ) as candidate_rank,
            *
        from placement_candidates
        order by rack_points desc, word_len desc, word_normalized, direction, anchor_row, anchor_col
        limit v_limit
    )
    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'candidate_rank', candidate_rank,
                'bot_strategy', 'playable_connected_dictionary_word',
                'main_word', word_normalized,
                'direction', direction,
                'anchor', jsonb_build_object('row', anchor_row, 'col', anchor_col),
                'estimated_rack_points', rack_points,
                'placed_tiles', placed_tiles
            )
            order by candidate_rank
        ),
        '[]'::jsonb
    )
    into v_candidates
    from ranked;

    return v_candidates;
end;
$$;

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
    v_candidates jsonb;
    v_candidate jsonb;
    v_result jsonb;
begin
    select *
    into v_match
    from public.patxanga_matches
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
    from public.patxanga_players
    where id = p_player_id
      and match_id = p_match_id
    for update;

    if not found then
        raise exception 'Player not found';
    end if;

    if coalesce(v_player.is_bot, false) is not true then
        raise exception 'Player is not a bot';
    end if;

    v_candidates := public.find_patxanga_playable_bot_candidate_moves(
        p_match_id,
        p_player_id,
        1
    );

    if jsonb_array_length(v_candidates) > 0 then
        v_candidate := v_candidates->0;
        v_result := public.submit_patxanga_move(
            p_match_id,
            p_player_id,
            v_candidate->'placed_tiles'
        );

        return v_result || jsonb_build_object(
            'bot_action', 'place_word',
            'bot_strategy', v_candidate->>'bot_strategy',
            'main_word', v_candidate->>'main_word',
            'direction', v_candidate->>'direction',
            'anchor', v_candidate->'anchor',
            'placed_tiles', v_candidate->'placed_tiles'
        );
    end if;

    v_result := public.submit_patxanga_pass_turn(
        p_match_id,
        p_player_id
    );

    return v_result || jsonb_build_object(
        'bot_action', 'pass',
        'bot_strategy', 'playable_dictionary_word',
        'pass_reason', 'no_playable_word'
    );
end;
$$;

revoke all on function public.is_patxanga_playable_bot_word(text)
from public, anon, authenticated;

revoke all on function public.find_patxanga_playable_bot_candidate_moves(uuid, uuid, integer)
from public, anon, authenticated;

grant execute on function public.is_patxanga_playable_bot_word(text)
to authenticated, anon;

grant execute on function public.find_patxanga_playable_bot_candidate_moves(uuid, uuid, integer)
to authenticated, anon;

grant execute on function public.submit_patxanga_easy_bot_turn(uuid, uuid)
to authenticated, anon;
