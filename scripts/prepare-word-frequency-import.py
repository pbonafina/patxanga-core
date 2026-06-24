#!/usr/bin/env python3
"""Prepare Patxanga word-frequency imports from local corpus files."""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable


VALID_LANGUAGES = {"pt-BR", "pt-PT"}
VALID_DOMAINS = {"web", "wiki", "news", "subtitles", "books", "parliament", "mixed", "qa"}
TOKEN_RE = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿ]+")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build Patxanga word-frequency import SQL from corpus files.",
    )
    parser.add_argument("inputs", nargs="+", type=Path, help="Corpus file(s) or directories.")
    parser.add_argument("--language", required=True, choices=sorted(VALID_LANGUAGES))
    parser.add_argument("--source", required=True)
    parser.add_argument("--source-domain", required=True, choices=sorted(VALID_DOMAINS))
    parser.add_argument("--license-name", required=True)
    parser.add_argument("--source-version")
    parser.add_argument("--license-url")
    parser.add_argument("--source-url")
    parser.add_argument("--imported-by", default="scripts/prepare-word-frequency-import.py")
    parser.add_argument("--format", choices=("text", "jsonl", "csv"), default="text")
    parser.add_argument("--text-field", default="text", help="JSONL/CSV text field. Default: text.")
    parser.add_argument("--delimiter", default=",", help="CSV delimiter. Default: comma.")
    parser.add_argument("--encoding", default="utf-8")
    parser.add_argument("--min-count", type=int, default=1)
    parser.add_argument("--top", type=int, default=100000)
    parser.add_argument("--mode", choices=("payload", "sql"), default="sql")
    parser.add_argument("--pretty", action="store_true")
    return parser.parse_args()


def iter_files(inputs: list[Path]) -> Iterable[Path]:
    for input_path in inputs:
        if input_path.is_dir():
            yield from sorted(path for path in input_path.rglob("*") if path.is_file())
        else:
            yield input_path


def normalize_word(raw_word: str) -> str:
    decomposed = unicodedata.normalize("NFD", raw_word)
    without_marks = "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")
    normalized = without_marks.upper().replace("Ç", "C")
    return "".join(ch for ch in normalized if "A" <= ch <= "Z")


def tokenize(text: str) -> list[str]:
    tokens: list[str] = []
    for match in TOKEN_RE.finditer(text):
        normalized = normalize_word(match.group(0))
        if normalized:
            tokens.append(normalized)
    return tokens


def read_text_documents(path: Path, encoding: str) -> Iterable[str]:
    yield path.read_text(encoding=encoding, errors="replace")


def read_jsonl_documents(path: Path, text_field: str, encoding: str) -> Iterable[str]:
    with path.open("r", encoding=encoding, errors="replace") as handle:
        for line_number, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                payload = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{line_number}: invalid JSONL: {exc}") from exc
            value = payload.get(text_field)
            if value is not None:
                yield str(value)


def read_csv_documents(path: Path, text_field: str, delimiter: str, encoding: str) -> Iterable[str]:
    if len(delimiter) != 1:
        raise ValueError("--delimiter must be a single character")

    with path.open("r", encoding=encoding, newline="", errors="replace") as handle:
        reader = csv.DictReader(handle, delimiter=delimiter)
        if reader.fieldnames is None or text_field not in reader.fieldnames:
            raise ValueError(f"{path}: missing CSV field {text_field!r}")
        for row in reader:
            value = row.get(text_field)
            if value:
                yield value


def iter_documents(args: argparse.Namespace) -> Iterable[tuple[str, str]]:
    for path in iter_files(args.inputs):
        if args.format == "jsonl":
            for document in read_jsonl_documents(path, args.text_field, args.encoding):
                yield str(path), document
        elif args.format == "csv":
            for document in read_csv_documents(path, args.text_field, args.delimiter, args.encoding):
                yield str(path), document
        else:
            for document in read_text_documents(path, args.encoding):
                yield str(path), document


def build_entries(args: argparse.Namespace) -> tuple[list[dict[str, int | str]], dict[str, int]]:
    token_counts: Counter[str] = Counter()
    document_counts: defaultdict[str, int] = defaultdict(int)
    files_seen: set[str] = set()
    document_total = 0

    for file_name, document in iter_documents(args):
        files_seen.add(file_name)
        document_total += 1
        tokens = tokenize(document)
        token_counts.update(tokens)
        for token in set(tokens):
            document_counts[token] += 1

    entries = [
        {
            "word": word,
            "token_count": count,
            "document_count": document_counts[word],
        }
        for word, count in token_counts.most_common(args.top)
        if count >= args.min_count
    ]

    stats = {
        "files": len(files_seen),
        "documents": document_total,
        "unique_words": len(token_counts),
        "selected_words": len(entries),
        "tokens": sum(token_counts.values()),
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
        "converter": "scripts/prepare-word-frequency-import.py",
        "format": args.format,
        "text_field": args.text_field if args.format in {"jsonl", "csv"} else None,
        "stats": stats,
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
        if args.mode == "payload":
            print(json.dumps(entries, ensure_ascii=False, indent=2 if args.pretty else None))
        else:
            print(render_sql(args, entries, stats))
    except (OSError, ValueError) as exc:
        print(f"prepare-word-frequency-import: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
