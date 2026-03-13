type RackTile = {
  id?: string;
  letter?: string;
  points?: number;
  is_special?: boolean;
  special_type?: string | null;
};

type RackSectionProps = {
  rackTiles: unknown[];
  selectedTileId: string | null;
  showDebug: boolean;
  onToggleTile: (tileId: string) => void;
  onClearPreview: () => void;
  onReorderTile: (draggedTileId: string, targetTileId: string) => void;
};

export function RackSection({
  rackTiles,
  selectedTileId,
  showDebug,
  onToggleTile,
  onClearPreview,
  onReorderTile,
}: RackSectionProps) {
  return (
    <section style={{ marginTop: 24, padding: 0, border: "none", borderRadius: 0 }}>
      {rackTiles.length === 0 ? (
        <p>Rack vazio.</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
            {rackTiles.map((tile, index) => {
              const typedTile = tile as RackTile;
              const tileId = typedTile.id ?? `tile-${index}`;
              const isSelected = selectedTileId === tileId;

              return (
                <button
                  key={tileId}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", tileId);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const draggedTileId = event.dataTransfer.getData("text/plain");
                    if (!draggedTileId || draggedTileId === tileId) {
                      return;
                    }
                    onReorderTile(draggedTileId, tileId);
                  }}
                  onClick={() => onToggleTile(tileId)}
                  style={{
                    width: 50,
                    height: 50,
                    padding: 6,
                    border: isSelected ? "2px solid #2563eb" : "1px solid #bbb",
                    borderRadius: 8,
                    background: isSelected ? "#eef6ff" : "#fafafa",
                    textAlign: "center",
                    cursor: "grab",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0,
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-end", lineHeight: 1 }}>
                    <span style={{ fontSize: 24, fontWeight: 700 }}>
                      {typedTile.letter ?? (typedTile.special_type === "wildcard" ? "★" : "")}
                    </span>
                    <span style={{ fontSize: 10, opacity: 0.8, marginLeft: 3, transform: "translateY(2px)" }}>
                      {typedTile.points ?? 0}
                    </span>
                  </div>

                  {showDebug ? (
                    <div
                      style={{
                        position: "absolute",
                        top: 56,
                        left: 0,
                        width: 160,
                        padding: 8,
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        background: "#fff",
                        textAlign: "left",
                        zIndex: 2,
                        cursor: "default",
                      }}
                    >
                      <p><strong>id:</strong> {typedTile.id ?? "(não disponível)"}</p>
                      <p><strong>is_special:</strong> {typedTile.is_special ? "true" : "false"}</p>
                      <p><strong>special_type:</strong> {typedTile.special_type ?? "(nulo)"}</p>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onClearPreview}
              style={{ padding: "8px 12px", cursor: "pointer" }}
            >
              Limpar jogada
            </button>
          </div>
        </>
      )}
    </section>
  );
}
