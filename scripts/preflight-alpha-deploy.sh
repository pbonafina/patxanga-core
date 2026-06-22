#!/bin/zsh
set -euo pipefail

repo_dir="${0:A:h}/.."
frontend_dir="$repo_dir/frontend"

echo "==> Checking frontend environment template"
if [[ ! -f "$frontend_dir/.env.example" ]]; then
  echo "Missing frontend/.env.example" >&2
  exit 1
fi

if ! grep -q '^NEXT_PUBLIC_SUPABASE_URL=' "$frontend_dir/.env.example"; then
  echo "Missing NEXT_PUBLIC_SUPABASE_URL in frontend/.env.example" >&2
  exit 1
fi

if ! grep -q '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' "$frontend_dir/.env.example"; then
  echo "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend/.env.example" >&2
  exit 1
fi

echo "==> Checking deployment plan"
if [[ ! -s "$repo_dir/docs/09-deployment-plan.md" ]]; then
  echo "docs/09-deployment-plan.md is empty" >&2
  exit 1
fi

echo "==> Running frontend lint"
(
  cd "$frontend_dir"
  npm run lint
)

echo "==> Running frontend production build"
(
  cd "$frontend_dir"
  npm run build
)

echo "==> Alpha deploy preflight passed"
