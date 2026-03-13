export type MatchStatus = "waiting" | "active" | "voting" | "finished";

export interface MatchBootstrap {
  matchId: string;
  playerId: string | null;
  status: MatchStatus;
  currentTurnPlayerId: string | null;
  winnerPlayerId: string | null;
  finishedAt: string | null;
}
