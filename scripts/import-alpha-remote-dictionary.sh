#!/bin/zsh
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"

dictionary_sql="/private/tmp/patxanga-dictionary-sources/priberam-pt-pt/patxanga-priberam-pt-pt-alpha-frequency-30000.sql"
frequency_sql="/tmp/patxanga-cetempublico-pt-pt-frequency-alpha-10000.sql"
container="${SUPABASE_DB_CONTAINER:-supabase_db_patxanga-core}"
remote_host="${SUPABASE_REMOTE_DB_HOST:-aws-1-eu-west-1.pooler.supabase.com}"
remote_port="${SUPABASE_REMOTE_DB_PORT:-6543}"
remote_user="${SUPABASE_REMOTE_DB_USER:-postgres.homvjupwhnxuswwcdzze}"
remote_db="${SUPABASE_REMOTE_DB_NAME:-postgres}"

if [[ ! -f "$dictionary_sql" ]]; then
  echo "Missing dictionary SQL: $dictionary_sql" >&2
  exit 1
fi

if [[ ! -f "$frequency_sql" ]]; then
  echo "Missing frequency SQL: $frequency_sql" >&2
  exit 1
fi

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

run_remote_sql_file "$dictionary_sql" "pt-PT alpha dictionary"
run_remote_sql_file "$frequency_sql" "pt-PT alpha frequency"

echo "==> Remote alpha validation"
run_remote_query "select pg_size_pretty(pg_database_size(current_database())) as database_size;"
run_remote_query "select language, count(*) from public.patxanga_dictionary where is_active group by language order by language;"
run_remote_query "select language, count(*) from public.patxanga_word_frequency group by language order by language;"

echo "==> Alpha dictionary import finished"
