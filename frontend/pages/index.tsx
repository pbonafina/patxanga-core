import { FormEvent, useMemo, useState } from "react";
import { useMatchBootstrap } from "../hooks/useMatchBootstrap";
import { loadMatchBootstrap } from "../lib/backend/loadMatchBootstrap";
import { getSupabaseEnv } from "../lib/supabase/env";
import type { MatchBootstrap } from "../types/match";
import { VotingSection } from "../components/VotingSection";
import { BoardSection } from "../components/BoardSection";
import { RackSection } from "../components/RackSection";
import { PlayersSection } from "../components/PlayersSection";
import { MatchStatusPanel } from "../components/MatchStatusPanel";
import { MoveSubmitSection } from "../components/MoveSubmitSection";

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
  const [showDebug, setShowDebug] = useState(false);

  const resolvedBootstrap = useMatchBootstrap(bootstrapData ?? undefined);
  const { isConfigured } = getSupabaseEnv();

  const isWaiting = resolvedBootstrap.status === "waiting";
  const isActive = resolvedBootstrap.status === "active";
  const isVoting = resolvedBootstrap.status === "voting";

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

  function handlePlaceTile(cellKey: string, typedCell: BoardCell) {
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
  }

  function handleToggleTile(tileId: string) {
    setSelectedTileIds((current) =>
      current.includes(tileId)
        ? current.filter((id) => id !== tileId)
        : [...current, tileId]
    );
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

      <MatchStatusPanel
        stateLabel={stateLabel}
        matchId={resolvedBootstrap.matchId}
        playersCount={resolvedBootstrap.playersSummary.length}
        showDebug={showDebug}
        playerId={resolvedBootstrap.playerId}
        currentTurnPlayerId={resolvedBootstrap.currentTurnPlayerId}
        winnerPlayerId={resolvedBootstrap.winnerPlayerId}
        startedAt={resolvedBootstrap.startedAt}
        finishedAt={resolvedBootstrap.finishedAt}
        turnNumber={resolvedBootstrap.turnNumber}
        onToggleDebug={() => setShowDebug((current) => !current)}
      />


      <VotingSection
        isVoting={isVoting}
        pendingVoteError={pendingVoteError}
        pendingVoteMove={pendingVoteMove}
        canCurrentViewerVote={canCurrentViewerVote}
        isSubmittingVote={isSubmittingVote}
        voteResult={voteResult}
        showDebug={showDebug}
        onApprove={() => handleSubmitVote(false)}
        onReject={() => handleSubmitVote(true)}
      />

      <PlayersSection
        playersSummary={resolvedBootstrap.playersSummary}
        currentTurnPlayerId={resolvedBootstrap.currentTurnPlayerId}
      />

      {(isActive || isVoting) ? (
      <BoardSection
        boardState={resolvedBootstrap.boardState}
        localPlacements={localPlacements}
        pendingVoteTilesByCell={pendingVoteTilesByCell}
        selectedTileIds={selectedTileIds}
        playerRackState={resolvedBootstrap.playerContext?.rack_state ?? []}
        buildCellKey={buildCellKey}
        renderCellLabel={renderCellLabel}
        renderCellBackground={renderCellBackground}
        onPlaceTile={handlePlaceTile}
      />
      ) : null}

      {isActive ? (
      <RackSection
        playerContext={resolvedBootstrap.playerContext}
        selectedTileIds={selectedTileIds}
        showDebug={showDebug}
        onToggleTile={handleToggleTile}
        onClearPreview={() => setLocalPlacements({})}
      />
      ) : null}

      {isActive ? (
      <MoveSubmitSection
        showDebug={showDebug}
        placedTilesPreview={placedTilesPreview}
        isSubmittingMove={isSubmittingMove}
        canSubmitMove={placedTilesPreview.length > 0 && Boolean(resolvedBootstrap.playerId)}
        submitResult={submitResult}
        onSubmitMove={handleSubmitMove}
      />
      ) : null}

      {isWaiting ? (
        <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
          <h2>Lobby / aguardando inicio</h2>
          <p>A partida ainda nao entrou em modo ativo.</p>
          <p>Quando a match estiver pronta e iniciada, o board e o rack jogavel aparecerao aqui.</p>
        </section>
      ) : null}

    </main>
  );
}
