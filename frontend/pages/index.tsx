import { FormEvent, useMemo, useState } from "react";
import { useMatchBootstrap } from "../hooks/useMatchBootstrap";
import { loadMatchBootstrap } from "../lib/backend/loadMatchBootstrap";
import { getSupabaseEnv } from "../lib/supabase/env";
import type { MatchBootstrap } from "../types/match";

export default function HomePage() {
  const [matchIdInput, setMatchIdInput] = useState("");
  const [playerIdInput, setPlayerIdInput] = useState("");
  const [bootstrapData, setBootstrapData] = useState<MatchBootstrap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resolvedBootstrap = useMatchBootstrap(bootstrapData ?? undefined);
  const { isConfigured } = getSupabaseEnv();

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
    setErrorMessage(null);

    try {
      const nextData = await loadMatchBootstrap({
        matchId: matchIdInput,
        playerId: playerIdInput,
      });

      setBootstrapData(nextData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao carregar bootstrap da match."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 840, margin: "0 auto" }}>
      <h1>Patxanga Frontend</h1>
      <p>Bootstrap inicial da match com camada de serviço preparada para backend real.</p>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Ambiente</h2>
        <p>
          <strong>Modo atual:</strong> {isConfigured ? "provider real habilitado" : "fallback mock ativo"}
        </p>
        <p>
          Para ativar o provider real, preencher <code>frontend/.env.local</code> com
          <code> NEXT_PUBLIC_SUPABASE_URL </code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </p>
      </section>

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
            <span>player_id (opcional neste estágio)</span>
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

        {errorMessage ? (
          <p style={{ marginTop: 12, color: "#b00020" }}>
            <strong>Erro:</strong> {errorMessage}
          </p>
        ) : null}
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
    </main>
  );
}
