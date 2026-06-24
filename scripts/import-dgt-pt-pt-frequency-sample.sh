#!/usr/bin/env zsh
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
work_dir="${PATXANGA_DGT_WORK_DIR:-/tmp/patxanga-dgt-pt-pt-frequency}"
zip_url="${PATXANGA_DGT_ZIP_URL:-https://wt-public.emm4u.eu/Resources/DGT-TM-2012/Vol_2011_1.zip}"
zip_path="$work_dir/$(basename "$zip_url")"
sql_path="$work_dir/patxanga-dgt-pt-pt-frequency.sql"
summary_path="$work_dir/patxanga-dgt-pt-pt-frequency.summary.json"

source_name="${PATXANGA_DGT_SOURCE:-pt_pt_dgt_tm_2012_vol_2011_1_sample}"
source_version="${PATXANGA_DGT_SOURCE_VERSION:-DGT-TM-2012 Vol_2011_1 sample 2026-06-24}"
max_documents="${PATXANGA_DGT_MAX_DOCUMENTS:-200}"
max_segments="${PATXANGA_DGT_MAX_SEGMENTS:-50000}"
top_words="${PATXANGA_DGT_TOP_WORDS:-100000}"
min_count="${PATXANGA_DGT_MIN_COUNT:-2}"

mkdir -p "$work_dir"

if [[ ! "$source_name" =~ '^[A-Za-z0-9_:-]+$' ]]; then
  echo "Unsafe PATXANGA_DGT_SOURCE: $source_name" >&2
  exit 1
fi

if [[ ! -s "$zip_path" ]]; then
  curl -L --fail --retry 3 --connect-timeout 20 "$zip_url" -o "$zip_path"
fi

python3 "$repo_root/scripts/prepare-dgt-tmx-frequency.py" "$zip_path" \
  --source "$source_name" \
  --source-version "$source_version" \
  --max-documents "$max_documents" \
  --max-segments "$max_segments" \
  --top "$top_words" \
  --min-count "$min_count" \
  --mode payload \
  --pretty > "$summary_path"

python3 "$repo_root/scripts/prepare-dgt-tmx-frequency.py" "$zip_path" \
  --source "$source_name" \
  --source-version "$source_version" \
  --max-documents "$max_documents" \
  --max-segments "$max_segments" \
  --top "$top_words" \
  --min-count "$min_count" \
  > "$sql_path"

docker exec supabase_db_patxanga-core \
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  -c "delete from public.patxanga_bot_word_policy_overrides where language = 'pt-PT' and reason = 'frequency import: $source_name'; delete from public.patxanga_word_frequency where language = 'pt-PT' and source = '$source_name';"

docker exec -i supabase_db_patxanga-core \
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  < "$sql_path"

echo "DGT pt-PT frequency sample imported"
echo "zip: $zip_path"
echo "sql: $sql_path"
echo "summary: $summary_path"
