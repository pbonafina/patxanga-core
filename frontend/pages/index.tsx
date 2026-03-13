import { FormEvent, useMemo, useState } from "react";
import { useMatchBootstrap } from "../hooks/useMatchBootstrap";
import { loadMatchBootstrap } from "../lib/backend/loadMatchBootstrap";
import { getSupabaseEnv } from "../lib/supabase/env";
import type { MatchBootstrap } from "../types/match";

type BoardCell = {
  tile?: {
    letter?: string;
  } | null;
  multiplier_type?: string | null;
} | null;

function renderCellLabel(cell: BoardCell): string {
  if (!cell) return "";
  if (cell.tile?.letter) return cell.tile.letter;
  return cell.multiplier_type ?? "";
}

function renderCellBackground(cell: BoardCell, rowIndex: number, colIndex: number): string {
  if (!cell) return "#ffffff";
  if (cell.tile?.letter) return "#f3f4f6";

  if (rowIndex === 7 && colIndex === 7) {
    return "#fff4cc";
  }

  switch (cell.multiplier_type) {
    case "PT":
      return "#ffd6d6";
    case "PD":
      return "#ffe9c7";
    case "LT":
      return "#d9ecff";
    case "LD":
      return "#e8ddff";
    default:
      return "#ffffff";
  }
}

export default function HomePage() {
  const [matchIdInput, setMatchIdInput] = useState("");
  const [playerIdInput, setPlayerIdInput] = useState("");
  const [bootstrapData, setBootstrapData] = useState<MatchBootstrap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resolvedBootstrap = useMatchBootstrap(bootstrapData ?? undefined);
  const { isConfigured } = getSupabaseEnv();

  const stateLabel = useMemo(() => {
    switch (resolvedBootstrap.status) {
      case "waiting":
        return "Lobby / waiting";
      case "active":
        return "Partida ativa";
      case "voting":
        return "Fluxo de votação";
      case "finished":
        return "Partida encerrada";
      default:
        return "Estado desconhecido";
    }
  }, [resolvedBootstrap.status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextData = await loadMatchBootstrap({
        matchId: matchIdInput,
        playerId: playerIdInput,
      });

      setBootstrapData(nextData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao carregar bootstrap da match."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <h1>Patxanga Frontend</h1>
      <p>Bootstrap da match com fallback mock e provider real preparado.</p>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Ambiente</h2>
        <p><strong>Modo atual:</strong> {isConfigured ? "provider real habilitado" : "fallback mock ativo"}</p>
        <p>
          No provider real, o campo abaixo ainda usa temporariamente <strong>user_id</strong> no input
          para resolver o bootstrap server-authoritative e receber de volta o <strong>player_id</strong> real.
        </p>
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Carregar match</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>match_id</span>
            <input
              value={matchIdInput}
              onChange={(event) => setMatchIdInput(event.target.value)}
              placeholder="ex: UUID da match"
              style={{ padding: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>user_id da sessao (temporario neste bootstrap real)</span>
            <input
              value={playerIdInput}
              onChange={(event) => setPlayerIdInput(event.target.value)}
              placeholder="ex: UUID do usuario"
              style={{ padding: 8 }}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: 220, padding: "10px 14px", cursor: "pointer" }}
          >
            {isLoading ? "Carregando..." : "Carregar bootstrap"}
          </button>
        </form>

        {errorMessage ? (
          <p style={{ marginTop: 12, color: "#b00020" }}>
            <strong>Erro:</strong> {errorMessage}
          </p>
        ) : null}
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Estado resolvido</h2>
        <p><strong>Status:</strong> {stateLabel}</p>
        <p><strong>match_id:</strong> {resolvedBootstrap.matchId || "(vazio)"}</p>
        <p><strong>player_id resolvido:</strong> {resolvedBootstrap.playerId || "(nulo)"}</p>
        <p><strong>current_turn_player_id:</strong> {resolvedBootstrap.currentTurnPlayerId || "(nulo)"}</p>
        <p><strong>winner_player_id:</strong> {resolvedBootstrap.winnerPlayerId || "(nulo)"}</p>
        <p><strong>started_at:</strong> {resolvedBootstrap.startedAt || "(nulo)"}</p>
        <p><strong>finished_at:</strong> {resolvedBootstrap.finishedAt || "(nulo)"}</p>
        <p><strong>turn_number:</strong> {resolvedBootstrap.turnNumber}</p>
        <p><strong>players_summary:</strong> {resolvedBootstrap.playersSummary.length}</p>
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Jogadores</h2>

        {resolvedBootstrap.playersSummary.length === 0 ? (
          <p>Nenhum jogador carregado.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {resolvedBootstrap.playersSummary.map((player) => {
              const isCurrentTurn = player.player_id === resolvedBootstrap.currentTurnPlayerId;

              return (
                <div
                  key={player.player_id}
                  style={{
                    padding: 12,
                    border: "1px solid #bbb",
                    borderRadius: 8,
                    background: isCurrentTurn ? "#eef6ff" : "#fff",
                  }}
                >
                  <p><strong>display_name:</strong> {player.display_name}</p>
                  <p><strong>player_id:</strong> {player.player_id}</p>
                  <p><strong>score:</strong> {player.score}</p>
                  <p><strong>seat_index:</strong> {player.seat_index}</p>
                  <p><strong>turn_order:</strong> {player.turn_order}</p>
                  <p><strong>has_forfeited:</strong> {player.has_forfeited ? "true" : "false"}</p>
                  <p><strong>turno atual:</strong> {isCurrentTurn ? "sim" : "nao"}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Board (read-only)</h2>

        {resolvedBootstrap.boardState.length === 0 ? (
          <p>Board ainda nao carregado.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(15, 38px)",
              gap: 2,
              alignItems: "center",
              justifyContent: "start",
            }}
          >
            {resolvedBootstrap.boardState.flatMap((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const typedCell = cell as BoardCell;
                const label = renderCellLabel(typedCell);
                const isCenter = rowIndex === 7 && colIndex === 7;

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    title={`(${rowIndex + 1}, ${colIndex + 1})`}
                    style={{
                      width: 38,
                      height: 38,
                      border: "1px solid #bbb",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      background: renderCellBackground(typedCell, rowIndex, colIndex),
                      overflow: "hidden",
                      textAlign: "center",
                      padding: 2,
                      boxShadow: isCenter ? "inset 0 0 0 2px #c99a00" : "none",
                    }}
                  >
                    <div>
                      <div>{label}</div>
                      <div style={{ fontSize: 8, fontWeight: 400 }}>{rowIndex + 1},{colIndex + 1}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Rack do jogador resolvido</h2>

        {!resolvedBootstrap.playerContext ? (
          <p>player_context ainda nao carregado.</p>
        ) : resolvedBootstrap.playerContext.rack_state.length === 0 ? (
          <p>Rack vazio.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {resolvedBootstrap.playerContext.rack_state.map((tile, index) => {
              const typedTile = tile as {
                id?: string;
                letter?: string;
                points?: number;
                is_special?: boolean;
                special_type?: string | null;
              };

              return (
                <div
                  key={typedTile.id ?? `tile-${index}`}
                  style={{
                    padding: 12,
                    border: "1px solid #bbb",
                    borderRadius: 8,
                    background: "#fafafa",
                  }}
                >
                  <p><strong>letter:</strong> <span style={{ fontSize: 20 }}>{typedTile.letter ?? "(nulo)"}</span></p>
                  <p><strong>points:</strong> {typedTile.points ?? 0}</p>
                  <p><strong>id:</strong> {typedTile.id ?? "(nulo)"}</p>
                  <p><strong>is_special:</strong> {typedTile.is_special ? "true" : "false"}</p>
                  <p><strong>special_type:</strong> {typedTile.special_type ?? "(nulo)"}</p>
                  <p><strong>tipo visual:</strong> {typedTile.is_special ? "peca especial" : "peca normal"}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
