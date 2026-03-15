# PATXANGA — Current Development Continuity Spec
Version: 1.0
Status: ACTIVE WORKING BASELINE
Verified at: 2026-03-15

## 1. Objetivo

Congelar de forma objetiva onde o desenvolvimento esta,
o que ja foi validado e qual deve ser a sequencia de trabalho
para garantir retomada segura com produtividade.

Este documento nao substitui contratos, migrations, suite SQL
nem o pacote de bastao. Ele resume o estado atual verificado
e orienta a continuidade da frente principal.

## 2. Estado local verificado

- branch atual: `develop`
- HEAD verificado: `13fa8228eda65810de93a57aaba2855942b02977`
- upstream: `origin/develop`
- distancia do upstream: `ahead 5`
- commits locais relevantes acima de `origin/develop`:
  - `13fa822` Tighten local ignore rules
  - `9fa27ce` Implement local rack slot associations
  - `0722828` Add SQL regression test suites
  - `372d0e7` Add operational lobby invite baseline
  - `d584091` Add browser validation scenarios and Playwright coverage
- working tree verificado nesta leitura:
  - `?? docs/15-pacote-final-colagem-v1.2-ultra-blindado.md`
  - `?? generate-continuity-package.sh`

Regra de interpretacao:
- o estado local acima prevalece sobre memoria, conversa e pacote antigo
- os dois arquivos untracked acima nao devem ser assumidos como parte da frente ativa sem triagem explicita

## 3. Frente principal efetivamente entregue ate aqui

### 3.1 Baseline operacional de lobby, convites, retomada e desistencia

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

### 3.2 Validacao automatizada de browser

A pagina de teste ja consegue:

- gerar cenarios reais de browser
- expor `match_id`, `host_user_id` e `guest_user_id`
- alternar rapidamente entre host e guest

Artefatos principais:
- `frontend/pages/index.tsx`
- `frontend/playwright.config.ts`
- `frontend/tests/browser-validation.spec.ts`
- `docs/frontend-browser-validation-procedure-v1.0.md`

### 3.3 Regressao SQL reutilizavel

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

### 3.4 Primeira tela jogavel e composicao local do rack

A tela jogavel atual ja possui:

- rack com selecao multipla e reordenacao local
- destaque de turno e cronometro visual
- preview operacional de jogada
- suporte a `declared_letter` nas pecas especiais
- associacao local permanente de slots do rack ao tabuleiro

Artefatos principais:
- `frontend/components/RackSection.tsx`
- `frontend/components/BoardSection.tsx`
- `frontend/components/GamePlayScreen.tsx`
- `frontend/pages/index.tsx`
- `docs/frontend-rack-composition-ux-v1.0.md`
- `docs/frontend-rack-composition-implementation-plan-v1.0.md`

## 4. Ultima validacao confirmada

Validacoes confirmadas antes deste refresh documental:

- `supabase db reset` passou
- `zsh scripts/run-sql-test-suite.sh lobby_ops` passou
- `zsh scripts/run-sql-test-suite.sh engine_regression` passou
- `cd frontend` + `npm run build` passou
- `cd frontend` + `npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium` passou

Leitura correta deste ponto:
- a baseline funcional estava verde no `HEAD 13fa822`
- esta rodada atual e documental/processual; ela nao alterou runtime antes do refresh do pacote

## 5. O que ainda nao esta fechado

### 5.1 Associacao de slots ainda e local

A associacao permanente entre slot do rack e casa do tabuleiro
ja existe na UX local, mas ainda nao foi promovida a contrato oficial
da composicao/submissao de jogada.

Consequencia:
- ainda ha uma lacuna entre a UX local de composicao
  e a superficie oficial que efetivamente chega ao backend

### 5.2 Validacao humana visual continua util

O Playwright cobre fluxos objetivos e repetiveis.
Mesmo assim, ainda vale uma rodada humana em `http://localhost:3001`
quando o foco for:

- legibilidade visual
- ergonomia da tela jogavel
- coerencia visual da composicao do rack
- transicoes que dependem de julgamento humano

### 5.3 Continuidade operacional ainda precisava de refresh

Antes desta rodada, `docs/18-room-baton-package-current.md`
estava defasado e ainda refletia `HEAD 0722828`.

Consequencia:
- a retomada em outra sala corria risco de perder os marcos
  `9fa27ce` e `13fa822`

### 5.4 Ha itens locais sem triagem

Os arquivos abaixo continuam fora do baseline confirmado:

- `docs/15-pacote-final-colagem-v1.2-ultra-blindado.md`
- `generate-continuity-package.sh`

Sem triagem explicita, esses itens devem ser tratados como ambiguos.

### 5.5 Versionamento remoto ainda nao foi concluido

Os 5 commits locais acima ainda nao foram empurrados para `origin/develop`.

Consequencia:
- a continuidade fica dependente da maquina local
- outra sala pode ler um remoto atrasado e tomar decisoes erradas

## 6. Proximos passos recomendados

### 6.1 Prioridade imediata: fechar continuidade operacional

Sequencia recomendada:

1. triar os dois arquivos untracked
2. manter apenas o que for realmente baseline ou trabalho deliberado
3. versionar o refresh documental de continuidade
4. empurrar os commits pendentes para `origin/develop`
5. registrar `logstep` objetivo para o novo marco

Resultado esperado:
- retomada segura em outra sala sem depender da memoria desta conversa

### 6.2 Proxima frente funcional: elevar slot associations a contrato oficial

Decisao que precisa ser tomada:
- a associacao `slot local -> casa do tabuleiro`
  sera apenas affordance visual
  ou passara a ser a base oficial da composicao da jogada

Se a resposta for sim, a sequencia recomendada e:

1. congelar contrato de composicao local
2. alinhar preview e submit com essa superficie
3. definir comportamento de limpar, mover, substituir e cancelar
4. validar a integridade com testes de frontend e SQL onde aplicavel
5. atualizar docs de UX e implementacao

### 6.3 Consolidar a primeira tela jogavel como baseline de produto

Depois da etapa acima, a frente mais produtiva e:

1. reduzir divergencias entre tela de teste e tela de produto
2. consolidar a home/tela jogavel como superficie principal
3. eliminar controles temporarios que nao agreguem ao fluxo real
4. manter apenas ferramentas operacionais que acelerem validacao e debug

### 6.4 Expandir cobertura automatizada com foco no fluxo jogavel

Coberturas mais valiosas a seguir:

1. preview + submit a partir da nova composicao local
2. cancelamento/limpeza parcial de composicao
3. estados de pending vote e resolucao
4. regressao do rack apos acoes de partida real

## 7. Ordem segura de retomada a partir daqui

Ao retomar esta frente em outra sala:

1. ler `docs/18-room-baton-package-current.md`
2. escolher modo de atuacao
3. validar `git status --short --branch`
4. validar `git log --oneline --decorate -5`
5. confirmar se o remoto ja recebeu os 5 commits locais
6. usar este documento para decidir a proxima frente

## 8. Comandos de validacao recomendados

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

## 9. Frase curta de continuidade recomendada

Retomar pela especificacao atual de desenvolvimento,
confirmar se os 5 commits locais ja foram pushados,
triar os 2 untracked ambiguos
e seguir para a decisao arquitetural sobre transformar
as slot associations em contrato oficial de composicao de jogada.
