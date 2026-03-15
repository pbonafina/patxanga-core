import type { MatchBootstrap, MatchStatus } from "../../types/match";
import type {
  LoadMatchBootstrapParams,
  MatchBootstrapService,
} from "./matchBootstrap.types";

function deriveStatus(matchId: string): MatchStatus {
  if (matchId === "") return "waiting";
  if (matchId.endsWith("v")) return "voting";
  if (matchId.endsWith("c")) return "cancelled";
  if (matchId.endsWith("f")) return "finished";
  return "active";
}

export const mockMatchBootstrapService: MatchBootstrapService = {
  async loadMatchBootstrap(
    params: LoadMatchBootstrapParams
  ): Promise<MatchBootstrap> {
    const normalizedMatchId = params.matchId.trim();
    const normalizedPlayerId = params.playerId?.trim() || null;
    const status = deriveStatus(normalizedMatchId);

    return {
      matchId: normalizedMatchId,
      playerId: normalizedPlayerId,
      status,
      currentTurnPlayerId:
        status === "waiting" || status === "finished" || status === "cancelled"
          ? null
          : normalizedPlayerId,
      winnerPlayerId: status === "finished" ? normalizedPlayerId : null,
      finishedAt:
        status === "finished" || status === "cancelled"
          ? new Date().toISOString()
          : null,
      startedAt: status === "waiting" ? null : new Date().toISOString(),
      turnNumber: status === "waiting" ? 0 : 1,
      boardState: [],
      playerContext: normalizedPlayerId
        ? {
            player_id: normalizedPlayerId,
            user_id: normalizedPlayerId,
            display_name: "Mock Player",
            rack_state: [],
            score: 0,
            seat_index: 1,
            turn_order: 1,
            has_forfeited: false,
          }
        : null,
      playersSummary: normalizedPlayerId
        ? [
            {
              player_id: normalizedPlayerId,
              display_name: "Mock Player",
              score: 0,
              seat_index: 1,
              turn_order: 1,
              has_forfeited: false,
            },
          ]
        : [],
    };
  },
};
