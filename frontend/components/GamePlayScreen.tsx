import { BoardSection } from "./BoardSection";
import { RackSection } from "./RackSection";
import { VotingSection } from "./VotingSection";

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
  playersSummary: Array<{
    player_id: string;
    display_name: string;
  }>;
  currentTurnPlayerId: string | null;

  boardState: unknown[];
  localPlacements: Record<string, string>;
  localDeclaredLetters: Record<string, string>;
  pendingVoteTilesByCell: Record<string, { letter?: string }>;
  selectedTileId: string | null;
  playerRackState: unknown[];

  placedTilesPreview: unknown[];
  canSubmitMove: boolean;
  isSubmittingMove: boolean;

  pendingVoteError: string | null;
  pendingVoteMove: PendingVoteMove | null;
  canCurrentViewerVote: boolean;
  isSubmittingVote: boolean;
  voteResult: unknown | null;
  showDebug: boolean;

  buildCellKey: (rowIndex: number, colIndex: number) => string;
  renderCellLabel: (cell: BoardCell) => string;
  renderCellBackground: (
    cell: BoardCell,
    rowIndex: number,
    colIndex: number
  ) => string;

  onPlaceTile: (cellKey: string, typedCell: BoardCell) => void;
  onToggleTile: (tileId: string) => void;
  onClearPreview: () => void;
  onReorderTile: (draggedTileId: string, targetTileId: string) => void;
  onSubmitMove: () => void;
  onApprove: () => void;
  onReject: () => void;
};

export function GamePlayScreen({
  stateLabel,
  isWaiting,
  isActive,
  isVoting,
  isFinished,
  winnerPlayerId,
  finishedAt,
  playersSummary,
  currentTurnPlayerId,

  boardState,
  localPlacements,
  localDeclaredLetters,
  pendingVoteTilesByCell,
  selectedTileId,
  playerRackState,

  placedTilesPreview,
  canSubmitMove,
  isSubmittingMove,

  pendingVoteError,
  pendingVoteMove,
  canCurrentViewerVote,
  isSubmittingVote,
  voteResult,
  showDebug,

  buildCellKey,
  renderCellLabel,
  renderCellBackground,

  onPlaceTile,
  onToggleTile,
  onClearPreview,
  onReorderTile,
  onSubmitMove,
  onApprove,
  onReject,
}: GamePlayScreenProps) {
  const gameplayEnabled = isActive || isVoting;

  return (
    <section
      style={{
        marginTop: 24,
        padding: 20,
        border: "1px solid #d6d6d6",
        borderRadius: 12,
        background: "#fcfcfc",
      }}
    >
      {isWaiting ? (
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: 0 }}>A partida ainda não começou.</p>
        </div>
      ) : null}

      {isFinished ? (
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: 0 }}>
            A partida foi encerrada. Vencedor: {winnerPlayerId || "(não disponível)"}.
            {" "}Encerrada em: {finishedAt || "(não disponível)"}.
          </p>
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
          <div style={{ position: "relative", width: 630 }}>
            <div
              style={{
                position: "absolute",
                top: -10,
                left: 18,
                zIndex: 2,
              }}
            >
              <div
                title={
                  isActive
                    ? "Partida ativa"
                    : isVoting
                      ? "Aguardando votação"
                      : isFinished
                        ? "Partida encerrada"
                        : isWaiting
                          ? "Aguardando início"
                          : "Estado desconhecido"
                }
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  border: "1px solid #666",
                  background: isActive
                    ? "#22c55e"
                    : isVoting
                      ? "#eab308"
                      : isFinished
                        ? "#ef4444"
                        : "#9ca3af",
                }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                top: -10,
                right: 18,
                display: "flex",
                gap: 6,
                zIndex: 2,
              }}
            >
              {playersSummary.map((player) => {
                const isCurrentTurn = player.player_id === currentTurnPlayerId;
                return (
                  <div
                    key={player.player_id}
                    title={player.display_name}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      border: isCurrentTurn ? "2px solid #111827" : "1px solid #666",
                      background: isCurrentTurn ? "#60a5fa" : "#d1d5db",
                    }}
                  />
                );
              })}
            </div>

            <BoardSection
              boardState={boardState}
              localPlacements={localPlacements}
              localDeclaredLetters={localDeclaredLetters}
              pendingVoteTilesByCell={pendingVoteTilesByCell}
              selectedTileId={selectedTileId}
              playerRackState={playerRackState}
              buildCellKey={buildCellKey}
              renderCellLabel={renderCellLabel}
              renderCellBackground={renderCellBackground}
              onPlaceTile={onPlaceTile}
            />
          </div>

          {isActive ? (
            <>
              <RackSection
                rackTiles={playerRackState}
                selectedTileId={selectedTileId}
                showDebug={showDebug}
                onToggleTile={onToggleTile}
                onClearPreview={onClearPreview}
                onReorderTile={onReorderTile}
              />

              <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={onSubmitMove}
                  disabled={!canSubmitMove || isSubmittingMove}
                  style={{ padding: "10px 14px", cursor: "pointer" }}
                >
                  {isSubmittingMove ? "Enviando..." : "Confirmar jogada"}
                </button>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
