import { BoardSection } from "./BoardSection";
import { RackSection } from "./RackSection";
import { VotingSection } from "./VotingSection";
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

type GamePlayScreenProps = {
  stateLabel: string;
  isWaiting: boolean;
  isActive: boolean;
  isVoting: boolean;
  isFinished: boolean;
  winnerPlayerId: string | null;
  finishedAt: string | null;
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
  canSubmitMove: boolean;
  isSubmittingMove: boolean;
  movePreview: MovePreviewResult | null;
  isLoadingMovePreview: boolean;

  pendingVoteError: string | null;
  pendingVoteMove: PendingVoteMove | null;
  canCurrentViewerVote: boolean;
  isSubmittingVote: boolean;
  voteResult: unknown | null;
  showDebug: boolean;
  botActionMessage: string | null;
  botActionError: string | null;
  isAutoPlayingBotTurn: boolean;

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
  onClearPreview: () => void;
  onReorderTile: (draggedItemId: string, dropTargetId: string) => void;
  onChangeRackSlotDraft: (slotId: string, nextValue: string) => void;
  onSubmitMove: () => void;
  onApprove: () => void;
  onReject: () => void;
  onToggleDebug: () => void;
};

function getSlotShortLabel(slotId: string): string {
  const suffix = slotId.split(":").pop() ?? slotId;
  return `S${suffix}`;
}

function formatFinishedAt(value: string | null): string {
  if (!value) return "(não disponível)";
  return value;
}

export function GamePlayScreen({
  stateLabel,
  isWaiting,
  isActive,
  isVoting,
  isFinished,
  winnerPlayerId,
  finishedAt,
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
  canSubmitMove,
  isSubmittingMove,
  movePreview,
  isLoadingMovePreview,

  pendingVoteError,
  pendingVoteMove,
  canCurrentViewerVote,
  isSubmittingVote,
  voteResult,
  showDebug,
  botActionMessage,
  botActionError,
  isAutoPlayingBotTurn,

  buildCellKey,
  renderCellLabel,
  renderCellBackground,

  onPlaceTile,
  onToggleTile,
  onToggleRackSlot,
  onClearRackSlotAssignment,
  onClearPreview,
  onReorderTile,
  onChangeRackSlotDraft,
  onSubmitMove,
  onApprove,
  onReject,
  onToggleDebug,
}: GamePlayScreenProps) {
  const gameplayEnabled = isActive || isVoting;

  const currentTurnPlayer =
    playersSummary.find((player) => player.player_id === currentTurnPlayerId) ?? null;
  const currentTurnPlayerName = currentTurnPlayer?.display_name ?? "aguardando definição";
  const viewerPlayer =
    playersSummary.find((player) => player.player_id === viewerPlayerId) ?? null;
  const scoreLeader = [...playersSummary].sort((left, right) => right.score - left.score)[0] ?? null;

  const totalPlayers = playersSummary.length;
  const placedTileCount = placedTilesPreview.length;
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
        : "Inicie a partida quando todos estiverem prontos.";

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

      {botActionMessage || botActionError || isAutoPlayingBotTurn ? (
        <div
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

      {isWaiting ? (
        <div
          style={{
            marginBottom: 18,
            padding: 16,
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#374151",
          }}
        >
          A partida ainda não começou. Assim que ela for iniciada, a mesa de jogo será liberada.
        </div>
      ) : null}

      {isFinished ? (
        <div
          style={{
            marginBottom: 18,
            padding: 16,
            borderRadius: 14,
            border: "1px solid #fecaca",
            background: "#fff7f7",
            color: "#7f1d1d",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Resultado final</div>
          <div>Vencedor: <strong>{winnerPlayerId || "(não disponível)"}</strong></div>
          <div>Encerrada em: <strong>{formatFinishedAt(finishedAt)}</strong></div>
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
                marginTop: 10,
                padding: 18,
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: "#ffffff",
              }}
            >
              {placedTileCount > 0 ? (
                <div
                  style={{
                    marginBottom: 14,
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
                </div>
              ) : null}

              <RackSection
                rackTiles={playerRackState}
                selectedTileIds={selectedTileIds}
                activeSlotId={selectedRackSlotId}
                slotAssociationLabels={rackSlotAssociationLabels}
                previewTileIds={previewTileIds}
                showDebug={showDebug}
                isPlayersTurn={isPlayersTurn}
                onToggleTile={onToggleTile}
                onToggleSlot={onToggleRackSlot}
                onClearSlotAssignment={onClearRackSlotAssignment}
                onClearPreview={onClearPreview}
                onReorderTile={onReorderTile}
                onChangeSlotDraft={onChangeRackSlotDraft}
              />

              <div
                style={{
                  marginTop: 18,
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
                      : "Selecione peças do rack para jogar direto no tabuleiro ou vincule uma peça a um slot antes de associá-lo ao board."
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
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
