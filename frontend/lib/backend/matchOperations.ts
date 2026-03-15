import { getSupabaseEnv } from "../supabase/env";
import { mockMatchOperationsService } from "./matchOperations.mock";
import { realMatchOperationsService } from "./matchOperations.real";
import type {
  ForfeitMatchParams,
  InviteActionParams,
  ResumeMatchParams,
  StartMatchFromLobbyParams,
} from "./matchOperations.types";

function getService() {
  const { isConfigured } = getSupabaseEnv();
  return isConfigured ? realMatchOperationsService : mockMatchOperationsService;
}

export async function listPendingInvites(userId: string) {
  return getService().listPendingInvites(userId);
}

export async function listResumableMatches(userId: string) {
  return getService().listResumableMatches(userId);
}

export async function acceptInvite(params: InviteActionParams) {
  return getService().acceptInvite(params);
}

export async function declineInvite(params: InviteActionParams) {
  return getService().declineInvite(params);
}

export async function resumeMatch(params: ResumeMatchParams) {
  return getService().resumeMatch(params);
}

export async function startMatchFromLobby(params: StartMatchFromLobbyParams) {
  return getService().startMatchFromLobby(params);
}

export async function forfeitMatch(params: ForfeitMatchParams) {
  return getService().forfeitMatch(params);
}
