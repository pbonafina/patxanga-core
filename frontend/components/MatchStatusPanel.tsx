type MatchStatusPanelProps = {
  stateLabel: string;
  matchId: string;
  playersCount: number;
  showDebug: boolean;
  playerId: string | null;
  currentTurnPlayerId: string | null;
  winnerPlayerId: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  turnNumber: number;
  onToggleDebug: () => void;
};

export function MatchStatusPanel({
  stateLabel,
  matchId,
  playersCount,
  showDebug,
  playerId,
  currentTurnPlayerId,
  winnerPlayerId,
  startedAt,
  finishedAt,
  turnNumber,
  onToggleDebug,
}: MatchStatusPanelProps) {
  return (
    <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Estado da partida</h2>
      <p><strong>Status:</strong> {stateLabel}</p>
      <p><strong>match_id:</strong> {matchId || "(vazio)"}</p>
      <p><strong>jogadores:</strong> {playersCount}</p>

      <button
        type="button"
        onClick={onToggleDebug}
        style={{ marginTop: 12, padding: "8px 12px", cursor: "pointer" }}
      >
        {showDebug ? "Ocultar detalhes técnicos" : "Mostrar detalhes técnicos"}
      </button>

      {showDebug ? (
        <div style={{ marginTop: 12 }}>
          <p><strong>player_id resolvido:</strong> {playerId || "(nulo)"}</p>
          <p><strong>current_turn_player_id:</strong> {currentTurnPlayerId || "(nulo)"}</p>
          <p><strong>winner_player_id:</strong> {winnerPlayerId || "(nulo)"}</p>
          <p><strong>started_at:</strong> {startedAt || "(nulo)"}</p>
          <p><strong>finished_at:</strong> {finishedAt || "(nulo)"}</p>
          <p><strong>turn_number:</strong> {turnNumber}</p>
        </div>
      ) : null}
    </section>
  );
}
