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

## 7. Politica de commits

- cada tranche grande pode atravessar mais de uma frente, desde que tenha
  objetivo claro e teste de fechamento
- evitar commits que misturem carga ampla de dicionario com mudanca de engine
- documentar qualquer migracao nova junto com teste SQL correspondente
- nao fazer push sem commit verde ou decisao explicita de checkpoint
