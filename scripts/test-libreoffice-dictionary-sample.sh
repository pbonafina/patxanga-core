#!/bin/zsh
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_dir"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

fixture_dic="$tmp_dir/pt_BR_fixture.dic"
sample_csv="$tmp_dir/sample.csv"
import_sql="$tmp_dir/import.sql"
boundary_dic="$tmp_dir/policy_boundary_fixture.dic"
boundary_csv="$tmp_dir/policy_boundary.csv"
pt_pt_source_dir="$tmp_dir/pt-pt-source"
pt_pt_sql="$pt_pt_source_dir/patxanga-libreoffice-pt-pt-sample-3.sql"
pt_pt_report="$pt_pt_source_dir/patxanga-libreoffice-pt-pt-sample-3.report.json"
pt_pt_full_sql="$pt_pt_source_dir/patxanga-libreoffice-pt-pt-full-4.sql"
pt_pt_full_report="$pt_pt_source_dir/patxanga-libreoffice-pt-pt-full-4.report.json"

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

cat > "$boundary_dic" <<'DIC'
10
coração/AB
luso-brasileiro/CD
A.C.
NASA
Lisboa
abc123
d'água
aa
árvore/EF
há-o/GH
DIC

python3 scripts/prepare-libreoffice-dictionary-sample.py \
  "$boundary_dic" \
  --limit 10 \
  --output "$boundary_csv" \
  2> "$tmp_dir/boundary.stderr"

grep -q "declared_count=10" "$tmp_dir/boundary.stderr"
grep -q "selected=2" "$tmp_dir/boundary.stderr"

python3 - "$boundary_csv" <<'PY'
import csv
import sys

with open(sys.argv[1], encoding="utf-8", newline="") as csv_handle:
    rows = list(csv.DictReader(csv_handle))

expected_words = ["CORAÇÃO", "ÁRVORE"]
actual_words = [row["word"] for row in rows]

assert actual_words == expected_words, rows
PY

mkdir -p "$pt_pt_source_dir"
cat > "$pt_pt_source_dir/pt_PT.dic" <<'DIC'
6
,	[CAT=punct1a]
abacateiro/p	[CAT=nc,G=m,N=s]
abacate/p	[CAT=nc,G=m,N=s]
ábaco/p	[CAT=nc,G=m,N=s]
abaixo-assinado/p	[CAT=nc,G=m,N=s]
abalar/XYPLv	[CAT=v,T=inf,TR=t]
DIC
cat > "$pt_pt_source_dir/README_pt_PT.txt" <<'TXT'
Regarding license versions:
     1. GPL Version 2
     2. LGPL Version 2.1
     3. MPL Version 1.1
TXT
cat > "$pt_pt_source_dir/LICENSES.txt" <<'TXT'
Spellchecker / Corrector ortografico
All dictionary files and associated programs are currently covered
by the GPL and BSD licence
TXT
cat > "$pt_pt_source_dir/master-commit.json" <<'JSON'
{"sha":"fixture-commit-sha"}
JSON

zsh scripts/import-libreoffice-pt-pt-sample.sh \
  --skip-download \
  --source-dir "$pt_pt_source_dir" \
  --limit 3 \
  > "$tmp_dir/pt-pt-import.stdout"

grep -q "LibreOffice pt-PT sample prepared" "$tmp_dir/pt-pt-import.stdout"
grep -q "upstream_commit_sha=fixture-commit-sha" "$tmp_dir/pt-pt-import.stdout"
grep -q "p_language := 'pt-PT'" "$pt_pt_sql"
grep -q "libreoffice_hunspell_pt_pt_sample" "$pt_pt_sql"
grep -q "GPLv2/LGPLv2.1/MPLv1.1" "$pt_pt_sql"
grep -q "ABACATEIRO" "$pt_pt_sql"
grep -q "ABACATE" "$pt_pt_sql"
grep -q "ÁBACO" "$pt_pt_sql"
grep -q '"license_review_required":true' "$pt_pt_sql"
grep -q '"import_mode": "sample"' "$pt_pt_report"
grep -q '"selected_entry_count": 3' "$pt_pt_report"

zsh scripts/import-libreoffice-pt-pt-sample.sh \
  --skip-download \
  --source-dir "$pt_pt_source_dir" \
  --full \
  --limit 4 \
  > "$tmp_dir/pt-pt-full-import.stdout"

grep -q "import_mode=full" "$tmp_dir/pt-pt-full-import.stdout"
grep -q "source=libreoffice_hunspell_pt_pt_full" "$tmp_dir/pt-pt-full-import.stdout"
grep -q "libreoffice_hunspell_pt_pt_full" "$pt_pt_full_sql"
grep -q '"import_mode": "full"' "$pt_pt_full_report"
grep -q '"selected_entry_count": 4' "$pt_pt_full_report"

echo "LibreOffice dictionary sample test passed"
