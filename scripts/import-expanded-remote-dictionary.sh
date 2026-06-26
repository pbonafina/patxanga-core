#!/bin/zsh
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"

dictionary_sql="/private/tmp/patxanga-dictionary-sources/priberam-pt-pt/patxanga-priberam-pt-pt-expanded-frequency-350000.sql"
frequency_sql_files=(
  "/tmp/patxanga-cetempublico-pt-pt-frequency/patxanga-cetempublico-pt-pt-frequency.sql"
  "/tmp/patxanga-opus-globalvoices-pt-pt-frequency/patxanga-opus-globalvoices-pt-pt-frequency.sql"
  "/tmp/patxanga-opus-opensubtitles-pt-pt-frequency/patxanga-opus-opensubtitles-pt-pt-frequency.sql"
  "/tmp/patxanga-dgt-pt-pt-frequency/patxanga-dgt-pt-pt-frequency.sql"
)
container="${SUPABASE_DB_CONTAINER:-supabase_db_patxanga-core}"
remote_host="${SUPABASE_REMOTE_DB_HOST:-aws-1-eu-west-1.pooler.supabase.com}"
remote_port="${SUPABASE_REMOTE_DB_PORT:-6543}"
remote_user="${SUPABASE_REMOTE_DB_USER:-postgres.homvjupwhnxuswwcdzze}"
remote_db="${SUPABASE_REMOTE_DB_NAME:-postgres}"

if [[ ! -f "$dictionary_sql" ]]; then
  echo "Missing dictionary SQL: $dictionary_sql" >&2
  exit 1
fi

for frequency_sql in "${frequency_sql_files[@]}"; do
  if [[ ! -f "$frequency_sql" ]]; then
    echo "Missing frequency SQL: $frequency_sql" >&2
    exit 1
  fi
done

if ! docker ps --format '{{.Names}}' | grep -qx "$container"; then
  echo "Docker container not running: $container" >&2
  exit 1
fi

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  read -rs "SUPABASE_DB_PASSWORD?Senha do banco Supabase remoto: "
  echo
  export SUPABASE_DB_PASSWORD
fi

run_remote_sql_file() {
  local sql_file="$1"
  local label="$2"

  echo "==> Importing $label"
  docker exec -i \
    -e PGPASSWORD="$SUPABASE_DB_PASSWORD" \
    "$container" \
    psql \
      -v ON_ERROR_STOP=1 \
      -h "$remote_host" \
      -p "$remote_port" \
      -U "$remote_user" \
      -d "$remote_db" \
    < "$sql_file"
}

run_remote_query() {
  local query="$1"

  docker exec -i \
    -e PGPASSWORD="$SUPABASE_DB_PASSWORD" \
    "$container" \
    psql \
      -v ON_ERROR_STOP=1 \
      -h "$remote_host" \
      -p "$remote_port" \
      -U "$remote_user" \
      -d "$remote_db" \
      -c "$query"
}

cd "$repo_dir"

run_remote_query "select pg_size_pretty(pg_database_size(current_database())) as database_size_before;"

for frequency_sql in "${frequency_sql_files[@]}"; do
  run_remote_sql_file "$frequency_sql" "$(basename "$frequency_sql")"
done

run_remote_sql_file "$dictionary_sql" "pt-PT expanded frequency dictionary"

echo "==> Remote expanded validation"
run_remote_query "analyze public.patxanga_dictionary; analyze public.patxanga_word_frequency;"
run_remote_query "select pg_size_pretty(pg_database_size(current_database())) as database_size_after;"
run_remote_query "select language, count(*) from public.patxanga_dictionary where is_active group by language order by language;"
run_remote_query "select language, count(*) as rows, count(distinct word_normalized) as distinct_words from public.patxanga_word_frequency group by language order by language;"
run_remote_query "select source, count(*) from public.patxanga_dictionary where language = 'pt-PT' and is_active group by source order by count desc limit 8;"

echo "==> Expanded dictionary import finished"
