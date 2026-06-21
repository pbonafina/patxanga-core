#!/bin/zsh
set -euo pipefail

repo_dir=~/patxanga-bootstrap/patxanga-core
container_name="${PATXANGA_DB_CONTAINER:-supabase_db_patxanga-core}"

typeset -a lobby_ops_tests=(
  "sql/tests/test_resume_match.sql"
  "sql/tests/test_start_match_from_lobby.sql"
  "sql/tests/test_direct_invite_flow.sql"
  "sql/tests/test_direct_invite_decline.sql"
  "sql/tests/test_forfeit_single_player.sql"
  "sql/tests/test_forfeit_all_players.sql"
  "sql/tests/test_list_pending_invites.sql"
  "sql/tests/test_list_resumable_matches.sql"
  "sql/tests/test_match_bootstrap_bot_metadata.sql"
)

typeset -a engine_regression_tests=(
  "sql/tests/test_dictionary_contract.sql"
  "sql/tests/test_dictionary_import_pipeline.sql"
  "sql/tests/test_dictionary_imported_words_engine_path.sql"
  "sql/tests/test_dictionary_policy_voting_path.sql"
  "sql/tests/test_easy_bot_turn_policy.sql"
  "sql/tests/test_exchange_tiles.sql"
  "sql/tests/test_pass_turn.sql"
  "sql/tests/test_submit_move_auto.sql"
  "sql/tests/test_match_end_all_passed.sql"
  "sql/tests/test_match_end_empty_rack.sql"
  "sql/tests/test_match_end_final_penalty.sql"
  "sql/tests/test_submit_move_pending_vote.sql"
  "sql/tests/test_submit_move_pending_vote_accept.sql"
  "sql/tests/test_submit_move_pending_vote_reject.sql"
)

typeset -a entrypoint_regression_tests=(
  "sql/tests/test_get_match_bootstrap.sql"
  "sql/tests/test_get_pending_vote_context.sql"
  "sql/tests/test_preview_move.sql"
  "sql/tests/test_submit_move_bridge_existing_board_tile.sql"
  "sql/tests/test_hydrate_placed_tiles_declared_letter.sql"
)

usage() {
  cat <<'EOF'
Usage:
  zsh scripts/run-sql-test-suite.sh lobby_ops
  zsh scripts/run-sql-test-suite.sh engine_regression
  zsh scripts/run-sql-test-suite.sh entrypoint_regression
  zsh scripts/run-sql-test-suite.sh all
  zsh scripts/run-sql-test-suite.sh path/to/test.sql [path/to/other.sql ...]

Profiles:
  lobby_ops          Lobby, invite, resume and forfeit operational coverage
  engine_regression  Dictionary, exchange, pass turn, match end and pending vote coverage
  entrypoint_regression  Bootstrap, pending-vote context, preview and helper RPC coverage
  all                All predefined profiles above
EOF
}

resolve_tests() {
  if [[ $# -eq 0 ]]; then
    usage
    exit 1
  fi

  case "$1" in
    lobby_ops)
      printf '%s\n' "${lobby_ops_tests[@]}"
      ;;
    engine_regression)
      printf '%s\n' "${engine_regression_tests[@]}"
      ;;
    entrypoint_regression)
      printf '%s\n' "${entrypoint_regression_tests[@]}"
      ;;
    all)
      printf '%s\n' "${lobby_ops_tests[@]}" "${engine_regression_tests[@]}" "${entrypoint_regression_tests[@]}"
      ;;
    *)
      printf '%s\n' "$@"
      ;;
  esac
}

cd "$repo_dir"

typeset -a tests_to_run
while IFS= read -r test_file; do
  tests_to_run+=("$test_file")
done < <(resolve_tests "$@")

if [[ ${#tests_to_run[@]} -eq 0 ]]; then
  echo "No SQL tests selected."
  exit 1
fi

for test_file in "${tests_to_run[@]}"; do
  if [[ ! -f "$test_file" ]]; then
    echo "SQL test file not found: $test_file" >&2
    exit 1
  fi

  echo "==> $test_file"
  docker exec -i "$container_name" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$test_file"
done
