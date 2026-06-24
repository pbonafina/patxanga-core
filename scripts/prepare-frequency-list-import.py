#!/usr/bin/env python3
"""Build Patxanga word-frequency SQL from pre-aggregated frequency lists."""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path


VALID_DOMAINS = {"web", "wiki", "news", "subtitles", "books", "parliament", "mixed", "qa"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert word/count frequency lists into Patxanga import SQL.",
    )
    parser.add_argument("input", type=Path)
    parser.add_argument("--language", required=True, choices=("pt-PT", "pt-BR"))
    parser.add_argument("--source", required=True)
    parser.add_argument("--source-domain", required=True, choices=sorted(VALID_DOMAINS))
    parser.add_argument("--source-version", required=True)
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--license-name", required=True)
    parser.add_argument("--license-url")
    parser.add_argument("--imported-by", default="scripts/prepare-frequency-list-import.py")
    parser.add_argument("--encoding", default="utf-8")
    parser.add_argument("--separator", default="\\t")
    parser.add_argument("--count-column", type=int, default=0)
    parser.add_argument("--word-column", type=int, default=1)
    parser.add_argument("--min-count", type=int, default=2)
    parser.add_argument("--top", type=int, default=100000)
    parser.add_argument("--mode", choices=("sql", "payload"), default="sql")
    parser.add_argument("--pretty", action="store_true")
    return parser.parse_args()


def normalize_separator(value: str) -> str:
    return value.encode("utf-8").decode("unicode_escape")


def normalize_word(raw_word: str) -> str:
    decomposed = unicodedata.normalize("NFD", raw_word)
    without_marks = "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")
    normalized = without_marks.upper().replace("Ç", "C")
    return "".join(ch for ch in normalized if "A" <= ch <= "Z")


def build_entries(args: argparse.Namespace) -> tuple[list[dict[str, int | str]], dict[str, int]]:
    separator = normalize_separator(args.separator)
    counts: Counter[str] = Counter()
    total_rows = 0
    valid_rows = 0

    with args.input.open("r", encoding=args.encoding, errors="replace") as handle:
        for line in handle:
            line = line.rstrip("\n\r")
            if not line:
                continue
            total_rows += 1
            fields = line.split(separator)
            if len(fields) <= max(args.count_column, args.word_column):
                continue
            try:
                count = int(fields[args.count_column].strip())
            except ValueError:
                continue
            if count < args.min_count:
                continue
            word = normalize_word(fields[args.word_column].strip())
            if not word or not re.fullmatch(r"[A-Z]+", word):
                continue
            counts[word] += count
            valid_rows += 1

    entries = [
        {
            "word": word,
            "token_count": count,
            "document_count": 0,
        }
        for word, count in counts.most_common(args.top)
    ]

    stats = {
        "total_rows": total_rows,
        "valid_rows": valid_rows,
        "unique_words": len(counts),
        "selected_words": len(entries),
        "tokens": sum(counts.values()),
    }
    return entries, stats


def sql_literal(value: str | None) -> str:
    if value is None or value == "":
        return "null"
    return "'" + value.replace("'", "''") + "'"


def sql_jsonb(value: object) -> str:
    compact = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return sql_literal(compact) + "::jsonb"


def render_sql(args: argparse.Namespace, entries: list[dict[str, int | str]], stats: dict[str, int]) -> str:
    metadata = {
        "converter": "scripts/prepare-frequency-list-import.py",
        "stats": stats,
        "raw_corpus_not_versioned": True,
        "input_format": "count<separator>word",
        "encoding": args.encoding,
    }

    return "\n".join(
        [
            "select public.import_patxanga_word_frequency_entries(",
            f"    p_language := {sql_literal(args.language)},",
            f"    p_source := {sql_literal(args.source)},",
            f"    p_source_domain := {sql_literal(args.source_domain)},",
            f"    p_license_name := {sql_literal(args.license_name)},",
            f"    p_entries := {sql_jsonb(entries)},",
            f"    p_source_version := {sql_literal(args.source_version)},",
            f"    p_license_url := {sql_literal(args.license_url)},",
            f"    p_source_url := {sql_literal(args.source_url)},",
            f"    p_imported_by := {sql_literal(args.imported_by)},",
            f"    p_metadata := {sql_jsonb(metadata)}",
            ");",
        ]
    )


def main() -> int:
    args = parse_args()

    try:
        entries, stats = build_entries(args)
        if not entries:
            print("prepare-frequency-list-import: no frequency entries generated", file=sys.stderr)
            return 1
        if args.mode == "payload":
            print(json.dumps({"entries": entries, "stats": stats}, ensure_ascii=False, indent=2 if args.pretty else None))
        else:
            print(render_sql(args, entries, stats))
    except (OSError, ValueError) as exc:
        print(f"prepare-frequency-list-import: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
