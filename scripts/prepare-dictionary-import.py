#!/usr/bin/env python3
"""Prepare audited Patxanga dictionary imports from CSV files.

The script intentionally does not import a real dictionary by itself. It converts
an audited source file into the JSON payload or SQL call expected by
public.import_patxanga_dictionary_entries(...).
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path
from typing import Any


VALID_LANGUAGES = {"pt-BR", "pt-PT"}
TRUE_VALUES = {"1", "true", "t", "yes", "y", "sim", "s", "ativo", "active"}
FALSE_VALUES = {"0", "false", "f", "no", "n", "nao", "não", "inativo", "inactive"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert a dictionary CSV file into Patxanga import JSON or SQL.",
    )
    parser.add_argument("csv_file", type=Path, help="Source CSV file.")
    parser.add_argument(
        "--mode",
        choices=("payload", "sql"),
        default="payload",
        help="Output raw JSON payload or a complete SQL call. Default: payload.",
    )
    parser.add_argument(
        "--word-column",
        default="word",
        help="CSV column containing the original word. Default: word.",
    )
    parser.add_argument(
        "--active-column",
        default="is_active",
        help="Optional CSV column containing active status. Default: is_active.",
    )
    parser.add_argument(
        "--delimiter",
        default=",",
        help="CSV delimiter. Default: comma.",
    )
    parser.add_argument(
        "--encoding",
        default="utf-8",
        help="CSV encoding. Default: utf-8.",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print JSON payload.",
    )
    parser.add_argument("--language", choices=sorted(VALID_LANGUAGES))
    parser.add_argument("--source")
    parser.add_argument("--license-name")
    parser.add_argument("--source-version")
    parser.add_argument("--license-url")
    parser.add_argument("--source-url")
    parser.add_argument("--imported-by")
    parser.add_argument(
        "--metadata-json",
        default="{}",
        help="Additional metadata object included in SQL mode. Default: {}.",
    )
    parser.add_argument(
        "--deactivate-missing",
        action="store_true",
        help="Use only when the CSV fully replaces an existing language+source.",
    )
    return parser.parse_args()


def parse_active(raw_value: str | None, row_number: int, column_name: str) -> bool:
    if raw_value is None or raw_value.strip() == "":
        return True

    normalized = raw_value.strip().lower()
    if normalized in TRUE_VALUES:
        return True
    if normalized in FALSE_VALUES:
        return False

    raise ValueError(
        f"Invalid boolean value in row {row_number}, column {column_name!r}: {raw_value!r}"
    )


def read_entries(args: argparse.Namespace) -> list[dict[str, Any]]:
    if len(args.delimiter) != 1:
        raise ValueError("--delimiter must be a single character")

    with args.csv_file.open("r", encoding=args.encoding, newline="") as csv_handle:
        reader = csv.DictReader(csv_handle, delimiter=args.delimiter)
        if reader.fieldnames is None:
            raise ValueError("CSV file must include a header row")

        fieldnames = {name.strip(): name for name in reader.fieldnames if name is not None}
        if args.word_column not in fieldnames:
            available = ", ".join(reader.fieldnames)
            raise ValueError(
                f"Missing word column {args.word_column!r}. Available columns: {available}"
            )

        word_column = fieldnames[args.word_column]
        active_column = fieldnames.get(args.active_column)
        entries: list[dict[str, Any]] = []

        for row_index, row in enumerate(reader, start=2):
            word = (row.get(word_column) or "").strip()
            is_active = parse_active(
                row.get(active_column) if active_column is not None else None,
                row_index,
                args.active_column,
            )
            entries.append({"word": word, "is_active": is_active})

    return entries


def parse_metadata(raw_metadata: str, csv_file: Path, row_count: int) -> dict[str, Any]:
    try:
        metadata = json.loads(raw_metadata)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid --metadata-json: {exc}") from exc

    if not isinstance(metadata, dict):
        raise ValueError("--metadata-json must be a JSON object")

    return {
        **metadata,
        "input_file": str(csv_file),
        "input_rows": row_count,
        "converter": "scripts/prepare-dictionary-import.py",
    }


def sql_literal(value: str | None) -> str:
    if value is None or value == "":
        return "null"
    return "'" + value.replace("'", "''") + "'"


def sql_jsonb(value: Any) -> str:
    compact = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return sql_literal(compact) + "::jsonb"


def validate_sql_args(args: argparse.Namespace) -> None:
    required = {
        "--language": args.language,
        "--source": args.source,
        "--license-name": args.license_name,
    }
    missing = [option for option, value in required.items() if value is None or value == ""]
    if missing:
        raise ValueError("SQL mode requires " + ", ".join(missing))


def render_sql(args: argparse.Namespace, entries: list[dict[str, Any]]) -> str:
    validate_sql_args(args)
    metadata = parse_metadata(args.metadata_json, args.csv_file, len(entries))

    return "\n".join(
        [
            "select public.import_patxanga_dictionary_entries(",
            f"    p_language := {sql_literal(args.language)},",
            f"    p_source := {sql_literal(args.source)},",
            f"    p_license_name := {sql_literal(args.license_name)},",
            f"    p_entries := {sql_jsonb(entries)},",
            f"    p_source_version := {sql_literal(args.source_version)},",
            f"    p_license_url := {sql_literal(args.license_url)},",
            f"    p_source_url := {sql_literal(args.source_url)},",
            f"    p_imported_by := {sql_literal(args.imported_by)},",
            f"    p_metadata := {sql_jsonb(metadata)},",
            f"    p_deactivate_missing := {'true' if args.deactivate_missing else 'false'}",
            ");",
        ]
    )


def main() -> int:
    args = parse_args()

    try:
        entries = read_entries(args)
        if args.mode == "payload":
            indent = 2 if args.pretty else None
            print(json.dumps(entries, ensure_ascii=False, indent=indent))
        else:
            print(render_sql(args, entries))
    except (OSError, ValueError) as exc:
        print(f"prepare-dictionary-import: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
