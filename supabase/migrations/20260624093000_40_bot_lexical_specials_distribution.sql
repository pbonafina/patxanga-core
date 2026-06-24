-- ============================================================
-- PATXANGA - BOT LEXICAL POLICY, SPECIAL TILES AND DISTRIBUTION
-- Purpose:
--   - remove K/W/Y from generated Portuguese bags; cedilha is represented by C
--   - keep easy bots away from rare/foreign-looking words observed in playthroughs
--   - allow bots to use wildcard and Patxanga Real as declared letters
--   - fix Patxanga Real score detection
-- ============================================================

delete from public.patxanga_letter_distribution
where language in ('pt-BR', 'pt-PT')
  and is_special = false
  and letter in ('K', 'W', 'Y');

with target_distribution(language, letter, quantity, points) as (
    values
        ('pt-BR', 'A', 14, 1),
        ('pt-BR', 'E', 11, 1),
        ('pt-BR', 'O', 10, 1),
        ('pt-BR', 'I', 8, 1),
        ('pt-BR', 'U', 5, 2),
        ('pt-BR', 'S', 7, 1),
        ('pt-BR', 'R', 6, 1),
        ('pt-BR', 'N', 5, 1),
        ('pt-BR', 'D', 4, 2),
        ('pt-BR', 'M', 4, 2),
        ('pt-BR', 'T', 4, 2),
        ('pt-BR', 'C', 5, 2),
        ('pt-BR', 'L', 3, 2),
        ('pt-BR', 'P', 2, 3),
        ('pt-BR', 'B', 2, 3),
        ('pt-BR', 'G', 2, 3),
        ('pt-BR', 'V', 2, 3),
        ('pt-BR', 'F', 1, 4),
        ('pt-BR', 'H', 1, 4),
        ('pt-BR', 'J', 1, 5),
        ('pt-BR', 'Q', 2, 6),
        ('pt-BR', 'X', 2, 6),
        ('pt-BR', 'Z', 2, 7),
        ('pt-PT', 'A', 14, 1),
        ('pt-PT', 'E', 11, 1),
        ('pt-PT', 'O', 10, 1),
        ('pt-PT', 'I', 8, 1),
        ('pt-PT', 'U', 5, 2),
        ('pt-PT', 'S', 7, 1),
        ('pt-PT', 'R', 6, 1),
        ('pt-PT', 'N', 5, 1),
        ('pt-PT', 'D', 4, 2),
        ('pt-PT', 'M', 4, 2),
        ('pt-PT', 'T', 4, 2),
        ('pt-PT', 'C', 5, 2),
        ('pt-PT', 'L', 3, 2),
        ('pt-PT', 'P', 2, 3),
        ('pt-PT', 'B', 2, 3),
        ('pt-PT', 'G', 2, 3),
        ('pt-PT', 'V', 2, 3),
        ('pt-PT', 'F', 1, 4),
        ('pt-PT', 'H', 1, 4),
        ('pt-PT', 'J', 1, 5),
        ('pt-PT', 'Q', 2, 6),
        ('pt-PT', 'X', 2, 6),
        ('pt-PT', 'Z', 2, 7)
)
insert into public.patxanga_letter_distribution (
    language,
    letter,
    quantity,
    points,
    is_special,
    special_type
)
select language, letter, quantity, points, false, null
from target_distribution
where not exists (
    select 1
    from public.patxanga_letter_distribution existing
    where existing.language = target_distribution.language
      and existing.letter = target_distribution.letter
      and existing.special_type is null
);

with target_distribution(language, letter, quantity, points) as (
    values
        ('pt-BR', 'A', 14, 1),
        ('pt-BR', 'E', 11, 1),
        ('pt-BR', 'O', 10, 1),
        ('pt-BR', 'I', 8, 1),
        ('pt-BR', 'U', 5, 2),
        ('pt-BR', 'S', 7, 1),
        ('pt-BR', 'R', 6, 1),
        ('pt-BR', 'N', 5, 1),
        ('pt-BR', 'D', 4, 2),
        ('pt-BR', 'M', 4, 2),
        ('pt-BR', 'T', 4, 2),
        ('pt-BR', 'C', 5, 2),
        ('pt-BR', 'L', 3, 2),
        ('pt-BR', 'P', 2, 3),
        ('pt-BR', 'B', 2, 3),
        ('pt-BR', 'G', 2, 3),
        ('pt-BR', 'V', 2, 3),
        ('pt-BR', 'F', 1, 4),
        ('pt-BR', 'H', 1, 4),
        ('pt-BR', 'J', 1, 5),
        ('pt-BR', 'Q', 2, 6),
        ('pt-BR', 'X', 2, 6),
        ('pt-BR', 'Z', 2, 7),
        ('pt-PT', 'A', 14, 1),
        ('pt-PT', 'E', 11, 1),
        ('pt-PT', 'O', 10, 1),
        ('pt-PT', 'I', 8, 1),
        ('pt-PT', 'U', 5, 2),
        ('pt-PT', 'S', 7, 1),
        ('pt-PT', 'R', 6, 1),
        ('pt-PT', 'N', 5, 1),
        ('pt-PT', 'D', 4, 2),
        ('pt-PT', 'M', 4, 2),
        ('pt-PT', 'T', 4, 2),
        ('pt-PT', 'C', 5, 2),
        ('pt-PT', 'L', 3, 2),
        ('pt-PT', 'P', 2, 3),
        ('pt-PT', 'B', 2, 3),
        ('pt-PT', 'G', 2, 3),
        ('pt-PT', 'V', 2, 3),
        ('pt-PT', 'F', 1, 4),
        ('pt-PT', 'H', 1, 4),
        ('pt-PT', 'J', 1, 5),
        ('pt-PT', 'Q', 2, 6),
        ('pt-PT', 'X', 2, 6),
        ('pt-PT', 'Z', 2, 7)
)
update public.patxanga_letter_distribution current_distribution
set quantity = target_distribution.quantity,
    points = target_distribution.points,
    is_special = false
from target_distribution
where current_distribution.language = target_distribution.language
  and current_distribution.letter = target_distribution.letter
  and current_distribution.special_type is null;

create table if not exists public.patxanga_bot_word_policy_overrides (
    language text not null check (language in ('pt-BR', 'pt-PT')),
    word_normalized text not null,
    policy_status text not null check (policy_status in ('blocked_easy', 'blocked_medium', 'preferred')),
    reason text not null,
    created_at timestamp with time zone not null default now(),
    primary key (language, word_normalized, policy_status)
);

insert into public.patxanga_bot_word_policy_overrides (
    language,
    word_normalized,
    policy_status,
    reason
)
values
    ('pt-PT', 'ALUZ', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'QUEZA', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'EGRIO', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'KIR', 'blocked_easy', 'foreign/rare K word'),
    ('pt-PT', 'ALCAM', 'blocked_easy', 'inflected/less common playthrough word'),
    ('pt-PT', 'DATEM', 'blocked_easy', 'inflected/less common playthrough word'),
    ('pt-PT', 'CAJAO', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'HUI', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'PEAES', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'WOK', 'blocked_easy', 'foreign W word'),
    ('pt-PT', 'ANOVE', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'SESGO', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'IODAI', 'blocked_easy', 'inflected/less common playthrough word'),
    ('pt-PT', 'ANUI', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'YEN', 'blocked_easy', 'foreign Y word'),
    ('pt-PT', 'RIXE', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'CRE', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'DUBLE', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'ALHAO', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'GOUVE', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'AIREM', 'blocked_easy', 'inflected/less common playthrough word'),
    ('pt-PT', 'AROES', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'ESTIA', 'blocked_easy', 'rare playthrough word'),
    ('pt-PT', 'AMOR', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'CASA', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'BOLA', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'GATO', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'JOGO', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'LIVRO', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'LUA', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'MAR', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'MESA', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'PATO', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'PORTA', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'RUA', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'SOL', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'TEMPO', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'VIDA', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'FIXE', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'BOM', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'METRO', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'BEIRA', 'preferred', 'common bot vocabulary'),
    ('pt-PT', 'TACTO', 'preferred', 'common bot vocabulary')
on conflict (language, word_normalized, policy_status) do update
set reason = excluded.reason;

create or replace function public.is_patxanga_bot_policy_word(
    p_word text,
    p_language text,
    p_bot_level text default 'easy'
)
returns boolean
language sql
stable
set search_path = public
as
$$
    select
        public.is_patxanga_playable_bot_word(p_word)
        and (
            lower(coalesce(nullif(trim(p_bot_level), ''), 'easy')) = 'hard'
            or p_word !~ '[KWY]'
        )
        and not exists (
            select 1
            from public.patxanga_bot_word_policy_overrides override
            where override.language = p_language
              and override.word_normalized = p_word
              and (
                  override.policy_status = 'blocked_medium'
                  or (
                      override.policy_status = 'blocked_easy'
                      and lower(coalesce(nullif(trim(p_bot_level), ''), 'easy')) = 'easy'
                  )
              )
        );
$$;

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
        v_bonus_7 := 20;
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
                nullif(coalesce(rack_tile.tile->>'special_type', ''), '') as special_type,
                rack_tile.ordinality::integer as rack_ordinality,
                row_number() over (
                    partition by public.normalize_patxanga_word(rack_tile.tile->>'letter')
                    order by rack_tile.ordinality
                ) as occurrence
            from jsonb_array_elements(v_player.rack_state)
                with ordinality as rack_tile(tile, ordinality)
            where (
                    coalesce((rack_tile.tile->>'is_special')::boolean, false) is false
                    and nullif(coalesce(rack_tile.tile->>'special_type', ''), '') is null
                    and char_length(public.normalize_patxanga_word(rack_tile.tile->>'letter')) = 1
                )
               or nullif(coalesce(rack_tile.tile->>'special_type', ''), '') in ('wildcard', 'patxanga_real')
        ),
        normal_rack_tiles as (
            select *
            from rack_tiles
            where special_type is null
        ),
        special_rack_tiles as (
            select
                *,
                row_number() over (
                    order by case special_type when 'wildcard' then 1 when 'patxanga_real' then 2 else 9 end, rack_ordinality
                ) as special_index
            from rack_tiles
            where special_type in ('wildcard', 'patxanga_real')
        ),
        rack_letter_counts as (
            select letter, count(*) as available
            from normal_rack_tiles
            group by letter
        ),
        rack_letters_for_pattern as (
            select letter from normal_rack_tiles
            union
            select generate_series.chr
            from special_rack_tiles
            cross join lateral regexp_split_to_table('ABCDEFGHIJKLMNOPQRSTUVWXYZ', '') as generate_series(chr)
        ),
        candidate_words as (
            select
                dictionary.word_normalized,
                char_length(dictionary.word_normalized) as word_len
            from public.patxanga_dictionary dictionary
            where dictionary.language = v_match.language
              and dictionary.is_active = true
              and public.is_patxanga_bot_policy_word(dictionary.word_normalized, v_match.language, v_player.bot_level)
              and char_length(dictionary.word_normalized) <= v_max_word_length
              and dictionary.word_normalized ~ (
                  select '^[' || string_agg(distinct letter, '') || ']+$'
                  from rack_letters_for_pattern
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
                  where required.needed > coalesce(rack_counts.available, 0) + (
                      select count(*) from special_rack_tiles
                  )
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
        mapped_normal_letters as (
            select
                required_letters.*,
                normal_rack_tiles.tile_id,
                normal_rack_tiles.points,
                null::text as special_type,
                null::integer as special_index
            from required_letters
            left join normal_rack_tiles
              on normal_rack_tiles.letter = required_letters.letter
             and normal_rack_tiles.occurrence = required_letters.occurrence
        ),
        missing_letters as (
            select
                *,
                row_number() over (
                    partition by word_normalized
                    order by position
                ) as missing_index
            from mapped_normal_letters
            where tile_id is null
        ),
        mapped_letters as (
            select
                mapped_normal_letters.word_normalized,
                mapped_normal_letters.word_len,
                mapped_normal_letters.position,
                mapped_normal_letters.letter,
                mapped_normal_letters.occurrence,
                mapped_normal_letters.tile_id,
                mapped_normal_letters.points,
                mapped_normal_letters.special_type,
                mapped_normal_letters.special_index
            from mapped_normal_letters
            where mapped_normal_letters.tile_id is not null

            union all

            select
                missing_letters.word_normalized,
                missing_letters.word_len,
                missing_letters.position,
                missing_letters.letter,
                missing_letters.occurrence,
                special_rack_tiles.tile_id,
                special_rack_tiles.points,
                special_rack_tiles.special_type,
                special_rack_tiles.special_index
            from missing_letters
            join special_rack_tiles
              on special_rack_tiles.special_index = missing_letters.missing_index
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
                        'declared_letter', case when special_type is null then null else letter end
                    )
                    order by position
                ) as placed_tiles,
                sum(points) as rack_points,
                count(*) filter (where special_type = 'wildcard') as wildcard_count,
                count(*) filter (where special_type = 'patxanga_real') as patxanga_real_count
            from mapped_letters
            group by word_normalized, word_len
            having count(*) = word_len
               and count(distinct tile_id) = word_len
        ),
        ranked as (
            select
                row_number() over (
                    order by exists (
                        select 1
                        from public.patxanga_bot_word_policy_overrides preferred
                        where preferred.language = v_match.language
                          and preferred.word_normalized = placement_candidates.word_normalized
                          and preferred.policy_status = 'preferred'
                    ) desc,
                    rack_points desc,
                    patxanga_real_count asc,
                    wildcard_count asc,
                    word_len desc,
                    word_normalized
                ) as candidate_rank,
                *
            from placement_candidates
            order by exists (
                    select 1
                    from public.patxanga_bot_word_policy_overrides preferred
                    where preferred.language = v_match.language
                      and preferred.word_normalized = placement_candidates.word_normalized
                      and preferred.policy_status = 'preferred'
                ) desc,
                rack_points desc,
                patxanga_real_count asc,
                wildcard_count asc,
                word_len desc,
                word_normalized
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
                    'wildcard_count', wildcard_count,
                    'patxanga_real_count', patxanga_real_count,
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
            nullif(coalesce(rack_tile.tile->>'special_type', ''), '') as special_type,
            rack_tile.ordinality::integer as rack_ordinality,
            row_number() over (
                partition by public.normalize_patxanga_word(rack_tile.tile->>'letter')
                order by rack_tile.ordinality
            ) as occurrence
        from jsonb_array_elements(v_player.rack_state)
            with ordinality as rack_tile(tile, ordinality)
        where (
                coalesce((rack_tile.tile->>'is_special')::boolean, false) is false
                and nullif(coalesce(rack_tile.tile->>'special_type', ''), '') is null
                and char_length(public.normalize_patxanga_word(rack_tile.tile->>'letter')) = 1
            )
           or nullif(coalesce(rack_tile.tile->>'special_type', ''), '') in ('wildcard', 'patxanga_real')
    ),
    normal_rack_tiles as (
        select *
        from rack_tiles
        where special_type is null
    ),
    special_rack_tiles as (
        select
            *,
            row_number() over (
                order by case special_type when 'wildcard' then 1 when 'patxanga_real' then 2 else 9 end, rack_ordinality
            ) as special_index
        from rack_tiles
        where special_type in ('wildcard', 'patxanga_real')
    ),
    rack_letter_counts as (
        select letter, count(*) as available
        from normal_rack_tiles
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
        select letter from normal_rack_tiles
        union
        select letter from board_tiles
        union
        select generate_series.chr
        from special_rack_tiles
        cross join lateral regexp_split_to_table('ABCDEFGHIJKLMNOPQRSTUVWXYZ', '') as generate_series(chr)
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
          and public.is_patxanga_bot_policy_word(dictionary.word_normalized, v_match.language, v_player.bot_level)
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
              where required.needed > coalesce(rack_counts.available, 0) + coalesce(board_counts.available, 0) + (
                  select count(*) from special_rack_tiles
              )
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
    mapped_normal_letters as (
        select
            required_letters.*,
            normal_rack_tiles.tile_id,
            normal_rack_tiles.points,
            null::text as special_type,
            null::integer as special_index
        from required_letters
        left join normal_rack_tiles
          on normal_rack_tiles.letter = required_letters.letter
         and normal_rack_tiles.occurrence = required_letters.occurrence
    ),
    missing_letters as (
        select
            *,
            row_number() over (
                partition by word_normalized, direction, anchor_row, anchor_col, anchor_position
                order by position
            ) as missing_index
        from mapped_normal_letters
        where tile_id is null
    ),
    mapped_required_letters as (
        select
            mapped_normal_letters.word_normalized,
            mapped_normal_letters.word_len,
            mapped_normal_letters.direction,
            mapped_normal_letters.anchor_row,
            mapped_normal_letters.anchor_col,
            mapped_normal_letters.anchor_position,
            mapped_normal_letters.start_row,
            mapped_normal_letters.start_col,
            mapped_normal_letters.position,
            mapped_normal_letters.target_row,
            mapped_normal_letters.target_col,
            mapped_normal_letters.letter,
            mapped_normal_letters.tile_id,
            mapped_normal_letters.points,
            mapped_normal_letters.special_type
        from mapped_normal_letters
        where mapped_normal_letters.tile_id is not null

        union all

        select
            missing_letters.word_normalized,
            missing_letters.word_len,
            missing_letters.direction,
            missing_letters.anchor_row,
            missing_letters.anchor_col,
            missing_letters.anchor_position,
            missing_letters.start_row,
            missing_letters.start_col,
            missing_letters.position,
            missing_letters.target_row,
            missing_letters.target_col,
            missing_letters.letter,
            special_rack_tiles.tile_id,
            special_rack_tiles.points,
            special_rack_tiles.special_type
        from missing_letters
        join special_rack_tiles
          on special_rack_tiles.special_index = missing_letters.missing_index
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
                    'declared_letter', case when special_type is null then null else letter end
                )
                order by position
            ) as placed_tiles,
            sum(points) as rack_points,
            count(*) filter (where special_type = 'wildcard') as wildcard_count,
            count(*) filter (where special_type = 'patxanga_real') as patxanga_real_count
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
        having count(*) = word_len - 1
           and count(distinct tile_id) = word_len - 1
           and count(*) between 1 and 6
    ),
    ranked as (
        select
            row_number() over (
                order by exists (
                    select 1
                    from public.patxanga_bot_word_policy_overrides preferred
                    where preferred.language = v_match.language
                      and preferred.word_normalized = placement_candidates.word_normalized
                      and preferred.policy_status = 'preferred'
                ) desc,
                rack_points desc,
                patxanga_real_count asc,
                wildcard_count asc,
                word_len desc,
                word_normalized,
                direction,
                anchor_row,
                anchor_col
            ) as candidate_rank,
            *
        from placement_candidates
        order by exists (
                select 1
                from public.patxanga_bot_word_policy_overrides preferred
                where preferred.language = v_match.language
                  and preferred.word_normalized = placement_candidates.word_normalized
                  and preferred.policy_status = 'preferred'
            ) desc,
            rack_points desc,
            patxanga_real_count asc,
            wildcard_count asc,
            word_len desc,
            word_normalized,
            direction,
            anchor_row,
            anchor_col
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
                'wildcard_count', wildcard_count,
                'patxanga_real_count', patxanga_real_count,
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

revoke all on function public.is_patxanga_bot_policy_word(text, text, text)
from public, anon, authenticated;

grant execute on function public.is_patxanga_bot_policy_word(text, text, text)
to authenticated, anon;

grant execute on function public.calculate_patxanga_score(jsonb, jsonb, jsonb)
to authenticated, anon;

grant execute on function public.find_patxanga_playable_bot_candidate_moves(uuid, uuid, integer)
to authenticated, anon;
