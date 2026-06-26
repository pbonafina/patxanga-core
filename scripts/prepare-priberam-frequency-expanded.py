#!/usr/bin/env python3
"""Build a frequency-prioritized Priberam dictionary slice for Patxanga."""

from __future__ import annotations

import argparse
import csv
import json
import unicodedata
from collections import defaultdict
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Select Priberam entries ordered by observed corpus frequency first.",
    )
    parser.add_argument("--lexicon-csv", required=True, type=Path)
    parser.add_argument("--frequency-summary", action="append", default=[], type=Path)
    parser.add_argument("--limit", type=int, required=True)
    parser.add_argument("--output-csv", required=True, type=Path)
    parser.add_argument("--report", required=True, type=Path)
    return parser.parse_args()


def normalize_word(raw_word: str) -> str:
    decomposed = unicodedata.normalize("NFD", raw_word)
    without_marks = "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")
    normalized = without_marks.upper().replace("Ç", "C")
    return "".join(ch for ch in normalized if "A" <= ch <= "Z")


def load_lexicon(path: Path) -> dict[str, str]:
    lexicon: dict[str, str] = {}
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if "word" not in (reader.fieldnames or []):
            raise ValueError(f"{path} must contain a 'word' column")

        for row in reader:
            original = (row.get("word") or "").strip()
            normalized = normalize_word(original)
            if original and normalized and normalized not in lexicon:
                lexicon[normalized] = original

    return lexicon


def load_frequency_rankings(paths: list[Path]) -> tuple[dict[str, dict[str, int | float]], dict[str, int]]:
    scores: defaultdict[str, float] = defaultdict(float)
    counts: defaultdict[str, int] = defaultdict(int)
    best_rank: dict[str, int] = {}
    source_stats: dict[str, int] = {}

    for source_index, path in enumerate(paths):
        with path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)

        entries = payload.get("entries", [])
        if not isinstance(entries, list):
            raise ValueError(f"{path} does not contain an entries array")

        source_stats[str(path)] = len(entries)
        for rank, entry in enumerate(entries, start=1):
            if not isinstance(entry, dict):
                continue
            word = normalize_word(str(entry.get("word", "")))
            if not word:
                continue
            token_count = int(entry.get("token_count") or 0)
            document_count = int(entry.get("document_count") or 0)

            # Earlier summaries are higher-signal for the game. Keep the same
            # frequency ordering within each source and add weaker support from
            # secondary corpora without letting a tiny corpus dominate.
            source_weight = 1.0 / (source_index + 1)
            scores[word] += (token_count + document_count * 3) * source_weight
            counts[word] += token_count
            best_rank[word] = min(best_rank.get(word, rank), rank)

    rankings = {
        word: {
            "score": score,
            "token_count": counts[word],
            "best_rank": best_rank.get(word, 999999999),
        }
        for word, score in scores.items()
    }
    return rankings, source_stats


def main() -> int:
    args = parse_args()
    if args.limit <= 0:
        raise ValueError("--limit must be positive")

    lexicon = load_lexicon(args.lexicon_csv)
    frequency, source_stats = load_frequency_rankings(args.frequency_summary)

    frequency_selected = [
        word
        for word in sorted(
            (word for word in frequency if word in lexicon),
            key=lambda item: (
                -float(frequency[item]["score"]),
                int(frequency[item]["best_rank"]),
                item,
            ),
        )
    ]

    selected: list[str] = frequency_selected[: args.limit]
    if len(selected) < args.limit:
        selected_set = set(selected)
        filler = sorted(word for word in lexicon if word not in selected_set)
        selected.extend(filler[: args.limit - len(selected)])

    args.output_csv.parent.mkdir(parents=True, exist_ok=True)
    with args.output_csv.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["word", "is_active"])
        writer.writeheader()
        for word in selected:
            output_word = word if word in frequency else lexicon[word]
            writer.writerow({"word": output_word, "is_active": "true"})

    report = {
        "selection": "frequency-prioritized Priberam pt-PT lexicon slice",
        "limit": args.limit,
        "lexicon_entries": len(lexicon),
        "frequency_sources": source_stats,
        "frequency_words": len(frequency),
        "frequency_words_in_lexicon": len(frequency_selected),
        "selected_count": len(selected),
        "selected_from_frequency": min(len(frequency_selected), len(selected)),
        "selected_from_lexicon_fill": max(0, len(selected) - len(frequency_selected)),
        "top_50": [
            {
                "word": word,
                "normalized": word,
                "score": round(float(frequency[word]["score"]), 4),
                "token_count": int(frequency[word]["token_count"]),
                "best_rank": int(frequency[word]["best_rank"]),
            }
            for word in selected[:50]
            if word in frequency
        ],
    }
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
