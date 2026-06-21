type PlayerSummary = {
  player_id: string;
  display_name: string;
  score: number;
  seat_index: number;
  turn_order: number;
  has_forfeited: boolean;
  is_bot: boolean;
  bot_level: string | null;
  bot_profile: string | null;
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
                <p><strong>Nome:</strong> {player.display_name}</p>
                <p><strong>Pontuação:</strong> {player.score}</p>
                <p>
                  <strong>Tipo:</strong>{" "}
                  {player.is_bot
                    ? `bot ${player.bot_level ?? "sem nivel"} / ${player.bot_profile ?? "sem perfil"}`
                    : "humano"}
                </p>
                <p><strong>Assento:</strong> {player.seat_index}</p>
                <p><strong>Ordem de turno:</strong> {player.turn_order}</p>
                <p><strong>Desistiu:</strong> {player.has_forfeited ? "sim" : "nao"}</p>
                <p><strong>No turno atual:</strong> {isCurrentTurn ? "sim" : "nao"}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
