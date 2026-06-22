import { useMemo } from "react";
import type { MatchBootstrap } from "../types/match";

export function useMatchBootstrap(initialData?: Partial<MatchBootstrap>) {
  return useMemo<MatchBootstrap>(
    () => ({
      matchId: initialData?.matchId ?? "",
      language: initialData?.language ?? "pt-BR",
      playerId: initialData?.playerId ?? null,
      status: initialData?.status ?? "waiting",
      currentTurnPlayerId: initialData?.currentTurnPlayerId ?? null,
      winnerPlayerId: initialData?.winnerPlayerId ?? null,
      finishedAt: initialData?.finishedAt ?? null,
      startedAt: initialData?.startedAt ?? null,
      turnNumber: initialData?.turnNumber ?? 0,
      boardState: initialData?.boardState ?? [],
      playerContext: initialData?.playerContext ?? null,
      playersSummary: initialData?.playersSummary ?? [],
      endSummary: initialData?.endSummary ?? null,
      dictionarySummary: initialData?.dictionarySummary ?? null,
    }),
    [initialData]
  );
}
