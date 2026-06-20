#!/bin/zsh
set -euo pipefail

repo_dir="${PATXANGA_REPO_DIR:-$HOME/patxanga-bootstrap/patxanga-core}"
container_name="${PATXANGA_DB_CONTAINER:-supabase_db_patxanga-core}"

typeset -a smoke_simulations=(
  "sql/simulations/bot_simulation_smoke.sql"
)

typeset -a long_simulations=(
  "sql/simulations/bot_simulation_long_multi_turn.sql"
)

typeset -a all_simulations=(
  "${smoke_simulations[@]}"
  "sql/simulations/bot_simulation_pending_vote.sql"
  "sql/simulations/bot_simulation_exchange_tiles.sql"
  "sql/simulations/bot_simulation_empty_rack_end.sql"
  "sql/simulations/bot_simulation_all_passed_end.sql"
  "sql/simulations/bot_simulation_invalid_move_expected_error.sql"
  "${long_simulations[@]}"
)

usage() {
  cat <<'EOF'
Usage:
  zsh scripts/run-bot-simulation.sh smoke
  zsh scripts/run-bot-simulation.sh long
  zsh scripts/run-bot-simulation.sh all
  zsh scripts/run-bot-simulation.sh path/to/simulation.sql [path/to/other.sql ...]

Profiles:
  smoke  Minimal deterministic bot-vs-bot QA simulation
  long   Multi-turn deterministic bot-vs-bot QA simulation
  all    All predefined bot simulations
EOF
}

resolve_simulations() {
  if [[ $# -eq 0 ]]; then
    usage
    exit 1
  fi

  case "$1" in
    smoke)
      printf '%s\n' "${smoke_simulations[@]}"
      ;;
    long)
      printf '%s\n' "${long_simulations[@]}"
      ;;
    all)
      printf '%s\n' "${all_simulations[@]}"
      ;;
    *)
      printf '%s\n' "$@"
      ;;
  esac
}

cd "$repo_dir"

typeset -a simulations_to_run
while IFS= read -r simulation_file; do
  simulations_to_run+=("$simulation_file")
done < <(resolve_simulations "$@")

if [[ ${#simulations_to_run[@]} -eq 0 ]]; then
  echo "No bot simulations selected."
  exit 1
fi

for simulation_file in "${simulations_to_run[@]}"; do
  if [[ ! -f "$simulation_file" ]]; then
    echo "Bot simulation file not found: $simulation_file" >&2
    exit 1
  fi

  echo "==> $simulation_file"
  docker exec -i "$container_name" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$simulation_file"
done
