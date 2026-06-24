#!/bin/zsh
set -euo pipefail

repo_dir="${0:A:h}/.."
container_name="${PATXANGA_DB_CONTAINER:-supabase_db_patxanga-core}"
min_pt_br_words="${PATXANGA_PREFLIGHT_MIN_PT_BR_WORDS:-5}"
min_pt_pt_words="${PATXANGA_PREFLIGHT_MIN_PT_PT_WORDS:-5}"

cd "$repo_dir"

echo "==> Checking bot/dictionary alpha files"

typeset -a required_files=(
  "docs/07-bot-engine.md"
  "docs/bot-and-human-vs-bot-evolution-plan-v1.0.md"
  "docs/dictionary-import-pipeline-v1.0.md"
  "scripts/prepare-priberam-stardict.py"
  "scripts/import-priberam-pt-pt.sh"
  "sql/simulations/bot_simulation_metrics_report.sql"
  "sql/tests/test_bot_policy_config.sql"
  "supabase/migrations/20260623001000_34_easy_bot_candidate_move_catalog.sql"
  "supabase/migrations/20260623003000_35_easy_bot_vote_verdict.sql"
  "supabase/migrations/20260623010000_36_bot_policy_config.sql"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -s "$required_file" ]]; then
    echo "Missing required bot/dictionary file: $required_file" >&2
    exit 1
  fi
done

echo "==> Checking dictionary import modes"

if ! grep -q -- "--full" scripts/import-libreoffice-pt-br-sample.sh; then
  echo "pt-BR LibreOffice import script does not expose --full mode" >&2
  exit 1
fi

if ! grep -q -- "--full" scripts/import-libreoffice-pt-pt-sample.sh; then
  echo "pt-PT LibreOffice import script does not expose --full mode" >&2
  exit 1
fi

echo "==> Checking bot simulation coverage"

if ! grep -q "bot_simulation_metrics_report.sql" scripts/run-bot-simulation.sh; then
  echo "Bot metrics simulation is not registered in scripts/run-bot-simulation.sh" >&2
  exit 1
fi

if ! grep -q "test_bot_policy_config.sql" scripts/run-sql-test-suite.sh; then
  echo "Bot policy config test is not registered in scripts/run-sql-test-suite.sh" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Docker not found; skipping local database checks"
  echo "==> Bot/dictionary alpha preflight passed"
  exit 0
fi

docker_names="$(docker ps --format '{{.Names}}' 2>/dev/null || true)"

if [[ -z "$docker_names" ]]; then
  echo "==> Docker is unavailable or has no running containers; skipping local database checks"
  echo "==> Bot/dictionary alpha preflight passed"
  exit 0
fi

if ! printf '%s\n' "$docker_names" | grep -qx "$container_name"; then
  echo "==> Local database container $container_name is not running; skipping database checks"
  echo "==> Bot/dictionary alpha preflight passed"
  exit 0
fi

echo "==> Checking bot SQL functions in local database"

typeset -a required_functions=(
  "public.find_patxanga_easy_bot_candidate_moves(uuid,uuid,integer)"
  "public.submit_patxanga_easy_bot_turn(uuid,uuid)"
  "public.get_patxanga_easy_bot_word_verdict(uuid,uuid,text)"
  "public.submit_patxanga_easy_bot_vote(uuid,uuid)"
  "public.get_patxanga_bot_policy_config(text,text)"
)

for function_signature in "${required_functions[@]}"; do
  exists="$(
    docker exec "$container_name" psql -At -v ON_ERROR_STOP=1 -U postgres -d postgres \
      -c "select to_regprocedure('$function_signature') is not null;"
  )"

  if [[ "$exists" != "t" ]]; then
    echo "Missing required SQL function: $function_signature" >&2
    exit 1
  fi
done

echo "==> Checking active dictionary counts"

pt_br_count="$(
  docker exec "$container_name" psql -At -v ON_ERROR_STOP=1 -U postgres -d postgres \
    -c "select count(*) from public.patxanga_dictionary where language = 'pt-BR' and is_active;"
)"

pt_pt_count="$(
  docker exec "$container_name" psql -At -v ON_ERROR_STOP=1 -U postgres -d postgres \
    -c "select count(*) from public.patxanga_dictionary where language = 'pt-PT' and is_active;"
)"

if (( pt_br_count < min_pt_br_words )); then
  echo "Active pt-BR dictionary count $pt_br_count is below minimum $min_pt_br_words" >&2
  exit 1
fi

if (( pt_pt_count < min_pt_pt_words )); then
  echo "Active pt-PT dictionary count $pt_pt_count is below minimum $min_pt_pt_words" >&2
  exit 1
fi

echo "==> Active dictionary counts: pt-BR=$pt_br_count pt-PT=$pt_pt_count"
echo "==> Bot/dictionary alpha preflight passed"
