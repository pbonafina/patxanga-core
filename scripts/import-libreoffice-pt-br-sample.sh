#!/bin/zsh
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_dir"

source_dir="${PATXANGA_DICTIONARY_SOURCE_DIR:-/private/tmp/patxanga-dictionary-sources/libreoffice-pt-br}"
limit="${PATXANGA_DICTIONARY_SAMPLE_LIMIT:-100}"
execute=0
skip_download=0
import_mode="sample"
limit_explicit=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --sample)
      import_mode="sample"
      shift
      ;;
    --full)
      import_mode="full"
      shift
      ;;
    --execute)
      execute=1
      shift
      ;;
    --skip-download)
      skip_download=1
      shift
      ;;
    --limit)
      limit="$2"
      limit_explicit=1
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

mkdir -p "$source_dir"

dic_url="https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/pt_BR.dic"
readme_url="https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/README_pt_BR.txt"
commit_url="https://api.github.com/repos/LibreOffice/dictionaries/commits/master"

dic_file="$source_dir/pt_BR.dic"
readme_file="$source_dir/README_pt_BR.txt"
commit_file="$source_dir/master-commit.json"
sample_csv="$source_dir/patxanga-libreoffice-pt-br-${import_mode}-${limit}.csv"
metadata_file="$source_dir/patxanga-libreoffice-pt-br-${import_mode}-${limit}.metadata.json"
report_file="$source_dir/patxanga-libreoffice-pt-br-${import_mode}-${limit}.report.json"
sql_file="$source_dir/patxanga-libreoffice-pt-br-${import_mode}-${limit}.sql"

if [ "$skip_download" -eq 0 ]; then
  curl -L --fail --silent --show-error "$dic_url" -o "$dic_file"
  curl -L --fail --silent --show-error "$readme_url" -o "$readme_file"
  curl -L --fail --silent --show-error "$commit_url" -o "$commit_file"
fi

if [ ! -f "$dic_file" ] || [ ! -f "$readme_file" ]; then
  echo "Missing source files in $source_dir. Run without --skip-download first." >&2
  exit 1
fi

commit_sha="unknown"
if [ -f "$commit_file" ]; then
  commit_sha="$(python3 -c "import json, sys; print(json.load(open(sys.argv[1], encoding='utf-8'))['sha'])" "$commit_file")"
fi

dic_sha256="$(LC_ALL=C shasum -a 256 "$dic_file" | awk '{print $1}')"
readme_sha256="$(LC_ALL=C shasum -a 256 "$readme_file" | awk '{print $1}')"
declared_count="$(python3 -c "import sys; print(open(sys.argv[1], encoding='utf-8-sig').readline().strip())" "$dic_file")"
source_id="libreoffice_hunspell_pt_br_${import_mode}"

if [ "$import_mode" = "full" ] && [ "${PATXANGA_DICTIONARY_SAMPLE_LIMIT:-}" = "" ] && [ "$limit_explicit" -eq 0 ]; then
  limit="$declared_count"
  sample_csv="$source_dir/patxanga-libreoffice-pt-br-${import_mode}-${limit}.csv"
  metadata_file="$source_dir/patxanga-libreoffice-pt-br-${import_mode}-${limit}.metadata.json"
  report_file="$source_dir/patxanga-libreoffice-pt-br-${import_mode}-${limit}.report.json"
  sql_file="$source_dir/patxanga-libreoffice-pt-br-${import_mode}-${limit}.sql"
fi

python3 scripts/prepare-libreoffice-dictionary-sample.py \
  "$dic_file" \
  --limit "$limit" \
  --output "$sample_csv"

selected_count="$(python3 -c "import csv, sys; print(sum(1 for _ in csv.DictReader(open(sys.argv[1], encoding='utf-8'))))" "$sample_csv")"

python3 - "$metadata_file" "$report_file" "$dic_sha256" "$readme_sha256" "$declared_count" "$limit" "$selected_count" "$commit_sha" "$import_mode" "$source_id" <<'PY'
import json
import sys

(
    metadata_path,
    report_path,
    dic_sha256,
    readme_sha256,
    declared_count,
    limit,
    selected_count,
    commit_sha,
    import_mode,
    source_id,
) = sys.argv[1:]
metadata = {
    "technical_validation_only": True,
    "import_mode": import_mode,
    "source_family": "LibreOffice dictionaries Hunspell pt_BR",
    "source_id": source_id,
    "raw_sha256": dic_sha256,
    "readme_sha256": readme_sha256,
    "declared_entry_count": int(declared_count),
    "selection_limit": int(limit),
    "selected_entry_count": int(selected_count),
    "upstream_commit_sha": commit_sha,
    "filter": {
        "min_length": 3,
        "max_length": 15,
        "letters_only": True,
        "lowercase_source_only": True,
        "dedupe_like_database": True,
    },
}

with open(metadata_path, "w", encoding="utf-8") as metadata_handle:
    json.dump(metadata, metadata_handle, ensure_ascii=False, separators=(",", ":"))

report = {
    "language": "pt-BR",
    "source": source_id,
    "import_mode": import_mode,
    "declared_entry_count": int(declared_count),
    "selection_limit": int(limit),
    "selected_entry_count": int(selected_count),
    "technical_validation_only": True,
    "execute_required": "rerun with --execute to import into local Supabase",
}

with open(report_path, "w", encoding="utf-8") as report_handle:
    json.dump(report, report_handle, ensure_ascii=False, indent=2)
PY

python3 scripts/prepare-dictionary-import.py \
  "$sample_csv" \
  --mode sql \
  --language pt-BR \
  --source "$source_id" \
  --license-name "LGPLv3/MPL" \
  --source-version "$commit_sha" \
  --license-url "$readme_url" \
  --source-url "$dic_url" \
  --imported-by scripts/import-libreoffice-pt-br-sample.sh \
  --metadata-json "$(cat "$metadata_file")" \
  > "$sql_file"

echo "LibreOffice pt-BR sample prepared"
echo "import_mode=$import_mode"
echo "source=$source_id"
echo "source_dir=$source_dir"
echo "upstream_commit_sha=$commit_sha"
echo "dic_sha256=$dic_sha256"
echo "readme_sha256=$readme_sha256"
echo "selected_entry_count=$selected_count"
echo "sample_csv=$sample_csv"
echo "metadata_json=$metadata_file"
echo "report_json=$report_file"
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
