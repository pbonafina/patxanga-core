type RackTile = {
  id?: string;
  letter?: string;
  points?: number;
  is_special?: boolean;
  special_type?: string | null;
};

type RackSectionProps = {
  playerContext: {
    rack_state: unknown[];
  } | null | undefined;
  selectedTileIds: string[];
  showDebug: boolean;
  onToggleTile: (tileId: string) => void;
  onClearPreview: () => void;
};

export function RackSection({
  playerContext,
  selectedTileIds,
  showDebug,
  onToggleTile,
  onClearPreview,
}: RackSectionProps) {
  return (
    <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Rack do jogador resolvido</h2>

      {!playerContext ? (
        <p>player_context ainda nao carregado.</p>
      ) : playerContext.rack_state.length === 0 ? (
        <p>Rack vazio.</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {playerContext.rack_state.map((tile, index) => {
              const typedTile = tile as RackTile;
              const tileId = typedTile.id ?? `tile-${index}`;
              const isSelected = selectedTileIds.includes(tileId);

              return (
                <button
                  key={tileId}
                  type="button"
                  onClick={() => onToggleTile(tileId)}
                  style={{
                    padding: 12,
                    border: isSelected ? "2px solid #2563eb" : "1px solid #bbb",
                    borderRadius: 8,
                    background: isSelected ? "#eef6ff" : "#fafafa",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <p><strong>letter:</strong> <span style={{ fontSize: 20 }}>{typedTile.letter ?? "(nulo)"}</span></p>
                  <p><strong>points:</strong> {typedTile.points ?? 0}</p>
                  {showDebug ? <p><strong>id:</strong> {typedTile.id ?? "(nulo)"}</p> : null}
                  <p><strong>is_special:</strong> {typedTile.is_special ? "true" : "false"}</p>
                  <p><strong>special_type:</strong> {typedTile.special_type ?? "(nulo)"}</p>
                  <p><strong>tipo visual:</strong> {typedTile.is_special ? "peca especial" : "peca normal"}</p>
                  <p><strong>selecionada:</strong> {isSelected ? "sim" : "nao"}</p>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 16, padding: 12, border: "1px dashed #bbb", borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>Preview local de selecao</h3>
            {selectedTileIds.length === 0 ? (
              <p>Nenhuma peça selecionada.</p>
            ) : (
              <ul>
                {selectedTileIds.map((tileId) => (
                  <li key={tileId}>{tileId}</li>
                ))}
              </ul>
            )}
            <p>Este estado ainda é apenas local e não envia jogada ao backend.</p>
            <button
              type="button"
              onClick={onClearPreview}
              style={{ padding: "8px 12px", cursor: "pointer" }}
            >
              Limpar preview local no board
            </button>
          </div>
        </>
      )}
    </section>
  );
}
