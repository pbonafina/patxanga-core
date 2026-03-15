import type {
  AcceptInviteResult,
  DeclineInviteResult,
  ForfeitMatchResult,
  PendingInvite,
  ResumableMatch,
  ResumeMatchResult,
  StartMatchFromLobbyResult,
} from "../../types/match";
import type {
  ForfeitMatchParams,
  InviteActionParams,
  MatchOperationsService,
  ResumeMatchParams,
  StartMatchFromLobbyParams,
} from "./matchOperations.types";

function nowIso() {
  return new Date().toISOString();
}

export const mockMatchOperationsService: MatchOperationsService = {
  async listPendingInvites(userId: string): Promise<PendingInvite[]> {
    const normalizedUserId = userId.trim();

    if (!normalizedUserId) {
      return [];
    }

    return [
      {
        inviteId: "mock-invite-1",
        matchId: "mock-match-waiting",
        inviteStatus: "pending",
        createdAt: nowIso(),
        expiresAt: null,
        lobbyId: "mock-lobby-1",
        lobbyStatus: "open",
        inviteMode: "direct",
        matchMode: "synchronous",
        language: "pt-BR",
        maxPlayers: 4,
        hostUserId: "mock-host-user",
        hostGuestName: null,
      },
    ];
  },

  async listResumableMatches(userId: string): Promise<ResumableMatch[]> {
    const normalizedUserId = userId.trim();

    if (!normalizedUserId) {
      return [];
    }

    return [
      {
        matchId: "mock-match-active",
        matchStatus: "active",
        matchMode: "synchronous",
        language: "pt-BR",
        turnNumber: 1,
        currentTurnPlayerId: "mock-player-1",
        winnerPlayerId: null,
        createdAt: nowIso(),
        startedAt: nowIso(),
        finishedAt: null,
        playerId: "mock-player-2",
        displayName: "Mock Player",
        score: 0,
        seatIndex: 2,
        turnOrder: 2,
        hasForfeited: false,
        isOnline: true,
        lastPingAt: nowIso(),
      },
    ];
  },

  async acceptInvite(params: InviteActionParams): Promise<AcceptInviteResult> {
    return {
      inviteId: params.inviteId.trim(),
      matchId: "mock-match-waiting",
      playerId: params.userId.trim(),
      inviteStatus: "accepted",
      lobbyStatus: "ready",
    };
  },

  async declineInvite(params: InviteActionParams): Promise<DeclineInviteResult> {
    return {
      inviteId: params.inviteId.trim(),
      matchId: "mock-match-waiting",
      inviteStatus: "declined",
    };
  },

  async resumeMatch(params: ResumeMatchParams): Promise<ResumeMatchResult> {
    return {
      canResume: true,
      reason: null,
      matchId: params.matchId.trim() || null,
      playerId: params.userId.trim() || null,
      matchStatus: "waiting",
      currentTurnPlayerId: null,
    };
  },

  async startMatchFromLobby(
    params: StartMatchFromLobbyParams
  ): Promise<StartMatchFromLobbyResult> {
    return {
      lobbyStatus: "started",
      matchResult: {
        status: "active",
        matchId: params.matchId.trim(),
        turnNumber: 1,
        remainingTiles: 96,
        currentTurnPlayerId: params.hostPlayerId.trim(),
      },
    };
  },

  async forfeitMatch(params: ForfeitMatchParams): Promise<ForfeitMatchResult> {
    return {
      status: "success",
      matchStatus: "active",
      playerForfeited: params.playerId.trim(),
      nextPlayer: null,
      turnNumber: 1,
      everyoneForfeited: false,
    };
  },
};
