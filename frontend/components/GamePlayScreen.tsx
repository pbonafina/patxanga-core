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

  boardState: unknown[];
  localPlacements: Record<string, string>;
  localDeclaredLetters: Record<string, string>;
  pendingVoteTilesByCell: Record<string, { letter?: string }>;
  selectedTileId: string | null;
  playerRackState: unknown[];
  playerContext: {
    rack_state: unknown[];
  } | null | undefined;

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

  boardState,
  localPlacements,
  localDeclaredLetters,
  pendingVoteTilesByCell,
  selectedTileId,
  playerRackState,
  playerContext,

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
      <div
        style={{
          marginBottom: 20,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#ffffff",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Mesa de jogo</h2>
        <p style={{ margin: 0 }}>
          <strong>Estado atual:</strong> {stateLabel}
        </p>

        {isActive ? (
          <p style={{ marginTop: 8, marginBottom: 0 }}>
            É a fase normal da partida. Selecione uma peça, clique no tabuleiro para posicioná-la e depois confirme a jogada.
          </p>
        ) : null}

        {isVoting ? (
          <p style={{ marginTop: 8, marginBottom: 0 }}>
            Há uma jogada aguardando votação. O tabuleiro abaixo mostra o estado oficial com o overlay da jogada pendente.
          </p>
        ) : null}

        {isWaiting ? (
          <p style={{ marginTop: 8, marginBottom: 0 }}>
            A partida ainda não começou.
          </p>
        ) : null}

        {isFinished ? (
          <p style={{ marginTop: 8, marginBottom: 0 }}>
            A partida foi encerrada. Vencedor: {winnerPlayerId || "(não disponível)"}.
            {" "}Encerrada em: {finishedAt || "(não disponível)"}.
          </p>
        ) : null}
      </div>

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

          {isActive ? (
            <>
              <RackSection
                playerContext={playerContext}
                selectedTileId={selectedTileId}
                showDebug={showDebug}
                onToggleTile={onToggleTile}
                onClearPreview={onClearPreview}
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

                <button
                  type="button"
                  onClick={onClearPreview}
                  style={{ padding: "10px 14px", cursor: "pointer" }}
                >
                  Limpar jogada
                </button>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
