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
            marginBottom: 18,
            padding: 16,
            border: "1px solid #fca5a5",
            borderRadius: 14,
            background: "#fff5f5",
          }}
        >
          <div style={{ fontWeight: 700, color: "#991b1b", marginBottom: 6 }}>
            Erro ao carregar a votação
          </div>
          <div style={{ color: "#7f1d1d" }}>{pendingVoteError}</div>
        </section>
      ) : null}

      {pendingVoteMove ? (
        <section
          style={{
            marginBottom: 18,
            padding: 16,
            border: "1px solid #fcd34d",
            borderRadius: 14,
            background: "#fffbeb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#92400e" }}>
                Votação em andamento
              </div>
              <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700, color: "#111827" }}>
                Jogada aguardando decisão da mesa
              </div>
              <div style={{ marginTop: 8, color: "#4b5563" }}>
                Autor: <strong>{pendingVoteMove.author_display_name ?? "(desconhecido)"}</strong>
              </div>
              <div style={{ marginTop: 4, color: "#4b5563" }}>
                Palavra principal: <strong>{pendingVoteMove.main_word ?? "(não disponível)"}</strong>
              </div>
              <div style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>
                O tabuleiro oficial continua intacto até a votação ser resolvida.
              </div>
            </div>

            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: canCurrentViewerVote ? "#dcfce7" : "#e5e7eb",
                color: canCurrentViewerVote ? "#166534" : "#4b5563",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {canCurrentViewerVote ? "voto disponível" : "voto indisponível"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
            <button
              type="button"
              onClick={onApprove}
              disabled={!canCurrentViewerVote || isSubmittingVote}
              style={{
                padding: "10px 14px",
                cursor: !canCurrentViewerVote || isSubmittingVote ? "not-allowed" : "pointer",
                borderRadius: 10,
                border: "1px solid #15803d",
                background: !canCurrentViewerVote || isSubmittingVote ? "#bbf7d0" : "#16a34a",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              {isSubmittingVote ? "Enviando..." : "Aprovar"}
            </button>

            <button
              type="button"
              onClick={onReject}
              disabled={!canCurrentViewerVote || isSubmittingVote}
              style={{
                padding: "10px 14px",
                cursor: !canCurrentViewerVote || isSubmittingVote ? "not-allowed" : "pointer",
                borderRadius: 10,
                border: "1px solid #b45309",
                background: !canCurrentViewerVote || isSubmittingVote ? "#fde68a" : "#d97706",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              {isSubmittingVote ? "Enviando..." : "Rejeitar"}
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
