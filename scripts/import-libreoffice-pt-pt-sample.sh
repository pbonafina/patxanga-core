#!/bin/zsh
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_dir"

source_dir="${PATXANGA_DICTIONARY_SOURCE_DIR:-/private/tmp/patxanga-dictionary-sources/libreoffice-pt-pt}"
limit="${PATXANGA_DICTIONARY_SAMPLE_LIMIT:-100}"
execute=0
skip_download=0

while [ "$#" -gt 0 ]; do
  case "$1" in
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

dic_url="https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/pt_PT.dic"
readme_url="https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/README_pt_PT.txt"
licenses_url="https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/LICENSES.txt"
commit_url="https://api.github.com/repos/LibreOffice/dictionaries/commits/master"

dic_file="$source_dir/pt_PT.dic"
readme_file="$source_dir/README_pt_PT.txt"
licenses_file="$source_dir/LICENSES.txt"
commit_file="$source_dir/master-commit.json"
sample_csv="$source_dir/patxanga-libreoffice-pt-pt-sample-${limit}.csv"
metadata_file="$source_dir/patxanga-libreoffice-pt-pt-sample-${limit}.metadata.json"
sql_file="$source_dir/patxanga-libreoffice-pt-pt-sample-${limit}.sql"

if [ "$skip_download" -eq 0 ]; then
  curl -L --fail --silent --show-error "$dic_url" -o "$dic_file"
  curl -L --fail --silent --show-error "$readme_url" -o "$readme_file"
  curl -L --fail --silent --show-error "$licenses_url" -o "$licenses_file"
  curl -L --fail --silent --show-error "$commit_url" -o "$commit_file"
fi

if [ ! -f "$dic_file" ] || [ ! -f "$readme_file" ] || [ ! -f "$licenses_file" ]; then
  echo "Missing source files in $source_dir. Run without --skip-download first." >&2
  exit 1
fi

commit_sha="unknown"
if [ -f "$commit_file" ]; then
  commit_sha="$(python3 -c "import json, sys; print(json.load(open(sys.argv[1], encoding='utf-8'))['sha'])" "$commit_file")"
fi

dic_sha256="$(LC_ALL=C shasum -a 256 "$dic_file" | awk '{print $1}')"
readme_sha256="$(LC_ALL=C shasum -a 256 "$readme_file" | awk '{print $1}')"
licenses_sha256="$(LC_ALL=C shasum -a 256 "$licenses_file" | awk '{print $1}')"
declared_count="$(python3 -c "import sys; print(open(sys.argv[1], encoding='utf-8-sig').readline().strip())" "$dic_file")"

python3 scripts/prepare-libreoffice-dictionary-sample.py \
  "$dic_file" \
  --limit "$limit" \
  --output "$sample_csv"

python3 - "$metadata_file" "$dic_sha256" "$readme_sha256" "$licenses_sha256" "$declared_count" "$limit" "$commit_sha" "$readme_url" "$licenses_url" <<'PY'
import json
import sys

(
    metadata_path,
    dic_sha256,
    readme_sha256,
    licenses_sha256,
    declared_count,
    limit,
    commit_sha,
    readme_url,
    licenses_url,
) = sys.argv[1:]

metadata = {
    "technical_validation_only": True,
    "source_family": "LibreOffice dictionaries Hunspell pt_PT",
    "raw_sha256": dic_sha256,
    "readme_sha256": readme_sha256,
    "licenses_sha256": licenses_sha256,
    "declared_entry_count": int(declared_count),
    "sample_limit": int(limit),
    "upstream_commit_sha": commit_sha,
    "license_review_required": True,
    "license_notes": (
        "README_pt_PT.txt declares GPLv2/LGPLv2.1/MPLv1.1; "
        "LICENSES.txt also notes GPL/BSD for the spellchecker."
    ),
    "readme_url": readme_url,
    "licenses_url": licenses_url,
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
PY

python3 scripts/prepare-dictionary-import.py \
  "$sample_csv" \
  --mode sql \
  --language pt-PT \
  --source libreoffice_hunspell_pt_pt_sample \
  --license-name "GPLv2/LGPLv2.1/MPLv1.1" \
  --source-version "$commit_sha" \
  --license-url "$readme_url" \
  --source-url "$dic_url" \
  --imported-by scripts/import-libreoffice-pt-pt-sample.sh \
  --metadata-json "$(cat "$metadata_file")" \
  > "$sql_file"

echo "LibreOffice pt-PT sample prepared"
echo "source_dir=$source_dir"
echo "upstream_commit_sha=$commit_sha"
echo "dic_sha256=$dic_sha256"
echo "readme_sha256=$readme_sha256"
echo "licenses_sha256=$licenses_sha256"
echo "sample_csv=$sample_csv"
echo "metadata_json=$metadata_file"
echo "import_sql=$sql_file"

if [ "$execute" -eq 1 ]; then
  container="${SUPABASE_DB_CONTAINER:-supabase_db_patxanga-core}"
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$sql_file"
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
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
where source = 'libreoffice_hunspell_pt_pt_sample'
order by created_at desc
limit 1;
SQL
fi
