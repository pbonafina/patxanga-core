type MoveSubmitSectionProps = {
  showDebug: boolean;
  placedTilesPreview: unknown[];
  isSubmittingMove: boolean;
  canSubmitMove: boolean;
  submitResult: unknown | null;
  onSubmitMove: () => void;
};

export function MoveSubmitSection({
  showDebug,
  placedTilesPreview,
  isSubmittingMove,
  canSubmitMove,
  submitResult,
  onSubmitMove,
}: MoveSubmitSectionProps) {
  return (
    <>
      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        {showDebug ? <h2>Pré-visualização da jogada</h2> : <h2 style={{ display: "none" }}>Pré-visualização da jogada</h2>}

        {placedTilesPreview.length === 0 ? (
          <p>Nenhuma peça foi posicionada no tabuleiro.</p>
        ) : (
          <>
            <p>Pré-visualização local da jogada que será enviada:</p>
            <pre
              style={{
                background: "#f7f7f7",
                padding: 12,
                borderRadius: 8,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
{JSON.stringify(placedTilesPreview, null, 2)}
            </pre>
          </>
        )}
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Enviar jogada</h2>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onSubmitMove}
            disabled={!canSubmitMove || isSubmittingMove}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            {isSubmittingMove ? "Enviando..." : "Confirmar jogada"}
          </button>

          <span>
            A jogada será enviada usando os dados da partida carregada nesta tela.
          </span>
        </div>

        {showDebug && submitResult ? (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Retorno técnico</h3>
            <pre
              style={{
                background: "#f7f7f7",
                padding: 12,
                borderRadius: 8,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
{JSON.stringify(submitResult, null, 2)}
            </pre>
          </div>
        ) : null}
      </section>
    </>
  );
}
