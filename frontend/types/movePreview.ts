export interface MovePreviewScore {
  main_word_score?: number;
  secondary_words_score?: number;
  bonus_7?: number;
  patxanga_real_applied?: boolean;
  total_score?: number;
}

export interface MovePreviewResult {
  status?: "ok" | "invalid";
  error?: string | null;
  main_word?: string | null;
  secondary_words?: unknown[];
  words?: unknown[];
  score?: MovePreviewScore | null;
  requires_vote?: boolean;
  is_dictionary_recognized?: boolean;
}
