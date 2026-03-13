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
  const multiplier = cell.multiplier_type ?? "";
  return multiplier === "NM" ? "" : multiplier;
}

function buildCellKey(rowIndex: number, colIndex: number): string {
  return `${rowIndex}-${colIndex}`;
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
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<unknown | null>(null);
  const [pendingVoteError, setPendingVoteError] = useState<string | null>(null);
  const [voteResult, setVoteResult] = useState<unknown | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [pendingVoteContext, setPendingVoteContext] = useState<unknown | null>(null);
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [localPlacements, setLocalPlacements] = useState<Record<string, string>>({});

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

  const placedTilesPreview = useMemo(() => {
    if (!resolvedBootstrap.playerContext) {
      return [];
    }

    return Object.entries(localPlacements)
      .map(([cellKey, tileId]) => {
        const [rowIndexText, colIndexText] = cellKey.split("-");
        const rowIndex = Number(rowIndexText);
        const colIndex = Number(colIndexText);

        const tile = resolvedBootstrap.playerContext?.rack_state.find((item) => {
          const typedTile = item as {
            id?: string;
            letter?: string;
            is_special?: boolean;
          };

          return typedTile.id === tileId;
        }) as
          | {
              id?: string;
              letter?: string;
              is_special?: boolean;
            }
          | undefined;

        if (!tile?.id) {
          return null;
        }

        return {
          tile_id: tile.id,
          row: rowIndex + 1,
          col: colIndex + 1,
          declared_letter: tile.is_special ? tile.letter ?? null : null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
      });
  }, [localPlacements, resolvedBootstrap.playerContext]);


  const pendingVoteMove = useMemo(() => {
    const context = pendingVoteContext as
      | {
          pending_move?: {
            move_id?: string;
            player_id?: string;
            board_diff?: Array<{
              row?: number;
              col?: number;
              letter?: string;
            }>;
            author_display_name?: string;
            main_word?: string;
          } | null;
        }
      | null;

    return context?.pending_move ?? null;
  }, [pendingVoteContext]);

  const pendingVoteRequestPlayer = useMemo(() => {
    const context = pendingVoteContext as
      | {
          request_player?: {
            player_id?: string;
            user_id?: string;
            display_name?: string;
          } | null;
        }
      | null;

    return context?.request_player ?? null;
  }, [pendingVoteContext]);

  const canCurrentViewerVote = useMemo(() => {
    if (!pendingVoteMove || !pendingVoteRequestPlayer?.player_id) {
      return false;
    }

    return pendingVoteMove.player_id !== pendingVoteRequestPlayer.player_id;
  }, [pendingVoteMove, pendingVoteRequestPlayer]);

  const pendingVoteTilesByCell = useMemo(() => {
    const result: Record<string, { letter?: string }> = {};

    const boardDiff = pendingVoteMove?.board_diff ?? [];
    for (const tile of boardDiff) {
      const row = typeof tile.row === "number" ? tile.row - 1 : -1;
      const col = typeof tile.col === "number" ? tile.col - 1 : -1;
      if (row >= 0 && col >= 0) {
        result[buildCellKey(row, col)] = { letter: tile.letter };
      }
    }

    return result;
  }, [pendingVoteMove]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSubmitResult(null);
    setVoteResult(null);
    setPendingVoteError(null);
    setSelectedTileIds([]);
    setLocalPlacements({});

    try {
      const nextData = await loadMatchBootstrap({
        matchId: matchIdInput,
        playerId: playerIdInput,
      });

      setBootstrapData(nextData);

      await refreshPendingVoteContext(nextData.matchId, playerIdInput, nextData.status);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao carregar bootstrap da match."
      );
    } finally {
      setIsLoading(false);
    }
  }


  async function handleSubmitMove() {
    if (!resolvedBootstrap.matchId) {
      setErrorMessage("match_id nao carregado.");
      return;
    }

    if (!resolvedBootstrap.playerId) {
      setErrorMessage("player_id resolvido nao disponivel.");
      return;
    }

    if (placedTilesPreview.length === 0) {
      setErrorMessage("Nenhuma peca posicionada para enviar.");
      return;
    }

    setIsSubmittingMove(true);
    setErrorMessage(null);
    setSubmitResult(null);

    try {
      const { getSupabaseBrowserClient } = await import("../lib/supabase/client");
      const client = getSupabaseBrowserClient();

      if (!client) {
        throw new Error("Supabase client not configured in frontend environment.");
      }

      const { data, error } = await client.rpc("submit_patxanga_move", {
        p_match_id: resolvedBootstrap.matchId,
        p_player_id: resolvedBootstrap.playerId,
        p_placed_tiles: placedTilesPreview,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSubmitResult(data ?? null);

      const refreshedData = await loadMatchBootstrap({
        matchId: resolvedBootstrap.matchId,
        playerId: playerIdInput,
      });

      setBootstrapData(refreshedData);

      await refreshPendingVoteContext(refreshedData.matchId, playerIdInput, refreshedData.status);

      setSelectedTileIds([]);
      setLocalPlacements({});
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao enviar jogada."
      );
    } finally {
      setIsSubmittingMove(false);
    }
  }


  async function refreshPendingVoteContext(matchId: string, userId: string, status: string) {
    if (status !== "voting") {
      setPendingVoteContext(null);
      setPendingVoteError(null);
      return;
    }

    const { getSupabaseBrowserClient } = await import("../lib/supabase/client");
    const client = getSupabaseBrowserClient();

    if (!client) {
      setPendingVoteContext(null);
      setPendingVoteError("Supabase client indisponivel para carregar pending_vote.");
      return;
    }

    const { data, error } = await client.rpc("get_patxanga_pending_vote_context", {
      p_match_id: matchId,
      p_user_id: userId,
    });

    if (error) {
      setPendingVoteContext(null);
      setPendingVoteError(error.message);
      return;
    }

    setPendingVoteContext(data ?? null);
    setPendingVoteError(null);
  }

  async function handleSubmitVote(voteReject: boolean) {
    if (!pendingVoteMove?.move_id) {
      setErrorMessage("move_id pendente nao disponivel.");
      return;
    }

    if (!pendingVoteRequestPlayer?.player_id) {
      setErrorMessage("player_id do votante nao disponivel.");
      return;
    }

    if (!canCurrentViewerVote) {
      setErrorMessage("Autor da jogada pendente nao pode votar.");
      return;
    }

    setIsSubmittingVote(true);
    setErrorMessage(null);
    setVoteResult(null);

    try {
      const { getSupabaseBrowserClient } = await import("../lib/supabase/client");
      const client = getSupabaseBrowserClient();

      if (!client) {
        throw new Error("Supabase client not configured in frontend environment.");
      }

      const { data, error } = await client.rpc("submit_patxanga_vote", {
        p_move_id: pendingVoteMove.move_id,
        p_voter_player_id: pendingVoteRequestPlayer.player_id,
        p_vote_reject: voteReject,
      });

      if (error) {
        throw new Error(error.message);
      }

      setVoteResult(data ?? null);

      const refreshedData = await loadMatchBootstrap({
        matchId: matchIdInput,
        playerId: playerIdInput,
      });

      setBootstrapData(refreshedData);
      await refreshPendingVoteContext(
        refreshedData.matchId,
        playerIdInput,
        refreshedData.status
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao enviar voto."
      );
    } finally {
      setIsSubmittingVote(false);
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


      {resolvedBootstrap.status === "voting" && pendingVoteError ? (
        <section style={{ marginTop: 24, padding: 16, border: "1px solid #b00020", borderRadius: 8, background: "#fff5f5" }}>
          <h2>Erro ao carregar contexto de votação</h2>
          <p>{pendingVoteError}</p>
        </section>
      ) : null}

      {resolvedBootstrap.status === "voting" && pendingVoteMove ? (
        <section style={{ marginTop: 24, padding: 16, border: "1px solid #d97706", borderRadius: 8, background: "#fffbeb" }}>
          <h2>Jogada em avaliação</h2>
          <p><strong>Autor:</strong> {pendingVoteMove.author_display_name ?? "(desconhecido)"}</p>
          <p><strong>Palavra principal:</strong> {pendingVoteMove.main_word ?? "(nula)"}</p>
          <p><strong>Pode votar nesta tela:</strong> {canCurrentViewerVote ? "sim" : "nao"}</p>
          <p>O board oficial permanece intacto; o tabuleiro abaixo mostra overlay visual da jogada pendente.</p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
            <button
              type="button"
              onClick={() => handleSubmitVote(false)}
              disabled={!canCurrentViewerVote || isSubmittingVote}
              style={{ padding: "10px 14px", cursor: "pointer" }}
            >
              {isSubmittingVote ? "Enviando..." : "Aprovar jogada"}
            </button>

            <button
              type="button"
              onClick={() => handleSubmitVote(true)}
              disabled={!canCurrentViewerVote || isSubmittingVote}
              style={{ padding: "10px 14px", cursor: "pointer" }}
            >
              {isSubmittingVote ? "Enviando..." : "Rejeitar jogada"}
            </button>
          </div>

          {voteResult ? (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 8 }}>Retorno bruto da votação</h3>
              <pre
                style={{
                  background: "#f7f7f7",
                  padding: 12,
                  borderRadius: 8,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
{JSON.stringify(voteResult, null, 2)}
              </pre>
            </div>
          ) : null}
        </section>
      ) : null}

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
                const cellKey = buildCellKey(rowIndex, colIndex);
                const label = renderCellLabel(typedCell);
                const isCenter = rowIndex === 7 && colIndex === 7;
                const localTileId = localPlacements[cellKey];

                const rackTiles = (resolvedBootstrap.playerContext?.rack_state ?? []) as Array<{
                  id?: string;
                  letter?: string;
                }>;

                const localTile = rackTiles.find((tile) => tile.id === localTileId);
                const pendingVoteTile = pendingVoteTilesByCell[cellKey];
                const hasLocalPreview = Boolean(localTile?.letter);
                const hasPendingVoteOverlay = Boolean(pendingVoteTile?.letter);
                const displayLabel = hasLocalPreview
                  ? (localTile?.letter ?? "")
                  : hasPendingVoteOverlay
                    ? (pendingVoteTile?.letter ?? "")
                    : label;

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    title={`(${rowIndex + 1}, ${colIndex + 1})`}
                    onClick={() => {
                      if (typedCell?.tile?.letter) {
                        return;
                      }

                      const nextTileId = selectedTileIds.find((tileId) =>
                        !Object.values(localPlacements).includes(tileId)
                      );

                      if (!nextTileId) {
                        return;
                      }

                      setLocalPlacements((current) => ({
                        ...current,
                        [cellKey]: nextTileId,
                      }));
                    }}
                    style={{
                      width: 38,
                      height: 38,
                      border: hasLocalPreview ? "2px solid #16a34a" : hasPendingVoteOverlay ? "2px dashed #b45309" : "1px solid #bbb",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      background: hasLocalPreview ? "#dcfce7" : renderCellBackground(typedCell, rowIndex, colIndex),
                      overflow: "hidden",
                      textAlign: "center",
                      padding: 2,
                      boxShadow: isCenter ? "inset 0 0 0 2px #c99a00" : "none",
                    }}
                  >
                    <div>
                      <div>{displayLabel}</div>
                      
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
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              {resolvedBootstrap.playerContext.rack_state.map((tile, index) => {
                const typedTile = tile as {
                  id?: string;
                  letter?: string;
                  points?: number;
                  is_special?: boolean;
                  special_type?: string | null;
                };

                const tileId = typedTile.id ?? `tile-${index}`;
                const isSelected = selectedTileIds.includes(tileId);

                return (
                  <button
                    key={tileId}
                    type="button"
                    onClick={() => {
                      setSelectedTileIds((current) =>
                        current.includes(tileId)
                          ? current.filter((id) => id !== tileId)
                          : [...current, tileId]
                      );
                    }}
                    style={{
                      padding: 12,
                      border: isSelected ? "2px solid #2563eb" : "1px solid #bbb",
                      borderRadius: 8,
                      background: isSelected ? "#eef6ff" : "#fafafa",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <p><strong>letter:</strong> <span style={{ fontSize: 20 }}>{typedTile.letter ?? "(nulo)"}</span></p>
                    <p><strong>points:</strong> {typedTile.points ?? 0}</p>
                    <p><strong>id:</strong> {typedTile.id ?? "(nulo)"}</p>
                    <p><strong>is_special:</strong> {typedTile.is_special ? "true" : "false"}</p>
                    <p><strong>special_type:</strong> {typedTile.special_type ?? "(nulo)"}</p>
                    <p><strong>tipo visual:</strong> {typedTile.is_special ? "peca especial" : "peca normal"}</p>
                    <p><strong>selecionada:</strong> {isSelected ? "sim" : "nao"}</p>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 16, padding: 12, border: "1px dashed #bbb", borderRadius: 8 }}>
              <h3 style={{ marginTop: 0 }}>Preview local de selecao</h3>
              {selectedTileIds.length === 0 ? (
                <p>Nenhuma peça selecionada.</p>
              ) : (
                <ul>
                  {selectedTileIds.map((tileId) => (
                    <li key={tileId}>{tileId}</li>
                  ))}
                </ul>
              )}
              <p>Este estado ainda é apenas local e não envia jogada ao backend.</p>
              <button
                type="button"
                onClick={() => setLocalPlacements({})}
                style={{ padding: "8px 12px", cursor: "pointer" }}
              >
                Limpar preview local no board
              </button>
            </div>
          </>
        )}
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Preview de p_placed_tiles</h2>

        {placedTilesPreview.length === 0 ? (
          <p>Nenhuma peça posicionada localmente no board.</p>
        ) : (
          <>
            <p>Payload local compatível com o contrato de submit de jogada:</p>
            <pre
              style={{
                background: "#f7f7f7",
                padding: 12,
                borderRadius: 8,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
{JSON.stringify(placedTilesPreview, null, 2)}
            </pre>
          </>
        )}
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Submit real de jogada</h2>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleSubmitMove}
            disabled={isSubmittingMove || placedTilesPreview.length === 0 || !resolvedBootstrap.playerId}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            {isSubmittingMove ? "Enviando..." : "Enviar jogada"}
          </button>

          <span>
            Usa <strong>match_id</strong> e <strong>player_id</strong> resolvido do bootstrap oficial.
          </span>
        </div>

        {submitResult ? (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Retorno bruto da RPC</h3>
            <pre
              style={{
                background: "#f7f7f7",
                padding: 12,
                borderRadius: 8,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
{JSON.stringify(submitResult, null, 2)}
            </pre>
          </div>
        ) : null}
      </section>

    </main>
  );
}
