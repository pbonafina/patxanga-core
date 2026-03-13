import type { MatchBootstrap } from "../../types/match";

export interface LoadMatchBootstrapParams {
  matchId: string;
  playerId?: string;
}

export interface MatchBootstrapService {
  loadMatchBootstrap(params: LoadMatchBootstrapParams): Promise<MatchBootstrap>;
}
