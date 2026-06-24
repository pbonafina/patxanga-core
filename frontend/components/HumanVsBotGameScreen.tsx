import { BoardSection } from "./BoardSection";
import { RackSection } from "./RackSection";
import { VotingSection } from "./VotingSection";
import type { GamePlayScreenProps } from "./GamePlayScreen";

type HumanVsBotGameScreenProps = GamePlayScreenProps & {
  isExchangeMode: boolean;
  selectedExchangeTileIds: string[];
  canCurrentPlayerTakeTurnAction: boolean;
  canSubmitExchange: boolean;
  isSubmittingPassTurn: boolean;
  isSubmittingExchange: boolean;
  turnActionMessage: string | null;
  turnActionBlockReason: string;
  onPassTurn: () => void;
  onToggleExchangeMode: () => void;
  onSubmitExchange: () => void;
  onCreateNewBotMatch: () => void;
  isCreatingBotMatch: boolean;
};

function formatScoreLabel(score: number): string {
  return `${score} ponto${score === 1 ? "" : "s"}`;
}

function formatPreparedTileCoordinates(tiles: unknown[]): string {
  const coordinates = tiles
    .map((tile) => tile as { row?: number; col?: number })
    .filter((tile) => typeof tile.row === "number" && typeof tile.col === "number")
    .map((tile) => `${tile.row},${tile.col}`);

  return coordinates.length > 0 ? coordinates.join(" · ") : "nenhuma casa";
}

export function HumanVsBotGameScreen({
  stateLabel,
  matchLanguage,
  isActive,
  isVoting,
  isFinished,
  endSummary,
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
  botActionMessage,
  botActionError,
  botActionHistory,
  lastTurnActionSummary,
  isAutoPlayingBotTurn,
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
  isExchangeMode,
  selectedExchangeTileIds,
  canCurrentPlayerTakeTurnAction,
  canSubmitExchange,
  isSubmittingPassTurn,
  isSubmittingExchange,
  turnActionMessage,
  turnActionBlockReason,
  onPassTurn,
  onToggleExchangeMode,
  onSubmitExchange,
  onCreateNewBotMatch,
  isCreatingBotMatch,
}: HumanVsBotGameScreenProps) {
  const humanPlayer = playersSummary.find((player) => player.player_id === viewerPlayerId) ?? null;
  const botPlayer = playersSummary.find((player) => player.is_bot) ?? null;
  const currentTurnPlayer =
    playersSummary.find((player) => player.player_id === currentTurnPlayerId) ?? null;
  const isKnownBotTurn =
    Boolean(currentTurnPlayerId) &&
    Boolean(botPlayer?.player_id) &&
    currentTurnPlayerId === botPlayer?.player_id &&
    isActive;
  const isHumanTurn =
    Boolean(viewerPlayerId) &&
    Boolean(currentTurnPlayerId) &&
    viewerPlayerId === currentTurnPlayerId &&
    isActive;
  const isBotTurn = (Boolean(currentTurnPlayer?.is_bot) || isKnownBotTurn) && isActive;
  const canUseHumanTurnControls = isHumanTurn && canCurrentPlayerTakeTurnAction;
  const placedTileCount = placedTilesPreview.length;
  const winnerPlayer = playersSummary.find((player) => player.player_id === winnerPlayerId) ?? null;
  const statusLabel = isFinished
    ? "Partida encerrada"
    : isVoting
      ? "Votação pendente"
      : isBotTurn || isAutoPlayingBotTurn
        ? "Bot jogando automaticamente"
        : isHumanTurn
          ? "Sua vez de jogar"
          : "Aguardando turno";
  const actionHint = isFinished
    ? "Veja o resultado final ou inicie outro treino."
    : isVoting
      ? canCurrentViewerVote
        ? "Decida a palavra em votação."
        : "Aguarde a decisão da mesa."
      : isBotTurn || isAutoPlayingBotTurn
        ? "Não faça nada: o bot executa o turno sozinho."
        : isHumanTurn
          ? "Escolha peças, marque o tabuleiro e confirme a jogada."
          : "Aguardando a mesa atualizar.";

  return (
    <section
      data-testid="human-vs-bot-screen"
      style={{
        display: "grid",
        gap: 18,
        paddingBottom: isHumanTurn ? 104 : 0,
      }}
    >
      <div
        style={{
          padding: 22,
          borderRadius: 28,
          background:
            "radial-gradient(circle at 8% 20%, rgba(34, 197, 94, 0.24), transparent 32%), radial-gradient(circle at 90% 8%, rgba(251, 191, 36, 0.2), transparent 28%), linear-gradient(135deg, #10231d 0%, #1f3d2f 52%, #4b371d 100%)",
          color: "#f7fee7",
          boxShadow: "0 22px 60px rgba(16, 35, 29, 0.28)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "#fde68a",
              }}
            >
              Treino humano x bot
            </div>
            <h1 style={{ margin: "8px 0 0", fontSize: 42, lineHeight: 1 }}>
              Jogue contra o Bot Easy
            </h1>
            <p style={{ margin: "12px 0 0", maxWidth: 620, fontSize: 17, lineHeight: 1.45 }}>
              Interface limpa para partida local: o bot joga sozinho quando chega a vez dele.
            </p>
          </div>

          <button
            type="button"
            data-testid="new-bot-match-create"
            onClick={onCreateNewBotMatch}
            disabled={isCreatingBotMatch}
            style={{
              padding: "11px 15px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.35)",
              background: isCreatingBotMatch ? "rgba(255,255,255,0.18)" : "#fef3c7",
              color: "#422006",
              cursor: isCreatingBotMatch ? "not-allowed" : "pointer",
              fontWeight: 900,
            }}
          >
            {isCreatingBotMatch ? "Criando..." : "Nova contra bot"}
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <div
          style={{
            padding: 16,
            borderRadius: 20,
            border: isHumanTurn ? "1px solid #86efac" : "1px solid #d1d5db",
            background: isHumanTurn ? "#dcfce7" : "#f8fafc",
            color: "#111827",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>
            Humano
          </div>
          <div style={{ marginTop: 8, fontSize: 22, fontWeight: 900 }}>
            {humanPlayer?.display_name ?? "Você"}
          </div>
          <div style={{ marginTop: 6, fontSize: 16 }}>
            {formatScoreLabel(humanPlayer?.score ?? 0)}
          </div>
        </div>

        <div
          data-testid="bot-product-state"
          style={{
            padding: 16,
            borderRadius: 20,
            border: isBotTurn || isAutoPlayingBotTurn ? "1px solid #f59e0b" : "1px solid #bbf7d0",
            background: isBotTurn || isAutoPlayingBotTurn ? "#fffbeb" : "#f0fdf4",
            color: "#111827",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>
            Bot
          </div>
          <div style={{ marginTop: 8, fontSize: 22, fontWeight: 900 }}>
            {botPlayer?.display_name ?? "Bot Easy"}
          </div>
          <div style={{ marginTop: 6, fontSize: 16 }}>
            {formatScoreLabel(botPlayer?.score ?? 0)}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "#166534", fontWeight: 800 }}>
            bot {botPlayer?.bot_level ?? "easy"} / {botPlayer?.bot_profile ?? "balanced"}
          </div>
        </div>

        <div
          style={{
            padding: 16,
            borderRadius: 20,
            border: "1px solid #bfdbfe",
            background: "#eff6ff",
            color: "#1e3a8a",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>
            Mesa
          </div>
          <div style={{ marginTop: 8, fontSize: 22, fontWeight: 900 }}>
            {statusLabel}
          </div>
          <div style={{ marginTop: 6, fontSize: 14, color: "#1f2937" }}>
            Turno {turnNumber} · {matchLanguage} · {stateLabel}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 20,
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          color: "#111827",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: "#6b7280" }}>
          Próxima ação
        </div>
        <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900 }}>{actionHint}</div>
        {isBotTurn ? (
          <div
            data-testid="bot-turn-lock-panel"
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 16,
              border: "1px solid #f59e0b",
              background: "#fffbeb",
              color: "#78350f",
              fontWeight: 900,
            }}
          >
            {currentTurnPlayer?.display_name ?? botPlayer?.display_name ?? "Bot"} está com o turno.
            Ações humanas ficam bloqueadas até a jogada automática terminar.
          </div>
        ) : null}
        {botActionMessage || botActionError || isAutoPlayingBotTurn ? (
          <div
            data-testid="game-bot-action-message"
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 14,
              border: botActionError ? "1px solid #fca5a5" : "1px solid #bbf7d0",
              background: botActionError ? "#fff1f2" : "#f0fdf4",
              color: botActionError ? "#991b1b" : "#166534",
              fontWeight: 800,
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
            style={{ marginTop: 10, display: "grid", gap: 6 }}
          >
            <strong>Histórico recente do bot</strong>
            {botActionHistory.slice(0, 3).map((item) => (
              <div key={item.id} style={{ fontSize: 13, color: "#14532d", fontWeight: 700 }}>
                Turno {item.turnNumber}: {item.message}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {voteResolutionMessage ? (
        <div
          data-testid="vote-resolution-message"
          style={{
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

      {isFinished ? (
        <div
          data-testid="finished-product-panel"
          style={{
            padding: 16,
            borderRadius: 18,
            border: "1px solid #fecaca",
            background: "#fff7f7",
            color: "#7f1d1d",
          }}
        >
          <strong>Resultado final:</strong> vencedor{" "}
          {winnerPlayer?.display_name ?? winnerPlayerId ?? "(não disponível)"}.
          {endSummary?.reason ? ` Motivo: ${endSummary.reason}.` : ""}
          {finishedAt ? ` Encerrada em ${finishedAt}.` : ""}
        </div>
      ) : null}

      <VotingSection
        isVoting={isVoting}
        pendingVoteError={pendingVoteError}
        pendingVoteMove={pendingVoteMove}
        canCurrentViewerVote={canCurrentViewerVote}
        isSubmittingVote={isSubmittingVote}
        voteResult={voteResult}
        showDebug={false}
        onApprove={onApprove}
        onReject={onReject}
      />

      {(isActive || isVoting) && boardState.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 520px), 1fr))",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 20,
              border: "1px solid #e5e7eb",
              background: "#f8fafc",
              overflowX: "auto",
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

          <div style={{ display: "grid", gap: 14 }}>
            {isActive ? (
              <>
                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    border: "1px solid #e5e7eb",
                    background: "#ffffff",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: "#6b7280" }}>
                    Sua rack
                  </div>
                  <RackSection
                    rackTiles={playerRackState}
                    selectedTileIds={selectedTileIds}
                    activeSlotId={selectedRackSlotId}
                    slotAssociationLabels={rackSlotAssociationLabels}
                    previewTileIds={previewTileIds}
                    showDebug={false}
                    isPlayersTurn={isHumanTurn}
                    onToggleTile={onToggleTile}
                    onToggleSlot={onToggleRackSlot}
                    onClearSlotAssignment={onClearRackSlotAssignment}
                    onClearSlotAssociation={onClearRackSlotAssociation}
                    onClearPreview={onClearPreview}
                    onReorderTile={onReorderTile}
                    onChangeSlotDraft={onChangeRackSlotDraft}
                  />
                </div>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    border: "1px solid #bfdbfe",
                    background: "#eff6ff",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: "#1d4ed8" }}>
                    Jogada
                  </div>
                  {placedTileCount > 0 ? (
                    <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                      {localComposedWord ? (
                        <div data-testid="local-composed-word" style={{ fontWeight: 900 }}>
                          Palavra: {localComposedWord}
                        </div>
                      ) : null}
                      <div style={{ fontSize: 14 }}>
                        Casas: {formatPreparedTileCoordinates(placedTilesPreview)}
                      </div>
                      <div style={{ fontSize: 14 }}>
                        {isLoadingMovePreview
                          ? "Calculando..."
                          : movePreview?.status === "ok"
                            ? `Score estimado: ${movePreview.score?.total_score ?? 0}`
                            : movePreview?.error ?? "Preview indisponível."}
                      </div>
                      {movePreview?.status === "ok" && movePreview.requires_vote ? (
                        <div data-testid="dictionary-vote-diagnostic" style={{ color: "#92400e", fontWeight: 800 }}>
                          Palavra fora do léxico ativo; irá para votação.
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, color: "#4b5563" }}>
                      Selecione uma peça e clique numa casa livre do tabuleiro.
                    </div>
                  )}

                  {moveCompositionWarning ? (
                    <div
                      data-testid="move-composition-warning"
                      style={{ marginTop: 10, color: "#92400e", fontWeight: 800 }}
                    >
                      {moveCompositionWarning}
                    </div>
                  ) : null}

                  <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={onSubmitMove}
                      disabled={!isHumanTurn || !canSubmitMove || isSubmittingMove}
                      style={{
                        padding: "11px 15px",
                        borderRadius: 12,
                        border: "1px solid #1d4ed8",
                        background: !isHumanTurn || !canSubmitMove || isSubmittingMove ? "#bfdbfe" : "#2563eb",
                        color: "#ffffff",
                        cursor: !isHumanTurn || !canSubmitMove || isSubmittingMove ? "not-allowed" : "pointer",
                        fontWeight: 900,
                      }}
                    >
                      {isSubmittingMove ? "Enviando..." : isHumanTurn ? "Confirmar jogada" : "Aguardar turno"}
                    </button>

                    <button
                      type="button"
                      onClick={onPassTurn}
                      disabled={!canUseHumanTurnControls || isSubmittingPassTurn || isSubmittingExchange}
                      data-testid="pass-turn-action"
                      style={{
                        padding: "11px 15px",
                        borderRadius: 12,
                        border: "1px solid #d97706",
                        background:
                          !canUseHumanTurnControls || isSubmittingPassTurn || isSubmittingExchange
                            ? "#fde68a"
                            : "#f59e0b",
                        color: "#422006",
                        cursor:
                          !canUseHumanTurnControls || isSubmittingPassTurn || isSubmittingExchange
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: 900,
                      }}
                    >
                      {isSubmittingPassTurn ? "Passando..." : "Passar turno"}
                    </button>

                    <button
                      type="button"
                      onClick={onToggleExchangeMode}
                      disabled={!canUseHumanTurnControls || isSubmittingExchange || isSubmittingPassTurn}
                      data-testid="exchange-turn-toggle"
                      style={{
                        padding: "11px 15px",
                        borderRadius: 12,
                        border: "1px solid #0f766e",
                        background:
                          !canUseHumanTurnControls || isSubmittingExchange || isSubmittingPassTurn
                            ? "#99f6e4"
                            : "#14b8a6",
                        color: "#042f2e",
                        cursor:
                          !canUseHumanTurnControls || isSubmittingExchange || isSubmittingPassTurn
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: 900,
                      }}
                    >
                      {isExchangeMode ? "Cancelar troca" : "Trocar peças"}
                    </button>
                  </div>

                  {isExchangeMode ? (
                    <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                      <div style={{ color: "#1d4ed8", fontSize: 14, fontWeight: 800 }}>
                        {selectedExchangeTileIds.length > 0
                          ? `${selectedExchangeTileIds.length} peça${selectedExchangeTileIds.length === 1 ? "" : "s"} selecionada${selectedExchangeTileIds.length === 1 ? "" : "s"} para troca.`
                          : "Selecione pelo menos uma peça do rack."}
                      </div>
                      <button
                        type="button"
                        data-testid="exchange-turn-submit"
                        onClick={onSubmitExchange}
                        disabled={!canSubmitExchange || isSubmittingExchange}
                        style={{
                          width: "fit-content",
                          padding: "10px 14px",
                          borderRadius: 12,
                          border: "1px solid #0f766e",
                          background: !canSubmitExchange || isSubmittingExchange ? "#99f6e4" : "#0f766e",
                          color: "#ffffff",
                          cursor: !canSubmitExchange || isSubmittingExchange ? "not-allowed" : "pointer",
                          fontWeight: 900,
                        }}
                      >
                        {isSubmittingExchange
                          ? "Trocando..."
                          : `Trocar ${selectedExchangeTileIds.length} peça(s)`}
                      </button>
                    </div>
                  ) : null}

                  {!canCurrentPlayerTakeTurnAction && isActive ? (
                    <div data-testid="turn-action-block-reason" style={{ marginTop: 10, color: "#92400e" }}>
                      {turnActionBlockReason}
                    </div>
                  ) : null}
                  {turnActionMessage ? (
                    <div data-testid="turn-action-message" style={{ marginTop: 10, color: "#166534", fontWeight: 800 }}>
                      {turnActionMessage}
                    </div>
                  ) : null}
                  {lastTurnActionSummary ? (
                    <div data-testid="turn-action-summary-card" style={{ marginTop: 10, color: "#1e3a8a", fontWeight: 800 }}>
                      {lastTurnActionSummary.actionLabel} · rack {lastTurnActionSummary.beforeRackCount} →{" "}
                      {lastTurnActionSummary.afterRackCount}
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {isHumanTurn ? (
        <div
          data-testid="human-vs-bot-sticky-actions"
          style={{
            position: "fixed",
            left: 12,
            right: 12,
            bottom: 12,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            padding: 12,
            borderRadius: 18,
            border: "1px solid rgba(29, 78, 216, 0.3)",
            background: "rgba(255, 255, 255, 0.96)",
            boxShadow: "0 18px 46px rgba(15, 23, 42, 0.22)",
            color: "#111827",
          }}
        >
          <div style={{ minWidth: 180 }}>
            <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: "#1d4ed8" }}>
              Sua jogada
            </div>
            <div style={{ marginTop: 3, fontSize: 14, fontWeight: 800 }}>
              {placedTileCount > 0
                ? localComposedWord
                  ? `${localComposedWord} · ${formatPreparedTileCoordinates(placedTilesPreview)}`
                  : `${placedTileCount} peça(s) posicionada(s)`
                : "Selecione peças e casas no tabuleiro"}
            </div>
          </div>

          <button
            type="button"
            data-testid="sticky-submit-move"
            onClick={onSubmitMove}
            disabled={!canSubmitMove || isSubmittingMove}
            style={{
              minWidth: 156,
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid #1d4ed8",
              background: !canSubmitMove || isSubmittingMove ? "#bfdbfe" : "#2563eb",
              color: "#ffffff",
              cursor: !canSubmitMove || isSubmittingMove ? "not-allowed" : "pointer",
              fontWeight: 900,
            }}
          >
            {isSubmittingMove ? "Enviando..." : "Enviar jogada"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
