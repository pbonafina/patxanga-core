# PATXANGA - Plano de evolucao de bots, dicionarios e humano x bot

Versao: 1.0
Status: Plano de execucao proposto
Data: 2026-06-23

## 1. Objetivo

Evoluir os bots de simples automacao de QA para adversarios jogaveis e
participantes reais da mesa. O foco e:

- importar dicionarios amplos `pt-BR` e `pt-PT` com auditoria e licenca clara
- fazer o bot jogar palavras reais com capacidade progressiva de busca
- fazer o bot votar para aceitar ou rejeitar palavras em `pending_vote`
- transformar humano x bot em modo de jogo de produto, nao apenas demonstracao
- manter o backend como fonte de verdade para jogada, score, turno e votacao

Neste documento, "bot" significa jogador automatizado. O termo "boot" usado na
conversa deve ser entendido como bot.

## 2. Diagnostico atual

Estado funcional existente:

- existem jogadores bot em `patxanga_players`
- existe `submit_patxanga_easy_bot_turn(...)`
- o bot `easy` consegue jogar abertura valida simples
- o bot `easy` consegue tentar encaixe conectado simples
- quando nao encontra jogada segura, o bot passa o turno
- ha simulacoes SQL para smoke, pending vote, troca, fim de partida e erros
- ha Playwright para humano contra bot e ciclos curtos de turno
- existe pipeline auditavel para importar palavras em `patxanga_dictionary`
- existem fontes candidatas LibreOffice Hunspell para `pt-BR` e `pt-PT`
- a UI humano x bot dedicada foi iniciada, mas ainda e basica

Problemas atuais:

- o bot joga pouco e passa cedo demais
- o bot nao avalia jogadas pendentes como participante da mesa
- o bot nao usa dicionario amplo como repertorio real de jogo
- o humano x bot ainda nao tem ritmo, feedback e progressao de partida bons
- o frontend nao mostra intencao do bot, dificuldade, criterio de voto ou
  historico de decisao de modo satisfatorio
- dicionarios completos ainda nao devem ser importados sem decisao final de
  licenca/fonte

## 3. Principios de implementacao

1. O bot nunca escreve board, rack, score ou turno diretamente.
2. O bot usa somente RPCs oficiais de jogada, passe, troca e voto.
3. O bot pode receber funcoes auxiliares de leitura e ranking, mas a mutacao
   continua nas RPCs server-authoritative.
4. O dicionario amplo deve ser importado por lote auditavel, com metadados de
   fonte, licenca, versao, hash e contagem.
5. Voto de bot e voto de jogador bot, nao decisao global da engine.
6. O bot pode errar por politica de dificuldade, mas nao pode quebrar regra da
   engine.
7. Simulacao de QA e bot de produto compartilham engine de avaliacao, mas tem
   perfis e limites diferentes.
8. Cada tranche longa deve terminar com bateria conjunta de SQL, simulacao,
   frontend e documentacao.

## 4. Tranche A - Fundacao lexical ampla e segura

Objetivo:

Preparar importacao ampla sem comprometer licenca, performance ou rollback.

Entregas:

- consolidar decisao de fonte para `pt-BR` e `pt-PT`
- criar modo de importacao `full` separado do modo `sample`
- adicionar dry-run com contagem por filtro antes de executar
- registrar hashes, origem, licenca, commit upstream e filtros aplicados
- gerar SQL de importacao em arquivo temporario, sem versionar dump completo
- criar relatorio local de importacao por idioma
- manter `p_deactivate_missing := false` ate termos fonte canonicamente aprovada
- adicionar indice/consulta de performance para busca de candidatos por letras

Arquivos provaveis:

- `scripts/import-libreoffice-pt-br-sample.sh`
- `scripts/import-libreoffice-pt-pt-sample.sh`
- `scripts/prepare-libreoffice-dictionary-sample.py`
- `scripts/prepare-dictionary-import.py`
- `supabase/migrations/*dictionary*`
- `docs/dictionary-import-pipeline-v1.0.md`
- novo teste SQL de volume lexical

Criterios de aceite:

- importar lote grande localmente sem travar reset nem testes
- `validate_word(...)` continua O(log n) por `language + word_normalized`
- bootstrap mostra contagem real por idioma
- bot consegue consultar palavras candidatas sem varrer tabela inteira de forma
  perigosa
- licenca e fonte estao documentadas antes de qualquer uso de produto

Validacao:

```bash
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
zsh scripts/import-libreoffice-pt-br-sample.sh --skip-download --limit 1000 --execute
zsh scripts/import-libreoffice-pt-pt-sample.sh --skip-download --limit 1000 --execute
zsh scripts/run-sql-test-suite.sh all
```

## 5. Tranche B - Motor de candidatos de jogada do bot

Objetivo:

Fazer o bot procurar jogadas reais a partir do rack e do tabuleiro, em vez de
tentar apenas abertura/encaixe fixos.

Entregas:

- criar funcao de leitura de rack do bot
- criar funcao de leitura compacta do tabuleiro
- gerar candidatos de abertura a partir do dicionario ativo
- gerar candidatos conectados usando ancoras do board
- filtrar candidatos por letras disponiveis no rack
- chamar preview/validador antes de submeter
- ranquear por score estimado, uso de pecas e perfil do bot
- limitar busca por nivel para nao degradar UX
- manter fallback de passe quando nao houver jogada segura

Perfis iniciais:

- `easy`: busca curta, palavras menores, primeira jogada segura razoavel
- `medium`: busca mais ampla, prefere score melhor e conexoes simples
- `hard`: busca mais profunda, considera cruzamentos e melhor score local

Arquivos provaveis:

- nova migration de funcoes `find_patxanga_bot_candidate_moves`
- evolucao de `submit_patxanga_easy_bot_turn(...)`
- `sql/tests/test_easy_bot_turn_policy.sql`
- novas simulacoes em `sql/simulations`

Criterios de aceite:

- bot joga mais de uma palavra real por partida quando o rack permite
- bot nao tenta palavra fora do dicionario como jogada automatica normal
- bot nao trava em tabuleiro ocupado
- bot respeita idioma da partida
- bot passa explicitamente apenas quando nao ha candidato seguro dentro do
  limite de busca

Validacao:

```bash
zsh scripts/run-sql-test-suite.sh engine_regression
zsh scripts/run-bot-simulation.sh all
```

## 6. Tranche C - Bot votante: vereditos para aceitar/rejeitar palavras

Objetivo:

Quando uma partida entrar em `pending_vote`, jogadores bot devem votar de forma
automatica e explicavel.

Politica de veredito inicial:

- aceitar se a palavra normalizada existir no dicionario ativo do idioma
- rejeitar se a palavra violar formato basico aceito pelo jogo
- rejeitar se a palavra tiver caracteres fora da politica lexical atual
- para palavra desconhecida mas formalmente plausivel:
  - `easy`: rejeita por padrao, com baixa tolerancia
  - `medium`: aceita se heuristicas simples passarem
  - `hard`: aceita apenas se politica lexical avancada ou fonte secundaria
    justificar

Entregas:

- criar RPC de voto automatico de bot para pending vote
- registrar no retorno o motivo do veredito
- executar voto automatico quando o votante atual for bot ou quando houver bot
  elegivel para votar
- impedir bot autor de votar na propria palavra
- cobrir quorum em partidas com 1 humano + 1 bot e 1 humano + varios bots
- expor na UI mensagem curta: `Bot rejeitou: palavra fora do dicionario ativo`

Arquivos provaveis:

- migration `submit_patxanga_bot_vote`
- teste SQL `test_bot_vote_policy.sql`
- simulacao `bot_simulation_pending_vote_auto_verdict.sql`
- ajustes no frontend humano x bot

Criterios de aceite:

- palavra pendente nao fica parada quando o unico votante elegivel e bot
- bot vota uma unica vez por move
- voto de bot respeita quorum existente
- aceite/rejeicao atualiza match, board e turno via RPC oficial
- motivo do voto aparece em retorno tecnico e resumo de produto

Validacao:

```bash
zsh scripts/run-sql-test-suite.sh engine_regression
zsh scripts/run-bot-simulation.sh all
cd frontend
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium --grep "bot|vote|vot"
```

## 7. Tranche D - Ritmo de produto humano x bot

Objetivo:

Transformar o modo humano x bot em uma experiencia jogavel e compreensivel.

Entregas:

- tela dedicada como entrada principal para treino contra bot
- criar partida contra bot em um clique
- esconder IDs, debug, importacao e ferramentas tecnicas
- mostrar placar humano/bot de forma persistente
- mostrar "bot pensando", "bot jogou", "bot passou" e "bot votou"
- autoexecutar turnos e votos de bot sem clique humano
- manter o humano sempre informado da proxima acao
- adicionar botao de nova partida contra bot
- simplificar troca/passagem de turno para treino
- melhorar feedback de fim de partida

Arquivos provaveis:

- `frontend/components/HumanVsBotGameScreen.tsx`
- `frontend/pages/index.tsx`
- `frontend/tests/browser-validation.spec.ts`
- possivel rota futura `/bot` ou `/treino`

Criterios de aceite:

- jogador consegue criar e jogar contra bot sem ver UUID
- bot joga automaticamente em todos os turnos dele
- bot vota automaticamente quando for votante elegivel
- a partida nao fica presa em `voting`
- Playwright cobre uma partida de treino com varios turnos
- a tela tecnica continua acessivel apenas como modo avancado

Validacao:

```bash
cd frontend
npm run lint
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium --grep "human versus bot|bot"
```

Atualizacao de execucao:

- o frontend detecta `voting` com bot elegivel e chama
  `submit_patxanga_easy_bot_vote(...)`
- a tela humano x bot mostra `Bot aceitou...` ou `Bot rejeitou...` com motivo
- Playwright cobre palavra humana `TS` entrando em `pending_vote` e sendo
  rejeitada automaticamente pelo bot

## 8. Tranche E - Simulacoes longas e metricas de qualidade do bot

Objetivo:

Medir se o bot joga de forma minimamente aceitavel antes de investir em
interface final.

Entregas:

- simulacao bot-vs-bot de 20 a 50 turnos
- simulacao humano fake vs bot com passes/trocas/votos
- metricas por partida:
  - numero de jogadas reais
  - numero de passes
  - numero de trocas
  - palavras aceitas
  - palavras rejeitadas
  - score medio por jogada
  - tempo de decisao do bot
- limite de seguranca para abortar loop infinito
- relatorio textual por rodada

Criterios de aceite:

- bot nao passa em excesso quando ha palavras jogaveis
- partida longa termina ou atinge limite controlado
- nenhum turno fica preso
- resultados sao reproduziveis o suficiente para regressao

Validacao:

```bash
zsh scripts/run-bot-simulation.sh long
zsh scripts/run-bot-simulation.sh all
```

## 9. Tranche F - Dificuldade, perfis e personalidade de bot

Objetivo:

Fazer `easy`, `medium`, `hard` e perfis `aggressive`, `balanced`,
`defensive` produzirem comportamentos diferentes e testaveis.

Entregas:

- tabela/contrato de configuracao de bot
- parametros por nivel:
  - limite de candidatos avaliados
  - tamanho maximo de palavra
  - tolerancia a troca
  - preferencia por score
  - preferencia por esvaziar rack
- parametros por perfil:
  - `aggressive`: maior score imediato
  - `balanced`: score razoavel + preservar rack
  - `defensive`: evitar abrir oportunidades e trocar mais cedo
- fixtures deterministicas para comparar decisoes entre perfis

Criterios de aceite:

- mesmo rack/tabuleiro pode gerar decisoes diferentes por perfil
- testes provam pelo menos uma diferenca entre `easy`, `medium` e `hard`
- UI mostra dificuldade e perfil em linguagem de jogador

Validacao:

```bash
zsh scripts/run-sql-test-suite.sh sql/tests/test_easy_bot_turn_policy.sql
zsh scripts/run-bot-simulation.sh all
```

## 10. Tranche G - Publicacao local/alpha do modo treino

Objetivo:

Deixar o modo humano x bot pronto para alpha fechada.

Entregas:

- rota ou entrada clara `Treinar contra bot`
- seed ou importacao controlada de dicionario amplo no ambiente alpha
- health check incluindo contagem de dicionario por idioma
- preflight de bot/dicionario
- runbook de incidentes:
  - bot preso
  - partida presa em voting
  - dicionario vazio
  - importacao parcial
- criterio de rollback para fonte lexical

Criterios de aceite:

- alpha consegue criar partida humano x bot sem ferramenta tecnica
- dicionario amplo esta disponivel no ambiente alvo ou ha fallback declarado
- logs permitem diagnosticar decisao do bot
- preflight falha se dicionario estiver abaixo do minimo configurado

Validacao:

```bash
zsh scripts/preflight-alpha-deploy.sh
zsh scripts/run-bot-simulation.sh all
cd frontend
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

## 11. Ordem recomendada de execucao

Ordem pragmatica:

1. Tranche A - dicionario amplo controlado
2. Tranche B - candidatos reais de jogada do bot
3. Tranche C - bot votante com veredito explicavel
4. Tranche D - ritmo humano x bot
5. Tranche E - simulacoes longas e metricas
6. Tranche F - dificuldade e perfis
7. Tranche G - preparo alpha do modo treino

Razao:

- sem dicionario amplo, o bot nao tem repertorio real
- sem motor de candidatos, a UI humano x bot continuara pobre
- sem voto automatico, partidas humano x bot podem travar em `pending_vote`
- sem metricas, melhora de bot vira impressao subjetiva

## 12. Primeira tranche recomendada agora

Comecar pela Tranche A com escopo reduzido mas estrutural:

1. transformar scripts atuais de amostra em scripts com modo `--limit` grande e
   relatorio robusto
2. validar localmente lote de 1.000 a 10.000 palavras por idioma, usando
   arquivos ja baixados quando possivel
3. criar teste SQL de contagem minima por idioma e fonte
4. medir tempo de `validate_word(...)` e consulta de candidatos
5. documentar decisao de licenca pendente antes de chamar de "dicionario de
   produto"

Se a maquina estiver sem internet, usar apenas `--skip-download` e os arquivos
ja presentes em `/private/tmp/patxanga-dictionary-sources`.

## 13. Riscos

- Licenca: `pt-PT` tem anotacao historica ambigua `GPL/BSD` alem de
  `GPLv2/LGPLv2.1/MPLv1.1`; exige decisao humana/legal.
- Performance: busca ingênua no dicionario amplo pode ficar lenta.
- UX: bot rapido demais parece invisivel; bot lento demais parece travado.
- Qualidade: bot que so passa piora o produto; bot que aceita qualquer palavra
  quebra confianca.
- Testes: simulacoes longas podem ficar flakey se dependerem de aleatoriedade
  sem seed controlada.

## 14. Definicao de pronto para modo humano x bot aceitavel

O modo humano x bot deixa de ser "muito ruim" quando:

- cria partida sem UUID
- bot joga automaticamente todos os turnos dele
- bot vota automaticamente quando deve votar
- bot faz jogadas reais em tabuleiro ocupado
- bot passa menos por falta de repertorio
- humano entende sempre o que aconteceu e o que fazer
- partida longa nao trava em `active` nem `voting`
- ha dicionario amplo suficiente para `pt-BR` e `pt-PT`
- ha testes e simulacoes longas cobrindo regressao
