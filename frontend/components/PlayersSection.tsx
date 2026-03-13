type PlayerSummary = {
  player_id: string;
  display_name: string;
  score: number;
  seat_index: number;
  turn_order: number;
  has_forfeited: boolean;
};

type PlayersSectionProps = {
  playersSummary: PlayerSummary[];
  currentTurnPlayerId: string | null;
};

export function PlayersSection({
  playersSummary,
  currentTurnPlayerId,
}: PlayersSectionProps) {
  return (
    <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Jogadores</h2>

      {playersSummary.length === 0 ? (
        <p>Nenhum jogador carregado.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {playersSummary.map((player) => {
            const isCurrentTurn = player.player_id === currentTurnPlayerId;

            return (
              <div
                key={player.player_id}
                style={{
                  padding: 12,
                  border: "1px solid #bbb",
                  borderRadius: 8,
                  background: isCurrentTurn ? "#eef6ff" : "#fff",
                }}
              >
                <p><strong>display_name:</strong> {player.display_name}</p>
                <p><strong>player_id:</strong> {player.player_id}</p>
                <p><strong>score:</strong> {player.score}</p>
                <p><strong>seat_index:</strong> {player.seat_index}</p>
                <p><strong>turn_order:</strong> {player.turn_order}</p>
                <p><strong>has_forfeited:</strong> {player.has_forfeited ? "true" : "false"}</p>
                <p><strong>turno atual:</strong> {isCurrentTurn ? "sim" : "nao"}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
