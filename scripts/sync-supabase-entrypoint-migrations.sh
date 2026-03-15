#!/bin/zsh
set -euo pipefail

repo_dir=~/patxanga-bootstrap/patxanga-core
cd "$repo_dir"

build_migration() {
  local target_file="$1"
  local generated_from="$2"
  shift
  shift

  cat <<EOF > "$target_file"
-- GENERATED FILE - DO NOT EDIT DIRECTLY
-- Regenerate with: zsh scripts/sync-supabase-entrypoint-migrations.sh
-- Source set: $generated_from

EOF

  for source_file in "$@"; do
    cat "$source_file" >> "$target_file"
    printf '\n\n' >> "$target_file"
  done
}

build_migration \
  "supabase/migrations/20260313103446_12_presence_resume_forfeit.sql" \
  "sql/migrations/012_presence_resume_forfeit_schema.sql + sql/rpc/resume_match.sql + sql/rpc/forfeit_match.sql" \
  "sql/migrations/012_presence_resume_forfeit_schema.sql" \
  "sql/rpc/resume_match.sql" \
  "sql/rpc/forfeit_match.sql"

build_migration \
  "supabase/migrations/20260313104105_13_frontend_entrypoints.sql" \
  "sql/rpc/list_user_pending_invites.sql + sql/rpc/list_user_resumable_matches.sql + sql/rpc/start_match_from_lobby.sql" \
  "sql/rpc/list_user_pending_invites.sql" \
  "sql/rpc/list_user_resumable_matches.sql" \
  "sql/rpc/start_match_from_lobby.sql"
