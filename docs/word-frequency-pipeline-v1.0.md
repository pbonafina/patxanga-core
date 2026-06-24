# Word Frequency Pipeline v1.0

## Objetivo

Separar validade lexical de frequencia de uso:

- `patxanga_dictionary` responde se a palavra existe.
- `patxanga_word_frequency` responde se a palavra e comum em corpus real.
- bots `easy` e `medium` usam frequencia para evitar palavras raras quando existe base para o idioma.
- bot `hard` pode usar o lexico amplo.

## Fontes

O pipeline aceita corpus local em:

- texto puro: um documento por arquivo;
- JSONL: um documento por linha, campo `text` por padrao;
- CSV: uma linha por documento, coluna `text` por padrao.

Fontes recomendadas por dominio:

- `wiki`: dumps Wikipedia pt.
- `web`: OSCAR/Common Crawl.
- `news`: CETEMPúblico/Linguateca ou outro corpus jornalistico licenciado.
- `subtitles`: OPUS/OpenSubtitles, com cautela por ruido/licenca.
- `parliament`: DGT Translation Memory / EU Acquis para uma base europeia
  inicial, com cuidado por vies juridico e siglas editoriais.

Nao redistribuir textos brutos quando a licenca nao permitir. O produto precisa apenas de estatisticas agregadas.

## Fonte operacional inicial: DGT Translation Memory

Fonte usada para a primeira base real `pt-PT`:

- pagina oficial: `https://joint-research-centre.ec.europa.eu/language-technology-resources/dgt-translation-memory_en`
- condicoes: reuso permitido sob as condicoes da Comissao Europeia, com
  atribuicao obrigatoria da fonte e da titularidade dos dados
- volume inicial: `DGT-TM-2012/Vol_2011_1.zip`
- dominio registrado: `parliament`
- fonte registrada: `pt_pt_dgt_tm_2012_vol_2011_1_sample`

Importacao operacional:

```bash
zsh scripts/import-dgt-pt-pt-frequency-sample.sh
```

Parametros uteis:

```bash
PATXANGA_DGT_MAX_DOCUMENTS=500 \
PATXANGA_DGT_MAX_SEGMENTS=150000 \
zsh scripts/import-dgt-pt-pt-frequency-sample.sh
```

O script baixa o zip para `/tmp/patxanga-dgt-pt-pt-frequency`, gera SQL em
`/tmp` e importa somente estatisticas agregadas. O parser remove por padrao
tokens de ruido do DGT, como letras isoladas, numerais romanos e siglas
editoriais frequentes (`CE`, `UE`, `EEE`, `JO`).

## Fonte jornalistica principal: CETEMPúblico / AC/DC

Fonte operacional para jornalismo `pt-PT` estrito:

- corpus: CETEMPúblico, jornal `PÚBLICO`, 1991-1998
- pagina do corpus: `https://www.linguateca.pt/acesso/corpus.php?corpus=CETEMPUBLICO`
- lista publica de formas/frequencias:
  `https://www.linguateca.pt/acesso/tokens/formas.cetempublico.txt`
- variante declarada pelo AC/DC: `PT`
- tamanho declarado pelo AC/DC: 195,2 milhoes de palavras
- fonte registrada: `pt_pt_linguateca_cetempublico_forms_2025`
- dominio registrado: `news`

Importacao operacional:

```bash
zsh scripts/import-cetempublico-pt-pt-frequency.sh
```

O script importa a lista agregada de frequencias, nao o corpus bruto. O ficheiro
original e ISO-8859-1 e vem no formato `contagem<TAB>forma`.

## Fonte cotidiana: OPUS OpenSubtitles

Fonte operacional para fala cotidiana/informal:

- corpus: OPUS OpenSubtitles v2024
- pagina: `https://opus.nlpl.eu/legacy/OpenSubtitles.php`
- pacote usado: `OpenSubtitles/v2024/moses/pt-zh_ze.txt.zip`
- fonte registrada: `pt_pt_opus_opensubtitles_2024_pt_sample`
- dominio registrado: `subtitles`

Importacao operacional:

```bash
zsh scripts/import-opus-opensubtitles-pt-pt-frequency-sample.sh
```

Esta fonte e util para linguagem de dialogo, mas tem ruido tipico de legendas e
licenca heterogenea. O produto importa somente estatisticas agregadas.

## Fonte suplementar mista: OPUS GlobalVoices

Fonte operacional suplementar para temas jornalisticos/cidadaos:

- corpus: OPUS GlobalVoices v2018q4
- pagina: `https://opus.nlpl.eu/legacy/GlobalVoices.php`
- pacote usado: `GlobalVoices/v2018q4/raw/pt.zip`
- fonte registrada: `pt_pt_opus_globalvoices_2018q4_mixed_sample`
- dominio registrado: `mixed`

Importacao operacional:

```bash
zsh scripts/import-opus-globalvoices-pt-pt-frequency-sample.sh
```

Esta fonte nao deve ser tratada como `pt-PT` puro: o corpus `pt` mistura
variantes lusofonas e inclui peso brasileiro. Ela complementa diversidade, mas
CETEMPúblico e OpenSubtitles devem ter prioridade para jornalismo PT e cotidiano.

## Gerar Import SQL

Texto puro:

```bash
python3 scripts/prepare-word-frequency-import.py /path/corpus \
  --format text \
  --language pt-PT \
  --source pt_pt_wiki_2026_06 \
  --source-domain wiki \
  --license-name "CC BY-SA" \
  --source-version 2026-06 \
  --source-url https://dumps.wikimedia.org/ptwiki/ \
  --top 100000 \
  > /tmp/patxanga-pt-pt-frequency.sql
```

JSONL:

```bash
python3 scripts/prepare-word-frequency-import.py /path/corpus.jsonl \
  --format jsonl \
  --text-field text \
  --language pt-PT \
  --source pt_pt_oscar_sample \
  --source-domain web \
  --license-name "Corpus license recorded separately" \
  --top 100000 \
  > /tmp/patxanga-pt-pt-frequency.sql
```

CSV:

```bash
python3 scripts/prepare-word-frequency-import.py /path/corpus.csv \
  --format csv \
  --text-field text \
  --language pt-PT \
  --source pt_pt_news_sample \
  --source-domain news \
  --license-name "Corpus license recorded separately" \
  --top 100000 \
  > /tmp/patxanga-pt-pt-frequency.sql
```

Executar:

```bash
docker exec -i supabase_db_patxanga-core \
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  < /tmp/patxanga-pt-pt-frequency.sql
```

## Normalizacao

O script normaliza tokens do mesmo modo do jogo:

- maiusculas;
- remocao de acentos;
- `Ç` vira `C`;
- apenas `A-Z`.

## Uso Pelo Bot

Quando existe frequencia para o idioma:

- `easy`: exige palavra frequente/preferida e bloqueia `K/W/Y`.
- `medium`: aceita limiar menor.
- `hard`: aceita lexico amplo.

Importacoes de frequencia tambem inserem `preferred` em `patxanga_bot_word_policy_overrides` para palavras frequentes que existem no dicionario.

## Limite Atual

A migration inclui um seed `pt_pt_frequency_bootstrap_qa` para QA e desenvolvimento. Ele nao substitui corpus real. A proxima etapa e importar uma fonte real grande e comparar amostras de partidas antes/depois.
