# PATXANGA - Dictionary Import Pipeline
Version: 1.0
Status: ACTIVE CONTRACT

## Objective

Importar dicionarios amplos de forma auditavel, sem editar manualmente dumps
gigantes e sem acoplar a engine a uma fonte lexical ainda nao verificada.

O jogo continua consultando apenas `validate_word(p_word, p_language)`. A
pipeline de importacao e uma camada administrativa para popular e atualizar
`patxanga_dictionary` com metadados de fonte, versao, licenca e lote.

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
supabase db reset
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_import_pipeline.sql
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
```
