#!/usr/bin/env python3
"""Build Patxanga pt-PT word-frequency SQL from DGT Translation Memory zips."""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
import zipfile
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree


TOKEN_RE = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿ]+")
XML_LANG = "{http://www.w3.org/XML/1998/namespace}lang"
ROMAN_NUMERAL_RE = re.compile(r"^[IVXLCDM]+$")
DGT_DEFAULT_EXCLUDED_WORDS = {
    "CE",
    "CEE",
    "EEE",
    "EU",
    "JO",
    "UE",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract Portuguese word frequencies from DGT-TM zip files.",
    )
    parser.add_argument("inputs", nargs="+", type=Path, help="DGT-TM zip file(s).")
    parser.add_argument("--language", default="pt-PT", choices=("pt-PT",))
    parser.add_argument("--source", default="pt_pt_dgt_tm_sample")
    parser.add_argument("--source-version", default="dgt-tm-sample")
    parser.add_argument("--source-url", default="https://joint-research-centre.ec.europa.eu/language-technology-resources/dgt-translation-memory_en")
    parser.add_argument("--license-name", default="European Commission reuse conditions for DGT-TM")
    parser.add_argument("--license-url", default="https://joint-research-centre.ec.europa.eu/language-technology-resources/dgt-translation-memory_en#conditions")
    parser.add_argument("--imported-by", default="scripts/prepare-dgt-tmx-frequency.py")
    parser.add_argument("--top", type=int, default=100000)
    parser.add_argument("--min-count", type=int, default=2)
    parser.add_argument("--max-documents", type=int, default=0, help="0 means no limit.")
    parser.add_argument("--max-segments", type=int, default=0, help="0 means no limit.")
    parser.add_argument("--include-dgt-noise", action="store_true", help="Keep common legal/editorial acronyms and one-letter tokens.")
    parser.add_argument("--mode", choices=("sql", "payload"), default="sql")
    parser.add_argument("--pretty", action="store_true")
    return parser.parse_args()


def normalize_word(raw_word: str) -> str:
    decomposed = unicodedata.normalize("NFD", raw_word)
    without_marks = "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")
    normalized = without_marks.upper().replace("Ç", "C")
    return "".join(ch for ch in normalized if "A" <= ch <= "Z")


def tokenize(text: str) -> list[str]:
    tokens: list[str] = []
    for match in TOKEN_RE.finditer(text):
        token = normalize_word(match.group(0))
        if token:
            tokens.append(token)
    return tokens


def is_dgt_noise_word(word: str) -> bool:
    if len(word) < 2:
        return True
    if word in DGT_DEFAULT_EXCLUDED_WORDS:
        return True
    if ROMAN_NUMERAL_RE.match(word):
        return True
    return False


def is_portuguese_tuv(element: ElementTree.Element) -> bool:
    language = (
        element.attrib.get(XML_LANG)
        or element.attrib.get("lang")
        or element.attrib.get("xml:lang")
        or ""
    ).lower()
    return language == "pt" or language.startswith("pt-")


def iter_tmx_texts_from_member(handle: object) -> Iterable[str]:
    for event, element in ElementTree.iterparse(handle, events=("end",)):
        if element.tag.endswith("tuv") and is_portuguese_tuv(element):
            texts = []
            for child in element.iter():
                if child.tag.endswith("seg") and child.text:
                    texts.append(child.text)
            if texts:
                yield " ".join(texts)
            element.clear()


def iter_tmx_texts(args: argparse.Namespace) -> Iterable[tuple[str, str]]:
    document_count = 0
    segment_count = 0

    for zip_path in args.inputs:
        with zipfile.ZipFile(zip_path) as archive:
            for name in archive.namelist():
                if not name.lower().endswith(".tmx"):
                    continue
                document_count += 1
                if args.max_documents and document_count > args.max_documents:
                    return
                with archive.open(name) as handle:
                    for text in iter_tmx_texts_from_member(handle):
                        segment_count += 1
                        if args.max_segments and segment_count > args.max_segments:
                            return
                        yield f"{zip_path.name}:{name}", text


def build_entries(args: argparse.Namespace) -> tuple[list[dict[str, int | str]], dict[str, int]]:
    token_counts: Counter[str] = Counter()
    document_counts: defaultdict[str, int] = defaultdict(int)
    files_seen: set[str] = set()
    segment_total = 0

    for document_name, text in iter_tmx_texts(args):
        files_seen.add(document_name)
        segment_total += 1
        tokens = tokenize(text)
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
        and (args.include_dgt_noise or not is_dgt_noise_word(word))
    ]

    stats = {
        "tmx_documents": len(files_seen),
        "segments": segment_total,
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
        "converter": "scripts/prepare-dgt-tmx-frequency.py",
        "stats": stats,
        "attribution_required": "European Commission retains ownership of DGT-TM data",
        "noise_filter": "drops one-letter tokens, roman numerals, and common legal/editorial acronyms unless --include-dgt-noise is used",
        "raw_corpus_not_versioned": True,
    }

    return "\n".join(
        [
            "select public.import_patxanga_word_frequency_entries(",
            f"    p_language := {sql_literal(args.language)},",
            f"    p_source := {sql_literal(args.source)},",
            "    p_source_domain := 'parliament',",
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
            print("prepare-dgt-tmx-frequency: no frequency entries generated", file=sys.stderr)
            return 1
        if args.mode == "payload":
            print(json.dumps({"entries": entries, "stats": stats}, ensure_ascii=False, indent=2 if args.pretty else None))
        else:
            print(render_sql(args, entries, stats))
    except (OSError, ValueError, zipfile.BadZipFile, ElementTree.ParseError) as exc:
        print(f"prepare-dgt-tmx-frequency: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
