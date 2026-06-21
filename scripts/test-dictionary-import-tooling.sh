#!/bin/zsh
set -euo pipefail

repo_dir=~/patxanga-bootstrap/patxanga-core
cd "$repo_dir"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

fixture_csv="$tmp_dir/dictionary_fixture.csv"
payload_json="$tmp_dir/payload.json"
sql_output="$tmp_dir/import.sql"

cat > "$fixture_csv" <<'CSV'
word,is_active,notes
RATO,true,valid
árvore,sim,accented
rato,1,duplicate left for database dedupe
,true,blank preserved for import audit
PEIXE,false,inactive
CSV

python3 scripts/prepare-dictionary-import.py \
  "$fixture_csv" \
  --pretty \
  > "$payload_json"

python3 - "$payload_json" <<'PY'
import json
import sys

payload_path = sys.argv[1]
payload = json.load(open(payload_path, encoding="utf-8"))

assert len(payload) == 5, payload
assert payload[0] == {"word": "RATO", "is_active": True}, payload[0]
assert payload[1] == {"word": "árvore", "is_active": True}, payload[1]
assert payload[2] == {"word": "rato", "is_active": True}, payload[2]
assert payload[3] == {"word": "", "is_active": True}, payload[3]
assert payload[4] == {"word": "PEIXE", "is_active": False}, payload[4]
PY

python3 scripts/prepare-dictionary-import.py \
  "$fixture_csv" \
  --mode sql \
  --language pt-BR \
  --source import_tooling_test \
  --license-name "Test License" \
  --source-version fixture-v1 \
  --license-url https://example.test/license \
  --source-url https://example.test/source \
  --imported-by script-test \
  --metadata-json '{"fixture":true}' \
  --deactivate-missing \
  > "$sql_output"

grep -q "public.import_patxanga_dictionary_entries" "$sql_output"
grep -q "import_tooling_test" "$sql_output"
grep -q '"converter":"scripts/prepare-dictionary-import.py"' "$sql_output"
grep -q "p_deactivate_missing := true" "$sql_output"

if python3 scripts/prepare-dictionary-import.py \
  "$fixture_csv" \
  --mode sql \
  --source import_tooling_test \
  --license-name "Test License" \
  > "$tmp_dir/missing-language.out" 2>&1; then
  echo "Expected missing --language to fail" >&2
  exit 1
fi

grep -q "SQL mode requires --language" "$tmp_dir/missing-language.out"

echo "Dictionary import tooling test passed"
