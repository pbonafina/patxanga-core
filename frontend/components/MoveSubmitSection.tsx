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
        {showDebug ? <h2>Preview de p_placed_tiles</h2> : <h2 style={{ display: "none" }}>Preview de p_placed_tiles</h2>}

        {placedTilesPreview.length === 0 ? (
          <p>Nenhuma peça posicionada localmente no board.</p>
        ) : (
          <>
            <p>Payload local compatível com o contrato de submit de jogada:</p>
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
        <h2>Submit real de jogada</h2>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onSubmitMove}
            disabled={!canSubmitMove || isSubmittingMove}
            style={{ padding: "10px 14px", cursor: "pointer" }}
          >
            {isSubmittingMove ? "Enviando..." : "Enviar jogada"}
          </button>

          <span>
            Usa <strong>match_id</strong> e <strong>player_id</strong> resolvido do bootstrap oficial.
          </span>
        </div>

        {showDebug && submitResult ? (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Retorno bruto da RPC</h3>
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
