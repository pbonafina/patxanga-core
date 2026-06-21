-- ============================================================
-- PATXANGA - RPC: submit_patxanga_easy_bot_turn()
-- Purpose: first product bot policy: valid opening word before pass
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
        v_pass_reason := 'board_not_empty';
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
        'bot_strategy', 'easy_opening_dictionary_word',
        'pass_reason', v_pass_reason
    );
end;
$$;

grant execute on function public.submit_patxanga_easy_bot_turn(uuid, uuid)
to authenticated, anon;
