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
  selectedTileId: string | null;
  showDebug: boolean;
  onToggleTile: (tileId: string) => void;
  onClearPreview: () => void;
};

export function RackSection({
  playerContext,
  selectedTileId,
  showDebug,
  onToggleTile,
  onClearPreview,
}: RackSectionProps) {
  return (
    <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Rack do jogador</h2>

      {!playerContext ? (
        <p>Contexto do jogador ainda não carregado.</p>
      ) : playerContext.rack_state.length === 0 ? (
        <p>Rack vazio.</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {playerContext.rack_state.map((tile, index) => {
              const typedTile = tile as RackTile;
              const tileId = typedTile.id ?? `tile-${index}`;
              const isSelected = selectedTileId === tileId;

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
                  <p>
                    <strong>Peça:</strong>{" "}
                    <span style={{ fontSize: 20 }}>
                      {typedTile.letter ?? (typedTile.special_type === "wildcard" ? "★" : "(vazio)")}
                    </span>
                  </p>
                  <p><strong>Pontos:</strong> {typedTile.points ?? 0}</p>
                  <p><strong>Selecionada:</strong> {isSelected ? "sim" : "não"}</p>

                  {typedTile.special_type === "wildcard" ? (
                    <p><strong>Tipo:</strong> coringa sem letra fixa</p>
                  ) : null}

                  {showDebug ? (
                    <>
                      <p><strong>id:</strong> {typedTile.id ?? "(não disponível)"}</p>
                      <p><strong>is_special:</strong> {typedTile.is_special ? "true" : "false"}</p>
                      <p><strong>special_type:</strong> {typedTile.special_type ?? "(nulo)"}</p>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 16, padding: 12, border: "1px dashed #bbb", borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>Seleção atual</h3>
            {selectedTileId ? (
              <p>Há uma peça ativa pronta para posicionar no tabuleiro.</p>
            ) : (
              <p>Nenhuma peça selecionada.</p>
            )}
            <p>Para remover uma peça já posicionada localmente, clique nela no tabuleiro.</p>
            <button
              type="button"
              onClick={onClearPreview}
              style={{ padding: "8px 12px", cursor: "pointer" }}
            >
              Limpar jogada local
            </button>
          </div>
        </>
      )}
    </section>
  );
}
