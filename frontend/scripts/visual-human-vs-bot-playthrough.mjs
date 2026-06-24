import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DB_CONTAINER = process.env.PATXANGA_DB_CONTAINER ?? "supabase_db_patxanga-core";
const MAX_TURNS = Number.parseInt(process.env.PATXANGA_PLAYTHROUGH_MAX_TURNS ?? "120", 10);
const LANGUAGE = process.env.PATXANGA_PLAYTHROUGH_LANGUAGE ?? "pt-PT";
const OUT_DIR =
  process.env.PATXANGA_PLAYTHROUGH_OUT_DIR ??
  join(process.cwd(), "test-results", `human-vs-bot-playthrough-${new Date().toISOString().replace(/[:.]/g, "-")}`);

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function runSql(sql) {
  return execFileSync(
    "docker",
    [
      "exec",
      "-i",
      DB_CONTAINER,
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
      maxBuffer: 64 * 1024 * 1024,
    }
  ).trim();
}

function runJson(sql) {
  const output = runSql(sql);
  const jsonLine = output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .at(-1);

  if (!jsonLine) {
    throw new Error("SQL did not return a JSON payload.");
  }

  return JSON.parse(jsonLine);
}

function createMatch() {
  return runJson(`
create temp table visual_playthrough_created(payload text);

do $setup$
declare
    v_codex_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_codex_player_id uuid;
    v_bot_player_id uuid;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_codex_user_id,
        p_host_guest_name := 'Codex',
        p_language := ${sqlString(LANGUAGE)},
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

    select id
    into v_codex_player_id
    from public.patxanga_players
    where match_id = v_match_id
      and user_id = v_codex_user_id;

    update public.patxanga_players
    set turn_order = case
            when id = v_codex_player_id then 1
            when id = v_bot_player_id then 2
            else turn_order
        end,
        updated_at = now()
    where match_id = v_match_id;

    update public.patxanga_matches
    set current_turn_player_id = v_codex_player_id,
        turn_number = 1,
        updated_at = now()
    where id = v_match_id;

    insert into visual_playthrough_created(payload)
    values (
        jsonb_build_object(
            'matchId', v_match_id,
            'codexUserId', v_codex_user_id,
            'codexPlayerId', v_codex_player_id,
            'botPlayerId', v_bot_player_id,
            'language', ${sqlString(LANGUAGE)}
        )::text
    );
end
$setup$;

select payload from visual_playthrough_created;
`);
}

function submitNextMove(matchId) {
  return runJson(`
create temp table visual_playthrough_turn(payload text);

do $turn$
declare
    v_match record;
    v_player record;
    v_previous_is_bot boolean;
    v_previous_bot_level text;
    v_previous_bot_profile text;
    v_candidates jsonb;
    v_candidate jsonb;
    v_result jsonb;
begin
    select *
    into v_match
    from public.patxanga_matches
    where id = ${sqlString(matchId)}
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'active' then
        insert into visual_playthrough_turn(payload)
        values (
            jsonb_build_object(
                'submitted', false,
                'reason', 'match_not_active',
                'match_status', v_match.status
            )::text
        );
        return;
    end if;

    select *
    into v_player
    from public.patxanga_players
    where id = v_match.current_turn_player_id
      and match_id = v_match.id
    for update;

    if not found then
        raise exception 'Current player not found';
    end if;

    if coalesce(v_player.is_bot, false) is true then
        v_result := public.submit_patxanga_easy_bot_turn(v_match.id, v_player.id);
    else
        v_previous_is_bot := coalesce(v_player.is_bot, false);
        v_previous_bot_level := v_player.bot_level;
        v_previous_bot_profile := v_player.bot_profile;

        update public.patxanga_players
        set is_bot = true,
            bot_level = coalesce(bot_level, 'easy'),
            bot_profile = coalesce(bot_profile, 'balanced'),
            updated_at = now()
        where id = v_player.id;

        v_candidates := public.find_patxanga_playable_bot_candidate_moves(
            v_match.id,
            v_player.id,
            50
        );

        update public.patxanga_players
        set is_bot = v_previous_is_bot,
            bot_level = v_previous_bot_level,
            bot_profile = v_previous_bot_profile,
            updated_at = now()
        where id = v_player.id;

        select candidate.value
        into v_candidate
        from jsonb_array_elements(v_candidates) as candidate(value)
        where not exists (
            select 1
            from public.patxanga_moves existing_move
            cross join lateral public.patxanga_move_words_for_replay_check(
                existing_move.main_word,
                existing_move.secondary_words
            ) existing_words
            where existing_move.match_id = v_match.id
              and existing_move.move_type = 'place_word'
              and existing_move.status = 'accepted'
              and existing_words.word_normalized = public.normalize_patxanga_word(candidate.value->>'main_word')
        )
        order by coalesce((candidate.value->>'candidate_rank')::integer, 999999)
        limit 1;

        if v_candidate is not null then
            v_result := public.submit_patxanga_move(
                v_match.id,
                v_player.id,
                v_candidate->'placed_tiles'
            ) || jsonb_build_object(
                'bot_action', 'place_word',
                'bot_strategy', v_candidate->>'bot_strategy',
                'main_word', v_candidate->>'main_word',
                'direction', v_candidate->>'direction',
                'anchor', v_candidate->'anchor',
                'placed_tiles', v_candidate->'placed_tiles',
                'played_by', 'codex_policy'
            );
        else
            v_result := public.submit_patxanga_pass_turn(
                v_match.id,
                v_player.id
            ) || jsonb_build_object(
                'bot_action', 'pass',
                'bot_strategy', 'playable_dictionary_word',
                'pass_reason', 'no_playable_word',
                'played_by', 'codex_policy'
            );
        end if;
    end if;

    insert into visual_playthrough_turn(payload)
    values (
        (
            v_result || jsonb_build_object(
                'submitted', true,
                'player_id', v_player.id,
                'player_name', v_player.display_name,
                'is_bot_player', coalesce(v_player.is_bot, false)
            )
        )::text
    );
end
$turn$;

select payload from visual_playthrough_turn;
`);
}

function fetchSnapshot(matchId, lastResult, screenshotPath = null) {
  return runJson(`
select jsonb_build_object(
    'match', jsonb_build_object(
        'id', m.id,
        'status', m.status,
        'language', m.language,
        'turn_number', m.turn_number,
        'current_turn_player_id', m.current_turn_player_id,
        'winner_player_id', m.winner_player_id,
        'bag_remaining', coalesce((m.bag_state->>'remaining')::integer, 0),
        'board_state', m.board_state
    ),
    'players', (
        select coalesce(
            jsonb_agg(
                jsonb_build_object(
                    'id', p.id,
                    'name', p.display_name,
                    'score', p.score,
                    'is_bot', p.is_bot,
                    'rack_count', jsonb_array_length(p.rack_state),
                    'rack_letters', (
                        select coalesce(
                            string_agg(
                                case nullif(coalesce(tile->>'special_type', ''), '')
                                    when 'skip_turn' then 'SKIP'
                                    when 'patxanga_real' then 'PR'
                                    when 'wildcard' then '*'
                                    else coalesce(tile->>'letter', '?')
                                end,
                                ' '
                                order by ordinality
                            ),
                            ''
                        )
                        from jsonb_array_elements(p.rack_state) with ordinality as rack(tile, ordinality)
                    ),
                    'has_passed_last_cycle', p.has_passed_last_cycle
                )
                order by p.turn_order
            ),
            '[]'::jsonb
        )
        from public.patxanga_players p
        where p.match_id = m.id
    ),
    'moves', (
        select coalesce(
            jsonb_agg(
                jsonb_build_object(
                    'id', mv.id,
                    'player_id', mv.player_id,
                    'player_name', p.display_name,
                    'move_type', mv.move_type,
                    'status', mv.status,
                    'main_word', mv.main_word,
                    'score_total', mv.score_total,
                    'placed_tiles', mv.placed_tiles,
                    'created_at', mv.created_at
                )
                order by mv.created_at, mv.id
            ),
            '[]'::jsonb
        )
        from public.patxanga_moves mv
        join public.patxanga_players p on p.id = mv.player_id
        where mv.match_id = m.id
    ),
    'last_result', ${sqlString(JSON.stringify(lastResult ?? {}))}::jsonb,
    'screenshot_path', ${screenshotPath === null ? "null" : sqlString(screenshotPath)}
)::text
from public.patxanga_matches m
where m.id = ${sqlString(matchId)};
`);
}

function cellMultiplier(cell) {
  return cell?.multiplier ?? cell?.special ?? cell?.type ?? "";
}

function cellTile(cell) {
  return cell?.tile ?? cell?.placed_tile ?? null;
}

function tileLetter(tile) {
  if (!tile) return "";
  return tile.declared_letter ?? tile.letter ?? "?";
}

function safeFilenamePart(value) {
  return String(value ?? "move").replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-|-$/g, "") || "move";
}

function latestMove(snapshot) {
  return snapshot.moves.at(-1) ?? null;
}

function latestMoveCoordinates(snapshot) {
  const move = latestMove(snapshot);
  if (!move?.placed_tiles || !Array.isArray(move.placed_tiles)) {
    return new Set();
  }

  return new Set(move.placed_tiles.map((tile) => `${tile.row}:${tile.col}`));
}

function renderHtml(snapshot, title) {
  const match = snapshot.match;
  const players = snapshot.players;
  const moves = snapshot.moves;
  const lastMove = latestMove(snapshot);
  const lastCoords = latestMoveCoordinates(snapshot);
  const currentPlayer = players.find((player) => player.id === match.current_turn_player_id);
  const winner = players.find((player) => player.id === match.winner_player_id);
  const lastResult = snapshot.last_result ?? {};
  const boardRows = match.board_state ?? [];
  const simulationStatus =
    match.status !== "active"
      ? `partida ${match.status}`
      : match.bag_remaining <= 0
        ? "simulação encerrada: saco vazio"
        : "partida ativa";

  const board = boardRows
    .map((row, rowIndex) => {
      const cells = (Array.isArray(row) ? row : []).map((cell, colIndex) => {
        const tile = cellTile(cell);
        const multiplier = cellMultiplier(cell);
        const coordinate = `${rowIndex + 1}:${colIndex + 1}`;
        const highlighted = lastCoords.has(coordinate);
        const classes = [
          "cell",
          tile ? "tile" : "empty",
          multiplier ? `mult-${String(multiplier).toLowerCase()}` : "",
          highlighted ? "last" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<div class="${classes}"><span>${tile ? tileLetter(tile) : multiplier}</span></div>`;
      });
      return `<div class="board-row">${cells.join("")}</div>`;
    })
    .join("");

  const playerCards = players
    .map((player) => {
      const isCurrent = player.id === match.current_turn_player_id && match.status === "active";
      const isWinner = player.id === match.winner_player_id;
      return `<section class="card ${isCurrent ? "current" : ""} ${isWinner ? "winner" : ""}">
        <div class="eyebrow">${player.is_bot ? "BOT" : "HUMANO"}</div>
        <h2>${player.name}</h2>
        <div class="score">${player.score} pontos</div>
        <div class="rack">${player.rack_letters || "sem peças"} <span>${player.rack_count} peças</span></div>
        ${player.has_passed_last_cycle ? `<div class="passed">passou neste ciclo</div>` : ""}
      </section>`;
    })
    .join("");

  const moveItems = moves
    .slice(-12)
    .reverse()
    .map((move, index) => {
      const isLast = index === 0;
      const label =
        move.move_type === "place_word"
          ? `${move.main_word ?? "(sem palavra)"} · ${move.score_total} pts`
          : move.move_type;
      return `<li class="${isLast ? "recent" : ""}">
        <strong>${move.player_name}</strong>
        <span>${label}</span>
      </li>`;
    })
    .join("");

  const lastAction =
    lastResult.bot_action === "place_word"
      ? `${lastResult.player_name ?? "Jogador"} jogou ${lastResult.main_word ?? lastMove?.main_word ?? "palavra"}`
      : lastResult.bot_action === "pass"
        ? `${lastResult.player_name ?? "Jogador"} passou (${lastResult.pass_reason ?? "sem razão"})`
        : "Estado inicial";

  return `<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    :root {
      --ink: #111827;
      --muted: #667085;
      --paper: #fffaf0;
      --green: #154734;
      --gold: #c5892d;
      --blue: #1d4ed8;
      --amber: #f59e0b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at 12% 8%, rgba(39, 174, 96, 0.18), transparent 28%),
        linear-gradient(135deg, #eef8ef 0%, #fff8e6 56%, #edf5ff 100%);
      color: var(--ink);
      font-family: "Avenir Next", "Trebuchet MS", sans-serif;
      padding: 28px;
    }
    .shell { max-width: 1480px; margin: 0 auto; display: grid; gap: 18px; }
    .hero {
      border-radius: 30px;
      padding: 24px 28px;
      background: linear-gradient(120deg, #123f2c, #5a4417);
      color: #fffbe6;
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: end;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.15);
    }
    .eyebrow {
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 900;
      color: #f5c542;
    }
    h1 { margin: 6px 0 8px; font-size: 42px; line-height: 1; }
    h2 { margin: 4px 0 8px; font-size: 24px; }
    .summary { display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
    .pill {
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.22);
      padding: 10px 14px;
      font-weight: 900;
    }
    .players { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .card, .panel {
      border: 1px solid rgba(15, 23, 42, 0.12);
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.82);
      padding: 18px;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
    }
    .card.current { outline: 4px solid rgba(37, 99, 235, 0.22); border-color: #2563eb; }
    .card.winner { outline: 4px solid rgba(245, 158, 11, 0.28); border-color: #f59e0b; }
    .score { font-size: 30px; font-weight: 950; }
    .rack { margin-top: 10px; font-size: 20px; font-weight: 900; letter-spacing: 0.06em; }
    .rack span, .muted { color: var(--muted); font-size: 14px; letter-spacing: 0; font-weight: 700; }
    .passed { margin-top: 8px; color: #9a3412; font-weight: 900; }
    .layout { display: grid; grid-template-columns: minmax(700px, 1fr) 370px; gap: 18px; align-items: start; }
    .board {
      display: grid;
      gap: 3px;
      padding: 16px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(15, 23, 42, 0.1);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
    }
    .board-row { display: grid; grid-template-columns: repeat(15, 1fr); gap: 3px; }
    .cell {
      aspect-ratio: 1 / 1;
      border-radius: 7px;
      border: 1px solid #cfd7df;
      background: #f8fafc;
      display: grid;
      place-items: center;
      font-size: 11px;
      color: #475467;
      font-weight: 950;
    }
    .cell.tile {
      background: linear-gradient(145deg, #fff7da, #f5d999);
      color: #101828;
      border-color: #b7791f;
      box-shadow: 0 5px 0 #a16207;
      font-size: 22px;
    }
    .cell.last {
      outline: 4px solid #ef4444;
      outline-offset: -4px;
    }
    .mult-pt { background: #ffd7dc; color: #7f1d1d; }
    .mult-pd { background: #ffe7ba; color: #92400e; }
    .mult-ld { background: #e9d5ff; color: #5b21b6; }
    .mult-lt { background: #dbeafe; color: #1e3a8a; }
    .last-action {
      border-left: 8px solid var(--amber);
      background: #fffbeb;
      color: #78350f;
      font-size: 20px;
      font-weight: 950;
    }
    ol { margin: 10px 0 0; padding: 0; list-style: none; display: grid; gap: 8px; }
    li {
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 14px;
      padding: 10px 12px;
      background: #f8fafc;
      display: grid;
      gap: 2px;
    }
    li.recent { background: #ecfdf3; border-color: #86efac; }
    li span { color: var(--muted); font-weight: 800; }
    .footer {
      color: #475467;
      font-size: 12px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <main class="shell">
    <header class="hero">
      <div>
        <div class="eyebrow">Playthrough visual humano x bot</div>
        <h1>${title}</h1>
        <div>${match.language} · ${simulationStatus}${winner ? ` · vencedor: ${winner.name}` : ""}</div>
      </div>
      <div class="summary">
        <div class="pill">Turno ${match.turn_number}</div>
        <div class="pill">Saco ${match.bag_remaining}</div>
        <div class="pill">${
          match.status === "active" && match.bag_remaining > 0 ? `Agora: ${currentPlayer?.name ?? "?"}` : "Encerrada"
        }</div>
      </div>
    </header>

    <section class="players">${playerCards}</section>

    <section class="panel last-action">${lastAction}</section>

    <section class="layout">
      <div class="board">${board}</div>
      <aside class="panel">
        <div class="eyebrow">Histórico recente</div>
        <ol>${moveItems || "<li><strong>Sem jogadas</strong><span>estado inicial</span></li>"}</ol>
      </aside>
    </section>

    <div class="footer">match_id=${match.id}</div>
  </main>
</body>
</html>`;
}

async function screenshotSnapshot(page, snapshot, index, label) {
  const title = index === 0 ? "Estado inicial" : `Jogada ${String(index).padStart(3, "0")}`;
  const html = renderHtml(snapshot, title);
  const filename = `${String(index).padStart(3, "0")}-${safeFilenamePart(label)}.png`;
  const path = join(OUT_DIR, filename);
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const created = createMatch();
  const snapshots = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1200 } });

  try {
    let snapshot = fetchSnapshot(created.matchId, { bot_action: "initial" });
    const initialPath = await screenshotSnapshot(page, snapshot, 0, "initial");
    snapshot.screenshot_path = initialPath;
    snapshots.push(snapshot);
    console.log(`000 initial ${initialPath}`);

    for (let turn = 1; turn <= MAX_TURNS; turn += 1) {
      const result = submitNextMove(created.matchId);
      snapshot = fetchSnapshot(created.matchId, result);
      const last = latestMove(snapshot);
      const word = result.main_word ?? last?.main_word ?? result.bot_action ?? "move";
      const player = result.player_name ?? last?.player_name ?? "player";
      const screenshotPath = await screenshotSnapshot(page, snapshot, turn, `${player}-${word}`);
      snapshot.screenshot_path = screenshotPath;
      snapshots.push(snapshot);

      console.log(
        `${String(turn).padStart(3, "0")} ${player} ${result.bot_action ?? last?.move_type ?? "state"} ${
          word ?? ""
        } status=${snapshot.match.status} bag=${snapshot.match.bag_remaining} ${screenshotPath}`
      );

      if (snapshot.match.status !== "active" || snapshot.match.bag_remaining <= 0) {
        break;
      }
    }
  } finally {
    await browser.close();
  }

  const finalSnapshot = snapshots.at(-1);
  const summary = {
    created,
    outDir: OUT_DIR,
    maxTurns: MAX_TURNS,
    completed: finalSnapshot?.match?.status !== "active" || finalSnapshot?.match?.bag_remaining <= 0,
    officialMatchCompleted: finalSnapshot?.match?.status !== "active",
    stoppedForEvaluation: finalSnapshot?.match?.status === "active" && finalSnapshot?.match?.bag_remaining <= 0,
    stopReason:
      finalSnapshot?.match?.status !== "active"
        ? "match_finished"
        : finalSnapshot?.match?.bag_remaining <= 0
          ? "bag_empty"
          : "max_turns_reached",
    finalStatus:
      finalSnapshot?.match?.status === "active" && finalSnapshot?.match?.bag_remaining <= 0
        ? "simulation_stopped_bag_empty"
        : finalSnapshot?.match?.status,
    officialMatchStatus: finalSnapshot?.match?.status,
    finalTurn: finalSnapshot?.match?.turn_number,
    bagRemaining: finalSnapshot?.match?.bag_remaining,
    players: finalSnapshot?.players,
    moveCount: finalSnapshot?.moves?.length ?? 0,
    screenshots: snapshots.map((snapshot) => snapshot.screenshot_path).filter(Boolean),
  };

  const summaryPath = join(OUT_DIR, "summary.json");
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`summary ${summaryPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
