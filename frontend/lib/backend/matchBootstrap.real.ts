import type { MatchBootstrap } from "../../types/match";
import { getSupabaseBrowserClient } from "../supabase/client";
import type {
  LoadMatchBootstrapParams,
  MatchBootstrapService,
} from "./matchBootstrap.types";

interface RpcPlayerSummary {
  player_id: string;
  display_name: string;
  score: number;
  seat_index: number;
  turn_order: number;
  has_forfeited: boolean;
  is_bot: boolean;
  bot_level: string | null;
  bot_profile: string | null;
}

interface RpcPlayerContext {
  player_id: string;
  user_id: string | null;
  display_name: string;
  rack_state: unknown[];
  score: number;
  seat_index: number;
  turn_order: number;
  has_forfeited: boolean;
  is_bot: boolean;
  bot_level: string | null;
  bot_profile: string | null;
}

interface RpcMatchBootstrap {
  match_id: string;
  language?: string;
  status: MatchBootstrap["status"];
  board_state: unknown[][];
  current_turn_player_id: string | null;
  turn_number: number;
  winner_player_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  player_context: RpcPlayerContext | null;
  players_summary: RpcPlayerSummary[];
}

export const realMatchBootstrapService: MatchBootstrapService = {
  async loadMatchBootstrap(
    params: LoadMatchBootstrapParams
  ): Promise<MatchBootstrap> {
    const client = getSupabaseBrowserClient();

    if (!client) {
      throw new Error("Supabase client not configured in frontend environment.");
    }

    const userId = params.playerId?.trim();

    if (!userId) {
      throw new Error("Real bootstrap currently requires user_id informado no campo player_id temporario.");
    }

    const { data, error } = await client.rpc("get_patxanga_match_bootstrap", {
      p_match_id: params.matchId.trim(),
      p_user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }

    const payload = data as RpcMatchBootstrap | null;

    if (!payload) {
      throw new Error("Empty bootstrap payload returned by backend.");
    }

    return {
      matchId: payload.match_id,
      language: payload.language ?? "pt-BR",
      playerId: payload.player_context?.player_id ?? null,
      status: payload.status,
      currentTurnPlayerId: payload.current_turn_player_id,
      winnerPlayerId: payload.winner_player_id,
      finishedAt: payload.finished_at,
      startedAt: payload.started_at,
      turnNumber: payload.turn_number,
      boardState: payload.board_state ?? [],
      playerContext: payload.player_context,
      playersSummary: payload.players_summary ?? [],
    };
  },
};
