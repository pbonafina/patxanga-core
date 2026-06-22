import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMatchBootstrap } from "../hooks/useMatchBootstrap";
import { loadMatchBootstrap } from "../lib/backend/loadMatchBootstrap";
import {
  acceptInvite,
  declineInvite,
  forfeitMatch,
  listPendingInvites,
  listResumableMatches,
  resumeMatch,
  startMatchFromLobby,
} from "../lib/backend/matchOperations";
import { getSupabaseEnv } from "../lib/supabase/env";
import type { MatchBootstrap, PendingInvite, ResumableMatch } from "../types/match";
import { BoardSection } from "../components/BoardSection";
import { RackSection } from "../components/RackSection";
import { PlayersSection } from "../components/PlayersSection";
import { MatchStatusPanel } from "../components/MatchStatusPanel";
import { MoveSubmitSection } from "../components/MoveSubmitSection";
import { GamePlayScreen } from "../components/GamePlayScreen";
import type { MovePreviewResult } from "../types/movePreview";

type BoardCell = {
  tile?: {
    letter?: string;
    declared_letter?: string | null;
    special_type?: string | null;
  } | null;
  multiplier_type?: string | null;
} | null;

type RackCompositionItem =
  | { kind: "tile"; tileId: string }
  | { kind: "slot"; slotId: string };

type MoveCompositionSource = "board" | "slot";

type MoveCompositionPlacement = {
  cellKey: string;
  tileId: string;
  declaredLetter: string | null;
  source: MoveCompositionSource;
  slotId?: string;
};

type RackTileState = {
  id?: string;
  letter?: string;
  points?: number;
  is_special?: boolean;
  special_type?: string | null;
};

type SessionRole = "host" | "guest";

type SessionSwitchDraft = {
  matchId: string;
  hostUserId: string;
  guestUserId: string;
};

type BrowserValidationScenarioKey =
  | "acceptStartResumeForfeit"
  | "declineInvite";

type BrowserValidationScenario = {
  key: BrowserValidationScenarioKey;
  title: string;
  objective: string;
  matchId: string;
  hostUserId: string;
  guestUserId: string;
  inviteId: string;
  hostPlayerId: string;
};

type RpcCreateMatchLobbyResult = {
  match_id: string;
  lobby_id: string;
  host_player_id: string;
  status: string;
  invite_mode: string;
};

type RpcInvitePlayerResult = {
  invite_id: string;
  match_id: string;
  invited_user_id: string;
  status: string;
};

type RpcEasyBotTurnResult = {
  bot_action?: "place_word" | "pass";
  main_word?: string | null;
  pass_reason?: string | null;
  status?: string;
};

type RpcVoteResult = {
  status?: string;
};

const DEFAULT_RACK_SLOT_IDS = ["__slot__:1", "__slot__:2", "__slot__:3"] as const;
const INSERTION_TARGET_PREFIX = "__insert__:";
const DECLARED_LETTER_SPECIAL_TYPES = new Set([
  "wildcard",
  "skip_turn",
  "patxanga_real",
]);

function normalizeSpecialType(specialType?: string | null): string {
  return (specialType ?? "").toLowerCase();
}

function requiresDeclaredLetter(specialType?: string | null): boolean {
  return DECLARED_LETTER_SPECIAL_TYPES.has(normalizeSpecialType(specialType));
}

function formatVoteResolutionMessage(voteResult: unknown): string | null {
  if (!voteResult || typeof voteResult !== "object") {
    return null;
  }

  const status = (voteResult as RpcVoteResult).status;

  if (status === "accepted") {
    return "Palavra aceita. O tabuleiro oficial foi atualizado.";
  }

  if (status === "rejected") {
    return "Palavra rejeitada. O turno voltou ao autor.";
  }

  if (status === "pending_vote") {
    return "Voto registrado. Aguardando outros votos.";
  }

  return null;
}

function getDeclaredLetterPromptLabel(specialType?: string | null): string {
  switch (normalizeSpecialType(specialType)) {
    case "skip_turn":
      return "A peça PV deve representar qual letra?";
    case "patxanga_real":
      return "A peça PR deve representar qual letra?";
    default:
      return "Qual letra esta peca especial deve representar?";
  }
}

function buildInitialRackComposition(tileIds: string[]): RackCompositionItem[] {
  return [
    ...tileIds.map((tileId) => ({ kind: "tile" as const, tileId })),
    ...DEFAULT_RACK_SLOT_IDS.map((slotId) => ({ kind: "slot" as const, slotId })),
  ];
}

function buildInitialRackSlotDrafts(): Record<string, string> {
  return DEFAULT_RACK_SLOT_IDS.reduce<Record<string, string>>((drafts, slotId) => {
    drafts[slotId] = "";
    return drafts;
  }, {});
}

function getRackCompositionItemId(item: RackCompositionItem): string {
  return item.kind === "tile" ? item.tileId : item.slotId;
}

function parseInsertionIndex(dropTargetId: string): number | null {
  if (!dropTargetId.startsWith(INSERTION_TARGET_PREFIX)) {
    return null;
  }

  const insertIndex = Number(dropTargetId.slice(INSERTION_TARGET_PREFIX.length));
  if (!Number.isInteger(insertIndex)) {
    return null;
  }

  return insertIndex;
}

function countRemovedItemsBeforeIndex(
  current: RackCompositionItem[],
  insertIndex: number,
  removedItemIds: Set<string>
): number {
  return current
    .slice(0, insertIndex)
    .filter((item) => removedItemIds.has(getRackCompositionItemId(item))).length;
}

function reorderRackComposition(
  current: RackCompositionItem[],
  draggedItemId: string,
  dropTargetId: string,
  selectedTileIds: string[]
): RackCompositionItem[] {
  const insertIndex = parseInsertionIndex(dropTargetId);

  if (insertIndex !== null) {
    const selectedSet = new Set(selectedTileIds);
    const shouldMoveGroup =
      selectedTileIds.length > 1 &&
      selectedSet.has(draggedItemId);

    if (shouldMoveGroup) {
      const groupItemIds = new Set(selectedTileIds);
      const group = current.filter(
        (item) => item.kind === "tile" && groupItemIds.has(item.tileId)
      );
      const rest = current.filter(
        (item) => !(item.kind === "tile" && groupItemIds.has(item.tileId))
      );
      const removedBeforeInsert = countRemovedItemsBeforeIndex(
        current,
        insertIndex,
        groupItemIds
      );
      const adjustedIndex = insertIndex - removedBeforeInsert;
      const boundedIndex = Math.max(0, Math.min(adjustedIndex, rest.length));

      return [
        ...rest.slice(0, boundedIndex),
        ...group,
        ...rest.slice(boundedIndex),
      ];
    }

    const draggedIndex = current.findIndex(
      (item) => getRackCompositionItemId(item) === draggedItemId
    );

    if (draggedIndex === -1) {
      return current;
    }

    const next = [...current];
    const [dragged] = next.splice(draggedIndex, 1);
    const adjustedIndex = draggedIndex < insertIndex ? insertIndex - 1 : insertIndex;
    const boundedIndex = Math.max(0, Math.min(adjustedIndex, next.length));
    next.splice(boundedIndex, 0, dragged);
    return next;
  }

  if (selectedTileIds.length > 1 && selectedTileIds.includes(draggedItemId)) {
    const selectedSet = new Set(selectedTileIds);
    const group = current.filter(
      (item) => item.kind === "tile" && selectedSet.has(item.tileId)
    );
    const rest = current.filter(
      (item) => !(item.kind === "tile" && selectedSet.has(item.tileId))
    );
    const targetIndex = rest.findIndex(
      (item) => getRackCompositionItemId(item) === dropTargetId
    );

    if (group.length === 0 || targetIndex === -1) {
      return current;
    }

    return [
      ...rest.slice(0, targetIndex),
      ...group,
      ...rest.slice(targetIndex),
    ];
  }

  const draggedIndex = current.findIndex(
    (item) => getRackCompositionItemId(item) === draggedItemId
  );
  const targetIndex = current.findIndex(
    (item) => getRackCompositionItemId(item) === dropTargetId
  );

  if (
    draggedIndex === -1 ||
    targetIndex === -1 ||
    draggedIndex === targetIndex
  ) {
    return current;
  }

  const draggedItem = current[draggedIndex];
  const targetItem = current[targetIndex];

  if (draggedItem.kind === targetItem.kind) {
    return current;
  }

  const next = [...current];
  next[draggedIndex] = targetItem;
  next[targetIndex] = draggedItem;
  return next;
}

function renderCellLabel(cell: BoardCell): string {
  if (!cell) return "";
  if (cell.tile?.declared_letter) return cell.tile.declared_letter;
  if (cell.tile?.letter) return cell.tile.letter;
  const multiplier = cell.multiplier_type ?? "";
  return multiplier === "NM" ? "" : multiplier;
}

function buildCellKey(rowIndex: number, colIndex: number): string {
  return `${rowIndex}-${colIndex}`;
}

function parseCellKey(cellKey: string): { rowIndex: number; colIndex: number } | null {
  const [rowIndexText, colIndexText] = cellKey.split("-");
  const rowIndex = Number(rowIndexText);
  const colIndex = Number(colIndexText);

  if (!Number.isInteger(rowIndex) || !Number.isInteger(colIndex)) {
    return null;
  }

  return { rowIndex, colIndex };
}

function formatBoardCoordinates(cellKey: string): string {
  const parsed = parseCellKey(cellKey);

  if (!parsed) {
    return cellKey;
  }

  return `${parsed.rowIndex + 1},${parsed.colIndex + 1}`;
}

function sortCellKeys(left: string, right: string): number {
  const leftParsed = parseCellKey(left);
  const rightParsed = parseCellKey(right);

  if (!leftParsed || !rightParsed) {
    return left.localeCompare(right);
  }

  if (leftParsed.rowIndex !== rightParsed.rowIndex) {
    return leftParsed.rowIndex - rightParsed.rowIndex;
  }

  return leftParsed.colIndex - rightParsed.colIndex;
}

function removeTileFromPlacements(
  placements: Record<string, string>,
  tileId: string
): {
  nextPlacements: Record<string, string>;
  removedCellKeys: string[];
} {
  const nextPlacements: Record<string, string> = {};
  const removedCellKeys: string[] = [];

  for (const [cellKey, placedTileId] of Object.entries(placements)) {
    if (placedTileId === tileId) {
      removedCellKeys.push(cellKey);
      continue;
    }

    nextPlacements[cellKey] = placedTileId;
  }

  return {
    nextPlacements,
    removedCellKeys,
  };
}

function removeDeclaredLettersForCellKeys(
  declaredLetters: Record<string, string>,
  cellKeys: string[]
): Record<string, string> {
  if (cellKeys.length === 0) {
    return declaredLetters;
  }

  const next = { ...declaredLetters };
  for (const cellKey of cellKeys) {
    delete next[cellKey];
  }
  return next;
}

function removeTileFromSlotAssignments(
  slotAssignments: Record<string, string>,
  tileId: string
): Record<string, string> {
  const next = { ...slotAssignments };

  for (const [slotId, assignedTileId] of Object.entries(slotAssignments)) {
    if (assignedTileId === tileId) {
      delete next[slotId];
    }
  }

  return next;
}

function getBoardAssociationLabel(cellKey: string, boardState: unknown[]): string {
  const parsed = parseCellKey(cellKey);

  if (!parsed) {
    return cellKey;
  }

  const row = boardState[parsed.rowIndex] as unknown[] | undefined;
  const cell = row?.[parsed.colIndex] as BoardCell | undefined;
  const boardLetter = cell?.tile?.declared_letter ?? cell?.tile?.letter ?? "";
  const coordinates = formatBoardCoordinates(cellKey);

  return boardLetter ? `${boardLetter} · ${coordinates}` : coordinates;
}

function renderCellBackground(cell: BoardCell, rowIndex: number, colIndex: number): string {
  if (!cell) return "#ffffff";
  if (cell.tile?.letter) return "#f3f4f6";

  if (rowIndex === 7 && colIndex === 7) {
    return "#fff4cc";
  }

  switch (cell.multiplier_type) {
    case "PT":
      return "#ffd6d6";
    case "PD":
      return "#ffe9c7";
    case "LT":
      return "#d9ecff";
    case "LD":
      return "#e8ddff";
    default:
      return "#ffffff";
  }
}

export default function HomePage() {
  const [matchIdInput, setMatchIdInput] = useState("");
  const [playerIdInput, setPlayerIdInput] = useState("");
  const [bootstrapData, setBootstrapData] = useState<MatchBootstrap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<unknown | null>(null);
  const [pendingVoteError, setPendingVoteError] = useState<string | null>(null);
  const [voteResult, setVoteResult] = useState<unknown | null>(null);
  const [voteResolutionMessage, setVoteResolutionMessage] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [pendingVoteContext, setPendingVoteContext] = useState<unknown | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [selectedRackSlotId, setSelectedRackSlotId] = useState<string | null>(null);
  const [localPlacements, setLocalPlacements] = useState<Record<string, string>>({});
  const [localDeclaredLetters, setLocalDeclaredLetters] = useState<Record<string, string>>({});
  const [localRackComposition, setLocalRackComposition] = useState<RackCompositionItem[]>([]);
  const [localRackSlotDrafts, setLocalRackSlotDrafts] = useState<Record<string, string>>({});
  const [localRackSlotTileAssignments, setLocalRackSlotTileAssignments] = useState<
    Record<string, string>
  >({});
  const [localRackSlotAssociations, setLocalRackSlotAssociations] = useState<
    Record<string, string>
  >({});
  const [showDebug, setShowDebug] = useState(false);
  const [quickMatchSession, setQuickMatchSession] = useState<{
    matchId: string;
    hostUserId: string;
    guestUserId: string;
    opponentIsBot: boolean;
  } | null>(null);
  const [browserValidationScenarios, setBrowserValidationScenarios] = useState<
    BrowserValidationScenario[]
  >([]);
  const [isGeneratingBrowserValidationScenarios, setIsGeneratingBrowserValidationScenarios] =
    useState(false);
  const [browserValidationScenariosError, setBrowserValidationScenariosError] =
    useState<string | null>(null);
  const [sessionSwitchDraft, setSessionSwitchDraft] = useState<SessionSwitchDraft>({
    matchId: "",
    hostUserId: "",
    guestUserId: "",
  });
  const [sessionSwitchError, setSessionSwitchError] = useState<string | null>(null);
  const [isCreatingQuickMatch, setIsCreatingQuickMatch] = useState(false);
  const [quickMatchError, setQuickMatchError] = useState<string | null>(null);
  const [movePreview, setMovePreview] = useState<MovePreviewResult | null>(null);
  const [isLoadingMovePreview, setIsLoadingMovePreview] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [resumableMatches, setResumableMatches] = useState<ResumableMatch[]>([]);
  const [isLoadingSessionLists, setIsLoadingSessionLists] = useState(false);
  const [sessionListsLoaded, setSessionListsLoaded] = useState(false);
  const [sessionListsError, setSessionListsError] = useState<string | null>(null);
  const [sessionActionMessage, setSessionActionMessage] = useState<string | null>(null);
  const [inviteActionInFlightId, setInviteActionInFlightId] = useState<string | null>(null);
  const [isStartingCurrentLobby, setIsStartingCurrentLobby] = useState(false);
  const [isForfeitingCurrentMatch, setIsForfeitingCurrentMatch] = useState(false);
  const [isCreatingBotMatch, setIsCreatingBotMatch] = useState(false);
  const [isAutoPlayingBotTurn, setIsAutoPlayingBotTurn] = useState(false);
  const [botActionMessage, setBotActionMessage] = useState<string | null>(null);
  const [botActionError, setBotActionError] = useState<string | null>(null);
  const botAutoActionKeyRef = useRef<string | null>(null);
  const botAutoActionInFlightRef = useRef(false);

  const resolvedBootstrap = useMatchBootstrap(bootstrapData ?? undefined);
  const { isConfigured } = getSupabaseEnv();

  const isWaiting = resolvedBootstrap.status === "waiting";
  const isActive = resolvedBootstrap.status === "active";
  const isVoting = resolvedBootstrap.status === "voting";
  const isCancelled = resolvedBootstrap.status === "cancelled";
  const isFinished = resolvedBootstrap.status === "finished" || isCancelled;

  const stateLabel = useMemo(() => {
    switch (resolvedBootstrap.status) {
      case "waiting":
        return "Lobby / waiting";
      case "active":
        return "Partida ativa";
      case "voting":
        return "Fluxo de votação";
      case "finished":
        return "Partida encerrada";
      case "cancelled":
        return "Partida cancelada";
      default:
        return "Estado desconhecido";
    }
  }, [resolvedBootstrap.status]);

  const currentTurnPlayerSummary = useMemo(
    () =>
      resolvedBootstrap.playersSummary.find(
        (player) => player.player_id === resolvedBootstrap.currentTurnPlayerId
      ) ?? null,
    [resolvedBootstrap.currentTurnPlayerId, resolvedBootstrap.playersSummary]
  );

  const isCurrentTurnBot = Boolean(currentTurnPlayerSummary?.is_bot);

  const activeSessionRole = useMemo<SessionRole | null>(() => {
    const normalizedMatchId = matchIdInput.trim();
    const normalizedUserId = playerIdInput.trim();

    if (!normalizedMatchId || normalizedMatchId !== sessionSwitchDraft.matchId.trim()) {
      return null;
    }

    if (normalizedUserId && normalizedUserId === sessionSwitchDraft.hostUserId.trim()) {
      return "host";
    }

    if (normalizedUserId && normalizedUserId === sessionSwitchDraft.guestUserId.trim()) {
      return "guest";
    }

    return null;
  }, [matchIdInput, playerIdInput, sessionSwitchDraft]);

  const rackTilesById = useMemo(() => {
    const rackState = (resolvedBootstrap.playerContext?.rack_state ?? []) as RackTileState[];

    return new Map(
      rackState
        .filter((tile) => tile.id)
        .map((tile) => [tile.id as string, tile])
    );
  }, [resolvedBootstrap.playerContext]);

  const moveCompositionPlacements = useMemo(() => {
    if (!resolvedBootstrap.playerContext) {
      return [] as MoveCompositionPlacement[];
    }

    const placements: MoveCompositionPlacement[] = [];
    const usedTileIds = new Set<string>();
    const usedCellKeys = new Set<string>();

    for (const cellKey of Object.keys(localPlacements).sort(sortCellKeys)) {
      const tileId = localPlacements[cellKey];
      const tile = rackTilesById.get(tileId);

      if (!tile?.id || usedTileIds.has(tileId) || usedCellKeys.has(cellKey)) {
        continue;
      }

      placements.push({
        cellKey,
        tileId,
        declaredLetter: requiresDeclaredLetter(tile.special_type)
          ? (localDeclaredLetters[cellKey] ?? null)
          : null,
        source: "board",
      });
      usedTileIds.add(tileId);
      usedCellKeys.add(cellKey);
    }

    for (const slotId of DEFAULT_RACK_SLOT_IDS) {
      const cellKey = localRackSlotAssociations[slotId];
      const tileId = localRackSlotTileAssignments[slotId];

      if (!cellKey || !tileId || usedTileIds.has(tileId) || usedCellKeys.has(cellKey)) {
        continue;
      }

      const tile = rackTilesById.get(tileId);
      if (!tile?.id) {
        continue;
      }

      placements.push({
        cellKey,
        tileId,
        declaredLetter: requiresDeclaredLetter(tile.special_type)
          ? (localRackSlotDrafts[slotId] ?? null)
          : null,
        source: "slot",
        slotId,
      });
      usedTileIds.add(tileId);
      usedCellKeys.add(cellKey);
    }

    return placements.sort((left, right) => sortCellKeys(left.cellKey, right.cellKey));
  }, [
    localDeclaredLetters,
    localPlacements,
    localRackSlotAssociations,
    localRackSlotDrafts,
    localRackSlotTileAssignments,
    rackTilesById,
    resolvedBootstrap.playerContext,
  ]);

  const placedTilesPreview = useMemo(() => {
    return moveCompositionPlacements
      .map(({ cellKey, tileId, declaredLetter }) => {
        const parsed = parseCellKey(cellKey);
        const tile = rackTilesById.get(tileId);

        if (!parsed || !tile?.id) {
          return null;
        }

        return {
          tile_id: tile.id,
          row: parsed.rowIndex + 1,
          col: parsed.colIndex + 1,
          declared_letter: declaredLetter,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [moveCompositionPlacements, rackTilesById]);

  const previewTileIds = useMemo(
    () => moveCompositionPlacements.map((placement) => placement.tileId),
    [moveCompositionPlacements]
  );

  const compositionPlacementsByCell = useMemo(
    () =>
      Object.fromEntries(
        moveCompositionPlacements.map((placement) => [
          placement.cellKey,
          {
            tileId: placement.tileId,
            declaredLetter: placement.declaredLetter,
            source: placement.source,
            slotId: placement.slotId,
          },
        ])
      ),
    [moveCompositionPlacements]
  );

  const rackSlotAssociationLabels = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(localRackSlotAssociations).map(([slotId, cellKey]) => [
          slotId,
          getBoardAssociationLabel(cellKey, resolvedBootstrap.boardState),
        ])
      ),
    [localRackSlotAssociations, resolvedBootstrap.boardState]
  );


  const pendingVoteMove = useMemo(() => {
    const context = pendingVoteContext as
      | {
          pending_move?: {
            move_id?: string;
            player_id?: string;
            board_diff?: Array<{
              row?: number;
              col?: number;
              letter?: string;
            }>;
            author_display_name?: string;
            main_word?: string;
          } | null;
        }
      | null;

    return context?.pending_move ?? null;
  }, [pendingVoteContext]);

  const pendingVoteRequestPlayer = useMemo(() => {
    const context = pendingVoteContext as
      | {
          request_player?: {
            player_id?: string;
            user_id?: string;
            display_name?: string;
          } | null;
        }
      | null;

    return context?.request_player ?? null;
  }, [pendingVoteContext]);

  const canCurrentViewerVote = useMemo(() => {
    if (!pendingVoteMove || !pendingVoteRequestPlayer?.player_id) {
      return false;
    }

    return pendingVoteMove.player_id !== pendingVoteRequestPlayer.player_id;
  }, [pendingVoteMove, pendingVoteRequestPlayer]);

  const pendingVoteTilesByCell = useMemo(() => {
    const result: Record<string, { letter?: string }> = {};

    const boardDiff = pendingVoteMove?.board_diff ?? [];
    for (const tile of boardDiff) {
      const row = typeof tile.row === "number" ? tile.row - 1 : -1;
      const col = typeof tile.col === "number" ? tile.col - 1 : -1;
      if (row >= 0 && col >= 0) {
        result[buildCellKey(row, col)] = { letter: tile.letter };
      }
    }

    return result;
  }, [pendingVoteMove]);

  const isPlayersTurn =
    Boolean(resolvedBootstrap.playerId) &&
    Boolean(resolvedBootstrap.currentTurnPlayerId) &&
    resolvedBootstrap.playerId === resolvedBootstrap.currentTurnPlayerId &&
    isActive;

  useEffect(() => {
    if (
      !isActive ||
      !resolvedBootstrap.matchId ||
      !resolvedBootstrap.currentTurnPlayerId ||
      !isCurrentTurnBot ||
      botAutoActionInFlightRef.current
    ) {
      return;
    }

    const botActionKey = [
      resolvedBootstrap.matchId,
      resolvedBootstrap.currentTurnPlayerId,
      resolvedBootstrap.turnNumber,
    ].join(":");

    if (botAutoActionKeyRef.current === botActionKey) {
      return;
    }

    botAutoActionKeyRef.current = botActionKey;
    let cancelled = false;

    async function submitEasyBotTurn() {
      botAutoActionInFlightRef.current = true;
      setIsAutoPlayingBotTurn(true);
      setBotActionError(null);
      setBotActionMessage(
        `${currentTurnPlayerSummary?.display_name ?? "Bot"} esta tentando uma jogada.`
      );

      try {
        const { getSupabaseBrowserClient } = await import("../lib/supabase/client");
        const client = getSupabaseBrowserClient();

        if (!client) {
          throw new Error("Supabase client indisponivel para acao automatica do bot.");
        }

        const { data, error } = await client.rpc("submit_patxanga_easy_bot_turn", {
          p_match_id: resolvedBootstrap.matchId,
          p_player_id: resolvedBootstrap.currentTurnPlayerId,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (cancelled) {
          return;
        }

        const refreshedData = await loadMatchBootstrap({
          matchId: resolvedBootstrap.matchId,
          playerId: playerIdInput,
        });

        if (cancelled) {
          return;
        }

        setBootstrapData(refreshedData);
        await refreshPendingVoteContext(
          refreshedData.matchId,
          playerIdInput,
          refreshedData.status
        );

        const botTurnResult = data as RpcEasyBotTurnResult | null;

        if (botTurnResult?.bot_action === "place_word") {
          setBotActionMessage(`Bot jogou ${botTurnResult.main_word ?? "uma palavra"}.`);
        } else {
          setBotActionMessage("Bot passou o turno automaticamente.");
        }
      } catch (error) {
        if (!cancelled) {
          setBotActionError(
            error instanceof Error
              ? error.message
              : "Falha ao executar turno automatico do bot."
          );
          setBotActionMessage(null);
        }
      } finally {
        if (!cancelled) {
          setIsAutoPlayingBotTurn(false);
        }
        botAutoActionInFlightRef.current = false;
      }
    }

    const timer = window.setTimeout(() => {
      void submitEasyBotTurn();
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    currentTurnPlayerSummary?.display_name,
    isActive,
    isCurrentTurnBot,
    playerIdInput,
    resolvedBootstrap.currentTurnPlayerId,
    resolvedBootstrap.matchId,
    resolvedBootstrap.turnNumber,
  ]);

  useEffect(() => {
    if (
      !resolvedBootstrap.matchId ||
      !resolvedBootstrap.playerId ||
      !isPlayersTurn ||
      placedTilesPreview.length === 0
    ) {
      setMovePreview(null);
      setIsLoadingMovePreview(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoadingMovePreview(true);

      try {
        const { getSupabaseBrowserClient } = await import("../lib/supabase/client");
        const client = getSupabaseBrowserClient();

        if (!client) {
          throw new Error("Supabase client indisponivel no frontend.");
        }

        const { data, error } = await client.rpc("preview_patxanga_move", {
          p_match_id: resolvedBootstrap.matchId,
          p_player_id: resolvedBootstrap.playerId,
          p_placed_tiles: placedTilesPreview,
        });

        if (cancelled) {
          return;
        }

        if (error) {
          setMovePreview({
            status: "invalid",
            error: error.message,
          });
          return;
        }

        setMovePreview((data as MovePreviewResult | null) ?? null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setMovePreview({
          status: "invalid",
          error:
            error instanceof Error
              ? error.message
              : "Falha ao consultar preview da jogada.",
        });
      } finally {
        if (!cancelled) {
          setIsLoadingMovePreview(false);
        }
      }
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    isPlayersTurn,
    placedTilesPreview,
    resolvedBootstrap.matchId,
    resolvedBootstrap.playerId,
  ]);

  useEffect(() => {
    const nextIds = (resolvedBootstrap.playerContext?.rack_state ?? [])
      .map((item) => {
        const typedTile = item as { id?: string };
        return typedTile.id ?? null;
      })
      .filter((id): id is string => Boolean(id));

    setLocalRackComposition(buildInitialRackComposition(nextIds));
    setLocalRackSlotDrafts(buildInitialRackSlotDrafts());
    setLocalRackSlotTileAssignments({});
    setLocalRackSlotAssociations({});
    setSelectedRackSlotId(null);
  }, [resolvedBootstrap.playerContext]);

  const orderedPlayerRackState = useMemo(() => {
    const rackState = (resolvedBootstrap.playerContext?.rack_state ?? []) as Array<RackTileState>;

    if (rackState.length === 0 && localRackComposition.length === 0) {
      return [];
    }

    const ordered = localRackComposition
      .map((item) => {
        if (item.kind === "slot") {
          const assignedTileId = localRackSlotTileAssignments[item.slotId] ?? null;
          const assignedTile = assignedTileId ? rackTilesById.get(assignedTileId) : null;

          return {
            kind: "slot" as const,
            slotId: item.slotId,
            draftLetter: localRackSlotDrafts[item.slotId] ?? "",
            assignedTileId: assignedTileId ?? undefined,
            assignedTileLetter: assignedTile?.letter ?? "",
            assignedTilePoints: assignedTile?.points ?? 0,
            assignedTileSpecialType: assignedTile?.special_type ?? null,
            assignedTileIsSpecial: assignedTile?.is_special ?? false,
          };
        }

        return rackTilesById.get(item.tileId) ?? null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const knownTileIds = new Set(
      localRackComposition
        .filter((item): item is Extract<RackCompositionItem, { kind: "tile" }> => item.kind === "tile")
        .map((item) => item.tileId)
    );

    const missing = rackState.filter(
      (tile) => tile.id && !knownTileIds.has(tile.id)
    );

    return [...ordered, ...missing];
  }, [
    localRackComposition,
    localRackSlotDrafts,
    localRackSlotTileAssignments,
    rackTilesById,
    resolvedBootstrap.playerContext,
  ]);

  async function openMatchSession(matchId: string, userId: string) {
    setIsLoading(true);
    setErrorMessage(null);
    setSubmitResult(null);
    setVoteResult(null);
    setVoteResolutionMessage(null);
    setPendingVoteError(null);
    setBotActionError(null);
    setSelectedTileId(null);
    setSelectedTileIds([]);
    setSelectedRackSlotId(null);
    setLocalPlacements({});
    setLocalDeclaredLetters({});
    setLocalRackSlotDrafts({});
    setLocalRackSlotTileAssignments({});
    setLocalRackSlotAssociations({});
    setMovePreview(null);

    try {
      const nextData = await loadMatchBootstrap({
        matchId,
        playerId: userId,
      });

      setBootstrapData(nextData);

      await refreshPendingVoteContext(nextData.matchId, userId, nextData.status);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao carregar bootstrap da match."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleAssignTileToRackSlot(slotId: string, tileId: string) {
    const { nextPlacements, removedCellKeys } = removeTileFromPlacements(localPlacements, tileId);
    const nextSlotAssignments = removeTileFromSlotAssignments(
      localRackSlotTileAssignments,
      tileId
    );
    const shouldUnassign = localRackSlotTileAssignments[slotId] === tileId;

    setLocalPlacements(nextPlacements);
    setLocalDeclaredLetters((current) =>
      removeDeclaredLettersForCellKeys(current, removedCellKeys)
    );
    setLocalRackSlotTileAssignments(() => {
      if (shouldUnassign) {
        delete nextSlotAssignments[slotId];
        return nextSlotAssignments;
      }

      return {
        ...nextSlotAssignments,
        [slotId]: tileId,
      };
    });
    setSelectedTileIds((current) => current.filter((id) => id !== tileId));
    setSelectedTileId(null);
    setSelectedRackSlotId(slotId);
    setMovePreview(null);
  }

  function handleClearRackSlotAssignment(slotId: string) {
    setLocalRackSlotTileAssignments((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
    setMovePreview(null);
  }

  function clearMoveCompositionPreview() {
    setLocalPlacements({});
    setLocalDeclaredLetters({});
    setLocalRackSlotTileAssignments({});
    setLocalRackSlotAssociations({});
    setSelectedTileId(null);
    setSelectedTileIds([]);
    setSelectedRackSlotId(null);
    setMovePreview(null);
  }

  function handlePrepareSession(matchId: string, userId: string) {
    setMatchIdInput(matchId);
    setPlayerIdInput(userId);
  }

  function handleApplyScenarioToSwitcher(scenario: BrowserValidationScenario) {
    setSessionSwitchError(null);
    setSessionSwitchDraft({
      matchId: scenario.matchId,
      hostUserId: scenario.hostUserId,
      guestUserId: scenario.guestUserId,
    });
  }

  function handleUseScenarioIdentity(
    scenario: BrowserValidationScenario,
    role: SessionRole
  ) {
    const nextUserId = role === "host" ? scenario.hostUserId : scenario.guestUserId;
    handlePrepareSession(scenario.matchId, nextUserId);
  }

  async function getConfiguredBrowserClient() {
    const { getSupabaseBrowserClient } = await import("../lib/supabase/client");
    const client = getSupabaseBrowserClient();

    if (!client) {
      throw new Error("Supabase client not configured in frontend environment.");
    }

    return client;
  }

  async function createBrowserValidationScenario(
    key: BrowserValidationScenarioKey,
    title: string,
    objective: string,
    hostGuestName: string
  ): Promise<BrowserValidationScenario> {
    const client = await getConfiguredBrowserClient();
    const hostUserId = crypto.randomUUID();
    const guestUserId = crypto.randomUUID();

    const { data: createData, error: createError } = await client.rpc(
      "create_patxanga_match_lobby",
      {
        p_language: "pt-BR",
        p_match_mode: "synchronous",
        p_turn_time_seconds: null,
        p_hint_mode_enabled: false,
        p_host_user_id: hostUserId,
        p_host_guest_name: hostGuestName,
        p_max_players: 2,
      }
    );

    if (createError) {
      throw new Error(createError.message);
    }

    if (!createData) {
      throw new Error("Empty create match lobby payload returned by backend.");
    }

    const createResult = createData as RpcCreateMatchLobbyResult;

    const { data: inviteData, error: inviteError } = await client.rpc(
      "invite_patxanga_player",
      {
        p_match_id: createResult.match_id,
        p_invited_by_player_id: createResult.host_player_id,
        p_invited_user_id: guestUserId,
        p_expires_at: null,
      }
    );

    if (inviteError) {
      throw new Error(inviteError.message);
    }

    if (!inviteData) {
      throw new Error("Empty invite payload returned by backend.");
    }

    const inviteResult = inviteData as RpcInvitePlayerResult;

    return {
      key,
      title,
      objective,
      matchId: createResult.match_id,
      hostUserId,
      guestUserId,
      inviteId: inviteResult.invite_id,
      hostPlayerId: createResult.host_player_id,
    };
  }

  async function handleGenerateBrowserValidationScenarios() {
    setIsGeneratingBrowserValidationScenarios(true);
    setBrowserValidationScenariosError(null);

    try {
      const [acceptScenario, declineScenario] = await Promise.all([
        createBrowserValidationScenario(
          "acceptStartResumeForfeit",
          "Cenario A",
          "Aceitar convite, iniciar lobby, retomar partida e desistir.",
          "Host Browser Flow A"
        ),
        createBrowserValidationScenario(
          "declineInvite",
          "Cenario B",
          "Recusar convite pendente.",
          "Host Browser Flow B"
        ),
      ]);

      setBrowserValidationScenarios([acceptScenario, declineScenario]);
      handleApplyScenarioToSwitcher(acceptScenario);
      handlePrepareSession(acceptScenario.matchId, acceptScenario.guestUserId);
      setSessionActionMessage(
        "Cenarios de validacao gerados. O formulario foi preenchido com o guest do Cenario A."
      );
    } catch (error) {
      setBrowserValidationScenarios([]);
      setBrowserValidationScenariosError(
        error instanceof Error
          ? error.message
          : "Falha ao gerar cenarios de validacao no backend."
      );
    } finally {
      setIsGeneratingBrowserValidationScenarios(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await openMatchSession(matchIdInput, playerIdInput);
  }

  async function handleCreateQuickMatch() {
    setQuickMatchError(null);
    setErrorMessage(null);
    setIsCreatingQuickMatch(true);

    try {
      const client = await getConfiguredBrowserClient();

      const hostUserId = crypto.randomUUID();
      const guestUserId = crypto.randomUUID();

      const { data: matchId, error: createError } = await client.rpc("create_patxanga_match", {
        p_host_user_id: hostUserId,
        p_host_guest_name: "Host Local",
        p_language: "pt-BR",
        p_match_mode: "synchronous",
        p_max_players: 2,
      });

      if (createError) {
        throw new Error(createError.message);
      }

      const { error: joinError } = await client.rpc("join_patxanga_match", {
        p_match_id: matchId,
        p_user_id: guestUserId,
        p_guest_name: "Guest Local",
        p_is_bot: false,
        p_bot_level: null,
        p_bot_profile: null,
      });

      if (joinError) {
        throw new Error(joinError.message);
      }

      const { error: startError } = await client.rpc("start_patxanga_match", {
        p_match_id: matchId,
      });

      if (startError) {
        throw new Error(startError.message);
      }

      const nextQuickMatchSession = {
        matchId,
        hostUserId,
        guestUserId,
        opponentIsBot: false,
      };

      setQuickMatchSession(nextQuickMatchSession);
      setSessionSwitchDraft(nextQuickMatchSession);
      setSessionSwitchError(null);

      setMatchIdInput(matchId);
      setPlayerIdInput(hostUserId);
      await openMatchSession(matchId, hostUserId);
    } catch (error) {
      setQuickMatchError(
        error instanceof Error ? error.message : "Falha ao gerar partida local de teste."
      );
    } finally {
      setIsCreatingQuickMatch(false);
    }
  }

  async function handleCreateHumanVsBotMatch() {
    setQuickMatchError(null);
    setErrorMessage(null);
    setBotActionError(null);
    setBotActionMessage(null);
    setIsCreatingBotMatch(true);

    try {
      const client = await getConfiguredBrowserClient();

      const hostUserId = crypto.randomUUID();
      const botUserId = crypto.randomUUID();

      const { data: matchId, error: createError } = await client.rpc("create_patxanga_match", {
        p_host_user_id: hostUserId,
        p_host_guest_name: "Humano Local",
        p_language: "pt-BR",
        p_match_mode: "synchronous",
        p_max_players: 2,
      });

      if (createError) {
        throw new Error(createError.message);
      }

      const { error: joinError } = await client.rpc("join_patxanga_match", {
        p_match_id: matchId,
        p_user_id: botUserId,
        p_guest_name: "Bot Easy",
        p_is_bot: true,
        p_bot_level: "easy",
        p_bot_profile: "balanced",
      });

      if (joinError) {
        throw new Error(joinError.message);
      }

      const { error: startError } = await client.rpc("start_patxanga_match", {
        p_match_id: matchId,
      });

      if (startError) {
        throw new Error(startError.message);
      }

      const nextQuickMatchSession = {
        matchId,
        hostUserId,
        guestUserId: botUserId,
        opponentIsBot: true,
      };

      setQuickMatchSession(nextQuickMatchSession);
      setSessionSwitchDraft(nextQuickMatchSession);
      setSessionSwitchError(null);
      setBotActionMessage(
        "Partida contra bot criada. O bot easy tenta uma abertura valida antes de passar."
      );

      setMatchIdInput(matchId);
      setPlayerIdInput(hostUserId);
      await openMatchSession(matchId, hostUserId);
    } catch (error) {
      setQuickMatchError(
        error instanceof Error ? error.message : "Falha ao gerar partida contra bot."
      );
    } finally {
      setIsCreatingBotMatch(false);
    }
  }

  async function handleOpenQuickMatch(userId: string) {
    if (!quickMatchSession) {
      return;
    }

    handlePrepareSession(quickMatchSession.matchId, userId);
    await openMatchSession(quickMatchSession.matchId, userId);
  }

  function handleChangeSessionSwitchDraft(
    field: keyof SessionSwitchDraft,
    value: string
  ) {
    setSessionSwitchError(null);
    setSessionSwitchDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleCaptureCurrentSession(role: SessionRole) {
    const normalizedMatchId = matchIdInput.trim();
    const normalizedUserId = playerIdInput.trim();

    if (!normalizedMatchId || !normalizedUserId) {
      setSessionSwitchError("Preencha match_id e user_id atuais antes de capturar a sessao.");
      return;
    }

    setSessionSwitchError(null);
    setSessionSwitchDraft((current) => ({
      matchId: normalizedMatchId,
      hostUserId: role === "host" ? normalizedUserId : current.hostUserId,
      guestUserId: role === "guest" ? normalizedUserId : current.guestUserId,
    }));
  }

  function handleUseQuickMatchSessionForSwitch() {
    if (!quickMatchSession) {
      return;
    }

    setSessionSwitchError(null);
    setSessionSwitchDraft(quickMatchSession);
  }

  async function handleOpenSessionRole(role: SessionRole) {
    const normalizedMatchId = sessionSwitchDraft.matchId.trim();
    const normalizedHostUserId = sessionSwitchDraft.hostUserId.trim();
    const normalizedGuestUserId = sessionSwitchDraft.guestUserId.trim();

    if (!normalizedMatchId || !normalizedHostUserId || !normalizedGuestUserId) {
      setSessionSwitchError(
        "Informe match_id, host_user_id e guest_user_id para alternar entre host e guest."
      );
      return;
    }

    const nextUserId = role === "host" ? normalizedHostUserId : normalizedGuestUserId;

    setSessionSwitchError(null);
    handlePrepareSession(normalizedMatchId, nextUserId);
    await openMatchSession(normalizedMatchId, nextUserId);
  }

  async function handleLoadSessionLists() {
    const userId = playerIdInput.trim();

    if (!userId) {
      setSessionListsError("Informe um user_id para carregar convites e partidas retomaveis.");
      setSessionListsLoaded(false);
      setPendingInvites([]);
      setResumableMatches([]);
      return;
    }

    setIsLoadingSessionLists(true);
    setSessionListsError(null);
    setSessionActionMessage(null);

    try {
      const [nextPendingInvites, nextResumableMatches] = await Promise.all([
        listPendingInvites(userId),
        listResumableMatches(userId),
      ]);

      setPendingInvites(nextPendingInvites);
      setResumableMatches(nextResumableMatches);
      setSessionListsLoaded(true);
    } catch (error) {
      setSessionListsError(
        error instanceof Error
          ? error.message
          : "Falha ao carregar convites e partidas retomaveis."
      );
      setSessionListsLoaded(false);
      setPendingInvites([]);
      setResumableMatches([]);
    } finally {
      setIsLoadingSessionLists(false);
    }
  }

  async function handleResumeListedMatch(matchId: string) {
    const userId = playerIdInput.trim();

    if (!userId) {
      setSessionListsError("Informe um user_id para retomar a partida.");
      return;
    }

    setSessionListsError(null);
    setSessionActionMessage(null);

    try {
      const result = await resumeMatch({
        matchId,
        userId,
      });

      if (!result.canResume) {
        setSessionListsError(
          `Nao foi possivel retomar a partida: ${result.reason ?? "motivo nao informado"}.`
        );
        return;
      }

      setMatchIdInput(matchId);
      await openMatchSession(matchId, userId);
      await handleLoadSessionLists();
      setSessionActionMessage("Partida retomada com sucesso.");
    } catch (error) {
      setSessionListsError(
        error instanceof Error ? error.message : "Falha ao retomar a partida."
      );
    }
  }

  async function handleAcceptInvite(inviteId: string) {
    const userId = playerIdInput.trim();

    if (!userId) {
      setSessionListsError("Informe um user_id para aceitar o convite.");
      return;
    }

    setInviteActionInFlightId(inviteId);
    setSessionListsError(null);
    setSessionActionMessage(null);

    try {
      const result = await acceptInvite({
        inviteId,
        userId,
      });

      setMatchIdInput(result.matchId);
      await openMatchSession(result.matchId, userId);
      await handleLoadSessionLists();
      setSessionActionMessage("Convite aceito. A partida foi aberta nesta sessão.");
    } catch (error) {
      setSessionListsError(
        error instanceof Error ? error.message : "Falha ao aceitar o convite."
      );
    } finally {
      setInviteActionInFlightId(null);
    }
  }

  async function handleDeclineInvite(inviteId: string) {
    const userId = playerIdInput.trim();

    if (!userId) {
      setSessionListsError("Informe um user_id para recusar o convite.");
      return;
    }

    setInviteActionInFlightId(inviteId);
    setSessionListsError(null);
    setSessionActionMessage(null);

    try {
      await declineInvite({
        inviteId,
        userId,
      });

      await handleLoadSessionLists();
      setSessionActionMessage("Convite recusado com sucesso.");
    } catch (error) {
      setSessionListsError(
        error instanceof Error ? error.message : "Falha ao recusar o convite."
      );
    } finally {
      setInviteActionInFlightId(null);
    }
  }

  async function handleStartCurrentLobby() {
    if (!resolvedBootstrap.matchId) {
      setErrorMessage("match_id nao carregado.");
      return;
    }

    if (!resolvedBootstrap.playerId) {
      setErrorMessage("player_id resolvido nao disponivel para iniciar o lobby.");
      return;
    }

    setIsStartingCurrentLobby(true);
    setErrorMessage(null);
    setSessionActionMessage(null);

    try {
      await startMatchFromLobby({
        matchId: resolvedBootstrap.matchId,
        hostPlayerId: resolvedBootstrap.playerId,
      });

      await openMatchSession(resolvedBootstrap.matchId, playerIdInput.trim());
      await handleLoadSessionLists();
      setSessionActionMessage("Lobby iniciado com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao iniciar a partida a partir do lobby."
      );
    } finally {
      setIsStartingCurrentLobby(false);
    }
  }

  async function handleForfeitCurrentMatch() {
    if (!resolvedBootstrap.matchId) {
      setErrorMessage("match_id nao carregado.");
      return;
    }

    if (!resolvedBootstrap.playerId) {
      setErrorMessage("player_id resolvido nao disponivel para desistir.");
      return;
    }

    const shouldForfeit = window.confirm(
      "Confirma a desistência desta partida? Esta ação é persistida no backend."
    );

    if (!shouldForfeit) {
      return;
    }

    setIsForfeitingCurrentMatch(true);
    setErrorMessage(null);
    setSessionActionMessage(null);

    try {
      const result = await forfeitMatch({
        matchId: resolvedBootstrap.matchId,
        playerId: resolvedBootstrap.playerId,
      });

      await openMatchSession(resolvedBootstrap.matchId, playerIdInput.trim());
      await handleLoadSessionLists();

      setSessionActionMessage(
        result.status === "cancelled"
          ? "Desistência registrada. Todos desistiram e a partida foi cancelada."
          : "Desistência registrada com sucesso."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao desistir da partida."
      );
    } finally {
      setIsForfeitingCurrentMatch(false);
    }
  }


  async function handleSubmitMove() {
    if (!resolvedBootstrap.matchId) {
      setErrorMessage("match_id nao carregado.");
      return;
    }

    if (!resolvedBootstrap.playerId) {
      setErrorMessage("player_id resolvido nao disponivel.");
      return;
    }

    if (placedTilesPreview.length === 0) {
      setErrorMessage("Nenhuma peca posicionada para enviar.");
      return;
    }

    setIsSubmittingMove(true);
    setErrorMessage(null);
    setSubmitResult(null);
    setVoteResolutionMessage(null);

    try {
      const { getSupabaseBrowserClient } = await import("../lib/supabase/client");
      const client = getSupabaseBrowserClient();

      if (!client) {
        throw new Error("Supabase client not configured in frontend environment.");
      }

      const { data, error } = await client.rpc("submit_patxanga_move", {
        p_match_id: resolvedBootstrap.matchId,
        p_player_id: resolvedBootstrap.playerId,
        p_placed_tiles: placedTilesPreview,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSubmitResult(data ?? null);

      const refreshedData = await loadMatchBootstrap({
        matchId: resolvedBootstrap.matchId,
        playerId: playerIdInput,
      });

      setBootstrapData(refreshedData);

      await refreshPendingVoteContext(refreshedData.matchId, playerIdInput, refreshedData.status);

      setSelectedTileId(null);
      setSelectedTileIds([]);
      setSelectedRackSlotId(null);
      setLocalPlacements({});
      setLocalDeclaredLetters({});
      setLocalRackSlotDrafts({});
      setLocalRackSlotTileAssignments({});
      setLocalRackSlotAssociations({});
      setMovePreview(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao enviar jogada."
      );
    } finally {
      setIsSubmittingMove(false);
    }
  }


  async function refreshPendingVoteContext(matchId: string, userId: string, status: string) {
    if (status !== "voting") {
      setPendingVoteContext(null);
      setPendingVoteError(null);
      return;
    }

    const { getSupabaseBrowserClient } = await import("../lib/supabase/client");
    const client = getSupabaseBrowserClient();

    if (!client) {
      setPendingVoteContext(null);
      setPendingVoteError("Supabase client indisponivel para carregar pending_vote.");
      return;
    }

    const { data, error } = await client.rpc("get_patxanga_pending_vote_context", {
      p_match_id: matchId,
      p_user_id: userId,
    });

    if (error) {
      setPendingVoteContext(null);
      setPendingVoteError(error.message);
      return;
    }

    setPendingVoteContext(data ?? null);
    setPendingVoteError(null);
  }

  async function handleSubmitVote(voteReject: boolean) {
    if (!pendingVoteMove?.move_id) {
      setErrorMessage("move_id pendente de votacao nao disponivel.");
      return;
    }

    if (!pendingVoteRequestPlayer?.player_id) {
      setErrorMessage("player_id do solicitante de voto nao disponivel.");
      return;
    }

    setIsSubmittingVote(true);
    setErrorMessage(null);
    setVoteResult(null);
    setVoteResolutionMessage(null);

    try {
      const { getSupabaseBrowserClient } = await import("../lib/supabase/client");
      const client = getSupabaseBrowserClient();

      if (!client) {
        throw new Error("Supabase client indisponivel no frontend.");
      }

      const { data, error } = await client.rpc("submit_patxanga_vote", {
        p_move_id: pendingVoteMove.move_id,
        p_voter_player_id: pendingVoteRequestPlayer.player_id,
        p_vote_reject: voteReject,
      });

      if (error) {
        throw new Error(error.message);
      }

      setVoteResult(data ?? null);
      setVoteResolutionMessage(formatVoteResolutionMessage(data));

      const refreshedData = await loadMatchBootstrap({
        matchId: matchIdInput,
        playerId: playerIdInput,
      });

      setBootstrapData(refreshedData);
      await refreshPendingVoteContext(
        refreshedData.matchId,
        playerIdInput,
        refreshedData.status
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao enviar voto."
      );
    } finally {
      setIsSubmittingVote(false);
    }
  }

  function handlePlaceTile(cellKey: string, typedCell: BoardCell) {
    if (selectedRackSlotId) {
      setLocalRackSlotAssociations((current) => {
        const next = { ...current };

        if (next[selectedRackSlotId] === cellKey) {
          delete next[selectedRackSlotId];
        } else {
          next[selectedRackSlotId] = cellKey;
        }

        return next;
      });

      return;
    }

    if (typedCell?.tile?.letter) {
      return;
    }

    if (localPlacements[cellKey]) {
      const restoredTileId = localPlacements[cellKey];

      setLocalPlacements((current) => {
        const next = { ...current };
        delete next[cellKey];
        return next;
      });

      setLocalDeclaredLetters((current) => {
        const next = { ...current };
        delete next[cellKey];
        return next;
      });

      setSelectedTileIds((current) => current.filter((id) => id !== restoredTileId));
      setSelectedTileId((current) => (current === restoredTileId ? null : current));

      return;
    }

    if (!selectedTileId) {
      return;
    }

    if (Object.values(localPlacements).includes(selectedTileId)) {
      return;
    }

    const rackTile = (resolvedBootstrap.playerContext?.rack_state ?? []).find((item) => {
      const typedTile = item as {
        id?: string;
        special_type?: string | null;
      };

      return typedTile.id === selectedTileId;
    }) as
      | {
          id?: string;
          special_type?: string | null;
        }
      | undefined;

    if (!rackTile?.id) {
      return;
    }

    const needsDeclaredLetter = requiresDeclaredLetter(rackTile.special_type);
    let declaredLetter: string | null = null;

    if (needsDeclaredLetter) {
      const input = window.prompt(getDeclaredLetterPromptLabel(rackTile.special_type), "");
      const normalized = input?.trim().toUpperCase() ?? "";

      if (normalized.length !== 1) {
        return;
      }

      declaredLetter = normalized;
    }

    setLocalPlacements((current) => ({
      ...current,
      [cellKey]: selectedTileId,
    }));
    setLocalRackSlotTileAssignments((current) =>
      removeTileFromSlotAssignments(current, selectedTileId)
    );

    setLocalDeclaredLetters((current) => {
      const next = { ...current };

      if (declaredLetter) {
        next[cellKey] = declaredLetter;
      } else {
        delete next[cellKey];
      }

      return next;
    });

    setSelectedTileIds((current) => current.filter((id) => id !== selectedTileId));
    setSelectedTileId(null);
  }

  function handleToggleTile(tileId: string) {
    if (selectedRackSlotId) {
      handleAssignTileToRackSlot(selectedRackSlotId, tileId);
      return;
    }

    setSelectedRackSlotId(null);
    setSelectedTileIds((current) => {
      if (current.includes(tileId)) {
        const next = current.filter((id) => id !== tileId);
        setSelectedTileId((previous) => (previous === tileId ? (next[0] ?? null) : previous));
        return next;
      }

      const next = [...current, tileId];
      setSelectedTileId((previous) => previous ?? tileId);
      return next;
    });
  }

  function handleToggleRackSlot(slotId: string) {
    if (selectedTileId && selectedTileIds.length <= 1) {
      handleAssignTileToRackSlot(slotId, selectedTileId);
      return;
    }

    setSelectedTileId(null);
    setSelectedTileIds([]);
    setSelectedRackSlotId((current) => (current === slotId ? null : slotId));
  }

  function handleChangeRackSlotDraft(slotId: string, nextValue: string) {
    const normalized = nextValue.trim().slice(0, 1).toUpperCase();
    setLocalRackSlotDrafts((current) => ({
      ...current,
      [slotId]: normalized,
    }));
  }

  function handleReorderRackItem(draggedItemId: string, dropTargetId: string) {
    setLocalRackComposition((current) =>
      reorderRackComposition(current, draggedItemId, dropTargetId, selectedTileIds)
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        fontFamily: '"Avenir Next", "Trebuchet MS", sans-serif',
        maxWidth: 1280,
        margin: "0 auto",
        color: "#1f2933",
      }}
    >
      <section
        style={{
          padding: 24,
          borderRadius: 28,
          background:
            "radial-gradient(circle at 18% 20%, rgba(250, 204, 21, 0.22), transparent 30%), radial-gradient(circle at 82% 12%, rgba(20, 184, 166, 0.18), transparent 28%), linear-gradient(135deg, #2b2118 0%, #5b3b24 45%, #14342f 100%)",
          color: "#fff7ed",
          boxShadow: "0 22px 60px rgba(43, 33, 24, 0.28)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 18,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ maxWidth: 720 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.8,
                textTransform: "uppercase",
                color: "#fde68a",
              }}
            >
              Palavra, mesa e disputa
            </div>
            <h1 style={{ margin: "8px 0 0", fontSize: 54, lineHeight: 0.95 }}>
              Patxanga
            </h1>
            <p style={{ margin: "14px 0 0", maxWidth: 620, fontSize: 18, lineHeight: 1.5 }}>
              Mesa local conectada ao backend real, com jogo humano, votação de palavras e bot
              demonstrável para acelerar desenvolvimento.
            </p>
          </div>

          <div
            style={{
              minWidth: 260,
              padding: 16,
              borderRadius: 20,
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#fde68a" }}>
              Ambiente
            </div>
            <div style={{ marginTop: 8, fontSize: 17, fontWeight: 900 }}>
              {isConfigured ? "Backend real conectado" : "Modo local de fallback"}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: "#ffedd5", lineHeight: 1.45 }}>
              A sessão ainda usa <strong>user_id</strong> para localizar o jogador correto da
              partida.
            </div>
            <button
              type="button"
              onClick={() => setShowDebug((current) => !current)}
              style={{
                marginTop: 14,
                padding: "9px 13px",
                borderRadius: 999,
                border: "1px solid rgba(255, 255, 255, 0.32)",
                background: showDebug ? "#fef3c7" : "rgba(255, 255, 255, 0.16)",
                color: showDebug ? "#422006" : "#fff7ed",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              {showDebug ? "Debug visível" : "Mostrar debug"}
            </button>
          </div>
        </div>
      </section>

      <section
        style={{
          marginTop: 24,
          padding: 20,
          border: "1px solid #d7d0bf",
          borderRadius: 22,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Partida local rápida</h2>
            <p style={{ marginBottom: 0, color: "#4b5563" }}>
              Crie uma mesa em segundos para jogar, demonstrar o bot ou alternar entre sessões.
            </p>
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              padding: "6px 10px",
              borderRadius: 999,
              background: isConfigured ? "#dcfce7" : "#fee2e2",
              color: isConfigured ? "#166534" : "#991b1b",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {isConfigured ? "pronto para criar" : "backend indisponível"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
          <button
            type="button"
            data-testid="quick-match-create"
            onClick={handleCreateQuickMatch}
            disabled={!isConfigured || isCreatingQuickMatch}
            style={{ padding: "10px 14px", cursor: !isConfigured || isCreatingQuickMatch ? "not-allowed" : "pointer" }}
          >
            {isCreatingQuickMatch ? "Gerando partida..." : "Gerar partida local"}
          </button>

          <button
            type="button"
            data-testid="bot-match-create"
            onClick={handleCreateHumanVsBotMatch}
            disabled={!isConfigured || isCreatingBotMatch}
            style={{ padding: "10px 14px", cursor: !isConfigured || isCreatingBotMatch ? "not-allowed" : "pointer" }}
          >
            {isCreatingBotMatch ? "Gerando contra bot..." : "Gerar partida contra bot"}
          </button>

          {quickMatchSession ? (
            <>
              <button
                type="button"
                data-testid="quick-match-open-host"
                onClick={() => handleOpenQuickMatch(quickMatchSession.hostUserId)}
                disabled={isLoading}
                style={{ padding: "10px 14px", cursor: isLoading ? "not-allowed" : "pointer" }}
              >
                Entrar como host
              </button>
              <button
                type="button"
                data-testid="quick-match-open-guest"
                onClick={() => handleOpenQuickMatch(quickMatchSession.guestUserId)}
                disabled={isLoading}
                style={{ padding: "10px 14px", cursor: isLoading ? "not-allowed" : "pointer" }}
              >
                {quickMatchSession.opponentIsBot ? "Abrir como bot (debug)" : "Entrar como guest"}
              </button>
            </>
          ) : null}
        </div>

        {quickMatchSession ? (
          <div style={{ marginTop: 12, display: "grid", gap: 6, fontFamily: "monospace", fontSize: 13 }}>
            <div>match_id: {quickMatchSession.matchId}</div>
            <div>host_user_id: {quickMatchSession.hostUserId}</div>
            <div>
              {quickMatchSession.opponentIsBot ? "bot_user_id" : "guest_user_id"}:{" "}
              {quickMatchSession.guestUserId}
            </div>
          </div>
        ) : null}

        {quickMatchError ? (
          <p style={{ marginTop: 12, color: "#b00020" }}>
            <strong>Erro:</strong> {quickMatchError}
          </p>
        ) : null}

        {botActionMessage ? (
          <p data-testid="bot-action-message" style={{ marginTop: 12, color: "#166534" }}>
            <strong>Bot:</strong>{" "}
            {isAutoPlayingBotTurn ? "Executando turno automatico..." : botActionMessage}
          </p>
        ) : null}

        {botActionError ? (
          <p data-testid="bot-action-error" style={{ marginTop: 12, color: "#b00020" }}>
            <strong>Erro do bot:</strong> {botActionError}
          </p>
        ) : null}
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Cenarios de validacao browser</h2>
        <p>
          Gera no backend os IDs reais para a rodada manual de convite, lobby, retomada e
          desistência, e deixa tudo exposto na pagina para uso imediato.
        </p>

        <button
          type="button"
          onClick={handleGenerateBrowserValidationScenarios}
          disabled={!isConfigured || isGeneratingBrowserValidationScenarios}
          style={{
            marginTop: 12,
            padding: "10px 14px",
            cursor:
              !isConfigured || isGeneratingBrowserValidationScenarios
                ? "not-allowed"
                : "pointer",
          }}
        >
          {isGeneratingBrowserValidationScenarios
            ? "Gerando cenarios..."
            : "Gerar cenarios de validacao"}
        </button>

        {browserValidationScenariosError ? (
          <p style={{ marginTop: 12, color: "#b00020" }}>
            <strong>Erro:</strong> {browserValidationScenariosError}
          </p>
        ) : null}

        {browserValidationScenarios.length > 0 ? (
          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            {browserValidationScenarios.map((scenario) => (
              <div
                key={scenario.key}
                data-testid={`browser-scenario-${scenario.key}`}
                style={{
                  display: "grid",
                  gap: 6,
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                }}
              >
                <div>
                  <strong>{scenario.title}:</strong> {scenario.objective}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 13 }}>match_id: {scenario.matchId}</div>
                <div style={{ fontFamily: "monospace", fontSize: 13 }}>host_user_id: {scenario.hostUserId}</div>
                <div style={{ fontFamily: "monospace", fontSize: 13 }}>guest_user_id: {scenario.guestUserId}</div>
                <div style={{ fontFamily: "monospace", fontSize: 13 }}>invite_id: {scenario.inviteId}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                  <button
                    type="button"
                    data-testid={`browser-scenario-${scenario.key}-use-host`}
                    onClick={() => handleUseScenarioIdentity(scenario, "host")}
                    style={{ padding: "10px 14px", cursor: "pointer" }}
                  >
                    Usar host
                  </button>
                  <button
                    type="button"
                    data-testid={`browser-scenario-${scenario.key}-use-guest`}
                    onClick={() => handleUseScenarioIdentity(scenario, "guest")}
                    style={{ padding: "10px 14px", cursor: "pointer" }}
                  >
                    Usar guest
                  </button>
                  <button
                    type="button"
                    data-testid={`browser-scenario-${scenario.key}-load-switcher`}
                    onClick={() => handleApplyScenarioToSwitcher(scenario)}
                    style={{ padding: "10px 14px", cursor: "pointer" }}
                  >
                    Carregar no alternador
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Alternar host e guest</h2>
        <p>
          Registre uma sessao de teste uma vez e reabra a mesma partida como{" "}
          <strong>host</strong> ou <strong>guest</strong> sem recolar UUIDs a cada etapa.
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>match_id da sessao alternavel</span>
            <input
              value={sessionSwitchDraft.matchId}
              onChange={(event) => handleChangeSessionSwitchDraft("matchId", event.target.value)}
              placeholder="ex: UUID da match"
              style={{ padding: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>host_user_id</span>
            <input
              value={sessionSwitchDraft.hostUserId}
              onChange={(event) => handleChangeSessionSwitchDraft("hostUserId", event.target.value)}
              placeholder="ex: UUID do host"
              style={{ padding: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>guest_user_id</span>
            <input
              value={sessionSwitchDraft.guestUserId}
              onChange={(event) => handleChangeSessionSwitchDraft("guestUserId", event.target.value)}
              placeholder="ex: UUID do guest"
              style={{ padding: 8 }}
            />
          </label>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => handleCaptureCurrentSession("host")}
              style={{ padding: "10px 14px", cursor: "pointer" }}
            >
              Capturar atual como host
            </button>
            <button
              type="button"
              onClick={() => handleCaptureCurrentSession("guest")}
              style={{ padding: "10px 14px", cursor: "pointer" }}
            >
              Capturar atual como guest
            </button>
            {quickMatchSession ? (
              <button
                type="button"
                onClick={handleUseQuickMatchSessionForSwitch}
                style={{ padding: "10px 14px", cursor: "pointer" }}
              >
                Usar sessao rapida
              </button>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => handleOpenSessionRole("host")}
              disabled={isLoading}
              style={{
                padding: "10px 14px",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              Abrir como host
            </button>
            <button
              type="button"
              onClick={() => handleOpenSessionRole("guest")}
              disabled={isLoading}
              style={{
                padding: "10px 14px",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              Abrir como guest
            </button>
          </div>

          {activeSessionRole ? (
            <p style={{ margin: 0, color: "#166534" }}>
              <strong>Papel ativo:</strong> {activeSessionRole}
            </p>
          ) : null}

          {sessionSwitchError ? (
            <p style={{ margin: 0, color: "#b00020" }}>
              <strong>Erro:</strong> {sessionSwitchError}
            </p>
          ) : null}
        </div>
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Abrir partida</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>match_id</span>
            <input
              value={matchIdInput}
              onChange={(event) => setMatchIdInput(event.target.value)}
              placeholder="ex: UUID da match"
              style={{ padding: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>user_id da sessao (temporario neste bootstrap real)</span>
            <input
              value={playerIdInput}
              onChange={(event) => setPlayerIdInput(event.target.value)}
              placeholder="ex: UUID do usuario"
              style={{ padding: 8 }}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: 220, padding: "10px 14px", cursor: "pointer" }}
          >
            {isLoading ? "Carregando..." : "Abrir partida"}
          </button>
        </form>

        {errorMessage ? (
          <p style={{ marginTop: 12, color: "#b00020" }}>
            <strong>Erro:</strong> {errorMessage}
          </p>
        ) : null}

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
          <h3 style={{ marginTop: 0 }}>Partidas e convites do user_id informado</h3>
          <p style={{ marginBottom: 12 }}>
            Usa o mesmo <strong>user_id</strong> do campo acima para listar partidas retomaveis e
            convites pendentes sem depender de copiar <strong>match_id</strong> manualmente.
          </p>

          <button
            type="button"
            onClick={handleLoadSessionLists}
            disabled={isLoadingSessionLists}
            style={{ padding: "10px 14px", cursor: isLoadingSessionLists ? "not-allowed" : "pointer" }}
          >
            {isLoadingSessionLists
              ? "Consultando backend..."
              : "Carregar convites e partidas retomaveis"}
          </button>

          {sessionListsError ? (
            <p style={{ marginTop: 12, color: "#b00020" }}>
              <strong>Erro:</strong> {sessionListsError}
            </p>
          ) : null}

          {sessionActionMessage ? (
            <p style={{ marginTop: 12, color: "#166534" }}>
              <strong>Status:</strong> {sessionActionMessage}
            </p>
          ) : null}

          {sessionListsLoaded ? (
            <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
              <div>
                <h4 style={{ marginBottom: 8 }}>Partidas retomaveis</h4>
                {resumableMatches.length === 0 ? (
                  <p style={{ margin: 0 }}>Nenhuma partida retomavel encontrada para este user_id.</p>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {resumableMatches.map((match) => (
                      <div
                        key={`${match.matchId}-${match.playerId}`}
                        style={{
                          display: "grid",
                          gap: 6,
                          padding: 12,
                          border: "1px solid #d1d5db",
                          borderRadius: 8,
                        }}
                      >
                        <div><strong>match_id:</strong> {match.matchId}</div>
                        <div><strong>player_id:</strong> {match.playerId}</div>
                        <div><strong>status:</strong> {match.matchStatus}</div>
                        <div><strong>turno:</strong> {match.turnNumber}</div>
                        <div><strong>online:</strong> {match.isOnline ? "sim" : "nao"}</div>
                        <button
                          type="button"
                          onClick={() => handleResumeListedMatch(match.matchId)}
                          disabled={isLoading}
                          style={{
                            width: 180,
                            padding: "10px 14px",
                            cursor: isLoading ? "not-allowed" : "pointer",
                          }}
                        >
                          Retomar partida
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ marginBottom: 8 }}>Convites pendentes</h4>
                {pendingInvites.length === 0 ? (
                  <p style={{ margin: 0 }}>Nenhum convite pendente encontrado para este user_id.</p>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.inviteId}
                        style={{
                          display: "grid",
                          gap: 6,
                          padding: 12,
                          border: "1px solid #d1d5db",
                          borderRadius: 8,
                        }}
                      >
                        <div><strong>invite_id:</strong> {invite.inviteId}</div>
                        <div><strong>match_id:</strong> {invite.matchId}</div>
                        <div><strong>lobby:</strong> {invite.lobbyStatus}</div>
                        <div><strong>modo:</strong> {invite.matchMode}</div>
                        <div><strong>idioma:</strong> {invite.language}</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                          <button
                            type="button"
                            onClick={() => handleAcceptInvite(invite.inviteId)}
                            disabled={inviteActionInFlightId === invite.inviteId || isLoading}
                            style={{
                              padding: "10px 14px",
                              cursor:
                                inviteActionInFlightId === invite.inviteId || isLoading
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {inviteActionInFlightId === invite.inviteId
                              ? "Processando..."
                              : "Aceitar convite"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineInvite(invite.inviteId)}
                            disabled={inviteActionInFlightId === invite.inviteId || isLoading}
                            style={{
                              padding: "10px 14px",
                              cursor:
                                inviteActionInFlightId === invite.inviteId || isLoading
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {inviteActionInFlightId === invite.inviteId
                              ? "Processando..."
                              : "Recusar convite"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {resolvedBootstrap.matchId ? (
        <section
          style={{
            marginTop: 24,
            padding: 18,
            border: "1px solid #d7d0bf",
            borderRadius: 20,
            background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
            boxShadow: "0 10px 26px rgba(61, 46, 24, 0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Ações da partida atual</h2>
          <p style={{ marginTop: -4, color: "#4b5563" }}>
            Use este painel para decisões formais da mesa. As jogadas ficam na área principal abaixo.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
            {isWaiting && resolvedBootstrap.playerId && !resolvedBootstrap.playerContext?.has_forfeited ? (
              <button
                type="button"
                onClick={handleStartCurrentLobby}
                disabled={isStartingCurrentLobby || isLoading}
                style={{
                  padding: "10px 14px",
                  cursor: isStartingCurrentLobby || isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isStartingCurrentLobby ? "Iniciando lobby..." : "Iniciar partida do lobby"}
              </button>
            ) : null}

            {resolvedBootstrap.playerId && !resolvedBootstrap.playerContext?.has_forfeited && !isFinished ? (
              <button
                type="button"
                onClick={handleForfeitCurrentMatch}
                disabled={isForfeitingCurrentMatch || isLoading}
                style={{
                  padding: "10px 14px",
                  cursor: isForfeitingCurrentMatch || isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isForfeitingCurrentMatch ? "Registrando desistência..." : "Desistir da partida"}
              </button>
            ) : null}
          </div>

          {resolvedBootstrap.playerContext?.has_forfeited ? (
            <p style={{ marginTop: 12, color: "#92400e" }}>
              <strong>Status do jogador:</strong> esta sessao ja consta como desistente nesta partida.
            </p>
          ) : null}
        </section>
      ) : null}

      <GamePlayScreen
        stateLabel={stateLabel}
        isWaiting={isWaiting}
        isActive={isActive}
        isVoting={isVoting}
        isFinished={isFinished}
        winnerPlayerId={resolvedBootstrap.winnerPlayerId}
        finishedAt={resolvedBootstrap.finishedAt}
        viewerPlayerId={resolvedBootstrap.playerId}
        playersSummary={resolvedBootstrap.playersSummary}
        currentTurnPlayerId={resolvedBootstrap.currentTurnPlayerId}
        turnNumber={resolvedBootstrap.turnNumber}
        boardState={resolvedBootstrap.boardState}
        compositionPlacementsByCell={compositionPlacementsByCell}
        pendingVoteTilesByCell={pendingVoteTilesByCell}
        selectedTileId={selectedTileId}
        selectedTileIds={selectedTileIds}
        selectedRackSlotId={selectedRackSlotId}
        previewTileIds={previewTileIds}
        playerRackState={orderedPlayerRackState}
        rackSlotAssociations={localRackSlotAssociations}
        rackSlotAssociationLabels={rackSlotAssociationLabels}
        placedTilesPreview={placedTilesPreview}
        canSubmitMove={placedTilesPreview.length > 0 && Boolean(resolvedBootstrap.playerId)}
        isSubmittingMove={isSubmittingMove}
        movePreview={movePreview}
        isLoadingMovePreview={isLoadingMovePreview}
        pendingVoteError={pendingVoteError}
        pendingVoteMove={pendingVoteMove}
        canCurrentViewerVote={canCurrentViewerVote}
        isSubmittingVote={isSubmittingVote}
        voteResult={voteResult}
        voteResolutionMessage={voteResolutionMessage}
        showDebug={showDebug}
        botActionMessage={botActionMessage}
        botActionError={botActionError}
        isAutoPlayingBotTurn={isAutoPlayingBotTurn}
        buildCellKey={buildCellKey}
        renderCellLabel={renderCellLabel}
        renderCellBackground={renderCellBackground}
        onPlaceTile={handlePlaceTile}
        onToggleTile={handleToggleTile}
        onToggleRackSlot={handleToggleRackSlot}
        onClearRackSlotAssignment={handleClearRackSlotAssignment}
        onClearPreview={clearMoveCompositionPreview}
        onChangeRackSlotDraft={handleChangeRackSlotDraft}
        onReorderTile={handleReorderRackItem}
        onSubmitMove={handleSubmitMove}
        onApprove={() => handleSubmitVote(false)}
        onReject={() => handleSubmitVote(true)}
        onToggleDebug={() => setShowDebug((current) => !current)}
      />

      {showDebug ? (
        <>
      <MatchStatusPanel
        stateLabel={stateLabel}
        matchId={resolvedBootstrap.matchId}
        playersCount={resolvedBootstrap.playersSummary.length}
        showDebug={showDebug}
        playerId={resolvedBootstrap.playerId}
        currentTurnPlayerId={resolvedBootstrap.currentTurnPlayerId}
        winnerPlayerId={resolvedBootstrap.winnerPlayerId}
        startedAt={resolvedBootstrap.startedAt}
        finishedAt={resolvedBootstrap.finishedAt}
        turnNumber={resolvedBootstrap.turnNumber}
        onToggleDebug={() => setShowDebug((current) => !current)}
      />

      <PlayersSection
        playersSummary={resolvedBootstrap.playersSummary}
        currentTurnPlayerId={resolvedBootstrap.currentTurnPlayerId}
      />

      {(isActive || isVoting) ? (
      <BoardSection
        boardState={resolvedBootstrap.boardState}
        compositionPlacementsByCell={compositionPlacementsByCell}
        pendingVoteTilesByCell={pendingVoteTilesByCell}
        selectedTileId={selectedTileId}
        selectedRackSlotId={selectedRackSlotId}
        playerRackState={orderedPlayerRackState}
        rackSlotAssociations={localRackSlotAssociations}
        buildCellKey={buildCellKey}
        renderCellLabel={renderCellLabel}
        renderCellBackground={renderCellBackground}
        onPlaceTile={handlePlaceTile}
      />
      ) : null}

      {isActive ? (
      <RackSection
        rackTiles={orderedPlayerRackState}
        selectedTileIds={selectedTileIds}
        activeSlotId={selectedRackSlotId}
        slotAssociationLabels={rackSlotAssociationLabels}
        previewTileIds={previewTileIds}
        showDebug={showDebug}
        isPlayersTurn={isActive}
        onToggleTile={handleToggleTile}
        onToggleSlot={handleToggleRackSlot}
        onClearSlotAssignment={handleClearRackSlotAssignment}
        onClearPreview={clearMoveCompositionPreview}
        onChangeSlotDraft={handleChangeRackSlotDraft}
        onReorderTile={handleReorderRackItem}
      />
      ) : null}

      {isActive ? (
      <MoveSubmitSection
        showDebug={showDebug}
        placedTilesPreview={placedTilesPreview}
        isSubmittingMove={isSubmittingMove}
        canSubmitMove={placedTilesPreview.length > 0 && Boolean(resolvedBootstrap.playerId)}
        submitResult={submitResult}
        onSubmitMove={handleSubmitMove}
      />
      ) : null}

        </>
      ) : null}

    </main>
  );
}
