import type { MatchBootstrap, MatchStatus } from "../../types/match";
import type {
  LoadMatchBootstrapParams,
  MatchBootstrapService,
} from "./matchBootstrap.types";

function deriveStatus(matchId: string): MatchStatus {
  if (matchId === "") return "waiting";
  if (matchId.endsWith("v")) return "voting";
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
        status === "waiting" || status === "finished" ? null : normalizedPlayerId,
      winnerPlayerId: status === "finished" ? normalizedPlayerId : null,
      finishedAt: status === "finished" ? new Date().toISOString() : null,
    };
  },
};
