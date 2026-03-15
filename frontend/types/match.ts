export type MatchStatus =
  | "waiting"
  | "active"
  | "voting"
  | "finished"
  | "cancelled";
export type OperationalMatchStatus = MatchStatus;

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

export interface PendingInvite {
  inviteId: string;
  matchId: string;
  inviteStatus: string;
  createdAt: string;
  expiresAt: string | null;
  lobbyId: string;
  lobbyStatus: string;
  inviteMode: string;
  matchMode: string;
  language: string;
  maxPlayers: number;
  hostUserId: string;
  hostGuestName: string | null;
}

export interface ResumableMatch {
  matchId: string;
  matchStatus: OperationalMatchStatus;
  matchMode: string;
  language: string;
  turnNumber: number;
  currentTurnPlayerId: string | null;
  winnerPlayerId: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  playerId: string;
  displayName: string;
  score: number;
  seatIndex: number;
  turnOrder: number;
  hasForfeited: boolean;
  isOnline: boolean | null;
  lastPingAt: string | null;
}

export interface AcceptInviteResult {
  inviteId: string;
  matchId: string;
  playerId: string;
  inviteStatus: string;
  lobbyStatus: string;
}

export interface DeclineInviteResult {
  inviteId: string;
  matchId: string;
  inviteStatus: string;
}

export interface ResumeMatchResult {
  canResume: boolean;
  reason: string | null;
  matchId: string | null;
  playerId: string | null;
  matchStatus: OperationalMatchStatus | null;
  currentTurnPlayerId: string | null;
}

export interface StartMatchResult {
  status: OperationalMatchStatus;
  matchId: string;
  turnNumber: number;
  remainingTiles: number;
  currentTurnPlayerId: string | null;
}

export interface StartMatchFromLobbyResult {
  lobbyStatus: string;
  matchResult: StartMatchResult;
}

export interface ForfeitMatchResult {
  status: "success" | "cancelled";
  matchStatus: OperationalMatchStatus;
  playerForfeited: string | null;
  nextPlayer: string | null;
  turnNumber: number | null;
  everyoneForfeited: boolean;
}
