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
    <section style={{ padding: 0, border: "none", borderRadius: 0 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#6b7280" }}>
          Seu rack
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: "#4b5563" }}>
          Arraste para reorganizar e clique para selecionar uma peça.
        </div>
      </div>

      {rackTiles.length === 0 ? (
        <div
          style={{
            padding: 16,
            border: "1px dashed #d1d5db",
            borderRadius: 14,
            background: "#f9fafb",
            color: "#6b7280",
          }}
        >
          Rack vazio.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "flex-start",
              padding: 14,
              borderRadius: 16,
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
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
                    width: 54,
                    height: 54,
                    padding: 6,
                    border: isSelected ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    borderRadius: 12,
                    background: isSelected ? "#dbeafe" : "#fffdf7",
                    textAlign: "center",
                    cursor: "grab",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0,
                    position: "relative",
                    boxShadow: isSelected ? "0 8px 18px rgba(37, 99, 235, 0.18)" : "0 3px 8px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-end", lineHeight: 1 }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                      {typedTile.letter ?? (typedTile.special_type === "wildcard" ? "★" : "")}
                    </span>
                    <span style={{ fontSize: 10, opacity: 0.75, marginLeft: 3, transform: "translateY(2px)", color: "#374151" }}>
                      {typedTile.points ?? 0}
                    </span>
                  </div>

                  {showDebug ? (
                    <div
                      style={{
                        position: "absolute",
                        top: 60,
                        left: 0,
                        width: 180,
                        padding: 8,
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        background: "#fff",
                        textAlign: "left",
                        zIndex: 2,
                        cursor: "default",
                        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
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

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClearPreview}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#374151",
              }}
            >
              Limpar jogada
            </button>
          </div>
        </>
      )}
    </section>
  );
}
