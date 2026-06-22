import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import type { Page } from "@playwright/test";

type SlotMoveScenario = {
  matchId: string;
  currentUserId: string;
  otherUserId: string;
  tileIds: Record<string, string>;
};

type SpecialSlotMoveScenario = {
  matchId: string;
  currentUserId: string;
  tileIds: Record<"wildcard" | "A", string>;
};

type LongHumanFlowScenario = {
  matchId: string;
  openingUserId: string;
  bridgeUserId: string;
  openingTileIds: Record<"D" | "A", string>;
  bridgeTileIds: Record<"D" | "R", string>;
};

type FinishedMatchScenario = {
  matchId: string;
  viewerUserId: string;
  emptyRackPlayerId: string;
};

type HumanVsBotScenario = {
  matchId: string;
  humanUserId: string;
  botPlayerId: string;
};

type HumanVsBotExchangeScenario = HumanVsBotScenario & {
  tileIds: Record<"D" | "A", string>;
};

function runDatabaseJson<T>(sql: string): T {
  const containerName =
    process.env.PATXANGA_DB_CONTAINER ?? "supabase_db_patxanga-core";
  const output = execFileSync(
    "docker",
    [
      "exec",
      "-i",
      containerName,
      "psql",
      "-v",
      "ON_ERROR_STOP=1",
      "-qAt",
      "-U",
      "postgres",
      "-d",
      "postgres",
    ],
    {
      input: sql,
      encoding: "utf8",
    }
  ).trim();
  const jsonLine = output.split("\n").at(-1);

  if (!jsonLine) {
    throw new Error("Database setup returned no JSON payload.");
  }

  return JSON.parse(jsonLine) as T;
}

function createSlotMoveScenario(word: "DA" | "TS"): SlotMoveScenario {
  const rack =
    word === "DA"
      ? {
          firstLetter: "D",
          secondLetter: "A",
          firstPoints: 2,
          secondPoints: 1,
          suffix: [
            ["S", 1],
            ["E", 1],
            ["M", 2],
            ["O", 1],
            ["R", 1],
          ],
        }
      : {
          firstLetter: "T",
          secondLetter: "S",
          firstPoints: 2,
          secondPoints: 1,
          suffix: [
            ["A", 1],
            ["R", 1],
            ["E", 1],
            ["M", 2],
            ["O", 1],
          ],
        };

  return runDatabaseJson<SlotMoveScenario>(`
create temp table e2e_slot_move_result(payload text);

do $setup$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_guest_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_current_user_id uuid;
    v_other_user_id uuid;
    v_first_tile_id uuid := gen_random_uuid();
    v_second_tile_id uuid := gen_random_uuid();
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Slot E2E Host',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_guest_user_id,
        p_guest_name := 'Slot E2E Guest'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_current_player_id
    from public.patxanga_matches
    where id = v_match_id;

    select user_id
    into v_current_user_id
    from public.patxanga_players
    where id = v_current_player_id;

    select user_id
    into v_other_user_id
    from public.patxanga_players
    where match_id = v_match_id
      and id <> v_current_player_id
    order by joined_at asc
    limit 1;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object(
                'id', v_first_tile_id::text,
                'letter', '${rack.firstLetter}',
                'points', ${rack.firstPoints},
                'is_special', false,
                'special_type', null
            ),
            jsonb_build_object(
                'id', v_second_tile_id::text,
                'letter', '${rack.secondLetter}',
                'points', ${rack.secondPoints},
                'is_special', false,
                'special_type', null
            ),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', '${rack.suffix[0][0]}', 'points', ${rack.suffix[0][1]}, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', '${rack.suffix[1][0]}', 'points', ${rack.suffix[1][1]}, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', '${rack.suffix[2][0]}', 'points', ${rack.suffix[2][1]}, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', '${rack.suffix[3][0]}', 'points', ${rack.suffix[3][1]}, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', '${rack.suffix[4][0]}', 'points', ${rack.suffix[4][1]}, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_current_player_id;

    insert into e2e_slot_move_result(payload)
    values (
        jsonb_build_object(
            'matchId', v_match_id,
            'currentUserId', v_current_user_id,
            'otherUserId', v_other_user_id,
            'tileIds', jsonb_build_object(
                '${rack.firstLetter}', v_first_tile_id,
                '${rack.secondLetter}', v_second_tile_id
            )
        )::text
    );
end
$setup$;

select payload from e2e_slot_move_result;
`);
}

function createSpecialSlotMoveScenario(): SpecialSlotMoveScenario {
  return runDatabaseJson<SpecialSlotMoveScenario>(`
create temp table e2e_special_slot_move_result(payload text);

do $setup$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_guest_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_current_user_id uuid;
    v_wildcard_tile_id uuid := gen_random_uuid();
    v_a_tile_id uuid := gen_random_uuid();
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Special Slot E2E Host',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_guest_user_id,
        p_guest_name := 'Special Slot E2E Guest'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_current_player_id
    from public.patxanga_matches
    where id = v_match_id;

    select user_id
    into v_current_user_id
    from public.patxanga_players
    where id = v_current_player_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object(
                'id', v_wildcard_tile_id::text,
                'letter', null,
                'points', 0,
                'is_special', true,
                'special_type', 'wildcard'
            ),
            jsonb_build_object(
                'id', v_a_tile_id::text,
                'letter', 'A',
                'points', 1,
                'is_special', false,
                'special_type', null
            ),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_current_player_id;

    insert into e2e_special_slot_move_result(payload)
    values (
        jsonb_build_object(
            'matchId', v_match_id,
            'currentUserId', v_current_user_id,
            'tileIds', jsonb_build_object(
                'wildcard', v_wildcard_tile_id,
                'A', v_a_tile_id
            )
        )::text
    );
end
$setup$;

select payload from e2e_special_slot_move_result;
`);
}

function createLongHumanFlowScenario(): LongHumanFlowScenario {
  return runDatabaseJson<LongHumanFlowScenario>(`
create temp table e2e_long_human_flow_result(payload text);

do $setup$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_guest_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_opening_player_id uuid;
    v_bridge_player_id uuid;
    v_opening_user_id uuid;
    v_bridge_user_id uuid;
    v_opening_tile_d_id uuid := gen_random_uuid();
    v_opening_tile_a_id uuid := gen_random_uuid();
    v_bridge_tile_d_id uuid := gen_random_uuid();
    v_bridge_tile_r_id uuid := gen_random_uuid();
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Long Flow Host',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_guest_user_id,
        p_guest_name := 'Long Flow Guest'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_opening_player_id
    from public.patxanga_matches
    where id = v_match_id;

    select id
    into v_bridge_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and id <> v_opening_player_id
    order by joined_at asc
    limit 1;

    select user_id
    into v_opening_user_id
    from public.patxanga_players
    where id = v_opening_player_id;

    select user_id
    into v_bridge_user_id
    from public.patxanga_players
    where id = v_bridge_player_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_opening_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_opening_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_opening_player_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_bridge_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_bridge_tile_r_id::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'T', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_bridge_player_id;

    insert into e2e_long_human_flow_result(payload)
    values (
        jsonb_build_object(
            'matchId', v_match_id,
            'openingUserId', v_opening_user_id,
            'bridgeUserId', v_bridge_user_id,
            'openingTileIds', jsonb_build_object(
                'D', v_opening_tile_d_id,
                'A', v_opening_tile_a_id
            ),
            'bridgeTileIds', jsonb_build_object(
                'D', v_bridge_tile_d_id,
                'R', v_bridge_tile_r_id
            )
        )::text
    );
end
$setup$;

select payload from e2e_long_human_flow_result;
`);
}

function createFinishedEmptyRackScenario(): FinishedMatchScenario {
  return runDatabaseJson<FinishedMatchScenario>(`
create temp table e2e_finished_empty_rack_result(payload text);

do $setup$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_guest_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_current_user_id uuid;
    v_tile_d_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_result jsonb;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Finished E2E Host',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_guest_user_id,
        p_guest_name := 'Finished E2E Guest'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_current_player_id
    from public.patxanga_matches
    where id = v_match_id;

    select user_id
    into v_current_user_id
    from public.patxanga_players
    where id = v_current_player_id;

    update public.patxanga_matches
    set bag_state = jsonb_build_object('tiles', '[]'::jsonb, 'remaining', 0),
        updated_at = now()
    where id = v_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_current_player_id;

    v_result := public.submit_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile_d_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    if v_result->>'status' <> 'success' then
        raise exception 'Expected final move success, got %', v_result;
    end if;

    insert into e2e_finished_empty_rack_result(payload)
    values (
        jsonb_build_object(
            'matchId', v_match_id,
            'viewerUserId', v_current_user_id,
            'emptyRackPlayerId', v_current_player_id
        )::text
    );
end
$setup$;

select payload from e2e_finished_empty_rack_result;
`);
}

function createHumanVsBotScenarioWithBotTurn(): HumanVsBotScenario {
  return runDatabaseJson<HumanVsBotScenario>(`
create temp table e2e_human_vs_bot_result(payload text);

do $setup$
declare
    v_human_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_bot_player_id uuid;
    v_tile_s_id uuid := gen_random_uuid();
    v_tile_o_id uuid := gen_random_uuid();
    v_tile_l_id uuid := gen_random_uuid();
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_human_user_id,
        p_host_guest_name := 'Human E2E',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    v_bot_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Easy',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_tile_o_id::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_tile_l_id::text, 'letter', 'L', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Q', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'X', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Z', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'K', 'points', 7, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_bot_player_id;

    update public.patxanga_matches
    set current_turn_player_id = v_bot_player_id,
        updated_at = now()
    where id = v_match_id;

    insert into e2e_human_vs_bot_result(payload)
    values (
        jsonb_build_object(
            'matchId', v_match_id,
            'humanUserId', v_human_user_id,
            'botPlayerId', v_bot_player_id
        )::text
    );
end
$setup$;

select payload from e2e_human_vs_bot_result;
`);
}

function createHumanVsBotScenarioWithConnectedBotTurn(): HumanVsBotScenario {
  return runDatabaseJson<HumanVsBotScenario>(`
create temp table e2e_human_vs_bot_connected_result(payload text);

do $setup$
declare
    v_human_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_human_player_id uuid;
    v_bot_player_id uuid;
    v_tile_s_id uuid := gen_random_uuid();
    v_tile_o_id uuid := gen_random_uuid();
    v_tile_l_id uuid := gen_random_uuid();
    v_tile_u_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_opening_result jsonb;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_human_user_id,
        p_host_guest_name := 'Human Connected E2E',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_human_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and user_id = v_human_user_id;

    v_bot_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Easy Connected',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_tile_o_id::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_tile_l_id::text, 'letter', 'L', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Q', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'X', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Z', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'K', 'points', 7, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_human_player_id;

    update public.patxanga_matches
    set current_turn_player_id = v_human_player_id,
        updated_at = now()
    where id = v_match_id;

    v_opening_result := public.submit_patxanga_move(
        v_match_id,
        v_human_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile_s_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_o_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_l_id::text, 'row', 8, 'col', 10, 'declared_letter', null)
        )
    );

    if v_opening_result->>'status' <> 'success' then
        raise exception 'Expected setup opening success, got %', v_opening_result;
    end if;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_tile_u_id::text, 'letter', 'U', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Q', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'X', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Z', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'K', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Y', 'points', 7, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_bot_player_id;

    insert into e2e_human_vs_bot_connected_result(payload)
    values (
        jsonb_build_object(
            'matchId', v_match_id,
            'humanUserId', v_human_user_id,
            'botPlayerId', v_bot_player_id
        )::text
    );
end
$setup$;

select payload from e2e_human_vs_bot_connected_result;
`);
}

function createHumanVsBotExchangeScenario(): HumanVsBotExchangeScenario {
  return runDatabaseJson<HumanVsBotExchangeScenario>(`
create temp table e2e_human_vs_bot_exchange_result(payload text);

do $setup$
declare
    v_human_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_human_player_id uuid;
    v_bot_player_id uuid;
    v_human_tile_d_id uuid := gen_random_uuid();
    v_human_tile_a_id uuid := gen_random_uuid();
    v_bot_tile_s_id uuid := gen_random_uuid();
    v_bot_tile_o_id uuid := gen_random_uuid();
    v_bot_tile_l_id uuid := gen_random_uuid();
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_human_user_id,
        p_host_guest_name := 'Human Exchange E2E',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_human_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and user_id = v_human_user_id;

    v_bot_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Easy Exchange',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_human_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_human_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'T', 'points', 2, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_human_player_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_bot_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_bot_tile_o_id::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_bot_tile_l_id::text, 'letter', 'L', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Q', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'X', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'Z', 'points', 7, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'K', 'points', 7, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_bot_player_id;

    update public.patxanga_matches
    set current_turn_player_id = v_human_player_id,
        updated_at = now()
    where id = v_match_id;

    insert into e2e_human_vs_bot_exchange_result(payload)
    values (
        jsonb_build_object(
            'matchId', v_match_id,
            'humanUserId', v_human_user_id,
            'botPlayerId', v_bot_player_id,
            'tileIds', jsonb_build_object(
                'D', v_human_tile_d_id,
                'A', v_human_tile_a_id
            )
        )::text
    );
end
$setup$;

select payload from e2e_human_vs_bot_exchange_result;
`);
}

async function openPreparedMatch(page: Page, scenario: SlotMoveScenario) {
  await page.goto("/");
  await openAdvancedTools(page);

  await page.getByLabel("match_id", { exact: true }).fill(scenario.matchId);
  await page
    .getByLabel("user_id da sessao (temporario neste bootstrap real)")
    .fill(scenario.currentUserId);
  await page.getByRole("button", { name: "Abrir partida" }).click();

  await expect(page.getByText("Sua vez de jogar")).toBeVisible();
}

async function openAdvancedTools(page: Page) {
  if (await page.getByRole("heading", { name: "Abrir partida" }).isVisible().catch(() => false)) {
    return;
  }

  await page.getByTestId("advanced-tools-toggle").click();
  await expect(page.getByRole("heading", { name: "Abrir partida" })).toBeVisible();
}

async function placeTileThroughSlot(
  page: Page,
  tileId: string,
  slotNumber: number,
  rowIndex: number,
  colIndex: number
) {
  const slot = page.getByTestId(`rack-slot-${slotNumber}`);
  const tile = page.getByTestId(`rack-tile-${tileId}`);
  const boardCell = page.getByTestId(`board-cell-${rowIndex}-${colIndex}`);

  await slot.click();
  await tile.click();
  await expect(page.getByTestId(`rack-slot-${slotNumber}-bound-tile`)).toBeVisible();

  await boardCell.click();

  await expect(page.getByTestId(`rack-slot-${slotNumber}-association`)).toHaveText(
    `${rowIndex + 1},${colIndex + 1}`
  );
  await expect(
    page.getByTestId(`board-cell-${rowIndex}-${colIndex}-slot-badges`)
  ).toContainText(`S${slotNumber}`);
}

async function openMatchAsUser(page: Page, matchId: string, userId: string) {
  await openAdvancedTools(page);

  await page.getByLabel("match_id", { exact: true }).fill(matchId);
  await page
    .getByLabel("user_id da sessao (temporario neste bootstrap real)")
    .fill(userId);
  await page.getByRole("button", { name: "Abrir partida" }).click();
}

async function submitUnrecognizedTsToPendingVote(
  page: Page,
  scenario: SlotMoveScenario
) {
  await openPreparedMatch(page, scenario);

  await placeTileThroughSlot(page, scenario.tileIds.T, 1, 7, 7);
  await placeTileThroughSlot(page, scenario.tileIds.S, 2, 7, 8);

  await expect(page.getByText("2 peças em preparo")).toBeVisible();
  await expect(page.getByTestId("local-composed-word")).toContainText("TS");
  await expect(page.getByText("Palavra principal: TS")).toBeVisible();
  await expect(page.getByText("vai para votacao")).toBeVisible();
  await expect(page.getByTestId("dictionary-vote-diagnostic")).toContainText(
    "Palavra fora do léxico ativo"
  );

  await page.getByRole("button", { name: "Confirmar jogada" }).click();

  await expect(page.getByText("A mesa está em votação")).toBeVisible();
  await expect(page.getByTestId("pending-vote-panel")).toBeVisible();
  await expect(page.getByText("Palavra em avaliação")).toBeVisible();
  await expect(page.getByText("Jogada aguardando decisão da mesa")).toBeVisible();
  await expect(page.getByTestId("pending-vote-word")).toContainText("T");
  await expect(page.getByTestId("pending-vote-word")).toContainText("S");
  await expect(page.getByText("T em 8,8")).toBeVisible();
  await expect(page.getByText("S em 8,9")).toBeVisible();
  await expect(page.getByText("Autor não vota na própria palavra")).toBeVisible();
  await expect(page.getByText("O tabuleiro oficial continua intacto")).toBeVisible();
  await expect(page.getByTestId("board-cell-7-7")).toContainText("T");
  await expect(page.getByTestId("board-cell-7-8")).toContainText("S");
}

test.describe("browser validation scenarios", () => {
  test("runs invite, lobby, resume and forfeit flows from the test page", async ({
    page,
  }) => {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Patxanga" })).toBeVisible();
    await expect(page.getByTestId("primary-product-actions")).toContainText("Jogar agora");
    await expect(page.getByTestId("primary-product-actions")).toContainText("Treinar contra bot");
    await expect(page.getByTestId("primary-product-actions")).toContainText("Retomar mesa");
    await expect(page.getByTestId("auth-product-panel")).toContainText("Entre para jogar online");
    await expect(page.getByTestId("advanced-tools-toggle")).toContainText(
      "Mostrar ferramentas avançadas"
    );
    await openAdvancedTools(page);
    await expect(
      page.getByRole("heading", { name: "Cenarios de validacao browser" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Alternar host e guest" })
    ).toBeVisible();
    await expect(page.getByTestId("demo-roadmap-panel")).toContainText(
      "Demo interna ponta-a-ponta"
    );
    await expect(page.getByTestId("demo-roadmap-panel")).toContainText("Bot");
    await expect(page.getByTestId("demo-roadmap-panel")).toContainText("Dicionário");

    await page.getByRole("button", { name: "Gerar cenarios de validacao" }).click();

    const scenarioACard = page.getByTestId("browser-scenario-acceptStartResumeForfeit");
    const scenarioBCard = page.getByTestId("browser-scenario-declineInvite");

    await expect(scenarioACard).toBeVisible();
    await expect(scenarioBCard).toBeVisible();

    await page.getByRole("button", { name: "Carregar convites e partidas retomaveis" }).click();
    await page.getByRole("button", { name: "Aceitar convite" }).click();
    await expect(page.getByText("Convite aceito. A partida foi aberta nesta sessão.")).toBeVisible();

    await page.getByRole("button", { name: "Abrir como host" }).click();
    await page.getByRole("button", { name: "Iniciar partida do lobby" }).click();
    await expect(page.getByText("Lobby iniciado com sucesso.")).toBeVisible();

    await page.getByRole("button", { name: "Abrir como guest" }).click();
    await page.getByRole("button", { name: "Carregar convites e partidas retomaveis" }).click();
    await page.getByRole("button", { name: "Retomar partida" }).click();
    await expect(page.getByText("Partida retomada com sucesso.")).toBeVisible();

    await page.getByRole("button", { name: "Desistir da partida" }).click();
    await expect(page.getByText("Desistência registrada com sucesso.")).toBeVisible();

    await scenarioBCard.getByTestId("browser-scenario-declineInvite-use-guest").click();
    await page.getByRole("button", { name: "Carregar convites e partidas retomaveis" }).click();
    await page.getByRole("button", { name: "Recusar convite" }).click();
    await expect(page.getByText("Convite recusado com sucesso.")).toBeVisible();
  });

  test("creates an authenticated session and uses it as the product identity", async ({ page }) => {
    const email = `patxanga-e2e-${Date.now()}@example.com`;

    await page.goto("/");

    await page.getByTestId("auth-mode-sign-up").click();
    await page.getByTestId("auth-display-name").fill("Jogador Auth E2E");
    await page.getByTestId("auth-email").fill(email);
    await page.getByTestId("auth-password").fill("patxanga123");
    await page.getByTestId("auth-submit").click();

    await expect(page.getByTestId("auth-session-summary")).toContainText(
      "Jogador Auth E2E"
    );
    await expect(page.getByTestId("auth-message")).toContainText("Conta criada");

    const activeUserId = await page.getByTestId("auth-active-user-id").innerText();

    await page.getByTestId("quick-match-create").click();
    await expect(page.getByText(`host_user_id: ${activeUserId}`)).toBeVisible();
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();
  });

  test("associates a local rack slot to the board without affecting gameplay state", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Partida local rápida" })).toBeVisible();

    await page.getByTestId("quick-match-create").click();

    const slot = page.getByTestId("rack-slot-1");
    const boardCell = page.getByTestId("board-cell-0-0");

    await expect(slot).toBeVisible();
    await expect(boardCell).toBeVisible();

    await slot.click();
    await boardCell.click();

    await expect(page.getByTestId("rack-slot-1-association")).toHaveText("1,1");
    await expect(page.getByTestId("board-cell-0-0-slot-badges")).toContainText("S1");

    await boardCell.click();

    await expect(page.getByTestId("rack-slot-1-association")).toHaveCount(0);
    await expect(page.getByTestId("board-cell-0-0-slot-badges")).toHaveCount(0);
  });

  test("uses slot composition as an official move preparation surface", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByTestId("quick-match-create").click();

    const firstRackTile = page.locator('[data-testid^="rack-tile-"]').first();
    const slot = page.getByTestId("rack-slot-1");
    const centerCell = page.getByTestId("board-cell-7-7");

    await expect(firstRackTile).toBeVisible();
    await expect(slot).toBeVisible();
    await expect(centerCell).toBeVisible();

    await firstRackTile.click();
    await slot.click();

    await expect(page.getByTestId("rack-slot-1-bound-tile")).toBeVisible();

    await centerCell.click();

    await expect(page.getByTestId("rack-slot-1-association")).toHaveText("8,8");
    await expect(page.getByText("1 peça em preparo")).toBeVisible();
    await expect(page.getByTestId("board-cell-7-7-slot-badges")).toContainText("S1");

    await page.getByTestId("rack-slot-1-clear-association").click();

    await expect(page.getByTestId("rack-slot-1-bound-tile")).toBeVisible();
    await expect(page.getByTestId("rack-slot-1-association")).toHaveCount(0);
    await expect(page.getByTestId("board-cell-7-7-slot-badges")).toHaveCount(0);
    await expect(page.getByText("0 peças em preparo")).toBeVisible();

    await centerCell.click();
    await expect(page.getByTestId("rack-slot-1-association")).toHaveText("8,8");

    await page.getByRole("button", { name: "Limpar jogada" }).click();

    await expect(page.getByText("0 peças em preparo")).toBeVisible();
    await expect(page.getByTestId("rack-slot-1-bound-tile")).toHaveCount(0);
    await expect(page.getByTestId("rack-slot-1-association")).toHaveCount(0);
  });

  test("recomposes a slot assignment before submitting the official move", async ({ page }) => {
    const scenario = createSlotMoveScenario("DA");

    await openPreparedMatch(page, scenario);

    await placeTileThroughSlot(page, scenario.tileIds.D, 1, 7, 7);
    await expect(page.getByTestId("move-composition-summary")).toContainText(
      "1 peça pronta"
    );

    await page.getByTestId("rack-slot-1-clear-assignment").click();
    await expect(page.getByTestId("rack-slot-1-bound-tile")).toHaveCount(0);

    await page.getByTestId(`rack-tile-${scenario.tileIds.A}`).click();
    await expect(page.getByTestId("rack-slot-1-bound-tile")).toBeVisible();
    await expect(page.getByTestId("board-cell-7-7")).toContainText("A");
    await expect(page.getByTestId("move-composition-summary")).toContainText(
      "casas 8,8"
    );

    await page.getByTestId("rack-slot-1-clear-assignment").click();
    await page.getByTestId(`rack-tile-${scenario.tileIds.D}`).click();
    await expect(page.getByTestId("board-cell-7-7")).toContainText("D");

    await placeTileThroughSlot(page, scenario.tileIds.A, 2, 7, 8);

    await expect(page.getByTestId("move-composition-summary")).toContainText(
      "2 peças prontas"
    );
    await expect(page.getByText("Palavra principal: DA")).toBeVisible();

    await page.getByRole("button", { name: "Confirmar jogada" }).click();

    await expect(page.getByText("Aguardando o outro jogador")).toBeVisible();
    await expect(page.getByTestId("board-cell-7-7")).toContainText("D");
    await expect(page.getByTestId("board-cell-7-8")).toContainText("A");
  });

  test("requires declared letters for special tiles composed through slots", async ({ page }) => {
    const scenario = createSpecialSlotMoveScenario();

    await openPreparedMatch(page, {
      matchId: scenario.matchId,
      currentUserId: scenario.currentUserId,
      otherUserId: scenario.currentUserId,
      tileIds: scenario.tileIds,
    });

    await placeTileThroughSlot(page, scenario.tileIds.wildcard, 1, 7, 7);
    await placeTileThroughSlot(page, scenario.tileIds.A, 2, 7, 8);

    await expect(page.getByTestId("rack-slot-1-special-letter-status")).toHaveText(
      "letra obrigatória"
    );
    await expect(page.getByTestId("move-composition-warning")).toContainText(
      "S1 precisa de uma letra declarada"
    );
    await expect(page.getByRole("button", { name: "Confirmar jogada" })).toBeDisabled();

    await page.getByTestId("rack-slot-1-letter-input").fill("d");

    await expect(page.getByTestId("rack-slot-1-special-letter-status")).toHaveText(
      "letra D"
    );
    await expect(page.getByTestId("move-composition-warning")).toHaveCount(0);
    await expect(page.getByText("Palavra principal: DA")).toBeVisible();

    await page.getByRole("button", { name: "Confirmar jogada" }).click();

    await expect(page.getByText("Aguardando o outro jogador")).toBeVisible();
    await expect(page.getByTestId("board-cell-7-7")).toContainText("D");
    await expect(page.getByTestId("board-cell-7-8")).toContainText("A");
  });

  test("creates a pt-PT quick match and surfaces its dictionary summary", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("quick-match-language").selectOption("pt-PT");
    await page.getByTestId("quick-match-create").click();

    await expect(page.getByText("language: pt-PT")).toBeVisible();
    await expect(page.getByTestId("dictionary-language-badge")).toContainText(
      "dicionário pt-PT ativo"
    );
    await expect(page.getByTestId("dictionary-operational-card")).toContainText(
      "sem fallback automático"
    );
    await expect(page.getByTestId("dictionary-import-commands")).toContainText(
      "import-libreoffice-pt-pt-sample.sh"
    );
  });

  test("creates a human versus bot quick match", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("bot-match-create").click();

    await expect(page.getByText("bot_user_id:")).toBeVisible();
    await expect(page.getByText("bot easy / balanced", { exact: true })).toBeVisible();
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();
  });

  test("auto-plays a valid bot opening word in a human versus bot match", async ({ page }) => {
    const scenario = createHumanVsBotScenarioWithBotTurn();

    await page.goto("/");
    await openAdvancedTools(page);

    await page.getByLabel("match_id", { exact: true }).fill(scenario.matchId);
    await page
      .getByLabel("user_id da sessao (temporario neste bootstrap real)")
      .fill(scenario.humanUserId);
    await page.getByRole("button", { name: "Abrir partida" }).click();

    await expect(page.getByText("bot easy / balanced", { exact: true })).toBeVisible();
    await expect(page.getByTestId("dictionary-language-badge")).toContainText(
      "dicionário pt-BR ativo"
    );
    await expect(page.getByTestId("bot-action-message")).toContainText(
      "Bot jogou SOL como abertura."
    );
    await expect(page.getByTestId("game-bot-action-message")).toContainText(
      "Bot jogou SOL como abertura."
    );
    await expect(page.getByTestId("game-bot-action-history")).toContainText(
      "Histórico recente do bot"
    );
    await expect(page.getByTestId("game-bot-action-history")).toContainText(
      "Bot jogou SOL como abertura."
    );
    await expect(page.getByTestId("bot-product-state")).toContainText("Bot com");
    await expect(page.getByTestId("match-action-timeline")).toContainText("Bot jogou");
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();
    await expect(page.getByTestId("board-cell-7-7")).toContainText("S");
    await expect(page.getByTestId("board-cell-7-8")).toContainText("O");
    await expect(page.getByTestId("board-cell-7-9")).toContainText("L");
  });

  test("auto-plays a connected bot word after the opening", async ({ page }) => {
    const scenario = createHumanVsBotScenarioWithConnectedBotTurn();

    await page.goto("/");
    await openAdvancedTools(page);

    await page.getByLabel("match_id", { exact: true }).fill(scenario.matchId);
    await page
      .getByLabel("user_id da sessao (temporario neste bootstrap real)")
      .fill(scenario.humanUserId);
    await page.getByRole("button", { name: "Abrir partida" }).click();

    await expect(page.getByText("bot easy / balanced", { exact: true })).toBeVisible();
    await expect(page.getByTestId("bot-action-message")).toContainText(
      "Bot jogou LUA conectando ao tabuleiro."
    );
    await expect(page.getByTestId("game-bot-action-message")).toContainText(
      "Bot jogou LUA conectando ao tabuleiro."
    );
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();
    await expect(page.getByTestId("board-cell-7-9")).toContainText("L");
    await expect(page.getByTestId("board-cell-8-9")).toContainText("U");
    await expect(page.getByTestId("board-cell-9-9")).toContainText("A");
  });

  test("exchanges pieces and resumes control after the bot turn", async ({ page }) => {
    const scenario = createHumanVsBotExchangeScenario();

    await page.goto("/");
    await openMatchAsUser(page, scenario.matchId, scenario.humanUserId);

    await expect(page.getByText("Sua vez de jogar")).toBeVisible();
    await page.getByTestId("exchange-turn-toggle").click();

    await page.getByTestId(`rack-tile-${scenario.tileIds.D}`).click();
    await page.getByTestId(`rack-tile-${scenario.tileIds.A}`).click();

    await expect(page.getByText("2 peças selecionadas para troca.")).toBeVisible();
    await expect(page.getByTestId("exchange-turn-submit")).toContainText("Trocar 2 peça(s)");

    await page.getByTestId("exchange-turn-submit").click();

    await expect(page.getByTestId("turn-action-message")).toContainText("Troca concluída com 2 peças");
    await expect(page.getByTestId("turn-action-summary-card")).toContainText("Troca de 2 peças");
    await expect(page.getByTestId("turn-action-summary-card")).toContainText("rack 7 → 7");
    await expect(page.getByTestId("game-bot-action-message")).toContainText(
      "Bot jogou SOL como abertura."
    );
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();
    await expect(page.getByTestId("board-cell-7-7")).toContainText("S");
    await expect(page.getByTestId("board-cell-7-8")).toContainText("O");
    await expect(page.getByTestId("board-cell-7-9")).toContainText("L");
  });

  test("alternates turns repeatedly in human versus bot after an initial bot opening", async ({ page }) => {
    const scenario = createHumanVsBotScenarioWithBotTurn();

    await page.goto("/");
    await openMatchAsUser(page, scenario.matchId, scenario.humanUserId);
    await expect(page.getByTestId("game-bot-action-message")).toContainText(
      "Bot jogou SOL como abertura."
    );
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();
    await expect(page.getByText(/turno 2/)).toBeVisible();

    const firstBotActionText = await page
      .getByTestId("game-bot-action-message")
      .innerText();

    await page.getByTestId("pass-turn-action").click();
    await expect(page.getByTestId("turn-action-message")).toContainText("Turno passado com sucesso.");
    await expect(page.getByTestId("pass-turn-action")).toBeDisabled();
    await expect(page.getByText("turno 3", { exact: true })).toBeVisible();

    await expect(page.getByTestId("game-bot-action-message")).not.toHaveText(firstBotActionText);
    await expect(page.getByText(/turno 4/)).toBeVisible();

    await expect(page.getByTestId("game-bot-action-message")).toContainText("Bot ");
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();

    await page.getByTestId("pass-turn-action").click();
    await expect(page.getByTestId("turn-action-message")).toContainText("Turno passado com sucesso.");

    await expect(page.getByText("turno 5")).toBeVisible();
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();
    await expect(page.getByTestId("game-bot-action-message")).toContainText("Bot ");
  });

  test("passes the turn on the current match without making a move", async ({ page }) => {
    const scenario = createSlotMoveScenario("DA");

    await openPreparedMatch(page, scenario);
    await expect(page.getByTestId("pass-turn-action")).toBeEnabled();

    await page.getByTestId("pass-turn-action").click();

    await expect(page.getByTestId("turn-action-message")).toContainText("Turno passado com sucesso.");
    await expect(page.getByTestId("turn-action-summary-card")).toContainText("Turno passado");
    await expect(page.getByTestId("turn-action-summary-card")).toContainText("rack 7 → 7");
    await expect(page.getByText("Aguardando o outro jogador")).toBeVisible();
  });

  test("explains why pass and exchange are blocked outside the player's turn", async ({ page }) => {
    const scenario = createSlotMoveScenario("DA");

    await page.goto("/");
    await openMatchAsUser(page, scenario.matchId, scenario.otherUserId);

    await expect(page.getByText("Aguardando o outro jogador")).toBeVisible();
    await expect(page.getByTestId("pass-turn-action")).toBeDisabled();
    await expect(page.getByTestId("exchange-turn-toggle")).toBeDisabled();
    await expect(page.getByTestId("turn-action-block-reason")).toContainText("Aguarde");
  });

  test("opens a finished match with endgame summary", async ({ page }) => {
    const scenario = createFinishedEmptyRackScenario();

    await page.goto("/");
    await openMatchAsUser(page, scenario.matchId, scenario.viewerUserId);

    await expect(page.getByText("Partida encerrada").first()).toBeVisible();
    await expect(page.getByTestId("finished-product-panel")).toBeVisible();
    await expect(page.getByTestId("finished-product-panel")).toContainText("Resultado final");
    await expect(page.getByTestId("finished-product-panel")).toContainText("Motivo:");
    await expect(page.getByTestId("finished-product-panel")).toContainText("Fim por rack vazio");
    await expect(page.getByTestId("finished-product-panel")).toContainText("Penalidades finais:");
    await expect(page.getByTestId("dictionary-language-badge")).toContainText(
      "dicionário pt-BR ativo"
    );
  });

  test("submits an accepted word through rack slots", async ({ page }) => {
    const scenario = createSlotMoveScenario("DA");

    await openPreparedMatch(page, scenario);

    await placeTileThroughSlot(page, scenario.tileIds.D, 1, 7, 7);
    await placeTileThroughSlot(page, scenario.tileIds.A, 2, 7, 8);

    await expect(page.getByText("2 peças em preparo")).toBeVisible();
    await expect(page.getByText("Palavra principal: DA")).toBeVisible();
    await expect(page.getByText("dicionario reconhece")).toBeVisible();

    await page.getByRole("button", { name: "Confirmar jogada" }).click();

    await expect(page.getByText("Aguardando o outro jogador")).toBeVisible();
    await expect(page.getByText("0 peças em preparo")).toBeVisible();
    await expect(page.getByTestId("board-cell-7-7")).toContainText("D");
    await expect(page.getByTestId("board-cell-7-8")).toContainText("A");
  });

  test("plays a longer human flow with resume, connected pending vote and rejection", async ({
    page,
  }) => {
    const scenario = createLongHumanFlowScenario();

    await page.goto("/");
    await openMatchAsUser(page, scenario.matchId, scenario.openingUserId);
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();

    await placeTileThroughSlot(page, scenario.openingTileIds.D, 1, 7, 7);
    await placeTileThroughSlot(page, scenario.openingTileIds.A, 2, 7, 8);

    await expect(page.getByText("Palavra principal: DA")).toBeVisible();
    await expect(page.getByText("dicionario reconhece")).toBeVisible();

    await page.getByRole("button", { name: "Confirmar jogada" }).click();

    await expect(page.getByText("Aguardando o outro jogador")).toBeVisible();
    await expect(page.getByTestId("board-cell-7-7")).toContainText("D");
    await expect(page.getByTestId("board-cell-7-8")).toContainText("A");

    await openMatchAsUser(page, scenario.matchId, scenario.bridgeUserId);
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();
    await expect(page.getByTestId("board-cell-7-7")).toContainText("D");
    await expect(page.getByTestId("board-cell-7-8")).toContainText("A");

    await placeTileThroughSlot(page, scenario.bridgeTileIds.D, 1, 6, 8);
    await placeTileThroughSlot(page, scenario.bridgeTileIds.R, 2, 8, 8);

    await expect(page.getByText("Palavra principal: DAR")).toBeVisible();
    await expect(page.getByText("vai para votacao")).toBeVisible();

    await page.getByRole("button", { name: "Confirmar jogada" }).click();

    await expect(page.getByText("A mesa está em votação")).toBeVisible();
    await expect(page.getByText("Autor não vota na própria palavra")).toBeVisible();
    await expect(page.getByTestId("pending-vote-word")).toContainText("D");
    await expect(page.getByTestId("pending-vote-word")).toContainText("A");
    await expect(page.getByTestId("pending-vote-word")).toContainText("R");
    await expect(page.getByText("D em 7,9")).toBeVisible();
    await expect(page.getByText("R em 9,9")).toBeVisible();

    await openMatchAsUser(page, scenario.matchId, scenario.openingUserId);
    await expect(page.getByText("Você pode votar porque não é o autor desta jogada.")).toBeVisible();

    await page.getByRole("button", { name: "Rejeitar palavra" }).click();

    await expect(page.getByTestId("vote-resolution-message")).toContainText(
      "Palavra rejeitada. O turno voltou ao autor."
    );
    await expect(page.getByText("Aguardando o outro jogador")).toBeVisible();
    await expect(page.getByTestId("pending-vote-panel")).toHaveCount(0);

    await openMatchAsUser(page, scenario.matchId, scenario.bridgeUserId);
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();
    await expect(page.getByTestId("board-cell-7-7")).toContainText("D");
    await expect(page.getByTestId("board-cell-7-8")).toContainText("A");
  });

  test("sends an unrecognized slot word to pending vote and rejects it as another player", async ({
    page,
  }) => {
    const scenario = createSlotMoveScenario("TS");

    await submitUnrecognizedTsToPendingVote(page, scenario);
    await openMatchAsUser(page, scenario.matchId, scenario.otherUserId);

    await expect(page.getByText("A mesa está em votação")).toBeVisible();
    await expect(page.getByText("Você pode votar porque não é o autor desta jogada.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Aceitar palavra" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Rejeitar palavra" })).toBeEnabled();

    await page.getByRole("button", { name: "Rejeitar palavra" }).click();

    await expect(page.getByTestId("vote-resolution-message")).toContainText(
      "Palavra rejeitada. O turno voltou ao autor."
    );
    await expect(page.getByText("Aguardando o outro jogador")).toBeVisible();
    await expect(page.getByTestId("pending-vote-panel")).toHaveCount(0);
  });

  test("accepts an unrecognized slot word as another player", async ({ page }) => {
    const scenario = createSlotMoveScenario("TS");

    await submitUnrecognizedTsToPendingVote(page, scenario);
    await openMatchAsUser(page, scenario.matchId, scenario.otherUserId);

    await expect(page.getByText("A mesa está em votação")).toBeVisible();
    await expect(page.getByText("Você pode votar porque não é o autor desta jogada.")).toBeVisible();

    await page.getByRole("button", { name: "Aceitar palavra" }).click();

    await expect(page.getByTestId("vote-resolution-message")).toContainText(
      "Palavra aceita. O tabuleiro oficial foi atualizado."
    );
    await expect(page.getByText("Sua vez de jogar")).toBeVisible();
    await expect(page.getByTestId("pending-vote-panel")).toHaveCount(0);
    await expect(page.getByTestId("board-cell-7-7")).toContainText("T");
    await expect(page.getByTestId("board-cell-7-8")).toContainText("S");
  });

  test("exchanges selected rack pieces in the current player's turn", async ({ page }) => {
    const scenario = createSlotMoveScenario("DA");

    await openPreparedMatch(page, scenario);
    await expect(page.getByTestId("exchange-turn-toggle")).toBeVisible();

    await page.getByTestId("exchange-turn-toggle").click();
    await expect(page.getByTestId("exchange-turn-submit")).toBeVisible();
    await expect(page.getByTestId("exchange-turn-submit")).toBeDisabled();

    await page.getByTestId(`rack-tile-${scenario.tileIds.D}`).click();
    await page.getByTestId(`rack-tile-${scenario.tileIds.A}`).click();

    await expect(page.getByTestId("exchange-turn-submit")).toContainText("Trocar 2 peça(s)");
    await expect(page.getByTestId("exchange-turn-submit")).toBeEnabled();

    await page.getByTestId("exchange-turn-submit").click();

    await expect(page.getByTestId("turn-action-message")).toContainText("Troca concluída com 2 peças");
    await expect(page.getByText("Aguardando o outro jogador")).toBeVisible();
  });
});
