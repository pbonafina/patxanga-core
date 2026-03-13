import type { MatchBootstrap } from "../../types/match";
import { mockMatchBootstrapService } from "./matchBootstrap.mock";
import type { LoadMatchBootstrapParams } from "./matchBootstrap.types";

export async function loadMatchBootstrap(
  params: LoadMatchBootstrapParams
): Promise<MatchBootstrap> {
  return mockMatchBootstrapService.loadMatchBootstrap(params);
}
