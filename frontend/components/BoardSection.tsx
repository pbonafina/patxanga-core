type BoardCell = {
  tile?: {
    letter?: string;
    declared_letter?: string | null;
    special_type?: string | null;
  } | null;
  multiplier_type?: string | null;
} | null;

type RackTile = {
  id?: string;
  letter?: string;
  declared_letter?: string | null;
  special_type?: string | null;
};

function isRackTile(item: unknown): item is RackTile & { id: string } {
  return Boolean(
    item &&
      typeof item === "object" &&
      typeof (item as RackTile).id === "string"
  );
}

function normalizeSpecialType(specialType?: string | null): string {
  return (specialType ?? "").toLowerCase();
}

function requiresDeclaredLetter(specialType?: string | null): boolean {
  return ["wildcard", "skip_turn", "patxanga_real"].includes(
    normalizeSpecialType(specialType)
  );
}

function getBoardSpecialTone(specialType?: string | null) {
  switch (normalizeSpecialType(specialType)) {
    case "skip_turn":
      return {
        cellBackground: "#fef3c7",
        faceBackground: "#fffbeb",
        borderColor: "#f59e0b",
      };
    case "patxanga_real":
      return {
        cellBackground: "#ffe4e6",
        faceBackground: "#fff1f2",
        borderColor: "#fb7185",
      };
    case "wildcard":
      return {
        cellBackground: "#e0f2fe",
        faceBackground: "#f0f9ff",
        borderColor: "#38bdf8",
      };
    default:
      return {
        cellBackground: "#f5f5f4",
        faceBackground: "#fafaf9",
        borderColor: "#d6d3d1",
      };
  }
}

type BoardSectionProps = {
  boardState: unknown[];
  localPlacements: Record<string, string>;
  localDeclaredLetters: Record<string, string>;
  pendingVoteTilesByCell: Record<string, { letter?: string }>;
  selectedTileId: string | null;
  selectedRackSlotId: string | null;
  playerRackState: unknown[];
  rackSlotAssociations: Record<string, string>;
  buildCellKey: (rowIndex: number, colIndex: number) => string;
  renderCellLabel: (cell: BoardCell) => string;
  renderCellBackground: (
    cell: BoardCell,
    rowIndex: number,
    colIndex: number
  ) => string;
  onPlaceTile: (cellKey: string, typedCell: BoardCell) => void;
};

export function BoardSection({
  boardState,
  localPlacements,
  localDeclaredLetters,
  pendingVoteTilesByCell,
  selectedTileId,
  selectedRackSlotId,
  playerRackState,
  rackSlotAssociations,
  buildCellKey,
  renderCellLabel,
  renderCellBackground,
  onPlaceTile,
}: BoardSectionProps) {
  if (boardState.length === 0) {
    return (
      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Tabuleiro</h2>
        <p>Tabuleiro ainda não carregado.</p>
      </section>
    );
  }

  return (
    <section style={{ marginTop: 0, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(15, 38px)",
          gap: 2,
          alignItems: "center",
          justifyContent: "start",
        }}
      >
        {boardState.flatMap((row, rowIndex) =>
          (row as unknown[]).map((cell, colIndex) => {
            const typedCell = cell as BoardCell;
            const cellKey = buildCellKey(rowIndex, colIndex);
            const linkedSlotIds = Object.entries(rackSlotAssociations)
              .filter(([, linkedCellKey]) => linkedCellKey === cellKey)
              .map(([slotId]) => slotId);
            const isActiveSlotTarget =
              Boolean(selectedRackSlotId) &&
              rackSlotAssociations[selectedRackSlotId ?? ""] === cellKey;
            const label = renderCellLabel(typedCell);
            const isCenter = rowIndex === 7 && colIndex === 7;
            const localTileId = localPlacements[cellKey];

            const rackTiles = ((playerRackState ?? []) as unknown[]).filter(isRackTile);
            const localTile = localTileId
              ? rackTiles.find((tile) => tile.id === localTileId)
              : undefined;
            const pendingVoteTile = pendingVoteTilesByCell[cellKey];
            const localSpecialType = normalizeSpecialType(localTile?.special_type);
            const fixedSpecialType = normalizeSpecialType(typedCell?.tile?.special_type);
            const localPreviewLetter =
              requiresDeclaredLetter(localTile?.special_type)
                ? (localDeclaredLetters[cellKey] ?? "?")
                : (localTile?.letter ?? "");
            const hasLocalPreview = Boolean(localTile);
            const hasFixedTile = Boolean(typedCell?.tile?.letter);
            const hasPendingVoteOverlay = Boolean(pendingVoteTile?.letter);
            const hasVisibleTile = hasFixedTile || hasLocalPreview || hasPendingVoteOverlay;
            const fixedTileLetter =
              typedCell?.tile?.declared_letter ?? typedCell?.tile?.letter ?? "";
            const displayLabel = hasLocalPreview
              ? localPreviewLetter
              : hasPendingVoteOverlay
                ? (pendingVoteTile?.letter ?? "")
                : fixedTileLetter || label;
            const specialTone = getBoardSpecialTone(
              hasLocalPreview ? localSpecialType : fixedSpecialType
            );

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-testid={`board-cell-${rowIndex}-${colIndex}`}
                title={`(${rowIndex + 1}, ${colIndex + 1})`}
                onClick={() => onPlaceTile(cellKey, typedCell)}
                style={{
                  width: 38,
                  height: 38,
                  border: hasLocalPreview
                    ? `2px solid ${localSpecialType ? specialTone.borderColor : "#16a34a"}`
                    : hasPendingVoteOverlay
                      ? "2px dashed #b45309"
                      : hasFixedTile
                        ? `1px solid ${fixedSpecialType ? specialTone.borderColor : "#d6d3d1"}`
                      : "1px solid #bbb",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: hasLocalPreview
                    ? (localSpecialType ? specialTone.cellBackground : "#dcfce7")
                    : hasFixedTile
                      ? (fixedSpecialType ? specialTone.cellBackground : "#f5f5f4")
                    : renderCellBackground(typedCell, rowIndex, colIndex),
                  overflow: "hidden",
                  textAlign: "center",
                  padding: 2,
                  boxSizing: "border-box",
                  position: "relative",
                  boxShadow: [
                    isCenter ? "inset 0 0 0 2px #c99a00" : null,
                    linkedSlotIds.length > 0
                      ? `inset 0 0 0 2px ${isActiveSlotTarget ? "#2563eb" : "#c4b5fd"}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(", "),
                  cursor:
                    hasLocalPreview || Boolean(selectedTileId) || Boolean(selectedRackSlotId)
                      ? "pointer"
                      : "default",
                }}
              >
                {linkedSlotIds.length > 0 ? (
                  <div
                    data-testid={`board-cell-${rowIndex}-${colIndex}-slot-badges`}
                    style={{
                      position: "absolute",
                      top: 2,
                      left: 2,
                      display: "flex",
                      gap: 2,
                      zIndex: 1,
                    }}
                  >
                    {linkedSlotIds.map((slotId) => (
                      <span
                        key={slotId}
                        style={{
                          minWidth: 16,
                          padding: "1px 3px",
                          borderRadius: 999,
                          background:
                            selectedRackSlotId === slotId ? "#2563eb" : "rgba(124, 58, 237, 0.88)",
                          color: "#ffffff",
                          fontSize: 8,
                          fontWeight: 800,
                          lineHeight: 1.2,
                        }}
                      >
                        {`S${slotId.split(":").pop() ?? slotId}`}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 3,
                    background: hasVisibleTile
                      ? hasLocalPreview
                        ? (localSpecialType ? specialTone.faceBackground : "#ecfdf5")
                        : hasPendingVoteOverlay
                          ? "#fffbeb"
                          : (fixedSpecialType ? specialTone.faceBackground : "#fafaf9")
                      : "transparent",
                    color: hasVisibleTile ? "#111827" : "#475569",
                    fontSize: hasVisibleTile ? 22 : 10,
                    fontWeight: hasVisibleTile ? 800 : 700,
                    lineHeight: 1,
                    letterSpacing: hasVisibleTile ? 0.2 : 0,
                  }}
                >
                  {displayLabel}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
