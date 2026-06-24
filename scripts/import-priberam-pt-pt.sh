#!/bin/zsh
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_dir"

archive="${PATXANGA_PRIBERAM_ARCHIVE:-/Users/paulobonafina/Downloads/Priberam.rar}"
source_dir="${PATXANGA_DICTIONARY_SOURCE_DIR:-/private/tmp/patxanga-dictionary-sources/priberam-pt-pt}"
limit=""
execute=0
import_mode="full"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --execute)
      execute=1
      shift
      ;;
    --limit)
      limit="$2"
      import_mode="sample"
      shift 2
      ;;
    --archive)
      archive="$2"
      shift 2
      ;;
    --source-dir)
      source_dir="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

if [ ! -f "$archive" ]; then
  echo "Missing Priberam archive: $archive" >&2
  exit 1
fi

mkdir -p "$source_dir"

extract_dir="$source_dir/extracted"
rm -rf "$extract_dir"
mkdir -p "$extract_dir"
bsdtar -xf "$archive" -C "$extract_dir"

stardict_dir="$extract_dir/Priberam"
if [ ! -d "$stardict_dir" ]; then
  echo "Expected extracted StarDict directory not found: $stardict_dir" >&2
  exit 1
fi

archive_sha256="$(LC_ALL=C shasum -a 256 "$archive" | awk '{print $1}')"
ifo_sha256="$(LC_ALL=C shasum -a 256 "$stardict_dir/book_stardict.ifo" | awk '{print $1}')"
idx_sha256="$(LC_ALL=C shasum -a 256 "$stardict_dir/book_stardict.idx" | awk '{print $1}')"
syn_sha256="$(LC_ALL=C shasum -a 256 "$stardict_dir/book_stardict.syn" | awk '{print $1}')"

source_id="priberam_stardict_pt_pt_${import_mode}"
limit_suffix="${limit:-all}"
csv_file="$source_dir/patxanga-priberam-pt-pt-${import_mode}-${limit_suffix}.csv"
extract_report_file="$source_dir/patxanga-priberam-pt-pt-${import_mode}-${limit_suffix}.extract-report.json"
metadata_file="$source_dir/patxanga-priberam-pt-pt-${import_mode}-${limit_suffix}.metadata.json"
sql_file="$source_dir/patxanga-priberam-pt-pt-${import_mode}-${limit_suffix}.sql"

typeset -a parser_args
parser_args=(
  "$stardict_dir"
  --output "$csv_file"
  --report "$extract_report_file"
)

if [ -n "$limit" ]; then
  parser_args+=(--limit "$limit")
fi

python3 scripts/prepare-priberam-stardict.py "${parser_args[@]}" >/dev/null

selected_count="$(python3 -c "import csv, sys; print(sum(1 for _ in csv.DictReader(open(sys.argv[1], encoding='utf-8'))))" "$csv_file")"
book_date="$(python3 -c "import json, sys; print(json.load(open(sys.argv[1], encoding='utf-8'))['book'].get('date', 'unknown'))" "$extract_report_file")"
source_version="${book_date}-${archive_sha256}"

python3 - "$metadata_file" "$extract_report_file" "$archive" "$archive_sha256" "$ifo_sha256" "$idx_sha256" "$syn_sha256" "$import_mode" "$source_id" "$selected_count" <<'PY'
import json
import sys

(
    metadata_path,
    extract_report_path,
    archive_path,
    archive_sha256,
    ifo_sha256,
    idx_sha256,
    syn_sha256,
    import_mode,
    source_id,
    selected_count,
) = sys.argv[1:]

with open(extract_report_path, encoding="utf-8") as handle:
    extract_report = json.load(handle)

metadata = {
    "technical_validation_only": False,
    "source_family": "Priberam StarDict user-provided local archive",
    "source_id": source_id,
    "import_mode": import_mode,
    "archive_path": archive_path,
    "archive_sha256": archive_sha256,
    "ifo_sha256": ifo_sha256,
    "idx_sha256": idx_sha256,
    "syn_sha256": syn_sha256,
    "selected_entry_count": int(selected_count),
    "book": extract_report.get("book", {}),
    "filter": extract_report.get("filter", {}),
    "raw_counts": {
        "idx_total": extract_report.get("idx_total"),
        "syn_total": extract_report.get("syn_total"),
        "deduped_valid_count": extract_report.get("deduped_valid_count"),
        "rejected_count": extract_report.get("rejected_count"),
    },
}

with open(metadata_path, "w", encoding="utf-8") as handle:
    json.dump(metadata, handle, ensure_ascii=False, separators=(",", ":"))
PY

python3 scripts/prepare-dictionary-import.py \
  "$csv_file" \
  --mode sql \
  --language pt-PT \
  --source "$source_id" \
  --license-name "User-provided local Priberam StarDict archive; redistribution license not recorded" \
  --source-version "$source_version" \
  --license-url "" \
  --source-url "$archive" \
  --imported-by scripts/import-priberam-pt-pt.sh \
  --metadata-json "$(cat "$metadata_file")" \
  --deactivate-missing \
  > "$sql_file"

echo "Priberam pt-PT import prepared"
echo "source=$source_id"
echo "archive=$archive"
echo "archive_sha256=$archive_sha256"
echo "book_date=$book_date"
echo "selected_entry_count=$selected_count"
echo "csv_file=$csv_file"
echo "metadata_json=$metadata_file"
echo "extract_report_json=$extract_report_file"
echo "import_sql=$sql_file"

if [ "$execute" -eq 1 ]; then
  container="${SUPABASE_DB_CONTAINER:-supabase_db_patxanga-core}"
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$sql_file"
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -v source="$source_id" -U postgres -d postgres <<'SQL'
select
    source,
    source_version,
    license_name,
    total_rows,
    valid_rows,
    inserted_count,
    updated_count,
    skipped_count,
    deactivated_count
from public.patxanga_dictionary_import_batches
where source = :'source'
order by created_at desc
limit 1;
SQL
fi
