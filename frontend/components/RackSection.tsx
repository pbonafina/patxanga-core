import { useEffect, useMemo, useState } from "react";

type RackTile = {
  id?: string;
  letter?: string;
  points?: number;
  is_special?: boolean;
  special_type?: string | null;
};

type RackSlotItem = {
  kind: "slot";
  slotId: string;
  draftLetter?: string;
  assignedTileId?: string;
  assignedTileLetter?: string;
  assignedTilePoints?: number;
  assignedTileIsSpecial?: boolean;
  assignedTileSpecialType?: string | null;
};

type RackSectionProps = {
  rackTiles: unknown[];
  selectedTileIds: string[];
  activeSlotId: string | null;
  slotAssociationLabels: Record<string, string>;
  previewTileIds: string[];
  showDebug: boolean;
  isPlayersTurn: boolean;
  onToggleTile: (tileId: string) => void;
  onToggleSlot: (slotId: string) => void;
  onClearSlotAssignment: (slotId: string) => void;
  onClearPreview: () => void;
  onReorderTile: (draggedItemId: string, dropTargetId: string) => void;
  onChangeSlotDraft: (slotId: string, nextValue: string) => void;
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

function isSlotItem(item: unknown): item is RackSlotItem {
  return Boolean(
    item &&
      typeof item === "object" &&
      (item as RackSlotItem).kind === "slot" &&
      typeof (item as RackSlotItem).slotId === "string"
  );
}

function getSlotShortLabel(slotId: string): string {
  const suffix = slotId.split(":").pop() ?? slotId;
  return `S${suffix}`;
}

function getSlotTestId(slotId: string): string {
  return `rack-slot-${slotId.split(":").pop() ?? slotId}`;
}

function getRackTileFace(tile: RackTile): {
  label: string;
  fontSize: number;
  showPoints: boolean;
} {
  switch ((tile.special_type ?? "").toLowerCase()) {
    case "wildcard":
      return { label: "★", fontSize: 24, showPoints: false };
    case "skip_turn":
      return { label: "PV", fontSize: 18, showPoints: false };
    case "patxanga_real":
      return { label: "PR", fontSize: 18, showPoints: false };
    default:
      return {
        label: tile.letter ?? "",
        fontSize: 24,
        showPoints: (tile.points ?? 0) > 0,
      };
  }
}


function InsertionZone({
  insertIndex,
  onReorderTile,
}: {
  insertIndex: number;
  onReorderTile: (draggedItemId: string, dropTargetId: string) => void;
}) {
  const targetPositionId = `__insert__:${insertIndex}`;

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();
        const draggedItemId = event.dataTransfer.getData("text/plain");
        if (!draggedItemId) {
          return;
        }
        onReorderTile(draggedItemId, targetPositionId);
      }}
      style={{
        width: 12,
        minHeight: 54,
        borderRadius: 999,
        background: "#e5e7eb",
        border: "1px dashed #94a3b8",
        alignSelf: "stretch",
        flex: "0 0 12px",
      }}
      title="Inserir aqui"
    />
  );
}

export function RackSection({
  rackTiles,
  selectedTileIds,
  activeSlotId,
  slotAssociationLabels,
  previewTileIds,
  showDebug,
  isPlayersTurn,
  onToggleTile,
  onToggleSlot,
  onClearSlotAssignment,
  onClearPreview,
  onReorderTile,
  onChangeSlotDraft,
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
  const slotCount = rackTiles.filter((item) => isSlotItem(item)).length;
  const previewTileIdSet = useMemo(() => new Set(previewTileIds), [previewTileIds]);
  const assignedSlotLabelByTileId = useMemo(
    () =>
      Object.fromEntries(
        rackTiles
          .filter((item): item is RackSlotItem => isSlotItem(item) && Boolean(item.assignedTileId))
          .map((item) => [item.assignedTileId as string, getSlotShortLabel(item.slotId)])
      ),
    [rackTiles]
  );

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
              Selecione uma peça e clique no tabuleiro para preparar a jogada.
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
              Use os slots para montar a palavra com calma antes de confirmar.
            </div>
            {selectedCount > 0 ? (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
                {selectedCount} peça{selectedCount === 1 ? "" : "s"} selecionada{selectedCount === 1 ? "" : "s"}
              </div>
            ) : null}
            {slotCount > 0 ? (
              <div style={{ marginTop: 6, fontSize: 13, color: "#7c3aed", fontWeight: 700 }}>
                {slotCount} slot{slotCount === 1 ? "" : "s"} local{slotCount === 1 ? "" : "is"} permanente{slotCount === 1 ? "" : "s"} no rack
              </div>
            ) : null}
            {activeSlotId ? (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
                {getSlotShortLabel(activeSlotId)} selecionado. Clique numa peça para vinculá-la ao slot ou clique no tabuleiro para associar essa composição ao board.
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

      {showDebug ? (
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: "#6b7280", alignSelf: "center" }}>
            A letra digitada no slot continua local por padrão, mas vira `declared_letter`
            oficial quando o slot tiver peça especial vinculada e associação ativa no board.
          </div>
        </div>
      ) : null}

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
              gap: 8,
              flexWrap: "wrap",
              alignItems: "stretch",
              padding: 14,
              borderRadius: 16,
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
            <InsertionZone insertIndex={0} onReorderTile={onReorderTile} />
            {rackTiles.map((tile, index) => {
              if (isSlotItem(tile)) {
                const slotId = tile.slotId;
                const draftLetter = (tile.draftLetter ?? "").toUpperCase();
                const slotTestId = getSlotTestId(slotId);
                const isActiveSlot = activeSlotId === slotId;
                const associationLabel = slotAssociationLabels[slotId] ?? null;
                const assignedTileId = tile.assignedTileId ?? null;
                const assignedTile = assignedTileId
                  ? {
                      id: assignedTileId,
                      letter: tile.assignedTileLetter,
                      points: tile.assignedTilePoints,
                      is_special: tile.assignedTileIsSpecial,
                      special_type: tile.assignedTileSpecialType,
                    }
                  : null;
                const assignedTileFace = assignedTile ? getRackTileFace(assignedTile) : null;
                const requiresDeclaredLetterForAssignedTile = Boolean(
                  assignedTile?.special_type &&
                    ["wildcard", "skip_turn", "patxanga_real"].includes(
                      assignedTile.special_type.toLowerCase()
                    )
                );

                return (
                  <div
                    key={slotId}
                    data-testid={slotTestId}
                    draggable
                    onMouseDown={(event) => {
                      if ((event.target as HTMLElement).tagName !== "INPUT") {
                        onToggleSlot(slotId);
                      }
                    }}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", slotId);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const draggedItemId = event.dataTransfer.getData("text/plain");
                      if (!draggedItemId || draggedItemId === slotId) {
                        return;
                      }
                      onReorderTile(draggedItemId, slotId);
                    }}
                    style={{
                      width: 54,
                      minHeight: 54,
                      padding: 4,
                      border: isActiveSlot
                        ? "2px solid #2563eb"
                        : associationLabel
                          ? "1px solid #7c3aed"
                          : "1px dashed #8b5cf6",
                      borderRadius: 12,
                      background: isActiveSlot ? "#eff6ff" : "#faf5ff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      position: "relative",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  >
                    {assignedTile ? (
                      <button
                        type="button"
                        data-testid={`${slotTestId}-clear-assignment`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onClearSlotAssignment(slotId);
                        }}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 16,
                          height: 16,
                          border: "none",
                          borderRadius: 999,
                          background: "#ddd6fe",
                          color: "#5b21b6",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          lineHeight: 1,
                        }}
                        title="Desvincular peça do slot"
                      >
                        ×
                      </button>
                    ) : null}

                    <div style={{ marginTop: 4, fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "#7c3aed" }}>
                      slot
                    </div>

                    {assignedTile && assignedTileFace ? (
                      <div
                        data-testid={`${slotTestId}-bound-tile`}
                        style={{
                          minWidth: 30,
                          minHeight: 24,
                          padding: "2px 6px",
                          borderRadius: 8,
                          background: "#ffffff",
                          border: "1px solid #c4b5fd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 3,
                        }}
                        title={`Peça vinculada oficialmente a ${getSlotShortLabel(slotId)}`}
                      >
                        <span
                          style={{
                            fontSize: assignedTileFace.fontSize >= 24 ? 18 : 14,
                            fontWeight: 700,
                            color: "#111827",
                            lineHeight: 1,
                          }}
                        >
                          {assignedTileFace.label}
                        </span>
                        {assignedTileFace.showPoints ? (
                          <span
                            style={{
                              fontSize: 9,
                              color: "#4b5563",
                              lineHeight: 1,
                              transform: "translateY(2px)",
                            }}
                          >
                            {assignedTile.points ?? 0}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <input
                      value={draftLetter}
                      onClick={(event) => event.stopPropagation()}
                      onFocus={() => {
                        if (activeSlotId !== slotId) {
                          onToggleSlot(slotId);
                        }
                      }}
                      onChange={(event) => onChangeSlotDraft(slotId, event.target.value)}
                      maxLength={1}
                      placeholder="?"
                      style={{
                        width: 28,
                        border:
                          requiresDeclaredLetterForAssignedTile && associationLabel && !draftLetter
                            ? "1px solid #f59e0b"
                            : "none",
                        borderRadius: 6,
                        background:
                          requiresDeclaredLetterForAssignedTile && associationLabel
                            ? "#fff7ed"
                            : "transparent",
                        textAlign: "center",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#111827",
                        outline: "none",
                        marginBottom: 6,
                      }}
                      title="Letra de rascunho"
                    />

                    {associationLabel ? (
                      <div
                        data-testid={`${slotTestId}-association`}
                        style={{
                          marginBottom: 4,
                          padding: "2px 4px",
                          maxWidth: "100%",
                          borderRadius: 999,
                          background: isActiveSlot ? "#dbeafe" : "#ede9fe",
                          color: isActiveSlot ? "#1d4ed8" : "#6d28d9",
                          fontSize: 9,
                          fontWeight: 700,
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={`Associado localmente a ${associationLabel}`}
                      >
                        {associationLabel}
                      </div>
                    ) : null}
                  </div>
                );
              }

              const typedTile = tile as RackTile;
              const tileId = typedTile.id ?? `tile-${index}`;
              const isSelected = selectedTileIds.includes(tileId);
              const isInPreview = previewTileIdSet.has(tileId);
              const tileFace = getRackTileFace(typedTile);
              const assignedSlotLabel = assignedSlotLabelByTileId[tileId] ?? null;

              return (
                <button
                  key={tileId}
                  type="button"
                  data-testid={`rack-tile-${tileId}`}
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
                    const draggedItemId = event.dataTransfer.getData("text/plain");
                    if (!draggedItemId || draggedItemId === tileId) {
                      return;
                    }
                    onReorderTile(draggedItemId, tileId);
                  }}
                  onClick={() => onToggleTile(tileId)}
                  style={{
                    width: 54,
                    height: 54,
                    padding: 6,
                    border: isSelected
                      ? "2px solid #2563eb"
                      : isInPreview
                        ? "1px solid #94a3b8"
                        : assignedSlotLabel
                          ? "1px solid #c4b5fd"
                          : "1px solid #cbd5e1",
                    borderRadius: 12,
                    background: isSelected
                      ? "#dbeafe"
                      : assignedSlotLabel
                        ? "#f5f3ff"
                      : isInPreview
                        ? "#e5e7eb"
                        : "#fffdf7",
                    textAlign: "center",
                    cursor: "grab",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0,
                    position: "relative",
                    opacity: isInPreview ? 0.42 : 1,
                    boxShadow: isSelected
                      ? "0 8px 18px rgba(37, 99, 235, 0.18)"
                      : isInPreview
                        ? "none"
                        : "0 3px 8px rgba(15, 23, 42, 0.08)",
                  }}
                  title={isInPreview ? "Peça já usada no preview do tabuleiro" : undefined}
                >
                  <div style={{ display: "flex", alignItems: "flex-end", lineHeight: 1 }}>
                    <span
                      style={{
                        fontSize: tileFace.fontSize,
                        fontWeight: 700,
                        color: isInPreview ? "#475569" : "#111827",
                      }}
                    >
                      {tileFace.label}
                    </span>
                    {tileFace.showPoints ? (
                      <span
                        style={{
                          fontSize: 10,
                          opacity: isInPreview ? 0.55 : 0.75,
                          marginLeft: 3,
                          transform: "translateY(2px)",
                          color: isInPreview ? "#64748b" : "#374151",
                        }}
                      >
                        {typedTile.points ?? 0}
                      </span>
                    ) : null}
                  </div>

                  {isInPreview ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 12,
                        background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(148,163,184,0.12) 100%)",
                        pointerEvents: "none",
                      }}
                    />
                  ) : null}

                  {assignedSlotLabel ? (
                    <div
                      data-testid={`rack-tile-${tileId}-slot-assignment`}
                      style={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        padding: "2px 5px",
                        borderRadius: 999,
                        background: "#ede9fe",
                        color: "#6d28d9",
                        fontSize: 9,
                        fontWeight: 800,
                        lineHeight: 1.1,
                      }}
                      title={`Vinculada oficialmente a ${assignedSlotLabel}`}
                    >
                      {assignedSlotLabel}
                    </div>
                  ) : null}

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
            }).flatMap((node, index) => [
              node,
              <InsertionZone key={`insert-${index + 1}`} insertIndex={index + 1} onReorderTile={onReorderTile} />,
            ])}
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {selectedCount > 1
                ? "Arraste qualquer peça destacada para mover o grupo dentro do rack."
                : activeSlotId
                  ? "Clique numa peça para vinculá-la ao slot ativo ou clique no tabuleiro para associar esse slot a uma casa."
                  : "Arraste peças para reorganizar. Clique em peça, slot e tabuleiro para compor uma jogada."}
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
