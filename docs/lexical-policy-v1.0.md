# PATXANGA - Lexical Policy
Version: 1.0
Status: ACTIVE CONTRACT

## Objective

Definir quais palavras podem entrar automaticamente no dicionario reconhecido
pela engine e quais devem continuar passando pelo fluxo de votacao.

Esta politica nao decide a licenca de uma fonte. Ela define o comportamento de
produto para entradas lexicais depois que uma fonte ja foi considerada aceitavel
para o uso pretendido.

## Regra central

A engine aceita automaticamente apenas palavras ativas em
`patxanga_dictionary` para o idioma da partida.

Nao existe fallback entre idiomas:

- partida `pt-BR` consulta apenas entradas `pt-BR`
- partida `pt-PT` consulta apenas entradas `pt-PT`

Palavra nao reconhecida nao bloqueia o jogo. Ela entra no fluxo de
`pending_vote`, conforme o contrato de `submit_patxanga_move(...)`.

## Politica v1 para importacoes amplas

Para a primeira importacao ampla, a politica e conservadora:

- aceitar apenas lemas de uma unica palavra
- aceitar apenas letras portuguesas suportadas pela normalizacao atual
- aceitar palavras de 3 a 15 caracteres
- deduplicar pela normalizacao do banco
- registrar fonte, versao, licenca, URL, hash e lote de importacao
- manter `pt-BR` e `pt-PT` como universos lexicais separados

Ficam fora da importacao automatica ampla v1:

- palavras com hifen
- abreviacoes com ponto
- siglas e acronimos
- nomes proprios
- expressoes com espaco
- palavras com apostrofo ou cliticos especiais
- estrangeirismos sem decisao explicita de produto
- variantes que dependam de regra regional ainda nao documentada

Essas categorias podem ser aceitas por votacao durante a partida ou por uma
curadoria futura com fonte e politica proprias.

## Acentos e normalizacao

O banco normaliza palavras com `normalize_patxanga_word(...)`, convertendo para
maiusculas e removendo acentos suportados.

Consequencia operacional:

- uma entrada `ACAO` valida `ACAO` e `ação`
- uma entrada `ÁBACO` valida `ABACO` e `ábaco`
- a palavra exibida na jogada continua vindo das pecas colocadas no tabuleiro

Essa normalizacao e intencional para reduzir atrito de jogo. Uma politica mais
estrita de acentos pode ser avaliada depois.

## Fontes atuais

Fontes tecnicamente validadas como candidatas de amostra:

- LibreOffice Hunspell `pt_BR`
- LibreOffice Hunspell `pt_PT`

Status de produto:

- `pt_BR`: candidata tecnica com README declarando `LGPLv3/MPL`
- `pt_PT`: candidata tecnica pendente de revisao humana/legal, porque README e
  `LICENSES.txt` registram licencas em formatos diferentes

Nenhum dump amplo deve ser versionado no repositorio. Importacoes devem usar a
pipeline auditavel documentada em `docs/dictionary-import-pipeline-v1.0.md`.

## Criterio de regressao

Uma mudanca nesta politica deve manter cobertura automatizada para:

- `validate_word(...)` reconhecendo palavra importada ativa
- `preview_patxanga_move(...)` marcando palavra importada como reconhecida
- `submit_patxanga_move(...)` aceitando jogada com palavra importada sem
  `pending_vote`
- `preview_patxanga_move(...)` marcando palavra fora do dicionario ativo como
  exigindo votacao
- `submit_patxanga_move(...)` criando `pending_vote` para palavra fora do
  dicionario ativo sem mutar o board
- separacao por idioma
- palavra inativa permanecendo nao reconhecida

Teste de referencia:

```bash
zsh scripts/test-libreoffice-dictionary-sample.sh
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_imported_words_engine_path.sql
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_policy_voting_path.sql
```

O teste offline do extrator cobre as fronteiras conservadoras da politica v1:
hifen, abreviacao com ponto, sigla, nome proprio, digito, apostrofo e palavra
curta ficam fora da amostra automatica; lemas simples com acento continuam
entrando.

## Decisoes pendentes

- aprovar ou rejeitar juridicamente a fonte ampla `pt_PT`
- decidir se hifen pode entrar via curadoria propria
- decidir tratamento de nomes proprios
- decidir tratamento de siglas e acronimos
- decidir se flexoes Hunspell devem ser expandidas ou se apenas lemas entram
- decidir distribuicao de pecas especifica para `pt-PT`
