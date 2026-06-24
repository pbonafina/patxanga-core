#!/usr/bin/env zsh
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
work_dir="${PATXANGA_OPUS_WORK_DIR:-/tmp/patxanga-opus-globalvoices-pt-pt-frequency}"
zip_url="${PATXANGA_OPUS_GLOBALVOICES_URL:-https://opus.nlpl.eu/legacy/download.php?f=GlobalVoices/v2018q4/raw/pt.zip}"
zip_path="$work_dir/globalvoices-pt.zip"
sql_path="$work_dir/patxanga-opus-globalvoices-pt-pt-frequency.sql"
summary_path="$work_dir/patxanga-opus-globalvoices-pt-pt-frequency.summary.json"

source_name="${PATXANGA_OPUS_GLOBALVOICES_SOURCE:-pt_pt_opus_globalvoices_2018q4_mixed_sample}"
legacy_source_name="pt_pt_opus_globalvoices_2018q4_sample"
source_version="${PATXANGA_OPUS_GLOBALVOICES_SOURCE_VERSION:-OPUS GlobalVoices v2018q4 raw pt mixed sample 2026-06-24}"
max_documents="${PATXANGA_OPUS_GLOBALVOICES_MAX_DOCUMENTS:-0}"
max_lines="${PATXANGA_OPUS_GLOBALVOICES_MAX_LINES:-120000}"
top_words="${PATXANGA_OPUS_GLOBALVOICES_TOP_WORDS:-100000}"
min_count="${PATXANGA_OPUS_GLOBALVOICES_MIN_COUNT:-2}"

mkdir -p "$work_dir"

if [[ ! "$source_name" =~ '^[A-Za-z0-9_:-]+$' ]]; then
  echo "Unsafe PATXANGA_OPUS_GLOBALVOICES_SOURCE: $source_name" >&2
  exit 1
fi

if [[ ! -s "$zip_path" ]]; then
  curl -L --fail --retry 3 --connect-timeout 20 "$zip_url" -o "$zip_path"
fi

python3 "$repo_root/scripts/prepare-opus-frequency.py" "$zip_path" \
  --source "$source_name" \
  --source-domain mixed \
  --source-version "$source_version" \
  --source-url "https://opus.nlpl.eu/legacy/GlobalVoices.php" \
  --license-name "OPUS GlobalVoices redistribution terms; Global Voices content attribution required" \
  --license-url "https://opus.nlpl.eu/legacy/GlobalVoices.php" \
  --max-documents "$max_documents" \
  --max-lines "$max_lines" \
  --top "$top_words" \
  --min-count "$min_count" \
  --mode payload \
  --pretty > "$summary_path"

python3 "$repo_root/scripts/prepare-opus-frequency.py" "$zip_path" \
  --source "$source_name" \
  --source-domain mixed \
  --source-version "$source_version" \
  --source-url "https://opus.nlpl.eu/legacy/GlobalVoices.php" \
  --license-name "OPUS GlobalVoices redistribution terms; Global Voices content attribution required" \
  --license-url "https://opus.nlpl.eu/legacy/GlobalVoices.php" \
  --max-documents "$max_documents" \
  --max-lines "$max_lines" \
  --top "$top_words" \
  --min-count "$min_count" \
  > "$sql_path"

docker exec supabase_db_patxanga-core \
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  -c "delete from public.patxanga_bot_word_policy_overrides where language = 'pt-PT' and reason in ('frequency import: $source_name', 'frequency import: $legacy_source_name'); delete from public.patxanga_word_frequency where language = 'pt-PT' and source in ('$source_name', '$legacy_source_name');"

docker exec -i supabase_db_patxanga-core \
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  < "$sql_path"

echo "OPUS GlobalVoices pt-PT frequency sample imported"
echo "zip: $zip_path"
echo "sql: $sql_path"
echo "summary: $summary_path"
