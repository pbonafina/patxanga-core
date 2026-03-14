import { useEffect, useMemo, useState } from "react";

type RackTile = {
  id?: string;
  letter?: string;
  points?: number;
  is_special?: boolean;
  special_type?: string | null;
};

type RackGapItem = {
  kind: "gap";
  gapId: string;
  draftLetter?: string;
};

type RackSectionProps = {
  rackTiles: unknown[];
  selectedTileIds: string[];
  showDebug: boolean;
  isPlayersTurn: boolean;
  onToggleTile: (tileId: string) => void;
  onClearPreview: () => void;
  onReorderTile: (draggedTileId: string, targetTileId: string) => void;
  onAddGap: () => void;
  onRemoveGap: (gapId: string) => void;
  onChangeGapDraft: (gapId: string, nextValue: string) => void;
};

const DIGIT_SEGMENTS: Record<string, string[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "e", "c", "d"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
  "-": ["g"],
};

function segmentStyle(name: string, active: boolean, alert: boolean): React.CSSProperties {
  const lit = active
    ? alert
      ? "#f87171"
      : "#fb7185"
    : "rgba(255,255,255,0.08)";

  const common: React.CSSProperties = {
    position: "absolute",
    background: lit,
    borderRadius: 999,
    boxShadow: active ? `0 0 8px ${alert ? "rgba(248, 113, 113, 0.45)" : "rgba(251, 113, 133, 0.35)"}` : "none",
  };

  switch (name) {
    case "a":
      return { ...common, top: 4, left: 8, width: 18, height: 4 };
    case "b":
      return { ...common, top: 8, right: 4, width: 4, height: 16 };
    case "c":
      return { ...common, bottom: 8, right: 4, width: 4, height: 16 };
    case "d":
      return { ...common, bottom: 4, left: 8, width: 18, height: 4 };
    case "e":
      return { ...common, bottom: 8, left: 4, width: 4, height: 16 };
    case "f":
      return { ...common, top: 8, left: 4, width: 4, height: 16 };
    case "g":
      return { ...common, top: 23, left: 8, width: 18, height: 4 };
    default:
      return common;
  }
}

function SevenSegmentDigit({ value, alert }: { value: string; alert: boolean }) {
  const activeSegments = DIGIT_SEGMENTS[value] ?? [];

  return (
    <div
      style={{
        width: 34,
        height: 50,
        position: "relative",
        borderRadius: 8,
        background: alert ? "#2b0b10" : "#111827",
        border: alert ? "1px solid #ef4444" : "1px solid #374151",
        boxShadow: alert
          ? "0 0 18px rgba(239, 68, 68, 0.25)"
          : "inset 0 0 12px rgba(248, 113, 113, 0.08)",
      }}
    >
      {["a", "b", "c", "d", "e", "f", "g"].map((segment) => (
        <div
          key={segment}
          style={segmentStyle(segment, activeSegments.includes(segment), alert)}
        />
      ))}
    </div>
  );
}

function formatCountdown(totalSeconds: number | null) {
  if (totalSeconds === null) {
    return "--:--";
  }

  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function isGapItem(item: unknown): item is RackGapItem {
  return Boolean(
    item &&
      typeof item === "object" &&
      (item as RackGapItem).kind === "gap" &&
      typeof (item as RackGapItem).gapId === "string"
  );
}

export function RackSection({
  rackTiles,
  selectedTileIds,
  showDebug,
  isPlayersTurn,
  onToggleTile,
  onClearPreview,
  onReorderTile,
  onAddGap,
  onRemoveGap,
  onChangeGapDraft,
}: RackSectionProps) {
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [blinkVisible, setBlinkVisible] = useState(true);

  useEffect(() => {
    if (!isPlayersTurn) {
      setCountdownSeconds(null);
      setBlinkVisible(true);
      return;
    }

    setCountdownSeconds(60);
    setBlinkVisible(true);

    const timer = window.setInterval(() => {
      setCountdownSeconds((current) => {
        if (current === null) return 60;
        return Math.max(0, current - 1);
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlayersTurn]);

  useEffect(() => {
    if (!isPlayersTurn || countdownSeconds === null || countdownSeconds > 10) {
      setBlinkVisible(true);
      return;
    }

    const blinker = window.setInterval(() => {
      setBlinkVisible((current) => !current);
    }, 350);

    return () => window.clearInterval(blinker);
  }, [countdownSeconds, isPlayersTurn]);

  const countdown = useMemo(() => formatCountdown(countdownSeconds), [countdownSeconds]);
  const digits = countdown.split("");
  const isAlert = isPlayersTurn && countdownSeconds !== null && countdownSeconds <= 10;
  const selectedCount = selectedTileIds.length;
  const gapCount = rackTiles.filter((item) => isGapItem(item)).length;

  const rackFrameStyle = isPlayersTurn
    ? {
        border: "2px solid #2563eb",
        background: "#eff6ff",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.12)",
      }
    : {
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        boxShadow: "none",
      };

  return (
    <section style={{ padding: 0, border: "none", borderRadius: 0 }}>
      <div
        style={{
          marginBottom: 14,
          padding: 14,
          borderRadius: 16,
          ...rackFrameStyle,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#6b7280" }}>
              Seu rack
            </div>
            <div style={{ marginTop: 6, fontSize: 14, color: "#4b5563" }}>
              {isPlayersTurn
                ? "É sua vez de montar e enviar a jogada."
                : "Você pode reorganizar as peças enquanto aguarda sua vez."}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
              Arraste para reorganizar no rack. Para levar ao tabuleiro, selecione a peça e clique na casa desejada.
            </div>
            {selectedCount > 0 ? (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
                {selectedCount} peça{selectedCount === 1 ? "" : "s"} selecionada{selectedCount === 1 ? "" : "s"}
              </div>
            ) : null}
            {gapCount > 0 ? (
              <div style={{ marginTop: 6, fontSize: 13, color: "#7c3aed", fontWeight: 700 }}>
                {gapCount} lacuna{gapCount === 1 ? "" : "s"} local{gapCount === 1 ? "" : "is"} no rack
              </div>
            ) : null}
          </div>

          <div
            style={{
              opacity: isPlayersTurn ? (isAlert && !blinkVisible ? 0.35 : 1) : 0.55,
              transition: "opacity 0.18s ease",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6b7280", marginBottom: 6, textAlign: "right" }}>
              {isPlayersTurn ? "Tempo do turno" : "Aguardando turno"}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {digits.map((digit, index) =>
                digit === ":" ? (
                  <div
                    key={`sep-${index}`}
                    style={{
                      width: 12,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 999,
                        background: isAlert ? "#f87171" : "#fb7185",
                        opacity: isPlayersTurn ? 1 : 0.4,
                      }}
                    />
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 999,
                        background: isAlert ? "#f87171" : "#fb7185",
                        opacity: isPlayersTurn ? 1 : 0.4,
                      }}
                    />
                  </div>
                ) : (
                  <SevenSegmentDigit key={`digit-${index}`} value={digit} alert={isAlert} />
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onAddGap}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            borderRadius: 10,
            border: "1px solid #c4b5fd",
            background: "#f5f3ff",
            color: "#6d28d9",
            fontWeight: 700,
          }}
        >
          Adicionar lacuna
        </button>

        <div style={{ fontSize: 12, color: "#6b7280", alignSelf: "center" }}>
          A letra digitada na lacuna é só rascunho visual e não altera a jogada real.
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
              if (isGapItem(tile)) {
                const gapId = tile.gapId;
                const draftLetter = (tile.draftLetter ?? "").toUpperCase();

                return (
                  <div
                    key={gapId}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", gapId);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const draggedTileId = event.dataTransfer.getData("text/plain");
                      if (!draggedTileId || draggedTileId === gapId) {
                        return;
                      }
                      onReorderTile(draggedTileId, gapId);
                    }}
                    style={{
                      width: 54,
                      minHeight: 54,
                      padding: 4,
                      border: "1px dashed #8b5cf6",
                      borderRadius: 12,
                      background: "#faf5ff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      position: "relative",
                      boxSizing: "border-box",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onRemoveGap(gapId)}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        width: 20,
                        height: 20,
                        borderRadius: 999,
                        border: "1px solid #d8b4fe",
                        background: "#ffffff",
                        color: "#7c3aed",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        lineHeight: 1,
                      }}
                      title="Remover lacuna"
                    >
                      ×
                    </button>

                    <div style={{ marginTop: 4, fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#7c3aed" }}>
                      slot
                    </div>

                    <input
                      value={draftLetter}
                      onChange={(event) => onChangeGapDraft(gapId, event.target.value)}
                      maxLength={1}
                      placeholder="?"
                      style={{
                        width: 28,
                        border: "none",
                        background: "transparent",
                        textAlign: "center",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#111827",
                        outline: "none",
                        marginBottom: 6,
                      }}
                      title="Letra de rascunho"
                    />
                  </div>
                );
              }

              const typedTile = tile as RackTile;
              const tileId = typedTile.id ?? `tile-${index}`;
              const isSelected = selectedTileIds.includes(tileId);

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

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {selectedCount > 1
                ? "Arraste qualquer peça destacada para mover o grupo dentro do rack."
                : "Selecione peças do rack e clique no tabuleiro para montar a jogada."}
            </div>

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
