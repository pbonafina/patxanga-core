# PATXANGA - FRENTES DE DESENVOLVIMENTO ABERTAS

Data: 2026-06-22
Status: aberto para execucao
Base: `develop` sincronizado em `origin/develop` no commit `64df773`

## 1. Objetivo

Abrir as quatro frentes necessarias para transformar a baseline jogavel atual
em uma demonstracao mais completa, sem perder rastreabilidade nem quebrar a
cadencia de tranches maiores.

Este documento e operacional. Ele nao substitui contratos tecnicos nem define
regras novas de engine.

## 2. Frente A - Baseline remota e continuidade

Objetivo:

Garantir que todo o trabalho validado esteja recuperavel a partir do remoto
antes de abrir desenvolvimento novo.

Estado inicial:

- `develop` foi sincronizado com `origin/develop`
- commit de referencia: `64df773 feat: add demo endgame dictionary contract`
- working tree esperado: limpo antes de iniciar a proxima tranche

Entregas:

- manter `origin/develop` como baseline recuperavel
- atualizar pacote de bastao em cada marco relevante
- manter docs de continuidade alinhadas com commits reais

Criterio de saida:

- `git status --short --branch` mostra branch limpa
- `git log --oneline --decorate -3` mostra o ultimo commit funcional esperado
- nenhuma frente nova depende apenas de memoria da conversa

## 3. Frente B - Acoes de turno no frontend

Objetivo:

Completar a experiencia de turno humano na UI principal, incluindo acoes que
ja existem no backend mas ainda nao estao maduras como produto no frontend.

Escopo inicial:

- `pass` como acao de produto para o jogador do turno
- `exchange` com selecao de pecas reais do rack
- feedback pos-acao sem exigir leitura de debug
- bloqueios claros quando nao e a vez do jogador
- refresh consistente de rack, placar, turno, bot e estado da partida

Fora do escopo inicial:

- mudar regras de engine
- recalcular score no frontend
- redesenhar autenticação definitiva

Entregas:

- botoes e estados de UI para passar turno e trocar pecas
- adaptadores frontend chamando RPCs oficiais existentes
- mensagens de sucesso/erro orientadas a jogador
- teste e2e cobrindo ao menos `pass` e `exchange` em partida real

Criterio de saida:

- jogador humano consegue abrir uma partida, passar turno, trocar pecas e ver
  o estado oficial atualizado
- fora do turno, a UI explica o bloqueio sem expor erro tecnico bruto
- Playwright cobre fluxo feliz e um bloqueio operacional relevante

Validacao de fechamento:

```bash
cd frontend
npm run build
npm run lint
npm run test:e2e
cd ..
zsh scripts/run-sql-test-suite.sh all
```

## 4. Frente C - Humano contra bot demonstravel em partida longa

Objetivo:

Evoluir o MVP humano contra bot para uma partida demonstravel com multiplos
turnos, sem transformar ainda o bot `easy` em IA sofisticada.

Escopo inicial:

- bot continua usando RPC oficial `submit_patxanga_easy_bot_turn`
- bot joga abertura, encaixe conectado e fallback de passe
- UI deixa claro quando o bot esta pensando, jogou ou passou
- fluxo humano consegue seguir apos uma ou mais jogadas do bot
- fim de partida continua server-authoritative

Entregas:

- cenario e2e com humano vs bot em mais de uma rodada
- ajuste de UX para feedback de bot em turnos consecutivos
- se necessario, pequenas melhorias deterministicas na politica `easy`
- simulacao SQL adicional quando houver novo comportamento de bot

Criterio de saida:

- uma partida humano vs bot pode ser demonstrada por mais de uma alternancia de
  turno sem intervencao manual no banco
- bot nao tenta jogar fora do turno
- bot nao altera estado local sem confirmacao do backend

Validacao de fechamento:

```bash
zsh scripts/run-bot-simulation.sh all
cd frontend
npm run test:e2e
```

## 5. Frente D - Dicionario amplo e controlado

Objetivo:

Preparar a expansao real de dicionario PT-BR/PT-PT mantendo fonte, licenca,
auditoria e reversibilidade claras.

Escopo inicial:

- manter seeds pequenos como baseline de QA
- usar pipeline auditavel de importacao existente
- trabalhar com amostras e limites antes de qualquer carga grande
- separar `pt-BR` e `pt-PT`, sem fallback automatico entre idiomas
- registrar fonte, versao, licenca e hash quando houver nova amostra

Fora do escopo inicial:

- importar dump amplo sem revisao de licenca
- versionar arquivo bruto grande no repositorio
- aceitar nomes proprios, siglas, hifens ou formas complexas fora da politica
  lexical v1

Entregas:

- decisao operacional sobre fonte candidata principal por idioma
- script ou comando documentado para carga limitada reproduzivel
- teste que prova que palavra importada entra no caminho real da engine
- atualizacao da documentacao lexical quando a politica mudar

Criterio de saida:

- amostra ampliada pode ser importada localmente e revertida/reatualizada pela
  pipeline
- `dictionary_summary` mostra volume e fonte coerentes apos a importacao
- testes de dicionario e engine continuam passando

Validacao de fechamento:

```bash
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
zsh scripts/run-sql-test-suite.sh all
```

## 6. Ordem recomendada

1. Frente A: manter baseline remota e continuidade sempre atualizadas.
2. Frente B: completar acoes de turno humano, porque desbloqueia partida real.
3. Frente C: fortalecer humano contra bot usando as acoes de turno ja maduras.
4. Frente D: expandir dicionario em paralelo controlado, sem travar gameplay.

## 6.1 Atualizacao de execucao - tres frentes em sequencia

Tranche executada sobre `develop` apos os commits iniciais de `pass`,
`exchange` e alternancia humano contra bot.

Entregas adicionadas:

- Frente B: painel de acoes informa motivo de bloqueio fora do turno e o modo
  de troca mostra a contagem de pecas selecionadas
- Frente C: cenario browser cobre troca humana contra bot, jogada automatica do
  bot e retorno do controle ao humano
- Frente D: teste SQL de bootstrap cobre `dictionary_summary` em partida
  `pt-PT` com fixture importada pela RPC administrativa

Leitura de produto:

- partida humano contra bot ficou mais demonstravel porque `pass` e `exchange`
  agora alimentam a alternancia real sem intervencao manual no banco
- a expansao `pt-PT` segue controlada por fonte e fixture local, sem importar
  dump amplo nem escolher licenca de produto automaticamente

## 6.2 Atualizacao de execucao - cinco tranches

Tranche planejada para atravessar cinco frentes em uma unica rodada longa:

1. composicao oficial por slots
2. humano contra bot demonstravel
3. dicionario `pt-BR`/`pt-PT` controlado
4. tela jogavel como superficie principal
5. continuidade e checkpoint de validacao

Entregas adicionadas:

- a mesa jogavel passou a exibir um resumo estavel da composicao com quantidade
  de pecas, slots associados ao board e casas preparadas
- a criacao rapida de partidas passou a permitir escolha de dicionario
  `pt-BR` ou `pt-PT`
- Playwright passou a cobrir recomposicao de slot antes do submit oficial
- Playwright passou a cobrir partida rapida `pt-PT` exibindo o dicionario ativo
- a cobertura de humano contra bot continua validando troca humana, jogada
  automatica do bot e retorno do turno ao humano

Leitura de produto:

- o jogador passa a ver quando a composicao esta pronta antes de confirmar a
  jogada
- `pt-PT` fica acessivel na superficie principal sem importar dump amplo nem
  alterar a politica lexical
- a rodada continua sem migration nova, reduzindo risco operacional

## 6.3 Atualizacao de execucao - cinco tranches de robustez jogavel

Tranche executada sobre a baseline anterior, ainda sem migration nova.

Frentes atravessadas:

1. composicao por slots mais defensiva
2. humano contra bot com leitura historica
3. superficie principal menos dependente de debug
4. dicionario por idioma visivel na criacao rapida
5. validacao browser ampliada

Entregas adicionadas:

- a tela jogavel agora bloqueia o envio quando uma peca especial vinculada a
  slot nao tem `declared_letter`
- slots com peca especial passam a exibir status de letra obrigatoria ou letra
  declarada
- Playwright cobre wildcard por slot: primeiro bloqueio sem letra, depois envio
  aceito com letra declarada formando `DA`
- o bot ganhou historico curto de acoes recentes para demonstrar alternancias
  sem depender de debug ou banco
- a criacao rapida passou a expor resumo de produto sobre idioma selecionado,
  bot por RPC oficial e ausencia de fallback automatico de dicionario

Leitura de produto:

- a composicao por slot ficou mais segura porque evita erro previsivel de
  backend antes do submit
- humano contra bot ficou mais demonstravel em fluxo longo porque a tela mostra
  eventos recentes do bot
- `pt-BR` e `pt-PT` continuam separados por idioma; esta tranche nao importa
  dump amplo nem muda politica lexical

Validacao confirmada nesta tranche:

```bash
cd frontend
npm run lint
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
supabase db reset
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
```

Resultado browser: `19 passed`.
Resultado SQL/bot: suites completas verdes apos `supabase db reset`.

## 6.4 Atualizacao de execucao - cinco tranches de produto jogavel

Tranche executada sobre a robustez anterior, sem migration nova.

Frentes atravessadas:

1. leitura de fim de turno e reposicao de rack
2. composicao por slots com limpeza parcial
3. humano contra bot com historico validado
4. dicionario operacional visivel na mesa
5. home com entradas principais de produto

Entregas adicionadas:

- a mesa jogavel passou a mostrar um cartao de ultima acao oficial com turno,
  rack, placar e proximo jogador antes/depois da acao
- acoes de passar turno e trocar pecas agora alimentam esse resumo a partir do
  bootstrap oficial recarregado
- slots associados ao board ganharam botao para limpar apenas a casa, mantendo
  a peca vinculada ao slot
- Playwright cobre a limpeza parcial de slot sem perder a peca vinculada
- Playwright valida historico recente do bot em partida humano contra bot
- a tela passou a mostrar um cartao de lexico operacional com idioma, volume e
  ausencia de fallback automatico
- a home ganhou cards de entrada para jogar agora, treinar contra bot e retomar
  mesa, sem remover as ferramentas de validacao

Leitura de produto:

- o jogador consegue entender melhor o que mudou apos uma acao de turno
- recompor slots ficou menos destrutivo porque a casa pode ser limpa sem perder
  a vinculacao da peca
- a demonstracao humano contra bot e a leitura de dicionario ficaram menos
  dependentes de debug

Validacao confirmada nesta tranche ate este ponto:

```bash
cd frontend
npm run lint
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
supabase db reset
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
```

Resultado browser: `19 passed`.
Resultado SQL/bot/dicionario: suites completas verdes apos `supabase db reset`.

## 6.5 Atualizacao de execucao - cinco tranches de produto e operacao

Tranche executada sobre a UI jogavel, sem migration nova.

Frentes atravessadas:

1. jogada real mais confortavel
2. historico curto da partida
3. humano contra bot com leitura de estado mais longa
4. home com ferramentas tecnicas recolhidas
5. dicionario operacional com comandos e diagnostico

Entregas adicionadas:

- a tela jogavel mostra a palavra montada localmente antes do preview do
  backend
- jogadas que exigem votacao mostram diagnostico explicito de palavra fora do
  lexico ativo
- foi criado timeline recente da partida para jogada, passe, troca, voto e bot
- o bot ganhou cartao de estado de produto, alem do historico tecnico recente
- os paineis de UUID, cenarios browser e alternador foram recolhidos em
  ferramentas avancadas na home
- o dicionario operacional mostra comandos locais de importacao limitada para
  amostras `pt-BR` e `pt-PT`
- Playwright passou a abrir ferramentas avancadas quando usa fluxo manual e
  cobre os novos elementos principais

Validacao confirmada nesta tranche:

```bash
cd frontend
npm run lint
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
supabase db reset
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
```

Resultado browser: `19 passed`.
Resultado SQL/bot/dicionario: suites completas verdes apos `supabase db reset`.

## 6.6 Atualizacao de execucao - seis tranches para alpha online

Tranches executadas em sequencia com commits intermediarios:

1. sessao autenticada no frontend com Supabase Auth
2. entrypoints autenticados `my_*` usando `auth.uid()`
3. lobby por convite e central de mesas visiveis no produto
4. robustez multi-humano para 3-4 jogadores e correcao de `turn_order`
5. pacote de publicacao alpha com preflight e plano de deploy
6. baseline operacional com `/api/health` e runbook alpha/beta

Pontos importantes:

- o fluxo comum agora usa conta autenticada
- ferramentas avancadas continuam disponiveis para testes e debug por UUID
- RPCs legadas ainda existem; os wrappers autenticados sao o caminho de
  producao a ser ampliado
- a validacao final encontrou ausencia de `CASA` no baseline efetivo `pt-PT`;
  a migracao `20260622203000_33_repair_pt_pt_core_seed_casa.sql` repara o seed
  de forma idempotente
- publicacao real segue dependente de credenciais externas de Supabase hosted,
  provedor de frontend e dominio

Validacoes executadas ao longo das tranches:

```bash
cd frontend
npm run lint
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
supabase db reset
zsh scripts/run-sql-test-suite.sh lobby_ops
zsh scripts/run-sql-test-suite.sh engine_regression
zsh scripts/preflight-alpha-deploy.sh
```

Validacao final consolidada:

```bash
supabase db reset
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
zsh scripts/preflight-alpha-deploy.sh
cd frontend
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

Resultado browser atual: `21 passed`.
Resultado SQL/bot/dicionario/preflight: verde apos `supabase db reset`.

## 7. Politica de commits

- cada tranche grande pode atravessar mais de uma frente, desde que tenha
  objetivo claro e teste de fechamento
- evitar commits que misturem carga ampla de dicionario com mudanca de engine
- documentar qualquer migracao nova junto com teste SQL correspondente
- nao fazer push sem commit verde ou decisao explicita de checkpoint
