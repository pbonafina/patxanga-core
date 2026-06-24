#!/usr/bin/env python3
"""Build Patxanga word-frequency SQL from OPUS zip/gzip/plain-text files."""

from __future__ import annotations

import argparse
import gzip
import json
import re
import sys
import unicodedata
import zipfile
from collections import Counter, defaultdict
from html import unescape
from pathlib import Path
from typing import Iterable, Iterator


TOKEN_RE = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿ]+")
XML_TAG_RE = re.compile(r"<[^>]+>")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract word frequencies from OPUS corpus files.",
    )
    parser.add_argument("inputs", nargs="+", type=Path, help="OPUS .zip/.gz/plain-text files.")
    parser.add_argument("--language", default="pt-PT", choices=("pt-PT", "pt-BR"))
    parser.add_argument("--source", required=True)
    parser.add_argument("--source-domain", required=True, choices=("news", "subtitles", "web", "mixed"))
    parser.add_argument("--source-version", required=True)
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--license-name", default="OPUS redistribution terms; source corpus license varies by collection")
    parser.add_argument("--license-url", default="https://opus.nlpl.eu/legacy")
    parser.add_argument("--imported-by", default="scripts/prepare-opus-frequency.py")
    parser.add_argument("--top", type=int, default=100000)
    parser.add_argument("--min-count", type=int, default=2)
    parser.add_argument("--max-documents", type=int, default=0, help="0 means no limit.")
    parser.add_argument("--max-lines", type=int, default=0, help="0 means no limit.")
    parser.add_argument("--member-pattern", default="", help="Regex for zip members to include.")
    parser.add_argument("--mode", choices=("sql", "payload"), default="sql")
    parser.add_argument("--pretty", action="store_true")
    return parser.parse_args()


def normalize_word(raw_word: str) -> str:
    decomposed = unicodedata.normalize("NFD", raw_word)
    without_marks = "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")
    normalized = without_marks.upper().replace("Ç", "C")
    return "".join(ch for ch in normalized if "A" <= ch <= "Z")


def tokenize(text: str) -> list[str]:
    cleaned = XML_TAG_RE.sub(" ", unescape(text))
    tokens: list[str] = []
    for match in TOKEN_RE.finditer(cleaned):
        token = normalize_word(match.group(0))
        if token:
            tokens.append(token)
    return tokens


def iter_text_lines_from_bytes(data: bytes) -> Iterator[str]:
    text = data.decode("utf-8", errors="replace")
    for line in text.splitlines():
        line = line.strip()
        if line:
            yield line


def iter_lines_from_path(path: Path, member_pattern: re.Pattern[str] | None) -> Iterable[tuple[str, str]]:
    suffixes = "".join(path.suffixes).lower()

    if suffixes.endswith(".zip"):
        with zipfile.ZipFile(path) as archive:
            for name in archive.namelist():
                if name.endswith("/"):
                    continue
                if member_pattern is not None and not member_pattern.search(name):
                    continue
                with archive.open(name) as handle:
                    data = handle.read()
                for line in iter_text_lines_from_bytes(data):
                    yield f"{path.name}:{name}", line
    elif suffixes.endswith(".gz"):
        with gzip.open(path, "rt", encoding="utf-8", errors="replace") as handle:
            for line in handle:
                line = line.strip()
                if line:
                    yield str(path), line
    else:
        with path.open("r", encoding="utf-8", errors="replace") as handle:
            for line in handle:
                line = line.strip()
                if line:
                    yield str(path), line


def build_entries(args: argparse.Namespace) -> tuple[list[dict[str, int | str]], dict[str, int]]:
    token_counts: Counter[str] = Counter()
    document_counts: defaultdict[str, int] = defaultdict(int)
    files_seen: set[str] = set()
    line_total = 0
    member_pattern = re.compile(args.member_pattern) if args.member_pattern else None

    for path in args.inputs:
        for document_name, line in iter_lines_from_path(path, member_pattern):
            if args.max_documents and len(files_seen) >= args.max_documents and document_name not in files_seen:
                break
            if args.max_lines and line_total >= args.max_lines:
                break

            files_seen.add(document_name)
            line_total += 1
            tokens = tokenize(line)
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
        "documents": len(files_seen),
        "lines": line_total,
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
        "converter": "scripts/prepare-opus-frequency.py",
        "stats": stats,
        "raw_corpus_not_versioned": True,
        "member_pattern": args.member_pattern or None,
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
            print("prepare-opus-frequency: no frequency entries generated", file=sys.stderr)
            return 1
        if args.mode == "payload":
            print(json.dumps({"entries": entries, "stats": stats}, ensure_ascii=False, indent=2 if args.pretty else None))
        else:
            print(render_sql(args, entries, stats))
    except (OSError, ValueError, zipfile.BadZipFile, re.error) as exc:
        print(f"prepare-opus-frequency: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
