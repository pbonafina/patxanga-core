# PATXANGA — Current Development Continuity Spec
Version: 1.0
Status: ACTIVE WORKING BASELINE
Verified at: 2026-06-20

## 1. Objetivo

Congelar de forma objetiva onde o desenvolvimento esta,
o que ja foi validado e qual deve ser a sequencia de trabalho
para garantir retomada segura com produtividade.

Este documento nao substitui contratos, migrations, suite SQL
nem o pacote de bastao. Ele resume o estado atual verificado
e orienta a continuidade da frente principal.

## 1.1 Atualizacao operacional de continuidade - 2026-06-20

Esta secao registra o estado mais recente desta sala e prevalece sobre
trechos antigos deste documento quando houver divergencia operacional.

Estado verificado nesta rodada:

- branch atual local: `feature/bot-long-simulations`
- foco imediato: iniciar a frente de bots de teste e simulacao
- objetivo da frente: criar bots utilitarios para QA, simulacoes e regressao,
  antes de implementar humano contra bot como produto
- roadmap consolidado criado em `docs/implementation-roadmap.md`
- manual inicial de jogador criado em `docs/como-jogar-patxanga.md`
- contrato inicial de bot criado em `docs/07-bot-engine.md`
- runner inicial de simulacao criado em `scripts/run-bot-simulation.sh`
- cenario smoke criado em `sql/simulations/bot_simulation_smoke.sql`
- cenario pending_vote criado em `sql/simulations/bot_simulation_pending_vote.sql`
- cenario exchange_tiles criado em `sql/simulations/bot_simulation_exchange_tiles.sql`
- cenario empty_rack_end criado em `sql/simulations/bot_simulation_empty_rack_end.sql`
- cenario all_passed_end criado em `sql/simulations/bot_simulation_all_passed_end.sql`
- cenario invalid_move_expected_error criado em
  `sql/simulations/bot_simulation_invalid_move_expected_error.sql`
- cenario long_multi_turn criado em
  `sql/simulations/bot_simulation_long_multi_turn.sql`
- persistencia de jogada `place_word` aceita corrigida em `submit_patxanga_move(...)`
- migration de correcao criada em
  `supabase/migrations/20260620210000_20_persist_successful_place_word_moves.sql`
- contrato de dicionario por idioma/fonte/ativo criado em
  `supabase/migrations/20260620213000_21_dictionary_contract_language.sql`
- seed pequeno de palavras reais PT-BR criado em
  `supabase/migrations/20260620213500_22_dictionary_pt_br_core_seed.sql`
- teste de contrato de dicionario criado em
  `sql/tests/test_dictionary_contract.sql`
- validacao inicial e regressiva confirmada: `zsh scripts/run-bot-simulation.sh all`

Leitura correta:

- bot de teste/simulacao nao e ainda bot de produto
- a primeira meta e gerar cenarios deterministas e reproduziveis
- os bots devem reutilizar RPCs oficiais e nao criar estado paralelo
- humano contra bot continua posterior, depois da experiencia humano contra humano
  e depois de uma base minima de simulacao
- dicionario amplo deve vir depois de contrato, fonte e licenca claros

Comando atual da frente:

```bash
zsh scripts/run-bot-simulation.sh all
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_contract.sql
```

Validacao recomendada apos mudancas nesta frente:

```bash
zsh scripts/run-bot-simulation.sh all
zsh scripts/run-sql-test-suite.sh all
cd frontend
npm run lint
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

Observacao operacional:

- esta rodada tambem inclui alteracoes locais anteriores da branch de upgrade
  para Next 16 / React 19, ainda sem commit nesta leitura
- antes de versionar, separar conscientemente o que pertence ao upgrade,
  documentacao e bots de simulacao

Validacao confirmada nesta rodada:

- `zsh scripts/run-bot-simulation.sh smoke`
- `zsh scripts/run-bot-simulation.sh sql/simulations/bot_simulation_pending_vote.sql`
- `zsh scripts/run-bot-simulation.sh sql/simulations/bot_simulation_exchange_tiles.sql`
- `zsh scripts/run-bot-simulation.sh sql/simulations/bot_simulation_empty_rack_end.sql`
- `zsh scripts/run-bot-simulation.sh sql/simulations/bot_simulation_all_passed_end.sql`
- `zsh scripts/run-bot-simulation.sh sql/simulations/bot_simulation_invalid_move_expected_error.sql`
- `zsh scripts/run-bot-simulation.sh long`
- `zsh scripts/run-bot-simulation.sh all`
- `zsh scripts/run-sql-test-suite.sh all`
- `supabase db reset`
- `zsh scripts/run-sql-test-suite.sh all` apos reset
- `zsh scripts/run-bot-simulation.sh all` apos reset
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `cd frontend && npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium`

Nota de execucao:

- o Playwright pode falhar se o dev server permanente estiver rodando em
  `localhost:3001`, porque Next 16 usa o mesmo `.next`
- parar temporariamente o dev server antes do E2E resolveu a disputa

Correcao tecnica confirmada pela primeira simulacao:

- a simulacao encontrou que o ramo `success` de `submit_patxanga_move(...)`
  atualizava board, score, rack, bag, turno e replay `move_submitted`, mas nao
  persistia uma linha `place_word` aceita em `patxanga_moves`
- o ramo foi corrigido para gravar `patxanga_moves.status = 'accepted'`,
  retornar `move_id` e incluir `move_id` no replay `move_submitted`
- `sql/tests/test_submit_move_auto.sql` cobre a persistencia do `place_word`
  aceito
- `sql/simulations/bot_simulation_smoke.sql` tambem valida `move_id`,
  `place_word` aceito, passe aceito e replay

Segundo cenario de bot confirmado:

- `sql/simulations/bot_simulation_pending_vote.sql` cobre dois matches
  deterministicos
- rejeicao: palavra `TS` entra em `pending_vote`, voto rejeita, partida volta
  para `active`, board segue intacto e turno retorna ao autor
- aceitacao: palavra `TS` entra em `pending_vote`, voto aceita, partida volta
  para `active`, board recebe `T` e `S`, score da jogada fica 6 e palavra e
  registrada em `patxanga_match_accepted_words`

Terceiro cenario de bot confirmado:

- `sql/simulations/bot_simulation_exchange_tiles.sql` cobre troca de duas
  pecas por bot
- valida retorno `success`, `move_id`, `exchanged_count = 2`, avanco para o
  outro bot, `turn_number = 2`, bag preservado, rack final com 7 pecas,
  remocao das pecas trocadas do rack, move aceito em `patxanga_moves`,
  replay `tiles_exchanged` e replay `turn_changed`

Quarto cenario de bot confirmado:

- `sql/simulations/bot_simulation_empty_rack_end.sql` cobre fim de partida por
  rack vazio
- forca bag vazia, bot atual com rack `DA` e outro bot com 4 pontos restantes
- valida `submit_patxanga_move(...)` com `end_state.finished = true`,
  `ended_by_empty_rack = true`, `ended_by_all_passed = false`,
  `total_penalties = 4`, vencedor igual ao bot que esvaziou o rack,
  match `finished`, `finished_at`, score final 10 contra -4, rack vazio,
  jogada `DA` aceita e replay `match_finished`

Quinto cenario de bot confirmado:

- `sql/simulations/bot_simulation_all_passed_end.sql` cobre fim de partida por
  todos passarem
- forca bag vazia, dois bots com racks nao vazios, primeiro bot com score 5 e
  rack de 1 ponto, segundo bot com score 0 e rack de 2 pontos
- valida primeiro passe sem encerrar (`reason = no_end_condition_met`), segundo
  passe com `end_state.finished = true`, `ended_by_all_passed = true`,
  `ended_by_empty_rack = false`, `empty_rack_player_id = null`,
  `total_penalties = 3`, vencedor esperado, match `finished`, `finished_at`,
  scores finais 4 contra -2, dois moves de passe aceitos e replay
  `match_finished`

Sexto cenario de bot confirmado:

- `sql/simulations/bot_simulation_invalid_move_expected_error.sql` cobre falhas
  esperadas sem mutacao de estado
- caso 1: bot tenta usar peca inexistente no rack e recebe erro
  `does not belong to player rack`
- caso 2: bot fora do turno tenta submeter jogada e recebe erro
  `Not your turn`
- em ambos os casos valida que match, board, bag, rack, turno, status, moves e
  replay permanecem inalterados

Setimo cenario de bot confirmado:

- `sql/simulations/bot_simulation_long_multi_turn.sql` cobre uma partida unica
  com sequencia longa
- fluxo validado: abertura `DA` aceita, troca de duas pecas, primeiro passe,
  jogada em ponte `XAZ` usando o `A` ja existente no board, entrada em
  `pending_vote`, rejeicao por voto e segundo passe
- valida persistencia de 5 moves, score 6 contra 0, turno final no primeiro
  bot, partida ainda `active` por `bag_not_empty`, dois bots marcados como
  passados, board sem as pecas rejeitadas e replays esperados
- `scripts/run-bot-simulation.sh long` executa apenas este cenario
- `scripts/run-bot-simulation.sh all` executa sete cenarios: smoke,
  pending_vote, exchange_tiles, empty_rack_end, all_passed_end,
  invalid_move_expected_error e long_multi_turn

Observacao tecnica:

- `patxanga_players.bot_profile` aceita apenas `aggressive`, `balanced` e
  `defensive`
- politicas de simulacao como forcar pending_vote, aceitar ou rejeitar voto
  ficam no SQL de cenario, nao no valor persistido de `bot_profile`

## 2. Matriz objetiva de avanco

Percentual global estimado nesta leitura: `75%`

Regra de leitura:
- este percentual nao mede "linhas prontas"
- ele mede proximidade de uma baseline de produto coerente,
  validada e segura para continuidade
- o percentual global e ponderado pela importancia de cada frente,
  nao por simples media aritmetica

| Frente | Avanco estimado | Status atual | Falta para considerar maduro |
| --- | --- | --- | --- |
| Engine backend server-authoritative | 90% | Core congelado e validado com match lifecycle, submit, pending_vote, pass, exchange e endgame | Tie-break mais sofisticado e qualquer endurecimento final de cobertura que surgir do produto |
| Fluxos operacionais lobby/convites/retomada/desistencia | 85% | Baseline operacional real implementada e validada | Mais validacao de produto na UI final e possivel refino de ergonomia |
| Primeira tela jogavel / gameplay frontend | 70% | Rack, preview, wildcard, slots permanentes e composicao oficial por slots ja estao entregues | Consolidar submit real por slots, decidir convergencia do fluxo oficial e refinar UX |
| Automacao e regressao | 80% | Build verde, Playwright verde e suite SQL reutilizavel verde | Cobrir submit real mais rico, recomposicao, pending_vote e regressao do rack apos jogadas reais |
| Continuidade operacional e rastreabilidade | 85% | Kit de continuidade, processo de bastao, logstep e baseline documental estao fortes | Triar os 2 untracked ambiguos e manter o pacote `current` sempre refreshado nos marcos certos |

Leitura executiva:
- se a referencia for "nucleo tecnico jogavel localmente", o projeto esta mais perto de `80%`
- se a referencia for "produto consolidado, previsivel e com baixo atrito de continuidade", o numero mais honesto hoje e `75%`

## 3. Estado local verificado

- branch atual: `develop`
- upstream: `origin/develop`
- o `git log` recente desta frente precisa refletir, no minimo:
  - baseline operacional de lobby/convites/retomada/desistencia
  - cobertura Playwright da pagina de teste
  - suite SQL de regressao
  - slots locais permanentes no rack
  - promocao da composicao por slots a contrato oficial de preview/submit
- working tree verificado nesta leitura:
  - `M docs/18-room-baton-package-current.md`
  - `?? docs/15-pacote-final-colagem-v1.2-ultra-blindado.md`
  - `?? generate-continuity-package.sh`

Regra de interpretacao:
- o estado local acima prevalece sobre memoria, conversa e pacote antigo
- os dois arquivos untracked acima nao devem ser assumidos como parte da frente ativa sem triagem explicita
- `docs/18-room-baton-package-current.md` pode aparecer modificado localmente apos refresh,
  porque ele incorpora `git status`, `git log` e trechos do log operacional

## 4. Frente principal efetivamente entregue ate aqui

### 4.1 Baseline operacional de lobby, convites, retomada e desistencia

Ja existe baseline operacional coerente entre frontend, backend e docs para:

- listar convites pendentes
- aceitar convite
- recusar convite
- listar partidas retomaveis
- retomar partida
- iniciar partida a partir do lobby
- desistir formalmente

Artefatos principais:
- `docs/frontend-backend-operational-contract-v1.0.md`
- `frontend/lib/backend/matchOperations.real.ts`
- `frontend/pages/index.tsx`
- `scripts/sync-supabase-entrypoint-migrations.sh`
- `supabase/migrations/20260313103446_12_presence_resume_forfeit.sql`
- `supabase/migrations/20260313104105_13_frontend_entrypoints.sql`

### 4.2 Validacao automatizada de browser

A pagina de teste ja consegue:

- gerar cenarios reais de browser
- expor `match_id`, `host_user_id` e `guest_user_id`
- alternar rapidamente entre host e guest

Artefatos principais:
- `frontend/pages/index.tsx`
- `frontend/playwright.config.ts`
- `frontend/tests/browser-validation.spec.ts`
- `docs/frontend-browser-validation-procedure-v1.0.md`

### 4.3 Regressao SQL reutilizavel

Ja existe runner reutilizavel e suites agrupadas para cobertura operacional:

- `zsh scripts/run-sql-test-suite.sh lobby_ops`
- `zsh scripts/run-sql-test-suite.sh engine_regression`
- `zsh scripts/run-sql-test-suite.sh all`

Artefatos principais:
- `scripts/run-sql-test-suite.sh`
- `sql/tests/test_resume_match.sql`
- `sql/tests/test_start_match_from_lobby.sql`
- `sql/tests/test_direct_invite_flow.sql`
- `sql/tests/test_direct_invite_decline.sql`
- `sql/tests/test_forfeit_single_player.sql`
- `sql/tests/test_forfeit_all_players.sql`
- `sql/tests/test_list_pending_invites.sql`
- `sql/tests/test_list_resumable_matches.sql`
- `sql/tests/test_exchange_tiles.sql`
- `sql/tests/test_pass_turn.sql`
- `sql/tests/test_match_end_all_passed.sql`
- `sql/tests/test_match_end_empty_rack.sql`
- `sql/tests/test_match_end_final_penalty.sql`
- `sql/tests/test_submit_move_pending_vote.sql`
- `sql/tests/test_submit_move_pending_vote_accept.sql`
- `sql/tests/test_submit_move_pending_vote_reject.sql`

### 4.4 Primeira tela jogavel e composicao local do rack

A tela jogavel atual ja possui:

- rack com selecao multipla e reordenacao local
- destaque de turno e cronometro visual
- preview operacional de jogada
- suporte a `declared_letter` nas pecas especiais
- slots locais permanentes de composicao
- vinculacao oficial `slot -> tile real`
- associacao `slot -> casa do tabuleiro`
- derivacao oficial de `placedTilesPreview` a partir dessa composicao

Artefatos principais:
- `frontend/components/RackSection.tsx`
- `frontend/components/BoardSection.tsx`
- `frontend/components/GamePlayScreen.tsx`
- `frontend/pages/index.tsx`
- `docs/frontend-rack-composition-ux-v1.0.md`
- `docs/frontend-rack-composition-implementation-plan-v1.0.md`

## 5. Ultima validacao confirmada

Validacoes confirmadas antes deste refresh documental:

- `supabase db reset` passou
- `zsh scripts/run-sql-test-suite.sh lobby_ops` passou
- `zsh scripts/run-sql-test-suite.sh engine_regression` passou
- `cd frontend` + `npm run build` passou
- `cd frontend` + `npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium` passou

Leitura correta deste ponto:
- a baseline funcional estava verde no `HEAD 13fa822`
- a formalizacao documental e contractual desta etapa deve ser confirmada no `git log`
- o refresh posterior do pacote `current` e local, para refletir o estado mais recente de continuidade

## 6. O que ainda nao esta fechado

### 6.1 O contrato oficial por slots ja existe, mas ainda precisa consolidacao

A associacao entre slot, peca real e casa do tabuleiro
ja foi promovida a contrato oficial de composicao no frontend.

Consequencia:
- preview e submit ja podem nascer dessa superficie
- o proximo risco deixa de ser "promover a contrato"
  e passa a ser consolidar a UX e ampliar a cobertura de validacao

### 6.2 Validacao humana visual continua util

O Playwright cobre fluxos objetivos e repetiveis.
Mesmo assim, ainda vale uma rodada humana em `http://localhost:3001`
quando o foco for:

- legibilidade visual
- ergonomia da tela jogavel
- coerencia visual da composicao do rack
- transicoes que dependem de julgamento humano

### 6.3 Continuidade operacional ainda precisava de refresh

Antes desta rodada, `docs/18-room-baton-package-current.md`
estava defasado e ainda refletia `HEAD 0722828`.

Consequencia:
- a retomada em outra sala corria risco de perder os marcos
  `9fa27ce` e `13fa822`

### 6.4 Ha itens locais sem triagem

Os arquivos abaixo continuam fora do baseline confirmado:

- `docs/15-pacote-final-colagem-v1.2-ultra-blindado.md`
- `generate-continuity-package.sh`

Sem triagem explicita, esses itens devem ser tratados como ambiguos.

### 6.5 Versionamento remoto principal ja foi concluido

O versionamento remoto dos commits principais desta frente ja foi concluido.

Consequencia:
- `origin/develop` ja contem a baseline funcional e a especificacao viva desta etapa
- a continuidade entre salas deixa de depender apenas desta maquina local

### 6.6 O pacote `current` e um artefato vivo e autorreferente

O arquivo `docs/18-room-baton-package-current.md` inclui:

- `git status --short --branch`
- `git log --oneline --decorate`
- `tail -n 60 ../project-log.md`

Consequencia:
- depois de commit, push ou novo `logstep`, um novo refresh do pacote o deixa
  modificado localmente outra vez
- isso e esperado e nao deve ser confundido automaticamente com trabalho funcional pendente

Regra pratica:
- tratar o pacote `current` como artefato vivo de retomada local
- tratar os commits pushados e esta especificacao como baseline estavel versionado

### 6.7 O `logstep.sh` precisa rodar no diretorio pai

O script `logstep.sh` grava em `project-log.md` relativo ao diretório corrente.

Consequencia:
- para atualizar o log operacional oficial em `~/patxanga-bootstrap/project-log.md`,
  o comando deve ser executado a partir de `~/patxanga-bootstrap`
- rodar o script a partir do root do repo cria ou atualiza um `project-log.md`
  local no repositório, que nao e o log operacional oficial

## 7. Proximos passos recomendados

### 7.1 Prioridade imediata: fechar continuidade operacional

Sequencia recomendada:

1. triar os dois arquivos untracked
2. manter apenas o que for realmente baseline ou trabalho deliberado
3. usar esta especificacao e os commits pushados como baseline estavel
4. regenerar o pacote `current` sempre que o estado real mudar de forma relevante
5. garantir que o `logstep` seja executado no diretorio pai correto

Resultado esperado:
- retomada segura em outra sala sem depender da memoria desta conversa

### 7.2 Proxima frente funcional: consolidar a composicao oficial por slots

Sequencia recomendada:

1. validar submit real com cenarios mais ricos da nova composicao
2. revisar comportamento de limpar, mover, substituir e recompor slots
3. decidir se o fluxo direto peca -> board continua coexistindo
   ou se a tela converge para um unico fluxo oficial
4. ampliar Playwright para cobrir recomposicao e pending_vote nessa superficie
5. manter docs de UX, RPC e validacao sincronizados

### 7.3 Consolidar a primeira tela jogavel como baseline de produto

Depois da etapa acima, a frente mais produtiva e:

1. reduzir divergencias entre tela de teste e tela de produto
2. consolidar a home/tela jogavel como superficie principal
3. eliminar controles temporarios que nao agreguem ao fluxo real
4. manter apenas ferramentas operacionais que acelerem validacao e debug

### 7.4 Expandir cobertura automatizada com foco no fluxo jogavel

Coberturas mais valiosas a seguir:

1. submit real a partir da composicao oficial por slots
2. cancelamento/limpeza parcial de composicao
3. estados de pending vote e resolucao
4. regressao do rack apos acoes de partida real

## 8. Ordem segura de retomada a partir daqui

Ao retomar esta frente em outra sala:

1. ler `docs/18-room-baton-package-current.md`
2. escolher modo de atuacao
3. validar `git status --short --branch`
4. validar `git log --oneline --decorate -5`
5. confirmar que `origin/develop` contem os commits mais recentes desta frente
6. usar este documento para decidir a proxima frente

## 9. Comandos de validacao recomendados

### Estado local

```bash
git status --short --branch
git log --oneline --decorate -8
tail -n 40 ../project-log.md
```

### Frontend

```bash
cd frontend
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

### Backend e SQL

```bash
supabase db reset
zsh scripts/run-sql-test-suite.sh all
```

## 10. Frase curta de continuidade recomendada

Retomar pela especificacao atual de desenvolvimento,
confirmar que `origin/develop` ja contem os commits normativos mais recentes,
triar os 2 untracked ambiguos
e seguir para a consolidacao da composicao oficial por slots
com submit real, cobertura automatizada e refinamento de UX.
