import { useMemo } from "react";
import type { MatchBootstrap } from "../types/match";

export function useMatchBootstrap(initialData?: Partial<MatchBootstrap>) {
  return useMemo<MatchBootstrap>(
    () => ({
      matchId: initialData?.matchId ?? "",
      playerId: initialData?.playerId ?? null,
      status: initialData?.status ?? "waiting",
      currentTurnPlayerId: initialData?.currentTurnPlayerId ?? null,
      winnerPlayerId: initialData?.winnerPlayerId ?? null,
      finishedAt: initialData?.finishedAt ?? null,
    }),
    [initialData]
  );
}
