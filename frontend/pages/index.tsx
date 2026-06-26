import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
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
import { getSupabaseBrowserClient } from "../lib/supabase/client";
import { getSupabaseEnv } from "../lib/supabase/env";
import type { MatchBootstrap, PendingInvite, ResumableMatch } from "../types/match";
import { BoardSection } from "../components/BoardSection";
import { RackSection } from "../components/RackSection";
import { PlayersSection } from "../components/PlayersSection";
import { MatchStatusPanel } from "../components/MatchStatusPanel";
import { MoveSubmitSection } from "../components/MoveSubmitSection";
import { GamePlayScreen } from "../components/GamePlayScreen";
import { HumanVsBotGameScreen } from "../components/HumanVsBotGameScreen";
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
type MatchLanguage = "pt-BR" | "pt-PT";
type PlayMode = "human_bot" | "human_human" | "multi_human";

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
  bot_action?: "place_word" | "pass" | "exchange_tiles";
  main_word?: string | null;
  bot_strategy?: string | null;
  pass_reason?: string | null;
  exchange_reason?: string | null;
  exchanged_count?: number | null;
  status?: string;
};

type BotTurnApiResponse =
  | {
      ok: true;
      result: RpcEasyBotTurnResult | null;
    }
  | {
      ok: false;
      error: string;
    };

type RpcVoteResult = {
  status?: string;
};

type RpcEasyBotVoteResult = {
  bot_action?: "vote";
  bot_verdict?: "accept" | "reject";
  bot_verdict_reason?: string | null;
  main_word?: string | null;
  status?: string;
};

type BotActionHistoryItem = {
  id: string;
  turnNumber: number;
  playerName: string;
  message: string;
  tone: "pending" | "success" | "error";
};

type TurnActionSummary = {
  actionLabel: string;
  beforeTurnNumber: number;
  afterTurnNumber: number;
  beforeRackCount: number;
  afterRackCount: number;
  beforeScore: number;
  afterScore: number;
  nextPlayerName: string;
};

type MatchTimelineTone = "info" | "success" | "warning" | "error";

type MatchTimelineItem = {
  id: string;
  turnNumber: number;
  actorName: string;
  label: string;
  detail: string;
  tone: MatchTimelineTone;
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

function formatBotTurnMessage(botTurnResult: RpcEasyBotTurnResult | null): string {
  if (botTurnResult?.bot_action === "place_word") {
    const word = botTurnResult.main_word ?? "uma palavra";
    const connectedStrategies = new Set([
      "easy_connected_dictionary_word",
      "playable_connected_dictionary_word",
    ]);

    if (
      botTurnResult.bot_strategy &&
      connectedStrategies.has(botTurnResult.bot_strategy)
    ) {
      return `Bot jogou ${word} conectando ao tabuleiro.`;
    }

    return `Bot jogou ${word} como abertura.`;
  }

  if (botTurnResult?.bot_action === "exchange_tiles") {
    const exchangedCount = botTurnResult.exchanged_count ?? 0;
    const reason = botTurnResult.exchange_reason
      ? ` Motivo: ${botTurnResult.exchange_reason}.`
      : "";

    return `Bot trocou ${exchangedCount} peça${exchangedCount === 1 ? "" : "s"}.${reason}`;
  }

  const passReason = botTurnResult?.pass_reason
    ? ` Motivo: ${botTurnResult.pass_reason}.`
    : "";

  return `Bot passou o turno automaticamente.${passReason}`;
}

function normalizePublicUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function buildInviteLink(publicUrl: string, inviteId: string) {
  const baseUrl = normalizePublicUrl(publicUrl);
  if (!baseUrl) {
    return "";
  }

  return `${baseUrl}/?inviteId=${encodeURIComponent(inviteId)}`;
}

function buildJoinLink(publicUrl: string, matchId: string) {
  const baseUrl = normalizePublicUrl(publicUrl);
  if (!baseUrl) {
    return "";
  }

  return `${baseUrl}/?joinMatchId=${encodeURIComponent(matchId)}`;
}

async function submitEasyBotTurnViaApi(
  matchId: string,
  playerId: string
): Promise<RpcEasyBotTurnResult | null> {
  const response = await fetch("/api/bot-turn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ matchId, playerId }),
  });

  const payload = (await response.json()) as BotTurnApiResponse;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.ok ? "Falha ao executar turno automatico do bot." : payload.error);
  }

  return payload.result;
}

function formatBotVoteMessage(botVoteResult: RpcEasyBotVoteResult | null): string {
  const word = botVoteResult?.main_word ?? "a palavra";
  const reason = botVoteResult?.bot_verdict_reason
    ? ` Motivo: ${botVoteResult.bot_verdict_reason}.`
    : "";

  if (botVoteResult?.bot_verdict === "accept") {
    return `Bot aceitou ${word}.${reason}`;
  }

  return `Bot rejeitou ${word}.${reason}`;
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

function getSlotShortLabel(slotId: string): string {
  const suffix = slotId.split(":").pop() ?? slotId;
  return `S${suffix}`;
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

type PatxangaPageProps = {
  operationalMode?: boolean;
};

export function PatxangaPage({ operationalMode = false }: PatxangaPageProps) {
  const [matchIdInput, setMatchIdInput] = useState("");
  const [playerIdInput, setPlayerIdInput] = useState("");
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authMode, setAuthMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
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
  const [turnActionMessage, setTurnActionMessage] = useState<string | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [selectedExchangeTileIds, setSelectedExchangeTileIds] = useState<string[]>([]);
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
  const [showAdvancedTools, setShowAdvancedTools] = useState(operationalMode);
  const [selectedPlayMode, setSelectedPlayMode] = useState<PlayMode>("human_bot");
  const [quickMatchSession, setQuickMatchSession] = useState<{
    matchId: string;
    hostUserId: string;
    guestUserId: string;
    opponentIsBot: boolean;
    language: MatchLanguage;
  } | null>(null);
  const [quickMatchLanguage, setQuickMatchLanguage] = useState<MatchLanguage>("pt-PT");
  const [inviteTargetUserId, setInviteTargetUserId] = useState("");
  const [isCreatingInviteLobby, setIsCreatingInviteLobby] = useState(false);
  const [inviteLobbyMessage, setInviteLobbyMessage] = useState<string | null>(null);
  const [inviteLobbyError, setInviteLobbyError] = useState<string | null>(null);
  const [tunnelPublicUrl, setTunnelPublicUrl] = useState("");
  const [tunnelCopyMessage, setTunnelCopyMessage] = useState<string | null>(null);
  const [tunnelCopyError, setTunnelCopyError] = useState<string | null>(null);
  const [lastInviteId, setLastInviteId] = useState<string | null>(null);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [lastJoinLink, setLastJoinLink] = useState<string | null>(null);
  const [incomingInviteId, setIncomingInviteId] = useState<string | null>(null);
  const [incomingJoinMatchId, setIncomingJoinMatchId] = useState<string | null>(null);
  const [isAcceptingIncomingInvite, setIsAcceptingIncomingInvite] = useState(false);
  const [isJoiningIncomingMatch, setIsJoiningIncomingMatch] = useState(false);
  const incomingInviteHandledRef = useRef<string | null>(null);
  const incomingJoinHandledRef = useRef<string | null>(null);
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
  const [isSubmittingPassTurn, setIsSubmittingPassTurn] = useState(false);
  const [isSubmittingExchange, setIsSubmittingExchange] = useState(false);
  const [isExchangeMode, setIsExchangeMode] = useState(false);
  const [isAutoPlayingBotTurn, setIsAutoPlayingBotTurn] = useState(false);
  const [botActionMessage, setBotActionMessage] = useState<string | null>(null);
  const [botActionError, setBotActionError] = useState<string | null>(null);
  const [botActionHistory, setBotActionHistory] = useState<BotActionHistoryItem[]>([]);
  const [lastTurnActionSummary, setLastTurnActionSummary] =
    useState<TurnActionSummary | null>(null);
  const [matchTimeline, setMatchTimeline] = useState<MatchTimelineItem[]>([]);
  const [isDirectMatchLaunch, setIsDirectMatchLaunch] = useState(false);
  const directMatchLaunchKeyRef = useRef<string | null>(null);
  const botAutoActionKeyRef = useRef<string | null>(null);
  const botAutoActionInFlightRef = useRef(false);
  const botAutoVoteKeyRef = useRef<string | null>(null);
  const botAutoVoteInFlightRef = useRef(false);
  const humanHumanAutoCreateRequestedRef = useRef(false);

  const resolvedBootstrap = useMatchBootstrap(bootstrapData ?? undefined);
  const { isConfigured } = getSupabaseEnv();
  const authenticatedUserId = authSession?.user.id ?? null;
  const authenticatedEmail = authSession?.user.email ?? null;
  const authenticatedDisplayName =
    (authSession?.user.user_metadata?.display_name as string | undefined) ??
    authenticatedEmail ??
    null;
  const effectiveProductUserId = authenticatedUserId ?? playerIdInput.trim();
  const isAuthenticated = Boolean(authenticatedUserId);
  const tunnelUrlLooksLocal =
    tunnelPublicUrl.includes("localhost") || tunnelPublicUrl.includes("127.0.0.1");

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

  const currentRackCount = resolvedBootstrap.playerContext?.rack_state?.length ?? 0;
  const currentPlayerScore = resolvedBootstrap.playerContext?.score ?? 0;

  function buildTurnActionSummary(
    actionLabel: string,
    before: {
      turnNumber: number;
      rackCount: number;
      score: number;
    },
    after: MatchBootstrap
  ): TurnActionSummary {
    const nextPlayer =
      after.playersSummary.find((player) => player.player_id === after.currentTurnPlayerId) ??
      null;

    return {
      actionLabel,
      beforeTurnNumber: before.turnNumber,
      afterTurnNumber: after.turnNumber,
      beforeRackCount: before.rackCount,
      afterRackCount: after.playerContext?.rack_state?.length ?? 0,
      beforeScore: before.score,
      afterScore: after.playerContext?.score ?? before.score,
      nextPlayerName: nextPlayer?.display_name ?? "aguardando definição",
    };
  }

  function appendMatchTimelineItem(item: Omit<MatchTimelineItem, "id">) {
    setMatchTimeline((current) => [
      {
        ...item,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      },
      ...current,
    ].slice(0, 8));
  }

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

  const localComposedWord = useMemo(() => {
    if (moveCompositionPlacements.length === 0) {
      return null;
    }

    const letters = moveCompositionPlacements.map((placement) => {
      const tile = rackTilesById.get(placement.tileId);
      const letter = placement.declaredLetter ?? tile?.letter ?? "?";
      return letter.toUpperCase();
    });

    return letters.join("");
  }, [moveCompositionPlacements, rackTilesById]);

  const moveCompositionIssues = useMemo(() => {
    return moveCompositionPlacements
      .map((placement) => {
        const tile = rackTilesById.get(placement.tileId);

        if (!requiresDeclaredLetter(tile?.special_type) || placement.declaredLetter) {
          return null;
        }

        const sourceLabel = placement.slotId
          ? getSlotShortLabel(placement.slotId)
          : formatBoardCoordinates(placement.cellKey);

        return `${sourceLabel} precisa de uma letra declarada para a peça especial.`;
      })
      .filter((issue): issue is string => issue !== null);
  }, [moveCompositionPlacements, rackTilesById]);

  const moveCompositionWarning =
    moveCompositionIssues.length > 0 ? moveCompositionIssues.join(" ") : null;

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
  const shouldUseAuthenticatedGameplayEntrypoints =
    Boolean(authenticatedUserId) &&
    resolvedBootstrap.playerContext?.user_id === authenticatedUserId;

  const isPlayerForfeited = resolvedBootstrap.playerContext?.has_forfeited === true;
  const canCurrentPlayerTakeTurnAction = isPlayersTurn && !isPlayerForfeited;
  const canSubmitExchange =
    isExchangeMode && !isSubmittingExchange && selectedExchangeTileIds.length > 0;
  const turnActionBlockReason = !isActive
    ? "A partida precisa estar ativa para executar ações de mesa."
    : isPlayerForfeited
      ? "Jogador desistente nao executa ações de mesa."
      : currentTurnPlayerSummary?.is_bot
        ? `Aguarde o turno automático de ${currentTurnPlayerSummary.display_name}.`
        : currentTurnPlayerSummary?.display_name
          ? `Aguarde ${currentTurnPlayerSummary.display_name} jogar.`
          : "Aguarde o seu turno para executar ações de mesa.";

  useEffect(() => {
    if (!isPlayersTurn || !isActive || isPlayerForfeited || !resolvedBootstrap.matchId) {
      resetExchangeSelection();
    }
  }, [isPlayersTurn, isActive, isPlayerForfeited, resolvedBootstrap.matchId]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateAuthSession() {
      const client = getSupabaseBrowserClient();

      if (!client) {
        return;
      }

      const { data } = await client.auth.getSession();

      if (!cancelled) {
        setAuthSession(data.session ?? null);
      }

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        setAuthSession(session);
        if (session?.user.id) {
          setPlayerIdInput(session.user.id);
        }
      });

      return () => subscription.unsubscribe();
    }

    let unsubscribe: (() => void) | undefined;
    void hydrateAuthSession().then((nextUnsubscribe) => {
      unsubscribe = nextUnsubscribe;
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (authenticatedUserId) {
      setPlayerIdInput(authenticatedUserId);
    }
  }, [authenticatedUserId]);

  useEffect(() => {
    if (
      selectedPlayMode !== "human_human" ||
      !authenticatedUserId ||
      lastJoinLink ||
      isCreatingInviteLobby ||
      humanHumanAutoCreateRequestedRef.current
    ) {
      return;
    }

    humanHumanAutoCreateRequestedRef.current = true;
    void handleCreateOpenJoinLobby();
    // A criação automática deve reagir apenas ao estado da jornada, não recriar por mudança de identidade visual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUserId, isCreatingInviteLobby, lastJoinLink, selectedPlayMode]);

  useEffect(() => {
    if (!tunnelPublicUrl && typeof window !== "undefined") {
      setTunnelPublicUrl(window.location.origin);
    }
  }, [tunnelPublicUrl]);

  useEffect(() => {
    if (!lastInviteId) {
      return;
    }

    const nextInviteLink = buildInviteLink(tunnelPublicUrl, lastInviteId);
    setLastInviteLink(nextInviteLink || null);
  }, [lastInviteId, tunnelPublicUrl]);

  useEffect(() => {
    const matchId = quickMatchSession?.matchId ?? matchIdInput.trim();

    if (!matchId || lastInviteId) {
      return;
    }

    const nextJoinLink = buildJoinLink(tunnelPublicUrl, matchId);
    setLastJoinLink(nextJoinLink || null);
  }, [lastInviteId, matchIdInput, quickMatchSession?.matchId, tunnelPublicUrl]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get("inviteId")?.trim() ?? "";
    const joinMatchId = params.get("joinMatchId")?.trim() ?? "";

    if (inviteId) {
      setIncomingInviteId(inviteId);
      setSessionActionMessage(
        authenticatedUserId
          ? "Link de convite detectado. Tentando aceitar o convite..."
          : "Link de convite detectado. Entre com a conta convidada para aceitar."
      );
    }

    if (joinMatchId) {
      setIncomingJoinMatchId(joinMatchId);
      setSessionActionMessage(
        authenticatedUserId
          ? "Link de entrada detectado. Tentando entrar na mesa..."
          : "Link de entrada detectado. Entre ou crie conta para aderir à mesa."
      );
    }
  }, [authenticatedUserId]);

  useEffect(() => {
    if (!incomingInviteId || !authenticatedUserId) {
      return;
    }

    if (incomingInviteHandledRef.current === incomingInviteId) {
      return;
    }

    const inviteId = incomingInviteId;
    const userId = authenticatedUserId;
    let cancelled = false;
    incomingInviteHandledRef.current = inviteId;

    async function acceptIncomingInvite() {
      setIsAcceptingIncomingInvite(true);
      setSessionListsError(null);
      setSessionActionMessage("Aceitando convite recebido pelo link...");

      try {
        const result = await acceptInvite({
          inviteId,
          userId,
        });

        if (cancelled) {
          return;
        }

        setMatchIdInput(result.matchId);
        setPlayerIdInput(userId);
        await openMatchSession(result.matchId, userId);
        await handleLoadSessionLists();
        setSessionActionMessage("Convite aceito. A mesa foi aberta nesta sessão.");

        if (typeof window !== "undefined") {
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.delete("inviteId");
          window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}`);
        }
      } catch (error) {
        if (!cancelled) {
          incomingInviteHandledRef.current = null;
          setSessionListsError(
            error instanceof Error
              ? error.message
              : "Falha ao aceitar o convite recebido pelo link."
          );
        }
      } finally {
        if (!cancelled) {
          setIsAcceptingIncomingInvite(false);
        }
      }
    }

    void acceptIncomingInvite();

    return () => {
      cancelled = true;
    };
    // The handlers are intentionally omitted; this effect is keyed by the link token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUserId, incomingInviteId]);

  useEffect(() => {
    if (!incomingJoinMatchId || !authenticatedUserId) {
      return;
    }

    if (incomingJoinHandledRef.current === incomingJoinMatchId) {
      return;
    }

    const matchId = incomingJoinMatchId;
    const userId = authenticatedUserId;
    let cancelled = false;
    incomingJoinHandledRef.current = matchId;

    async function joinIncomingMatch() {
      setIsJoiningIncomingMatch(true);
      setSessionListsError(null);
      setSessionActionMessage("Entrando na mesa recebida pelo link...");

      try {
        const resumeResult = await resumeMatch({
          matchId,
          userId,
        });

        if (!resumeResult.canResume) {
          const client = await getConfiguredBrowserClient();
          const { error } = await client.rpc("join_patxanga_match", {
            p_match_id: matchId,
            p_user_id: userId,
            p_guest_name: authenticatedDisplayName ?? "Convidado Patxanga",
            p_is_bot: false,
            p_bot_level: null,
            p_bot_profile: null,
          });

          if (error) {
            throw new Error(error.message);
          }
        }

        if (cancelled) {
          return;
        }

        setMatchIdInput(matchId);
        setPlayerIdInput(userId);
        await openMatchSession(matchId, userId);
        await handleLoadSessionLists();
        setSessionActionMessage("Você entrou na mesa. Aguarde o host iniciar a partida.");

        if (typeof window !== "undefined") {
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.delete("joinMatchId");
          window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}`);
        }
      } catch (error) {
        if (!cancelled) {
          incomingJoinHandledRef.current = null;
          setSessionListsError(
            error instanceof Error
              ? error.message
              : "Falha ao entrar na mesa recebida pelo link."
          );
        }
      } finally {
        if (!cancelled) {
          setIsJoiningIncomingMatch(false);
        }
      }
    }

    void joinIncomingMatch();

    return () => {
      cancelled = true;
    };
    // The handlers are intentionally omitted; this effect is keyed by the link token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedDisplayName, authenticatedUserId, incomingJoinMatchId]);

  useEffect(() => {
    if (!resolvedBootstrap.matchId || !playerIdInput || resolvedBootstrap.status !== "active") {
      return;
    }

    let cancelled = false;

    async function refreshActiveMatchSnapshot() {
      if (
        isSubmittingMove ||
        isSubmittingExchange ||
        isSubmittingVote ||
        isCreatingBotMatch ||
        botAutoActionInFlightRef.current
      ) {
        return;
      }

      try {
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

        const refreshedTurnPlayer =
          refreshedData.playersSummary.find(
            (player) => player.player_id === refreshedData.currentTurnPlayerId
          ) ?? null;

        if (!refreshedTurnPlayer?.is_bot && !botAutoActionInFlightRef.current) {
          setIsAutoPlayingBotTurn(false);
        }
      } catch {
        // Background sync must not block the player's manual actions.
      }
    }

    const timer = window.setInterval(() => {
      void refreshActiveMatchSnapshot();
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [
    isCreatingBotMatch,
    isSubmittingExchange,
    isSubmittingMove,
    isSubmittingVote,
    playerIdInput,
    resolvedBootstrap.matchId,
    resolvedBootstrap.status,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const directMatchId = params.get("matchId")?.trim() ?? "";
    const directUserId = params.get("userId")?.trim() ?? "";

    if (!directMatchId || !directUserId) {
      return;
    }

    const launchKey = `${directMatchId}:${directUserId}`;
    if (directMatchLaunchKeyRef.current === launchKey) {
      return;
    }

    directMatchLaunchKeyRef.current = launchKey;
    setIsDirectMatchLaunch(true);
    setMatchIdInput(directMatchId);
    setPlayerIdInput(directUserId);
    void openMatchSession(directMatchId, directUserId);
    // Direct URL bootstrap must run once per page load; the ref prevents duplicate launches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const matchId = resolvedBootstrap.matchId;
    const currentTurnPlayerId = resolvedBootstrap.currentTurnPlayerId;
    const botActionKey = [
      matchId,
      currentTurnPlayerId,
      resolvedBootstrap.turnNumber,
    ].join(":");

    if (botAutoActionKeyRef.current === botActionKey) {
      return;
    }

    let cancelled = false;

    async function submitEasyBotTurn() {
      if (
        botAutoActionKeyRef.current === botActionKey ||
        botAutoActionInFlightRef.current
      ) {
        return;
      }

      botAutoActionKeyRef.current = botActionKey;
      botAutoActionInFlightRef.current = true;
      setIsAutoPlayingBotTurn(true);
      setBotActionError(null);
      setBotActionMessage(
        `${currentTurnPlayerSummary?.display_name ?? "Bot"} esta tentando uma jogada.`
      );
      appendMatchTimelineItem({
        turnNumber: resolvedBootstrap.turnNumber,
        actorName: currentTurnPlayerSummary?.display_name ?? "Bot",
        label: "Bot pensando",
        detail: "Tentando uma jogada automatica no backend.",
        tone: "info",
      });
      setBotActionHistory((current) => [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          turnNumber: resolvedBootstrap.turnNumber,
          playerName: currentTurnPlayerSummary?.display_name ?? "Bot",
          message: "Tentando jogada automatica.",
          tone: "pending" as const,
        },
        ...current,
      ].slice(0, 5));

      try {
        const botTurnResult = await submitEasyBotTurnViaApi(
          matchId,
          currentTurnPlayerId
        );

        if (cancelled) {
          return;
        }

        const refreshedData = await loadMatchBootstrap({
          matchId,
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

        const nextMessage = formatBotTurnMessage(botTurnResult);
        setBotActionMessage(nextMessage);
        appendMatchTimelineItem({
          turnNumber: resolvedBootstrap.turnNumber,
          actorName: currentTurnPlayerSummary?.display_name ?? "Bot",
          label: botTurnResult?.bot_action === "place_word" ? "Bot jogou" : "Bot passou",
          detail: nextMessage,
          tone: "success",
        });
        setBotActionHistory((current) => [
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            turnNumber: resolvedBootstrap.turnNumber,
            playerName: currentTurnPlayerSummary?.display_name ?? "Bot",
            message: nextMessage,
            tone: "success" as const,
          },
          ...current,
        ].slice(0, 5));
      } catch (error) {
        if (!cancelled) {
          botAutoActionKeyRef.current = null;
          const nextError =
            error instanceof Error
              ? error.message
              : "Falha ao executar turno automatico do bot.";

          setBotActionError(nextError);
          setBotActionMessage(null);
          appendMatchTimelineItem({
            turnNumber: resolvedBootstrap.turnNumber,
            actorName: currentTurnPlayerSummary?.display_name ?? "Bot",
            label: "Falha do bot",
            detail: nextError,
            tone: "error",
          });
          setBotActionHistory((current) => [
            {
              id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              turnNumber: resolvedBootstrap.turnNumber,
              playerName: currentTurnPlayerSummary?.display_name ?? "Bot",
              message: nextError,
              tone: "error" as const,
            },
            ...current,
          ].slice(0, 5));
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
      !isVoting ||
      !resolvedBootstrap.matchId ||
      !pendingVoteMove?.move_id ||
      botAutoVoteInFlightRef.current
    ) {
      return;
    }

    const botVoter =
      resolvedBootstrap.playersSummary.find(
        (player) => player.is_bot && player.player_id !== pendingVoteMove.player_id
      ) ?? null;

    if (!botVoter) {
      return;
    }

    const botVoteKey = [
      resolvedBootstrap.matchId,
      pendingVoteMove.move_id,
      botVoter.player_id,
    ].join(":");

    if (botAutoVoteKeyRef.current === botVoteKey) {
      return;
    }

    let cancelled = false;

    async function submitEasyBotVote() {
      if (
        botAutoVoteKeyRef.current === botVoteKey ||
        botAutoVoteInFlightRef.current
      ) {
        return;
      }

      botAutoVoteKeyRef.current = botVoteKey;
      botAutoVoteInFlightRef.current = true;
      setIsAutoPlayingBotTurn(true);
      setBotActionError(null);
      setBotActionMessage(`${botVoter?.display_name ?? "Bot"} esta avaliando a palavra.`);
      appendMatchTimelineItem({
        turnNumber: resolvedBootstrap.turnNumber,
        actorName: botVoter?.display_name ?? "Bot",
        label: "Bot votando",
        detail: `Avaliando ${pendingVoteMove?.main_word ?? "palavra pendente"}.`,
        tone: "info",
      });

      try {
        const client = getSupabaseBrowserClient();

        if (!client) {
          throw new Error("Supabase client indisponivel para voto automatico do bot.");
        }

        const { data, error } = await client.rpc("submit_patxanga_easy_bot_vote", {
          p_match_id: resolvedBootstrap.matchId,
          p_player_id: botVoter?.player_id,
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

        const botVoteResult = data as RpcEasyBotVoteResult | null;
        const nextMessage = formatBotVoteMessage(botVoteResult);
        setBotActionMessage(nextMessage);
        appendMatchTimelineItem({
          turnNumber: resolvedBootstrap.turnNumber,
          actorName: botVoter?.display_name ?? "Bot",
          label: botVoteResult?.bot_verdict === "accept" ? "Bot aceitou" : "Bot rejeitou",
          detail: nextMessage,
          tone: botVoteResult?.bot_verdict === "accept" ? "success" : "warning",
        });
        setBotActionHistory((current) => [
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            turnNumber: resolvedBootstrap.turnNumber,
            playerName: botVoter?.display_name ?? "Bot",
            message: nextMessage,
            tone: botVoteResult?.bot_verdict === "accept" ? "success" as const : "error" as const,
          },
          ...current,
        ].slice(0, 5));
      } catch (error) {
        if (!cancelled) {
          botAutoVoteKeyRef.current = null;
          const nextError =
            error instanceof Error
              ? error.message
              : "Falha ao executar voto automatico do bot.";

          setBotActionError(nextError);
          setBotActionMessage(null);
          appendMatchTimelineItem({
            turnNumber: resolvedBootstrap.turnNumber,
            actorName: botVoter?.display_name ?? "Bot",
            label: "Falha no voto do bot",
            detail: nextError,
            tone: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setIsAutoPlayingBotTurn(false);
        }
        botAutoVoteInFlightRef.current = false;
      }
    }

    const timer = window.setTimeout(() => {
      void submitEasyBotVote();
    }, 350);
    const retryTimer = window.setInterval(() => {
      void submitEasyBotVote();
    }, 2500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearInterval(retryTimer);
    };
  }, [
    isVoting,
    pendingVoteMove,
    playerIdInput,
    resolvedBootstrap.matchId,
    resolvedBootstrap.playersSummary,
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
        const client = getSupabaseBrowserClient();

        if (!client) {
          throw new Error("Supabase client indisponivel no frontend.");
        }

        const { data, error } = shouldUseAuthenticatedGameplayEntrypoints
          ? await client.rpc("preview_patxanga_my_move", {
              p_match_id: resolvedBootstrap.matchId,
              p_placed_tiles: placedTilesPreview,
            })
          : await client.rpc("preview_patxanga_move", {
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
    shouldUseAuthenticatedGameplayEntrypoints,
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
    setBotActionMessage(null);
    setBotActionHistory([]);
    setLastTurnActionSummary(null);
    setMatchTimeline([]);
    setIsAutoPlayingBotTurn(false);
    setTurnActionMessage(null);
    setSelectedTileId(null);
    setSelectedTileIds([]);
    setSelectedExchangeTileIds([]);
    setSelectedRackSlotId(null);
    setIsExchangeMode(false);
    setLocalPlacements({});
    setLocalDeclaredLetters({});
    setLocalRackSlotDrafts({});
    setLocalRackSlotTileAssignments({});
    setLocalRackSlotAssociations({});
    setMovePreview(null);
    botAutoActionInFlightRef.current = false;
    botAutoActionKeyRef.current = null;
    botAutoVoteInFlightRef.current = false;
    botAutoVoteKeyRef.current = null;

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

  function handleClearRackSlotAssociation(slotId: string) {
    setLocalRackSlotAssociations((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
    setSelectedRackSlotId(slotId);
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

  function resetExchangeSelection() {
    setSelectedExchangeTileIds([]);
    setIsExchangeMode(false);
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

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      const client = await getConfiguredBrowserClient();
      const email = authEmail.trim();
      const password = authPassword;

      if (!email || !password) {
        throw new Error("Informe email e senha para continuar.");
      }

      const result =
        authMode === "sign_up"
          ? await client.auth.signUp({
              email,
              password,
              options: {
                data: {
                  display_name: authDisplayName.trim() || email,
                },
              },
            })
          : await client.auth.signInWithPassword({
              email,
              password,
            });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data.session) {
        setAuthSession(result.data.session);
        setPlayerIdInput(result.data.session.user.id);
      }

      setAuthPassword("");
      setAuthMessage(
        authMode === "sign_up"
          ? "Conta criada e sessão iniciada para jogar."
          : "Sessão iniciada para jogar."
      );
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Falha na autenticação."
      );
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleSignOut() {
    setIsAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      const client = await getConfiguredBrowserClient();
      const { error } = await client.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      setAuthSession(null);
      setAuthMessage("Sessão encerrada.");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Falha ao encerrar sessão."
      );
    } finally {
      setIsAuthLoading(false);
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

      const hostUserId = authenticatedUserId ?? crypto.randomUUID();
      const guestUserId = crypto.randomUUID();

      const { data: matchId, error: createError } = authenticatedUserId
        ? await client.rpc("create_patxanga_my_match", {
            p_host_guest_name: authenticatedDisplayName ?? "Host Local",
            p_language: quickMatchLanguage,
            p_match_mode: "synchronous",
            p_max_players: 2,
          })
        : await client.rpc("create_patxanga_match", {
            p_host_user_id: hostUserId,
            p_host_guest_name: "Host Local",
            p_language: quickMatchLanguage,
            p_match_mode: "synchronous",
            p_max_players: 2,
          });

      if (createError) {
        throw new Error(createError.message);
      }

      const { error: joinError } = await client.rpc("join_patxanga_match", {
        p_match_id: matchId,
        p_user_id: guestUserId,
        p_guest_name: authenticatedUserId ? "Convidado Local" : "Guest Local",
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
        language: quickMatchLanguage,
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

      const hostUserId = authenticatedUserId ?? crypto.randomUUID();
      const botUserId = crypto.randomUUID();

      const { data: matchId, error: createError } = authenticatedUserId
        ? await client.rpc("create_patxanga_my_match", {
            p_host_guest_name: authenticatedDisplayName ?? "Humano Local",
            p_language: quickMatchLanguage,
            p_match_mode: "synchronous",
            p_max_players: 2,
          })
        : await client.rpc("create_patxanga_match", {
            p_host_user_id: hostUserId,
            p_host_guest_name: "Humano Local",
            p_language: quickMatchLanguage,
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
        language: quickMatchLanguage,
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

  async function handleCreateInviteLobby() {
    setInviteLobbyError(null);
    setInviteLobbyMessage(null);
    setQuickMatchError(null);

    if (!authenticatedUserId) {
      setInviteLobbyError("Entre com sua conta antes de criar uma mesa por convite.");
      return;
    }

    const normalizedInviteUserId = inviteTargetUserId.trim();

    if (!normalizedInviteUserId) {
      setInviteLobbyError("Informe o user_id do convidado nesta fase.");
      return;
    }

    if (normalizedInviteUserId === authenticatedUserId) {
      setInviteLobbyError("Convide outro usuário; o host já está na mesa.");
      return;
    }

    setIsCreatingInviteLobby(true);

    try {
      const client = await getConfiguredBrowserClient();

      const { data: lobbyData, error: lobbyError } = await client.rpc(
        "create_patxanga_my_match_lobby",
        {
          p_host_guest_name: authenticatedDisplayName ?? "Host Patxanga",
          p_language: quickMatchLanguage,
          p_match_mode: "synchronous",
          p_max_players: 4,
        }
      );

      if (lobbyError) {
        throw new Error(lobbyError.message);
      }

      if (!lobbyData) {
        throw new Error("Backend não retornou dados do lobby criado.");
      }

      const createResult = lobbyData as RpcCreateMatchLobbyResult;

      const { data: inviteData, error: inviteError } = await client.rpc(
        "invite_patxanga_my_player",
        {
          p_match_id: createResult.match_id,
          p_invited_user_id: normalizedInviteUserId,
          p_expires_at: null,
        }
      );

      if (inviteError) {
        throw new Error(inviteError.message);
      }

      if (!inviteData) {
        throw new Error("Backend não retornou dados do convite criado.");
      }

      const inviteResult = inviteData as RpcInvitePlayerResult;
      const nextInviteLink = buildInviteLink(tunnelPublicUrl, inviteResult.invite_id);
      const nextQuickMatchSession = {
        matchId: createResult.match_id,
        hostUserId: authenticatedUserId,
        guestUserId: normalizedInviteUserId,
        opponentIsBot: false,
        language: quickMatchLanguage,
      };

      setQuickMatchSession(nextQuickMatchSession);
      setSessionSwitchDraft(nextQuickMatchSession);
      setSessionSwitchError(null);
      setMatchIdInput(createResult.match_id);
      setPlayerIdInput(authenticatedUserId);
      setLastInviteId(inviteResult.invite_id);
      setLastInviteLink(nextInviteLink || null);
      setInviteLobbyMessage(
        nextInviteLink
          ? "Mesa criada. Copie o link de convite e envie ao convidado."
          : "Mesa criada e convite enviado. Confirme a URL pública para gerar o link."
      );
      await openMatchSession(createResult.match_id, authenticatedUserId);
      await handleLoadSessionLists();
    } catch (error) {
      setInviteLobbyError(
        error instanceof Error ? error.message : "Falha ao criar mesa por convite."
      );
    } finally {
      setIsCreatingInviteLobby(false);
    }
  }

  async function handleCreateOpenJoinLobby() {
    setInviteLobbyError(null);
    setInviteLobbyMessage(null);
    setQuickMatchError(null);
    setLastInviteId(null);
    setLastInviteLink(null);

    if (!authenticatedUserId) {
      setInviteLobbyError("Entre com sua conta antes de criar uma mesa por link.");
      return;
    }

    setIsCreatingInviteLobby(true);

    try {
      const client = await getConfiguredBrowserClient();

      const { data: lobbyData, error: lobbyError } = await client.rpc(
        "create_patxanga_my_match_lobby",
        {
          p_host_guest_name: authenticatedDisplayName ?? "Host Patxanga",
          p_language: quickMatchLanguage,
          p_match_mode: "synchronous",
          p_max_players: 2,
        }
      );

      if (lobbyError) {
        throw new Error(lobbyError.message);
      }

      if (!lobbyData) {
        throw new Error("Backend não retornou dados do lobby criado.");
      }

      const createResult = lobbyData as RpcCreateMatchLobbyResult;
      const nextJoinLink = buildJoinLink(tunnelPublicUrl, createResult.match_id);

      setQuickMatchSession(null);
      setSessionSwitchError(null);
      setMatchIdInput(createResult.match_id);
      setPlayerIdInput(authenticatedUserId);
      setLastJoinLink(nextJoinLink || null);
      setInviteLobbyMessage(
        nextJoinLink
          ? "Mesa criada. Copie o link aberto e envie ao convidado."
          : "Mesa criada. Confirme a URL pública para gerar o link aberto."
      );
      await openMatchSession(createResult.match_id, authenticatedUserId);
      await handleLoadSessionLists();
    } catch (error) {
      setInviteLobbyError(
        error instanceof Error ? error.message : "Falha ao criar mesa por link."
      );
    } finally {
      setIsCreatingInviteLobby(false);
    }
  }

  function handleSelectPlayMode(mode: PlayMode, enabled: boolean) {
    if (!enabled) {
      return;
    }

    setSelectedPlayMode(mode);

    if (mode !== "human_human") {
      return;
    }

    if (!authenticatedUserId) {
      setInviteLobbyMessage(null);
      setInviteLobbyError("Entre com sua conta para gerar automaticamente o link humano x humano.");
      return;
    }

    if (lastJoinLink || isCreatingInviteLobby) {
      return;
    }

    humanHumanAutoCreateRequestedRef.current = true;
    void handleCreateOpenJoinLobby();
  }

  async function handleOpenQuickMatch(userId: string) {
    if (!quickMatchSession) {
      return;
    }

    handlePrepareSession(quickMatchSession.matchId, userId);
    await openMatchSession(quickMatchSession.matchId, userId);
  }

  async function handleCopyTunnelText(label: string, value: string | null | undefined) {
    const normalizedValue = value?.trim();

    setTunnelCopyMessage(null);
    setTunnelCopyError(null);

    if (!normalizedValue) {
      setTunnelCopyError(`Nada para copiar em ${label}.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(normalizedValue);
      setTunnelCopyMessage(`${label} copiado.`);
    } catch {
      setTunnelCopyError(`Não consegui copiar ${label}. Selecione o texto e copie manualmente.`);
    }
  }

  async function handleRefreshCurrentMatch() {
    const normalizedMatchId = resolvedBootstrap.matchId ?? matchIdInput.trim();
    const normalizedUserId = playerIdInput.trim();

    if (!normalizedMatchId || !normalizedUserId) {
      setSessionListsError("Abra uma mesa ou entre com sua conta antes de atualizar.");
      return;
    }

    setSessionListsError(null);
    setSessionActionMessage(null);

    await openMatchSession(normalizedMatchId, normalizedUserId);
    await handleLoadSessionLists();
    setSessionActionMessage("Mesa e central atualizadas.");
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
    const userId = effectiveProductUserId;

    if (!userId) {
      setSessionListsError("Entre com sua conta ou informe um user_id em ferramentas avancadas.");
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
    const userId = effectiveProductUserId;

    if (!userId) {
      setSessionListsError("Entre com sua conta ou informe um user_id em ferramentas avancadas.");
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
    const userId = effectiveProductUserId;

    if (!userId) {
      setSessionListsError("Entre com sua conta ou informe um user_id em ferramentas avancadas.");
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
    const userId = effectiveProductUserId;

    if (!userId) {
      setSessionListsError("Entre com sua conta ou informe um user_id em ferramentas avancadas.");
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

    if (moveCompositionWarning) {
      setErrorMessage(moveCompositionWarning);
      return;
    }

    setIsSubmittingMove(true);
    setErrorMessage(null);
    setSubmitResult(null);
    setVoteResolutionMessage(null);
    setTurnActionMessage(null);

    const before = {
      turnNumber: resolvedBootstrap.turnNumber,
      rackCount: currentRackCount,
      score: currentPlayerScore,
    };
    const actorName =
      resolvedBootstrap.playersSummary.find(
        (player) => player.player_id === resolvedBootstrap.playerId
      )?.display_name ?? "Jogador";
    const preparedWord = localComposedWord ?? movePreview?.main_word ?? "palavra preparada";
    const submittedUsedSkipTile = placedTilesPreview.some((tile) => {
      return normalizeSpecialType(rackTilesById.get(tile.tile_id)?.special_type) === "skip_turn";
    });

    try {
      const client = getSupabaseBrowserClient();

      if (!client) {
        throw new Error("Supabase client not configured in frontend environment.");
      }

      const { data, error } = shouldUseAuthenticatedGameplayEntrypoints
        ? await client.rpc("submit_patxanga_my_move", {
            p_match_id: resolvedBootstrap.matchId,
            p_placed_tiles: placedTilesPreview,
          })
        : await client.rpc("submit_patxanga_move", {
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

      const nextTurnPlayer =
        refreshedData.playersSummary.find(
          (player) => player.player_id === refreshedData.currentTurnPlayerId
        ) ?? null;
      const skippedTurnReturnedToViewer =
        submittedUsedSkipTile &&
        refreshedData.status === "active" &&
        Boolean(refreshedData.currentTurnPlayerId) &&
        refreshedData.currentTurnPlayerId === resolvedBootstrap.playerId;
      const skippedPlayerName =
        refreshedData.playersSummary.find((player) => {
          return (
            player.player_id !== refreshedData.currentTurnPlayerId &&
            player.has_forfeited === false
          );
        })?.display_name ?? "o adversario";
      const postSubmitTurnActionMessage = skippedTurnReturnedToViewer
        ? `Pula a vez aplicado: ${skippedPlayerName} perdeu o turno. Sua vez novamente.`
        : "Jogada enviada com sucesso.";

      if (refreshedData.status === "active" && nextTurnPlayer?.is_bot) {
        const botActionKey = [
          refreshedData.matchId,
          nextTurnPlayer.player_id,
          refreshedData.turnNumber,
        ].join(":");

        botAutoActionKeyRef.current = botActionKey;
        botAutoActionInFlightRef.current = true;
        setIsAutoPlayingBotTurn(true);
        setBotActionError(null);
        setBotActionMessage(`${nextTurnPlayer.display_name} esta tentando uma jogada.`);

        const botTurnResult = await submitEasyBotTurnViaApi(
          refreshedData.matchId,
          nextTurnPlayer.player_id
        );

        const afterBotData = await loadMatchBootstrap({
          matchId: refreshedData.matchId,
          playerId: playerIdInput,
        });
        const nextBotMessage = formatBotTurnMessage(botTurnResult);

        setBootstrapData(afterBotData);
        await refreshPendingVoteContext(
          afterBotData.matchId,
          playerIdInput,
          afterBotData.status
        );
        setBotActionMessage(nextBotMessage);
        setBotActionHistory((current) => [
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            turnNumber: refreshedData.turnNumber,
            playerName: nextTurnPlayer.display_name,
            message: nextBotMessage,
            tone: "success" as const,
          },
          ...current,
        ].slice(0, 5));
        botAutoActionInFlightRef.current = false;
        setIsAutoPlayingBotTurn(false);
      } else {
        setBootstrapData(refreshedData);
        await refreshPendingVoteContext(
          refreshedData.matchId,
          playerIdInput,
          refreshedData.status
        );
        if (skippedTurnReturnedToViewer) {
          setBotActionError(null);
          setBotActionMessage(null);
          botAutoActionKeyRef.current = null;
          botAutoActionInFlightRef.current = false;
        }
      }

      clearMoveCompositionPreview();
      resetExchangeSelection();
      setLastTurnActionSummary(
        buildTurnActionSummary("Jogada enviada", before, refreshedData)
      );
      appendMatchTimelineItem({
        turnNumber: before.turnNumber,
        actorName,
        label: skippedTurnReturnedToViewer ? "Pula a vez aplicado" : "Jogada enviada",
        detail: skippedTurnReturnedToViewer
          ? `Jogada ${preparedWord} enviada; ${skippedPlayerName} perdeu o turno.`
          : `Jogada ${preparedWord} enviada para validação.`,
        tone: refreshedData.status === "voting" ? "warning" : "success",
      });
      setTurnActionMessage(postSubmitTurnActionMessage);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao enviar jogada."
      );
    } finally {
      setIsAutoPlayingBotTurn(false);
      botAutoActionInFlightRef.current = false;
      setIsSubmittingMove(false);
    }
  }

  async function handleForceBotTurn() {
    if (!resolvedBootstrap.matchId || !resolvedBootstrap.currentTurnPlayerId) {
      setBotActionError("Partida sem turno atual para executar bot.");
      return;
    }

    if (!isCurrentTurnBot) {
      setBotActionError("O turno atual não pertence ao bot.");
      return;
    }

    setIsAutoPlayingBotTurn(true);
    setBotActionError(null);
    setBotActionMessage("Bot executando turno agora.");

    try {
      const botTurnResult = await submitEasyBotTurnViaApi(
        resolvedBootstrap.matchId,
        resolvedBootstrap.currentTurnPlayerId
      );

      const refreshedData = await loadMatchBootstrap({
        matchId: resolvedBootstrap.matchId,
        playerId: playerIdInput,
      });

      setBootstrapData(refreshedData);
      await refreshPendingVoteContext(
        refreshedData.matchId,
        playerIdInput,
        refreshedData.status
      );

      const nextMessage = formatBotTurnMessage(botTurnResult);
      setBotActionMessage(nextMessage);
      setBotActionHistory((current) => [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          turnNumber: resolvedBootstrap.turnNumber,
          playerName: currentTurnPlayerSummary?.display_name ?? "Bot",
          message: nextMessage,
          tone: "success" as const,
        },
        ...current,
      ].slice(0, 5));
    } catch (error) {
      setBotActionError(
        error instanceof Error ? error.message : "Falha ao executar turno automatico do bot."
      );
      setBotActionMessage(null);
      botAutoActionKeyRef.current = null;
    } finally {
      setIsAutoPlayingBotTurn(false);
    }
  }

  async function handlePassTurn() {
    if (!resolvedBootstrap.matchId || !resolvedBootstrap.playerId) {
      setErrorMessage("Sessão de partida incompleta para passar o turno.");
      return;
    }

    if (!canCurrentPlayerTakeTurnAction) {
      setErrorMessage("Ação de passagem permitida apenas no seu turno.");
      return;
    }

    setIsSubmittingPassTurn(true);
    setErrorMessage(null);
    setTurnActionMessage("Passando turno...");
    setVoteResolutionMessage(null);

    const before = {
      turnNumber: resolvedBootstrap.turnNumber,
      rackCount: currentRackCount,
      score: currentPlayerScore,
    };
    const actorName =
      resolvedBootstrap.playersSummary.find(
        (player) => player.player_id === resolvedBootstrap.playerId
      )?.display_name ?? "Jogador";

    try {
      const client = getSupabaseBrowserClient();
      if (!client) {
        throw new Error("Supabase client not configured in frontend environment.");
      }

      const { data, error } = shouldUseAuthenticatedGameplayEntrypoints
        ? await client.rpc("submit_patxanga_my_pass_turn", {
            p_match_id: resolvedBootstrap.matchId,
          })
        : await client.rpc("submit_patxanga_pass_turn", {
            p_match_id: resolvedBootstrap.matchId,
            p_player_id: resolvedBootstrap.playerId,
          });

      if (error) {
        throw new Error(error.message);
      }

      setSubmitResult(data ?? null);
      const refreshedData = await refreshMatchStateAfterTurnAction();
      clearMoveCompositionPreview();
      if (refreshedData) {
        setLastTurnActionSummary(
          buildTurnActionSummary("Turno passado", before, refreshedData)
        );
        appendMatchTimelineItem({
          turnNumber: before.turnNumber,
          actorName,
          label: "Turno passado",
          detail: `Próximo turno de ${refreshedData.playersSummary.find(
            (player) => player.player_id === refreshedData.currentTurnPlayerId
          )?.display_name ?? "outro jogador"}.`,
          tone: "info",
        });
      }
      setTurnActionMessage("Turno passado com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao passar o turno."
      );
    } finally {
      setIsSubmittingPassTurn(false);
    }
  }

  async function handleSubmitExchange() {
    if (!resolvedBootstrap.matchId || !resolvedBootstrap.playerId) {
      setErrorMessage("Sessão de partida incompleta para trocar peças.");
      return;
    }

    if (!canCurrentPlayerTakeTurnAction) {
      setErrorMessage("Ação de troca permitida apenas no seu turno.");
      return;
    }

    if (!isExchangeMode) {
      setErrorMessage("Abra o modo de troca antes de trocar peças.");
      return;
    }

    const exchangeTileIds = Array.from(new Set(selectedExchangeTileIds)).filter((id) => id);

    if (exchangeTileIds.length === 0) {
      setErrorMessage("Selecione pelo menos uma peça para trocar.");
      return;
    }

    setIsSubmittingExchange(true);
    setErrorMessage(null);
    setTurnActionMessage(`Trocando ${exchangeTileIds.length} peça(s)...`);
    setVoteResolutionMessage(null);

    const before = {
      turnNumber: resolvedBootstrap.turnNumber,
      rackCount: currentRackCount,
      score: currentPlayerScore,
    };
    const actorName =
      resolvedBootstrap.playersSummary.find(
        (player) => player.player_id === resolvedBootstrap.playerId
      )?.display_name ?? "Jogador";

    try {
      const client = getSupabaseBrowserClient();
      if (!client) {
        throw new Error("Supabase client not configured in frontend environment.");
      }

      const { data, error } = shouldUseAuthenticatedGameplayEntrypoints
        ? await client.rpc("submit_patxanga_my_exchange_tiles", {
            p_match_id: resolvedBootstrap.matchId,
            p_tile_ids: exchangeTileIds,
          })
        : await client.rpc("submit_patxanga_exchange_tiles", {
            p_match_id: resolvedBootstrap.matchId,
            p_player_id: resolvedBootstrap.playerId,
            p_tile_ids: exchangeTileIds,
          });

      if (error) {
        throw new Error(error.message);
      }

      setSubmitResult(data ?? null);
      const refreshedData = await refreshMatchStateAfterTurnAction();
      clearMoveCompositionPreview();
      resetExchangeSelection();
      if (refreshedData) {
        setLastTurnActionSummary(
          buildTurnActionSummary(
            `Troca de ${exchangeTileIds.length} peça${exchangeTileIds.length === 1 ? "" : "s"}`,
            before,
            refreshedData
          )
        );
        appendMatchTimelineItem({
          turnNumber: before.turnNumber,
          actorName,
          label: "Troca de peças",
          detail: `${exchangeTileIds.length} peça${exchangeTileIds.length === 1 ? "" : "s"} enviada${exchangeTileIds.length === 1 ? "" : "s"} para troca.`,
          tone: "info",
        });
      }
      setTurnActionMessage(
        `Troca concluída com ${exchangeTileIds.length} peça${exchangeTileIds.length === 1 ? "" : "s"}.`
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao trocar peças."
      );
    } finally {
      setIsSubmittingExchange(false);
    }
  }

  function handleToggleExchangeMode() {
    if (isExchangeMode) {
      setIsExchangeMode(false);
      setSelectedExchangeTileIds([]);
      return;
    }

    setIsExchangeMode(true);
    setErrorMessage(null);
    setTurnActionMessage(null);
    setIsSubmittingExchange(false);
    setSelectedTileId(null);
    clearMoveCompositionPreview();
  }

  async function refreshPendingVoteContext(matchId: string, userId: string, status: string) {
    if (status !== "voting") {
      setPendingVoteContext(null);
      setPendingVoteError(null);
      return;
    }

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

  async function refreshMatchStateAfterTurnAction(): Promise<MatchBootstrap | null> {
    if (!resolvedBootstrap.matchId) {
      return null;
    }

    const refreshedData = await loadMatchBootstrap({
      matchId: resolvedBootstrap.matchId,
      playerId: playerIdInput,
    });

    setBootstrapData(refreshedData);
    await refreshPendingVoteContext(refreshedData.matchId, playerIdInput, refreshedData.status);
    resetExchangeSelection();
    return refreshedData;
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
      const client = getSupabaseBrowserClient();

      if (!client) {
        throw new Error("Supabase client indisponivel no frontend.");
      }

      const { data, error } = shouldUseAuthenticatedGameplayEntrypoints
        ? await client.rpc("submit_patxanga_my_vote", {
            p_move_id: pendingVoteMove.move_id,
            p_vote_reject: voteReject,
          })
        : await client.rpc("submit_patxanga_vote", {
            p_move_id: pendingVoteMove.move_id,
            p_voter_player_id: pendingVoteRequestPlayer.player_id,
            p_vote_reject: voteReject,
          });

      if (error) {
        throw new Error(error.message);
      }

      setVoteResult(data ?? null);
      const nextVoteResolutionMessage = formatVoteResolutionMessage(data);
      setVoteResolutionMessage(nextVoteResolutionMessage);

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
      appendMatchTimelineItem({
        turnNumber: resolvedBootstrap.turnNumber,
        actorName:
          pendingVoteRequestPlayer.display_name ??
          (voteReject ? "Votante rejeitou" : "Votante aceitou"),
        label: voteReject ? "Voto para rejeitar" : "Voto para aceitar",
        detail:
          nextVoteResolutionMessage ??
          `Voto registrado para ${pendingVoteMove.main_word ?? "palavra pendente"}.`,
        tone: voteReject ? "warning" : "success",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Falha ao enviar voto."
      );
    } finally {
      setIsSubmittingVote(false);
    }
  }

  function handlePlaceTile(cellKey: string, typedCell: BoardCell) {
    if (isExchangeMode) {
      return;
    }

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
    if (isExchangeMode) {
      setSelectedTileId(null);
      setSelectedRackSlotId(null);
      setSelectedExchangeTileIds((current) =>
        current.includes(tileId)
          ? current.filter((id) => id !== tileId)
          : [...current, tileId]
      );
      return;
    }

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

  const hasBotPlayer = resolvedBootstrap.playersSummary.some((player) => player.is_bot);

  if (isDirectMatchLaunch && !resolvedBootstrap.matchId) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          fontFamily: '"Avenir Next", "Trebuchet MS", sans-serif',
          color: "#1f2933",
          background:
            "radial-gradient(circle at 10% 0%, rgba(187, 247, 208, 0.42), transparent 30%), radial-gradient(circle at 95% 12%, rgba(254, 243, 199, 0.5), transparent 32%), #f8fafc",
        }}
      >
        <section
          style={{
            width: "min(560px, 100%)",
            padding: 24,
            borderRadius: 24,
            border: "1px solid #d7d0bf",
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 18px 50px rgba(61, 46, 24, 0.12)",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
            Patxanga local
          </p>
          <h1 style={{ margin: "8px 0 10px", fontSize: 28 }}>Abrindo partida contra bot</h1>
          <p style={{ margin: 0, color: "#475569" }}>
            {errorMessage ?? "Carregando o tabuleiro e o rack do jogador..."}
          </p>
        </section>
      </main>
    );
  }

  if (resolvedBootstrap.matchId && hasBotPlayer) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 24,
          fontFamily: '"Avenir Next", "Trebuchet MS", sans-serif',
          maxWidth: 1280,
          margin: "0 auto",
          color: "#1f2933",
          background:
            "radial-gradient(circle at 10% 0%, rgba(187, 247, 208, 0.42), transparent 30%), radial-gradient(circle at 95% 12%, rgba(254, 243, 199, 0.5), transparent 32%), #f8fafc",
        }}
      >
        <HumanVsBotGameScreen
          stateLabel={stateLabel}
          matchLanguage={resolvedBootstrap.language}
          isWaiting={isWaiting}
          isActive={isActive}
          isVoting={isVoting}
          isFinished={isFinished}
          endSummary={resolvedBootstrap.endSummary}
          winnerPlayerId={resolvedBootstrap.winnerPlayerId}
          finishedAt={resolvedBootstrap.finishedAt}
          dictionarySummary={resolvedBootstrap.dictionarySummary}
          viewerPlayerId={resolvedBootstrap.playerId}
          playersSummary={resolvedBootstrap.playersSummary}
          currentTurnPlayerId={resolvedBootstrap.currentTurnPlayerId}
          turnNumber={resolvedBootstrap.turnNumber}
          boardState={resolvedBootstrap.boardState}
          compositionPlacementsByCell={compositionPlacementsByCell}
          pendingVoteTilesByCell={pendingVoteTilesByCell}
          selectedTileId={selectedTileId}
          selectedTileIds={isExchangeMode ? selectedExchangeTileIds : selectedTileIds}
          selectedRackSlotId={selectedRackSlotId}
          previewTileIds={previewTileIds}
          playerRackState={orderedPlayerRackState}
          rackSlotAssociations={localRackSlotAssociations}
          rackSlotAssociationLabels={rackSlotAssociationLabels}
          placedTilesPreview={placedTilesPreview}
          localComposedWord={localComposedWord}
          moveCompositionWarning={moveCompositionWarning}
          canSubmitMove={
            placedTilesPreview.length > 0 &&
            Boolean(resolvedBootstrap.playerId) &&
            !moveCompositionWarning
          }
          isSubmittingMove={isSubmittingMove}
          movePreview={movePreview}
          isLoadingMovePreview={isLoadingMovePreview}
          pendingVoteError={pendingVoteError}
          pendingVoteMove={pendingVoteMove}
          canCurrentViewerVote={canCurrentViewerVote}
          isSubmittingVote={isSubmittingVote}
          voteResult={voteResult}
          voteResolutionMessage={voteResolutionMessage}
          showDebug={false}
          botActionMessage={botActionMessage}
          botActionError={botActionError}
          botActionHistory={botActionHistory}
          lastTurnActionSummary={lastTurnActionSummary}
          matchTimeline={matchTimeline}
          isAutoPlayingBotTurn={isAutoPlayingBotTurn}
          buildCellKey={buildCellKey}
          renderCellLabel={renderCellLabel}
          renderCellBackground={renderCellBackground}
          onPlaceTile={handlePlaceTile}
          onToggleTile={handleToggleTile}
          onToggleRackSlot={handleToggleRackSlot}
          onClearRackSlotAssignment={handleClearRackSlotAssignment}
          onClearRackSlotAssociation={handleClearRackSlotAssociation}
          onClearPreview={clearMoveCompositionPreview}
          onChangeRackSlotDraft={handleChangeRackSlotDraft}
          onReorderTile={handleReorderRackItem}
          onSubmitMove={handleSubmitMove}
          onApprove={() => handleSubmitVote(false)}
          onReject={() => handleSubmitVote(true)}
          onToggleDebug={() => setShowDebug((current) => !current)}
          isExchangeMode={isExchangeMode}
          selectedExchangeTileIds={selectedExchangeTileIds}
          canCurrentPlayerTakeTurnAction={canCurrentPlayerTakeTurnAction}
          canSubmitExchange={canSubmitExchange}
          isSubmittingPassTurn={isSubmittingPassTurn}
          isSubmittingExchange={isSubmittingExchange}
          turnActionMessage={turnActionMessage}
          turnActionBlockReason={turnActionBlockReason}
          onPassTurn={handlePassTurn}
          onToggleExchangeMode={handleToggleExchangeMode}
          onSubmitExchange={handleSubmitExchange}
          onForceBotTurn={handleForceBotTurn}
          onCreateNewBotMatch={handleCreateHumanVsBotMatch}
          isCreatingBotMatch={isCreatingBotMatch}
        />

        {errorMessage ? (
          <p
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 14,
              border: "1px solid #fca5a5",
              background: "#fff1f2",
              color: "#991b1b",
              fontWeight: 800,
            }}
          >
            {errorMessage}
          </p>
        ) : null}
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px clamp(14px, 3vw, 34px) 40px",
        fontFamily: '"Avenir Next", "Trebuchet MS", sans-serif',
        maxWidth: 1280,
        margin: "0 auto",
        color: "#17211c",
        background:
          "radial-gradient(circle at 4% 4%, rgba(234, 179, 8, 0.18), transparent 24%), radial-gradient(circle at 96% 6%, rgba(20, 184, 166, 0.16), transparent 26%), linear-gradient(180deg, #fffaf0 0%, #f5f7ee 46%, #eef4f0 100%)",
      }}
    >
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "clamp(22px, 4vw, 42px)",
          borderRadius: 34,
          background:
            "radial-gradient(circle at 17% 18%, rgba(252, 211, 77, 0.30), transparent 30%), radial-gradient(circle at 90% 10%, rgba(45, 212, 191, 0.22), transparent 28%), linear-gradient(135deg, #261a12 0%, #5b321b 44%, #103f37 100%)",
          color: "#fff8e7",
          boxShadow: "0 28px 70px rgba(43, 33, 24, 0.30)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -70,
            bottom: -86,
            width: 300,
            height: 300,
            borderRadius: 44,
            transform: "rotate(-10deg)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.04))",
            border: "1px solid rgba(255,255,255,0.16)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            gap: 22,
            flexWrap: "wrap",
            alignItems: "stretch",
          }}
        >
          <div style={{ maxWidth: 700 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.8,
                textTransform: "uppercase",
                color: "#fde68a",
              }}
            >
              Jogo de palavras em português
            </div>
            <h1 style={{ margin: "10px 0 0", fontSize: "clamp(48px, 8vw, 92px)", lineHeight: 0.86, letterSpacing: -3 }}>
              Patxanga
            </h1>
            <p style={{ margin: "18px 0 0", maxWidth: 620, fontSize: 20, lineHeight: 1.45, color: "#ffedd5" }}>
              Entre, escolha o modo e jogue. Sem códigos, sem terminal, sem passos escondidos.
            </p>
          </div>

          <div
            style={{
              minWidth: 280,
              flex: "0 1 360px",
              padding: 18,
              borderRadius: 26,
              background: "rgba(255, 255, 255, 0.13)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              backdropFilter: "blur(10px)",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 950, textTransform: "uppercase", color: "#fde68a", letterSpacing: 1.2 }}>
              Comece agora
            </div>
            <div style={{ display: "grid", gap: 9 }}>
              {[
                isAuthenticated ? "Conta pronta" : "Entrar ou criar conta",
                "Escolher o tipo de jogo",
                "Abrir a partida",
              ].map((item, index) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.12)",
                  }}
                >
                  <span
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      background: "#fde68a",
                      color: "#3b2414",
                      fontWeight: 950,
                    }}
                  >
                    {index + 1}
                  </span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 2, fontSize: 13, color: "#ffedd5" }}>
              {isConfigured ? "Servidor online e dicionário pt-PT expandido ativo." : "Servidor indisponível no momento."}
            </div>
          </div>
        </div>
      </section>

      <section
        data-testid="auth-product-panel"
        style={{
          marginTop: 24,
          padding: 20,
          border: "1px solid #c7d2fe",
          borderRadius: 22,
          background:
            "radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 32%), linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)",
          boxShadow: "0 12px 30px rgba(30, 64, 175, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, textTransform: "uppercase", color: "#3730a3" }}>
              Sua conta
            </div>
            <h2 style={{ margin: "8px 0 6px" }}>
              {isAuthenticated ? "Você está pronto para jogar" : "Entre para salvar e jogar online"}
            </h2>
            <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.5 }}>
              A conta guarda suas mesas, permite receber links de convite e retomar partidas
              sem copiar códigos técnicos.
            </p>
          </div>

          {isAuthenticated ? (
            <div
              style={{
                minWidth: 280,
                padding: 14,
                borderRadius: 16,
                border: "1px solid #a5b4fc",
                background: "#ffffff",
                color: "#1e1b4b",
            }}
          >
              <div data-testid="auth-session-summary" style={{ fontWeight: 900 }}>
                {authenticatedDisplayName ?? "Usuário autenticado"}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: "#4338ca", fontWeight: 800 }}>
                Conta conectada nesta mesa.
                <span data-testid="auth-active-user-id" style={{ display: "none" }}>{authenticatedUserId}</span>
              </div>
              <button
                type="button"
                data-testid="auth-sign-out"
                onClick={handleSignOut}
                disabled={isAuthLoading}
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  cursor: isAuthLoading ? "not-allowed" : "pointer",
                }}
              >
                {isAuthLoading ? "Encerrando..." : "Sair"}
              </button>
            </div>
          ) : (
            <form
              data-testid="auth-form"
              onSubmit={handleAuthSubmit}
              style={{
                minWidth: 300,
                display: "grid",
                gap: 10,
                padding: 14,
                borderRadius: 16,
                border: "1px solid #c7d2fe",
                background: "#ffffff",
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  data-testid="auth-mode-sign-in"
                  onClick={() => setAuthMode("sign_in")}
                  style={{
                    padding: "8px 11px",
                    borderRadius: 999,
                    border: "1px solid #a5b4fc",
                    background: authMode === "sign_in" ? "#3730a3" : "#ffffff",
                    color: authMode === "sign_in" ? "#ffffff" : "#3730a3",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  data-testid="auth-mode-sign-up"
                  onClick={() => setAuthMode("sign_up")}
                  style={{
                    padding: "8px 11px",
                    borderRadius: 999,
                    border: "1px solid #a5b4fc",
                    background: authMode === "sign_up" ? "#3730a3" : "#ffffff",
                    color: authMode === "sign_up" ? "#ffffff" : "#3730a3",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Criar conta
                </button>
              </div>

              {authMode === "sign_up" ? (
                <label style={{ display: "grid", gap: 5, fontSize: 13, fontWeight: 800 }}>
                  Nome na mesa
                  <input
                    data-testid="auth-display-name"
                    value={authDisplayName}
                    onChange={(event) => setAuthDisplayName(event.target.value)}
                    placeholder="ex: Paulo"
                    style={{ padding: 9, borderRadius: 10, border: "1px solid #c7d2fe" }}
                  />
                </label>
              ) : null}

              <label style={{ display: "grid", gap: 5, fontSize: 13, fontWeight: 800 }}>
                Email
                <input
                  data-testid="auth-email"
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="voce@example.com"
                  style={{ padding: 9, borderRadius: 10, border: "1px solid #c7d2fe" }}
                />
              </label>

              <label style={{ display: "grid", gap: 5, fontSize: 13, fontWeight: 800 }}>
                Senha
                <input
                  data-testid="auth-password"
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  placeholder="mínimo 6 caracteres"
                  style={{ padding: 9, borderRadius: 10, border: "1px solid #c7d2fe" }}
                />
              </label>

              <button
                type="submit"
                data-testid="auth-submit"
                disabled={!isConfigured || isAuthLoading}
                style={{
                  padding: "10px 14px",
                  cursor: !isConfigured || isAuthLoading ? "not-allowed" : "pointer",
                  borderRadius: 12,
                  border: "1px solid #3730a3",
                  background: "#4f46e5",
                  color: "#ffffff",
                  fontWeight: 900,
                }}
              >
                {isAuthLoading
                  ? "Processando..."
                  : authMode === "sign_up"
                    ? "Criar conta e entrar"
                    : "Entrar"}
              </button>
            </form>
          )}
        </div>

        {authMessage ? (
          <p data-testid="auth-message" style={{ margin: "12px 0 0", color: "#166534", fontWeight: 800 }}>
            {authMessage}
          </p>
        ) : null}
        {authError ? (
          <p data-testid="auth-error" style={{ margin: "12px 0 0", color: "#b00020", fontWeight: 800 }}>
            {authError}
          </p>
        ) : null}
      </section>

      <section
        data-testid="primary-product-actions"
        style={{
          marginTop: 24,
          padding: 20,
          borderRadius: 26,
          border: "1px solid #d6c7a8",
          background:
            "radial-gradient(circle at 12% 8%, rgba(245, 158, 11, 0.16), transparent 28%), linear-gradient(135deg, #fffaf0 0%, #f8fafc 62%, #eef6f0 100%)",
          boxShadow: "0 18px 42px rgba(56, 45, 31, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 760 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.3,
                textTransform: "uppercase",
                color: "#92400e",
              }}
            >
              Escolha sua mesa
            </div>
            <h2 style={{ margin: "8px 0 6px", fontSize: 32, lineHeight: 1.05 }}>
              Como você quer jogar?
            </h2>
            <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.5 }}>
              Escolha uma opção. A próxima etapa aparece logo abaixo, sem painéis técnicos ou códigos.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {[
            {
              id: "human_bot" as const,
              title: "Humano x bot",
              status: "Disponível agora",
              body: "Entre numa partida imediata contra o bot. Boa para testar regras, dicionário e ritmo de jogo.",
              enabled: isConfigured,
              accent: "#166534",
              background: "#ecfdf5",
            },
            {
              id: "human_human" as const,
              title: "Humano x humano",
              status: "Disponível por link",
              body: "Crie uma mesa online e envie um link. O convidado entra com a própria conta.",
              enabled: isConfigured,
              accent: "#1d4ed8",
              background: "#eff6ff",
            },
            {
              id: "multi_human" as const,
              title: "Múltiplos humanos",
              status: "Em construção",
              body: "Mesas com três ou mais jogadores ainda precisam de convites múltiplos e controle de assentos.",
              enabled: false,
              accent: "#9a3412",
              background: "#fff7ed",
            },
          ].map((mode) => {
            const isSelected = selectedPlayMode === mode.id;

            return (
              <article
                key={mode.id}
                data-testid={`play-mode-${mode.id}`}
                onClick={() => handleSelectPlayMode(mode.id, mode.enabled)}
                style={{
                  display: "grid",
                  gap: 12,
                  padding: 16,
                  borderRadius: 22,
                  border: isSelected ? `2px solid ${mode.accent}` : "1px solid rgba(120, 113, 108, 0.22)",
                  background: mode.background,
                  boxShadow: isSelected
                    ? "0 16px 34px rgba(15, 23, 42, 0.16)"
                    : "0 8px 20px rgba(15, 23, 42, 0.05)",
                  opacity: mode.enabled ? 1 : 0.72,
                  cursor: mode.enabled ? "pointer" : "default",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 950, color: mode.accent }}>
                      {mode.title}
                    </div>
                    <div style={{ marginTop: 5, fontSize: 12, fontWeight: 900, color: mode.accent }}>
                      {mode.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid={`play-mode-select-${mode.id}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSelectPlayMode(mode.id, mode.enabled);
                    }}
                    disabled={!mode.enabled}
                    style={{
                      alignSelf: "flex-start",
                      padding: "7px 10px",
                      borderRadius: 999,
                      border: `1px solid ${mode.accent}`,
                      background: isSelected ? mode.accent : "#ffffff",
                      color: isSelected ? "#ffffff" : mode.accent,
                      cursor: mode.enabled ? "pointer" : "not-allowed",
                      fontWeight: 900,
                    }}
                  >
                    {isSelected ? "Selecionado" : "Selecionar"}
                  </button>
                </div>

                <p style={{ margin: 0, minHeight: 62, color: "#374151", lineHeight: 1.45 }}>
                  {mode.body}
                </p>
              </article>
            );
          })}
        </div>

        <div
          data-testid="selected-mode-guide"
          style={{
            marginTop: 18,
            padding: 18,
            borderRadius: 22,
            border: "1px solid rgba(120, 113, 108, 0.24)",
            background: "#ffffff",
            boxShadow: "0 14px 32px rgba(15, 23, 42, 0.08)",
          }}
        >
          {selectedPlayMode === "human_bot" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 22 }}>Partida contra bot</h3>
                <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.45 }}>
                  Abre direto no tabuleiro. O bot joga automaticamente quando chegar a vez dele.
                </p>
              </div>
              <button
                type="button"
                data-testid="bot-match-create"
                onClick={handleCreateHumanVsBotMatch}
                disabled={!isConfigured || isCreatingBotMatch}
                style={{
                  padding: "13px 18px",
                  borderRadius: 16,
                  border: "1px solid #166534",
                  background: !isConfigured || isCreatingBotMatch ? "#e7e5e4" : "#166534",
                  color: !isConfigured || isCreatingBotMatch ? "#78716c" : "#ffffff",
                  cursor: !isConfigured || isCreatingBotMatch ? "not-allowed" : "pointer",
                  fontWeight: 950,
                }}
              >
                {isCreatingBotMatch ? "Criando..." : "Abrir contra bot"}
              </button>
            </div>
          ) : null}

          {selectedPlayMode === "human_human" ? (
            <div data-testid="human-human-guided-flow" style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 22 }}>Partida humano x humano</h3>
                  <p style={{ margin: "6px 0 0", color: "#4b5563", lineHeight: 1.45 }}>
                    Ao escolher este modo, a mesa e o link são gerados automaticamente. Envie o link ao outro jogador.
                  </p>
                </div>
                <div
                  data-testid="human-human-flow-status"
                  style={{
                    padding: "9px 12px",
                    borderRadius: 999,
                    background: lastJoinLink ? "#dcfce7" : isCreatingInviteLobby ? "#dbeafe" : isAuthenticated ? "#fef3c7" : "#ffedd5",
                    color: lastJoinLink ? "#166534" : isCreatingInviteLobby ? "#1d4ed8" : "#9a3412",
                    fontWeight: 950,
                  }}
                >
                  {lastJoinLink
                    ? "Link pronto"
                    : isCreatingInviteLobby
                      ? "Gerando link..."
                      : isAuthenticated
                        ? "Clique para gerar"
                        : "Login necessário"}
                </div>
              </div>

              {!isAuthenticated ? (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    color: "#9a3412",
                    fontWeight: 900,
                  }}
                >
                  Entre ou crie conta no bloco acima. Depois clique novamente em Humano x humano e o link será gerado sem outros passos.
                </div>
              ) : null}

              {isAuthenticated && !lastJoinLink ? (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1e40af",
                    fontWeight: 900,
                  }}
                >
                  {isCreatingInviteLobby
                    ? "Criando a mesa online e preparando o link para envio..."
                    : "Clique no cartão Humano x humano para gerar o link automaticamente."}
                </div>
              ) : null}

              {lastJoinLink ? (
                <div
                  data-testid="human-human-link-ready"
                  style={{
                    display: "grid",
                    gap: 12,
                    padding: 16,
                    borderRadius: 18,
                    background: "#f0fdfa",
                    border: "1px solid #99f6e4",
                  }}
                >
                  <strong style={{ color: "#115e59", fontSize: 18 }}>Link pronto para enviar</strong>
                  <div
                    data-testid="human-human-join-link"
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: "#ffffff",
                      border: "1px solid #99f6e4",
                      wordBreak: "break-all",
                      color: "#134e4a",
                      fontWeight: 850,
                    }}
                  >
                    {lastJoinLink}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      data-testid="human-human-copy-link"
                      onClick={() => handleCopyTunnelText("link humano x humano", lastJoinLink)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 14,
                        border: "1px solid #0f766e",
                        background: "#0f766e",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: 950,
                      }}
                    >
                      Copiar link para enviar
                    </button>
                    <button
                      type="button"
                      data-testid="human-human-refresh-table"
                      onClick={handleRefreshCurrentMatch}
                      disabled={!effectiveProductUserId || isLoading}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 14,
                        border: "1px solid #1d4ed8",
                        background: "#ffffff",
                        color: "#1d4ed8",
                        cursor: !effectiveProductUserId || isLoading ? "not-allowed" : "pointer",
                        fontWeight: 950,
                      }}
                    >
                      {isLoading ? "Atualizando..." : "Ver se convidado entrou"}
                    </button>
                    {isWaiting && resolvedBootstrap.playerId && !resolvedBootstrap.playerContext?.has_forfeited ? (
                      <button
                        type="button"
                        data-testid="human-human-start-match"
                        onClick={handleStartCurrentLobby}
                        disabled={isStartingCurrentLobby || isLoading}
                        style={{
                          padding: "12px 16px",
                          borderRadius: 14,
                          border: "1px solid #166534",
                          background: "#16a34a",
                          color: "#ffffff",
                          cursor: isStartingCurrentLobby || isLoading ? "not-allowed" : "pointer",
                          fontWeight: 950,
                        }}
                      >
                        {isStartingCurrentLobby ? "Iniciando..." : "Iniciar partida"}
                      </button>
                    ) : null}
                  </div>
                  <p style={{ margin: 0, color: "#115e59", lineHeight: 1.45 }}>
                    Envie este link. O convidado abre, entra com a conta dele e entra na mesa. Depois use “Ver se convidado entrou” e “Iniciar partida”.
                  </p>
                </div>
              ) : null}

              {inviteLobbyMessage ? (
                <div
                  data-testid="human-human-flow-message"
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "#ecfdf5",
                    border: "1px solid #bbf7d0",
                    color: "#166534",
                    fontWeight: 900,
                  }}
                >
                  {inviteLobbyMessage}
                </div>
              ) : null}

              {sessionActionMessage ? (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1d4ed8",
                    fontWeight: 900,
                  }}
                >
                  {sessionActionMessage}
                </div>
              ) : null}

              {tunnelCopyMessage ? (
                <div
                  data-testid="human-human-copy-message"
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "#ecfdf5",
                    border: "1px solid #bbf7d0",
                    color: "#166534",
                    fontWeight: 900,
                  }}
                >
                  {tunnelCopyMessage}
                </div>
              ) : null}

              {inviteLobbyError || tunnelCopyError ? (
                <div
                  data-testid="human-human-flow-error"
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "#fff1f2",
                    border: "1px solid #fecdd3",
                    color: "#b00020",
                    fontWeight: 900,
                  }}
                >
                  {inviteLobbyError ?? tunnelCopyError}
                </div>
              ) : null}
            </div>
          ) : null}

          {selectedPlayMode === "multi_human" ? (
            <div style={{ display: "grid", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 22 }}>Múltiplos humanos</h3>
              <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.45 }}>
                Este modo ainda não está liberado. A base técnica virá depois do fluxo humano x humano estável.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {(showAdvancedTools && selectedPlayMode === "human_human") || incomingInviteId || incomingJoinMatchId ? (
      <section
        data-testid="tunnel-human-match-panel"
        style={{
          marginTop: 24,
          padding: 22,
          borderRadius: 28,
          border: "1px solid #99c2b0",
          background:
            "radial-gradient(circle at 8% 10%, rgba(20, 184, 166, 0.18), transparent 30%), radial-gradient(circle at 92% 18%, rgba(245, 158, 11, 0.18), transparent 28%), linear-gradient(135deg, #f5fbf7 0%, #ffffff 58%, #fff8ed 100%)",
          boxShadow: "0 18px 46px rgba(36, 67, 53, 0.12)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ fontSize: 12, fontWeight: 950, letterSpacing: 1.4, textTransform: "uppercase", color: "#0f766e" }}>
              Mesa online
            </div>
            <h2 style={{ margin: "8px 0 6px", fontSize: 32, lineHeight: 1.05 }}>
              Convide alguém com um link
            </h2>
            <p style={{ margin: 0, color: "#46534d", lineHeight: 1.55 }}>
              O host cria a mesa, copia o link e envia. O convidado abre, entra com conta própria
              e aparece na partida automaticamente.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gap: 8,
              minWidth: 230,
              padding: 14,
              borderRadius: 20,
              background: "#ffffff",
              border: "1px solid #c9dfd2",
            }}
          >
            <strong style={{ color: "#14532d" }}>Status</strong>
            <span>{isConfigured ? "Servidor pronto" : "Servidor indisponível"}</span>
            <span>{isAuthenticated ? "Você está conectado" : "Entre para criar links"}</span>
            <span>{resolvedBootstrap.matchId ? `Mesa ${stateLabel}` : "Sem mesa aberta"}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {incomingInviteId || incomingJoinMatchId ? (
            <div
              data-testid="incoming-invite-link-panel"
              style={{
                gridColumn: "1 / -1",
                padding: 16,
                borderRadius: 20,
                background: isAuthenticated ? "#ecfdf5" : "#fff7ed",
                border: isAuthenticated ? "1px solid #86efac" : "1px solid #fed7aa",
                color: isAuthenticated ? "#14532d" : "#9a3412",
              }}
            >
              <strong>{incomingJoinMatchId ? "Link de entrada aberto" : "Link de convite aberto"}</strong>
              <div style={{ marginTop: 6, lineHeight: 1.45 }}>
                {isAcceptingIncomingInvite || isJoiningIncomingMatch
                  ? "Processando o link e abrindo a mesa..."
                  : incomingJoinMatchId
                    ? isAuthenticated
                      ? "Conta autenticada. Você entrará na mesa automaticamente se ela ainda estiver aberta."
                      : "Entre ou crie conta para aderir a esta mesa."
                    : isAuthenticated
                      ? "Conta autenticada. Se o convite pertence a esta conta, ele será aceito automaticamente."
                      : "Entre ou crie conta com o email do convidado para aceitar este convite."}
              </div>
            </div>
          ) : null}

          <div style={{ padding: 16, borderRadius: 20, background: "#ffffff", border: "1px solid #c9dfd2" }}>
            <div style={{ fontSize: 13, fontWeight: 950, color: "#0f766e", textTransform: "uppercase" }}>
              Endereço usado no convite
            </div>
            <p style={{ margin: "8px 0 10px", color: "#4b5563", lineHeight: 1.45 }}>
              Normalmente já vem preenchido. Altere só se estiver testando outro endereço.
            </p>
            <input
              data-testid="tunnel-public-url"
              value={tunnelPublicUrl}
              onChange={(event) => setTunnelPublicUrl(event.target.value)}
              placeholder="https://frontend-blush-one-28.vercel.app"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 10,
                borderRadius: 12,
                border: "1px solid #99c2b0",
                fontWeight: 800,
              }}
            />
            {tunnelUrlLooksLocal ? (
              <div style={{ marginTop: 8, color: "#92400e", fontSize: 13, fontWeight: 800 }}>
                Esta URL parece local. Para convidar outro dispositivo, use a URL pública da alpha.
              </div>
            ) : null}
            <button
              type="button"
              data-testid="tunnel-copy-public-url"
              onClick={() => handleCopyTunnelText("URL pública", tunnelPublicUrl)}
              style={{
                marginTop: 10,
                padding: "10px 13px",
                borderRadius: 12,
                border: "1px solid #0f766e",
                background: "#0f766e",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 950,
              }}
            >
              Copiar endereço
            </button>
          </div>

          {showDebug ? (
          <div style={{ padding: 16, borderRadius: 20, background: "#ffffff", border: "1px solid #c9dfd2" }}>
            <div style={{ fontSize: 13, fontWeight: 950, color: "#0f766e", textTransform: "uppercase" }}>
              2. Identidade deste jogador
            </div>
            {isAuthenticated ? (
              <>
                <p style={{ margin: "8px 0 10px", color: "#4b5563", lineHeight: 1.45 }}>
                  Envie este código ao host se você for o convidado. Se você for o host, use-o apenas
                  para confirmar que está logado.
                </p>
                <div
                  data-testid="tunnel-active-user-id"
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1px solid #d1d5db",
                    fontFamily: "monospace",
                    fontSize: 13,
                    wordBreak: "break-all",
                  }}
                >
                  {authenticatedUserId}
                </div>
                <button
                  type="button"
                  data-testid="tunnel-copy-user-id"
                  onClick={() => handleCopyTunnelText("user_id", authenticatedUserId)}
                  style={{
                    marginTop: 10,
                    padding: "10px 13px",
                    borderRadius: 12,
                    border: "1px solid #0f766e",
                    background: "#ffffff",
                    color: "#0f766e",
                    cursor: "pointer",
                    fontWeight: 950,
                  }}
                >
                  Copiar meu user_id
                </button>
              </>
            ) : (
              <p style={{ margin: "8px 0 0", color: "#991b1b", fontWeight: 850, lineHeight: 1.45 }}>
                Faça login ou crie conta no painel Conta Patxanga acima. Depois volte aqui e copie seu user_id.
              </p>
            )}
          </div>
          ) : null}

          <div style={{ padding: 16, borderRadius: 20, background: "#ffffff", border: "1px solid #c9dfd2" }}>
            <div style={{ fontSize: 13, fontWeight: 950, color: "#0f766e", textTransform: "uppercase" }}>
              Criar convite
            </div>
            <p style={{ margin: "8px 0 10px", color: "#4b5563", lineHeight: 1.45 }}>
              Escolha o dicionário e gere um link. Esse é o único item que precisa enviar ao outro jogador.
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 850 }}>
                Dicionário
                <select
                  data-testid="tunnel-match-language"
                  value={quickMatchLanguage}
                  onChange={(event) => setQuickMatchLanguage(event.target.value as MatchLanguage)}
                  disabled={isCreatingInviteLobby}
                  style={{ padding: 10, borderRadius: 12, border: "1px solid #99c2b0", fontWeight: 850 }}
                >
                  <option value="pt-BR">pt-BR</option>
                  <option value="pt-PT">pt-PT</option>
                </select>
              </label>
              <button
                type="button"
                data-testid="tunnel-create-open-join-lobby"
                onClick={handleCreateOpenJoinLobby}
                disabled={!isAuthenticated || isCreatingInviteLobby}
                style={{
                  padding: "11px 14px",
                  borderRadius: 14,
                  border: "1px solid #0f766e",
                  background: !isAuthenticated || isCreatingInviteLobby ? "#d1d5db" : "#0f766e",
                  color: !isAuthenticated || isCreatingInviteLobby ? "#6b7280" : "#ffffff",
                  cursor: !isAuthenticated || isCreatingInviteLobby ? "not-allowed" : "pointer",
                  fontWeight: 950,
                }}
              >
                {isCreatingInviteLobby ? "Criando mesa..." : "Criar link de convite"}
              </button>
              {lastJoinLink ? (
                <div
                  data-testid="tunnel-join-link-box"
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: 12,
                    borderRadius: 14,
                    background: "#f0fdfa",
                    border: "1px solid #99f6e4",
                  }}
                >
                  <strong style={{ color: "#115e59" }}>Link pronto para enviar</strong>
                  <div
                    data-testid="tunnel-join-link"
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: "#ffffff",
                      border: "1px solid #99f6e4",
                      fontFamily: "monospace",
                      fontSize: 12,
                      wordBreak: "break-all",
                    }}
                  >
                    {lastJoinLink}
                  </div>
                  <button
                    type="button"
                    data-testid="tunnel-copy-join-link"
                    onClick={() => handleCopyTunnelText("link aberto", lastJoinLink)}
                    style={{
                      padding: "10px 13px",
                      borderRadius: 12,
                      border: "1px solid #0f766e",
                      background: "#0f766e",
                      color: "#ffffff",
                      cursor: "pointer",
                      fontWeight: 950,
                    }}
                  >
                    Copiar link
                  </button>
                  <p style={{ margin: 0, color: "#115e59", fontSize: 13, fontWeight: 850 }}>
                    Envie este link ao convidado. Depois que ele entrar, atualize a mesa e inicie a partida.
                  </p>
                </div>
              ) : null}
              {showDebug ? (
              <>
              <div style={{ height: 1, background: "#d1fae5" }} />
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 850 }}>
                user_id do convidado para convite nominal
                <input
                  data-testid="tunnel-invite-target-user-id"
                  value={inviteTargetUserId}
                  onChange={(event) => setInviteTargetUserId(event.target.value)}
                  placeholder="Cole aqui o UUID do convidado"
                  style={{ padding: 10, borderRadius: 12, border: "1px solid #99c2b0" }}
                />
              </label>
              <button
                type="button"
                data-testid="tunnel-create-invite-lobby"
                onClick={handleCreateInviteLobby}
                disabled={!isAuthenticated || isCreatingInviteLobby}
                style={{
                  padding: "11px 14px",
                  borderRadius: 14,
                  border: "1px solid #15803d",
                  background: !isAuthenticated || isCreatingInviteLobby ? "#d1d5db" : "#16a34a",
                  color: !isAuthenticated || isCreatingInviteLobby ? "#6b7280" : "#ffffff",
                  cursor: !isAuthenticated || isCreatingInviteLobby ? "not-allowed" : "pointer",
                  fontWeight: 950,
                }}
              >
                {isCreatingInviteLobby ? "Criando mesa..." : "Criar mesa e enviar convite"}
              </button>
              {lastInviteLink ? (
                <div
                  data-testid="tunnel-invite-link-box"
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: 12,
                    borderRadius: 14,
                    background: "#ecfdf5",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <strong style={{ color: "#14532d" }}>Link do convite pronto</strong>
                  <div
                    data-testid="tunnel-invite-link"
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: "#ffffff",
                      border: "1px solid #bbf7d0",
                      fontFamily: "monospace",
                      fontSize: 12,
                      wordBreak: "break-all",
                    }}
                  >
                    {lastInviteLink}
                  </div>
                  <button
                    type="button"
                    data-testid="tunnel-copy-invite-link"
                    onClick={() => handleCopyTunnelText("link de convite", lastInviteLink)}
                    style={{
                      padding: "10px 13px",
                      borderRadius: 12,
                      border: "1px solid #15803d",
                      background: "#15803d",
                      color: "#ffffff",
                      cursor: "pointer",
                      fontWeight: 950,
                    }}
                  >
                    Copiar link de convite
                  </button>
                </div>
              ) : null}
              </>
              ) : null}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <div style={{ padding: 16, borderRadius: 20, background: "#f8fafc", border: "1px solid #d1d5db" }}>
            <div style={{ fontSize: 13, fontWeight: 950, color: "#1d4ed8", textTransform: "uppercase" }}>
              Entrada do convidado
            </div>
            <p style={{ margin: "8px 0 10px", color: "#4b5563", lineHeight: 1.45 }}>
              Se você recebeu um link, basta entrar com sua conta. Se já estava nesta tela, atualize suas mesas.
            </p>
            <button
              type="button"
              data-testid="tunnel-refresh-invites"
              onClick={handleLoadSessionLists}
              disabled={!effectiveProductUserId || isLoadingSessionLists}
              style={{
                padding: "10px 13px",
                borderRadius: 12,
                border: "1px solid #1d4ed8",
                background: !effectiveProductUserId || isLoadingSessionLists ? "#d1d5db" : "#1d4ed8",
                color: !effectiveProductUserId || isLoadingSessionLists ? "#6b7280" : "#ffffff",
                cursor: !effectiveProductUserId || isLoadingSessionLists ? "not-allowed" : "pointer",
                fontWeight: 950,
              }}
            >
              {isLoadingSessionLists ? "Atualizando..." : "Atualizar minhas mesas"}
            </button>

            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {sessionListsLoaded && pendingInvites.length === 0 ? (
                <div style={{ color: "#6b7280", fontWeight: 800 }}>Nenhum convite pendente para esta conta.</div>
              ) : null}
              {pendingInvites.map((invite) => (
                <div
                  key={invite.inviteId}
                  data-testid="tunnel-pending-invite-card"
                  style={{ padding: 12, borderRadius: 14, background: "#ffffff", border: "1px solid #bfdbfe" }}
                >
                  <div style={{ fontWeight: 950, color: "#1d4ed8" }}>
                    Mesa {invite.language} aguardando aceite
                  </div>
                  <div style={{ marginTop: 4, color: "#4b5563", fontSize: 13 }}>
                    {invite.hostGuestName ? `Criada por ${invite.hostGuestName}.` : "Convite direto para esta conta."}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => handleAcceptInvite(invite.inviteId)}
                      disabled={inviteActionInFlightId === invite.inviteId || isLoading}
                      style={{
                        padding: "9px 12px",
                        borderRadius: 12,
                        border: "1px solid #16a34a",
                        background: "#16a34a",
                        color: "#ffffff",
                        cursor: inviteActionInFlightId === invite.inviteId || isLoading ? "not-allowed" : "pointer",
                        fontWeight: 950,
                      }}
                    >
                      {inviteActionInFlightId === invite.inviteId ? "Aceitando..." : "Aceitar e abrir mesa"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineInvite(invite.inviteId)}
                      disabled={inviteActionInFlightId === invite.inviteId || isLoading}
                      style={{
                        padding: "9px 12px",
                        borderRadius: 12,
                        border: "1px solid #b91c1c",
                        background: "#ffffff",
                        color: "#b91c1c",
                        cursor: inviteActionInFlightId === invite.inviteId || isLoading ? "not-allowed" : "pointer",
                        fontWeight: 950,
                      }}
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 16, borderRadius: 20, background: "#fff7ed", border: "1px solid #fed7aa" }}>
            <div style={{ fontSize: 13, fontWeight: 950, color: "#9a3412", textTransform: "uppercase" }}>
              Iniciar ou retomar
            </div>
            <p style={{ margin: "8px 0 10px", color: "#4b5563", lineHeight: 1.45 }}>
              Quando a mesa estiver pronta, inicie. Se a partida já existe, retome do ponto salvo.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                data-testid="tunnel-refresh-current-match"
                onClick={handleRefreshCurrentMatch}
                disabled={!effectiveProductUserId || isLoading}
                style={{
                  padding: "10px 13px",
                  borderRadius: 12,
                  border: "1px solid #9a3412",
                  background: "#ffffff",
                  color: "#9a3412",
                  cursor: !effectiveProductUserId || isLoading ? "not-allowed" : "pointer",
                  fontWeight: 950,
                }}
              >
                {isLoading ? "Atualizando..." : "Atualizar mesa aberta"}
              </button>
              {isWaiting && resolvedBootstrap.playerId && !resolvedBootstrap.playerContext?.has_forfeited ? (
                <button
                  type="button"
                  data-testid="tunnel-start-lobby"
                  onClick={handleStartCurrentLobby}
                  disabled={isStartingCurrentLobby || isLoading}
                  style={{
                    padding: "10px 13px",
                    borderRadius: 12,
                    border: "1px solid #9a3412",
                    background: "#9a3412",
                    color: "#ffffff",
                    cursor: isStartingCurrentLobby || isLoading ? "not-allowed" : "pointer",
                    fontWeight: 950,
                  }}
                >
                  {isStartingCurrentLobby ? "Iniciando..." : "Iniciar partida"}
                </button>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {sessionListsLoaded && resumableMatches.length === 0 ? (
                <div style={{ color: "#6b7280", fontWeight: 800 }}>Nenhuma partida retomável para esta conta.</div>
              ) : null}
              {resumableMatches.slice(0, 3).map((match) => (
                <div
                  key={`${match.matchId}-${match.playerId}`}
                  data-testid="tunnel-resumable-match-card"
                  style={{ padding: 12, borderRadius: 14, background: "#ffffff", border: "1px solid #fed7aa" }}
                >
                  <div style={{ fontWeight: 950, color: "#9a3412" }}>
                    {match.displayName} · {match.matchStatus} · turno {match.turnNumber}
                  </div>
                  <div style={{ marginTop: 4, color: "#4b5563", fontSize: 13 }}>
                    Idioma {match.language} · {match.score} ponto{match.score === 1 ? "" : "s"}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResumeListedMatch(match.matchId)}
                    disabled={isLoading}
                    style={{
                      marginTop: 9,
                      padding: "9px 12px",
                      borderRadius: 12,
                      border: "1px solid #9a3412",
                      background: "#9a3412",
                      color: "#ffffff",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      fontWeight: 950,
                    }}
                  >
                    Retomar esta partida
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {quickMatchSession && !quickMatchSession.opponentIsBot ? (
          <div
            data-testid="tunnel-created-match-summary"
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 18,
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              color: "#14532d",
              display: "grid",
              gap: 6,
            }}
          >
            <strong>Mesa criada por convite</strong>
            <span>Idioma {quickMatchSession.language}. Envie o link ao convidado e inicie quando ele entrar.</span>
            {showAdvancedTools ? (
              <span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                match_id: {quickMatchSession.matchId}
              </span>
            ) : null}
          </div>
        ) : null}

        {inviteLobbyMessage ? (
          <p style={{ margin: "12px 0 0", color: "#166534", fontWeight: 900 }}>{inviteLobbyMessage}</p>
        ) : null}
        {inviteLobbyError ? (
          <p style={{ margin: "12px 0 0", color: "#b00020", fontWeight: 900 }}>{inviteLobbyError}</p>
        ) : null}
        {sessionListsError ? (
          <p style={{ margin: "12px 0 0", color: "#b00020", fontWeight: 900 }}>{sessionListsError}</p>
        ) : null}
        {sessionActionMessage ? (
          <p style={{ margin: "12px 0 0", color: "#166534", fontWeight: 900 }}>{sessionActionMessage}</p>
        ) : null}
        {tunnelCopyMessage ? (
          <p data-testid="tunnel-copy-message" style={{ margin: "12px 0 0", color: "#166534", fontWeight: 900 }}>
            {tunnelCopyMessage}
          </p>
        ) : null}
        {tunnelCopyError ? (
          <p data-testid="tunnel-copy-error" style={{ margin: "12px 0 0", color: "#b00020", fontWeight: 900 }}>
            {tunnelCopyError}
          </p>
        ) : null}
      </section>
      ) : null}

      <section
        style={{
          display: showAdvancedTools ? undefined : "none",
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
            <h2 style={{ marginTop: 0 }}>Teste neste navegador</h2>
            <p style={{ marginBottom: 0, color: "#4b5563" }}>
              Use quando quiser testar uma partida sem enviar link para outra pessoa.
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
            {isConfigured ? "disponível" : "servidor indisponível"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              color: "#374151",
              fontWeight: 700,
            }}
          >
            Dicionário
            <select
              data-testid="quick-match-language"
              value={quickMatchLanguage}
              onChange={(event) => setQuickMatchLanguage(event.target.value as MatchLanguage)}
              disabled={isCreatingQuickMatch || isCreatingBotMatch}
              style={{
                padding: "9px 10px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#111827",
                fontWeight: 700,
              }}
            >
              <option value="pt-BR">pt-BR</option>
              <option value="pt-PT">pt-PT</option>
            </select>
          </label>

          <button
            type="button"
            data-testid="quick-match-create"
            onClick={handleCreateQuickMatch}
            disabled={!isConfigured || isCreatingQuickMatch}
            style={{ padding: "10px 14px", cursor: !isConfigured || isCreatingQuickMatch ? "not-allowed" : "pointer" }}
          >
            {isCreatingQuickMatch ? "Criando..." : "Criar teste local"}
          </button>

          <button
            type="button"
            data-testid="quick-bot-match-create"
            onClick={handleCreateHumanVsBotMatch}
            disabled={!isConfigured || isCreatingBotMatch}
            style={{ padding: "10px 14px", cursor: !isConfigured || isCreatingBotMatch ? "not-allowed" : "pointer" }}
          >
            {isCreatingBotMatch ? "Criando..." : "Jogar contra bot"}
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
                {quickMatchSession.opponentIsBot ? "Ver lado do bot" : "Entrar como convidado"}
              </button>
            </>
          ) : null}
        </div>

        <div
          data-testid="quick-match-product-summary"
          style={{
            marginTop: 14,
            display: "grid",
            gap: 8,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: 800,
            }}
          >
            Idioma selecionado: {quickMatchLanguage}
          </div>
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              border: "1px solid #bbf7d0",
              background: "#ecfdf5",
              color: "#166534",
              fontWeight: 800,
            }}
          >
            Bot joga automaticamente quando chega sua vez
          </div>
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              border: "1px solid #fed7aa",
              background: "#fff7ed",
              color: "#9a3412",
              fontWeight: 800,
            }}
          >
            Dicionário ativo: {quickMatchLanguage}
          </div>
        </div>

        {quickMatchSession && showAdvancedTools ? (
          <div style={{ marginTop: 12, display: "grid", gap: 6, fontFamily: "monospace", fontSize: 13 }}>
            <div>match_id: {quickMatchSession.matchId}</div>
            <div>language: {quickMatchSession.language}</div>
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

      <section
        data-testid="invite-lobby-product-panel"
        style={{
          display: showAdvancedTools ? undefined : "none",
          marginTop: 24,
          padding: 20,
          border: "1px solid #bbf7d0",
          borderRadius: 22,
          background:
            "radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 30%), linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
          boxShadow: "0 12px 30px rgba(21, 128, 61, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 650 }}>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, textTransform: "uppercase", color: "#166534" }}>
              Multiplayer humano
            </div>
            <h2 style={{ margin: "8px 0 6px" }}>Criar mesa por convite</h2>
            <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.5 }}>
              Cria um lobby real, envia convite nominal e mantém a mesa aguardando o aceite do
              convidado. Nesta fase o convite ainda usa <strong>user_id</strong>; a busca por
              email/nome entra na próxima camada de diretório.
            </p>
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              padding: "6px 10px",
              borderRadius: 999,
              background: isAuthenticated ? "#dcfce7" : "#fee2e2",
              color: isAuthenticated ? "#166534" : "#991b1b",
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            {isAuthenticated ? "conta pronta" : "login necessário"}
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ display: "grid", gap: 6, minWidth: 320, fontSize: 13, fontWeight: 800 }}>
            user_id do convidado
            <input
              data-testid="invite-target-user-id"
              value={inviteTargetUserId}
              onChange={(event) => setInviteTargetUserId(event.target.value)}
              placeholder="UUID do usuário convidado"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #86efac" }}
            />
          </label>

          <button
            type="button"
            data-testid="invite-lobby-create"
            onClick={handleCreateInviteLobby}
            disabled={!isAuthenticated || isCreatingInviteLobby}
            style={{
              padding: "11px 15px",
              cursor: !isAuthenticated || isCreatingInviteLobby ? "not-allowed" : "pointer",
              borderRadius: 12,
              border: "1px solid #15803d",
              background: "#16a34a",
              color: "#ffffff",
              fontWeight: 900,
            }}
          >
            {isCreatingInviteLobby ? "Criando mesa..." : "Criar lobby e convidar"}
          </button>
        </div>

        {inviteLobbyMessage ? (
          <p data-testid="invite-lobby-message" style={{ margin: "12px 0 0", color: "#166534", fontWeight: 800 }}>
            {inviteLobbyMessage}
          </p>
        ) : null}
        {inviteLobbyError ? (
          <p data-testid="invite-lobby-error" style={{ margin: "12px 0 0", color: "#b00020", fontWeight: 800 }}>
            {inviteLobbyError}
          </p>
        ) : null}
      </section>

      <section
        data-testid="product-session-center"
        style={{
          display: showAdvancedTools ? undefined : "none",
          marginTop: 24,
          padding: 20,
          border: "1px solid #fed7aa",
          borderRadius: 22,
          background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
          boxShadow: "0 12px 30px rgba(154, 52, 18, 0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, textTransform: "uppercase", color: "#9a3412" }}>
              Suas mesas
            </div>
            <h2 style={{ margin: "8px 0 6px" }}>Continuar uma partida</h2>
            <p style={{ margin: 0, color: "#4b5563" }}>
              Veja convites recebidos e partidas salvas na sua conta.
            </p>
          </div>
          <button
            type="button"
            data-testid="product-session-list-load"
            onClick={handleLoadSessionLists}
            disabled={!effectiveProductUserId || isLoadingSessionLists}
            style={{
              padding: "10px 14px",
              cursor: !effectiveProductUserId || isLoadingSessionLists ? "not-allowed" : "pointer",
              alignSelf: "flex-start",
            }}
          >
            {isLoadingSessionLists ? "Atualizando..." : "Atualizar minhas mesas"}
          </button>
        </div>

        {sessionListsError ? (
          <p style={{ marginTop: 12, color: "#b00020", fontWeight: 800 }}>
            {sessionListsError}
          </p>
        ) : null}
        {sessionActionMessage ? (
          <p style={{ marginTop: 12, color: "#166534", fontWeight: 800 }}>
            {sessionActionMessage}
          </p>
        ) : null}

        {sessionListsLoaded ? (
          <div style={{ marginTop: 14, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <div
              data-testid="product-pending-invites-summary"
              style={{ padding: 14, borderRadius: 16, border: "1px solid #bbf7d0", background: "#f0fdf4" }}
            >
              <strong>{pendingInvites.length}</strong> convite{pendingInvites.length === 1 ? "" : "s"} pendente{pendingInvites.length === 1 ? "" : "s"}
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                {pendingInvites.slice(0, 3).map((invite) => (
                  <div key={invite.inviteId} style={{ display: "grid", gap: 6, fontSize: 13 }}>
                    <span>Mesa {invite.language} · {invite.lobbyStatus}</span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => handleAcceptInvite(invite.inviteId)}
                        disabled={inviteActionInFlightId === invite.inviteId || isLoading}
                        style={{ padding: "8px 10px", cursor: "pointer" }}
                      >
                        Aceitar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineInvite(invite.inviteId)}
                        disabled={inviteActionInFlightId === invite.inviteId || isLoading}
                        style={{ padding: "8px 10px", cursor: "pointer" }}
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              data-testid="product-resumable-matches-summary"
              style={{ padding: 14, borderRadius: 16, border: "1px solid #bfdbfe", background: "#eff6ff" }}
            >
              <strong>{resumableMatches.length}</strong>{" "}
              {resumableMatches.length === 1 ? "partida retomável" : "partidas retomáveis"}
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                {resumableMatches.slice(0, 3).map((match) => (
                  <div key={`${match.matchId}-${match.playerId}`} style={{ display: "grid", gap: 6, fontSize: 13 }}>
                    <span>{match.displayName} · turno {match.turnNumber} · {match.matchStatus}</span>
                    <button
                      type="button"
                      onClick={() => handleResumeListedMatch(match.matchId)}
                      disabled={isLoading}
                      style={{ width: 130, padding: "8px 10px", cursor: isLoading ? "not-allowed" : "pointer" }}
                    >
                      Retomar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section
        data-testid="demo-roadmap-panel"
        style={{
          display: showAdvancedTools ? undefined : "none",
          marginTop: 24,
          padding: 20,
          border: "1px solid #b7c7aa",
          borderRadius: 22,
          background:
            "radial-gradient(circle at top right, rgba(34, 197, 94, 0.14), transparent 30%), linear-gradient(135deg, #f4f7ed 0%, #ffffff 100%)",
          boxShadow: "0 12px 30px rgba(21, 128, 61, 0.08)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, textTransform: "uppercase", color: "#3f6212" }}>
          Demo interna ponta-a-ponta
        </div>
        <h2 style={{ margin: "8px 0 6px" }}>Roteiro operacional da mesa</h2>
        <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.5 }}>
          Fluxo validável no navegador: criar mesa, alternar sessão, jogar, votar palavra,
          retomar partida, executar bot, consultar dicionário e encerrar com resultado final.
        </p>
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Criar mesa", "Jogar", "Votar", "Retomar", "Encerrar", "Bot", "Dicionário"].map(
            (item) => (
              <span
                key={item}
                style={{
                  padding: "7px 11px",
                  borderRadius: 999,
                  background: "#ecfdf5",
                  color: "#166534",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {item}
              </span>
            )
          )}
        </div>
      </section>

      {operationalMode ? (
        <section
          style={{
            marginTop: 32,
            padding: 14,
            border: "1px solid #d7d0bf",
            borderRadius: 20,
            background: "rgba(255, 250, 240, 0.72)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>Área técnica</h2>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
                Debug, validação, partidas preparadas e apoio operacional ficam fora da entrada pública.
              </p>
            </div>
            <button
              type="button"
              data-testid="advanced-tools-toggle"
              onClick={() => setShowAdvancedTools((current) => !current)}
              style={{ padding: "10px 14px", cursor: "pointer", alignSelf: "flex-start" }}
            >
              {showAdvancedTools ? "Ocultar opções técnicas" : "Mostrar opções técnicas"}
            </button>
          </div>
        </section>
      ) : null}

      {showAdvancedTools ? (
        <>

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
            data-testid="manual-match-open"
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
                        data-testid="resumable-match-card"
                        style={{
                          display: "grid",
                          gap: 6,
                          padding: 12,
                          border: "1px solid #bfdbfe",
                          borderRadius: 14,
                          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
                        }}
                      >
                        <div style={{ fontWeight: 900, color: "#1d4ed8" }}>
                          Retomar mesa {match.matchStatus}
                        </div>
                        <div>
                          Você entra como <strong>{match.displayName}</strong>, com{" "}
                          <strong>{match.score}</strong> ponto{match.score === 1 ? "" : "s"}.
                        </div>
                        <div>
                          Turno <strong>{match.turnNumber}</strong> · idioma{" "}
                          <strong>{match.language}</strong> ·{" "}
                          {match.isOnline ? "sessão online recentemente" : "sessão sem presença recente"}
                        </div>
                        {match.hasForfeited ? (
                          <div style={{ color: "#92400e", fontWeight: 800 }}>
                            Este jogador já consta como desistente.
                          </div>
                        ) : null}
                        {showDebug ? (
                          <>
                            <div><strong>match_id:</strong> {match.matchId}</div>
                            <div><strong>player_id:</strong> {match.playerId}</div>
                          </>
                        ) : null}
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
                        data-testid="pending-invite-card"
                        style={{
                          display: "grid",
                          gap: 6,
                          padding: 12,
                          border: "1px solid #bbf7d0",
                          borderRadius: 14,
                          background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
                        }}
                      >
                        <div style={{ fontWeight: 900, color: "#166534" }}>
                          Convite para mesa {invite.lobbyStatus}
                        </div>
                        <div>
                          Modo <strong>{invite.matchMode}</strong> · idioma{" "}
                          <strong>{invite.language}</strong> · até{" "}
                          <strong>{invite.maxPlayers}</strong> jogadores.
                        </div>
                        {invite.hostGuestName ? (
                          <div>
                            Criada por <strong>{invite.hostGuestName}</strong>.
                          </div>
                        ) : null}
                        {showDebug ? (
                          <>
                            <div><strong>invite_id:</strong> {invite.inviteId}</div>
                            <div><strong>match_id:</strong> {invite.matchId}</div>
                          </>
                        ) : null}
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

        </>
      ) : null}

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

            {isActive && !isFinished && resolvedBootstrap.playerId ? (
              <button
                type="button"
                onClick={handlePassTurn}
                disabled={!canCurrentPlayerTakeTurnAction || isSubmittingPassTurn || isSubmittingExchange}
                data-testid="pass-turn-action"
                style={{
                  padding: "10px 14px",
                  cursor:
                    !canCurrentPlayerTakeTurnAction || isSubmittingPassTurn || isSubmittingExchange || isLoading
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isSubmittingPassTurn ? "Passando..." : "Passar turno"}
              </button>
            ) : null}

            {isActive && !isFinished && resolvedBootstrap.playerId ? (
              <button
                type="button"
                onClick={handleToggleExchangeMode}
                disabled={
                  !canCurrentPlayerTakeTurnAction ||
                  isSubmittingExchange ||
                  isSubmittingPassTurn ||
                  isLoading
                }
                data-testid="exchange-turn-toggle"
                style={{
                  padding: "10px 14px",
                  cursor:
                    !canCurrentPlayerTakeTurnAction ||
                    isSubmittingExchange ||
                    isSubmittingPassTurn ||
                    isLoading
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isExchangeMode ? "Cancelar troca" : "Trocar peças"}
              </button>
            ) : null}

            {isExchangeMode ? (
              <button
                type="button"
                data-testid="exchange-turn-submit"
                onClick={handleSubmitExchange}
                disabled={!canSubmitExchange || isSubmittingExchange}
                style={{
                  padding: "10px 14px",
                  cursor: !canSubmitExchange || isSubmittingExchange ? "not-allowed" : "pointer",
                }}
              >
                {isSubmittingExchange
                  ? "Trocando..."
                  : `Trocar ${selectedExchangeTileIds.length} peça(s)`}
              </button>
            ) : null}
          </div>

          {isActive && resolvedBootstrap.playerId && !canCurrentPlayerTakeTurnAction ? (
            <p data-testid="turn-action-block-reason" style={{ marginTop: 12, color: "#92400e" }}>
              {turnActionBlockReason}
            </p>
          ) : null}

          {isExchangeMode ? (
            <p style={{ marginTop: 8, color: "#1d4ed8", fontSize: 14 }}>
              {selectedExchangeTileIds.length > 0
                ? `${selectedExchangeTileIds.length} peça${selectedExchangeTileIds.length === 1 ? "" : "s"} selecionada${selectedExchangeTileIds.length === 1 ? "" : "s"} para troca.`
                : "Selecione pelo menos uma peça do seu rack e confirme para trocar."}
            </p>
          ) : null}

          {turnActionMessage ? (
            <p data-testid="turn-action-message" style={{ marginTop: 10, color: "#166534" }}>
              <strong>Ação da mesa:</strong> {turnActionMessage}
            </p>
          ) : null}

          {resolvedBootstrap.playerContext?.has_forfeited ? (
            <p style={{ marginTop: 12, color: "#92400e" }}>
              <strong>Status do jogador:</strong> esta sessao ja consta como desistente nesta partida.
            </p>
          ) : null}
        </section>
      ) : null}

      {resolvedBootstrap.matchId ? (
        <GamePlayScreen
          stateLabel={stateLabel}
          matchLanguage={resolvedBootstrap.language}
          isWaiting={isWaiting}
          isActive={isActive}
          isVoting={isVoting}
          isFinished={isFinished}
          endSummary={resolvedBootstrap.endSummary}
          winnerPlayerId={resolvedBootstrap.winnerPlayerId}
          finishedAt={resolvedBootstrap.finishedAt}
          dictionarySummary={resolvedBootstrap.dictionarySummary}
          viewerPlayerId={resolvedBootstrap.playerId}
          playersSummary={resolvedBootstrap.playersSummary}
          currentTurnPlayerId={resolvedBootstrap.currentTurnPlayerId}
          turnNumber={resolvedBootstrap.turnNumber}
          boardState={resolvedBootstrap.boardState}
          compositionPlacementsByCell={compositionPlacementsByCell}
          pendingVoteTilesByCell={pendingVoteTilesByCell}
          selectedTileId={selectedTileId}
          selectedTileIds={isExchangeMode ? selectedExchangeTileIds : selectedTileIds}
          selectedRackSlotId={selectedRackSlotId}
          previewTileIds={previewTileIds}
          playerRackState={orderedPlayerRackState}
          rackSlotAssociations={localRackSlotAssociations}
          rackSlotAssociationLabels={rackSlotAssociationLabels}
          placedTilesPreview={placedTilesPreview}
          localComposedWord={localComposedWord}
          moveCompositionWarning={moveCompositionWarning}
          canSubmitMove={
            placedTilesPreview.length > 0 &&
            Boolean(resolvedBootstrap.playerId) &&
            !moveCompositionWarning
          }
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
          botActionHistory={botActionHistory}
          lastTurnActionSummary={lastTurnActionSummary}
          matchTimeline={matchTimeline}
          isAutoPlayingBotTurn={isAutoPlayingBotTurn}
          buildCellKey={buildCellKey}
          renderCellLabel={renderCellLabel}
          renderCellBackground={renderCellBackground}
          onPlaceTile={handlePlaceTile}
          onToggleTile={handleToggleTile}
          onToggleRackSlot={handleToggleRackSlot}
          onClearRackSlotAssignment={handleClearRackSlotAssignment}
          onClearRackSlotAssociation={handleClearRackSlotAssociation}
          onClearPreview={clearMoveCompositionPreview}
          onChangeRackSlotDraft={handleChangeRackSlotDraft}
          onReorderTile={handleReorderRackItem}
          onSubmitMove={handleSubmitMove}
          onApprove={() => handleSubmitVote(false)}
          onReject={() => handleSubmitVote(true)}
          onToggleDebug={() => setShowDebug((current) => !current)}
        />
      ) : null}

      {showDebug && resolvedBootstrap.matchId ? (
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
        selectedTileIds={isExchangeMode ? selectedExchangeTileIds : selectedTileIds}
        activeSlotId={selectedRackSlotId}
        slotAssociationLabels={rackSlotAssociationLabels}
        previewTileIds={previewTileIds}
        showDebug={showDebug}
        isPlayersTurn={isActive}
        onToggleTile={handleToggleTile}
        onToggleSlot={handleToggleRackSlot}
        onClearSlotAssignment={handleClearRackSlotAssignment}
        onClearSlotAssociation={handleClearRackSlotAssociation}
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

export default function HomePage() {
  return <PatxangaPage />;
}
