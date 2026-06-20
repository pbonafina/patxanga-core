# PATXANGA - ROADMAP CONSOLIDADO DE IMPLEMENTACAO

Versao: 0.1
Status: Plano consolidado ativo
Base: planos, contratos e continuidade existentes no repositorio

---

## 1. Objetivo

Consolidar em um unico documento a sequencia de implementacao do Patxanga,
separando o que ja esta entregue, o que deve ser priorizado agora e o que
fica para fases posteriores.

Este documento nao substitui os contratos tecnicos. Ele organiza a execucao.

Contratos normativos continuam sendo:

- `docs/12-submit-move-contract.md`
- `docs/frontend-contract-rpcs-v1.0.md`
- `docs/frontend-contract-match-states-v1.0.md`
- `docs/frontend-contract-screen-actions-v1.0.md`
- `docs/frontend-rack-composition-ux-v1.0.md`

---

## 2. Estado atual consolidado

Leitura atual do projeto:

| Frente | Estado |
|--------|--------|
| Backend server-authoritative | Maduro e validado para partida sincrona, submit, voting, pass, exchange, forfeit e endgame |
| Lobby, convite e retomada | Baseline operacional implementada e validada |
| Primeira tela jogavel | Existe, mas ainda precisa evoluir de sandbox operacional para produto |
| Rack e composicao por slots | Implementado como superficie oficial de preparo no frontend |
| Votacao | Funcional, mas ainda precisa UX de produto |
| Dicionario | Contrato por idioma/fonte/ativo consolidado; seed PT-BR pequeno para QA |
| Automacao | Build, Playwright e suite SQL existem e passam na baseline recente |
| Bots de teste e simulacao | Prioridade alta; frente iniciada com contrato, runner e smoke deterministico |
| Bot | Apenas modelado no banco; ainda nao existe modo jogavel humano contra bot |
| Documentacao de jogador | Manual inicial criado em `docs/como-jogar-patxanga.md` |

Diretriz principal:

- nao reabrir contratos funcionais ja validados sem motivo forte
- evoluir a experiencia de produto sobre a base funcional existente
- manter a sandbox como apoio operacional, nao como destino final da UI

---

## 3. Principios obrigatorios de implementacao

1. O backend continua sendo a fonte de verdade.
2. O frontend nunca calcula score oficial.
3. O frontend nunca avanca turno sem retorno oficial do backend.
4. `player_id` e a identidade de gameplay nas RPCs.
5. `user_id` serve para usuario, lobby, convite e contexto visual.
6. `pending_vote` e fluxo real de produto, nao excecao temporaria.
7. Slots locais do rack nao existem no backend.
8. `submit_patxanga_move()` continua recebendo apenas pecas reais colocadas.
9. Documentacao deve acompanhar marcos relevantes, nao microajustes.
10. Todo marco funcional deve ter validacao automatizada ou justificativa clara.
11. Bot de teste/simulacao deve ser tratado primeiro como ferramenta de QA, nao como modo final de produto.
12. Dicionario grande so deve entrar depois de contrato, fonte e licenca claros.

---

## 4. Fase 0 - Higiene de baseline

Objetivo:

Deixar o repositorio facil de retomar antes de abrir novas frentes grandes.

Entregas:

| Item | Acao | Criterio de saida |
|------|------|-------------------|
| Roadmap consolidado | Manter este documento como plano principal | `docs/00-index.md` aponta para este roadmap |
| Docs vazios | Decidir se serao preenchidos, removidos ou mantidos como placeholders | Cada arquivo vazio tem destino explicito |
| Continuidade | Atualizar pacote `current` apos marcos relevantes | Proxima retomada encontra estado real |
| Branches e commits | Evitar misturar upgrade, docs e feature sem clareza | `git status` compreensivel |

Validacao minima:

```bash
git status --short --branch
```

---

## 5. Fase 1 - Tela jogavel orientada a produto

Objetivo:

Transformar a tela atual em uma experiencia de jogo compreensivel para jogador,
mantendo a sandbox tecnica como modo secundario de apoio.

Entregas:

| Item | Acao | Criterio de saida |
|------|------|-------------------|
| Hierarquia visual | Priorizar tabuleiro, rack, acao principal e placar | Jogador entende a partida sem ler blocos tecnicos |
| Debug secundario | Esconder informacoes tecnicas por padrao | Debug continua acessivel, mas nao domina a tela |
| Estados claros | Mostrar turno atual, jogador local, acao disponivel e bloqueios | Fora do turno fica inequivoco |
| Rack jogavel | Refinar pecas, selecao, drag local e slots | Jogador consegue montar palavra com baixo atrito |
| Submit por slots | Consolidar uso real da composicao por slots | Preview e submit usam a mesma leitura |

Decisoes pendentes:

- manter fluxo direto peca -> board em paralelo com slots
- ou convergir para um unico fluxo oficial de montagem

Validacao minima:

```bash
cd frontend
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

---

## 6. Fase 2 - UX de votacao como feature de produto

Objetivo:

Transformar `pending_vote` em uma experiencia clara, nao em um painel tecnico.

Entregas:

| Item | Acao | Criterio de saida |
|------|------|-------------------|
| Contexto da jogada | Mostrar palavra principal, cruzamentos, autor e pecas propostas | Votante entende o que esta avaliando |
| Autor x votante | Deixar claro que o autor nao vota | UI nao oferece acao impossivel |
| Overlay no board | Diferenciar jogada pendente de board oficial | Jogador percebe que ainda nao foi aplicada |
| Resultado pos-voto | Mostrar aceita/rejeitada e proxima acao | Fluxo nao parece interrompido |
| Regressao | Testar ciclos repetidos de votacao | Mais de um `pending_vote` seguido continua funcionando |

Validacao minima:

```bash
cd frontend
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

Cobertura desejada adicional:

- palavra invalida entra em `voting`
- autor nao consegue votar
- outro jogador rejeita
- outro jogador aceita
- board e rack refletem corretamente cada decisao

---

## 7. Fase 3 - Estados laterais da partida

Objetivo:

Tirar o produto da dependencia exclusiva do estado `active`.

Entregas:

| Estado | Acao | Criterio de saida |
|--------|------|-------------------|
| `waiting` | Melhorar lobby, participantes e permissao de iniciar | Jogador entende como comecar |
| Convites | Refinar aceite, recusa e lista de pendentes | Fluxo direto fica usavel sem depuracao |
| Retomada | Melhorar lista de partidas retomaveis | Jogador volta para a partida certa |
| `finished` | Exibir vencedor, placar final e motivo do fim | Fim de partida fica compreensivel |
| Desistencia | Refinar mensagem e consequencias | Forfeit deixa de parecer erro tecnico |
| Presenca | Revisar ausencia/online quando entrar no produto | Estado de conexao nao confunde o jogador |

Validacao minima:

```bash
zsh scripts/run-sql-test-suite.sh lobby_ops
zsh scripts/run-sql-test-suite.sh engine_regression
```

---

## 8. Fase 4 - Cobertura automatizada do fluxo jogavel

Objetivo:

Cobrir por teste os fluxos que mais protegem o produto contra regressao.

Entregas:

| Cobertura | Prioridade | Criterio de saida |
|-----------|------------|-------------------|
| Submit real por slots | Alta | Jogada montada por slot e aceita pelo backend |
| Limpar composicao | Alta | Slot, tile e board voltam ao estado esperado |
| Reordenar rack e jogar | Media | Ordem local nao quebra submit |
| Pending vote por slot | Alta | Palavra invalida via slots entra em voting |
| Exchange apos recomposicao | Media | Rack final fica consistente |
| Endgame pelo frontend | Media | Usuario ve partida acabar corretamente |

Comandos de referencia:

```bash
cd frontend
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
zsh ../scripts/run-sql-test-suite.sh all
```

---

## 9. Fase 5 - Sistema de bots para testes e simulacoes

Objetivo:

Criar um sistema de bots utilitarios para gerar cenarios, simular partidas,
testar a engine e acelerar validacoes antes de construir o modo humano contra bot
como produto final.

Prioridade:

- alta
- deve entrar antes do modo humano contra bot de produto
- deve ser orientado a testes, reproducibilidade e cobertura de casos

Estado atual:

- contrato inicial criado em `docs/07-bot-engine.md`
- runner local criado em `scripts/run-bot-simulation.sh`
- smoke deterministico criado em `sql/simulations/bot_simulation_smoke.sql`
- smoke valida `move_id`, `place_word` aceito, passe aceito e replay
- pending_vote deterministico criado em
  `sql/simulations/bot_simulation_pending_vote.sql`
- pending_vote valida criacao da jogada pendente, rejeicao por voto, aceitacao
  por voto, board intacto antes da resolucao e board aplicado apos aceitacao
- exchange_tiles deterministico criado em
  `sql/simulations/bot_simulation_exchange_tiles.sql`
- exchange_tiles valida `move_id`, rack final com 7 pecas, bag preservado,
  move aceito, replay `tiles_exchanged` e avanco de turno
- fim por rack vazio criado em
  `sql/simulations/bot_simulation_empty_rack_end.sql`
- fim por rack vazio valida `end_state.finished`, vencedor, penalidades,
  score final, rack vazio, `match_finished` no replay e status `finished`
- fim por todos passarem criado em
  `sql/simulations/bot_simulation_all_passed_end.sql`
- fim por todos passarem valida primeiro passe sem fim, segundo passe com
  `ended_by_all_passed`, penalidades, vencedor, score final, moves de passe e
  replay `match_finished`
- erro esperado criado em
  `sql/simulations/bot_simulation_invalid_move_expected_error.sql`
- erro esperado valida peca inexistente no rack e jogada fora do turno,
  confirmando excecao esperada e ausencia de mutacao em match, rack, moves e
  replay
- multi-turno deterministico criado em
  `sql/simulations/bot_simulation_long_multi_turn.sql`
- multi-turno valida `place_word` aceito, `exchange_tiles`, dois passes,
  `pending_vote` em ponte usando peca ja existente no board, rejeicao por voto,
  preservacao do board para jogada rejeitada, contadores de moves/replay e
  partida ainda ativa com bag nao vazia
- `submit_patxanga_move(...)` agora persiste jogadas `place_word` aceitas em
  `patxanga_moves`

Leitura correta:

- estes bots podem ser simples e deterministas
- nao precisam ter UX final
- nao precisam jogar bem no inicio
- precisam produzir partidas validas, estados variados e falhas diagnosticaveis

Leitura incorreta:

- tratar esta fase como entrega final de IA adversaria
- tentar fazer bot forte antes de ter simulacao confiavel
- misturar bot de teste com experiencia final de usuario

Entregas:

| Item | Acao | Criterio de saida |
|------|------|-------------------|
| Contrato de bot de teste | Preencher uma primeira versao de `docs/07-bot-engine.md` focada em simulacao | Fica claro o que o bot pode e nao pode fazer |
| Runner de simulacao | Criar script para executar partidas simuladas localmente | Uma partida pode rodar sem interacao manual |
| Politicas simples | Implementar bots deterministas: jogar primeira palavra valida, passar ou trocar | Turnos nao travam e cenarios sao reproduziveis |
| Seeds controladas | Permitir cenarios com rack/board conhecidos | Casos de regressao ficam repetiveis |
| Relatorio de simulacao | Registrar resultado, turnos, erros e estado final | Falhas ficam auditaveis |
| Integracao com testes | Usar bots em SQL ou Playwright quando fizer sentido | Cobertura aumenta sem depender de clique manual |

Cenarios prioritarios de simulacao:

1. partida completa com jogadas validas simples - parcialmente coberta pelo smoke
2. partida que entra em `pending_vote` - coberta
3. rejeicao de `pending_vote` - coberta
4. aceitacao de `pending_vote` - coberta
5. partida com troca de pecas - coberta
6. partida com passe de turno - coberta pelo smoke
7. partida que chega ao fim por rack vazio - coberta
8. partida que chega ao fim por todos passarem - coberta
9. tentativa de jogada invalida com erro esperado - coberta
10. partida multi-turno combinando acoes diferentes - coberta

Arquitetura recomendada:

- comecar por runner local deterministico
- reutilizar RPCs oficiais
- nao criar estado paralelo de jogo
- nao burlar validacoes do backend
- gerar logs claros para debug
- evoluir depois para Edge Function apenas se for necessario para produto

Validacao minima:

```bash
zsh scripts/run-bot-simulation.sh all
zsh scripts/run-sql-test-suite.sh all
```

Validacao desejada:

```bash
cd frontend
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

---

## 9.1 Frente transversal - Dicionario e palavras reais

Objetivo:

Preparar a validacao lexical para palavras reais em portugues sem acoplar a
engine a um dicionario gigante ainda nao auditado.

Estado atual:

- `patxanga_dictionary` consolidado com `language`, `word_original`,
  `word_normalized`, `source`, `is_active`, metadados de importacao e timestamps
- chave primaria composta por `language + word_normalized`
- `validate_word(p_word, p_language default 'pt-BR')` valida idioma,
  normalizacao e apenas palavras ativas
- `submit_patxanga_move` e `preview_patxanga_move` validam palavras usando
  explicitamente o `language` persistido na partida
- seed minimo de teste preservado em `sql/seeds/002_dictionary_test_seed.sql`
- seed pequeno de palavras reais PT-BR criado em
  `sql/seeds/003_dictionary_pt_br_core_seed.sql`
- baseline minima `pt-PT` criada com distribuicao inicial copiada de `pt-BR`
  em `sql/seeds/001_patxanga_distribution.sql`
- seed pequeno de palavras reais PT-PT criado em
  `sql/seeds/004_dictionary_pt_pt_core_seed.sql`
- teste `sql/tests/test_dictionary_contract.sql` cobre normalizacao, acento,
  idioma, palavra inativa, seed real, `preview_move` e caminho completo de
  `submit_move`
- o mesmo teste confirma que uma partida real `pt-PT` inicia e aceita `CASA`
  como palavra reconhecida, sem cair em votacao
- pipeline administrativa de importacao documentada em
  `docs/dictionary-import-pipeline-v1.0.md`
- `import_patxanga_dictionary_entries(...)` cria lote auditavel, deduplica
  entradas normalizadas, registra fonte/licenca/versao e pode desativar
  palavras ausentes em importacao de substituicao completa
- `sql/tests/test_dictionary_import_pipeline.sql` cobre importacao idempotente,
  metadados e desativacao opcional

Proximos passos:

- escolher fonte licenciada para dicionario amplo
- criar conversor operacional de CSV/arquivo fonte para o payload JSON da RPC
- decidir politica para flexoes, nomes proprios, siglas, hifen e variantes
- substituir a baseline minima `pt-PT` por fonte ampla licenciada e auditada
- auditar a distribuicao de pecas `pt-PT`; por enquanto ela e uma baseline
  operacional derivada de `pt-BR`

Validacao minima:

```bash
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_import_pipeline.sql
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_contract.sql
zsh scripts/run-sql-test-suite.sh all
```

---

## 10. Fase 6 - Primeira versao demonstravel

Objetivo:

Preparar uma versao interna demonstravel sem depender de explicacao tecnica.

Entregas:

| Item | Acao | Criterio de saida |
|------|------|-------------------|
| Fluxo feliz completo | Criar, entrar, iniciar, jogar, votar e encerrar | Demo roda de ponta a ponta |
| Visual geral | Remover aspecto de painel tecnico | Tela parece jogo |
| Textos | Trocar mensagens internas por linguagem de jogador | Usuario entende sem conhecer banco/RPC |
| Manual | Manter `como-jogar` alinhado ao produto | Regras do manual batem com a UI |
| Validacao humana | Rodada manual em browser | Problemas de ergonomia registrados |

Validacao minima:

```bash
cd frontend
npm run lint
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
cd ..
zsh scripts/run-sql-test-suite.sh all
```

---

## 11. Fase 7 - Humano contra bot

Objetivo:

Implementar modo humano contra bot depois que o fluxo humano contra humano
estiver claro e apresentavel e depois que existir bot de teste/simulacao
capaz de validar a engine.

Estado atual:

- `patxanga_players` ja possui `is_bot`, `bot_level` e `bot_profile`
- `join_patxanga_match()` aceita parametros de bot
- nao existe engine de bot
- nao existe Edge Function de bot
- nao existe UI para criar partida contra bot
- nao existe teste de bot jogando

Entregas futuras:

| Item | Acao | Criterio de saida |
|------|------|-------------------|
| Contrato de bot de produto | Evoluir `docs/07-bot-engine.md` alem do uso de teste | Regras e limites do bot ficam definidos |
| Criacao de bot | UI cria segundo jogador como bot | Match inicia com humano + bot |
| Motor simples | Bot escolhe jogada legal simples ou passa | Turno do bot nao trava partida |
| Execucao automatica | Edge Function ou rotina equivalente executa o turno | Bot joga sem acao manual |
| Testes | SQL/Playwright cobrem humano contra bot | Fluxo fica regressivo |

Prioridade:

- nao iniciar esta fase antes de consolidar a experiencia humano contra humano
- nao iniciar esta fase antes do sistema de bots de teste/simulacao
- bot depende de UX e engine estaveis para nao mascarar problemas centrais

---

## 12. Fase 8 - Endurecimento de produto

Objetivo:

Reduzir riscos antes de qualquer exposicao mais ampla.

Entregas:

| Frente | Acao |
|--------|------|
| Regras | Revisar tie-break e edge cases de fim de partida |
| Dicionario | Definir processo de expansao/curadoria |
| Observabilidade | Melhorar replay, logs e diagnostico |
| Performance | Avaliar custo das RPCs principais |
| Segurança | Revisar permissoes, RLS e abuso de RPC |
| Deploy | Preencher `docs/09-deployment-plan.md` |

---

## 13. Ordem recomendada de execucao

Sequencia pragmatica:

1. Fechar a branch/estado atual com roadmap, manual e upgrade bem separados.
2. Evoluir a tela jogavel orientada a produto.
3. Fechar UX de votacao.
4. Melhorar estados `waiting`, `finished`, retomada e desistencia.
5. Ampliar Playwright para submit real por slots e ciclos de voting.
6. Criar sistema de bots para testes e simulacoes.
7. Preparar primeira demo interna.
8. So entao iniciar humano contra bot de produto.

---

## 14. Checklist de marco pronto

Um marco deve ser considerado pronto quando:

- comportamento principal foi implementado
- `npm run build` passou
- Playwright relevante passou
- suite SQL relevante passou quando houver impacto backend
- documentacao normativa foi atualizada quando necessario
- `docs/18-room-baton-package-current.md` foi refrescado se houver mudanca operacional relevante
- commit e push foram feitos quando o marco for aceito como baseline

---

## 15. Referencias de origem

Este roadmap consolida principalmente:

- `docs/current-development-continuity-spec-v1.0.md`
- `docs/frontend-rack-composition-implementation-plan-v1.0.md`
- `docs/continuity-package-v1.6.md`
- `docs/16-room-restart-prompt-v1.0.md`
- `docs/game-lobby-and-invite-architecture-v1.0.md`
- `docs/presence-resume-forfeit-architecture-v1.0.md`
- `docs/como-jogar-patxanga.md`

Fim do documento.
