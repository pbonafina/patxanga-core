#!/usr/bin/env zsh
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
work_dir="${PATXANGA_CETEMPUBLICO_WORK_DIR:-/tmp/patxanga-cetempublico-pt-pt-frequency}"
freq_url="${PATXANGA_CETEMPUBLICO_URL:-https://www.linguateca.pt/acesso/tokens/formas.cetempublico.txt}"
freq_path="$work_dir/formas.cetempublico.txt"
sql_path="$work_dir/patxanga-cetempublico-pt-pt-frequency.sql"
summary_path="$work_dir/patxanga-cetempublico-pt-pt-frequency.summary.json"

source_name="${PATXANGA_CETEMPUBLICO_SOURCE:-pt_pt_linguateca_cetempublico_forms_2025}"
source_version="${PATXANGA_CETEMPUBLICO_SOURCE_VERSION:-Linguateca AC/DC CETEMPUBLICO forms list 2025-10-16}"
top_words="${PATXANGA_CETEMPUBLICO_TOP_WORDS:-120000}"
min_count="${PATXANGA_CETEMPUBLICO_MIN_COUNT:-2}"

mkdir -p "$work_dir"

if [[ ! "$source_name" =~ '^[A-Za-z0-9_:-]+$' ]]; then
  echo "Unsafe PATXANGA_CETEMPUBLICO_SOURCE: $source_name" >&2
  exit 1
fi

if [[ ! -s "$freq_path" ]]; then
  curl -L --fail --retry 3 --connect-timeout 20 "$freq_url" -o "$freq_path"
fi

python3 "$repo_root/scripts/prepare-frequency-list-import.py" "$freq_path" \
  --language pt-PT \
  --source "$source_name" \
  --source-domain news \
  --source-version "$source_version" \
  --source-url "https://www.linguateca.pt/acesso/corpus.php?corpus=CETEMPUBLICO" \
  --license-name "Linguateca AC/DC CETEMPúblico public form frequency list; source texts by PÚBLICO" \
  --license-url "https://www.linguateca.pt/CETEMPublico/" \
  --encoding iso-8859-1 \
  --top "$top_words" \
  --min-count "$min_count" \
  --mode payload \
  --pretty > "$summary_path"

python3 "$repo_root/scripts/prepare-frequency-list-import.py" "$freq_path" \
  --language pt-PT \
  --source "$source_name" \
  --source-domain news \
  --source-version "$source_version" \
  --source-url "https://www.linguateca.pt/acesso/corpus.php?corpus=CETEMPUBLICO" \
  --license-name "Linguateca AC/DC CETEMPúblico public form frequency list; source texts by PÚBLICO" \
  --license-url "https://www.linguateca.pt/CETEMPublico/" \
  --encoding iso-8859-1 \
  --top "$top_words" \
  --min-count "$min_count" \
  > "$sql_path"

docker exec supabase_db_patxanga-core \
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  -c "delete from public.patxanga_bot_word_policy_overrides where language = 'pt-PT' and reason = 'frequency import: $source_name'; delete from public.patxanga_word_frequency where language = 'pt-PT' and source = '$source_name';"

docker exec -i supabase_db_patxanga-core \
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  < "$sql_path"

echo "CETEMPúblico pt-PT frequency imported"
echo "frequency list: $freq_path"
echo "sql: $sql_path"
echo "summary: $summary_path"
