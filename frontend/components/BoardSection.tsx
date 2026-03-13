type BoardCell = {
  tile?: {
    letter?: string;
  } | null;
  multiplier_type?: string | null;
} | null;

type RackTile = {
  id?: string;
  letter?: string;
};

type BoardSectionProps = {
  boardState: unknown[];
  localPlacements: Record<string, string>;
  pendingVoteTilesByCell: Record<string, { letter?: string }>;
  selectedTileIds: string[];
  playerRackState: unknown[];
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
  pendingVoteTilesByCell,
  selectedTileIds,
  playerRackState,
  buildCellKey,
  renderCellLabel,
  renderCellBackground,
  onPlaceTile,
}: BoardSectionProps) {
  if (boardState.length === 0) {
    return (
      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Board (read-only)</h2>
        <p>Board ainda nao carregado.</p>
      </section>
    );
  }

  return (
    <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Board (read-only)</h2>

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
            const label = renderCellLabel(typedCell);
            const isCenter = rowIndex === 7 && colIndex === 7;
            const localTileId = localPlacements[cellKey];

            const rackTiles = (playerRackState ?? []) as RackTile[];
            const localTile = rackTiles.find((tile) => tile.id === localTileId);
            const pendingVoteTile = pendingVoteTilesByCell[cellKey];
            const hasLocalPreview = Boolean(localTile?.letter);
            const hasPendingVoteOverlay = Boolean(pendingVoteTile?.letter);
            const displayLabel = hasLocalPreview
              ? (localTile?.letter ?? "")
              : hasPendingVoteOverlay
                ? (pendingVoteTile?.letter ?? "")
                : label;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                title={`(${rowIndex + 1}, ${colIndex + 1})`}
                onClick={() => onPlaceTile(cellKey, typedCell)}
                style={{
                  width: 38,
                  height: 38,
                  border: hasLocalPreview
                    ? "2px solid #16a34a"
                    : hasPendingVoteOverlay
                      ? "2px dashed #b45309"
                      : "1px solid #bbb",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  background: hasLocalPreview
                    ? "#dcfce7"
                    : renderCellBackground(typedCell, rowIndex, colIndex),
                  overflow: "hidden",
                  textAlign: "center",
                  padding: 2,
                  boxShadow: isCenter ? "inset 0 0 0 2px #c99a00" : "none",
                  cursor: selectedTileIds.length > 0 ? "pointer" : "default",
                }}
              >
                <div>
                  <div>{displayLabel}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
