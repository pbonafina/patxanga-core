#!/usr/bin/env python3
"""Extract a controlled CSV sample from a LibreOffice Hunspell .dic file."""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path


LOWERCASE_PORTUGUESE_LETTERS = set(
    "abcdefghijklmnopqrstuvwxyz"
    "áàâãä"
    "éèêë"
    "íìîï"
    "óòôõö"
    "úùûü"
    "ç"
)
ACCENT_TRANSLATION = str.maketrans(
    "ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ",
    "AAAAAEEEEIIIIOOOOOUUUUC",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Convert a LibreOffice Hunspell .dic file into a small Patxanga "
            "dictionary import CSV sample."
        ),
    )
    parser.add_argument("dic_file", type=Path, help="Source Hunspell .dic file.")
    parser.add_argument(
        "--output",
        type=Path,
        help="CSV output path. Defaults to stdout.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=100,
        help="Maximum number of selected entries. Default: 100.",
    )
    parser.add_argument(
        "--min-length",
        type=int,
        default=3,
        help="Minimum base word length. Default: 3.",
    )
    parser.add_argument(
        "--max-length",
        type=int,
        default=15,
        help="Maximum base word length. Default: 15.",
    )
    parser.add_argument(
        "--include-non-lowercase",
        action="store_true",
        help=(
            "Include uppercase or mixed-case bases. Default skips them to avoid "
            "proper nouns and acronyms in the first technical sample."
        ),
    )
    parser.add_argument(
        "--encoding",
        default="utf-8-sig",
        help="Input encoding. Default: utf-8-sig.",
    )
    return parser.parse_args()


def normalize_like_database(word: str) -> str:
    return word.upper().translate(ACCENT_TRANSLATION)


def extract_base_word(raw_line: str) -> str:
    stripped = raw_line.strip()
    if stripped == "":
        return ""

    token = stripped.split(maxsplit=1)[0]
    return token.split("/", maxsplit=1)[0].strip()


def is_declared_count_line(raw_line: str) -> bool:
    return raw_line.strip().lstrip("\ufeff").isdigit()


def is_candidate(base_word: str, args: argparse.Namespace) -> bool:
    if len(base_word) < args.min_length or len(base_word) > args.max_length:
        return False

    lowered = base_word.lower()
    if any(character not in LOWERCASE_PORTUGUESE_LETTERS for character in lowered):
        return False

    if not args.include_non_lowercase and base_word != lowered:
        return False

    return True


def iter_selected_entries(args: argparse.Namespace) -> tuple[list[dict[str, str]], dict[str, int | None]]:
    if args.limit < 1:
        raise ValueError("--limit must be greater than zero")
    if args.min_length < 1:
        raise ValueError("--min-length must be greater than zero")
    if args.max_length < args.min_length:
        raise ValueError("--max-length must be greater than or equal to --min-length")

    selected: list[dict[str, str]] = []
    seen_normalized: set[str] = set()
    declared_count: int | None = None
    source_entries = 0
    skipped = 0

    with args.dic_file.open("r", encoding=args.encoding, newline="") as dic_handle:
        for line_number, raw_line in enumerate(dic_handle, start=1):
            if line_number == 1 and is_declared_count_line(raw_line):
                declared_count = int(raw_line.strip().lstrip("\ufeff"))
                continue

            source_entries += 1
            base_word = extract_base_word(raw_line)
            if not is_candidate(base_word, args):
                skipped += 1
                continue

            normalized = normalize_like_database(base_word)
            if normalized in seen_normalized:
                skipped += 1
                continue

            seen_normalized.add(normalized)
            selected.append(
                {
                    "word": base_word.upper(),
                    "is_active": "true",
                    "source_line": str(line_number),
                }
            )

            if len(selected) >= args.limit:
                break

    return selected, {
        "declared_count": declared_count,
        "source_entries_scanned": source_entries,
        "selected": len(selected),
        "skipped": skipped,
    }


def write_csv(entries: list[dict[str, str]], output_path: Path | None) -> None:
    fieldnames = ["word", "is_active", "source_line"]

    if output_path is None:
        writer = csv.DictWriter(sys.stdout, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(entries)
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as csv_handle:
        writer = csv.DictWriter(csv_handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(entries)


def main() -> int:
    args = parse_args()

    try:
        entries, stats = iter_selected_entries(args)
        write_csv(entries, args.output)
    except (OSError, UnicodeError, ValueError) as exc:
        print(f"prepare-libreoffice-dictionary-sample: {exc}", file=sys.stderr)
        return 1

    print(
        "prepare-libreoffice-dictionary-sample: "
        f"declared_count={stats['declared_count']} "
        f"scanned={stats['source_entries_scanned']} "
        f"selected={stats['selected']} "
        f"skipped={stats['skipped']}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
