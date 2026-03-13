type PendingVoteMove = {
  move_id?: string;
  player_id?: string;
  author_display_name?: string;
  main_word?: string;
};

type VotingSectionProps = {
  isVoting: boolean;
  pendingVoteError: string | null;
  pendingVoteMove: PendingVoteMove | null;
  canCurrentViewerVote: boolean;
  isSubmittingVote: boolean;
  voteResult: unknown | null;
  showDebug: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export function VotingSection({
  isVoting,
  pendingVoteError,
  pendingVoteMove,
  canCurrentViewerVote,
  isSubmittingVote,
  voteResult,
  showDebug,
  onApprove,
  onReject,
}: VotingSectionProps) {
  if (!isVoting) {
    return null;
  }

  return (
    <>
      {pendingVoteError ? (
        <section
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #b00020",
            borderRadius: 8,
            background: "#fff5f5",
          }}
        >
          <h2>Erro ao carregar contexto de votação</h2>
          <p>{pendingVoteError}</p>
        </section>
      ) : null}

      {pendingVoteMove ? (
        <section
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #d97706",
            borderRadius: 8,
            background: "#fffbeb",
          }}
        >
          <h2>Jogada em avaliação</h2>
          <p>
            <strong>Autor:</strong> {pendingVoteMove.author_display_name ?? "(desconhecido)"}
          </p>
          <p>
            <strong>Palavra principal:</strong> {pendingVoteMove.main_word ?? "(nula)"}
          </p>
          <p>
            <strong>Pode votar nesta tela:</strong> {canCurrentViewerVote ? "sim" : "nao"}
          </p>
          <p>
            O board oficial permanece intacto; o tabuleiro abaixo mostra overlay visual da
            jogada pendente.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
            <button
              type="button"
              onClick={onApprove}
              disabled={!canCurrentViewerVote || isSubmittingVote}
              style={{ padding: "10px 14px", cursor: "pointer" }}
            >
              {isSubmittingVote ? "Enviando..." : "Aprovar jogada"}
            </button>

            <button
              type="button"
              onClick={onReject}
              disabled={!canCurrentViewerVote || isSubmittingVote}
              style={{ padding: "10px 14px", cursor: "pointer" }}
            >
              {isSubmittingVote ? "Enviando..." : "Rejeitar jogada"}
            </button>
          </div>

          {showDebug && voteResult ? (
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
    </>
  );
}
