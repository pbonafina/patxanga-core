import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { GamePlayScreen } from "../components/GamePlayScreen";

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
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [localPlacements, setLocalPlacements] = useState<Record<string, string>>({});
  const [localDeclaredLetters, setLocalDeclaredLetters] = useState<Record<string, string>>({});
  const [localRackOrder, setLocalRackOrder] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const resolvedBootstrap = useMatchBootstrap(bootstrapData ?? undefined);
  const { isConfigured } = getSupabaseEnv();

  const isWaiting = resolvedBootstrap.status === "waiting";
  const isActive = resolvedBootstrap.status === "active";
  const isVoting = resolvedBootstrap.status === "voting";
  const isFinished = resolvedBootstrap.status === "finished";

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
            special_type?: string | null;
          };

          return typedTile.id === tileId;
        }) as
          | {
              id?: string;
              letter?: string;
              is_special?: boolean;
              special_type?: string | null;
            }
          | undefined;

        if (!tile?.id) {
          return null;
        }

        const isWildcard = (tile.special_type ?? "").toLowerCase() == "wildcard";
        const declaredLetter = isWildcard ? (localDeclaredLetters[cellKey] ?? null) : null;

        return {
          tile_id: tile.id,
          row: rowIndex + 1,
          col: colIndex + 1,
          declared_letter: declaredLetter,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
      });
  }, [localDeclaredLetters, localPlacements, resolvedBootstrap.playerContext]);


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

  useEffect(() => {
    const nextIds = (resolvedBootstrap.playerContext?.rack_state ?? [])
      .map((item) => {
        const typedTile = item as { id?: string };
        return typedTile.id ?? null;
      })
      .filter((id): id is string => Boolean(id));

    setLocalRackOrder(nextIds);
  }, [resolvedBootstrap.playerContext]);

  const orderedPlayerRackState = useMemo(() => {
    const rackState = (resolvedBootstrap.playerContext?.rack_state ?? []) as Array<{
      id?: string;
    }>;

    if (rackState.length === 0) {
      return [];
    }

    const byId = new Map(
      rackState
        .filter((tile) => tile.id)
        .map((tile) => [tile.id as string, tile])
    );

    const ordered = localRackOrder
      .map((tileId) => byId.get(tileId))
      .filter((tile): tile is { id?: string } => Boolean(tile));

    const missing = rackState.filter(
      (tile) => tile.id && !localRackOrder.includes(tile.id)
    );

    return [...ordered, ...missing];
  }, [localRackOrder, resolvedBootstrap.playerContext]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSubmitResult(null);
    setVoteResult(null);
    setPendingVoteError(null);
    setSelectedTileId(null);
    setLocalPlacements({});
    setLocalDeclaredLetters({});

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

      setSelectedTileId(null);
      setLocalPlacements({});
      setLocalDeclaredLetters({});
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
      setErrorMessage("move_id pendente de votacao nao disponivel.");
      return;
    }

    if (!pendingVoteRequestPlayer?.player_id) {
      setErrorMessage("player_id do solicitante de voto nao disponivel.");
      return;
    }

    setIsSubmittingVote(true);
    setErrorMessage(null);
    setVoteResult(null);

    try {
      const { getSupabaseBrowserClient } = await import("../lib/supabase/client");
      const client = getSupabaseBrowserClient();

      if (!client) {
        throw new Error("Supabase client indisponivel no frontend.");
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

  function handlePlaceTile(cellKey: string, typedCell: BoardCell) {
    if (typedCell?.tile?.letter) {
      return;
    }

    if (localPlacements[cellKey]) {
      setLocalPlacements((current) => {
        const next = { ...current };
        delete next[cellKey];
        return next;
      });

      setLocalDeclaredLetters((current) => {
        const next = { ...current };
        delete next[cellKey];
        return next;
      });

      return;
    }

    if (!selectedTileId) {
      return;
    }

    if (Object.values(localPlacements).includes(selectedTileId)) {
      return;
    }

    const rackTile = (resolvedBootstrap.playerContext?.rack_state ?? []).find((item) => {
      const typedTile = item as {
        id?: string;
        special_type?: string | null;
      };

      return typedTile.id === selectedTileId;
    }) as
      | {
          id?: string;
          special_type?: string | null;
        }
      | undefined;

    if (!rackTile?.id) {
      return;
    }

    const isWildcard = (rackTile.special_type ?? "").toLowerCase() === "wildcard";
    let declaredLetter: string | null = null;

    if (isWildcard) {
      const input = window.prompt("Qual letra esta peca especial deve representar?", "");
      const normalized = input?.trim().toUpperCase() ?? "";

      if (normalized.length !== 1) {
        return;
      }

      declaredLetter = normalized;
    }

    setLocalPlacements((current) => ({
      ...current,
      [cellKey]: selectedTileId,
    }));

    setLocalDeclaredLetters((current) => {
      const next = { ...current };

      if (declaredLetter) {
        next[cellKey] = declaredLetter;
      } else {
        delete next[cellKey];
      }

      return next;
    });

    setSelectedTileId(null);
  }

  function handleToggleTile(tileId: string) {
    setSelectedTileId((current) => (current === tileId ? null : tileId));
  }




  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <h1>Patxanga</h1>
      <p>Interface local da partida conectada ao backend da aplicação.</p>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Conexão</h2>
        <p><strong>Modo atual:</strong> {isConfigured ? "conectado ao backend real" : "modo local de fallback"}</p>
        <p>
          Nesta etapa, o segundo campo ainda usa temporariamente o <strong>user_id</strong> da sessão
          para localizar o jogador correto da partida.
        </p>
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Abrir partida</h2>

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
            {isLoading ? "Carregando..." : "Abrir partida"}
          </button>
        </form>

        {errorMessage ? (
          <p style={{ marginTop: 12, color: "#b00020" }}>
            <strong>Erro:</strong> {errorMessage}
          </p>
        ) : null}
      </section>

      <GamePlayScreen
        stateLabel={stateLabel}
        isWaiting={isWaiting}
        isActive={isActive}
        isVoting={isVoting}
        isFinished={isFinished}
        winnerPlayerId={resolvedBootstrap.winnerPlayerId}
        finishedAt={resolvedBootstrap.finishedAt}
        playersSummary={resolvedBootstrap.playersSummary}
        currentTurnPlayerId={resolvedBootstrap.currentTurnPlayerId}
        boardState={resolvedBootstrap.boardState}
        localPlacements={localPlacements}
        localDeclaredLetters={localDeclaredLetters}
        pendingVoteTilesByCell={pendingVoteTilesByCell}
        selectedTileId={selectedTileId}
        playerRackState={orderedPlayerRackState}
        placedTilesPreview={placedTilesPreview}
        canSubmitMove={placedTilesPreview.length > 0 && Boolean(resolvedBootstrap.playerId)}
        isSubmittingMove={isSubmittingMove}
        pendingVoteError={pendingVoteError}
        pendingVoteMove={pendingVoteMove}
        canCurrentViewerVote={canCurrentViewerVote}
        isSubmittingVote={isSubmittingVote}
        voteResult={voteResult}
        showDebug={showDebug}
        buildCellKey={buildCellKey}
        renderCellLabel={renderCellLabel}
        renderCellBackground={renderCellBackground}
        onPlaceTile={handlePlaceTile}
        onToggleTile={handleToggleTile}
        onClearPreview={() => {
          setLocalPlacements({});
          setLocalDeclaredLetters({});
          setSelectedTileId(null);
        }}
        onReorderTile={(draggedTileId, targetTileId) => {
          setLocalRackOrder((current) => {
            const draggedIndex = current.indexOf(draggedTileId);
            const targetIndex = current.indexOf(targetTileId);

            if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
              return current;
            }

            const next = [...current];
            const [dragged] = next.splice(draggedIndex, 1);
            next.splice(targetIndex, 0, dragged);
            return next;
          });
        }}
        onSubmitMove={handleSubmitMove}
        onApprove={() => handleSubmitVote(false)}
        onReject={() => handleSubmitVote(true)}
      />

      {showDebug ? (
        <>
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

      <PlayersSection
        playersSummary={resolvedBootstrap.playersSummary}
        currentTurnPlayerId={resolvedBootstrap.currentTurnPlayerId}
      />

      {(isActive || isVoting) ? (
      <BoardSection
        boardState={resolvedBootstrap.boardState}
        localPlacements={localPlacements}
        localDeclaredLetters={localDeclaredLetters}
        pendingVoteTilesByCell={pendingVoteTilesByCell}
        selectedTileId={selectedTileId}
        playerRackState={orderedPlayerRackState}
        buildCellKey={buildCellKey}
        renderCellLabel={renderCellLabel}
        renderCellBackground={renderCellBackground}
        onPlaceTile={handlePlaceTile}
      />
      ) : null}

      {isActive ? (
      <RackSection
        rackTiles={orderedPlayerRackState}
        selectedTileId={selectedTileId}
        showDebug={showDebug}
        onToggleTile={handleToggleTile}
        onClearPreview={() => {
          setLocalPlacements({});
          setLocalDeclaredLetters({});
          setSelectedTileId(null);
        }}
        onReorderTile={(draggedTileId, targetTileId) => {
          setLocalRackOrder((current) => {
            const draggedIndex = current.indexOf(draggedTileId);
            const targetIndex = current.indexOf(targetTileId);

            if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
              return current;
            }

            const next = [...current];
            const [dragged] = next.splice(draggedIndex, 1);
            next.splice(targetIndex, 0, dragged);
            return next;
          });
        }}
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

        </>
      ) : null}

      {isWaiting ? (
        <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
          <h2>Lobby / aguardando início</h2>
          <p>Esta partida ainda não começou.</p>
          <p>Assim que a partida entrar em modo ativo, o board e o rack jogável aparecerão aqui.</p>
        </section>
      ) : null}

      {isFinished ? (
        <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
          <h2>Partida encerrada</h2>
          <p>Esta partida já foi concluída.</p>
          <p><strong>Vencedor:</strong> {resolvedBootstrap.winnerPlayerId || "(não disponível)"}</p>
          <p><strong>Encerrada em:</strong> {resolvedBootstrap.finishedAt || "(não disponível)"}</p>
        </section>
      ) : null}

    </main>
  );
}
