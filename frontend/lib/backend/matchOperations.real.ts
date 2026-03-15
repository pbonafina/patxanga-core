import type {
  AcceptInviteResult,
  DeclineInviteResult,
  ForfeitMatchResult,
  OperationalMatchStatus,
  PendingInvite,
  ResumableMatch,
  ResumeMatchResult,
  StartMatchFromLobbyResult,
} from "../../types/match";
import { getSupabaseBrowserClient } from "../supabase/client";
import type {
  ForfeitMatchParams,
  InviteActionParams,
  MatchOperationsService,
  ResumeMatchParams,
  StartMatchFromLobbyParams,
} from "./matchOperations.types";

interface RpcPendingInvite {
  invite_id: string;
  match_id: string;
  invite_status: string;
  created_at: string;
  expires_at: string | null;
  lobby_id: string;
  lobby_status: string;
  invite_mode: string;
  match_mode: string;
  language: string;
  max_players: number;
  host_user_id: string;
  host_guest_name: string | null;
}

interface RpcResumableMatch {
  match_id: string;
  match_status: OperationalMatchStatus;
  match_mode: string;
  language: string;
  turn_number: number;
  current_turn_player_id: string | null;
  winner_player_id: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  player_id: string;
  display_name: string;
  score: number;
  seat_index: number;
  turn_order: number;
  has_forfeited: boolean;
  is_online: boolean | null;
  last_ping_at: string | null;
}

interface RpcResumeMatchResult {
  can_resume?: boolean;
  reason?: string;
  match_id?: string;
  player_id?: string;
  match_status?: OperationalMatchStatus;
  current_turn_player_id?: string | null;
}

interface RpcAcceptInviteResult {
  invite_id: string;
  match_id: string;
  player_id: string;
  invite_status: string;
  lobby_status: string;
}

interface RpcDeclineInviteResult {
  invite_id: string;
  match_id: string;
  invite_status: string;
}

interface RpcStartMatchResult {
  status: OperationalMatchStatus;
  match_id: string;
  turn_number: number;
  remaining_tiles: number;
  current_turn_player_id: string | null;
}

interface RpcStartMatchFromLobbyResult {
  lobby_status: string;
  match_result: RpcStartMatchResult;
}

interface RpcForfeitMatchResult {
  status: "success" | "cancelled";
  match_status: OperationalMatchStatus;
  player_forfeited?: string;
  next_player?: string;
  turn_number?: number;
  everyone_forfeited: boolean;
}

function requireClient() {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase client not configured in frontend environment.");
  }

  return client;
}

function mapPendingInvite(invite: RpcPendingInvite): PendingInvite {
  return {
    inviteId: invite.invite_id,
    matchId: invite.match_id,
    inviteStatus: invite.invite_status,
    createdAt: invite.created_at,
    expiresAt: invite.expires_at,
    lobbyId: invite.lobby_id,
    lobbyStatus: invite.lobby_status,
    inviteMode: invite.invite_mode,
    matchMode: invite.match_mode,
    language: invite.language,
    maxPlayers: invite.max_players,
    hostUserId: invite.host_user_id,
    hostGuestName: invite.host_guest_name,
  };
}

function mapAcceptInviteResult(result: RpcAcceptInviteResult): AcceptInviteResult {
  return {
    inviteId: result.invite_id,
    matchId: result.match_id,
    playerId: result.player_id,
    inviteStatus: result.invite_status,
    lobbyStatus: result.lobby_status,
  };
}

function mapDeclineInviteResult(result: RpcDeclineInviteResult): DeclineInviteResult {
  return {
    inviteId: result.invite_id,
    matchId: result.match_id,
    inviteStatus: result.invite_status,
  };
}

function mapResumableMatch(match: RpcResumableMatch): ResumableMatch {
  return {
    matchId: match.match_id,
    matchStatus: match.match_status,
    matchMode: match.match_mode,
    language: match.language,
    turnNumber: match.turn_number,
    currentTurnPlayerId: match.current_turn_player_id,
    winnerPlayerId: match.winner_player_id,
    createdAt: match.created_at,
    startedAt: match.started_at,
    finishedAt: match.finished_at,
    playerId: match.player_id,
    displayName: match.display_name,
    score: match.score,
    seatIndex: match.seat_index,
    turnOrder: match.turn_order,
    hasForfeited: match.has_forfeited,
    isOnline: match.is_online,
    lastPingAt: match.last_ping_at,
  };
}

function mapResumeMatchResult(result: RpcResumeMatchResult): ResumeMatchResult {
  return {
    canResume: Boolean(result.can_resume),
    reason: result.reason ?? null,
    matchId: result.match_id ?? null,
    playerId: result.player_id ?? null,
    matchStatus: result.match_status ?? null,
    currentTurnPlayerId: result.current_turn_player_id ?? null,
  };
}

function mapStartMatchFromLobbyResult(
  result: RpcStartMatchFromLobbyResult
): StartMatchFromLobbyResult {
  return {
    lobbyStatus: result.lobby_status,
    matchResult: {
      status: result.match_result.status,
      matchId: result.match_result.match_id,
      turnNumber: result.match_result.turn_number,
      remainingTiles: result.match_result.remaining_tiles,
      currentTurnPlayerId: result.match_result.current_turn_player_id,
    },
  };
}

function mapForfeitMatchResult(result: RpcForfeitMatchResult): ForfeitMatchResult {
  return {
    status: result.status,
    matchStatus: result.match_status,
    playerForfeited: result.player_forfeited ?? null,
    nextPlayer: result.next_player ?? null,
    turnNumber: result.turn_number ?? null,
    everyoneForfeited: result.everyone_forfeited,
  };
}

export const realMatchOperationsService: MatchOperationsService = {
  async listPendingInvites(userId) {
    const client = requireClient();
    const { data, error } = await client.rpc("list_patxanga_user_pending_invites", {
      p_user_id: userId.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }

    return ((data as RpcPendingInvite[] | null) ?? []).map(mapPendingInvite);
  },

  async listResumableMatches(userId) {
    const client = requireClient();
    const { data, error } = await client.rpc("list_patxanga_user_resumable_matches", {
      p_user_id: userId.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }

    return ((data as RpcResumableMatch[] | null) ?? []).map(mapResumableMatch);
  },

  async acceptInvite(params: InviteActionParams) {
    const client = requireClient();
    const { data, error } = await client.rpc("accept_patxanga_invite", {
      p_invite_id: params.inviteId.trim(),
      p_user_id: params.userId.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Empty accept invite payload returned by backend.");
    }

    return mapAcceptInviteResult(data as RpcAcceptInviteResult);
  },

  async declineInvite(params: InviteActionParams) {
    const client = requireClient();
    const { data, error } = await client.rpc("decline_patxanga_invite", {
      p_invite_id: params.inviteId.trim(),
      p_user_id: params.userId.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Empty decline invite payload returned by backend.");
    }

    return mapDeclineInviteResult(data as RpcDeclineInviteResult);
  },

  async resumeMatch(params: ResumeMatchParams) {
    const client = requireClient();
    const { data, error } = await client.rpc("resume_patxanga_match", {
      p_match_id: params.matchId.trim(),
      p_user_id: params.userId.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }

    return mapResumeMatchResult((data as RpcResumeMatchResult | null) ?? {});
  },

  async startMatchFromLobby(params: StartMatchFromLobbyParams) {
    const client = requireClient();
    const { data, error } = await client.rpc("start_patxanga_match_from_lobby", {
      p_match_id: params.matchId.trim(),
      p_host_player_id: params.hostPlayerId.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Empty start match from lobby payload returned by backend.");
    }

    return mapStartMatchFromLobbyResult(data as RpcStartMatchFromLobbyResult);
  },

  async forfeitMatch(params: ForfeitMatchParams) {
    const client = requireClient();
    const { data, error } = await client.rpc("forfeit_patxanga_match", {
      p_match_id: params.matchId.trim(),
      p_player_id: params.playerId.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Empty forfeit payload returned by backend.");
    }

    return mapForfeitMatchResult(data as RpcForfeitMatchResult);
  },
};
