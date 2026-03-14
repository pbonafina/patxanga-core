import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMatchBootstrap } from "../hooks/useMatchBootstrap";
import { loadMatchBootstrap } from "../lib/backend/loadMatchBootstrap";
import { getSupabaseEnv } from "../lib/supabase/env";
import type { MatchBootstrap } from "../types/match";
import { VotingSection } from "../components/VotingSection";
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
  | { kind: "gap"; gapId: string };

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
    ...DEFAULT_RACK_SLOT_IDS.map((gapId) => ({ kind: "gap" as const, gapId })),
  ];
}

function buildInitialRackGapDrafts(): Record<string, string> {
  return DEFAULT_RACK_SLOT_IDS.reduce<Record<string, string>>((drafts, gapId) => {
    drafts[gapId] = "";
    return drafts;
  }, {});
}

function getRackCompositionItemId(item: RackCompositionItem): string {
  return item.kind === "tile" ? item.tileId : item.gapId;
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
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [pendingVoteContext, setPendingVoteContext] = useState<unknown | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [localPlacements, setLocalPlacements] = useState<Record<string, string>>({});
  const [localDeclaredLetters, setLocalDeclaredLetters] = useState<Record<string, string>>({});
  const [localRackComposition, setLocalRackComposition] = useState<RackCompositionItem[]>([]);
  const [localRackGapDrafts, setLocalRackGapDrafts] = useState<Record<string, string>>({});
  const [showDebug, setShowDebug] = useState(false);
  const [quickMatchSession, setQuickMatchSession] = useState<{
    matchId: string;
    hostUserId: string;
    guestUserId: string;
  } | null>(null);
  const [isCreatingQuickMatch, setIsCreatingQuickMatch] = useState(false);
  const [quickMatchError, setQuickMatchError] = useState<string | null>(null);
  const [movePreview, setMovePreview] = useState<MovePreviewResult | null>(null);
  const [isLoadingMovePreview, setIsLoadingMovePreview] = useState(false);

  const resolvedBootstrap = useMatchBootstrap(bootstrapData ?? undefined);
  const { isConfigured } = getSupabaseEnv();

  const isWaiting = resolvedBootstrap.status === "waiting";
  const isActive = resolvedBootstrap.status === "active";
  const isVoting = resolvedBootstrap.status === "voting";
  const isFinished = resolvedBootstrap.status === "finished";

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
      default:
        return "Estado desconhecido";
    }
  }, [resolvedBootstrap.status]);

  const placedTilesPreview = useMemo(() => {
    if (!resolvedBootstrap.playerContext) {
      return [];
    }

    return Object.entries(localPlacements)
      .map(([cellKey, tileId]) => {
        const [rowIndexText, colIndexText] = cellKey.split("-");
        const rowIndex = Number(rowIndexText);
        const colIndex = Number(colIndexText);

        const tile = resolvedBootstrap.playerContext?.rack_state.find((item) => {
          const typedTile = item as {
            id?: string;
            letter?: string;
            is_special?: boolean;
            special_type?: string | null;
          };

          return typedTile.id === tileId;
        }) as
          | {
              id?: string;
              letter?: string;
              is_special?: boolean;
              special_type?: string | null;
            }
          | undefined;

        if (!tile?.id) {
          return null;
        }

        const declaredLetter = requiresDeclaredLetter(tile.special_type)
          ? (localDeclaredLetters[cellKey] ?? null)
          : null;

        return {
          tile_id: tile.id,
          row: rowIndex + 1,
          col: colIndex + 1,
          declared_letter: declaredLetter,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
      });
  }, [localDeclaredLetters, localPlacements, resolvedBootstrap.playerContext]);

  const previewTileIds = useMemo(
    () => [...new Set(Object.values(localPlacements))],
    [localPlacements]
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
    setLocalRackGapDrafts(buildInitialRackGapDrafts());
  }, [resolvedBootstrap.playerContext]);

  const orderedPlayerRackState = useMemo(() => {
    const rackState = (resolvedBootstrap.playerContext?.rack_state ?? []) as Array<{
      id?: string;
    }>;

    if (rackState.length === 0 && localRackComposition.length === 0) {
      return [];
    }

    const byId = new Map(
      rackState
        .filter((tile) => tile.id)
        .map((tile) => [tile.id as string, tile])
    );

    const ordered = localRackComposition
      .map((item) => {
        if (item.kind === "gap") {
          return {
            kind: "gap" as const,
            gapId: item.gapId,
            draftLetter: localRackGapDrafts[item.gapId] ?? "",
          };
        }

        return byId.get(item.tileId) ?? null;
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
  }, [localRackComposition, localRackGapDrafts, resolvedBootstrap.playerContext]);

  async function openMatchSession(matchId: string, userId: string) {
    setIsLoading(true);
    setErrorMessage(null);
    setSubmitResult(null);
    setVoteResult(null);
    setPendingVoteError(null);
    setSelectedTileId(null);
    setSelectedTileIds([]);
    setLocalPlacements({});
    setLocalDeclaredLetters({});
    setLocalRackGapDrafts({});
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await openMatchSession(matchIdInput, playerIdInput);
  }

  async function handleCreateQuickMatch() {
    setQuickMatchError(null);
    setErrorMessage(null);
    setIsCreatingQuickMatch(true);

    try {
      const { getSupabaseBrowserClient } = await import("../lib/supabase/client");
      const client = getSupabaseBrowserClient();

      if (!client) {
        throw new Error("Supabase client not configured in frontend environment.");
      }

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

      setQuickMatchSession({
        matchId,
        hostUserId,
        guestUserId,
      });

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

  async function handleOpenQuickMatch(userId: string) {
    if (!quickMatchSession) {
      return;
    }

    setMatchIdInput(quickMatchSession.matchId);
    setPlayerIdInput(userId);
    await openMatchSession(quickMatchSession.matchId, userId);
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
      setLocalPlacements({});
      setLocalDeclaredLetters({});
      setLocalRackGapDrafts({});
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

  function handleChangeRackGapDraft(gapId: string, nextValue: string) {
    const normalized = nextValue.trim().slice(0, 1).toUpperCase();
    setLocalRackGapDrafts((current) => ({
      ...current,
      [gapId]: normalized,
    }));
  }

  function handleReorderRackItem(draggedItemId: string, dropTargetId: string) {
    setLocalRackComposition((current) =>
      reorderRackComposition(current, draggedItemId, dropTargetId, selectedTileIds)
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <h1>Patxanga</h1>
      <p>Interface local da partida conectada ao backend da aplicação.</p>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Conexão</h2>
        <p><strong>Modo atual:</strong> {isConfigured ? "conectado ao backend real" : "modo local de fallback"}</p>
        <p>
          Nesta etapa, o segundo campo ainda usa temporariamente o <strong>user_id</strong> da sessão
          para localizar o jogador correto da partida.
        </p>
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Partida local rápida</h2>
        <p>Gera uma partida de teste local e permite alternar entre host e guest sem copiar IDs manualmente.</p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
          <button
            type="button"
            onClick={handleCreateQuickMatch}
            disabled={!isConfigured || isCreatingQuickMatch}
            style={{ padding: "10px 14px", cursor: !isConfigured || isCreatingQuickMatch ? "not-allowed" : "pointer" }}
          >
            {isCreatingQuickMatch ? "Gerando partida..." : "Gerar partida local"}
          </button>

          {quickMatchSession ? (
            <>
              <button
                type="button"
                onClick={() => handleOpenQuickMatch(quickMatchSession.hostUserId)}
                disabled={isLoading}
                style={{ padding: "10px 14px", cursor: isLoading ? "not-allowed" : "pointer" }}
              >
                Entrar como host
              </button>
              <button
                type="button"
                onClick={() => handleOpenQuickMatch(quickMatchSession.guestUserId)}
                disabled={isLoading}
                style={{ padding: "10px 14px", cursor: isLoading ? "not-allowed" : "pointer" }}
              >
                Entrar como guest
              </button>
            </>
          ) : null}
        </div>

        {quickMatchSession ? (
          <div style={{ marginTop: 12, display: "grid", gap: 6, fontFamily: "monospace", fontSize: 13 }}>
            <div>match_id: {quickMatchSession.matchId}</div>
            <div>host_user_id: {quickMatchSession.hostUserId}</div>
            <div>guest_user_id: {quickMatchSession.guestUserId}</div>
          </div>
        ) : null}

        {quickMatchError ? (
          <p style={{ marginTop: 12, color: "#b00020" }}>
            <strong>Erro:</strong> {quickMatchError}
          </p>
        ) : null}
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
      </section>

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
        boardState={resolvedBootstrap.boardState}
        localPlacements={localPlacements}
        localDeclaredLetters={localDeclaredLetters}
        pendingVoteTilesByCell={pendingVoteTilesByCell}
        selectedTileId={selectedTileId}
        selectedTileIds={selectedTileIds}
        previewTileIds={previewTileIds}
        playerRackState={orderedPlayerRackState}
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
        showDebug={showDebug}
        buildCellKey={buildCellKey}
        renderCellLabel={renderCellLabel}
        renderCellBackground={renderCellBackground}
        onPlaceTile={handlePlaceTile}
        onToggleTile={handleToggleTile}
        onClearPreview={() => {
          setLocalPlacements({});
          setLocalDeclaredLetters({});
          setSelectedTileId(null);
          setSelectedTileIds([]);
          setMovePreview(null);
        }}
        onChangeRackGapDraft={handleChangeRackGapDraft}
        onReorderTile={handleReorderRackItem}
        onSubmitMove={handleSubmitMove}
        onApprove={() => handleSubmitVote(false)}
        onReject={() => handleSubmitVote(true)}
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
        localPlacements={localPlacements}
        localDeclaredLetters={localDeclaredLetters}
        pendingVoteTilesByCell={pendingVoteTilesByCell}
        selectedTileId={selectedTileId}
        playerRackState={orderedPlayerRackState}
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
        previewTileIds={previewTileIds}
        showDebug={showDebug}
        isPlayersTurn={isActive}
        onToggleTile={handleToggleTile}
        onClearPreview={() => {
          setLocalPlacements({});
          setLocalDeclaredLetters({});
          setSelectedTileId(null);
          setSelectedTileIds([]);
          setMovePreview(null);
        }}
        onChangeGapDraft={handleChangeRackGapDraft}
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

      {isWaiting ? (
        <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
          <h2>Lobby / aguardando início</h2>
          <p>Esta partida ainda não começou.</p>
          <p>Assim que a partida entrar em modo ativo, o board e o rack jogável aparecerão aqui.</p>
        </section>
      ) : null}

      {isFinished ? (
        <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
          <h2>Partida encerrada</h2>
          <p>Esta partida já foi concluída.</p>
          <p><strong>Vencedor:</strong> {resolvedBootstrap.winnerPlayerId || "(não disponível)"}</p>
          <p><strong>Encerrada em:</strong> {resolvedBootstrap.finishedAt || "(não disponível)"}</p>
        </section>
      ) : null}

    </main>
  );
}
