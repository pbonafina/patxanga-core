import type { MatchBootstrap } from "../../types/match";
import { getSupabaseEnv } from "../supabase/env";
import { mockMatchBootstrapService } from "./matchBootstrap.mock";
import { realMatchBootstrapService } from "./matchBootstrap.real";
import type { LoadMatchBootstrapParams } from "./matchBootstrap.types";

export async function loadMatchBootstrap(
  params: LoadMatchBootstrapParams
): Promise<MatchBootstrap> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    return realMatchBootstrapService.loadMatchBootstrap(params);
  }

  return mockMatchBootstrapService.loadMatchBootstrap(params);
}
