import { FormEvent, useMemo, useState } from "react";
import { useMatchBootstrap } from "../hooks/useMatchBootstrap";
import { loadMatchBootstrap } from "../lib/matchBootstrapAdapter";
import type { MatchBootstrap, MatchStatus } from "../types/match";

export default function HomePage() {
  const [matchIdInput, setMatchIdInput] = useState("");
  const [playerIdInput, setPlayerIdInput] = useState("");
  const [bootstrapData, setBootstrapData] = useState<MatchBootstrap | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resolvedBootstrap = useMatchBootstrap(bootstrapData ?? undefined);

  const stateLabel = useMemo(() => {
    switch (resolvedBootstrap.status) {
      case "waiting":
        return "Lobby / waiting";
      case "active":
        return "Partida ativa";
      case "voting":
        return "Fluxo de votação";
      case "finished":
        return "Partida encerrada";
      default:
        return "Estado desconhecido";
    }
  }, [resolvedBootstrap.status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const nextData = await loadMatchBootstrap({
        matchId: matchIdInput,
        playerId: playerIdInput,
      });

      setBootstrapData(nextData);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 840, margin: "0 auto" }}>
      <h1>Patxanga Frontend</h1>
      <p>Bootstrap inicial da match com adapter isolado para futura integração real.</p>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Carregar match</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>match_id</span>
            <input
              value={matchIdInput}
              onChange={(event) => setMatchIdInput(event.target.value)}
              placeholder="ex: match-123, match-v, match-f"
              style={{ padding: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>player_id (opcional neste adapter)</span>
            <input
              value={playerIdInput}
              onChange={(event) => setPlayerIdInput(event.target.value)}
              placeholder="ex: player-abc"
              style={{ padding: 8 }}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: 220, padding: "10px 14px", cursor: "pointer" }}
          >
            {isLoading ? "Carregando..." : "Carregar bootstrap"}
          </button>
        </form>
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Estado resolvido</h2>
        <p><strong>Status:</strong> {stateLabel}</p>
        <p><strong>match_id:</strong> {resolvedBootstrap.matchId || "(vazio)"}</p>
        <p><strong>player_id:</strong> {resolvedBootstrap.playerId || "(nulo)"}</p>
        <p><strong>current_turn_player_id:</strong> {resolvedBootstrap.currentTurnPlayerId || "(nulo)"}</p>
        <p><strong>winner_player_id:</strong> {resolvedBootstrap.winnerPlayerId || "(nulo)"}</p>
        <p><strong>finished_at:</strong> {resolvedBootstrap.finishedAt || "(nulo)"}</p>
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Regras do adapter atual</h2>
        <ul>
          <li>match_id vazio → waiting</li>
          <li>match_id terminando em <code>v</code> → voting</li>
          <li>match_id terminando em <code>f</code> → finished</li>
          <li>qualquer outro valor → active</li>
        </ul>
        <p>O próximo passo é substituir este adapter por carregamento real no backend.</p>
      </section>
    </main>
  );
}
