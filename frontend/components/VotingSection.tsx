type PendingVoteMove = {
  move_id?: string;
  player_id?: string;
  author_display_name?: string;
  main_word?: string;
  board_diff?: Array<{
    row?: number;
    col?: number;
    letter?: string;
  }>;
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

function formatVoteResult(voteResult: unknown): string | null {
  if (!voteResult || typeof voteResult !== "object") {
    return null;
  }

  const status = (voteResult as { status?: unknown }).status;
  if (status === "accepted") {
    return "A palavra foi aceita e aplicada ao tabuleiro oficial.";
  }
  if (status === "rejected") {
    return "A palavra foi rejeitada e o tabuleiro oficial continua sem essa jogada.";
  }

  return null;
}

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

  const proposedTiles = pendingVoteMove?.board_diff ?? [];
  const proposedWord = pendingVoteMove?.main_word ?? "";
  const voteResultMessage = formatVoteResult(voteResult);

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
            padding: 18,
            border: "1px solid #f59e0b",
            borderRadius: 20,
            background:
              "radial-gradient(circle at top left, rgba(245, 158, 11, 0.16), transparent 30%), linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)",
            boxShadow: "0 14px 34px rgba(146, 64, 14, 0.12)",
          }}
          data-testid="pending-vote-panel"
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
                Palavra em avaliação
              </div>
              <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: "#111827" }}>
                Jogada aguardando decisão da mesa
              </div>
              <div style={{ marginTop: 8, color: "#4b5563" }}>
                Autor: <strong>{pendingVoteMove.author_display_name ?? "(desconhecido)"}</strong>
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

          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 16,
              border: "1px solid rgba(146, 64, 14, 0.18)",
              background: "rgba(255, 255, 255, 0.74)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: "#92400e" }}>
              Palavra principal
            </div>
            <div
              data-testid="pending-vote-word"
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {(proposedWord || "?").split("").map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  style={{
                    width: 38,
                    height: 44,
                    borderRadius: 10,
                    background: "#ffffff",
                    border: "1px solid #f59e0b",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#111827",
                    boxShadow: "0 6px 14px rgba(146, 64, 14, 0.12)",
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>

            {proposedTiles.length > 0 ? (
              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {proposedTiles.map((tile, index) => (
                  <span
                    key={`${tile.row ?? "r"}-${tile.col ?? "c"}-${index}`}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                      color: "#9a3412",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {tile.letter ?? "?"} em {tile.row ?? "?"},{tile.col ?? "?"}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 14,
              background: canCurrentViewerVote ? "#ecfdf5" : "#f3f4f6",
              border: canCurrentViewerVote ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
              color: canCurrentViewerVote ? "#166534" : "#4b5563",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {canCurrentViewerVote
              ? "Você pode votar porque não é o autor desta jogada."
              : "Autor não vota na própria palavra. Aguarde outro jogador decidir."}
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
              {isSubmittingVote ? "Enviando..." : "Aceitar palavra"}
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
              {isSubmittingVote ? "Enviando..." : "Rejeitar palavra"}
            </button>
          </div>

          {voteResultMessage ? (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 14,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
                fontWeight: 800,
              }}
            >
              {voteResultMessage}
            </div>
          ) : null}

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
