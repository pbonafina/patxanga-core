export type MatchStatus = "waiting" | "active" | "voting" | "finished";

export interface MatchPlayerSummary {
  player_id: string;
  display_name: string;
  score: number;
  seat_index: number;
  turn_order: number;
  has_forfeited: boolean;
}

export interface MatchPlayerContext {
  player_id: string;
  user_id: string | null;
  display_name: string;
  rack_state: unknown[];
  score: number;
  seat_index: number;
  turn_order: number;
  has_forfeited: boolean;
}

export interface MatchBootstrap {
  matchId: string;
  playerId: string | null;
  status: MatchStatus;
  currentTurnPlayerId: string | null;
  winnerPlayerId: string | null;
  finishedAt: string | null;
  startedAt: string | null;
  turnNumber: number;
  boardState: unknown[][];
  playerContext: MatchPlayerContext | null;
  playersSummary: MatchPlayerSummary[];
}

export interface MatchBootstrapInput {
  matchId: string;
  playerId?: string;
}
