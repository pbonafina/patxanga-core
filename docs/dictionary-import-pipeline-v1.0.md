# PATXANGA - Dictionary Import Pipeline
Version: 1.0
Status: ACTIVE CONTRACT

## Objective

Importar dicionarios amplos de forma auditavel, sem editar manualmente dumps
gigantes e sem acoplar a engine a uma fonte lexical ainda nao verificada.

O jogo continua consultando apenas `validate_word(p_word, p_language)`. A
pipeline de importacao e uma camada administrativa para popular e atualizar
`patxanga_dictionary` com metadados de fonte, versao, licenca e lote.

A politica de produto para o que entra automaticamente no dicionario esta em
`docs/lexical-policy-v1.0.md`.

## Fonte e licenca

Antes de importar uma fonte real, registrar explicitamente:

- `language`: `pt-BR` ou `pt-PT`
- `source`: identificador interno estavel, por exemplo `pt_br_licensed_words`
- `source_version`: versao, data ou hash do pacote de origem
- `license_name`: nome da licenca ou contrato
- `license_url`: URL publica da licenca, quando existir
- `source_url`: URL publica da fonte, quando existir
- `imported_by`: operador, script ou job que executou a importacao

Nao importar fonte sem licenca clara. Na duvida, manter a palavra fora do seed
amplo e deixar o fluxo de votacao cobrir o caso.

## Fonte candidata validada tecnicamente: LibreOffice Hunspell pt-BR

Fonte candidata para a primeira importacao controlada:

- familia: LibreOffice dictionaries, Hunspell `pt_BR`
- arquivo bruto: `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/pt_BR.dic`
- README/licenca: `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/README_pt_BR.txt`
- pasta upstream: `https://github.com/LibreOffice/dictionaries/tree/master/pt_BR`
- licenca declarada no README: `LGPLv3/MPL`
- commit upstream verificado: `93d537dc6afb0130de3da75d42c070ac267db957`
- SHA-256 de `pt_BR.dic`: `a38bfb26b68ece2834e79fe83e48d5792652970ace12db89d1b9674bf9933183`
- SHA-256 de `README_pt_BR.txt`: `9974ce691fdc1fe731717d7a2dc668244405fdc2bf9bf3367eb9b29e85177c88`
- contagem declarada no `.dic`: `312368`

Status: candidata para validacao tecnica local. Esta anotacao nao substitui
aprovacao humana/legal para uso em produto distribuido.

O extrator local gera uma amostra pequena e reprodutivel a partir do `.dic`,
sem versionar o dump completo. A primeira politica e conservadora:

- tamanho entre 3 e 15 caracteres
- somente letras portuguesas suportadas pela normalizacao atual
- sem hifen, ponto, digito, sigla ou abreviacao
- somente entradas originalmente em minusculas
- deduplicacao pelo mesmo criterio aproximado de normalizacao do banco

Preparar a amostra e o SQL sem executar:

```bash
zsh scripts/import-libreoffice-pt-br-sample.sh --limit 100
```

Preparar e executar contra o Supabase local:

```bash
zsh scripts/import-libreoffice-pt-br-sample.sh --limit 100 --execute
```

Se os arquivos ja estiverem baixados em
`/private/tmp/patxanga-dictionary-sources/libreoffice-pt-br`, a execucao pode
reaproveita-los:

```bash
zsh scripts/import-libreoffice-pt-br-sample.sh --skip-download --limit 100
```

O `source` usado pela amostra e `libreoffice_hunspell_pt_br_sample`. Nao usar
`p_deactivate_missing := true` nessa amostra, porque ela nao representa uma
substituicao completa da fonte.

Resultado da primeira validacao local:

- `--limit 25` gerou 25 entradas validas a partir do `.dic`
- primeira execucao inseriu 25 linhas no dicionario local
- segunda execucao com os mesmos metadados inseriu 0 e atualizou 25, confirmando
  idempotencia da pipeline para essa fonte/amostra
- o banco local foi resetado depois da validacao para voltar a baseline limpa

## Fonte candidata validada tecnicamente: LibreOffice Hunspell pt-PT

Fonte candidata para a primeira importacao controlada `pt-PT`:

- familia: LibreOffice dictionaries, Hunspell `pt_PT`
- arquivo bruto: `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/pt_PT.dic`
- README/licenca: `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/README_pt_PT.txt`
- LICENSES: `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/LICENSES.txt`
- pasta upstream: `https://github.com/LibreOffice/dictionaries/tree/master/pt_PT`
- licenca declarada no README: `GPLv2/LGPLv2.1/MPLv1.1`
- observacao de licenca: `LICENSES.txt` tambem registra `GPL/BSD` para o corrector ortografico
- commit upstream verificado: `93d537dc6afb0130de3da75d42c070ac267db957`
- SHA-256 de `pt_PT.dic`: `e29ba2d7aa8a2ad43e9cb46ac6473064b661545c87002aea90e18899d98d3cc9`
- SHA-256 de `README_pt_PT.txt`: `36de7d88a406a4947bf646a64145f00827566808988632e3df969aa95776060c`
- SHA-256 de `LICENSES.txt`: `d2c1cfe2e2dd81c651aec3fda5d1b4b4e7679b9e04f8cdc37586e521837384d1`
- contagem declarada no `.dic`: `44476`

Status: candidata para validacao tecnica local. A divergencia/ambiguidade entre
README e `LICENSES.txt` exige revisao humana/legal antes de qualquer decisao de
produto ou distribuicao.

Preparar a amostra e o SQL sem executar:

```bash
zsh scripts/import-libreoffice-pt-pt-sample.sh --limit 100
```

Preparar e executar contra o Supabase local:

```bash
zsh scripts/import-libreoffice-pt-pt-sample.sh --limit 100 --execute
```

Se os arquivos ja estiverem baixados em
`/private/tmp/patxanga-dictionary-sources/libreoffice-pt-pt`, a execucao pode
reaproveita-los:

```bash
zsh scripts/import-libreoffice-pt-pt-sample.sh --skip-download --limit 100
```

O `source` usado pela amostra e `libreoffice_hunspell_pt_pt_sample`. Nao usar
`p_deactivate_missing := true` nessa amostra.

Resultado da primeira validacao local:

- `--limit 25` gerou 25 entradas validas a partir do `.dic`
- primeira execucao inseriu 25 linhas no dicionario local
- segunda execucao com os mesmos metadados inseriu 0 e atualizou 25, confirmando
  idempotencia da pipeline para essa fonte/amostra

## Entrada Canonica

A RPC administrativa recebe um array JSON. Cada item deve ter:

```json
{
  "word": "CASA",
  "is_active": true
}
```

Campos:

- `word` ou `word_original`: palavra original como recebida da fonte
- `is_active`: opcional, default `true`

Regras:

- palavras vazias sao ignoradas
- duplicatas normalizadas no mesmo lote sao deduplicadas
- acentos sao normalizados pela funcao `normalize_patxanga_word(...)`
- a chave efetiva continua sendo `language + word_normalized`

## Conversor CSV

O conversor local `scripts/prepare-dictionary-import.py` transforma um CSV com
cabecalho em payload JSON ou em SQL pronto para execucao administrativa.

Formato minimo do CSV:

```csv
word,is_active
CASA,true
árvore,sim
PEIXE,false
```

Gerar apenas o payload JSON:

```bash
python3 scripts/prepare-dictionary-import.py fonte.csv --pretty > payload.json
```

Gerar SQL completo para a RPC:

```bash
python3 scripts/prepare-dictionary-import.py fonte.csv \
  --mode sql \
  --language pt-BR \
  --source pt_br_licensed_words \
  --license-name LICENSE-NAME \
  --source-version 2026-06-21 \
  --license-url https://example.test/license \
  --source-url https://example.test/source \
  --imported-by manual-maintenance \
  --metadata-json '{"sha256":"preencher-com-hash-do-arquivo"}' \
  > import_dictionary.sql
```

O conversor preserva linhas com palavra vazia para que a RPC registre
`skipped_count` no lote. Duplicatas tambem sao preservadas no payload; a RPC faz
a deduplicacao canonica usando a normalizacao do banco.

## Execucao

Funcao administrativa. Ela deve ser executada pelo owner do banco, por
manutencao local ou por `service_role`; a migration revoga execucao de
`PUBLIC`, `anon` e `authenticated`.

```sql
select public.import_patxanga_dictionary_entries(
    p_language := 'pt-BR',
    p_source := 'pt_br_licensed_words',
    p_license_name := 'LICENSE-NAME',
    p_entries := '[{"word":"CASA"},{"word":"ARVORE"}]'::jsonb,
    p_source_version := '2026-06-21',
    p_license_url := 'https://example.test/license',
    p_source_url := 'https://example.test/source',
    p_imported_by := 'manual-maintenance',
    p_metadata := '{"notes":"first audited import"}'::jsonb,
    p_deactivate_missing := false
);
```

`p_deactivate_missing := true` deve ser usado apenas quando o lote representar
uma substituicao completa daquela mesma combinacao `language + source`. Nesse
modo, palavras ativas da mesma fonte que nao aparecerem no novo lote sao
desativadas.

## Auditoria

Cada execucao cria uma linha em `patxanga_dictionary_import_batches` com:

- contagem total de linhas recebidas
- contagem de linhas validas distintas
- contagem de inseridas, atualizadas, ignoradas e desativadas
- metadados de fonte, versao e licenca
- `metadata` livre para hash, nome de arquivo ou observacoes operacionais

Cada palavra importada recebe:

- `source_version`
- `license_name`
- `license_url`
- `source_url`
- `import_batch_id`
- `imported_at`

## Validacao

Validacao minima apos mudar a pipeline:

```bash
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
zsh scripts/import-libreoffice-pt-br-sample.sh --skip-download --limit 25 --execute
zsh scripts/import-libreoffice-pt-pt-sample.sh --skip-download --limit 25 --execute
supabase db reset
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_import_pipeline.sql
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_imported_words_engine_path.sql
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
```
