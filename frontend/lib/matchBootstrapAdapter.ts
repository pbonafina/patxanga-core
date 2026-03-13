import type { MatchBootstrap, MatchStatus } from "../types/match";

export interface LoadMatchBootstrapInput {
  matchId: string;
  playerId?: string;
}

function deriveStatus(matchId: string): MatchStatus {
  if (matchId === "") return "waiting";
  if (matchId.endsWith("v")) return "voting";
  if (matchId.endsWith("f")) return "finished";
  return "active";
}

export async function loadMatchBootstrap(
  input: LoadMatchBootstrapInput
): Promise<MatchBootstrap> {
  const normalizedMatchId = input.matchId.trim();
  const normalizedPlayerId = input.playerId?.trim() || null;
  const status = deriveStatus(normalizedMatchId);

  return {
    matchId: normalizedMatchId,
    playerId: normalizedPlayerId,
    status,
    currentTurnPlayerId:
      status === "waiting" || status === "finished" ? null : normalizedPlayerId,
    winnerPlayerId: status === "finished" ? normalizedPlayerId : null,
    finishedAt: status === "finished" ? new Date().toISOString() : null,
  };
}
