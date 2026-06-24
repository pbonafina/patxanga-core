#!/usr/bin/env python3
"""Extract playable word forms from a Priberam StarDict directory.

The script reads only StarDict index/synonym keys. It does not export
definitions from the .dict file.
"""

from __future__ import annotations

import argparse
import csv
import json
import unicodedata
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert Priberam StarDict keys into a Patxanga import CSV.",
    )
    parser.add_argument("stardict_dir", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--min-length", type=int, default=2)
    parser.add_argument("--max-length", type=int, default=15)
    return parser.parse_args()


def normalize_word(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", value.strip().upper())
    return "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")


def is_playable_word(value: str, min_length: int, max_length: int) -> bool:
    normalized = normalize_word(value)
    return min_length <= len(normalized) <= max_length and normalized.isalpha()


def parse_null_terminated_keys(path: Path, trailer_size: int) -> tuple[int, list[str]]:
    data = path.read_bytes()
    position = 0
    total = 0
    words: list[str] = []

    while position < len(data):
        end = data.index(b"\0", position)
        word = data[position:end].decode("utf-8", "replace").strip()
        words.append(word)
        total += 1
        position = end + 1 + trailer_size

    return total, words


def read_ifo(path: Path) -> dict[str, str]:
    result: dict[str, str] = {}

    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if "=" not in line:
            continue

        key, value = line.split("=", 1)
        result[key.strip()] = value.strip()

    return result


def main() -> int:
    args = parse_args()
    stardict_dir = args.stardict_dir
    idx_file = stardict_dir / "book_stardict.idx"
    syn_file = stardict_dir / "book_stardict.syn"
    ifo_file = stardict_dir / "book_stardict.ifo"

    for required_file in (idx_file, syn_file, ifo_file):
        if not required_file.is_file():
            raise SystemExit(f"Missing StarDict file: {required_file}")

    idx_total, idx_words = parse_null_terminated_keys(idx_file, trailer_size=8)
    syn_total, syn_words = parse_null_terminated_keys(syn_file, trailer_size=4)

    accepted_by_normalized: dict[str, str] = {}
    rejected_count = 0

    for word in [*idx_words, *syn_words]:
        if not is_playable_word(word, args.min_length, args.max_length):
            rejected_count += 1
            continue

        normalized = normalize_word(word)
        accepted_by_normalized.setdefault(normalized, word)

    selected_items = sorted(accepted_by_normalized.items())
    if args.limit is not None:
        selected_items = selected_items[: args.limit]

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="") as csv_handle:
        writer = csv.DictWriter(csv_handle, fieldnames=["word", "is_active"])
        writer.writeheader()
        for _normalized, original in selected_items:
            writer.writerow({"word": original, "is_active": "true"})

    report = {
        "book": read_ifo(ifo_file),
        "idx_total": idx_total,
        "syn_total": syn_total,
        "raw_total": idx_total + syn_total,
        "rejected_count": rejected_count,
        "deduped_valid_count": len(accepted_by_normalized),
        "selected_count": len(selected_items),
        "limit": args.limit,
        "filter": {
            "min_length": args.min_length,
            "max_length": args.max_length,
            "letters_only_after_normalization": True,
            "include_idx_keys": True,
            "include_syn_keys": True,
            "definitions_exported": False,
        },
    }

    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(json.dumps(report, ensure_ascii=False, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
