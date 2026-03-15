import type {
  AcceptInviteResult,
  DeclineInviteResult,
  ForfeitMatchResult,
  PendingInvite,
  ResumableMatch,
  ResumeMatchResult,
  StartMatchFromLobbyResult,
} from "../../types/match";

export interface ResumeMatchParams {
  matchId: string;
  userId: string;
}

export interface InviteActionParams {
  inviteId: string;
  userId: string;
}

export interface StartMatchFromLobbyParams {
  matchId: string;
  hostPlayerId: string;
}

export interface ForfeitMatchParams {
  matchId: string;
  playerId: string;
}

export interface MatchOperationsService {
  listPendingInvites(userId: string): Promise<PendingInvite[]>;
  listResumableMatches(userId: string): Promise<ResumableMatch[]>;
  acceptInvite(params: InviteActionParams): Promise<AcceptInviteResult>;
  declineInvite(params: InviteActionParams): Promise<DeclineInviteResult>;
  resumeMatch(params: ResumeMatchParams): Promise<ResumeMatchResult>;
  startMatchFromLobby(
    params: StartMatchFromLobbyParams
  ): Promise<StartMatchFromLobbyResult>;
  forfeitMatch(params: ForfeitMatchParams): Promise<ForfeitMatchResult>;
}
