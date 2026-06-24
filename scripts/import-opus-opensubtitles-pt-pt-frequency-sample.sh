#!/usr/bin/env zsh
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
work_dir="${PATXANGA_OPUS_WORK_DIR:-/tmp/patxanga-opus-opensubtitles-pt-pt-frequency}"
zip_url="${PATXANGA_OPUS_OPENSUBTITLES_URL:-https://opus.nlpl.eu/legacy/download.php?f=OpenSubtitles/v2024/moses/pt-zh_ze.txt.zip}"
zip_path="$work_dir/opensubtitles-pt-zh_ze.txt.zip"
sql_path="$work_dir/patxanga-opus-opensubtitles-pt-pt-frequency.sql"
summary_path="$work_dir/patxanga-opus-opensubtitles-pt-pt-frequency.summary.json"

source_name="${PATXANGA_OPUS_OPENSUBTITLES_SOURCE:-pt_pt_opus_opensubtitles_2024_pt_sample}"
source_version="${PATXANGA_OPUS_OPENSUBTITLES_SOURCE_VERSION:-OPUS OpenSubtitles v2024 moses pt-zh_ze sample 2026-06-24}"
max_documents="${PATXANGA_OPUS_OPENSUBTITLES_MAX_DOCUMENTS:-0}"
max_lines="${PATXANGA_OPUS_OPENSUBTITLES_MAX_LINES:-160000}"
top_words="${PATXANGA_OPUS_OPENSUBTITLES_TOP_WORDS:-100000}"
min_count="${PATXANGA_OPUS_OPENSUBTITLES_MIN_COUNT:-2}"

mkdir -p "$work_dir"

if [[ ! "$source_name" =~ '^[A-Za-z0-9_:-]+$' ]]; then
  echo "Unsafe PATXANGA_OPUS_OPENSUBTITLES_SOURCE: $source_name" >&2
  exit 1
fi

if [[ ! -s "$zip_path" ]]; then
  curl -L --fail --retry 3 --connect-timeout 20 "$zip_url" -o "$zip_path"
fi

python3 "$repo_root/scripts/prepare-opus-frequency.py" "$zip_path" \
  --source "$source_name" \
  --source-domain subtitles \
  --source-version "$source_version" \
  --source-url "https://opus.nlpl.eu/legacy/OpenSubtitles.php" \
  --license-name "OPUS OpenSubtitles redistribution terms; source subtitle rights vary" \
  --license-url "https://opus.nlpl.eu/legacy/OpenSubtitles.php" \
  --member-pattern '(^|/)OpenSubtitles.*\.pt$|(^|/)pt[^/]*$|\.pt(\.|$)' \
  --max-documents "$max_documents" \
  --max-lines "$max_lines" \
  --top "$top_words" \
  --min-count "$min_count" \
  --mode payload \
  --pretty > "$summary_path"

python3 "$repo_root/scripts/prepare-opus-frequency.py" "$zip_path" \
  --source "$source_name" \
  --source-domain subtitles \
  --source-version "$source_version" \
  --source-url "https://opus.nlpl.eu/legacy/OpenSubtitles.php" \
  --license-name "OPUS OpenSubtitles redistribution terms; source subtitle rights vary" \
  --license-url "https://opus.nlpl.eu/legacy/OpenSubtitles.php" \
  --member-pattern '(^|/)OpenSubtitles.*\.pt$|(^|/)pt[^/]*$|\.pt(\.|$)' \
  --max-documents "$max_documents" \
  --max-lines "$max_lines" \
  --top "$top_words" \
  --min-count "$min_count" \
  > "$sql_path"

docker exec supabase_db_patxanga-core \
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  -c "delete from public.patxanga_bot_word_policy_overrides where language = 'pt-PT' and reason = 'frequency import: $source_name'; delete from public.patxanga_word_frequency where language = 'pt-PT' and source = '$source_name';"

docker exec -i supabase_db_patxanga-core \
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  < "$sql_path"

echo "OPUS OpenSubtitles pt-PT frequency sample imported"
echo "zip: $zip_path"
echo "sql: $sql_path"
echo "summary: $summary_path"
