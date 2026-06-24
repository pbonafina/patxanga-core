# PATXANGA - PROGRAMACAO DE TESTES

Versao: 1.1
Status: BASELINE OPERACIONAL

---

## 1. Objetivo

Definir quais testes devem ser executados no Patxanga, em que momento e com
qual criterio de aceite.

Esta programacao nao substitui o julgamento tecnico. Ela define o minimo
obrigatorio para evitar regressao silenciosa em:

- engine SQL server-authoritative
- lobby, convite, retomada e desistencia
- frontend jogavel
- composicao de rack por slots
- pending vote
- dicionario por idioma
- bots de teste, simulacao e humano contra bot
- migrations do Supabase

---

## 2. Regra central

Nenhuma frente funcional deve ser considerada pronta sem pelo menos uma
validacao automatizada pertinente.

A cadencia padrao de desenvolvimento a partir de 2026-06-22 passa a ser por
tranches maiores:

- implementar blocos funcionais completos antes de interromper para bateria
  ampla de testes
- durante a tranche, rodar apenas checks pontuais quando uma mudanca tocar uma
  area de alto risco ou quando uma falha precisar ser isolada
- agrupar `lint`, `build`, Playwright, SQL e simulacoes de bot no checkpoint de
  fechamento da tranche
- evitar repetir a suite completa apos cada microajuste quando ainda houver
  desenvolvimento planejado no mesmo bloco

Esta cadencia reduz interrupcoes, mas nao altera o criterio de aceite: uma
tranche funcional so fica pronta depois da validacao automatizada pertinente.

Quando houver migration nova, o teste local da funcao alterada nao basta:
`supabase db reset` deve passar no fechamento da tranche ou antes do merge para
provar que a cadeia completa de migrations recria o banco do zero.

Quando houver mudanca visual/interacional, build verde nao basta:
Playwright deve passar e, se o ajuste depender de julgamento visual, deve haver
rodada manual de browser seguindo `docs/frontend-browser-validation-procedure-v1.0.md`.

---

## 3. Inventario de testes automatizados

### 3.0 Perfis de execucao por tranche

Durante desenvolvimento ativo:

```bash
git status --short --branch
```

Usar testes pontuais somente quando necessario, por exemplo:

- teste SQL especifico da RPC alterada
- Playwright de um fluxo alterado
- `npm run build` apos mudanca de tipos ou contrato de frontend
- simulacao de bot especifica apos alterar politica de bot

No fechamento de tranche frontend:

```bash
cd frontend
npm run lint
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

No fechamento de tranche backend/SQL/bot:

```bash
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
```

No fechamento de tranche com migration:

```bash
supabase db reset
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
```

No fechamento de tranche mista:

```bash
cd frontend
npm run lint
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
cd ..
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
```

### 3.1 Frontend estatico

Comandos:

```bash
cd frontend
npm run lint
npm run build
```

Usar quando:

- qualquer arquivo em `frontend/` mudar
- tipos compartilhados de bootstrap/match mudarem
- dependencia ou configuracao de frontend mudar

Aceite:

- `lint` sem erro
- `build` sem erro TypeScript ou Next
- se `frontend/next-env.d.ts` for alterado por `next dev`/Playwright, restaurar
  antes do commit quando for apenas artefato local

### 3.2 Browser automatizado

Comando:

```bash
cd frontend
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

Cobre hoje:

- convite, lobby, retomada e desistencia
- associacao local de slot ao board sem mutar gameplay
- composicao oficial de jogada por slots
- criacao de partida humano contra bot
- bot `easy` jogando abertura real `SOL`
- bot `easy` jogando encaixe conectado real `LUA`
- submit aceito por slots
- palavra nao reconhecida indo para `pending_vote`

Usar quando:

- `frontend/pages/index.tsx` mudar
- componentes de board/rack/gameplay mudarem
- contratos de bootstrap ou RPC consumidos pelo frontend mudarem
- fluxo humano contra bot mudar
- lobby/convite/retomada/desistencia mudar

Aceite:

- todos os cenarios passam
- se falhar por conflito de servidor local, encerrar o processo conflitante e
  repetir

### 3.3 SQL - operacao de lobby e presenca

Comando:

```bash
zsh scripts/run-sql-test-suite.sh lobby_ops
```

Testes:

- `sql/tests/test_resume_match.sql`
- `sql/tests/test_start_match_from_lobby.sql`
- `sql/tests/test_direct_invite_flow.sql`
- `sql/tests/test_direct_invite_decline.sql`
- `sql/tests/test_forfeit_single_player.sql`
- `sql/tests/test_forfeit_all_players.sql`
- `sql/tests/test_list_pending_invites.sql`
- `sql/tests/test_list_resumable_matches.sql`
- `sql/tests/test_match_bootstrap_bot_metadata.sql`

Usar quando:

- lobby, convite, presenca, retomada, forfeit ou bootstrap mudarem
- migrations alterarem tabelas de match/player/presence/lobby

### 3.4 SQL - engine e dicionario

Comando:

```bash
zsh scripts/run-sql-test-suite.sh engine_regression
```

Testes:

- `sql/tests/test_dictionary_contract.sql`
- `sql/tests/test_dictionary_import_pipeline.sql`
- `sql/tests/test_dictionary_imported_words_engine_path.sql`
- `sql/tests/test_dictionary_policy_voting_path.sql`
- `sql/tests/test_easy_bot_turn_policy.sql`
- `sql/tests/test_easy_bot_vote_verdict.sql`
- `sql/tests/test_bot_policy_config.sql`
- `sql/tests/test_playable_bot_word_quality.sql`
- `sql/tests/test_multi_human_match_flows.sql`
- `sql/tests/test_exchange_tiles.sql`
- `sql/tests/test_pass_turn.sql`
- `sql/tests/test_submit_move_auto.sql`
- `sql/tests/test_match_end_all_passed.sql`
- `sql/tests/test_match_end_empty_rack.sql`
- `sql/tests/test_match_end_final_penalty.sql`
- `sql/tests/test_submit_move_pending_vote.sql`
- `sql/tests/test_submit_move_pending_vote_accept.sql`
- `sql/tests/test_submit_move_pending_vote_reject.sql`

Usar quando:

- `submit_patxanga_move`, pass, exchange, vote, scoring, endgame ou dicionario
  mudarem
- qualquer politica de bot de produto/teste mudar
- regras de idioma ou importacao lexical mudarem

### 3.5 SQL - entrypoints e helpers

Comando:

```bash
zsh scripts/run-sql-test-suite.sh entrypoint_regression
```

Testes:

- `sql/tests/test_get_match_bootstrap.sql`
- `sql/tests/test_get_pending_vote_context.sql`
- `sql/tests/test_preview_move.sql`
- `sql/tests/test_submit_move_bridge_existing_board_tile.sql`
- `sql/tests/test_hydrate_placed_tiles_declared_letter.sql`

Usar quando:

- bootstrap ou pending vote context mudarem
- preview de jogada mudar
- alinhamento/ponte com pecas existentes mudar
- suporte a pecas especiais ou `declared_letter` mudar

### 3.6 SQL completo

Comando:

```bash
zsh scripts/run-sql-test-suite.sh all
```

Uso:

- antes de abrir PR com backend ou SQL
- antes de merge de frente funcional
- depois de `supabase db reset`
- em regressao periodica

`all` deve executar todos os perfis SQL predefinidos:

- `lobby_ops`
- `engine_regression`
- `entrypoint_regression`

### 3.7 Simulacoes de bot

Comandos:

```bash
zsh scripts/run-bot-simulation.sh smoke
zsh scripts/run-bot-simulation.sh long
zsh scripts/run-bot-simulation.sh all
```

Cenarios de `all`:

- smoke bot-vs-bot com jogada valida e passe
- pending vote com rejeicao e aceitacao
- exchange tiles
- fim por rack vazio
- fim por todos passarem
- erros esperados sem mutacao de estado
- partida longa multi-turno
- relatorio deterministico de metricas de bot
- partida completa bot-vs-bot com palavras jogaveis e fim oficial

Usar quando:

- engine de jogada mudar
- dicionario/pending vote mudar
- bot, pass, exchange ou endgame mudar
- antes de merge de frente de bot

### 3.8 Dicionario e importacao offline

Comandos:

```bash
zsh scripts/preflight-bot-dictionary-alpha.sh
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
zsh scripts/import-priberam-pt-pt.sh --limit 100
zsh scripts/import-libreoffice-pt-br-sample.sh --skip-download --limit 25 --execute
zsh scripts/import-libreoffice-pt-pt-sample.sh --skip-download --limit 25 --execute
```

Usar quando:

- `scripts/prepare-dictionary-import.py` mudar
- `scripts/prepare-libreoffice-dictionary-sample.py` mudar
- `scripts/prepare-priberam-stardict.py` mudar
- scripts `import-libreoffice-*` mudarem
- script `scripts/import-priberam-pt-pt.sh` mudar
- contrato de `import_patxanga_dictionary_entries(...)` mudar
- politica lexical mudar

Depois de importar amostras executadas contra o banco local, rodar:

```bash
supabase db reset
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
```

---

## 4. Programacao por gatilho

### 4.1 Durante desenvolvimento local

Rodar o menor teste que cobre o arquivo alterado.

Exemplos:

| Mudanca | Teste minimo |
| --- | --- |
| UI, componentes ou hooks | `cd frontend && npm run lint && npm run build` |
| Fluxo browser objetivo | Playwright especifico de browser |
| Uma RPC SQL | teste SQL especifico da RPC |
| Bot policy | `sql/tests/test_easy_bot_turn_policy.sql` e simulacao relacionada |
| Dicionario/importacao | tooling offline e teste SQL da pipeline |
| Apenas documentacao | `git diff --check` |

### 4.2 Antes de commit

Obrigatorio:

```bash
git diff --check
```

Adicionar conforme area alterada:

- frontend: `npm run lint`, `npm run build`
- browser/UX: Playwright
- SQL/RPC: teste SQL especifico
- bot: teste SQL especifico e simulacao pertinente
- docs de continuidade: regenerar `docs/18-room-baton-package-current.md`

### 4.3 Antes de abrir PR

Para mudanca funcional:

```bash
cd frontend
npm run lint
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
cd ..
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
git diff --check
```

Se nao houver frontend envolvido, Playwright pode ser omitido com justificativa
explicita no PR.

Se nao houver SQL/backend envolvido, SQL completo pode ser omitido com
justificativa explicita no PR.

### 4.4 Gate de migration

Sempre que houver arquivo novo em `supabase/migrations/`:

```bash
supabase db reset
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
```

Se frontend consumir a migration nova:

```bash
cd frontend
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

### 4.5 Gate de merge

Antes de mergear PR funcional:

- PR deve estar `CLEAN`
- comandos relevantes devem estar listados no corpo do PR
- worktree local deve estar limpo ou com alteracoes claramente nao relacionadas
- se `supabase db reset` foi necessario, registrar que passou

### 4.6 Depois do merge

Confirmar:

```bash
git status --short --branch
git log -1 --oneline --decorate
```

Esperado:

- branch local em `develop`
- `develop` alinhada com `origin/develop`
- worktree limpo

---

## 5. Programacao periodica

### Rodada rapida diaria, quando houver desenvolvimento ativo

```bash
cd frontend
npm run lint
npm run build
cd ..
zsh scripts/run-sql-test-suite.sh all
```

### Rodada pesada semanal ou antes de marco importante

```bash
supabase db reset
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
cd frontend
npm run lint
npm run build
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

### Rodada de release candidate

Executar a rodada pesada e acrescentar:

- validacao manual de browser se houver alteracao visual
- teste offline de dicionario se houver qualquer mudanca lexical/importacao
- revisao do pacote de continuidade
- revisao do roadmap e docs afetadas

---

## 6. Testes manuais ainda necessarios

Automacao atual ainda nao substitui estas verificacoes:

- inspecao visual do board/rack em desktop e mobile
- fluxo humano com dois papeis alternando no mesmo navegador
- votacao pendente com leitura de UX, nao apenas estado SQL
- clareza de mensagens de erro e recuperacao apos falha
- responsividade do rack e slots em tela estreita
- avaliacao de ritmo do humano contra bot

Procedimento base:

```bash
cd frontend
npm run dev
```

Depois seguir `docs/frontend-browser-validation-procedure-v1.0.md`.

---

## 7. Lacunas de automacao a criar

Prioridade alta:

- Playwright para bot jogando apos tabuleiro ja ocupado
- Playwright para troca de papeis humano/bot depois de multiplos turnos
- SQL para bot usando ou recusando pecas especiais explicitamente
- SQL para preview com palavras secundarias quando a extracao evoluir

Prioridade media:

- smoke responsivo em viewport mobile
- teste automatizado de console sem erros no browser
- teste de importacao de dicionario com lote maior, depois de decisao de fonte

Prioridade baixa:

- performance basica de bootstrap em partidas com historico maior
- captura automatica de screenshot de baseline visual

---

## 8. Criterio de aceite de uma frente

Uma frente so deve ser fechada quando:

- testes minimos por gatilho passaram
- se houve migration, `supabase db reset` passou
- se houve frontend, lint/build passaram
- se houve fluxo objetivo de browser, Playwright passou
- se houve UX visual, rodada manual foi registrada
- se houve bot/engine, SQL e simulacoes pertinentes passaram
- excecoes foram registradas explicitamente

Fim do documento.
