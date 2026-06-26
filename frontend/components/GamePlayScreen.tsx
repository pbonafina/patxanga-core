import { BoardSection } from "./BoardSection";
import { RackSection } from "./RackSection";
import { VotingSection } from "./VotingSection";
import type { MatchDictionarySummary, MatchEndSummary } from "../types/match";
import type { MovePreviewResult } from "../types/movePreview";

type PendingVoteMove = {
  move_id?: string;
  player_id?: string;
  author_display_name?: string;
  main_word?: string;
};

type BoardCell = {
  tile?: {
    letter?: string;
  } | null;
  multiplier_type?: string | null;
} | null;

type PreparedTilePreview = {
  row?: number;
  col?: number;
  declared_letter?: string | null;
};

type BotActionHistoryItem = {
  id: string;
  turnNumber: number;
  playerName: string;
  message: string;
  tone: "pending" | "success" | "error";
};

type TurnActionSummary = {
  actionLabel: string;
  beforeTurnNumber: number;
  afterTurnNumber: number;
  beforeRackCount: number;
  afterRackCount: number;
  beforeScore: number;
  afterScore: number;
  nextPlayerName: string;
};

type MatchTimelineItem = {
  id: string;
  turnNumber: number;
  actorName: string;
  label: string;
  detail: string;
  tone: "info" | "success" | "warning" | "error";
};

export type GamePlayScreenProps = {
  stateLabel: string;
  matchLanguage: string;
  isWaiting: boolean;
  isActive: boolean;
  isVoting: boolean;
  isFinished: boolean;
  endSummary: MatchEndSummary | null;
  winnerPlayerId: string | null;
  finishedAt: string | null;
  dictionarySummary: MatchDictionarySummary | null;
  viewerPlayerId: string | null;
  playersSummary: Array<{
    player_id: string;
    display_name: string;
    score: number;
    has_forfeited: boolean;
    is_bot?: boolean;
    bot_level?: string | null;
    bot_profile?: string | null;
  }>;
  currentTurnPlayerId: string | null;
  turnNumber: number;

  boardState: unknown[];
  compositionPlacementsByCell: Record<
    string,
    {
      tileId: string;
      declaredLetter?: string | null;
      source: "board" | "slot";
      slotId?: string;
    }
  >;
  pendingVoteTilesByCell: Record<string, { letter?: string }>;
  selectedTileId: string | null;
  selectedTileIds: string[];
  selectedRackSlotId: string | null;
  previewTileIds: string[];
  playerRackState: unknown[];
  rackSlotAssociations: Record<string, string>;
  rackSlotAssociationLabels: Record<string, string>;

  placedTilesPreview: unknown[];
  localComposedWord: string | null;
  moveCompositionWarning: string | null;
  canSubmitMove: boolean;
  isSubmittingMove: boolean;
  movePreview: MovePreviewResult | null;
  isLoadingMovePreview: boolean;

  pendingVoteError: string | null;
  pendingVoteMove: PendingVoteMove | null;
  canCurrentViewerVote: boolean;
  isSubmittingVote: boolean;
  voteResult: unknown | null;
  voteResolutionMessage: string | null;
  showDebug: boolean;
  botActionMessage: string | null;
  botActionError: string | null;
  botActionHistory: BotActionHistoryItem[];
  lastTurnActionSummary: TurnActionSummary | null;
  matchTimeline: MatchTimelineItem[];
  isAutoPlayingBotTurn: boolean;
  canStartWaitingMatch?: boolean;
  isStartingWaitingMatch?: boolean;

  buildCellKey: (rowIndex: number, colIndex: number) => string;
  renderCellLabel: (cell: BoardCell) => string;
  renderCellBackground: (
    cell: BoardCell,
    rowIndex: number,
    colIndex: number
  ) => string;

  onPlaceTile: (cellKey: string, typedCell: BoardCell) => void;
  onToggleTile: (tileId: string) => void;
  onToggleRackSlot: (slotId: string) => void;
  onClearRackSlotAssignment: (slotId: string) => void;
  onClearRackSlotAssociation: (slotId: string) => void;
  onClearPreview: () => void;
  onReorderTile: (draggedItemId: string, dropTargetId: string) => void;
  onChangeRackSlotDraft: (slotId: string, nextValue: string) => void;
  onSubmitMove: () => void;
  onApprove: () => void;
  onReject: () => void;
  onToggleDebug: () => void;
  onStartWaitingMatch?: () => void;
};

function getSlotShortLabel(slotId: string): string {
  const suffix = slotId.split(":").pop() ?? slotId;
  return `S${suffix}`;
}

function isRackSlotItem(item: unknown): item is { kind: "slot"; slotId: string } {
  return Boolean(
    item &&
      typeof item === "object" &&
      (item as { kind?: unknown }).kind === "slot" &&
      typeof (item as { slotId?: unknown }).slotId === "string"
  );
}

function formatFinishedAt(value: string | null): string {
  if (!value) return "(não disponível)";
  return value;
}

function formatPlayerCount(value: number): string {
  return `${value} jogador${value === 1 ? "" : "es"}`;
}

function formatDictionaryWordCount(value: number): string {
  return `${value} palavra${value === 1 ? "" : "s"}`;
}

function formatEndReason(summary: MatchEndSummary | null): string {
  switch (summary?.reason) {
    case "empty_rack":
      return "Fim por rack vazio";
    case "all_passed":
      return "Fim por todos passarem";
    case "cancelled":
      return "Partida cancelada";
    case "finished":
      return "Partida finalizada";
    default:
      return "Motivo nao informado";
  }
}

function formatPreparedTileCoordinates(tiles: unknown[]): string {
  const coordinates = tiles
    .map((tile) => tile as PreparedTilePreview)
    .filter((tile) => typeof tile.row === "number" && typeof tile.col === "number")
    .map((tile) => `${tile.row},${tile.col}`);

  return coordinates.length > 0 ? coordinates.join(" · ") : "sem casas associadas";
}

export function GamePlayScreen({
  stateLabel,
  matchLanguage,
  isWaiting,
  isActive,
  isVoting,
  isFinished,
  endSummary,
  winnerPlayerId,
  finishedAt,
  dictionarySummary,
  viewerPlayerId,
  playersSummary,
  currentTurnPlayerId,
  turnNumber,

  boardState,
  compositionPlacementsByCell,
  pendingVoteTilesByCell,
  selectedTileId,
  selectedTileIds,
  selectedRackSlotId,
  previewTileIds,
  playerRackState,
  rackSlotAssociations,
  rackSlotAssociationLabels,

  placedTilesPreview,
  localComposedWord,
  moveCompositionWarning,
  canSubmitMove,
  isSubmittingMove,
  movePreview,
  isLoadingMovePreview,

  pendingVoteError,
  pendingVoteMove,
  canCurrentViewerVote,
  isSubmittingVote,
  voteResult,
  voteResolutionMessage,
  showDebug,
  botActionMessage,
  botActionError,
  botActionHistory,
  lastTurnActionSummary,
  matchTimeline,
  isAutoPlayingBotTurn,
  canStartWaitingMatch = false,
  isStartingWaitingMatch = false,

  buildCellKey,
  renderCellLabel,
  renderCellBackground,

  onPlaceTile,
  onToggleTile,
  onToggleRackSlot,
  onClearRackSlotAssignment,
  onClearRackSlotAssociation,
  onClearPreview,
  onReorderTile,
  onChangeRackSlotDraft,
  onSubmitMove,
  onApprove,
  onReject,
  onToggleDebug,
  onStartWaitingMatch,
}: GamePlayScreenProps) {
  const gameplayEnabled = isActive || isVoting;
  const hasBotPlayer = playersSummary.some((player) => player.is_bot);

  const currentTurnPlayer =
    playersSummary.find((player) => player.player_id === currentTurnPlayerId) ?? null;
  const currentTurnPlayerName = currentTurnPlayer?.display_name ?? "aguardando definição";
  const viewerPlayer =
    playersSummary.find((player) => player.player_id === viewerPlayerId) ?? null;
  const scoreLeader = [...playersSummary].sort((left, right) => right.score - left.score)[0] ?? null;
  const finalStandings = [...playersSummary].sort((left, right) => right.score - left.score);
  const winnerPlayer =
    playersSummary.find((player) => player.player_id === winnerPlayerId) ?? null;
  const forfeitedPlayers = playersSummary.filter((player) => player.has_forfeited);
  const dictionaryLanguage = dictionarySummary?.language ?? matchLanguage;
  const dictionaryWordCount = dictionarySummary
    ? formatDictionaryWordCount(dictionarySummary.active_words_count)
    : null;
  const dictionarySources =
    dictionarySummary?.sample_sources.filter(Boolean).slice(0, 3) ?? [];
  const endReasonLabel = formatEndReason(endSummary);

  const totalPlayers = playersSummary.length;
  const placedTileCount = placedTilesPreview.length;
  const associatedSlotCount = Object.keys(rackSlotAssociations).length;
  const rackSlotCount = playerRackState.filter(isRackSlotItem).length;
  const hasRackSlots = rackSlotCount > 0;
  const preparedTileCoordinates = formatPreparedTileCoordinates(placedTilesPreview);
  const isPlayersTurn =
    Boolean(viewerPlayerId) &&
    Boolean(currentTurnPlayerId) &&
    viewerPlayerId === currentTurnPlayerId &&
    isActive;
  const selectedGroupCount = selectedTileIds.length;
  const actionHint = isActive
    ? isPlayersTurn
      ? placedTileCount > 0
        ? "Revise a palavra e confirme a jogada."
        : "Monte uma palavra usando o rack e o tabuleiro."
      : currentTurnPlayer?.is_bot
        ? "O bot joga automaticamente quando chegar a vez dele."
        : "Aguarde o outro jogador."
    : isVoting
      ? canCurrentViewerVote
        ? "Vote para aceitar ou rejeitar a palavra proposta."
        : "A mesa aguarda os votos dos demais jogadores."
      : isFinished
        ? "Veja o resultado final da partida."
        : canStartWaitingMatch
          ? "Inicie a partida quando todos estiverem prontos."
          : "Aguarde o host iniciar a partida.";

  const statusTone = isActive
    ? isPlayersTurn
      ? { label: "Sua vez de jogar", color: "#166534", background: "#dcfce7", border: "#86efac" }
      : { label: "Aguardando o outro jogador", color: "#374151", background: "#f3f4f6", border: "#d1d5db" }
    : isVoting
      ? { label: "A mesa está em votação", color: "#92400e", background: "#fef3c7", border: "#fcd34d" }
      : isFinished
        ? { label: "Partida encerrada", color: "#991b1b", background: "#fee2e2", border: "#fca5a5" }
        : { label: "Aguardando início", color: "#374151", background: "#f3f4f6", border: "#d1d5db" };

  return (
    <section
      style={{
        marginTop: 24,
        padding: 22,
        border: "1px solid #d7d0bf",
        borderRadius: 24,
        background:
          "radial-gradient(circle at top left, rgba(250, 204, 21, 0.16), transparent 32%), linear-gradient(135deg, #fffaf0 0%, #f5efe3 46%, #edf4ec 100%)",
        boxShadow: "0 18px 46px rgba(61, 46, 24, 0.14)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: "#6b5f3f",
            }}
          >
            Mesa Patxanga
          </div>
          <div style={{ marginTop: 4, fontSize: 28, fontWeight: 900, color: "#1f2933" }}>
            Partida em foco
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleDebug}
          style={{
            padding: "9px 13px",
            borderRadius: 999,
            border: "1px solid #c7bfae",
            background: showDebug ? "#1f2937" : "rgba(255, 255, 255, 0.72)",
            color: showDebug ? "#ffffff" : "#374151",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {showDebug ? "Ocultar debug" : "Mostrar debug"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            flex: "1 1 320px",
            minWidth: 280,
            padding: 16,
            borderRadius: 18,
            border: `1px solid ${statusTone.border}`,
            background: statusTone.background,
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: statusTone.color }}>
            {stateLabel}
          </div>
          <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: "#111827" }}>
            {statusTone.label}
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: "#374151" }}>
            Turno atual: <strong>{currentTurnPlayerName}</strong>
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: "#374151" }}>
            Próxima ação: <strong>{actionHint}</strong>
          </div>
        </div>

        <div
          style={{
            flex: "1 1 360px",
            minWidth: 300,
            padding: 16,
            borderRadius: 18,
            border: "1px solid rgba(120, 113, 108, 0.22)",
            background: "rgba(255, 255, 255, 0.78)",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#6b7280" }}>
            Placar e mesa
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "#f3f4f6",
                fontSize: 13,
                color: "#111827",
              }}
            >
              {totalPlayers} jogador{totalPlayers === 1 ? "" : "es"}
            </span>

            <span
              data-testid="dictionary-language-badge"
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "#ecfdf5",
                fontSize: 13,
                color: "#166534",
                fontWeight: 800,
              }}
            >
              dicionário {dictionaryLanguage} ativo
              {dictionaryWordCount ? ` · ${dictionaryWordCount}` : ""}
            </span>

            <span
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: placedTileCount > 0 ? "#dbeafe" : "#f3f4f6",
                fontSize: 13,
                color: "#111827",
              }}
            >
              {placedTileCount} peça{placedTileCount === 1 ? "" : "s"} em preparo
            </span>

            {selectedGroupCount > 0 ? (
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#dbeafe",
                  fontSize: 13,
                  color: "#1d4ed8",
                }}
              >
                grupo com {selectedGroupCount} peça{selectedGroupCount === 1 ? "" : "s"}
              </span>
            ) : null}

            {selectedRackSlotId ? (
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#dbeafe",
                  fontSize: 13,
                  color: "#1d4ed8",
                }}
              >
                {getSlotShortLabel(selectedRackSlotId)} em associacao local
              </span>
            ) : null}

            {isVoting ? (
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#fef3c7",
                  fontSize: 13,
                  color: "#92400e",
                }}
              >
              votação pendente
              </span>
            ) : null}

            <span
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "#fff7ed",
                fontSize: 13,
                color: "#9a3412",
              }}
            >
              turno {turnNumber}
            </span>
          </div>

          {dictionarySources.length > 0 ? (
            <div
              data-testid="dictionary-sources-summary"
              style={{ marginTop: 10, fontSize: 13, color: "#166534", fontWeight: 700 }}
            >
              Fontes do dicionário: {dictionarySources.join(", ")}
            </div>
          ) : null}

          <div
            data-testid="dictionary-operational-card"
            style={{
              marginTop: 10,
              padding: "9px 11px",
              borderRadius: 12,
              border: "1px solid #bbf7d0",
              background: "#f0fdf4",
              color: "#14532d",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Léxico operacional: {dictionaryLanguage}
            {dictionaryWordCount ? ` · ${dictionaryWordCount}` : ""}
            {" · sem fallback automático entre idiomas"}
          </div>

          <div
            data-testid="dictionary-import-commands"
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #fed7aa",
              background: "#fff7ed",
              color: "#9a3412",
              fontSize: 12,
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.6 }}>
              Importação operacional limitada
            </div>
            <div style={{ marginTop: 6 }}>
              Fonte: amostras Hunspell LibreOffice, licença documentada no repositório, hash
              validado pelos scripts de importação.
            </div>
            <code style={{ display: "block", marginTop: 6 }}>
              zsh scripts/import-libreoffice-pt-br-sample.sh --limit 100 --execute
            </code>
            <code style={{ display: "block", marginTop: 3 }}>
              zsh scripts/import-libreoffice-pt-pt-sample.sh --limit 100 --execute
            </code>
          </div>

          {placedTileCount > 0 || associatedSlotCount > 0 ? (
            <div
              data-testid="move-composition-summary"
              style={{
                marginTop: 10,
                padding: "9px 11px",
                borderRadius: 12,
                border: "1px solid #bfdbfe",
                background: "#eff6ff",
                color: "#1e3a8a",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Composição: {placedTileCount} peça{placedTileCount === 1 ? "" : "s"} pronta{placedTileCount === 1 ? "" : "s"}
              {associatedSlotCount > 0
                ? ` · ${associatedSlotCount} slot${associatedSlotCount === 1 ? "" : "s"} no board`
                : ""}
              {" · "}
              casas {preparedTileCoordinates}
            </div>
          ) : null}

          {playersSummary.length > 0 ? (
            <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
              {playersSummary.map((player) => (
                <div
                  key={player.player_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 14,
                    border:
                      player.player_id === currentTurnPlayerId
                        ? "1px solid #93c5fd"
                        : "1px solid #e5e7eb",
                    background:
                      player.player_id === currentTurnPlayerId
                        ? "#eff6ff"
                        : "rgba(255, 255, 255, 0.84)",
                    fontSize: 13,
                    color: "#374151",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: "#111827" }}>
                      {player.display_name}
                      {player.player_id === viewerPlayer?.player_id ? " · você" : ""}
                    </div>
                    <div style={{ marginTop: 3, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span>
                        {player.is_bot
                          ? `bot ${player.bot_level ?? "sem nivel"} / ${player.bot_profile ?? "sem perfil"}`
                          : "humano"}
                      </span>
                      {player.player_id === currentTurnPlayerId ? <strong>no turno</strong> : null}
                      {player.has_forfeited ? <strong>desistente</strong> : null}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#111827" }}>
                      {player.score}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>pontos</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {scoreLeader ? (
            <div style={{ marginTop: 10, fontSize: 13, color: "#4b5563" }}>
              Líder atual: <strong>{scoreLeader.display_name}</strong> com{" "}
              <strong>{scoreLeader.score}</strong> ponto{scoreLeader.score === 1 ? "" : "s"}.
            </div>
          ) : null}
        </div>
      </div>

      {lastTurnActionSummary ? (
        <div
          data-testid="turn-action-summary-card"
          style={{
            marginBottom: 18,
            padding: 14,
            borderRadius: 16,
            border: "1px solid #bfdbfe",
            background: "#eff6ff",
            color: "#1e3a8a",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.8, textTransform: "uppercase" }}>
            Última ação oficial
          </div>
          <div style={{ marginTop: 8, fontSize: 15, fontWeight: 900 }}>
            {lastTurnActionSummary.actionLabel}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", fontSize: 13, fontWeight: 800 }}>
            <span>turno {lastTurnActionSummary.beforeTurnNumber} → {lastTurnActionSummary.afterTurnNumber}</span>
            <span>rack {lastTurnActionSummary.beforeRackCount} → {lastTurnActionSummary.afterRackCount}</span>
            <span>placar {lastTurnActionSummary.beforeScore} → {lastTurnActionSummary.afterScore}</span>
            <span>próximo: {lastTurnActionSummary.nextPlayerName}</span>
          </div>
        </div>
      ) : null}

      {hasBotPlayer ? (
        <div
          data-testid="bot-product-state"
          style={{
            marginBottom: 18,
            padding: 14,
            borderRadius: 16,
            border: "1px solid #d1fae5",
            background: "#f8fffb",
            color: "#14532d",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.8, textTransform: "uppercase" }}>
            Estado humano x bot
          </div>
          <div style={{ marginTop: 8, fontSize: 14, fontWeight: 800 }}>
            {isAutoPlayingBotTurn
              ? "Bot pensando e executando via RPC oficial."
              : botActionHistory.length > 0
                ? `Bot com ${botActionHistory.length} ação${botActionHistory.length === 1 ? "" : "ões"} recente${botActionHistory.length === 1 ? "" : "s"} nesta sessão.`
                : "Bot pronto para agir automaticamente quando o turno chegar."}
          </div>
        </div>
      ) : null}

      {matchTimeline.length > 0 ? (
        <div
          data-testid="match-action-timeline"
          style={{
            marginBottom: 18,
            padding: 14,
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#1f2937",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.8, textTransform: "uppercase" }}>
            Timeline recente da partida
          </div>
          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            {matchTimeline.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "8px 10px",
                  borderRadius: 12,
                  border:
                    item.tone === "error"
                      ? "1px solid #fecaca"
                      : item.tone === "warning"
                        ? "1px solid #fde68a"
                        : item.tone === "success"
                          ? "1px solid #bbf7d0"
                          : "1px solid #dbeafe",
                  background:
                    item.tone === "error"
                      ? "#fff1f2"
                      : item.tone === "warning"
                        ? "#fffbeb"
                        : item.tone === "success"
                          ? "#ecfdf5"
                          : "#eff6ff",
                  fontSize: 13,
                }}
              >
                <strong>Turno {item.turnNumber} · {item.actorName} · {item.label}</strong>
                <div style={{ marginTop: 3 }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {botActionMessage || botActionError || isAutoPlayingBotTurn ? (
        <div
          data-testid="game-bot-action-message"
          style={{
            marginBottom: 18,
            padding: 14,
            borderRadius: 16,
            border: botActionError ? "1px solid #fca5a5" : "1px solid #bbf7d0",
            background: botActionError ? "#fff1f2" : "#f0fdf4",
            color: botActionError ? "#991b1b" : "#166534",
            fontWeight: 700,
          }}
        >
          {botActionError
            ? `Erro do bot: ${botActionError}`
            : isAutoPlayingBotTurn
              ? "Bot executando turno automático..."
              : botActionMessage}
        </div>
      ) : null}

      {botActionHistory.length > 0 ? (
        <div
          data-testid="game-bot-action-history"
          style={{
            marginBottom: 18,
            padding: 14,
            borderRadius: 16,
            border: "1px solid #bbf7d0",
            background: "#f8fffb",
            color: "#14532d",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.8, textTransform: "uppercase" }}>
            Histórico recente do bot
          </div>
          <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
            {botActionHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "8px 10px",
                  borderRadius: 12,
                  background:
                    item.tone === "error"
                      ? "#fff1f2"
                      : item.tone === "pending"
                        ? "#fffbeb"
                        : "#ecfdf5",
                  color:
                    item.tone === "error"
                      ? "#991b1b"
                      : item.tone === "pending"
                        ? "#92400e"
                        : "#166534",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Turno {item.turnNumber} · {item.playerName}: {item.message}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {voteResolutionMessage ? (
        <div
          data-testid="vote-resolution-message"
          style={{
            marginBottom: 18,
            padding: 14,
            borderRadius: 16,
            border: "1px solid #fcd34d",
            background: "#fffbeb",
            color: "#92400e",
            fontWeight: 800,
          }}
        >
          {voteResolutionMessage}
        </div>
      ) : null}

      {isWaiting ? (
        <div
          data-testid="waiting-product-panel"
          style={{
            marginBottom: 18,
            padding: 16,
            borderRadius: 18,
            border: "1px solid #bfdbfe",
            background:
              "linear-gradient(135deg, rgba(239, 246, 255, 0.92) 0%, rgba(255, 255, 255, 0.92) 100%)",
            color: "#374151",
          }}
        >
          <div style={{ fontWeight: 900, color: "#1d4ed8", marginBottom: 8 }}>
            Pré-jogo pronto para iniciar
          </div>
          <div>
            A mesa tem <strong>{formatPlayerCount(totalPlayers)}</strong>. Quando o host iniciar o
            lobby, o tabuleiro e o rack oficial ficam liberados aqui.
          </div>
          <div style={{ marginTop: 8, fontSize: 14 }}>
            {canStartWaitingMatch
              ? "Próxima ação: inicie a partida agora para liberar o tabuleiro aos jogadores."
              : "Próxima ação: aguarde o host iniciar a partida. Esta tela atualiza quando a mesa ficar ativa."}
          </div>
          {canStartWaitingMatch && onStartWaitingMatch ? (
            <button
              type="button"
              data-testid="waiting-start-match"
              onClick={onStartWaitingMatch}
              disabled={isStartingWaitingMatch}
              style={{
                marginTop: 14,
                padding: "12px 16px",
                borderRadius: 14,
                border: "1px solid #1d4ed8",
                background: isStartingWaitingMatch ? "#d1d5db" : "#1d4ed8",
                color: isStartingWaitingMatch ? "#6b7280" : "#ffffff",
                cursor: isStartingWaitingMatch ? "not-allowed" : "pointer",
                fontWeight: 900,
              }}
            >
              {isStartingWaitingMatch ? "Iniciando..." : "Iniciar partida"}
            </button>
          ) : null}
        </div>
      ) : null}

      {viewerPlayer?.has_forfeited ? (
        <div
          data-testid="forfeit-product-panel"
          style={{
            marginBottom: 18,
            padding: 14,
            borderRadius: 16,
            border: "1px solid #fdba74",
            background: "#fff7ed",
            color: "#9a3412",
            fontWeight: 800,
          }}
        >
          Você desistiu desta partida. A mesa continua visível para consulta, mas esta sessão não
          executa novas jogadas.
        </div>
      ) : null}

      {isFinished ? (
        <div
          data-testid="finished-product-panel"
          style={{
            marginBottom: 18,
            padding: 16,
            borderRadius: 18,
            border: "1px solid #fecaca",
            background:
              "radial-gradient(circle at top left, rgba(248, 113, 113, 0.12), transparent 30%), #fff7f7",
            color: "#7f1d1d",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Resultado final</div>
          <div>
            Vencedor:{" "}
            <strong>{winnerPlayer?.display_name ?? winnerPlayerId ?? "(não disponível)"}</strong>
          </div>
          <div>
            Motivo: <strong>{endReasonLabel}</strong>
          </div>
          {typeof endSummary?.total_penalties === "number" ? (
            <div>
              Penalidades finais: <strong>{endSummary.total_penalties}</strong>
            </div>
          ) : null}
          <div>Encerrada em: <strong>{formatFinishedAt(finishedAt)}</strong></div>
          {forfeitedPlayers.length > 0 ? (
            <div style={{ marginTop: 6 }}>
              Desistências registradas: <strong>{forfeitedPlayers.length}</strong>
            </div>
          ) : null}
          {finalStandings.length > 0 ? (
            <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
              {finalStandings.map((player, index) => (
                <div
                  key={player.player_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.78)",
                    color: "#111827",
                  }}
                >
                  <span>
                    {index + 1}. {player.display_name}
                    {player.player_id === viewerPlayer?.player_id ? " · você" : ""}
                    {player.has_forfeited ? " · desistente" : ""}
                  </span>
                  <strong>{player.score} pts</strong>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <VotingSection
        isVoting={isVoting}
        pendingVoteError={pendingVoteError}
        pendingVoteMove={pendingVoteMove}
        canCurrentViewerVote={canCurrentViewerVote}
        isSubmittingVote={isSubmittingVote}
        voteResult={voteResult}
        showDebug={showDebug}
        onApprove={onApprove}
        onReject={onReject}
      />

      {gameplayEnabled ? (
        <>
          <div
            style={{
              marginBottom: 16,
              padding: 14,
              borderRadius: 18,
              border: "1px solid rgba(120, 113, 108, 0.22)",
              background: "rgba(255, 255, 255, 0.72)",
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: "#6b5f3f" }}>
              Agora na mesa
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
              {actionHint}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ padding: "6px 10px", borderRadius: 999, background: "#fef3c7", color: "#713f12", fontSize: 13, fontWeight: 700 }}>
                1. escolha peças
              </span>
              <span style={{ padding: "6px 10px", borderRadius: 999, background: "#ecfdf5", color: "#166534", fontSize: 13, fontWeight: 700 }}>
                2. marque casas
              </span>
              <span style={{ padding: "6px 10px", borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontSize: 13, fontWeight: 700 }}>
                3. confirme no backend
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 18,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 690,
                padding: 16,
                borderRadius: 18,
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              }}
            >
              <BoardSection
                boardState={boardState}
                compositionPlacementsByCell={compositionPlacementsByCell}
                pendingVoteTilesByCell={pendingVoteTilesByCell}
                selectedTileId={selectedTileId}
                selectedRackSlotId={selectedRackSlotId}
                playerRackState={playerRackState}
                rackSlotAssociations={rackSlotAssociations}
                buildCellKey={buildCellKey}
                renderCellLabel={renderCellLabel}
                renderCellBackground={renderCellBackground}
                onPlaceTile={onPlaceTile}
              />
            </div>
          </div>

          {isActive ? (
            <div
              style={{
                marginTop: 6,
              }}
            >
              <RackSection
                rackTiles={playerRackState}
                selectedTileIds={selectedTileIds}
                activeSlotId={selectedRackSlotId}
                slotAssociationLabels={rackSlotAssociationLabels}
                previewTileIds={previewTileIds}
                showDebug={showDebug}
                showGuidance={false}
                isPlayersTurn={isPlayersTurn}
                onToggleTile={onToggleTile}
                onToggleSlot={onToggleRackSlot}
                onClearSlotAssignment={onClearRackSlotAssignment}
                onClearSlotAssociation={onClearRackSlotAssociation}
                onClearPreview={onClearPreview}
                onReorderTile={onReorderTile}
                onChangeSlotDraft={onChangeRackSlotDraft}
              />

              {placedTileCount > 0 ? (
                <div
                  style={{
                    marginTop: 8,
                    marginBottom: 10,
                    padding: 12,
                    borderRadius: 12,
                    border:
                      movePreview?.status === "invalid"
                        ? "1px solid #fca5a5"
                        : movePreview?.requires_vote
                          ? "1px solid #fcd34d"
                          : "1px solid #bfdbfe",
                    background:
                      movePreview?.status === "invalid"
                        ? "#fff1f2"
                        : movePreview?.requires_vote
                          ? "#fffbeb"
                          : "#eff6ff",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#6b7280" }}>
                    Preview do backend
                  </div>
                  {localComposedWord ? (
                    <div
                      data-testid="local-composed-word"
                      style={{
                        marginTop: 6,
                        padding: "8px 10px",
                        borderRadius: 10,
                        background: "#ffffff",
                        border: "1px solid #dbeafe",
                        color: "#1e3a8a",
                        fontSize: 15,
                        fontWeight: 900,
                      }}
                    >
                      Palavra montada localmente: {localComposedWord}
                    </div>
                  ) : null}
                  <div style={{ marginTop: 6, fontSize: 14, color: "#1f2937" }}>
                    {isLoadingMovePreview
                      ? "Calculando pontuacao estimada..."
                      : movePreview?.status === "ok"
                        ? `Palavra principal: ${movePreview.main_word ?? "(indisponivel)"}`
                        : movePreview?.error ?? "Pontuacao estimada indisponivel no momento."}
                  </div>
                  {movePreview?.status === "ok" ? (
                    <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "#ffffff",
                          fontSize: 13,
                          color: "#111827",
                          border: "1px solid #dbeafe",
                        }}
                      >
                        score estimado: <strong>{movePreview.score?.total_score ?? 0}</strong>
                      </span>
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "#ffffff",
                          fontSize: 13,
                          color: movePreview.requires_vote ? "#92400e" : "#166534",
                          border: `1px solid ${movePreview.requires_vote ? "#fcd34d" : "#86efac"}`,
                        }}
                      >
                        {movePreview.requires_vote ? "vai para votacao" : "dicionario reconhece"}
                      </span>
                    </div>
                  ) : null}
                  {movePreview?.status === "ok" && movePreview.requires_vote ? (
                    <div
                      data-testid="dictionary-vote-diagnostic"
                      style={{
                        marginTop: 8,
                        padding: "8px 10px",
                        borderRadius: 10,
                        background: "#ffffff",
                        border: "1px solid #fcd34d",
                        color: "#92400e",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      Palavra fora do léxico ativo; a jogada seguirá para votação da mesa.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {moveCompositionWarning ? (
                <div
                  data-testid="move-composition-warning"
                  style={{
                    marginTop: 8,
                    marginBottom: 10,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #f59e0b",
                    background: "#fff7ed",
                    color: "#92400e",
                    fontWeight: 800,
                  }}
                >
                  {moveCompositionWarning}
                </div>
              ) : null}

              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ color: "#4b5563", fontSize: 14 }}>
                  {isPlayersTurn
                    ? placedTileCount > 0
                      ? `Jogada preparada com ${placedTileCount} peça${placedTileCount === 1 ? "" : "s"}.`
                      : hasRackSlots
                        ? "Selecione peças do rack para jogar direto no tabuleiro ou vincule uma peça a um slot antes de associá-lo ao board."
                        : "Selecione peças do rack e clique no tabuleiro para preparar a jogada."
                    : "Você pode reorganizar o rack, mas a confirmação da jogada só libera no seu turno."}
                </div>

                <button
                  type="button"
                  onClick={onSubmitMove}
                  disabled={!isPlayersTurn || !canSubmitMove || isSubmittingMove}
                  style={{
                    padding: "12px 18px",
                    cursor: !isPlayersTurn || !canSubmitMove || isSubmittingMove ? "not-allowed" : "pointer",
                    borderRadius: 12,
                    border: "1px solid #1d4ed8",
                    background: !isPlayersTurn || !canSubmitMove || isSubmittingMove ? "#bfdbfe" : "#2563eb",
                    color: "#ffffff",
                    fontWeight: 700,
                    minWidth: 170,
                  }}
                >
                  {isSubmittingMove
                    ? "Enviando..."
                    : isPlayersTurn
                      ? "Confirmar jogada"
                      : "Aguardar turno"}
                </button>
              </div>

              <div
                style={{
                  marginTop: 8,
                  padding: 14,
                  borderRadius: 16,
                  border: isPlayersTurn ? "2px solid #2563eb" : "1px solid #e5e7eb",
                  background: isPlayersTurn ? "#eff6ff" : "#ffffff",
                  boxShadow: isPlayersTurn ? "0 0 0 3px rgba(59, 130, 246, 0.12)" : "none",
                }}
              >
                <div style={{ marginTop: 6, fontSize: 14, color: "#4b5563" }}>
                  {isPlayersTurn
                    ? "É sua vez de montar e enviar a jogada."
                    : "Você pode reorganizar as peças enquanto aguarda sua vez."}
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                  Selecione uma peça e clique no tabuleiro para preparar a jogada.
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                  {hasRackSlots
                    ? "Use os slots para montar a palavra com calma antes de confirmar."
                    : "Monte a palavra colocando as peças diretamente no tabuleiro antes de confirmar."}
                </div>
                {selectedGroupCount > 0 ? (
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
                    {selectedGroupCount} peça{selectedGroupCount === 1 ? "" : "s"} selecionada{selectedGroupCount === 1 ? "" : "s"}
                  </div>
                ) : null}
                {rackSlotCount > 0 ? (
                  <div style={{ marginTop: 6, fontSize: 13, color: "#7c3aed", fontWeight: 700 }}>
                    {rackSlotCount} slot{rackSlotCount === 1 ? "" : "s"} local{rackSlotCount === 1 ? "" : "is"} permanente{rackSlotCount === 1 ? "" : "s"} no rack
                  </div>
                ) : null}
                {selectedRackSlotId ? (
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
                    {getSlotShortLabel(selectedRackSlotId)} selecionado. Clique numa peça para vinculá-la ao slot ou clique no tabuleiro para associar essa composição ao board.
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
