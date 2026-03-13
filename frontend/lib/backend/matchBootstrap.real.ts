import type { MatchBootstrap } from "../../types/match";
import { getSupabaseBrowserClient } from "../supabase/client";
import type {
  LoadMatchBootstrapParams,
  MatchBootstrapService,
} from "./matchBootstrap.types";

export const realMatchBootstrapService: MatchBootstrapService = {
  async loadMatchBootstrap(
    params: LoadMatchBootstrapParams
  ): Promise<MatchBootstrap> {
    const client = getSupabaseBrowserClient();

    if (!client) {
      throw new Error("Supabase client not configured in frontend environment.");
    }

    // Placeholder controlado:
    // esta camada existe para substituir o provider mock sem acoplar a pagina
    // diretamente ao cliente. O carregamento real da match sera implementado
    // no proximo bloco.
    return {
      matchId: params.matchId.trim(),
      playerId: params.playerId?.trim() || null,
      status: "waiting",
      currentTurnPlayerId: null,
      winnerPlayerId: null,
      finishedAt: null,
    };
  },
};
