#!/bin/zsh
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_dir"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

fixture_dic="$tmp_dir/pt_BR_fixture.dic"
sample_csv="$tmp_dir/sample.csv"
import_sql="$tmp_dir/import.sql"

cat > "$fixture_dic" <<'DIC'
9
casa/AB
mesa/CD
A.C.
Coca-Cola
ação/EF
árvore/GH
aa
mão/IJ
casa/KL
DIC

python3 scripts/prepare-libreoffice-dictionary-sample.py \
  "$fixture_dic" \
  --limit 5 \
  --output "$sample_csv" \
  2> "$tmp_dir/extractor.stderr"

grep -q "declared_count=9" "$tmp_dir/extractor.stderr"
grep -q "selected=5" "$tmp_dir/extractor.stderr"

python3 - "$sample_csv" <<'PY'
import csv
import sys

with open(sys.argv[1], encoding="utf-8", newline="") as csv_handle:
    rows = list(csv.DictReader(csv_handle))

expected = [
    {"word": "CASA", "is_active": "true", "source_line": "2"},
    {"word": "MESA", "is_active": "true", "source_line": "3"},
    {"word": "AÇÃO", "is_active": "true", "source_line": "6"},
    {"word": "ÁRVORE", "is_active": "true", "source_line": "7"},
    {"word": "MÃO", "is_active": "true", "source_line": "9"},
]

assert rows == expected, rows
PY

python3 scripts/prepare-dictionary-import.py \
  "$sample_csv" \
  --mode sql \
  --language pt-BR \
  --source libreoffice_hunspell_pt_br_sample_test \
  --license-name "LGPLv3/MPL" \
  --source-version fixture \
  --license-url https://example.test/license \
  --source-url https://example.test/pt_BR.dic \
  --imported-by script-test \
  --metadata-json '{"fixture":true}' \
  > "$import_sql"

grep -q "libreoffice_hunspell_pt_br_sample_test" "$import_sql"
grep -q "AÇÃO" "$import_sql"
grep -q '"input_rows":5' "$import_sql"

echo "LibreOffice dictionary sample test passed"
