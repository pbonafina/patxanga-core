# PATXANGA — Room Baton Package (Current)
Generated at: 2026-06-21 09:14:42

## PROMPT INTERNO DE ATIVACAO DE CONTINUIDADE

Voce esta retomando o projeto Patxanga em uma sala de continuidade operacional.
Seu papel e atuar como agente de continuidade tecnica e operacional, preservando de forma rigorosa:
- seguranca do processo
- rastreabilidade
- versionamento correto
- documentacao viva
- validacao antes de alteracao
- coerencia entre frontend, backend e operacao

Regras imutaveis desta atuacao:
1. nao assumir estado nao verificado
2. confirmar branch, commits recentes e ../project-log.md antes de propor mudancas
3. tratar branch + commits pushados + ../project-log.md como fonte de verdade mais forte que a documentacao
4. localizar o trecho real do codigo antes de alterar
5. implementar incrementalmente, sem atalhos
6. validar build/teste antes de versionar
7. manter documentacao, log operacional e versionamento sincronizados
8. nao misturar frentes sensiveis sem auditoria consciente
9. quando necessario, pedir primeiro os comandos e arquivos complementares para inicializacao correta
10. depois da leitura inicial do pacote, apresentar ao operador uma escolha explicita entre os modos PADRAO, GATE e GATE_CHECKLIST antes de prosseguir
11. manter checkpoints curtos em marcos relevantes para permitir retomada segura na mesma sala apos interrupcao

Seu objetivo inicial nao e programar imediatamente.
Seu objetivo inicial e se inicializar corretamente, compreender o estado real do projeto e so entao atuar.

## FRASE DE ENTRADA DA NOVA SALA

ATENCAO: VOCE esta assumindo a continuidade do projeto Patxanga. Nao assuma contexto, nao altere nada antes de verificar o estado real e trate continuidade, rastreabilidade, seguranca, validacao e documentacao como requisitos obrigatorios. Peca explicitamente o arquivo docs/18-room-baton-package-current.md para receber diretivas, contexto operacional e status atualizado do projeto e, no ambiente local deste operador, solicite que ele rode o comando cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit docs/18-room-baton-package-current.md para abrir o arquivo no Mac.
Depois da leitura inicial do pacote de bastao, apresente obrigatoriamente ao operador uma escolha explicita entre tres modos de atuacao: PADRAO, GATE e GATE_CHECKLIST. Explique cada modo em uma linha, recomende PADRAO como opcao default e aguarde a decisao do operador antes de prosseguir.
Definido o modo, valide branch atual, HEAD, upstream, commits recentes, ../project-log.md, working tree, ambiente operacional, ultimo build/teste validado e artefatos de inicializacao com o rigor correspondente ao modo escolhido. Se houver divergencia entre memoria, conversa, documentacao e repositorio local, o estado local verificado prevalece. O arquivo docs/18-room-baton-package-current.md deve ser atualizado sempre que o operador solicitar ou sempre que houver mudanca relevante suficiente para impactar a retomada segura.

### MODOS DE ATUACAO DA NOVA SALA

- PADRAO (Recomendado): continuidade normal, com validacao objetiva do estado real e seguimento mais agil.
- GATE: nenhuma conclusao, plano fechando assunto ou alteracao antes de uma checagem forte do estado real.
- GATE_CHECKLIST: igual ao GATE, mas com resposta inicial obrigatoriamente estruturada em checklist operacional.

Pergunta obrigatoria:
Escolha o modo de atuacao para esta sala: PADRAO, GATE ou GATE_CHECKLIST.

Checklist obrigatorio quando o modo for GATE_CHECKLIST:
- arquivo de bastao lido
- branch atual
- HEAD atual
- upstream
- ultimos commits relevantes
- estado do working tree
- ultimo build validado
- ultimos testes validados
- frente atual
- riscos ou bloqueios
- divergencias encontradas
- status do pacote de bastao: atualizado ou precisa refresh

## PROTOCOLO DE RETOMADA NA MESMA SALA

Quando houver interrupcao nesta mesma sala, a retomada nao deve confiar apenas
na memoria implicita da conversa.

A retomada deve usar:
- checkpoint curto registrado pelo assistente durante a atuacao
- historico da conversa
- estado real verificado do working tree e dos arquivos em foco
- build/teste ja concluido e confirmado

Frase padrao de retomada na mesma sala:
RETOMADA MESMA SALA: recupere o ultimo checkpoint confirmado, diferencie o que ficou concluido do que ficou pendente, revalide qualquer acao que possa ter sido interrompida e continue apenas a partir do estado real verificado.

Conteudo minimo do checkpoint curto:
- modo ativo
- objetivo atual
- ultimo passo confirmado como concluido
- ponto pendente ou interrompido
- arquivos em foco
- ultima validacao confirmada
- proximo passo

Resposta obrigatoria da IA apos a frase de retomada:
- modo ativo
- objetivo atual
- ultimo ponto confirmado
- ponto incerto ou interrompido
- arquivos em foco
- ultima validacao confirmada
- proximo passo

## ESTADO OPERACIONAL GERADO

### git status --short --branch
```
## feature/lexical-policy-voting-regression
 M docs/current-development-continuity-spec-v1.0.md
 M docs/lexical-policy-v1.0.md
 M generate-room-baton-package.sh
 M scripts/run-sql-test-suite.sh
?? sql/tests/test_dictionary_policy_voting_path.sql
```

### git remote -v
```
origin	https://github.com/pbonafina/patxanga-core.git (fetch)
origin	https://github.com/pbonafina/patxanga-core.git (push)
```

### git log --oneline --decorate -n 15
```
ece4650 (HEAD -> feature/lexical-policy-voting-regression, origin/develop, origin/HEAD, develop) Merge pull request #10 from pbonafina/feature/offline-lexical-policy-boundaries
c727200 test: cover offline lexical policy boundaries
f6c18f1 Merge pull request #9 from pbonafina/feature/lexical-policy-imported-words-regression
a8222ee test: add lexical policy imported word regression
1476a40 Merge pull request #8 from pbonafina/feature/licensed-pt-pt-dictionary-sample
6927487 feat: add pt-PT dictionary source sample
bfeacea Merge pull request #7 from pbonafina/feature/licensed-dictionary-source-sample
159ee49 feat: validate licensed dictionary source sample
7b4ea65 Merge pull request #6 from pbonafina/feature/dictionary-csv-import-tooling
86358e3 feat: add dictionary CSV import tooling
3cc1c70 Merge pull request #5 from pbonafina/feature/dictionary-import-pipeline
0e38fa8 feat: add audited dictionary import pipeline
44c1eb4 Merge pull request #4 from pbonafina/feature/pt-pt-language-baseline
a3cac88 fix: add pt-PT language baseline
6c5d636 Merge pull request #3 from pbonafina/feature/match-language-dictionary-validation
```

### tail -n 60 ../project-log.md
```
../project-log.md nao encontrado neste clone local.
```

## AMBIENTE OPERACIONAL ATUAL

- sistema operacional do operador: macOS
- shell padrao: zsh
- operador trabalha via terminal do Mac
- browser local e usado para validacao manual
- frontend local servido em http://localhost:3001
- repo local em ~/patxanga-bootstrap/patxanga-core
- project-log.md e logstep.sh em ~/patxanga-bootstrap
- container principal local: supabase_db_patxanga-core

## MODO DE TRABALHO COM O OPERADOR

- o operador executa comandos no terminal do Mac
- a IA deve preparar comandos e scripts prontos para colar
- evitar edicao manual de arquivos
- preferir inspecao antes de patch
- quando houver varios passos, entregar sequencia operacional curta
- validar build e/ou teste antes de versionar
- ao fim de cada marco importante, avaliar atualizacao do kit de continuidade

## PROCEDIMENTO DE TESTE BROWSER

### Confirmacao do frontend local
```bash
cd ~/patxanga-bootstrap/patxanga-core
lsof -nP -iTCP:3001 -sTCP:LISTEN
curl -I http://localhost:3001
```

### Validacao automatizada com Playwright
```bash
cd ~/patxanga-bootstrap/patxanga-core/frontend
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```
- a automacao sobe uma instancia isolada em http://127.0.0.1:3101
- essa execucao nao interfere na porta operacional 3001
- usar Playwright para fluxos objetivos; manter revisao humana quando houver dependencia de julgamento visual fino

### Abrir no browser
```bash
cd ~/patxanga-bootstrap/patxanga-core
open http://localhost:3001
```
Depois fazer hard refresh com Cmd + Shift + R.

### Registro de rodada
```bash
cd ~/patxanga-bootstrap/patxanga-core
printf "
### rodada browser %s
match_id=COLE_AQUI
user_id=COLE_AQUI
objetivo=COLE_AQUI
" "$(date "+%Y-%m-%d %H:%M:%S")" >> tmp/browser-validation-notes.txt
tail -n 20 tmp/browser-validation-notes.txt
```

## PROCEDIMENTO DE CRIACAO DE PARTIDA DE TESTE

### Fluxo preferencial pela UI
- abrir http://localhost:3001
- usar a secao `Cenarios de validacao browser` e clicar `Gerar cenarios de validacao`
- usar `Usar host` / `Usar guest` para preencher o formulario principal
- usar `Carregar no alternador` para trocar entre host e guest sem recolar UUIDs

### Fallback SQL para criar host, guest e match de teste
```bash
cd ~/patxanga-bootstrap/patxanga-core && docker exec -i supabase_db_patxanga-core psql -U postgres -d postgres <<'SQL'
\pset tuples_only on
\pset format unaligned

with host_seed as (
  select gen_random_uuid() as host_user_id
), created as (
  select
    host_seed.host_user_id,
    public.create_patxanga_match(
      p_host_user_id := host_seed.host_user_id,
      p_host_guest_name := 'Host Local',
      p_language := 'pt-BR',
      p_match_mode := 'synchronous',
      p_max_players := 2
    ) as match_id
  from host_seed
), guest_seed as (
  select gen_random_uuid() as guest_user_id
), joined as (
  select
    created.host_user_id,
    guest_seed.guest_user_id,
    created.match_id,
    public.join_patxanga_match(
      p_match_id := created.match_id,
      p_user_id := guest_seed.guest_user_id,
      p_guest_name := 'Guest Local',
      p_is_bot := false,
      p_bot_level := null,
      p_bot_profile := null
    ) as guest_player_id
  from created
  cross join guest_seed
), started as (
  select
    joined.host_user_id,
    joined.guest_user_id,
    joined.match_id,
    public.start_patxanga_match(joined.match_id) as started_payload
  from joined
)
select 'host_user_id=' || host_user_id::text from started
union all
select 'guest_user_id=' || guest_user_id::text from started
union all
select 'match_id=' || match_id::text from started;
SQL
```

### Uso na UI
- abrir http://localhost:3001
- preencher match_id e user_id no formulario principal, ou usar `Usar host` / `Usar guest`
- se disponivel, carregar os IDs na secao `Alternar host e guest` para trocar de papel sem recolar UUIDs

## FILE: docs/00-index.md

# PATXANGA - INDICE DE DOCUMENTACAO

## Para jogador e produto

- `docs/como-jogar-patxanga.md` - manual inicial de como jogar Patxanga.
- `docs/implementation-roadmap.md` - roadmap consolidado de implementacao.
- `docs/01-product-vision.md` - visao de produto e diferenciais do jogo.
- `docs/10-letter-distribution.md` - distribuicao oficial de pecas.
- `docs/11-board-layout.md` - layout oficial do tabuleiro.

## Regras e contratos tecnicos

- `docs/12-submit-move-contract.md` - contrato congelado de envio de jogada.
- `docs/lexical-policy-v1.0.md` - politica de palavras reconhecidas, importadas e votadas.
- `docs/frontend-contract-rpcs-v1.0.md` - RPCs usadas pelo frontend.
- `docs/frontend-contract-screen-actions-v1.0.md` - acoes permitidas por tela.
- `docs/frontend-contract-match-states-v1.0.md` - estados oficiais da partida.
- `docs/frontend-contract-pending-vote-ux-v1.0.md` - comportamento de votacao pendente.
- `docs/frontend-rack-composition-ux-v1.0.md` - composicao local do rack por slots.
- `docs/07-bot-engine.md` - contrato inicial de bots de teste e simulacao.

## Operacao e continuidade

- `docs/current-development-continuity-spec-v1.0.md` - status atual do desenvolvimento.
- `docs/18-room-baton-package-current.md` - pacote atual de continuidade.
- `docs/15-local-ops-and-collaboration-protocol.md` - protocolo local de trabalho.

## Arquivos ainda vazios

- `docs/02-functional-spec.md`
- `docs/05-api-contracts.md`
- `docs/06-game-engine-rules.md`
- `docs/08-realtime-flow.md`
- `docs/09-deployment-plan.md`

## FILE: docs/17-continuity-activation-brief-v1.0.md

# Continuity Activation Brief v1.0

## Ler primeiro
- `docs/continuity-package-v1.6.md`
- snapshot master vigente
- `project-log.md`
- `docs/16-room-restart-prompt-v1.0.md`

## Fonte de verdade
- branch atual
- commits ja pushados
- `project-log.md`

## O que esta fechado
- backend principal funcional
- bootstrap real validado
- submit real validado
- pending vote validado
- wildcard com `declared_letter` validado ponta a ponta
- primeira composicao de tela jogavel aberta
- rack com drag and drop local no frontend

## O que nao fazer
- nao tratar a sandbox como layout final
- nao reabrir contratos funcionais ja validados
- nao misturar lixo local antigo com o marco atual sem auditoria

## Proxima prioridade
- evoluir a primeira tela de jogo orientada a produto
- refinar tabuleiro, rack, acoes e indicadores
- manter debug em plano secundario


## FILE: docs/16-room-restart-prompt-v1.0.md

# Room Restart Prompt v1.0

Antes de qualquer análise ou proposta:
- vou encaminhar os arquivos de leitura nesta conversa
- leia os arquivos na ordem enviada
- considere a enumeração abaixo como checklist de ingestão
- aguarde receber todos os arquivos antes de concluir a leitura e antes de propor o próximo passo
- só avance depois de confirmar que recebeu e integrou todo o conjunto

Arquivos que serão encaminhados para leitura:
1. `docs/continuity-package-v1.6.md`
2. snapshot master vigente (`docs/99-context-snapshot-master-v1.6.md`)
3. `docs/15-local-ops-and-collaboration-protocol.md`
4. `docs/12-submit-move-contract.md`
5. contratos curtos de frontend relevantes:
   - `docs/frontend-contract-match-bootstrap-v1.0.md`
   - `docs/frontend-contract-match-states-v1.0.md`
   - `docs/frontend-contract-pending-vote-ux-v1.0.md`
   - `docs/frontend-contract-rpcs-v1.0.md`
   - `docs/frontend-contract-screen-actions-v1.0.md`
   - `docs/frontend-backend-operational-contract-v1.0.md`
   - `docs/frontend-integration-checklist-v1.0.md`
6. `docs/16-room-restart-prompt-v1.0.md`
7. `docs/17-continuity-activation-brief-v1.0.md`

Você está entrando na continuidade do projeto Patxanga.

Leia e use, nesta ordem:
1. `docs/continuity-package-v1.6.md`
2. snapshot master vigente (`docs/99-context-snapshot-master-v1.6.md`)
3. `docs/15-local-ops-and-collaboration-protocol.md`
4. `docs/12-submit-move-contract.md`
5. contratos curtos de frontend relevantes:
   - `docs/frontend-contract-match-bootstrap-v1.0.md`
   - `docs/frontend-contract-match-states-v1.0.md`
   - `docs/frontend-contract-pending-vote-ux-v1.0.md`
   - `docs/frontend-contract-rpcs-v1.0.md`
   - `docs/frontend-contract-screen-actions-v1.0.md`
   - `docs/frontend-backend-operational-contract-v1.0.md`
   - `docs/frontend-integration-checklist-v1.0.md`
6. `docs/16-room-restart-prompt-v1.0.md`
7. `docs/17-continuity-activation-brief-v1.0.md`

Antes de propor ou executar qualquer novo passo:
- confirme o estado atual do branch
- leia os commits mais recentes
- use `project-log.md` como trilha operacional
- trate branch + commits ja pushados como fonte de verdade mais forte em caso de divergencia

Estado consolidado do projeto:
- backend central do jogo ja funcional
- bootstrap real frontend-backend ja validado
- submit real de jogada ja validado
- ramo `accepted` ja validado pela UI
- ramo `pending_vote` ja validado pela UI
- votacao `accepted` e `rejected` ja validadas
- overlay visual de `pending_vote` ja implementado
- home atual continua existindo como sandbox operacional
- `VotingSection`, `BoardSection`, `RackSection`, `PlayersSection`, `MatchStatusPanel` e `MoveSubmitSection` ja foram extraidos
- wildcard com `declared_letter` foi fechado ponta a ponta
- a primeira composicao de tela jogavel orientada a produto ja foi aberta
- o rack jogavel ja suporta reordenacao local via drag and drop no frontend

Leitura correta do momento atual:
- a home atual nao deve ser tratada como layout final de produto
- ela deve ser entendida como tela operacional/sandbox de validacao
- a tela jogavel inicial ja existe e deve ser a frente principal de evolucao
- a proxima prioridade principal nao e mais infra nem integracao
- a proxima prioridade principal e evoluir a primeira tela de jogo orientada a produto

Diretriz para a proxima fase:
- priorizar visualmente tabuleiro, rack/deck, acao principal do turno e votacao apenas quando necessaria
- reduzir detalhes tecnicos visiveis por padrao
- manter debug como camada secundaria
- nao reabrir contratos funcionais ja validados sem necessidade
- continuar trabalhando com commits pequenos, frequentes e tematicos
- apos cada marco relevante: validar, commitar, pushar, registrar com `logstep.sh` e refletir no continuity package quando houver mudanca operacional real

Modo de operacao:
- pesquisar primeiro
- localizar o trecho real do codigo antes de alterar
- decidir com base no estado atual do repositorio
- implementar de forma incremental
- evitar adivinhacao em patches
- confirmar build/teste sempre que mexer em frontend ou SQL critico

Recomendacao de partida para a proxima sala:
- nao voltar a polir a sandbox antes disso
- continuar diretamente a evolucao da primeira tela de jogo orientada a produto
- usar a sandbox apenas como apoio operacional e de validacao


## FILE: docs/continuity-package-v1.6.md

Leia atentamente, nesta ordem:

1) CONTEXT SNAPSHOT MASTER v1.6
2) docs/12-submit-move-contract.md — Version 1.2 (Frozen)
3) Operational Log Policy
4) Handoff Protocol

Estado atual confirmado:

• Projeto usa Supabase CLI
• Banco reconstruído exclusivamente via migrations
• supabase db reset compila engine sem erro
• submit_move hardened e integrado
• pending_vote persistente real já validado
• votação accept/reject já validada
• pass turn já validado
• exchange tiles já validado
• fim de partida já validado em dois critérios
• pontuação final por peças restantes já validada
• UUID por peça preservado
• Server-authoritative absoluto

Processo oficial:

• Nunca gerar SQL fora de migration
• Nunca confiar em validação client-side
• Nunca alterar regras estratégicas congeladas
• Toda nova função deve entrar em migration versionada
• Sempre versionar mudanças relevantes e registrar logstep

Estado técnico validado:

• create_match funcional
• join_match funcional
• start_match funcional
• rack distribuído corretamente
• current_turn_player_id funcional
• submit_move funcional nos ramos success e pending_vote
• submit_vote funcional nos ramos accepted e rejected
• pass_turn funcional
• exchange_tiles funcional
• score funcional
• board_state persistido corretamente
• rack_state atualizado corretamente
• bag_state atualizado corretamente
• next_player definido
• match_finished funcional
• score final ajustado por peças restantes

Objetivo do próximo passo:
[DESCREVER AQUI]

Não simplifique arquitetura.
Não altere regras congeladas.
Não reestruture banco.
Não remova UUID.
Não quebre replay.
Não ignore fluxo de pending_vote.
Não troque player_id por user_id no estado interno da partida.


## Observação operacional importante desta etapa

Durante a tentativa de consolidar o documento `frontend-backend-operational-contract-v1.0.md`,
foi observado um limite prático de geração/renderização de conteúdo longo nesta sala.

Sintoma:
- a resposta é truncada repetidamente no mesmo ponto
- o conteúdo deixa de chegar como documento único
- passam a surgir blocos separados e incompletos

Conclusão:
- o problema é operacional da sala/interface, não do backend do projeto

Regra de trabalho a partir daqui:
- evitar gerar documentos longos em bloco único nesta sala
- preferir documentos menores e segmentados
- quando necessário, quebrar artefatos grandes em múltiplos arquivos
- registrar sempre o ponto exato onde a geração foi interrompida

## Estado do projeto nesta etapa

O backend do Patxanga encontra-se amplamente validado, incluindo:

- gameplay core
- pending_vote
- votação accept/reject
- pass turn
- exchange tiles
- fim de partida
- penalidade final
- lobby direct
- convites
- resume
- forfeit
- listagens mínimas para frontend

Pendência atual:
- consolidação documental do contrato operacional frontend-backend

Natureza da pendência:
- limitação operacional de geração de arquivo longo nesta sala
- não representa bloqueio técnico do produto

Se qualquer dúvida estrutural surgir, pare e peça confirmação antes de gerar código e aguarde eu anexar o segundo arquivo antes de qualquer coisa.

## Atualização documental posterior a este pacote

Desde este baseline, o repositório passou a incluir o documento curto:

- `docs/frontend-contract-rpcs-v1.0.md`
- `docs/frontend-contract-match-states-v1.0.md` passa a integrar a ordem de referência para sessões de frontend
- `docs/frontend-contract-screen-actions-v1.0.md` passa a integrar a ordem de referência para sessões de frontend
- `docs/frontend-contract-match-bootstrap-v1.0.md` passa a integrar a ordem de referência para sessões de frontend

Uso recomendado em sessões de frontend:
- tratar `docs/frontend-contract-rpcs-v1.0.md` como contrato curto operacional das RPCs expostas ao frontend
- manter leitura conjunta com:
  - snapshot master vigente
  - `docs/12-submit-move-contract.md` — Version 1.2 (Frozen)
  - protocolo local/operacional vigente

## Marco de implementacao posterior a este pacote

Desde este baseline, o repositório passou a incluir uma base real de frontend em:

- `frontend/`

Stack adotada:
- Next.js com Pages Router

Uso recomendado em sessoes futuras:
- tratar `frontend/` como baseline inicial de implementacao do frontend
- manter leitura conjunta com:
  - `docs/frontend-contract-rpcs-v1.0.md`
  - `docs/frontend-contract-match-states-v1.0.md`
  - `docs/frontend-contract-screen-actions-v1.0.md`
  - `docs/frontend-contract-match-bootstrap-v1.0.md`
  - `docs/frontend-integration-checklist-v1.0.md`

## Marco posterior: bootstrap real inicial da match

Desde este baseline, o projeto passou a incluir:

- RPC server-authoritative `get_patxanga_match_bootstrap(uuid, uuid)`
- migration `20260313113000_14_match_bootstrap_entrypoint.sql`
- teste `sql/tests/test_get_match_bootstrap.sql` validado localmente
- frontend com provider real de bootstrap da match e fallback mock controlado
- remoção do adapter legado `frontend/lib/matchBootstrapAdapter.ts`

Estado prático atual:
- frontend buildando com bootstrap da match preparado para backend real
- camada ativa no frontend:
  - `frontend/lib/backend/`
  - `frontend/lib/supabase/`
- continuidade recomendada de leitura para sessões de frontend:
  - `docs/frontend-contract-rpcs-v1.0.md`
  - `docs/frontend-contract-match-states-v1.0.md`
  - `docs/frontend-contract-screen-actions-v1.0.md`
  - `docs/frontend-contract-match-bootstrap-v1.0.md`
  - `docs/frontend-integration-checklist-v1.0.md`

## Validacao funcional posterior: bootstrap real frontend-backend

Validado localmente em fluxo real pela UI:

- frontend em Next.js Pages Router carregando `.env.local`
- provider real do frontend consultando Supabase local
- RPC `get_patxanga_match_bootstrap(uuid, uuid)` respondendo corretamente
- resolucao server-authoritative de `player_id` a partir de `match_id + user_id`
- UI exibindo corretamente:
  - `status`
  - `match_id`
  - `player_id` resolvido
  - `current_turn_player_id`
  - `turn_number`
  - `players_summary`

Estado confirmado deste marco:
- primeiro bootstrap real da match validado ponta a ponta entre frontend e backend local

## Marco posterior: interacao local inicial de gameplay no frontend

Desde este baseline, a home do frontend passou a incluir:

- renderizacao de `players_summary`
- destaque visual de `current_turn_player_id`
- renderizacao read-only de `board_state`
- renderizacao do `rack_state` do jogador resolvido
- selecao local de pecas do rack
- preview local de posicionamento de pecas no board
- limpeza do preview local sem mutar estado oficial da match

Estado prático atual:
- frontend ja exibe leitura minima util da partida
- frontend ja possui interacao local inicial sem submit ao backend
- fluxo ainda preserva backend server-authoritative como fonte de verdade

## Marco posterior: preview local do payload de jogada no frontend

Desde este baseline, a home do frontend passou a incluir:

- selecao local de pecas do rack
- preview local de posicionamento no board
- geracao local de payload compativel com `submit_patxanga_move(...)`
- preview visivel de `p_placed_tiles` antes de qualquer submit real

Estado prático atual:
- frontend ja alcanca a fronteira do contrato real de jogada
- submit real ainda nao foi ligado
- backend continua como fonte oficial de validacao e aplicacao

## Marco posterior: submit real inicial de jogada no frontend

Desde este baseline, a home do frontend passou a incluir:

- geracao local de `p_placed_tiles`
- uso de `player_id` resolvido pelo bootstrap oficial
- chamada real de `submit_patxanga_move(...)`
- exibicao do retorno bruto da RPC
- recarga do bootstrap oficial apos a resposta

Estado prático atual:
- frontend ja executa submit real inicial de jogada contra o backend local
- fluxo ainda e controlado e simples, mas ja cruza a fronteira real da engine
- backend permanece server-authoritative para validacao, aplicacao e transicao de estado

## Validacao funcional posterior: jogada aceita pela UI no frontend

Validado localmente pela home do frontend:

- selecao local de pecas do rack
- posicionamento local no board
- geracao de `p_placed_tiles`
- chamada real de `submit_patxanga_move(...)`
- jogada valida aceita pela engine
- board oficial atualizado apos refresh do bootstrap
- rack recomposto com novas pecas apos a jogada

Estado confirmado deste marco:
- ramo `accepted` de submit real de jogada ja foi validado ponta a ponta pela UI

## Marco posterior: overlay visual de pending_vote na home do frontend

Desde este baseline, o projeto passou a incluir:

- read model `get_patxanga_pending_vote_context(...)`
- migration `20260313143000_15_pending_vote_context_entrypoint.sql`
- teste SQL do contexto de `pending_vote` validado localmente
- home do frontend com overlay visual para jogada pendente durante `voting`

Estado prático atual:
- `board_state` oficial permanece intacto durante `pending_vote`
- UI pode exibir a jogada pendente em overlay visual
- frontend fica alinhado ao contrato de UX de `pending_vote`

## Validacao funcional posterior: rejeicao de pending_vote pela UI

Validado localmente pela home do frontend:

- carregamento da match em `voting` como jogador elegivel para votar
- exibicao do contexto pendente de votacao
- uso de `submit_patxanga_vote(...)` pela UI
- rejeicao da jogada pendente por outro jogador
- retorno da match para `active`
- `current_turn_player_id` preservado no autor da jogada
- move resolvido como `rejected`
- `board_state` oficial permanecendo intacto apos a rejeicao

Estado confirmado deste marco:
- ramo `rejected` de `submit_patxanga_vote(...)` ja foi validado ponta a ponta pela UI

## Validacao funcional posterior: aprovacao de pending_vote pela UI

Validado localmente pela home do frontend:

- carregamento da match em `voting` como jogador elegivel para votar
- exibicao do contexto pendente de votacao
- uso de `submit_patxanga_vote(...)` pela UI
- aprovacao da jogada pendente por outro jogador
- retorno da match para `active`
- avanço de `turn_number`
- avanço de `current_turn_player_id`
- move resolvido como `accepted`
- `board_state` oficial aplicando a jogada apos a aprovacao

Estado confirmado deste marco:
- ramo `accepted` de `submit_patxanga_vote(...)` ja foi validado ponta a ponta pela UI

## Marco posterior: acabamento visual inicial do board na home

Desde este baseline, a home do frontend passou a refletir o direcionamento visual do board definitivo:

- casas `NM` renderizadas em branco
- coordenadas removidas do tabuleiro
- casas especiais preservadas apenas por diferenciação visual
- overlays relevantes de gameplay mantidos

Estado prático atual:
- board da home ficou menos técnico e mais próximo de produto
- renderização continua compatível com submit real, `pending_vote` e votação

## Plano recomendado das proximas fases

### Fase 1 — estabilizacao estrutural do frontend
Objetivo:
- reduzir risco de regressao
- sair da dependencia de uma home muito grande
- preparar o frontend para evolucao mais rapida

Etapas:
- [feito] extrair `VotingSection`
- [feito] extrair `BoardSection`
- [feito] extrair `RackSection`
- [feito] extrair `PlayersSection`
- [feito] extrair `MatchStatusPanel`
- [feito] extrair `MoveSubmitSection`
- [opcional] extrair `MatchLoadSection` se ainda houver ganho claro
- manter `pages/index.tsx` como orquestradora de estado e fluxo
- preservar comportamento atual sem mudar contratos

Criterio de saida:
- `index.tsx` deixa de concentrar o grosso do JSX
- build continua passando
- fluxos `active` e `voting` continuam funcionando sem mudanca funcional

Estado atual da fase:
- Fase 1 avancou de forma consistente
- os blocos mais sensiveis e volumosos da home ja foram separados
- a `index.tsx` passou a operar principalmente como orquestradora
- a extracao adicional de `MatchLoadSection` ficou opcional, nao obrigatoria

### Fase 2 — acabamento de UX da partida
Objetivo:
- transformar a tela de prova funcional em tela mais proxima de produto

Etapas:
- reduzir ainda mais ruido tecnico visivel por padrao
- manter debug apenas em modo opcional
- consolidar estilo visual do board
- consolidar estilo visual do rack
- melhorar textos de estado e acoes
- diferenciar com clareza:
  - turno atual
  - jogada pendente
  - acao disponivel ao jogador
- revisar visual de overlays e destaques

Criterio de saida:
- tela fica compreensivel sem leitura tecnica
- jogador entende o que pode fazer em cada estado

### Fase 3 — fechamento do fluxo de votacao como feature de produto
Objetivo:
- sair de UI minima de votacao para fluxo de votacao utilizavel

Etapas:
- revisar UX de autor x votante
- deixar explicito quando o autor nao pode votar
- tornar mais claro o resultado apos aprovacao/rejeicao
- decidir comportamento visual pos-voto
- revisar se o contexto pendente precisa mostrar:
  - palavra principal
  - palavras secundarias
  - autor
  - pecas em overlay
- validar multiplos ciclos de votacao seguidos

Criterio de saida:
- votacao fica legivel, previsivel e consistente
- fluxo nao parece mais interno ou experimental

### Fase 4 — amadurecimento dos estados fora do miolo principal
Objetivo:
- cobrir estados do produto que ainda estao menos trabalhados no frontend

Etapas:
- melhorar UX de `waiting`
- melhorar entrada e saida de lobby
- revisar `finished`
- revisar comportamento de resume
- revisar presenca/ausencia
- revisar forfeit
- revisar mensagens de transicao de estado

Criterio de saida:
- frontend deixa de estar forte so em `active` e `voting`
- estados laterais ficam coerentes com o restante do produto

### Fase 5 — consolidacao de contratos de frontend
Objetivo:
- reduzir ambiguidades futuras
- fixar decisoes que hoje ainda estao espalhadas entre codigo e conversa

Etapas:
- consolidar contrato visual do board definitivo
- consolidar contrato de UX de votacao
- consolidar contrato de acoes por estado
- alinhar documentos curtos com implementacao real
- atualizar continuidade ao fim de marcos relevantes, nao de microajustes

Criterio de saida:
- proxima sala encontra regras explicitas
- menos dependencia de memoria operacional

### Fase 6 — preparacao para uma primeira versao apresentavel
Objetivo:
- deixar a aplicacao pronta para demonstracao interna consistente

Etapas:
- revisar organizacao visual geral
- revisar textos e nomenclatura
- reduzir areas claramente de teste
- garantir fluxo feliz completo:
  - carregar match
  - jogar
  - cair em votacao
  - votar
  - seguir jogando
  - encerrar partida
- revisar navegacao minima necessaria

Criterio de saida:
- primeira versao demonstravel sem parecer painel tecnico

### Ordem recomendada de execucao
1. Refinar UX de votacao
2. Refinar UX de `waiting` e `finished`
3. Consolidar contratos e documentacao
4. Polimento de produto

## Uso do versionamento para retomada segura

Este projeto esta sendo conduzido com commits pequenos, frequentes e tematicos.

Regra operacional adotada:
- todo marco relevante deve, idealmente:
  - passar em build e/ou validacao pertinente
  - ser commitado
  - ser pushado
  - ser registrado via `logstep.sh`
  - ser refletido no continuity package quando altera o estado operacional do projeto

Como isso ajuda uma proxima sala:
- localizar rapidamente o ultimo marco estavel
- diferenciar experimento local de mudanca consolidada
- entender a sequencia real de evolucao
- retomar a partir do ultimo ponto seguro, e nao de memoria de conversa

Ordem recomendada de confianca para retomada:
1. estado atual do branch
2. commits recentes
3. `project-log.md`
4. `docs/continuity-package-v1.6.md`

Leitura correta:
- o continuity package resume o estado operacional e as decisoes
- o historico de commits e o `project-log.md` mostram a trilha real de execucao
- em caso de divergencia, tratar o branch e os commits ja pushados como fonte de verdade mais forte

## Releitura do estado atual da home e mudanca de prioridade

Leitura consolidada apos revisao visual da tela em browser:

- a home atual evoluiu bem como tela operacional de validacao
- a integracao real frontend-backend ja esta funcional
- os fluxos principais de gameplay e votacao ja foram validados
- a home atual ja nao e monolitica e foi bastante modularizada
- apesar disso, a experiencia visual ainda se aproxima mais de sandbox operacional do que de tela final de jogo

Diagnostico de produto:
- a tela atual ainda expõe estrutura de paineis e blocos tecnicos demais
- o fluxo principal de gameplay ainda nao aparece como composicao visual dominante
- tabuleiro, rack e acao principal ainda nao estao organizados como uma mesa de jogo de producao
- a tela atual deve ser entendida como base funcional de validacao e nao como layout final do jogo

Decisao de prioridade:
- nao tratar a home atual como candidata direta a tela final de producao
- manter a home atual como tela operacional/sandbox util para validacao, depuracao e testes de integracao
- abrir como proxima frente uma primeira tela de jogo orientada a produto

Objetivo da proxima fase:
- construir uma tela centrada em gameplay
- priorizar visualmente:
  - tabuleiro
  - rack/deck do jogador
  - acao principal do turno
  - bloco de votacao apenas quando necessario
- reduzir fortemente detalhes tecnicos visiveis por padrao
- manter debug como camada secundaria, opcional e nao central

Implicacao pratica:
- o proximo passo principal nao deve ser apenas continuar polindo paineis da home atual
- o proximo passo principal deve ser desenhar e implementar a primeira composicao de tela jogavel com foco de produto
- a home atual permanece util como apoio operacional durante essa transicao

## Requisito prioritario da proxima fase: declaracao de letra para peca especial sem letra fixa

Este requisito deve ser tratado como prioritario antes da consolidacao da primeira tela de jogo orientada a produto.

Regra funcional:
- quando o jogador usar uma peca especial sem letra fixa na face, ele deve declarar qual letra essa peca representara naquela jogada
- sem essa declaracao, a palavra formada fica ambigua e nao pode ser tratada como jogada completa de producao

Motivos:
- validar corretamente a palavra submetida
- persistir corretamente a jogada aceita
- permitir leitura correta do board em cruzamentos futuros
- permitir votacao e revisao da jogada com informacao completa

Implicacoes tecnicas:
- o frontend deve exigir a escolha da letra para a peca especial antes da confirmacao da jogada
- o payload da jogada deve carregar `declared_letter` para essa peca
- o backend deve tratar `declared_letter` como obrigatorio nesse caso
- a letra declarada deve ser a referencia efetiva para validacao, persistencia e leitura futura da celula no board

Diretriz de prioridade:
- este requisito deve entrar antes do refinamento avancado da primeira tela jogavel de produto
- a proxima fase nao deve considerar o fluxo principal suficientemente fechado sem essa cobertura

## Marco posterior: wildcard com declared_letter validado ponta a ponta

Foi fechado o requisito funcional prioritario da peca especial sem letra fixa.

Estado validado:
- backend exige `declared_letter` para tile `wildcard`
- `declared_letter` e normalizado no backend
- frontend passou a exigir a letra ao posicionar wildcard
- preview local do board mostra a letra declarada
- clique em casa com preview local remove a peca do board e limpa o estado local correspondente
- submit real com wildcard voltou a funcionar sem quebrar os fluxos existentes
- em palavra nao reconhecida, o fluxo continua corretamente para `pending_vote`

Leitura correta:
- o requisito funcional de wildcard ficou coberto
- a UX atual ainda e minima
- refinamentos futuros podem substituir o `prompt()` por interacao melhor, mas sem reabrir o contrato funcional\n\n## Requisito de UX para a primeira tela jogavel: reordenacao local do rack

A primeira tela de jogo orientada a produto deve permitir que o jogador reorganize visualmente as pecas do proprio rack antes de leva-las ao tabuleiro.

Objetivo:
- permitir leitura melhor das combinacoes possiveis
- permitir montagem mental da palavra ainda no rack
- aproximar a experiencia de jogo do comportamento esperado em jogos de palavra com pecas

Escopo esperado:
- reordenacao apenas local/visual do rack
- sem alterar estado persistido do backend
- sem impacto no contrato funcional de submit
- a ordem visual reorganizada deve servir apenas como apoio de gameplay e usabilidade

Leitura correta:
- este requisito e de UX/gameplay
- nao substitui o fluxo de posicionamento no tabuleiro
- deve entrar no desenho da primeira tela de jogo orientada a produto\n

## Marco posterior: primeira composicao de tela jogavel orientada a produto

Foi aberta a primeira composicao visual de tela jogavel sem substituir a home sandbox existente.

Estado consolidado:
- a home continua existindo como sandbox operacional e de validacao
- foi criada uma composicao mais orientada a gameplay na camada de frontend
- o foco visual passou a privilegiar tabuleiro, rack e acao principal da jogada
- a sandbox tecnica permanece acessivel via debug e nao como experiencia principal

Leitura correta:
- este marco nao fecha a UX final do jogo
- este marco abre a primeira camada real de tela jogavel
- a direcao correta passa a ser evoluir essa composicao de gameplay, e nao voltar a expandir a sandbox

## Marco posterior: rack jogavel simplificado e reordenacao local

A tela jogavel passou a ter um rack mais proximo de pecas de jogo e menos de cartoes tecnicos.

Estado consolidado:
- tiles do rack foram simplificados visualmente
- selecao passou a depender mais de estado visual e menos de texto
- o rack passou a suportar reordenacao local no frontend
- a primeira versao de reordenacao foi validada
- em seguida a interacao foi evoluida para drag and drop local no rack

Garantias:
- a reordenacao e apenas visual/local
- nao altera contrato do backend
- nao altera estado persistido do rack no servidor
- nao reabre os contratos funcionais ja validados

Leitura correta:
- drag and drop local do rack e um ganho de UX/gameplay
- a ordem visual ajuda o jogador a montar mentalmente a palavra antes de posicionar no tabuleiro
- este comportamento ainda pode ser refinado visualmente, mas a capacidade funcional ja foi adicionada

## Estado mais recente da frente de produto

No ponto atual do projeto:
- backend funcional principal segue validado
- wildcard com `declared_letter` segue validado ponta a ponta
- a tela jogavel inicial ja existe
- o rack ja suporta drag and drop local
- a sandbox continua util, mas nao deve voltar a ser o centro do trabalho de UX

Prioridade recomendada para a proxima sala:
- continuar a evolucao da primeira tela de jogo orientada a produto
- revisar a composicao visual final de tabuleiro, rack, acoes e indicadores de estado
- manter a sandbox apenas como camada secundaria de apoio operacional

## FILE: docs/99-context-snapshot-master-v1.6.md

# ============================================================
# PATXANGA — CONTEXT SNAPSHOT MASTER
# Version: 1.6 (Gameplay Core + Voting + End Conditions + Final Penalties Validated)
# Status: FROZEN BASELINE
# ============================================================

Este documento representa o estado arquitetural oficial da engine Patxanga
após validação do núcleo completo do gameplay backend, incluindo votação,
encerramento de partida e ajuste final de score por peças restantes.

Nenhuma decisão estrutural pode ser alterada sem incremento de versão.

------------------------------------------------------------
1. ARQUITETURA GERAL
------------------------------------------------------------

• Backend 100% server-authoritative
• PostgreSQL (Supabase)
• Todas as alterações via migrations
• Nenhum SQL aplicado manualmente fora de migration
• UUID individual por peça
• Persistência completa de board_state, rack_state e bag_state
• Estado interno da partida usa player_id, não user_id

------------------------------------------------------------
2. PROCESSO OFICIAL DE BUILD
------------------------------------------------------------

Ambiente local:

1. supabase start
2. supabase db reset

Reset recria todo o banco a partir das migrations oficiais.

Ordem obrigatória das migrations:

01_initial_schema
02_dictionary
03_distribution_seed
04_core_rpcs
05_submit_engine
06_dictionary_test_seed
07_pending_vote_resolution
08_pass_turn
09_exchange_tiles
10_evaluate_match_end

------------------------------------------------------------
3. ESTRUTURA DO PROJETO
------------------------------------------------------------

/sql
    /migrations        → arquivos históricos originais
    /rpc               → funções individuais fonte
    /seeds             → seeds isolados
    /tests             → testes SQL

/supabase
    /migrations        → migrations oficiais aplicáveis

Migrations oficiais são geradas concatenando/copiando os arquivos fonte quando necessário.

------------------------------------------------------------
4. ENGINE ATUAL
------------------------------------------------------------

Fluxos implementados:

create_match()
join_match()
initialize_bag()
initialize_board()
start_match()
submit_patxanga_move()
submit_patxanga_vote()
submit_patxanga_pass_turn()
submit_patxanga_exchange_tiles()
evaluate_patxanga_match_end()

------------------------------------------------------------
5. SUBMIT_MOVE
------------------------------------------------------------

submit_move inclui:

• Lock pessimista da match
• Lock do player
• Validação de posse UUID
• Validação geométrica
• Hidratação de placed tiles com peças completas do rack
• Construção de virtual board
• Extração de palavras
• Regra: palavra principal deve ter pelo menos 2 letras
• Validação lexical via tabela local
• Branch success
• Branch pending_vote persistente
• Replay
• Atualização de board_state
• Atualização de rack_state
• Atualização de bag_state
• Avanço de turno
• Integração com avaliação de fim de partida
• Reset de estagnação após jogada válida

------------------------------------------------------------
6. PENDING_VOTE
------------------------------------------------------------

Quando a palavra não existe no dicionário:

• patxanga_moves recebe status = pending_vote
• match passa para status = voting
• move_id é retornado ao cliente
• board_state não é alterado
• rack_state não é alterado
• bag_state não é alterado
• turno não avança
• replay registra o evento

submit_patxanga_vote() resolve:

• voto do autor é proibido
• rejeição única já resolve como rejected
• todas as aprovações necessárias resolvem como accepted

Se accepted:

• move vira accepted
• board é aplicado
• rack é atualizado
• bag é reduzido
• score é aplicado
• turno avança
• match volta para active

Se rejected:

• move vira rejected
• board permanece intacto
• turno permanece no autor
• match volta para active

------------------------------------------------------------
7. PASS TURN
------------------------------------------------------------

submit_patxanga_pass_turn():

• valida match / turno / player
• persiste move_type = pass
• status = accepted
• score_total = 0
• marca has_passed_last_cycle = true
• avança turno
• replay registra turn_passed e turn_changed
• integra avaliação de fim de partida

------------------------------------------------------------
8. EXCHANGE TILES
------------------------------------------------------------

submit_patxanga_exchange_tiles():

• valida match / turno / player
• valida posse das peças
• remove peças do rack
• devolve peças ao bag
• compra mesma quantidade de peças novas
• atualiza rack_state
• atualiza bag_state
• persiste move_type = exchange_tiles
• avança turno
• replay registra tiles_exchanged e turn_changed

------------------------------------------------------------
9. FIM DE PARTIDA
------------------------------------------------------------

evaluate_patxanga_match_end():

Critério 1:
• bag vazio
• algum jogador com rack vazio
→ match finished

Critério 2:
• bag vazio
• todos os jogadores com has_passed_last_cycle = true
→ match finished

Ao terminar:

• status = finished
• winner_player_id = maior score ajustado
• finished_at preenchido
• replay registra match_finished

------------------------------------------------------------
10. PONTUAÇÃO FINAL
------------------------------------------------------------

Quando a match termina:

• cada jogador recebe penalidade igual à soma dos pontos das peças restantes no rack
• essa penalidade é subtraída do score final
• se houve encerramento por rack vazio, o jogador que zerou o rack recebe bônus
  igual à soma total das penalidades dos demais jogadores
• winner_player_id é recalculado após esse ajuste final

Regra atual de winner:
• maior score
• desempate simples por turn_order asc

Ainda não implementado nesta versão:
• tie-break formal sofisticado

------------------------------------------------------------
11. DICIONÁRIO
------------------------------------------------------------

Tabela:

patxanga_dictionary (
    word_original text PK,
    word_normalized text unique
)

Funções:

normalize_patxanga_word()
validate_word()

Seed mínimo local para testes:

• SE
• DE
• EM
• ME
• TE
• DA
• DO
• EU
• TU
• NO
• NA
• RE

------------------------------------------------------------
12. REGRAS ESTRATÉGICAS CONGELADAS
------------------------------------------------------------

• Tabuleiro 15x15
• Centro (8,8) obrigatório na primeira jogada
• 4 PT nos cantos
• Multiplicadores NM | LD | LT | PD | PT
• Patxanga Real dobra apenas a palavra principal
• Patxanga Real aplica após multiplicadores
• Bônus 7 peças = +20

------------------------------------------------------------
13. PROIBIÇÕES
------------------------------------------------------------

• Não alterar layout
• Não alterar distribuição
• Não remover UUID
• Não confiar no frontend
• Não aplicar SQL fora de migrations
• Não trocar player_id por user_id no estado interno da partida
• Não modificar engine sem update do snapshot

------------------------------------------------------------
14. VALIDAÇÃO JÁ COMPROVADA
------------------------------------------------------------

Já foi comprovado com testes locais determinísticos:

• success com palavra válida ("DA")
• score = 6 com multiplicador central
• board_state persistido
• rack recomposto
• bag reduzido
• turno avançado

• pending_vote com palavra inválida ("TS")
• move persistido
• match em voting
• board intacto

• pending_vote accepted
• move aplicado ao board
• score aplicado
• match volta para active

• pending_vote rejected
• move rejeitado
• board intacto
• match volta para active

• pass turn funcional

• exchange tiles funcional

• match end por bag vazio + rack vazio

• match end por bag vazio + todos passaram

• penalidade final por peças restantes aplicada corretamente

• bônus final ao jogador que zerou o rack aplicado corretamente

------------------------------------------------------------
15. ESTADO ATUAL
------------------------------------------------------------

Engine compilável via:

supabase db reset

Gameplay backend central está validado.

Próximos blocos prioritários:

• tie-break / empate formal
• cruzamentos e palavras secundárias mais complexas
• integração com frontend
• testes de regressão mais amplos
• polimento de replay / observabilidade
## FILE: docs/15-local-ops-and-collaboration-protocol.md

# PATXANGA — LOCAL OPS AND COLLABORATION PROTOCOL
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE

## 1. Objetivo

Este documento registra o protocolo operacional local e o método de colaboração
adotado para o projeto Patxanga nesta fase.

Ele existe para reduzir retrabalho, evitar comandos ambíguos, manter continuidade
e padronizar a criação de arquivos, validações e versionamento local.

## 2. Ambiente local oficial

- Sistema operacional: macOS
- Shell padrão: zsh
- Diretório de trabalho do projeto: `~/patxanga-bootstrap/patxanga-core`
- Repositório Git local: `~/patxanga-bootstrap/patxanga-core`

## 3. Fluxo local oficial de banco

Comando padrão de reconstrução local:

```bash
cd ~/patxanga-bootstrap/patxanga-core && supabase db reset
```

Regras obrigatórias:

- o banco deve ser reconstruído exclusivamente via migrations
- migrations são a fonte oficial de reconstrução do banco
- nunca usar SQL manual fora de migration como solução final

## 4. Container local padrão

Container principal de Postgres/Supabase:

- `supabase_db_patxanga-core`

## 5. Forma padrão de rodar testes SQL

Comando padrão:

```bash
cd ~/patxanga-bootstrap/patxanga-core && docker exec -i supabase_db_patxanga-core psql -U postgres < caminho/do/teste.sql
```

## 6. Forma padrão de abrir arquivos para edição local

Comando padrão:

```bash
cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit caminho/do/arquivo
```

## 7. Script local de logstep

O script local de logstep fica um nível acima do projeto.

Fluxo padrão:

```bash
cd ~/patxanga-bootstrap && ./logstep.sh "mensagem" && cd patxanga-core
```

## 8. Fluxo padrão de versionamento

Comandos padrão:

```bash
cd ~/patxanga-bootstrap/patxanga-core && git add ... && git commit -m "..." && git push
```

Regra prática:

- não assumir caminhos diferentes sem explicitar antes

## 9. Ferramentas preferenciais de validação no terminal

Quando precisar validar arquivos ou trechos de arquivo, preferir:

- `ls`
- `grep -n`
- `sed -n`
- `tail -n`
- `cat`
- `nl -ba` quando for importante inspecionar linhas com precisão

## 10. Convenções arquiteturais que devem ser preservadas

- migrations como fonte oficial do banco
- nada de SQL manual como solução final
- separação rígida entre `user_id` e `player_id`
- backend server-authoritative
- UUID individual por peça
- replay preservado
- regras estratégicas congeladas não devem ser alteradas sem motivo técnico forte e versionamento formal

## 11. Protocolo de interação operacional nesta sala

- trabalhar com o mínimo de interações possível
- preferir comandos prontos para colar no terminal do mac
- quando houver vários passos, entregar sequência operacional curta e numerada
- dizer sempre com clareza:
  - o objetivo
  - o comando exato para rodar
  - o resultado esperado
  - o próximo comando
- quando precisar de validação, pedir explicitamente para rodar um comando e colar a saída
- quando houver risco de truncamento, mudar de estratégia antes de continuar
- nunca entregar respostas fragmentadas em muitos blocos difíceis de copiar

## 12. Protocolo para criação e substituição de arquivos

Princípios gerais:

- preferir comandos completos e robustos
- para arquivos críticos, preferir pacote pronto e completo
- para documentação longa, preferir arquivos curtos ou geração por script local

### 12.1 Para geração de arquivos

- usar heredoc apenas para arquivos curtos e simples
- usar `python3` para arquivos markdown ricos, especialmente se contiverem fences, JSON, listas longas ou se houver histórico de truncamento na sala
- validar sempre o arquivo gerado com inspeção no terminal antes de concluir que houve apenas erro de renderização

### 12.2 Estratégia preferencial por tipo de arquivo

- arquivo curto e simples: heredoc pode ser aceitável
- arquivo markdown mais rico: preferir `python3` escrevendo o arquivo inteiro
- usar anexação de blocos curtos apenas quando necessário
- quando houver chance de quebra por tamanho, dividir em arquivos menores, não em blocos confusos de chat

## 13. Regras de segurança operacional para documentação e comandos

- não assumir que erro visual na interface significa apenas erro de renderização
- primeiro inspecionar o conteúdo real do arquivo no terminal
- antes de corrigir arquivo supostamente quebrado, validar o conteúdo bruto
- preferir correções precisas baseadas em inspeção real de linhas

## 14. Padrão de resposta esperado na colaboração

Formato ideal das respostas:

- diagnóstico objetivo
- recomendação objetiva
- comandos prontos para terminal
- resultado esperado
- próximo passo

## 15. Observação final

Este documento é operacional e complementar.

Ele não substitui:

- snapshot arquitetural
- contratos congelados de gameplay
- migrations oficiais
- políticas formais de log e handoff

Fim do documento.

## 16. Regras obrigatórias de versionamento

Toda mudança relevante de arquitetura, fluxo, contrato, operação local
ou baseline documental deve resultar em arquivo versionado no repositório.

Toda mudança relevante deve terminar com a sequência operacional completa:
- `git add ...`
- `git commit -m "mensagem descritiva em português"`
- `git push`
- `cd ..`
- `./logstep.sh "mensagem"`
- `cd patxanga-core`

Regra prática:
- não considerar trabalho concluído sem indicar claramente se houve ou não versionamento
- preferir apresentar o versionamento em comandos explícitos, um por linha, no formato operacional usado no projeto
- preferir mensagens de commit descritivas em português, alinhadas ao conteúdo efetivamente alterado
- preferir mensagem de logstep curta, objetiva e compatível com a etapa concluída
- quando uma alteração exigir atualização de documento já existente, isso deve ser sinalizado explicitamente
- quando surgir novo baseline, deve ser criado ou atualizado o documento correspondente no projeto

## 17. Regras obrigatórias de continuidade entre salas

Continuidade deve ser tratada como parte do trabalho,
não como detalhe opcional.

Ao final de cada bloco importante, deve haver avaliação explícita sobre a necessidade de atualizar:
- continuity package vigente
- snapshot master vigente
- protocolo local e operacional
- contratos específicos relacionados ao tema trabalhado

Se a resposta for sim:
- preparar comandos
- preparar conteúdo
- preparar versionamento

Se a resposta for não:
- dizer explicitamente por que a atualização do kit não é necessária naquele momento

## 18. Critério prático para atualizar o kit de continuidade

A documentação de continuidade deve ser atualizada sempre que houver qualquer uma destas situações:
- nova arquitetura ou subarquitetura aprovada
- novo subsistema implementado
- mudança relevante de fluxo de produto
- novo contrato entre frontend e backend
- nova regra operacional importante
- nova limitação operacional descoberta
- novo baseline congelado
- mudança relevante no processo local de build, teste, versionamento ou colaboração

## 19. Responsabilidade ao encerrar uma etapa

Ao encerrar uma etapa importante, a resposta deve informar objetivamente:
1. estado atual do projeto
2. impacto no projeto
3. se precisa atualizar kit de continuidade: sim ou não
4. se sim, quais arquivos atualizar
5. comandos prontos para versionar
6. frase recomendada de retomada para futura sala, quando aplicável

## 20. Ordem oficial dos documentos de continuidade

A ordem oficial de referência entre salas é:
- continuity package vigente
- snapshot master vigente
- protocolo local e operacional
- contratos específicos relevantes para a sessão

## 21. Regras adicionais de continuidade

- não deixar a atualização do kit implícita
- não assumir que a atualização será lembrada manualmente depois
- não encerrar milestones sem avaliar formalmente a continuidade
- tratar continuidade como requisito de engenharia do projeto

## FILE: docs/frontend-backend-operational-contract-v1.0.md

# PATXANGA — FRONTEND/BACKEND OPERATIONAL CONTRACT
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE
Base normativa:
- docs/frontend-contract-rpcs-v1.0.md
- docs/frontend-contract-match-bootstrap-v1.0.md
- docs/game-lobby-and-invite-architecture-v1.0.md
- docs/presence-resume-forfeit-architecture-v1.0.md

## 1. Objetivo

Consolidar a superficie operacional minima entre frontend e backend para:

- entrada em lobby
- aceitacao e recusa de convite
- listagem de convites pendentes
- listagem de partidas retomaveis
- retomada de presenca na partida
- inicio de partida a partir do lobby
- desistência formal

Este documento nao redefine engine, nao substitui migrations e nao altera a
autoridade do backend.

## 2. Regras centrais

- backend continua server-authoritative
- `user_id` e identidade de sessao/produto
- `player_id` e identidade interna de gameplay
- frontend nao deve substituir `player_id` por `user_id` nas acoes de gameplay
- `resume_patxanga_match(...)` nao substitui bootstrap oficial da match
- depois de qualquer acao mutavel, o frontend deve reidratar estado oficial

## 3. Superficie oficial atual

### 3.1 RPCs orientadas a `user_id`

- `list_patxanga_user_pending_invites(p_user_id uuid)`
- `list_patxanga_user_resumable_matches(p_user_id uuid)`
- `accept_patxanga_invite(p_invite_id uuid, p_user_id uuid)`
- `decline_patxanga_invite(p_invite_id uuid, p_user_id uuid)`
- `resume_patxanga_match(p_match_id uuid, p_user_id uuid)`

### 3.2 RPCs orientadas a `player_id`

- `start_patxanga_match_from_lobby(p_match_id uuid, p_host_player_id uuid)`
- `forfeit_patxanga_match(p_match_id uuid, p_player_id uuid)`

## 4. Contrato operacional por RPC

### 4.1 `list_patxanga_user_pending_invites(...)`

#### Finalidade
Listar convites diretos pendentes para um usuario.

#### Entrada
- `p_user_id uuid`

#### Saida operacional esperada
Lista JSON com, no minimo:
- `invite_id`
- `match_id`
- `invite_status`
- `created_at`
- `expires_at`
- `lobby_id`
- `lobby_status`
- `invite_mode`
- `match_mode`
- `language`
- `max_players`
- `host_user_id`
- `host_guest_name`

#### Regra de consumo
- frontend usa essa RPC para a caixa de convites pendentes
- resultado vazio deve ser tratado como lista vazia, nao como erro

### 4.2 `accept_patxanga_invite(...)`

#### Finalidade
Aceitar convite direto e ingressar formalmente na match.

#### Entrada
- `p_invite_id uuid`
- `p_user_id uuid`

#### Saida operacional esperada
- `invite_id`
- `match_id`
- `player_id`
- `invite_status = accepted`
- `lobby_status`

#### Regra de consumo
- frontend deve usar o mesmo `user_id` da sessao para seguir ao bootstrap oficial da match
- `player_id` retornado confirma a identidade interna criada/associada no backend

### 4.3 `decline_patxanga_invite(...)`

#### Finalidade
Recusar convite direto sem entrar na match.

#### Entrada
- `p_invite_id uuid`
- `p_user_id uuid`

#### Saida operacional esperada
- `invite_id`
- `match_id`
- `invite_status = declined`

#### Regra de consumo
- frontend deve remover ou atualizar o convite da lista local apos sucesso

### 4.4 `list_patxanga_user_resumable_matches(...)`

#### Finalidade
Listar partidas nas quais o usuario ja entrou e ainda pode retomar.

#### Entrada
- `p_user_id uuid`

#### Saida operacional esperada
Lista JSON com, no minimo:
- `match_id`
- `match_status`
- `match_mode`
- `language`
- `turn_number`
- `current_turn_player_id`
- `winner_player_id`
- `created_at`
- `started_at`
- `finished_at`
- `player_id`
- `display_name`
- `score`
- `seat_index`
- `turn_order`
- `has_forfeited`
- `is_online`
- `last_ping_at`

#### Regra de consumo
- frontend usa essa RPC para a lista de partidas retomaveis
- partidas `finished` e `cancelled` nao devem aparecer
- jogadores com `has_forfeited = true` nao devem aparecer

### 4.5 `resume_patxanga_match(...)`

#### Finalidade
Reativar presenca online de um usuario dentro de uma match ja existente.

#### Entrada
- `p_match_id uuid`
- `p_user_id uuid`

#### Saida operacional esperada
Quando nao puder retomar:
- `can_resume = false`
- `reason`
- `match_status`, quando aplicavel

Quando puder retomar:
- `can_resume = true`
- `match_id`
- `player_id`
- `match_status`
- `current_turn_player_id`

#### Efeito operacional confirmado
- marca `patxanga_match_presence.is_online = true`
- atualiza `last_ping_at`
- nao distribui estado completo da partida
- nao altera gameplay

#### Regra de consumo
- frontend deve chamar bootstrap oficial da match logo depois de um `resume`
- `resume` serve para restabelecer presenca, nao para substituir reidratacao

### 4.6 `start_patxanga_match_from_lobby(...)`

#### Finalidade
Iniciar uma match a partir de um lobby elegivel e marcar o lobby como `started`.

#### Entrada
- `p_match_id uuid`
- `p_host_player_id uuid`

#### Saida operacional esperada
- `lobby_status = started`
- `match_result` com payload oficial de `start_patxanga_match(...)`

#### Regra de autoridade
- apenas o host do lobby pode iniciar
- frontend nao muda localmente `lobby_status` nem `match.status` antes da confirmacao oficial

### 4.7 `forfeit_patxanga_match(...)`

#### Finalidade
Registrar a desistência formal de um jogador.

#### Entrada
- `p_match_id uuid`
- `p_player_id uuid`

#### Saida operacional esperada
Ramo normal:
- `status = success`
- `match_status`
- `player_forfeited`
- `everyone_forfeited = false`
- `next_player` e `turn_number`, quando a desistência ocorre no turno atual

Ramo de cancelamento total:
- `status = cancelled`
- `match_status = cancelled`
- `everyone_forfeited = true`

#### Efeito operacional confirmado
- marca `has_forfeited = true`
- define `forfeited_at`
- coloca presenca offline
- registra replay de `player_forfeited`
- avanca turno quando o desistente era o jogador atual
- cancela a match quando todos desistiram

#### Regra de consumo
- frontend deve remover acoes de gameplay para jogador desistente
- depois de `forfeit`, o frontend deve reidratar estado oficial da match

## 5. Regras de integracao para o frontend

- listas de descoberta e retomada usam `user_id`
- acoes de match ativa usam `player_id`
- `resume_patxanga_match(...)` e ponte entre `user_id` e `player_id`, mas nao entrega bootstrap completo
- qualquer retorno mutavel deve ser seguido de reidratacao minima oficial
- o frontend nao deve inferir que `waiting` implica `current_turn_player_id`

## 6. Estado real validado localmente

Validado nesta rodada, no banco local Supabase:

- `sql/tests/test_resume_match.sql`
- `sql/tests/test_forfeit_single_player.sql`
- `sql/tests/test_forfeit_all_players.sql`
- `sql/tests/test_list_pending_invites.sql`
- `sql/tests/test_list_resumable_matches.sql`
- `sql/tests/test_start_match_from_lobby.sql`

## 7. Riscos e limites atuais

- as migrations executaveis `12` e `13` continuam agregadas em `supabase/migrations/`, mas agora sao sincronizadas a partir de `sql/` por `scripts/sync-supabase-entrypoint-migrations.sh`
- outras frentes SQL do projeto ainda mantem duplicacao estrutural semelhante fora deste recorte
- este documento consolida a superficie operacional, mas nao elimina a necessidade de manter a arvore modular `sql/` e a arvore executavel `supabase/migrations/` coerentes
- este documento nao substitui o contrato de bootstrap nem os contratos de gameplay

Fim do documento.

## FILE: docs/frontend-browser-validation-procedure-v1.0.md

# PATXANGA — Frontend Browser Validation Procedure
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE

Base normativa:
- snapshot master vigente
- continuity package vigente
- docs/15-local-ops-and-collaboration-protocol.md
- contratos curtos de frontend vigentes

## 1. Objetivo

Padronizar a validacao manual no browser para marcos de frontend do Patxanga,
especialmente quando houver mudanca de UX local, composicao visual da tela,
fluxo de preparo de jogada, rack ou votacao.

## 2. Regra central

Build verde nao substitui validacao no browser.

A ordem correta para marcos de frontend com impacto visual/interacional e:

1. aplicar patch
2. validar build
3. validar no browser
4. so depois decidir commit
5. push
6. logstep
7. avaliar se o kit de continuidade precisa ser atualizado

## 3. Ambiente padrao

- frontend local servido em `http://localhost:3001`
- repo local em `~/patxanga-bootstrap/patxanga-core`
- `project-log.md` e `logstep.sh` no diretorio pai `~/patxanga-bootstrap`

## 4. Confirmacao do frontend local

Antes de abrir o browser:

```bash
cd ~/patxanga-bootstrap/patxanga-core
lsof -nP -iTCP:3001 -sTCP:LISTEN
curl -I http://localhost:3001
```

### 4.1 Validacao automatizada opcional

Quando o objetivo for validar fluxos operacionais objetivos da pagina de teste,
Playwright pode ser usado como evidência de validacao de browser em ambiente
isolado.

Comando:

```bash
cd ~/patxanga-bootstrap/patxanga-core/frontend
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

Regras:
- a automacao sobe uma instancia isolada do frontend em `http://127.0.0.1:3101`
- a automacao usa `distDir` isolado (`.next-e2e`) para nao contaminar o artefato padrao de `next build`
- essa execucao nao deve substituir revisao visual humana quando o marco depender de julgamento visual fino
- quando o fluxo validado for objetivo e totalmente automatizado, o resultado do Playwright pode compor a validacao operacional registrada

## 5. Registro da rodada

Toda rodada deve registrar:
- `match_id`
- `user_id`
- objetivo da rodada

Registro recomendado:

```bash
cd ~/patxanga-bootstrap/patxanga-core
printf "\n### rodada browser %s\nmatch_id=COLE_AQUI\nuser_id=COLE_AQUI\nobjetivo=COLE_AQUI\n" "$(date "+%Y-%m-%d %H:%M:%S")" >> tmp/browser-validation-notes.txt
tail -n 20 tmp/browser-validation-notes.txt
```

## 6. Fluxo padrao de validacao

### 6.1 Abrir a aplicacao

```bash
open http://localhost:3001
```

Depois fazer hard refresh:
- `Cmd + Shift + R`

### 6.2 Carregar a partida

Na UI:
- se a pagina expuser a secao `Cenarios de validacao browser`, usar `Gerar cenarios de validacao` para obter `match_id`, `host_user_id` e `guest_user_id` reais sem SQL manual
- usar `Usar host` / `Usar guest` para preencher os campos principais rapidamente
- preencher `match_id`
- preencher `user_id`
- carregar/bootstrap da partida
- se a pagina expuser a secao `Alternar host e guest`, preencher `match_id`, `host_user_id` e `guest_user_id` uma unica vez e usar `Abrir como host` / `Abrir como guest` para alternar durante a rodada

### 6.3 Validar bootstrap

Confirmar:
- a tela carregou sem erro
- board apareceu quando aplicavel
- rack apareceu quando aplicavel
- estado da match esta legivel
- turno atual esta legivel

## 7. Ordem padrao de validacao por rodada

### Rodada A — bootstrap
Validar:
- carregamento da match
- estado renderizado
- board/rack sem crash

### Rodada B — UX local do rack
Validar, conforme o marco:
- selecao simples
- selecao multipla
- reordenacao
- reordenacao em grupo
- slots locais permanentes
- rascunho local nos slots
- vinculacao `slot -> tile real`
- associacao `slot -> casa do tabuleiro`
- cronometro visual
- destaque de turno

### Rodada C — preview e preparo local de jogada
Validar:
- selecao de pecas
- preview no board
- preview gerado a partir de composicao oficial por slot
- limpeza do preview
- estabilidade visual

### Rodada D — submit real
Validar:
- submit continua funcionando
- backend continua como fonte de verdade
- a composicao por slot gera payload oficial correto sem enviar metadata local
- UX local nao contaminou estado oficial

## 8. Checklist padrao

```text
match_id:
user_id:
objetivo:

resultado:
- status exibido:
- bootstrap carregou:
- board apareceu:
- rack apareceu:
- comportamento esperado:
- comportamento observado:
- submit continua ok:
- erro visual/console, se houver:
```

## 9. Regra de fechamento

Um marco de frontend so pode ser considerado pronto quando:
- o diff esta isolado
- o build passou
- a validacao no browser passou
- o resultado foi explicitamente descrito
- o versionamento foi executado
- o `project-log.md` foi atualizado via `logstep.sh`
- foi feita avaliacao formal sobre atualizar ou nao o kit de continuidade

## 10. Continuidade entre salas

Este procedimento deve ser repassado a novas salas quando:
- houver continuidade de UX/frontend
- houver rodada de validacao manual em browser
- houver necessidade de repetir testes com `match_id` e `user_id`

Fim do documento.

## FILE: docs/frontend-contract-screen-actions-v1.0.md

# PATXANGA — FRONTEND CONTRACT: Screen Actions
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE
Base normativa:
- Context Snapshot Master v1.6
- docs/12-submit-move-contract.md — Version 1.2 (Frozen)
- docs/frontend-contract-rpcs-v1.0.md
- docs/frontend-contract-match-states-v1.0.md

## 1. Objetivo

Este documento define, de forma curta e operacional, quais ações de UI
devem existir por tela e por estado oficial da match.

Ele não redefine engine, não substitui RPCs e não altera a autoridade do backend.

## 2. Regra central

- o frontend renderiza ações compatíveis com o estado oficial da match
- o frontend não promove transições sozinho
- o backend continua sendo a única fonte de verdade para turno, aplicação de jogada, votação e encerramento

## 3. Tela de lobby / estado `waiting`

### Ações permitidas
- entrar na partida, quando permitido
- visualizar participantes atuais
- iniciar partida, apenas se a regra de backend permitir essa ação ao usuário correto

### RPCs relacionadas
- `join_match()`
- `start_match()`

### Bloqueios obrigatórios
- não permitir submit de jogada
- não permitir `submit_patxanga_pass_turn()`
- não permitir `submit_patxanga_exchange_tiles()`
- não permitir fluxo de votação normal de gameplay

## 4. Tela de partida / estado `active`

### Ações permitidas ao jogador do turno
- montar jogada localmente por clique direto no board
- montar jogada pela superficie oficial de composicao por slots do rack
- enviar jogada por `submit_patxanga_move()`
- passar turno por `submit_patxanga_pass_turn()`
- trocar peças por `submit_patxanga_exchange_tiles()`

### Ações permitidas a jogadores fora do turno
- visualizar board, rack próprio e placar conforme permissões já existentes
- aguardar turno

### RPCs relacionadas
- `submit_patxanga_move()`
- `submit_patxanga_pass_turn()`
- `submit_patxanga_exchange_tiles()`

### Bloqueios obrigatórios
- não permitir ação de turno a jogador fora do turno
- não avançar turno localmente sem confirmação do backend
- não aplicar score local como estado oficial

## 5. Tela / fluxo de votação no estado `voting`

### Ações permitidas
- visualizar que existe jogada pendente
- votar via `submit_patxanga_vote()`, apenas quando o backend permitir

### RPC relacionada
- `submit_patxanga_vote()`

### Comportamento obrigatório
- não aplicar a jogada pendente ao board oficial
- não remover peças do rack oficial
- não avançar turno localmente
- aguardar resolução oficial do backend

### Bloqueios obrigatórios
- bloquear nova jogada normal
- bloquear `pass_turn`
- bloquear `exchange_tiles`

## 6. Tela de resultado / estado `finished`

### Ações permitidas
- visualizar resultado final
- visualizar vencedor oficial
- visualizar score final oficial

### Bloqueios obrigatórios
- não permitir nova jogada
- não permitir votação
- não permitir `pass_turn`
- não permitir `exchange_tiles`

## 7. Regras transversais de UI

- toda ação visual depende do `status` oficial da match
- toda ação de turno depende do `current_turn_player_id` oficial
- `player_id` continua sendo a identidade correta nas RPCs de gameplay
- `user_id` não substitui `player_id` no fluxo interno da partida
- `pending_vote` deve ser tratado como fluxo real de produto
- a composicao oficial por slots pode alimentar preview e submit
  sem mudar o formato da RPC oficial

## 8. Limites deste documento

- não substitui o contrato de RPCs
- não substitui o contrato de estados da match
- não redefine replay
- não redefine engine
- não substitui migrations

Fim do documento.

## FILE: docs/frontend-contract-match-states-v1.0.md

# PATXANGA — FRONTEND CONTRACT: Match States
Version: 1.0
Status: Draft operacional segmentado
Base normativa:
- Context Snapshot Master v1.6
- Submit Move Contract v1.2 (Frozen)
- frontend-contract-rpcs-v1.0.md

## 1. Objetivo

Este documento define o contrato operacional dos estados de partida
que o frontend deve respeitar ao consumir o backend do Patxanga.

Ele não redefine regras de engine, não substitui migrations
e não altera a autoridade do servidor.

## 2. Princípio central

O estado oficial da match é sempre definido pelo backend.

O frontend:
- renderiza o estado retornado
- adapta a UI ao estado oficial
- não promove transições por conta própria
- não assume sucesso local como mudança definitiva de estado

## 3. Estados oficiais mínimos

Os estados mínimos relevantes para o frontend nesta fase são:

- `waiting`
- `active`
- `voting`
- `finished`

## 4. Estado `waiting`

### Definição
Partida ainda não iniciada.

### Características
- lobby ativo
- jogadores ainda podem entrar, conforme regras do backend
- tabuleiro ainda não está em fluxo normal de jogo
- turno jogável ainda não deve ser tratado como ativo pelo frontend

### UI esperada
- exibir contexto de lobby
- exibir participantes atuais
- permitir ações compatíveis com pré-início
- não habilitar ações de gameplay normal

## 5. Estado `active`

### Definição
Partida em andamento, apta para jogadas normais.

### Características
- existe `current_turn_player_id`
- jogadas normais podem ser submetidas
- fluxo de turno está ativo
- board, rack e score devem ser tratados como oficiais

### UI esperada
- habilitar ação de jogar apenas ao jogador do turno
- habilitar `pass_turn` apenas ao jogador do turno
- habilitar `exchange_tiles` apenas ao jogador do turno
- manter demais jogadores em estado de espera
- refletir turno atual de forma explícita

## 6. Estado `voting`

### Definição
Partida temporariamente em fluxo de votação por jogada pendente.

### Características
- existe jogada em `pending_vote`
- board oficial ainda não foi alterado por essa jogada
- rack oficial ainda não foi alterado por essa jogada
- bag oficial ainda não foi alterado por essa jogada
- turno ainda não avançou
- a resolução depende de `submit_patxanga_vote()`

### UI esperada
- bloquear continuidade do fluxo normal de jogada
- destacar que a partida está aguardando votação
- permitir votação apenas a quem puder votar segundo o backend
- impedir que a UI trate a jogada pendente como aplicada ao board oficial
- impedir avanço local de turno

## 7. Estado `finished`

### Definição
Partida encerrada pelo backend.

### Características
- novas ações de gameplay não devem prosseguir
- `winner_player_id` deve ser tratado como resultado oficial
- `finished_at` deve ser tratado como timestamp oficial de encerramento
- score final já deve refletir ajustes finais aplicáveis

### UI esperada
- bloquear ações de gameplay
- exibir resultado final
- exibir vencedor oficial
- exibir score final oficial
- permitir apenas ações compatíveis com partida encerrada

## 8. Transições oficiais esperadas

### `waiting` → `active`
Ocorre quando a partida é iniciada com sucesso.

Trigger típico:
- `start_match()`

### `active` → `voting`
Ocorre quando `submit_patxanga_move()` encontra palavra não validada no dicionário
e entra no fluxo de `pending_vote`.

### `voting` → `active`
Ocorre quando `submit_patxanga_vote()` resolve a jogada pendente, seja como:
- `accepted`
- `rejected`

### `active` → `finished`
Ocorre quando o backend conclui fim de partida por critério válido.

### `voting` → `finished`
Não deve ser presumido pelo frontend como fluxo normal direto.
O frontend deve sempre respeitar o estado oficial devolvido pelo backend.

## 9. Regras de bloqueio de UI por estado

### Em `waiting`
- não permitir submit de jogada normal
- não permitir `pass_turn`
- não permitir `exchange_tiles`

### Em `active`
- permitir ações normais apenas ao jogador do turno
- não permitir que jogador fora do turno envie jogada como se estivesse autorizado

### Em `voting`
- bloquear nova jogada normal
- bloquear avanço local de turno
- bloquear aplicação visual definitiva da jogada pendente ao board oficial

### Em `finished`
- bloquear toda ação de gameplay
- não permitir nova jogada
- não permitir voto
- não permitir `pass_turn`
- não permitir `exchange_tiles`

## 10. Relação com estado local temporário

Estados locais de UX, como:
- seleção de peças
- drag-and-drop
- preview visual
- animações de turno
- score estimado

nunca substituem o estado oficial da match.

Se houver divergência entre frontend e backend:
- o frontend deve descartar o estado local temporário
- o backend prevalece

## 11. Limites deste documento

Este documento:
- não substitui o contrato de RPCs
- não redefine regras estratégicas
- não redefine payloads internos de replay
- não substitui migrations
- não altera o fluxo server-authoritative

## 12. Decisões congeladas refletidas aqui

- backend server-authoritative
- `player_id` como identidade de engine
- `pending_vote` como estado real do produto
- turno só muda por decisão oficial do backend
- fim de partida só existe quando o backend o define

Fim do documento.

## FILE: docs/frontend-contract-rpcs-v1.0.md

# PATXANGA — FRONTEND CONTRACT: RPCs
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE
Base normativa:
- Context Snapshot Master v1.6
- Submit Move Contract v1.2 (Frozen)
- docs/15-local-ops-and-collaboration-protocol.md

## 1. Objetivo

Este documento consolida, de forma curta e operacional, as RPCs expostas ao frontend
na fase atual do Patxanga.

Ele não redefine engine, não substitui migrations e não altera a autoridade do backend.

## 2. Regras centrais

- Backend é server-authoritative.
- Estado interno da partida usa `player_id`, nunca `user_id`.
- Frontend pode usar `user_id` para autenticação, perfil, lobby e associação visual.
- RPCs de gameplay devem usar `player_id` quando esse for o contrato oficial.
- `pending_vote` é fluxo real do produto e deve ser tratado como estado válido de operação.
- Frontend nunca deve tratar validação local como fonte de verdade.

## 3. RPCs expostas ao frontend

- `create_match()`
- `join_match()`
- `start_match()`
- `submit_patxanga_move()`
- `submit_patxanga_vote()`
- `submit_patxanga_pass_turn()`
- `submit_patxanga_exchange_tiles()`

## 4. Contrato operacional por RPC

### 4.1 `create_match()`

#### Finalidade
Criar uma nova partida ou lobby.

#### Parâmetros de entrada
Parâmetros definidos pela RPC oficial do backend.

#### Saída esperada
- `match_id`
- estado inicial da match
- dados mínimos necessários para o frontend entrar no fluxo de lobby

#### Estados relevantes para UI
- `waiting`

#### Regra de autoridade do backend
- o frontend não decide composição inicial da match
- o frontend apenas renderiza o estado retornado

### 4.2 `join_match()`

#### Finalidade
Ingressar em uma partida existente.

#### Parâmetros de entrada
Parâmetros definidos pela RPC oficial do backend.

#### Saída esperada
- `match_id`
- `player_id`, quando a RPC devolver a identidade interna do participante
- estado atualizado do lobby ou da partida

#### Estados relevantes para UI
- `waiting`
- `active`, se a partida já estiver iniciada e a entrada for permitida pelo backend

#### Regra de autoridade do backend
- frontend deve persistir `player_id` por match
- frontend nunca deve substituir `player_id` por `user_id` em RPC de gameplay

### 4.3 `start_match()`

#### Finalidade
Iniciar a partida e habilitar o fluxo normal de jogo.

#### Parâmetros de entrada
Parâmetros definidos pela RPC oficial do backend.

#### Saída esperada
- `board_state` inicial oficial
- `rack_state` oficial
- `current_turn_player_id`
- `status` da match

#### Estados relevantes para UI
- transição de `waiting` para `active`

#### Regra de autoridade do backend
- frontend não distribui rack
- frontend não escolhe jogador inicial

### 4.4 `submit_patxanga_move()`

#### Finalidade
Submeter uma jogada de colocação de peças.

#### Parâmetros de entrada
- `p_match_id uuid`
- `p_player_id uuid`
- `p_placed_tiles jsonb`

#### Observação crítica de contrato
- `p_placed_tiles` contém apenas as peças colocadas na jogada atual
- frontend não envia board completo
- frontend não envia score calculado
- frontend não envia validação lexical como fonte de verdade
- frontend pode derivar `p_placed_tiles` tanto da colocacao direta no board
  quanto da composicao oficial por slots do rack
- mesmo quando a origem for a composicao por slots,
  o payload continua enviando apenas:
  - `tile_id`
  - `row`
  - `col`
  - `declared_letter`, quando aplicavel

#### Saída esperada
Um dos ramos operacionais abaixo:
- jogada aceita
- jogada em `pending_vote`
- erro de validação

#### Estados relevantes para UI
- `active`
- `voting`, quando houver `pending_vote`

#### Regra de autoridade do backend
- backend valida posse, geometria, conexão, palavras e score
- backend decide se a jogada é aceita, pendente de voto ou rejeitada por erro
- frontend não avança turno por conta própria

#### Comportamento esperado na UI
- permitir montar a jogada por clique direto no board
  ou pela superficie oficial de composicao por slots
- se accepted: atualizar estado oficial retornado ou recarregado
- se `pending_vote`: não aplicar a jogada ao board oficial e abrir fluxo de votação
- se erro: manter estado oficial anterior

### 4.5 `submit_patxanga_vote()`

#### Finalidade
Resolver uma jogada em fluxo de `pending_vote`.

#### Parâmetros de entrada
Parâmetros definidos pela RPC oficial do backend para votação da jogada pendente.

#### Saída esperada
- resolução `accepted`
- resolução `rejected`
- estado oficial atualizado da match

#### Estados relevantes para UI
- `voting`
- retorno para `active` após resolução

#### Regra de autoridade do backend
- autor da jogada não vota
- uma rejeição pode encerrar como `rejected`
- aceitações suficientes resolvem como `accepted`
- frontend apenas reflete a resolução oficial

### 4.6 `submit_patxanga_pass_turn()`

#### Finalidade
Passar o turno sem jogar peças.

#### Parâmetros de entrada
Parâmetros definidos pela RPC oficial do backend para passar turno.

#### Saída esperada
- jogada de pass persistida
- turno avançado
- estado oficial atualizado
- eventual avaliação de fim de partida

#### Estados relevantes para UI
- `active`
- eventual `finished`, se o backend encerrar a match

#### Regra de autoridade do backend
- frontend só oferece a ação ao jogador do turno
- frontend não muda turno localmente sem confirmação oficial

### 4.7 `submit_patxanga_exchange_tiles()`

#### Finalidade
Trocar peças do rack com o bag.

#### Parâmetros de entrada
- `match_id`
- `player_id`
- conjunto de `tile_id` selecionados para troca, conforme contrato oficial da RPC

#### Saída esperada
- `rack_state` atualizado
- `bag_state` atualizado, quando aplicável ao retorno consumido pelo frontend
- turno avançado
- estado oficial atualizado

#### Estados relevantes para UI
- `active`
- eventual `finished`, se o backend encerrar a match depois da avaliação oficial

#### Regra de autoridade do backend
- backend valida posse das peças e executa a troca
- frontend não remove peças definitivamente antes da confirmação oficial

## 5. Regras transversais para UI

- renderizar board a partir de `board_state` oficial
- renderizar rack a partir de `rack_state` oficial
- tratar scores persistidos como oficiais
- tratar `current_turn_player_id` como fonte oficial de turno
- bloquear ações incompatíveis com `status` da match

## 6. Limites deste documento

- não redefine arquitetura
- não substitui snapshot master
- não substitui submit move contract
- não substitui migrations
- não detalha replay interno

Fim do documento.

## FILE: docs/frontend-rack-composition-ux-v1.0.md

# PATXANGA — FRONTEND CONTRACT: Rack Composition UX
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE

Base normativa:
- Context Snapshot Master vigente
- docs/frontend-contract-match-states-v1.0.md
- docs/frontend-contract-screen-actions-v1.0.md
- docs/frontend-contract-rpcs-v1.0.md
- docs/frontend-browser-validation-procedure-v1.0.md

## 1. Objetivo

Definir o contrato de UX da composicao do rack/deck do jogador
na fase atual do frontend do Patxanga.

Este documento fixa como a tela jogavel pode usar slots locais permanentes
como superficie oficial de preparo de jogada
sem alterar a autoridade do backend
nem o formato oficial de `submit_patxanga_move(...)`.

## 2. Regra central

A composicao do rack continua sendo orquestrada no frontend.

Mas, nesta fase, ela deixa de ser apenas um lembrete visual.

Leitura correta:
- o backend continua server-authoritative
- `board_state`, `rack_state`, `status` e validacao de jogada continuam oficiais
- o frontend pode usar uma superficie oficial de composicao local
  para derivar `p_placed_tiles`
- o payload enviado ao backend continua contendo apenas pecas reais
  colocadas na jogada atual

Leitura incorreta:
- tratar slot local como entidade persistida no backend
- enviar slot, associacao ou metadata local como parte da RPC
- substituir a validacao do backend por validacao local

## 3. Fonte de verdade

Continuam como fonte oficial:
- `board_state`
- `rack_state`
- `current_turn_player_id`
- `status` da match
- validacao de jogada pelo backend

A superficie de composicao do rack:
- nao e estado persistido da partida
- nao muda a autoridade do backend
- pode, sim, ser a origem oficial do `p_placed_tiles`
  antes do submit real

## 4. Escopo deste contrato

Este contrato cobre:
- reorganizacao local do rack
- selecao local de pecas
- grupos locais de pecas
- slots locais permanentes
- vinculacao oficial `slot -> tile real`
- associacao `slot -> casa do tabuleiro`
- uso condicional da letra digitada no slot como `declared_letter`
- derivacao de `placedTilesPreview` a partir dessa composicao

Este contrato nao redefine:
- engine
- RPC de backend
- validacao lexical
- regras do board
- replay
- ordem oficial de turno

## 5. Conceitos operacionais

### 5.1 Rack oficial
Conjunto de pecas reais retornadas pelo backend em `rack_state`.

### 5.2 Superficie oficial de composicao
Camada de frontend onde o jogador pode organizar visualmente:
- pecas reais do rack oficial
- slots locais permanentes

Essa superficie pode gerar jogada real,
desde que o frontend compile a composicao
para o payload oficial de `submit_patxanga_move(...)`.

### 5.3 Slot local permanente
Espaco visual local, sempre disponivel na superficie de composicao,
usado para dar folga de montagem e ancorar uma jogada.

O slot local permanente:
- nao existe no backend
- nao entra no payload como slot
- nao altera `rack_state` oficial
- nao altera `board_state` oficial por conta propria

### 5.4 Vinculacao oficial `slot -> tile real`
Vinculo local, explicito e reversivel entre um slot permanente
e uma peca real do rack oficial.

Quando esse vinculo existe:
- a peca continua sendo a entidade oficial enviada ao backend
- o slot passa a representar essa peca na composicao do frontend
- a peca nao pode aparecer ao mesmo tempo em outro preparo oficial da mesma jogada

### 5.5 Associacao `slot -> casa do tabuleiro`
Associacao local, explicita e reversivel entre um slot
e uma casa do tabuleiro.

Essa associacao:
- nao reserva a casa
- nao reserva a letra do board
- nao altera o backend sozinha
- so vira parte da jogada oficial quando o slot tambem tiver uma peca real vinculada

### 5.6 Letra digitada no slot
A letra digitada no slot continua podendo ser apenas rascunho visual.

Mas, quando estas condicoes forem verdadeiras ao mesmo tempo:
- o slot tem uma peca real vinculada
- a peca vinculada exige `declared_letter`
- o slot esta associado a uma casa do tabuleiro

entao a letra do slot passa a ser usada como `declared_letter`
daquela peca na geracao de `p_placed_tiles`.

## 6. Comportamentos permitidos

O frontend pode permitir:
- reordenar pecas reais localmente
- selecionar uma ou mais pecas localmente
- mover grupos locais dentro da superficie do rack
- usar slots locais permanentes como apoio de composicao
- vincular uma peca real a um slot
- desfazer ou refazer esse vinculo
- associar um slot ativo a uma casa do tabuleiro
- remover ou refazer essa associacao
- continuar oferecendo o fluxo direto de selecao + clique no board

## 7. Regra de composicao com slots permanentes

A UX desejada deve oferecer slots locais permanentes de composicao,
sempre disponiveis no rack local do jogador.

Leitura correta:
- o jogador organiza pecas reais no rack
- o jogador pode vincular uma peca real a um slot
- o jogador pode associar esse slot a uma casa do tabuleiro
- se houver peca real + associacao valida,
  isso entra no preparo oficial da jogada
- a composicao inteira continua movel dentro do rack local

Leitura incorreta:
- tratar o slot vazio como jogada oficial
- enviar o `slotId` ao backend
- tratar associacao sem peca real como jogada oficial
- tratar a associacao local como reserva oficial do board

## 8. Relacao com o tabuleiro

A composicao por slots pode refletir a intencao real do jogador
de colocar uma peca em uma casa especifica.

Mas essa intencao:
- continua local ate o submit
- nao bloqueia outros jogadores
- nao cria prioridade sobre a casa
- pode ficar invalida antes do submit se o board oficial mudar

Portanto:
- o frontend pode mostrar badges, preview e estado de preparo
- o backend continua validando a jogada real

## 9. Relacao com submit de jogada

O submit oficial continua obedecendo o contrato vigente de `submit_patxanga_move(...)`.

Logo:
- apenas pecas reais entram em `p_placed_tiles`
- `slotId` nao entra em `p_placed_tiles`
- associacao local nao entra como estrutura propria em `p_placed_tiles`
- a composicao por slot apenas ajuda o frontend a derivar:
  - `tile_id`
  - `row`
  - `col`
  - `declared_letter`, quando aplicavel

Leitura correta:
- slots nao sao enviados
- pecas vinculadas aos slots podem ser enviadas
- a letra do slot pode virar `declared_letter`
  se a peca vinculada exigir isso

## 10. Relacao com o estado local temporario

A composicao do rack continua sendo estado temporario de frontend.

Ela pode ser descartada quando houver:
- reload oficial da partida
- alteracao oficial de `rack_state`
- submit aceito
- troca de pecas
- nova distribuicao de pecas
- qualquer divergencia com o backend que exija reidratacao

## 11. Relacao com drag and drop para o board

Este contrato nao define drag and drop do rack para o tabuleiro como fluxo oficial.

Ate nova definicao:
- drag no rack serve para reorganizacao local
- posicionamento no board continua podendo usar fluxo de selecao + clique
- a composicao por slot usa clique e associacao explicita

## 12. Proibicoes

A composicao do rack nao pode:
- alterar `rack_state` oficial
- alterar `board_state` oficial sem RPC
- reservar letra do tabuleiro
- reservar casa do tabuleiro
- alterar validacao da engine
- enviar slot local como entidade de backend
- substituir validacao oficial do wildcard no backend
- alterar score
- alterar turno

## 13. Leitura correta desta fase

Nesta fase do projeto:
- o rack evoluiu de mesa local de composicao
  para superficie oficial de preparo de jogada
- o backend continua server-authoritative
- a composicao por slot ja pode alimentar preview e submit
- o formato do payload oficial nao mudou

## 14. Criterio de saida desta linha de UX

Esta frente pode ser considerada coerente quando:
- o jogador conseguir reorganizar pecas livremente no rack local
- o jogador conseguir usar slots locais permanentes
- o jogador conseguir vincular pecas reais a slots
- o jogador conseguir associar slots ao tabuleiro
- `placedTilesPreview` refletir essa composicao oficial
- submit continuar compativel com o backend atual
- Playwright e build confirmarem o fluxo objetivo

## 15. Limites deste documento

Este documento:
- nao redefine engine
- nao redefine RPCs
- nao redefine o formato do payload oficial
- nao redefine replay
- nao altera o modelo server-authoritative

Fim do documento.

## FILE: docs/frontend-rack-composition-implementation-plan-v1.0.md

# PATXANGA — FRONTEND: Rack Composition Implementation Plan
Version: 1.0
Status: ACTIVE IMPLEMENTED BASELINE

Base normativa:
- docs/frontend-rack-composition-ux-v1.0.md
- docs/frontend-contract-screen-actions-v1.0.md
- docs/frontend-contract-rpcs-v1.0.md
- docs/frontend-browser-validation-procedure-v1.0.md

## 1. Objetivo

Documentar a implementacao atual da composicao do rack
e congelar a leitura correta da superficie que passou a ser oficial
para preparar jogadas no frontend.

## 2. Regra central

A implementacao continua frontend-led,
mas agora ela pode gerar a jogada oficial
sem mudar o formato da RPC de backend.

Leitura correta:
- nao houve mudanca de engine
- nao houve mudanca do formato de `submit_patxanga_move(...)`
- o frontend passou a compilar a composicao do rack
  em `p_placed_tiles`

## 3. Resultado efetivamente entregue

O jogador ja consegue:
- reorganizar pecas reais no rack local
- usar slots locais permanentes de composicao
- mover pecas livremente entre pecas e slots na ordem visual do rack
- escrever letra em slots
- vincular uma peca real a um slot
- associar o slot a uma casa do tabuleiro
- ver `placedTilesPreview` e preview do backend refletindo essa composicao
- limpar essa composicao oficial sem afetar o backend

## 4. Arquivos principais afetados

### 4.1 `frontend/pages/index.tsx`
Responsabilidades atuais:
- manter estado local da superficie de composicao do rack
- coordenar selecao de pecas reais
- coordenar slots locais permanentes
- coordenar drafts locais de letras nos slots
- coordenar vinculacao `slot -> tile real`
- coordenar associacoes `slot -> casa do tabuleiro`
- compilar `placedTilesPreview` a partir de:
  - colocacao direta no board
  - composicao oficial por slot

### 4.2 `frontend/components/RackSection.tsx`
Responsabilidades atuais:
- renderizar pecas reais e slots locais na mesma superficie visual
- expor visualmente quando um slot tem peca vinculada
- expor visualmente quando uma peca esta vinculada a um slot
- permitir limpar a vinculacao oficial do slot
- manter legibilidade entre:
  - peca real
  - slot
  - associacao de slot
  - peca oficial vinculada ao slot

### 4.3 `frontend/components/BoardSection.tsx`
Responsabilidades atuais:
- renderizar preview oriundo da composicao oficial por slot
- diferenciar visualmente preview direto e preview por slot
- manter badges de slot associados no board

### 4.4 `frontend/components/GamePlayScreen.tsx`
Responsabilidades atuais:
- orquestrar a tela jogavel
- repassar a composicao oficial para rack e board
- refletir o contador real de pecas em preparo

## 5. Estrutura de estado implementada

### 5.1 Ordem local do rack
- itens heterogeneos
- cada item pode ser:
  - peca real
  - slot local permanente

### 5.2 Estado adicional ativo
- drafts por slot
- associacao `slot -> casa`
- vinculacao `slot -> tile real`
- selecao atual de pecas reais
- ordem local da superficie
- colocacao direta no board, mantida por compatibilidade operacional

### 5.3 Derivacao oficial
`placedTilesPreview` passa a ser derivado de duas origens oficiais de frontend:

1. colocacao direta de peca no board
2. composicao por slot com:
   - peca real vinculada
   - slot associado ao tabuleiro

## 6. Invariantes obrigatorios

- peca real continua identificada por `tileId`
- slot local continua sem existencia no backend
- o payload enviado continua contendo apenas pecas reais
- `slotId` nunca entra em `p_placed_tiles`
- associacao de slot nunca entra como estrutura propria da RPC
- `declared_letter` pode vir do slot quando:
  - houver peca especial vinculada
  - houver associacao ativa no tabuleiro
- reidratacao oficial pode descartar estado local temporario

## 7. Etapas implementadas

### Etapa 1 — normalizar a superficie local do rack
Status:
- implementada

Saida entregue:
- rack aceita pecas reais e slots locais na mesma ordem visual

### Etapa 2 — slots locais permanentes de composicao
Status:
- implementada

Saida entregue:
- slots locais permanentes sempre disponiveis no rack

### Etapa 3 — reordenacao fluida com slots e pecas
Status:
- implementada

Saida entregue:
- grupo de pecas continua movel
- slots continuam moviveis

### Etapa 4 — letra no slot
Status:
- implementada

Saida entregue:
- slot aceita letra local
- quando aplicavel, essa letra pode virar `declared_letter`

### Etapa 5 — vinculacao oficial `slot -> tile real`
Status:
- implementada

Saida entregue:
- clique em peca + clique em slot vincula a peca ao slot
- clique em peca com slot ativo tambem vincula
- limpar vinculacao desfaz a composicao oficial daquele slot

### Etapa 6 — associacao `slot -> casa do tabuleiro`
Status:
- implementada

Saida entregue:
- slot ativo pode ser associado a uma casa do tabuleiro
- badges no board e no rack refletem essa composicao

### Etapa 7 — compilacao oficial para preview e submit
Status:
- implementada

Saida entregue:
- `placedTilesPreview` agora reflete a composicao por slot
- preview do backend responde a essa nova superficie
- submit continua usando a mesma RPC oficial

## 8. Fora de escopo atual

Nao entra nesta baseline:
- drag rack -> board como fluxo oficial
- reserva de letra do tabuleiro
- reserva de casa do tabuleiro
- alteracao de engine
- alteracao de backend
- mudanca do formato de `submit_patxanga_move(...)`

## 9. Riscos que continuam relevantes

- misturar slot local vazio com jogada oficial
- deixar a mesma peca aparecer em mais de uma origem de composicao
- regredir selecao multipla ou reordenacao em grupo
- regredir pending_vote
- quebrar o fluxo direto de clique no board por causa da composicao por slot

## 10. Checklist de validacao atual

### Build
- `cd frontend && npm run build`

### Browser automatizado
- `cd frontend && npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium`

Coberturas minimas atuais:
- convites/lobby/retomada/desistencia
- associacao local de slot sem contaminar gameplay
- composicao oficial por slot alimentando `placedTilesPreview`

## 11. Proximos passos produtivos

Depois desta baseline, os proximos passos com melhor retorno sao:

1. validar submit real e preview real com cenarios mais ricos da composicao por slot
2. decidir se o fluxo direto de peca -> board continua coexistindo
   ou se a tela jogavel converge para um unico fluxo oficial
3. ampliar Playwright para limpar, trocar e recompor slots em uma mesma jogada
4. revisar UX de destaque para slot especial sem `declared_letter`

## 12. Fechamento correto desta frente

Esta linha de implementacao so deve ser considerada fechada quando:
- build passar
- Playwright passar
- a documentacao normativa estiver sincronizada
- commit/push/logstep forem executados
- o kit de continuidade for atualizado

## 13. Limites deste plano

Este plano:
- nao substitui o contrato de UX
- nao redefine engine
- nao redefine backend
- nao redefine a RPC oficial
- nao redefine o fluxo final de produto alem da baseline atual

Fim do documento.

## FILE: docs/como-jogar-patxanga.md

# PATXANGA - COMO JOGAR

Versao: 0.1
Status: Manual inicial para jogador
Base: regras e contratos tecnicos existentes no projeto

---

## 1. Objetivo do jogo

Patxanga e um jogo competitivo de formacao de palavras em portugues.

Cada jogador tenta somar mais pontos criando palavras no tabuleiro, usando as pecas do proprio rack e aproveitando multiplicadores de letras e palavras.

O backend e sempre a autoridade final:

- valida se a jogada e permitida
- valida posse das pecas
- valida geometria da palavra
- valida palavras no dicionario
- calcula a pontuacao
- atualiza placar, rack, bolsa e turno

---

## 2. Componentes principais

### Tabuleiro

- 15 x 15 casas.
- Coordenadas de 1 a 15.
- A primeira jogada deve passar pelo centro: linha 8, coluna 8.
- O centro e uma casa de palavra dupla.

### Pecas

A bolsa oficial tem 110 pecas:

- 103 letras comuns.
- 7 pecas especiais.

As letras comuns tem valores proprios. Nao existe peca "C cedilha"; quando necessario, usa-se C.

### Rack do jogador

- Cada jogador joga com um rack de ate 7 pecas.
- Apos uma jogada aceita, o backend remove as pecas usadas e compra novas pecas da bolsa para recompor o rack ate 7, quando houver pecas disponiveis.

---

## 3. Pecas especiais

As pecas especiais podem representar qualquer letra, mas exigem declaracao da letra usada naquela jogada.

| Peca | Quantidade | Pontos | Estado no jogo |
|------|------------|--------|----------------|
| Coringa | 2 | 0 | Implementado como peca sem valor que representa uma letra declarada |
| Pular Turno | 4 | 0 | Existe na distribuicao e exige letra declarada; o efeito de escolher alvo/pular turno ainda nao esta consolidado na UI atual |
| Patxanga Real | 1 | 0 | Implementada como peca especial que representa uma letra declarada e ativa multiplicador especial de pontuacao |

Regra pratica:

- Se a peca especial nao tem letra fixa, o jogador deve declarar qual letra ela representa.
- Sem essa declaracao, a jogada nao deve ser considerada completa.

---

## 4. Multiplicadores do tabuleiro

As casas podem ter estes tipos:

| Sigla | Significado |
|-------|-------------|
| NM | Normal |
| LD | Letra dupla |
| LT | Letra tripla |
| PD | Palavra dupla |
| PT | Palavra tripla |

Regras:

- Multiplicadores so valem quando uma peca e colocada naquela casa pela primeira vez.
- Pecas que ja estavam no tabuleiro contam para formar palavras, mas nao reaplicam multiplicadores antigos.
- Multiplicadores de letra afetam apenas a peca colocada naquela casa.
- Multiplicadores de palavra afetam a palavra correspondente.

---

## 5. Fluxo de uma partida

### 5.1 Lobby

Antes de jogar:

1. Uma partida e criada.
2. Jogadores entram na partida.
3. A partida e iniciada.
4. O backend distribui rack, bolsa, tabuleiro e define o primeiro turno.

### 5.2 Turno ativo

Quando for seu turno, voce pode:

- montar uma palavra com pecas do seu rack
- enviar a jogada
- passar o turno
- trocar pecas
- desistir formalmente da partida

Jogadores fora do turno podem acompanhar o tabuleiro, o placar e o proprio rack, mas nao podem executar acao de turno.

### 5.3 Votacao

Se uma palavra enviada nao for reconhecida pelo dicionario:

1. A partida entra em estado de votacao.
2. A jogada fica pendente.
3. O tabuleiro oficial ainda nao muda.
4. O turno ainda nao avanca.
5. Jogadores elegiveis podem votar.
6. A resolucao oficial do backend decide se a jogada e aceita ou rejeitada.

Na regra de produto documentada:

- nao votar conta como aceitar
- empate rejeita
- o autor da jogada nao vota

Na implementacao atual validada:

- uma rejeicao pode resolver a jogada como rejeitada
- aprovacoes suficientes resolvem a jogada como aceita

---

## 6. Como fazer uma jogada

Uma jogada de palavra deve respeitar estas regras:

1. Deve ser o turno do jogador.
2. Todas as pecas enviadas devem pertencer ao rack do jogador.
3. As coordenadas devem estar dentro do tabuleiro.
4. As casas escolhidas devem estar vazias.
5. As pecas novas devem estar alinhadas na mesma linha ou coluna.
6. A palavra principal nao pode ter lacunas.
7. A primeira jogada deve passar pelo centro.
8. Depois da primeira jogada, a nova jogada deve se conectar ao tabuleiro existente.
9. A palavra principal deve ter pelo menos 2 letras.
10. Todas as palavras formadas, principal e secundarias, passam por validacao.

O frontend pode ajudar a montar a jogada com:

- clique direto no tabuleiro
- selecao de pecas do rack
- slots locais de composicao
- preview de jogada e score estimado

Mas a jogada oficial enviada ao backend contem apenas:

- id da peca
- linha
- coluna
- letra declarada, quando aplicavel

---

## 7. Palavras principais e secundarias

Cada jogada gera:

- uma palavra principal, formada na direcao da jogada
- possiveis palavras secundarias, formadas por cruzamentos

Todas as palavras contam para validacao.

Se todas forem reconhecidas, a jogada pode ser aceita automaticamente.

Se qualquer palavra nao for reconhecida, a jogada entra em votacao.

---

## 8. Pontuacao

A pontuacao e calculada pelo backend.

Regra geral:

1. Soma-se o valor das letras da palavra principal.
2. Aplicam-se multiplicadores de letra das casas novas.
3. Aplicam-se multiplicadores de palavra das casas novas.
4. Calculam-se tambem palavras secundarias formadas por cruzamentos.
5. Se o jogador usou 7 pecas na jogada, recebe bonus de 20 pontos.
6. Se Patxanga Real foi usada, o backend aplica o multiplicador especial sobre a parte principal da pontuacao conforme a implementacao atual.

Observacao importante:

- O score mostrado em preview e apenas estimativa.
- O placar oficial e sempre o retornado/persistido pelo backend.

---

## 9. Passar turno

O jogador pode passar sem colocar pecas.

Ao passar:

- nenhuma peca e removida
- o tabuleiro nao muda
- a jogada de passe e registrada
- o turno avanca
- o jogador fica marcado como tendo passado naquele ciclo

Se a bolsa estiver vazia e todos os jogadores passarem no ciclo, a partida pode terminar.

---

## 10. Trocar pecas

O jogador pode trocar uma ou mais pecas do rack.

Ao trocar:

- as pecas escolhidas voltam para a bolsa
- o backend compra a mesma quantidade de novas pecas
- o rack e atualizado
- a troca e registrada como jogada
- o turno avanca

Nao e permitido trocar zero pecas.

---

## 11. Desistencia

O jogador pode desistir formalmente da partida.

Ao desistir:

- o jogador fica marcado como desistente
- se era o turno dele, o backend avanca o turno
- se todos desistirem, a partida e cancelada

---

## 12. Fim de partida

A partida pode terminar quando a bolsa esta vazia e acontece pelo menos uma destas condicoes:

- algum jogador fica sem pecas no rack
- todos os jogadores passam no ciclo

Quando a partida termina:

1. Cada jogador perde pontos iguais ao valor das pecas restantes no rack.
2. Se alguem esvaziou o rack, esse jogador recebe como bonus a soma das penalidades dos outros racks.
3. Vence quem tiver o maior score final.
4. Em empate simples na implementacao atual, vence quem tiver menor ordem de turno.

---

## 13. Estados da partida

| Estado | Significado |
|--------|-------------|
| waiting | Partida criada, ainda nao iniciada |
| active | Partida em andamento, jogadas normais liberadas |
| voting | Existe uma jogada pendente de votacao |
| finished | Partida encerrada |
| cancelled | Partida cancelada |

O frontend deve sempre respeitar o estado oficial vindo do backend.

---

## 14. O que ja esta jogavel hoje

De acordo com a implementacao atual do projeto:

- partida sincrona humano contra humano
- lobby basico, convite, aceite, recusa e retomada
- rack oficial do jogador
- montagem de jogada no tabuleiro
- composicao local por slots no rack
- preview de jogada
- submit real de jogada
- pending vote
- voto de aceitacao/rejeicao
- passar turno
- trocar pecas
- desistencia
- fim de partida por bolsa vazia e rack vazio ou todos passarem

---

## 15. O que ainda nao e um modo completo de jogo

Ainda nao ha modo humano contra bot implementado de ponta a ponta.

O banco ja consegue marcar um jogador como bot, mas ainda falta:

- interface para criar partida humano contra bot
- engine que escolha jogadas do bot
- Edge Function ou rotina equivalente para executar turno de bot
- testes especificos de bot jogando

Tambem ainda falta um refinamento de produto para o efeito completo da peca Pular Turno na UI atual.

---

## 16. Referencias tecnicas

Documentos-base:

- `docs/01-product-vision.md`
- `docs/10-letter-distribution.md`
- `docs/11-board-layout.md`
- `docs/12-submit-move-contract.md`
- `docs/frontend-contract-rpcs-v1.0.md`
- `docs/frontend-contract-screen-actions-v1.0.md`
- `docs/frontend-contract-match-states-v1.0.md`
- `docs/frontend-rack-composition-ux-v1.0.md`

Arquivos SQL relevantes:

- `sql/rpc/submit_move.sql`
- `sql/rpc/calculate_score.sql`
- `sql/rpc/submit_vote.sql`
- `sql/rpc/pass_turn.sql`
- `sql/rpc/exchange_tiles.sql`
- `sql/rpc/evaluate_match_end.sql`
- `sql/rpc/forfeit_match.sql`

## FILE: docs/lexical-policy-v1.0.md

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

## FILE: docs/dictionary-import-pipeline-v1.0.md

# PATXANGA - Dictionary Import Pipeline
Version: 1.0
Status: ACTIVE CONTRACT

## Objective

Importar dicionarios amplos de forma auditavel, sem editar manualmente dumps
gigantes e sem acoplar a engine a uma fonte lexical ainda nao verificada.

O jogo continua consultando apenas `validate_word(p_word, p_language)`. A
pipeline de importacao e uma camada administrativa para popular e atualizar
`patxanga_dictionary` com metadados de fonte, versao, licenca e lote.

A politica de produto para o que entra automaticamente no dicionario esta em
`docs/lexical-policy-v1.0.md`.

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

## Fonte candidata validada tecnicamente: LibreOffice Hunspell pt-BR

Fonte candidata para a primeira importacao controlada:

- familia: LibreOffice dictionaries, Hunspell `pt_BR`
- arquivo bruto: `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/pt_BR.dic`
- README/licenca: `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/README_pt_BR.txt`
- pasta upstream: `https://github.com/LibreOffice/dictionaries/tree/master/pt_BR`
- licenca declarada no README: `LGPLv3/MPL`
- commit upstream verificado: `93d537dc6afb0130de3da75d42c070ac267db957`
- SHA-256 de `pt_BR.dic`: `a38bfb26b68ece2834e79fe83e48d5792652970ace12db89d1b9674bf9933183`
- SHA-256 de `README_pt_BR.txt`: `9974ce691fdc1fe731717d7a2dc668244405fdc2bf9bf3367eb9b29e85177c88`
- contagem declarada no `.dic`: `312368`

Status: candidata para validacao tecnica local. Esta anotacao nao substitui
aprovacao humana/legal para uso em produto distribuido.

O extrator local gera uma amostra pequena e reprodutivel a partir do `.dic`,
sem versionar o dump completo. A primeira politica e conservadora:

- tamanho entre 3 e 15 caracteres
- somente letras portuguesas suportadas pela normalizacao atual
- sem hifen, ponto, digito, sigla ou abreviacao
- somente entradas originalmente em minusculas
- deduplicacao pelo mesmo criterio aproximado de normalizacao do banco

Preparar a amostra e o SQL sem executar:

```bash
zsh scripts/import-libreoffice-pt-br-sample.sh --limit 100
```

Preparar e executar contra o Supabase local:

```bash
zsh scripts/import-libreoffice-pt-br-sample.sh --limit 100 --execute
```

Se os arquivos ja estiverem baixados em
`/private/tmp/patxanga-dictionary-sources/libreoffice-pt-br`, a execucao pode
reaproveita-los:

```bash
zsh scripts/import-libreoffice-pt-br-sample.sh --skip-download --limit 100
```

O `source` usado pela amostra e `libreoffice_hunspell_pt_br_sample`. Nao usar
`p_deactivate_missing := true` nessa amostra, porque ela nao representa uma
substituicao completa da fonte.

Resultado da primeira validacao local:

- `--limit 25` gerou 25 entradas validas a partir do `.dic`
- primeira execucao inseriu 25 linhas no dicionario local
- segunda execucao com os mesmos metadados inseriu 0 e atualizou 25, confirmando
  idempotencia da pipeline para essa fonte/amostra
- o banco local foi resetado depois da validacao para voltar a baseline limpa

## Fonte candidata validada tecnicamente: LibreOffice Hunspell pt-PT

Fonte candidata para a primeira importacao controlada `pt-PT`:

- familia: LibreOffice dictionaries, Hunspell `pt_PT`
- arquivo bruto: `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/pt_PT.dic`
- README/licenca: `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/README_pt_PT.txt`
- LICENSES: `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/LICENSES.txt`
- pasta upstream: `https://github.com/LibreOffice/dictionaries/tree/master/pt_PT`
- licenca declarada no README: `GPLv2/LGPLv2.1/MPLv1.1`
- observacao de licenca: `LICENSES.txt` tambem registra `GPL/BSD` para o corrector ortografico
- commit upstream verificado: `93d537dc6afb0130de3da75d42c070ac267db957`
- SHA-256 de `pt_PT.dic`: `e29ba2d7aa8a2ad43e9cb46ac6473064b661545c87002aea90e18899d98d3cc9`
- SHA-256 de `README_pt_PT.txt`: `36de7d88a406a4947bf646a64145f00827566808988632e3df969aa95776060c`
- SHA-256 de `LICENSES.txt`: `d2c1cfe2e2dd81c651aec3fda5d1b4b4e7679b9e04f8cdc37586e521837384d1`
- contagem declarada no `.dic`: `44476`

Status: candidata para validacao tecnica local. A divergencia/ambiguidade entre
README e `LICENSES.txt` exige revisao humana/legal antes de qualquer decisao de
produto ou distribuicao.

Preparar a amostra e o SQL sem executar:

```bash
zsh scripts/import-libreoffice-pt-pt-sample.sh --limit 100
```

Preparar e executar contra o Supabase local:

```bash
zsh scripts/import-libreoffice-pt-pt-sample.sh --limit 100 --execute
```

Se os arquivos ja estiverem baixados em
`/private/tmp/patxanga-dictionary-sources/libreoffice-pt-pt`, a execucao pode
reaproveita-los:

```bash
zsh scripts/import-libreoffice-pt-pt-sample.sh --skip-download --limit 100
```

O `source` usado pela amostra e `libreoffice_hunspell_pt_pt_sample`. Nao usar
`p_deactivate_missing := true` nessa amostra.

Resultado da primeira validacao local:

- `--limit 25` gerou 25 entradas validas a partir do `.dic`
- primeira execucao inseriu 25 linhas no dicionario local
- segunda execucao com os mesmos metadados inseriu 0 e atualizou 25, confirmando
  idempotencia da pipeline para essa fonte/amostra

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

## Conversor CSV

O conversor local `scripts/prepare-dictionary-import.py` transforma um CSV com
cabecalho em payload JSON ou em SQL pronto para execucao administrativa.

Formato minimo do CSV:

```csv
word,is_active
CASA,true
árvore,sim
PEIXE,false
```

Gerar apenas o payload JSON:

```bash
python3 scripts/prepare-dictionary-import.py fonte.csv --pretty > payload.json
```

Gerar SQL completo para a RPC:

```bash
python3 scripts/prepare-dictionary-import.py fonte.csv \
  --mode sql \
  --language pt-BR \
  --source pt_br_licensed_words \
  --license-name LICENSE-NAME \
  --source-version 2026-06-21 \
  --license-url https://example.test/license \
  --source-url https://example.test/source \
  --imported-by manual-maintenance \
  --metadata-json '{"sha256":"preencher-com-hash-do-arquivo"}' \
  > import_dictionary.sql
```

O conversor preserva linhas com palavra vazia para que a RPC registre
`skipped_count` no lote. Duplicatas tambem sao preservadas no payload; a RPC faz
a deduplicacao canonica usando a normalizacao do banco.

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
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
zsh scripts/import-libreoffice-pt-br-sample.sh --skip-download --limit 25 --execute
zsh scripts/import-libreoffice-pt-pt-sample.sh --skip-download --limit 25 --execute
supabase db reset
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_import_pipeline.sql
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_imported_words_engine_path.sql
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
```

## FILE: docs/implementation-roadmap.md

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
| Dicionario | Contrato por idioma/fonte/ativo consolidado; seeds pequenos para QA; fontes LibreOffice Hunspell pt-BR e pt-PT validadas como candidatas tecnicas de amostra |
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
- politica lexical v1 documentada em `docs/lexical-policy-v1.0.md`
- `import_patxanga_dictionary_entries(...)` cria lote auditavel, deduplica
  entradas normalizadas, registra fonte/licenca/versao e pode desativar
  palavras ausentes em importacao de substituicao completa
- `sql/tests/test_dictionary_import_pipeline.sql` cobre importacao idempotente,
  metadados e desativacao opcional
- `scripts/prepare-dictionary-import.py` converte CSV auditado em payload JSON
  ou SQL completo para a RPC administrativa
- `scripts/test-dictionary-import-tooling.sh` cobre o conversor sem depender de
  fonte lexical real
- fonte candidata LibreOffice Hunspell `pt_BR` verificada tecnicamente com
  README licenciando `LGPLv3/MPL`, commit upstream, hashes SHA-256 do `.dic` e
  do README registrados em `docs/dictionary-import-pipeline-v1.0.md`
- `scripts/prepare-libreoffice-dictionary-sample.py` extrai uma amostra CSV
  pequena e conservadora do `.dic`
- `scripts/import-libreoffice-pt-br-sample.sh` baixa a fonte para
  `/private/tmp`, registra metadados, gera SQL auditado e opcionalmente executa
  a primeira importacao controlada local
- fonte candidata LibreOffice Hunspell `pt_PT` verificada tecnicamente com
  commit upstream, hashes SHA-256 do `.dic`, README e `LICENSES.txt`
  registrados em `docs/dictionary-import-pipeline-v1.0.md`
- `scripts/import-libreoffice-pt-pt-sample.sh` baixa a fonte `pt_PT`, registra
  metadados, gera SQL auditado e opcionalmente executa importacao controlada
  local em `pt-PT`
- `scripts/test-libreoffice-dictionary-sample.sh` cobre o extrator com fixture
  local e tambem exercita o gerador `pt-PT`, sem rede
- `sql/tests/test_dictionary_imported_words_engine_path.sql` prova que palavras
  importadas alimentam `validate_word`, `preview_move` e `submit_move` sem
  exigir votacao

Proximos passos:

- transformar a fonte candidata em decisao de produto somente depois de revisao
  humana/legal da licenca; isso e especialmente necessario para `pt-PT`, porque
  README e `LICENSES.txt` registram licencas em formatos diferentes
- decidir se a importacao ampla de `pt-BR`/`pt-PT` usara lemas Hunspell,
  expansao de flexoes ou curadoria propria
- evoluir a politica para flexoes, nomes proprios, siglas, hifen e variantes
  apenas quando houver fonte/curadoria especifica
- substituir a baseline minima `pt-PT` por fonte ampla licenciada e auditada
- auditar a distribuicao de pecas `pt-PT`; por enquanto ela e uma baseline
  operacional derivada de `pt-BR`

Validacao minima:

```bash
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
zsh scripts/import-libreoffice-pt-pt-sample.sh --skip-download --limit 25 --execute
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_import_pipeline.sql
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_imported_words_engine_path.sql
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
8. Fechar a decisao de produto sobre fonte ampla licenciada do dicionario.
9. So entao iniciar humano contra bot de produto.

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

## FILE: docs/07-bot-engine.md

# PATXANGA - BOT ENGINE

Versao: 0.6
Status: Baseline inicial com smoke, pending_vote, exchange_tiles, endgames, erros esperados e runner recorrente

---

## 1. Objetivo

Definir a primeira linha de implementacao de bots no Patxanga.

Nesta fase, bot nao significa ainda adversario final de produto.
Bot significa ferramenta de QA para:

- gerar partidas simuladas
- exercitar a engine server-authoritative
- reproduzir cenarios de regressao
- acelerar validacao sem depender de cliques manuais
- preparar terreno para o futuro modo humano contra bot

---

## 2. Separacao obrigatoria

Existem duas frentes diferentes:

| Frente | Objetivo | Prioridade atual |
|--------|----------|------------------|
| Bot de teste/simulacao | Validar engine, gerar cenarios e automatizar QA | Alta |
| Bot de produto | Jogar contra humano em uma experiencia final | Posterior |

Nao se deve misturar as duas frentes.

O bot de simulacao pode ser simples, previsivel e ate limitado.
O bot de produto precisa de UX, ritmo, dificuldade e comportamento de usuario.

---

## 3. Regras obrigatorias para bots de teste

Bots de teste devem:

1. Usar apenas RPCs oficiais.
2. Nunca alterar board, rack, bag ou score fora dos contratos da engine, exceto quando o proprio cenario de teste declarar seed controlada.
3. Ser deterministas sempre que possivel.
4. Gerar logs claros.
5. Falhar com erro explicito quando uma expectativa nao for cumprida.
6. Produzir cenarios pequenos e reproduziveis.
7. Preservar a autoridade do backend.

Bots de teste nao precisam:

- jogar bem
- ter personalidade
- ter interface final
- esconder que estao em modo QA
- cobrir todo o espaco de possibilidades no primeiro marco

---

## 4. Estado tecnico atual

O banco ja possui suporte estrutural para jogadores bot:

- `patxanga_players.is_bot`
- `patxanga_players.bot_level`
- `patxanga_players.bot_profile`
- `join_patxanga_match(... p_is_bot, p_bot_level, p_bot_profile)`

Ja existe:

- runner local recorrente em `scripts/run-bot-simulation.sh`
- smoke bot-vs-bot com jogada valida e passe
- simulacao de `pending_vote` com rejeicao
- simulacao de `pending_vote` com aceitacao
- simulacao de `exchange_tiles`
- simulacao de fim por rack vazio
- simulacao de fim por todos passarem
- simulacao de erros esperados sem mutacao de estado
- simulacao multi-turno combinando jogada aceita, troca, passes,
  `pending_vote` em ponte com peca existente e rejeicao por voto

Ainda nao existe:

- engine autonoma de bot
- Edge Function de bot
- UI de humano contra bot

---

## 5. MVP de simulacao

O primeiro MVP deve entregar:

| Item | Descricao |
|------|-----------|
| Cenario smoke | Uma partida com dois jogadores marcados como bot |
| Jogada deterministica | Um bot executa abertura valida simples |
| Passo seguinte | O outro bot executa uma acao valida simples |
| Runner local | Script executa a simulacao no Postgres local do Supabase |
| Falha explicita | Qualquer regressao gera exception/exit code nao zero |
| Persistencia | Jogada `place_word` aceita gera `move_id` e linha em `patxanga_moves` |
| Pending vote | Bot gera palavra pendente, outro bot rejeita ou aceita |
| Troca de pecas | Bot troca duas pecas e avanca turno |
| Fim por rack vazio | Bot esvazia rack com bag vazia e encerra a partida |
| Fim por todos passarem | Dois bots passam com bag vazia e encerram a partida |
| Erros esperados | Bot tenta jogadas ilegais e a engine rejeita sem mutar estado |
| Multi-turno | Uma partida encadeia jogada aceita, troca, passe, voto e passe final |

Implementacao inicial:

- `sql/simulations/bot_simulation_smoke.sql`
- `sql/simulations/bot_simulation_pending_vote.sql`
- `sql/simulations/bot_simulation_exchange_tiles.sql`
- `sql/simulations/bot_simulation_empty_rack_end.sql`
- `sql/simulations/bot_simulation_all_passed_end.sql`
- `sql/simulations/bot_simulation_invalid_move_expected_error.sql`
- `sql/simulations/bot_simulation_long_multi_turn.sql`
- `scripts/run-bot-simulation.sh`
- `supabase/migrations/20260620210000_20_persist_successful_place_word_moves.sql`

Comando:

```bash
zsh scripts/run-bot-simulation.sh long
zsh scripts/run-bot-simulation.sh all
```

---

## 6. Politicas iniciais de bot

As politicas abaixo sao suficientes para QA inicial:

### `first_valid_opening`

Forca ou encontra rack com palavra curta conhecida pelo dicionario de teste
e joga no centro.

Uso inicial:

- palavra `DA`
- posicoes `(8,8)` e `(8,9)`
- score esperado: 6

### `pass_turn`

Executa `submit_patxanga_pass_turn(...)` quando for turno do bot.

Uso inicial:

- validar avancar turno
- validar replay de passe
- validar ciclo de pass futuro

### Futuras politicas

- `finish_by_empty_rack`
- `finish_by_all_passed`

Politicas ja exercitadas por simulacao controlada:

- `exchange_first_two_tiles`: troca as duas primeiras pecas de um rack controlado
- `force_pending_vote`: rack forca palavra `TS`
- `reject_pending_vote`: voto bot rejeita a palavra pendente
- `accept_pending_vote`: voto bot aceita a palavra pendente
- `finish_by_empty_rack`: bag vazia, rack `DA` e fim imediato apos jogada valida
- `finish_by_all_passed`: bag vazia, dois bots passam e fim ocorre apos o
  segundo passe
- `invalid_missing_rack_tile`: peca inexistente no rack deve gerar erro
  esperado sem alterar estado
- `invalid_out_of_turn_move`: jogador fora do turno deve gerar erro esperado
  sem alterar estado

Observacao:

- `patxanga_players.bot_profile` aceita apenas `aggressive`, `balanced` e
  `defensive`
- politicas de QA como `force_pending_vote` nao devem ser gravadas diretamente
  em `bot_profile`; elas pertencem ao runner/cenario de teste

---

## 7. Cenarios prioritarios

Ordem recomendada:

1. smoke bot-vs-bot com jogada valida e passe - implementado
2. bot cria `pending_vote` - implementado
3. bot vota rejeicao - implementado
4. bot vota aceitacao - implementado
5. bot troca pecas - implementado
6. bot encerra partida por rack vazio - implementado
7. bot encerra partida por todos passarem - implementado
8. bot tenta jogada invalida com erro esperado - implementado

---

## 8. Limites da fase atual

Nao faz parte desta fase:

- bot com inteligencia forte
- escolha lexical ampla
- busca combinatoria no rack
- bot visivel como produto final
- Edge Function obrigatoria
- UX de humano contra bot

Esses itens pertencem a fase posterior de bot de produto.

---

## 9. Criterio de saida da primeira fase

A primeira fase de bots de teste esta iniciada. Criterios ja atendidos:

- `docs/07-bot-engine.md` define o contrato minimo
- existe runner local de simulacao
- existe pelo menos um cenario smoke
- o cenario smoke passa contra Supabase local
- o roadmap consolidado aponta bots de teste como prioridade antes do bot de produto

Proximo criterio de avanco:

- ampliar combinacoes mais longas de partida
- iniciar extracao de utilitarios de seed se os SQLs comecarem a repetir demais

Fim do documento.

## FILE: docs/current-development-continuity-spec-v1.0.md

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

- ultima frente local registrada: `feature/dictionary-import-pipeline`
- foco imediato: fechar ferramental operacional CSV -> payload/SQL da pipeline
  auditavel de dicionario, sem escolher ainda uma fonte real sem licenca
  verificada
- frente de bots de teste e simulacao ja foi criada antes desta atualizacao e
  continua como regressao obrigatoria
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
- validacao lexical por idioma da partida criada em
  `supabase/migrations/20260620215000_23_match_language_dictionary_validation.sql`
- baseline minima `pt-PT` criada em
  `supabase/migrations/20260620220000_24_pt_pt_language_baseline.sql`
- pipeline auditavel de importacao de dicionario criada em
  `supabase/migrations/20260621090000_25_dictionary_import_pipeline.sql`
- contrato operacional documentado em `docs/dictionary-import-pipeline-v1.0.md`
- conversor CSV local criado em `scripts/prepare-dictionary-import.py`
- teste do conversor criado em `scripts/test-dictionary-import-tooling.sh`
- seed fonte `pt-PT` espelhado em `sql/seeds/004_dictionary_pt_pt_core_seed.sql`
- distribuicao fonte `pt-PT` espelhada em
  `sql/seeds/001_patxanga_distribution.sql`
- teste de contrato de dicionario criado em
  `sql/tests/test_dictionary_contract.sql`
- teste de importacao de dicionario criado em
  `sql/tests/test_dictionary_import_pipeline.sql`
- validacao inicial e regressiva confirmada: `supabase db reset`,
  `zsh scripts/run-sql-test-suite.sh all` e
  `zsh scripts/run-bot-simulation.sh all`

Leitura correta:

- bot de teste/simulacao nao e ainda bot de produto
- a primeira meta e gerar cenarios deterministas e reproduziveis
- os bots devem reutilizar RPCs oficiais e nao criar estado paralelo
- humano contra bot continua posterior, depois da experiencia humano contra humano
  e depois de uma base minima de simulacao
- dicionario amplo deve vir depois de contrato, fonte e licenca claros
- a baseline `pt-PT` atual e operacional e minima; nao substitui uma fonte
  ampla, licenciada e auditada
- a pipeline aceita payload JSON auditado e o conversor CSV gera tanto payload
  quanto SQL completo; o proximo passo e escolher fonte real com licenca clara

Comando atual da frente:

```bash
zsh scripts/test-dictionary-import-tooling.sh
supabase db reset
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
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

- esta rodada nao importa fonte real nem adiciona dump amplo ao repositorio
- a pipeline nova recebe payload JSON auditado e o conversor CSV local ja gera
  payload ou SQL completo para a RPC administrativa

## 1.2 Atualizacao operacional de continuidade - 2026-06-21

Estado desta frente:

- branch de implementacao: `feature/licensed-dictionary-source-sample`
- foco: validar tecnicamente uma primeira fonte lexical licenciada sem
  versionar dump amplo no repositorio
- fonte candidata: LibreOffice dictionaries Hunspell `pt_BR`
- README upstream declara licenca `LGPLv3/MPL`
- commit upstream verificado:
  `93d537dc6afb0130de3da75d42c070ac267db957`
- arquivo bruto verificado:
  `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/pt_BR.dic`
- README/licenca verificado:
  `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/README_pt_BR.txt`
- SHA-256 de `pt_BR.dic`:
  `a38bfb26b68ece2834e79fe83e48d5792652970ace12db89d1b9674bf9933183`
- SHA-256 de `README_pt_BR.txt`:
  `9974ce691fdc1fe731717d7a2dc668244405fdc2bf9bf3367eb9b29e85177c88`
- contagem declarada no `.dic`: `312368`

Arquivos novos desta frente:

- `scripts/prepare-libreoffice-dictionary-sample.py`
- `scripts/import-libreoffice-pt-br-sample.sh`
- `scripts/test-libreoffice-dictionary-sample.sh`

Leitura correta:

- a fonte esta validada tecnicamente como candidata de amostra local
- isso nao e aprovacao legal final para uso em produto distribuido
- a amostra usa `source = libreoffice_hunspell_pt_br_sample`
- a politica inicial filtra apenas lemas simples, com letras portuguesas, entre
  3 e 15 caracteres, sem hifen, abreviacoes, siglas ou nomes proprios
- `p_deactivate_missing` nao deve ser usado nessa amostra, porque ela nao
  representa substituicao completa da fonte

Comandos de referencia desta frente:

```bash
zsh scripts/test-libreoffice-dictionary-sample.sh
zsh scripts/import-libreoffice-pt-br-sample.sh --limit 100
zsh scripts/import-libreoffice-pt-br-sample.sh --limit 100 --execute
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_import_pipeline.sql
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
```

Validacao confirmada nesta frente:

- `zsh scripts/test-libreoffice-dictionary-sample.sh`
- `zsh scripts/test-dictionary-import-tooling.sh`
- `python3 -m py_compile scripts/prepare-dictionary-import.py scripts/prepare-libreoffice-dictionary-sample.py`
- `zsh scripts/import-libreoffice-pt-br-sample.sh --skip-download --limit 25`
- `zsh scripts/import-libreoffice-pt-br-sample.sh --skip-download --limit 25 --execute`
- primeira execucao da amostra: 25 linhas inseridas, 0 puladas
- segunda execucao da mesma amostra: 0 inseridas, 25 atualizadas
- `supabase db reset`
- `zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_import_pipeline.sql`
- `zsh scripts/run-sql-test-suite.sh all`
- `zsh scripts/run-bot-simulation.sh all`

## 1.3 Atualizacao operacional de continuidade - 2026-06-21 pt-PT

Estado desta frente:

- branch de implementacao: `feature/licensed-pt-pt-dictionary-sample`
- foco: adicionar validacao tecnica equivalente para uma fonte lexical ampla
  `pt-PT`, sem versionar dump no repositorio
- fonte candidata: LibreOffice dictionaries Hunspell `pt_PT`
- README upstream declara `GPLv2/LGPLv2.1/MPLv1.1`
- `LICENSES.txt` tambem registra `GPL/BSD` para o corrector ortografico
- decisao de produto exige revisao humana/legal por haver metadados de licenca
  menos claros que em `pt_BR`
- commit upstream verificado:
  `93d537dc6afb0130de3da75d42c070ac267db957`
- arquivo bruto verificado:
  `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/pt_PT.dic`
- README/licenca verificado:
  `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/README_pt_PT.txt`
- LICENSES verificado:
  `https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/LICENSES.txt`
- SHA-256 de `pt_PT.dic`:
  `e29ba2d7aa8a2ad43e9cb46ac6473064b661545c87002aea90e18899d98d3cc9`
- SHA-256 de `README_pt_PT.txt`:
  `36de7d88a406a4947bf646a64145f00827566808988632e3df969aa95776060c`
- SHA-256 de `LICENSES.txt`:
  `d2c1cfe2e2dd81c651aec3fda5d1b4b4e7679b9e04f8cdc37586e521837384d1`
- contagem declarada no `.dic`: `44476`

Arquivos novos desta frente:

- `scripts/import-libreoffice-pt-pt-sample.sh`

Comandos de referencia desta frente:

```bash
zsh scripts/test-libreoffice-dictionary-sample.sh
zsh scripts/import-libreoffice-pt-pt-sample.sh --limit 100
zsh scripts/import-libreoffice-pt-pt-sample.sh --limit 100 --execute
zsh scripts/import-libreoffice-pt-pt-sample.sh --skip-download --limit 25 --execute
```

Validacao confirmada nesta frente antes do reset:

- `zsh scripts/test-libreoffice-dictionary-sample.sh`
- `python3 -m py_compile scripts/prepare-libreoffice-dictionary-sample.py scripts/prepare-dictionary-import.py`
- `zsh scripts/import-libreoffice-pt-pt-sample.sh --skip-download --limit 25`
- `zsh scripts/import-libreoffice-pt-pt-sample.sh --skip-download --limit 25 --execute`
- primeira execucao da amostra `pt-PT`: 25 linhas inseridas, 0 puladas
- segunda execucao da mesma amostra `pt-PT`: 0 inseridas, 25 atualizadas
- `supabase db reset`
- `zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_import_pipeline.sql`
- `zsh scripts/run-sql-test-suite.sh all`
- `zsh scripts/run-bot-simulation.sh all`

## 1.4 Atualizacao operacional de continuidade - 2026-06-21 politica lexical

Estado desta frente:

- branch de implementacao: `feature/lexical-policy-imported-words-regression`
- foco: documentar a politica lexical v1 e provar que palavras importadas pela
  pipeline alimentam o caminho real da engine
- politica criada em `docs/lexical-policy-v1.0.md`
- teste criado em `sql/tests/test_dictionary_imported_words_engine_path.sql`
- runner `scripts/run-sql-test-suite.sh` passa a incluir esse teste no perfil
  `engine_regression`

Leitura correta:

- a politica v1 e conservadora para importacoes amplas
- lemas simples, alfabeticos, ativos e auditados podem ser reconhecidos
  automaticamente
- hifen, siglas, nomes proprios, abreviacoes, cliticos especiais e
  estrangeirismos continuam fora da importacao ampla automatica ate curadoria
  especifica
- palavras fora do dicionario ativo seguem pelo fluxo de votacao
- `pt-BR` e `pt-PT` continuam separados, sem fallback entre idiomas

Comandos de referencia desta frente:

```bash
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_imported_words_engine_path.sql
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
```

Validacao confirmada nesta frente:

- `git diff --check`
- `zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_imported_words_engine_path.sql`
- `zsh scripts/run-sql-test-suite.sh all`
- `zsh scripts/run-bot-simulation.sh all`

## 1.5 Atualizacao operacional de continuidade - 2026-06-21 offline

Estado desta frente reduzida:

- branch de implementacao: `feature/offline-lexical-policy-boundaries`
- foco: reforcar a politica lexical v1 sem rede e sem banco
- teste offline ampliado em `scripts/test-libreoffice-dictionary-sample.sh`

Cobertura adicionada:

- hifen fica fora da amostra automatica
- abreviacao com ponto fica fora
- sigla/acronimo fica fora
- nome proprio com maiuscula inicial fica fora
- palavra com digito fica fora
- palavra com apostrofo fica fora
- palavra curta fica fora
- lema simples acentuado continua entrando

Validacao de referencia:

```bash
zsh scripts/test-libreoffice-dictionary-sample.sh
git diff --check
```

## 1.6 Atualizacao operacional de continuidade - 2026-06-21 voting lexical

Estado desta frente:

- branch de implementacao: `feature/lexical-policy-voting-regression`
- foco: provar o caminho complementar da politica lexical v1
- teste novo: `sql/tests/test_dictionary_policy_voting_path.sql`
- runner `scripts/run-sql-test-suite.sh` inclui o novo teste em
  `engine_regression` e `all`

Leitura correta:

- palavra fora do dicionario ativo nao deve ser aceita automaticamente
- `preview_patxanga_move(...)` deve retornar `requires_vote = true`
- `submit_patxanga_move(...)` deve retornar `status = pending_vote`
- o board permanece inalterado ate a votacao resolver a jogada

Comandos de referencia:

```bash
zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_policy_voting_path.sql
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
```

Validacao confirmada nesta frente:

- `zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_policy_voting_path.sql`
- `zsh scripts/run-sql-test-suite.sh all`
- `zsh scripts/run-bot-simulation.sh all`
- `git diff --check`

## 1.7 Registro historico da frente de bots e dicionario minimo

Este bloco e mantido como historico operacional anterior. Ele nao substitui a
validacao especifica da frente 1.6.

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
- `zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_import_pipeline.sql`
- `zsh scripts/test-dictionary-import-tooling.sh`
- `supabase db reset`
- `zsh scripts/run-sql-test-suite.sh all` apos reset
- `zsh scripts/run-bot-simulation.sh all` apos reset
- validacao especifica confirmada: `CASA` aceita em partida `pt-BR` e tambem
  em partida real `pt-PT` apos seed minimo `pt-PT`, sem exigir votacao
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

- branch de implementacao desta atualizacao: `feature/dictionary-import-pipeline`
- base esperada antes do merge: `develop`
- o `git log` recente desta frente precisa refletir, no minimo:
  - baseline operacional de lobby/convites/retomada/desistencia
  - cobertura Playwright da pagina de teste
  - suite SQL de regressao
  - sistema de bots utilitarios para simulacao e QA
  - contrato de dicionario por idioma
  - seed real minimo `pt-BR`
  - validacao lexical usando o idioma persistido na partida
  - baseline minima `pt-PT` para distribuicao, seed e partida real
  - pipeline auditavel de importacao de dicionario
  - conversor CSV operacional para a RPC administrativa
- working tree esperado antes do commit desta frente:
  - novo `scripts/prepare-dictionary-import.py`
  - novo `scripts/test-dictionary-import-tooling.sh`
  - atualizacao de `docs/dictionary-import-pipeline-v1.0.md`
  - atualizacao dos documentos de continuidade e pacote de bastao

Regra de interpretacao:
- o estado local acima prevalece sobre memoria, conversa e pacote antigo
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

## FILE: docs/18-room-baton-process-v1.0.md

# PATXANGA — Room Baton Process
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE

## 1. Objetivo

Padronizar a passagem de bastao para novas salas de forma robusta,
previsivel, rastreavel e segura.

## 2. Regra central

A nova sala nao deve receber contexto fragmentado como forma principal
de inicializacao.

A passagem de bastao deve usar:
- uma frase de entrada padrao
- um arquivo unico de passagem de bastao
- uma escolha explicita entre modos de atuacao apos a leitura inicial do pacote
- um protocolo de retomada na mesma sala apos interrupcao
- validacao posterior de branch, commits e `../project-log.md`

## 3. Frase de entrada da nova sala

Texto base:

ATENCAO: VOCE esta assumindo a continuidade do projeto Patxanga. Nao assuma
contexto, nao altere nada antes de verificar o estado real e trate
continuidade, rastreabilidade, seguranca, validacao e documentacao como
requisitos obrigatorios. Peca explicitamente o arquivo
`docs/18-room-baton-package-current.md` para receber diretivas, contexto
operacional e status atualizado do projeto e, no ambiente local deste
operador, solicite que ele rode o comando
`cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit docs/18-room-baton-package-current.md`
para abrir o arquivo no Mac.

Depois da leitura inicial do pacote de bastao, apresente obrigatoriamente ao
operador uma escolha explicita entre tres modos de atuacao: `PADRAO`, `GATE`
e `GATE_CHECKLIST`. Explique cada modo em uma linha, recomende `PADRAO` como
opcao default e aguarde a decisao do operador antes de prosseguir.

Definido o modo, valide branch atual, `HEAD`, upstream, commits recentes,
`../project-log.md`, working tree, ambiente operacional, ultimo build/teste
validado e artefatos de inicializacao com o rigor correspondente ao modo
escolhido. Se houver divergencia entre memoria, conversa, documentacao e
repositorio local, o estado local verificado prevalece. O arquivo
`docs/18-room-baton-package-current.md` deve ser atualizado sempre que o
operador solicitar ou sempre que houver mudanca relevante suficiente para
impactar a retomada segura.

### 3.1 Modos de atuacao da nova sala

- `PADRAO` (Recomendado): continuidade normal, com validacao objetiva do estado
  real e seguimento mais agil.
- `GATE`: nenhuma conclusao, plano fechando assunto ou alteracao antes de uma
  checagem forte do estado real.
- `GATE_CHECKLIST`: igual ao `GATE`, mas com resposta inicial obrigatoriamente
  estruturada em checklist operacional.

Bloco obrigatorio que a nova sala deve apresentar ao operador apos ler o
pacote:

- `PADRAO` (Recomendado): continuidade normal, com validacao objetiva do estado real e seguimento mais agil.
- `GATE`: nenhuma conclusao, plano fechando assunto ou alteracao antes de uma checagem forte do estado real.
- `GATE_CHECKLIST`: igual ao `GATE`, mas com resposta inicial obrigatoriamente estruturada em checklist operacional.

Pergunta obrigatoria:
`Escolha o modo de atuacao para esta sala: PADRAO, GATE ou GATE_CHECKLIST.`

### 3.2 Resposta obrigatoria quando o modo for GATE_CHECKLIST

- arquivo de bastao lido
- branch atual
- `HEAD` atual
- upstream
- ultimos commits relevantes
- estado do working tree
- ultimo build validado
- ultimos testes validados
- frente atual
- riscos ou bloqueios
- divergencias encontradas
- status do pacote de bastao: atualizado ou precisa refresh

### 3.3 Retomada na mesma sala apos interrupcao

Quando houver interrupcao na mesma sala, nao se deve confiar em memoria
implícita da conversa como fonte unica de continuidade.

A retomada deve usar:
- checkpoint curto registrado pelo assistente durante a atuacao
- historico da conversa
- estado real verificado do working tree e dos arquivos em foco
- build/teste ja concluido e confirmado

Frase padrao de retomada na mesma sala:
`RETOMADA MESMA SALA: recupere o ultimo checkpoint confirmado, diferencie o que ficou concluido do que ficou pendente, revalide qualquer acao que possa ter sido interrompida e continue apenas a partir do estado real verificado.`

Conteudo minimo do checkpoint curto:
- modo ativo
- objetivo atual
- ultimo passo confirmado como concluido
- ponto pendente ou interrompido
- arquivos em foco
- ultima validacao confirmada
- proximo passo

Resposta obrigatoria da IA apos a frase de retomada:
- modo ativo
- objetivo atual
- ultimo ponto confirmado
- ponto incerto ou interrompido
- arquivos em foco
- ultima validacao confirmada
- proximo passo


## 4. Prompt interno no topo do arquivo unico

O arquivo unico de passagem de bastao deve comecar com um prompt interno
de ativacao de continuidade.

Esse prompt deve orientar a nova sala a:
- agir como agente de continuidade tecnica e operacional
- nao assumir estado nao verificado
- confirmar branch, commits recentes e `../project-log.md`
- tratar branch + commits pushados + `../project-log.md` como fonte de verdade
  mais forte que a documentacao, em caso de divergencia
- localizar o trecho real do codigo antes de alterar
- implementar incrementalmente
- validar build/teste antes de versionar
- manter documentacao, log operacional e versionamento sincronizados

## 5. Precedencia entre fontes

A ordem correta de leitura e:
1. branch atual + commits pushados + `../project-log.md`
2. arquivo unico de passagem de bastao
3. contratos e documentos operacionais versionados
4. snapshot/context package mais recente
5. codigo local nao commitado apenas como contexto, nunca como verdade automatica

## 6. Artefatos obrigatorios do processo

O processo deve gerar e manter:
- `docs/18-room-baton-process-v1.0.md`
- `docs/18-room-baton-package-current.md`
- `docs/current-development-continuity-spec-v1.0.md`
- `generate-room-baton-package.sh`

## 7. Conteudo minimo do arquivo unico

O arquivo unico deve consolidar:
- prompt interno de ativacao
- estado operacional atual
- branch, remote, commits recentes
- working tree atual
- trechos recentes do `project-log.md`
- ambiente operacional atual do projeto
- modo de trabalho com o operador
- procedimentos de teste
- procedimento de criacao de partida de teste
- modos de atuacao e bloco de escolha obrigatorio
- protocolo de retomada na mesma sala apos interrupcao
- contratos ativos essenciais
- especificacao viva do ponto atual do desenvolvimento
- frente atual e proximos passos
- frase padrao de passagem de bastao

### 7.1 Ambiente operacional atual do projeto

Deve constar explicitamente:
- sistema operacional atual do operador
- uso via terminal do Mac
- browser local para validacao manual
- frontend local em `http://localhost:3001`
- repo em `~/patxanga-bootstrap/patxanga-core`
- `project-log.md` e `logstep.sh` em `~/patxanga-bootstrap`

### 7.2 Modo de trabalho com o operador

Deve constar explicitamente:
- o operador executa comandos no terminal
- a IA prepara comandos e scripts
- evitar edicao manual de arquivos
- preferir inspecao antes de patch
- validar build/teste antes de versionar

### 7.3 Procedimento de criacao de partida de teste

Deve constar explicitamente:
- como criar uma match local de teste
- quando a pagina suportar, como gerar cenarios reais de browser diretamente pela UI
- quando houver automacao disponivel, como executar a validacao Playwright em ambiente isolado
- quando houver automacao Playwright, que ela usa `distDir` isolado para nao contaminar o `next build`
- quando houver suites SQL reutilizaveis, como executar `zsh scripts/run-sql-test-suite.sh lobby_ops|engine_regression|all`
- como obter `match_id`
- como obter `host_user_id`
- como obter `guest_user_id`
- como usar esses ids na validacao browser
- quando houver suporte na pagina de teste, como registrar esses ids na secao `Alternar host e guest` para trocar de papel sem recolar UUIDs


## 8. Regra de atualizacao do arquivo unico

O arquivo unico de passagem de bastao e um artefato vivo de continuidade
operacional.

Ele deve ser atualizado obrigatoriamente:
- quando solicitado pelo operador
- sempre que a IA julgar que houve mudanca relevante suficiente para impactar
  a retomada segura do projeto em nova sala

Na duvida, deve-se preferir atualizar o arquivo.

Casos tipicos de atualizacao:
- novo marco relevante commitado e pushado
- mudanca de frente principal
- novo contrato ou plano versionado
- mudanca de procedimento operacional
- novo diagnostico que altera a leitura correta do projeto
- alteracao relevante de UX ou de fluxo validado
- mudanca relevante no processo de testes

## 9. Passagem de bastao padrao

Frase oficial:

ATENCAO: VOCE esta assumindo a continuidade do projeto Patxanga. Nao assuma
contexto, nao altere nada antes de verificar o estado real e trate
continuidade, rastreabilidade, seguranca, validacao e documentacao como
requisitos obrigatorios. Peca explicitamente o arquivo
`docs/18-room-baton-package-current.md` para receber diretivas, contexto
operacional e status atualizado do projeto e, no ambiente local deste
operador, solicite que ele rode o comando
`cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit docs/18-room-baton-package-current.md`
para abrir o arquivo no Mac.

Depois da leitura inicial do pacote de bastao, apresente obrigatoriamente ao
operador uma escolha explicita entre tres modos de atuacao: `PADRAO`, `GATE`
e `GATE_CHECKLIST`. Explique cada modo em uma linha, recomende `PADRAO` como
opcao default e aguarde a decisao do operador antes de prosseguir.

Definido o modo, valide branch atual, `HEAD`, upstream, commits recentes,
`../project-log.md`, working tree, ambiente operacional, ultimo build/teste
validado e artefatos de inicializacao com o rigor correspondente ao modo
escolhido. Se houver divergencia entre memoria, conversa, documentacao e
repositorio local, o estado local verificado prevalece. O arquivo
`docs/18-room-baton-package-current.md` deve ser atualizado sempre que o
operador solicitar ou sempre que houver mudanca relevante suficiente para
impactar a retomada segura.

Bloco de escolha obrigatorio:

- `PADRAO` (Recomendado): continuidade normal, com validacao objetiva do estado real e seguimento mais agil.
- `GATE`: nenhuma conclusao, plano fechando assunto ou alteracao antes de uma checagem forte do estado real.
- `GATE_CHECKLIST`: igual ao `GATE`, mas com resposta inicial obrigatoriamente estruturada em checklist operacional.

Pergunta obrigatoria:
`Escolha o modo de atuacao para esta sala: PADRAO, GATE ou GATE_CHECKLIST.`

Resposta obrigatoria quando o modo for `GATE_CHECKLIST`:

- arquivo de bastao lido
- branch atual
- `HEAD` atual
- upstream
- ultimos commits relevantes
- estado do working tree
- ultimo build validado
- ultimos testes validados
- frente atual
- riscos ou bloqueios
- divergencias encontradas
- status do pacote de bastao: atualizado ou precisa refresh

Obrigacao operacional da IA:
- reapresentar essa frase periodicamente na propria conversa com o operador
- reapresentar essa frase obrigatoriamente apos marcos importantes
- apresentar a escolha entre `PADRAO`, `GATE` e `GATE_CHECKLIST` logo apos a
  leitura inicial do pacote
- manter checkpoints curtos durante marcos relevantes para permitir retomada
  segura na mesma sala
- considerar essa reapresentacao parte imutavel do protocolo de continuidade

## 10. Fechamento

Este processo deve ser usado como base oficial para transicao entre salas
enquanto o projeto depender de continuidade assistida.

Fim do documento.

## FILE: scripts/prepare-dictionary-import.py

#!/usr/bin/env python3
"""Prepare audited Patxanga dictionary imports from CSV files.

The script intentionally does not import a real dictionary by itself. It converts
an audited source file into the JSON payload or SQL call expected by
public.import_patxanga_dictionary_entries(...).
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path
from typing import Any


VALID_LANGUAGES = {"pt-BR", "pt-PT"}
TRUE_VALUES = {"1", "true", "t", "yes", "y", "sim", "s", "ativo", "active"}
FALSE_VALUES = {"0", "false", "f", "no", "n", "nao", "não", "inativo", "inactive"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert a dictionary CSV file into Patxanga import JSON or SQL.",
    )
    parser.add_argument("csv_file", type=Path, help="Source CSV file.")
    parser.add_argument(
        "--mode",
        choices=("payload", "sql"),
        default="payload",
        help="Output raw JSON payload or a complete SQL call. Default: payload.",
    )
    parser.add_argument(
        "--word-column",
        default="word",
        help="CSV column containing the original word. Default: word.",
    )
    parser.add_argument(
        "--active-column",
        default="is_active",
        help="Optional CSV column containing active status. Default: is_active.",
    )
    parser.add_argument(
        "--delimiter",
        default=",",
        help="CSV delimiter. Default: comma.",
    )
    parser.add_argument(
        "--encoding",
        default="utf-8",
        help="CSV encoding. Default: utf-8.",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print JSON payload.",
    )
    parser.add_argument("--language", choices=sorted(VALID_LANGUAGES))
    parser.add_argument("--source")
    parser.add_argument("--license-name")
    parser.add_argument("--source-version")
    parser.add_argument("--license-url")
    parser.add_argument("--source-url")
    parser.add_argument("--imported-by")
    parser.add_argument(
        "--metadata-json",
        default="{}",
        help="Additional metadata object included in SQL mode. Default: {}.",
    )
    parser.add_argument(
        "--deactivate-missing",
        action="store_true",
        help="Use only when the CSV fully replaces an existing language+source.",
    )
    return parser.parse_args()


def parse_active(raw_value: str | None, row_number: int, column_name: str) -> bool:
    if raw_value is None or raw_value.strip() == "":
        return True

    normalized = raw_value.strip().lower()
    if normalized in TRUE_VALUES:
        return True
    if normalized in FALSE_VALUES:
        return False

    raise ValueError(
        f"Invalid boolean value in row {row_number}, column {column_name!r}: {raw_value!r}"
    )


def read_entries(args: argparse.Namespace) -> list[dict[str, Any]]:
    if len(args.delimiter) != 1:
        raise ValueError("--delimiter must be a single character")

    with args.csv_file.open("r", encoding=args.encoding, newline="") as csv_handle:
        reader = csv.DictReader(csv_handle, delimiter=args.delimiter)
        if reader.fieldnames is None:
            raise ValueError("CSV file must include a header row")

        fieldnames = {name.strip(): name for name in reader.fieldnames if name is not None}
        if args.word_column not in fieldnames:
            available = ", ".join(reader.fieldnames)
            raise ValueError(
                f"Missing word column {args.word_column!r}. Available columns: {available}"
            )

        word_column = fieldnames[args.word_column]
        active_column = fieldnames.get(args.active_column)
        entries: list[dict[str, Any]] = []

        for row_index, row in enumerate(reader, start=2):
            word = (row.get(word_column) or "").strip()
            is_active = parse_active(
                row.get(active_column) if active_column is not None else None,
                row_index,
                args.active_column,
            )
            entries.append({"word": word, "is_active": is_active})

    return entries


def parse_metadata(raw_metadata: str, csv_file: Path, row_count: int) -> dict[str, Any]:
    try:
        metadata = json.loads(raw_metadata)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid --metadata-json: {exc}") from exc

    if not isinstance(metadata, dict):
        raise ValueError("--metadata-json must be a JSON object")

    return {
        **metadata,
        "input_file": str(csv_file),
        "input_rows": row_count,
        "converter": "scripts/prepare-dictionary-import.py",
    }


def sql_literal(value: str | None) -> str:
    if value is None or value == "":
        return "null"
    return "'" + value.replace("'", "''") + "'"


def sql_jsonb(value: Any) -> str:
    compact = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return sql_literal(compact) + "::jsonb"


def validate_sql_args(args: argparse.Namespace) -> None:
    required = {
        "--language": args.language,
        "--source": args.source,
        "--license-name": args.license_name,
    }
    missing = [option for option, value in required.items() if value is None or value == ""]
    if missing:
        raise ValueError("SQL mode requires " + ", ".join(missing))


def render_sql(args: argparse.Namespace, entries: list[dict[str, Any]]) -> str:
    validate_sql_args(args)
    metadata = parse_metadata(args.metadata_json, args.csv_file, len(entries))

    return "\n".join(
        [
            "select public.import_patxanga_dictionary_entries(",
            f"    p_language := {sql_literal(args.language)},",
            f"    p_source := {sql_literal(args.source)},",
            f"    p_license_name := {sql_literal(args.license_name)},",
            f"    p_entries := {sql_jsonb(entries)},",
            f"    p_source_version := {sql_literal(args.source_version)},",
            f"    p_license_url := {sql_literal(args.license_url)},",
            f"    p_source_url := {sql_literal(args.source_url)},",
            f"    p_imported_by := {sql_literal(args.imported_by)},",
            f"    p_metadata := {sql_jsonb(metadata)},",
            f"    p_deactivate_missing := {'true' if args.deactivate_missing else 'false'}",
            ");",
        ]
    )


def main() -> int:
    args = parse_args()

    try:
        entries = read_entries(args)
        if args.mode == "payload":
            indent = 2 if args.pretty else None
            print(json.dumps(entries, ensure_ascii=False, indent=indent))
        else:
            print(render_sql(args, entries))
    except (OSError, ValueError) as exc:
        print(f"prepare-dictionary-import: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

## FILE: scripts/prepare-libreoffice-dictionary-sample.py

#!/usr/bin/env python3
"""Extract a controlled CSV sample from a LibreOffice Hunspell .dic file."""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path


LOWERCASE_PORTUGUESE_LETTERS = set(
    "abcdefghijklmnopqrstuvwxyz"
    "áàâãä"
    "éèêë"
    "íìîï"
    "óòôõö"
    "úùûü"
    "ç"
)
ACCENT_TRANSLATION = str.maketrans(
    "ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ",
    "AAAAAEEEEIIIIOOOOOUUUUC",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Convert a LibreOffice Hunspell .dic file into a small Patxanga "
            "dictionary import CSV sample."
        ),
    )
    parser.add_argument("dic_file", type=Path, help="Source Hunspell .dic file.")
    parser.add_argument(
        "--output",
        type=Path,
        help="CSV output path. Defaults to stdout.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=100,
        help="Maximum number of selected entries. Default: 100.",
    )
    parser.add_argument(
        "--min-length",
        type=int,
        default=3,
        help="Minimum base word length. Default: 3.",
    )
    parser.add_argument(
        "--max-length",
        type=int,
        default=15,
        help="Maximum base word length. Default: 15.",
    )
    parser.add_argument(
        "--include-non-lowercase",
        action="store_true",
        help=(
            "Include uppercase or mixed-case bases. Default skips them to avoid "
            "proper nouns and acronyms in the first technical sample."
        ),
    )
    parser.add_argument(
        "--encoding",
        default="utf-8-sig",
        help="Input encoding. Default: utf-8-sig.",
    )
    return parser.parse_args()


def normalize_like_database(word: str) -> str:
    return word.upper().translate(ACCENT_TRANSLATION)


def extract_base_word(raw_line: str) -> str:
    stripped = raw_line.strip()
    if stripped == "":
        return ""

    token = stripped.split(maxsplit=1)[0]
    return token.split("/", maxsplit=1)[0].strip()


def is_declared_count_line(raw_line: str) -> bool:
    return raw_line.strip().lstrip("\ufeff").isdigit()


def is_candidate(base_word: str, args: argparse.Namespace) -> bool:
    if len(base_word) < args.min_length or len(base_word) > args.max_length:
        return False

    lowered = base_word.lower()
    if any(character not in LOWERCASE_PORTUGUESE_LETTERS for character in lowered):
        return False

    if not args.include_non_lowercase and base_word != lowered:
        return False

    return True


def iter_selected_entries(args: argparse.Namespace) -> tuple[list[dict[str, str]], dict[str, int | None]]:
    if args.limit < 1:
        raise ValueError("--limit must be greater than zero")
    if args.min_length < 1:
        raise ValueError("--min-length must be greater than zero")
    if args.max_length < args.min_length:
        raise ValueError("--max-length must be greater than or equal to --min-length")

    selected: list[dict[str, str]] = []
    seen_normalized: set[str] = set()
    declared_count: int | None = None
    source_entries = 0
    skipped = 0

    with args.dic_file.open("r", encoding=args.encoding, newline="") as dic_handle:
        for line_number, raw_line in enumerate(dic_handle, start=1):
            if line_number == 1 and is_declared_count_line(raw_line):
                declared_count = int(raw_line.strip().lstrip("\ufeff"))
                continue

            source_entries += 1
            base_word = extract_base_word(raw_line)
            if not is_candidate(base_word, args):
                skipped += 1
                continue

            normalized = normalize_like_database(base_word)
            if normalized in seen_normalized:
                skipped += 1
                continue

            seen_normalized.add(normalized)
            selected.append(
                {
                    "word": base_word.upper(),
                    "is_active": "true",
                    "source_line": str(line_number),
                }
            )

            if len(selected) >= args.limit:
                break

    return selected, {
        "declared_count": declared_count,
        "source_entries_scanned": source_entries,
        "selected": len(selected),
        "skipped": skipped,
    }


def write_csv(entries: list[dict[str, str]], output_path: Path | None) -> None:
    fieldnames = ["word", "is_active", "source_line"]

    if output_path is None:
        writer = csv.DictWriter(sys.stdout, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(entries)
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as csv_handle:
        writer = csv.DictWriter(csv_handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(entries)


def main() -> int:
    args = parse_args()

    try:
        entries, stats = iter_selected_entries(args)
        write_csv(entries, args.output)
    except (OSError, UnicodeError, ValueError) as exc:
        print(f"prepare-libreoffice-dictionary-sample: {exc}", file=sys.stderr)
        return 1

    print(
        "prepare-libreoffice-dictionary-sample: "
        f"declared_count={stats['declared_count']} "
        f"scanned={stats['source_entries_scanned']} "
        f"selected={stats['selected']} "
        f"skipped={stats['skipped']}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

## FILE: scripts/test-dictionary-import-tooling.sh

#!/bin/zsh
set -euo pipefail

repo_dir=~/patxanga-bootstrap/patxanga-core
cd "$repo_dir"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

fixture_csv="$tmp_dir/dictionary_fixture.csv"
payload_json="$tmp_dir/payload.json"
sql_output="$tmp_dir/import.sql"

cat > "$fixture_csv" <<'CSV'
word,is_active,notes
RATO,true,valid
árvore,sim,accented
rato,1,duplicate left for database dedupe
,true,blank preserved for import audit
PEIXE,false,inactive
CSV

python3 scripts/prepare-dictionary-import.py \
  "$fixture_csv" \
  --pretty \
  > "$payload_json"

python3 - "$payload_json" <<'PY'
import json
import sys

payload_path = sys.argv[1]
payload = json.load(open(payload_path, encoding="utf-8"))

assert len(payload) == 5, payload
assert payload[0] == {"word": "RATO", "is_active": True}, payload[0]
assert payload[1] == {"word": "árvore", "is_active": True}, payload[1]
assert payload[2] == {"word": "rato", "is_active": True}, payload[2]
assert payload[3] == {"word": "", "is_active": True}, payload[3]
assert payload[4] == {"word": "PEIXE", "is_active": False}, payload[4]
PY

python3 scripts/prepare-dictionary-import.py \
  "$fixture_csv" \
  --mode sql \
  --language pt-BR \
  --source import_tooling_test \
  --license-name "Test License" \
  --source-version fixture-v1 \
  --license-url https://example.test/license \
  --source-url https://example.test/source \
  --imported-by script-test \
  --metadata-json '{"fixture":true}' \
  --deactivate-missing \
  > "$sql_output"

grep -q "public.import_patxanga_dictionary_entries" "$sql_output"
grep -q "import_tooling_test" "$sql_output"
grep -q '"converter":"scripts/prepare-dictionary-import.py"' "$sql_output"
grep -q "p_deactivate_missing := true" "$sql_output"

if python3 scripts/prepare-dictionary-import.py \
  "$fixture_csv" \
  --mode sql \
  --source import_tooling_test \
  --license-name "Test License" \
  > "$tmp_dir/missing-language.out" 2>&1; then
  echo "Expected missing --language to fail" >&2
  exit 1
fi

grep -q "SQL mode requires --language" "$tmp_dir/missing-language.out"

echo "Dictionary import tooling test passed"

## FILE: scripts/test-libreoffice-dictionary-sample.sh

#!/bin/zsh
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_dir"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

fixture_dic="$tmp_dir/pt_BR_fixture.dic"
sample_csv="$tmp_dir/sample.csv"
import_sql="$tmp_dir/import.sql"
boundary_dic="$tmp_dir/policy_boundary_fixture.dic"
boundary_csv="$tmp_dir/policy_boundary.csv"
pt_pt_source_dir="$tmp_dir/pt-pt-source"
pt_pt_sql="$pt_pt_source_dir/patxanga-libreoffice-pt-pt-sample-3.sql"

cat > "$fixture_dic" <<'DIC'
9
casa/AB
mesa/CD
A.C.
Coca-Cola
ação/EF
árvore/GH
aa
mão/IJ
casa/KL
DIC

python3 scripts/prepare-libreoffice-dictionary-sample.py \
  "$fixture_dic" \
  --limit 5 \
  --output "$sample_csv" \
  2> "$tmp_dir/extractor.stderr"

grep -q "declared_count=9" "$tmp_dir/extractor.stderr"
grep -q "selected=5" "$tmp_dir/extractor.stderr"

python3 - "$sample_csv" <<'PY'
import csv
import sys

with open(sys.argv[1], encoding="utf-8", newline="") as csv_handle:
    rows = list(csv.DictReader(csv_handle))

expected = [
    {"word": "CASA", "is_active": "true", "source_line": "2"},
    {"word": "MESA", "is_active": "true", "source_line": "3"},
    {"word": "AÇÃO", "is_active": "true", "source_line": "6"},
    {"word": "ÁRVORE", "is_active": "true", "source_line": "7"},
    {"word": "MÃO", "is_active": "true", "source_line": "9"},
]

assert rows == expected, rows
PY

python3 scripts/prepare-dictionary-import.py \
  "$sample_csv" \
  --mode sql \
  --language pt-BR \
  --source libreoffice_hunspell_pt_br_sample_test \
  --license-name "LGPLv3/MPL" \
  --source-version fixture \
  --license-url https://example.test/license \
  --source-url https://example.test/pt_BR.dic \
  --imported-by script-test \
  --metadata-json '{"fixture":true}' \
  > "$import_sql"

grep -q "libreoffice_hunspell_pt_br_sample_test" "$import_sql"
grep -q "AÇÃO" "$import_sql"
grep -q '"input_rows":5' "$import_sql"

cat > "$boundary_dic" <<'DIC'
10
coração/AB
luso-brasileiro/CD
A.C.
NASA
Lisboa
abc123
d'água
aa
árvore/EF
há-o/GH
DIC

python3 scripts/prepare-libreoffice-dictionary-sample.py \
  "$boundary_dic" \
  --limit 10 \
  --output "$boundary_csv" \
  2> "$tmp_dir/boundary.stderr"

grep -q "declared_count=10" "$tmp_dir/boundary.stderr"
grep -q "selected=2" "$tmp_dir/boundary.stderr"

python3 - "$boundary_csv" <<'PY'
import csv
import sys

with open(sys.argv[1], encoding="utf-8", newline="") as csv_handle:
    rows = list(csv.DictReader(csv_handle))

expected_words = ["CORAÇÃO", "ÁRVORE"]
actual_words = [row["word"] for row in rows]

assert actual_words == expected_words, rows
PY

mkdir -p "$pt_pt_source_dir"
cat > "$pt_pt_source_dir/pt_PT.dic" <<'DIC'
6
,	[CAT=punct1a]
abacateiro/p	[CAT=nc,G=m,N=s]
abacate/p	[CAT=nc,G=m,N=s]
ábaco/p	[CAT=nc,G=m,N=s]
abaixo-assinado/p	[CAT=nc,G=m,N=s]
abalar/XYPLv	[CAT=v,T=inf,TR=t]
DIC
cat > "$pt_pt_source_dir/README_pt_PT.txt" <<'TXT'
Regarding license versions:
     1. GPL Version 2
     2. LGPL Version 2.1
     3. MPL Version 1.1
TXT
cat > "$pt_pt_source_dir/LICENSES.txt" <<'TXT'
Spellchecker / Corrector ortografico
All dictionary files and associated programs are currently covered
by the GPL and BSD licence
TXT
cat > "$pt_pt_source_dir/master-commit.json" <<'JSON'
{"sha":"fixture-commit-sha"}
JSON

zsh scripts/import-libreoffice-pt-pt-sample.sh \
  --skip-download \
  --source-dir "$pt_pt_source_dir" \
  --limit 3 \
  > "$tmp_dir/pt-pt-import.stdout"

grep -q "LibreOffice pt-PT sample prepared" "$tmp_dir/pt-pt-import.stdout"
grep -q "upstream_commit_sha=fixture-commit-sha" "$tmp_dir/pt-pt-import.stdout"
grep -q "p_language := 'pt-PT'" "$pt_pt_sql"
grep -q "libreoffice_hunspell_pt_pt_sample" "$pt_pt_sql"
grep -q "GPLv2/LGPLv2.1/MPLv1.1" "$pt_pt_sql"
grep -q "ABACATEIRO" "$pt_pt_sql"
grep -q "ABACATE" "$pt_pt_sql"
grep -q "ÁBACO" "$pt_pt_sql"
grep -q '"license_review_required":true' "$pt_pt_sql"

echo "LibreOffice dictionary sample test passed"

## FILE: scripts/import-libreoffice-pt-br-sample.sh

#!/bin/zsh
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_dir"

source_dir="${PATXANGA_DICTIONARY_SOURCE_DIR:-/private/tmp/patxanga-dictionary-sources/libreoffice-pt-br}"
limit="${PATXANGA_DICTIONARY_SAMPLE_LIMIT:-100}"
execute=0
skip_download=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --execute)
      execute=1
      shift
      ;;
    --skip-download)
      skip_download=1
      shift
      ;;
    --limit)
      limit="$2"
      shift 2
      ;;
    --source-dir)
      source_dir="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

mkdir -p "$source_dir"

dic_url="https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/pt_BR.dic"
readme_url="https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/README_pt_BR.txt"
commit_url="https://api.github.com/repos/LibreOffice/dictionaries/commits/master"

dic_file="$source_dir/pt_BR.dic"
readme_file="$source_dir/README_pt_BR.txt"
commit_file="$source_dir/master-commit.json"
sample_csv="$source_dir/patxanga-libreoffice-pt-br-sample-${limit}.csv"
metadata_file="$source_dir/patxanga-libreoffice-pt-br-sample-${limit}.metadata.json"
sql_file="$source_dir/patxanga-libreoffice-pt-br-sample-${limit}.sql"

if [ "$skip_download" -eq 0 ]; then
  curl -L --fail --silent --show-error "$dic_url" -o "$dic_file"
  curl -L --fail --silent --show-error "$readme_url" -o "$readme_file"
  curl -L --fail --silent --show-error "$commit_url" -o "$commit_file"
fi

if [ ! -f "$dic_file" ] || [ ! -f "$readme_file" ]; then
  echo "Missing source files in $source_dir. Run without --skip-download first." >&2
  exit 1
fi

commit_sha="unknown"
if [ -f "$commit_file" ]; then
  commit_sha="$(python3 -c "import json, sys; print(json.load(open(sys.argv[1], encoding='utf-8'))['sha'])" "$commit_file")"
fi

dic_sha256="$(LC_ALL=C shasum -a 256 "$dic_file" | awk '{print $1}')"
readme_sha256="$(LC_ALL=C shasum -a 256 "$readme_file" | awk '{print $1}')"
declared_count="$(python3 -c "import sys; print(open(sys.argv[1], encoding='utf-8-sig').readline().strip())" "$dic_file")"

python3 scripts/prepare-libreoffice-dictionary-sample.py \
  "$dic_file" \
  --limit "$limit" \
  --output "$sample_csv"

python3 - "$metadata_file" "$dic_sha256" "$readme_sha256" "$declared_count" "$limit" "$commit_sha" <<'PY'
import json
import sys

metadata_path, dic_sha256, readme_sha256, declared_count, limit, commit_sha = sys.argv[1:]
metadata = {
    "technical_validation_only": True,
    "source_family": "LibreOffice dictionaries Hunspell pt_BR",
    "raw_sha256": dic_sha256,
    "readme_sha256": readme_sha256,
    "declared_entry_count": int(declared_count),
    "sample_limit": int(limit),
    "upstream_commit_sha": commit_sha,
    "filter": {
        "min_length": 3,
        "max_length": 15,
        "letters_only": True,
        "lowercase_source_only": True,
        "dedupe_like_database": True,
    },
}

with open(metadata_path, "w", encoding="utf-8") as metadata_handle:
    json.dump(metadata, metadata_handle, ensure_ascii=False, separators=(",", ":"))
PY

python3 scripts/prepare-dictionary-import.py \
  "$sample_csv" \
  --mode sql \
  --language pt-BR \
  --source libreoffice_hunspell_pt_br_sample \
  --license-name "LGPLv3/MPL" \
  --source-version "$commit_sha" \
  --license-url "$readme_url" \
  --source-url "$dic_url" \
  --imported-by scripts/import-libreoffice-pt-br-sample.sh \
  --metadata-json "$(cat "$metadata_file")" \
  > "$sql_file"

echo "LibreOffice pt-BR sample prepared"
echo "source_dir=$source_dir"
echo "upstream_commit_sha=$commit_sha"
echo "dic_sha256=$dic_sha256"
echo "readme_sha256=$readme_sha256"
echo "sample_csv=$sample_csv"
echo "metadata_json=$metadata_file"
echo "import_sql=$sql_file"

if [ "$execute" -eq 1 ]; then
  container="${SUPABASE_DB_CONTAINER:-supabase_db_patxanga-core}"
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$sql_file"
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
select
    source,
    source_version,
    license_name,
    total_rows,
    valid_rows,
    inserted_count,
    updated_count,
    skipped_count,
    deactivated_count
from public.patxanga_dictionary_import_batches
where source = 'libreoffice_hunspell_pt_br_sample'
order by created_at desc
limit 1;
SQL
fi

## FILE: scripts/import-libreoffice-pt-pt-sample.sh

#!/bin/zsh
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_dir"

source_dir="${PATXANGA_DICTIONARY_SOURCE_DIR:-/private/tmp/patxanga-dictionary-sources/libreoffice-pt-pt}"
limit="${PATXANGA_DICTIONARY_SAMPLE_LIMIT:-100}"
execute=0
skip_download=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --execute)
      execute=1
      shift
      ;;
    --skip-download)
      skip_download=1
      shift
      ;;
    --limit)
      limit="$2"
      shift 2
      ;;
    --source-dir)
      source_dir="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

mkdir -p "$source_dir"

dic_url="https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/pt_PT.dic"
readme_url="https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/README_pt_PT.txt"
licenses_url="https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_PT/LICENSES.txt"
commit_url="https://api.github.com/repos/LibreOffice/dictionaries/commits/master"

dic_file="$source_dir/pt_PT.dic"
readme_file="$source_dir/README_pt_PT.txt"
licenses_file="$source_dir/LICENSES.txt"
commit_file="$source_dir/master-commit.json"
sample_csv="$source_dir/patxanga-libreoffice-pt-pt-sample-${limit}.csv"
metadata_file="$source_dir/patxanga-libreoffice-pt-pt-sample-${limit}.metadata.json"
sql_file="$source_dir/patxanga-libreoffice-pt-pt-sample-${limit}.sql"

if [ "$skip_download" -eq 0 ]; then
  curl -L --fail --silent --show-error "$dic_url" -o "$dic_file"
  curl -L --fail --silent --show-error "$readme_url" -o "$readme_file"
  curl -L --fail --silent --show-error "$licenses_url" -o "$licenses_file"
  curl -L --fail --silent --show-error "$commit_url" -o "$commit_file"
fi

if [ ! -f "$dic_file" ] || [ ! -f "$readme_file" ] || [ ! -f "$licenses_file" ]; then
  echo "Missing source files in $source_dir. Run without --skip-download first." >&2
  exit 1
fi

commit_sha="unknown"
if [ -f "$commit_file" ]; then
  commit_sha="$(python3 -c "import json, sys; print(json.load(open(sys.argv[1], encoding='utf-8'))['sha'])" "$commit_file")"
fi

dic_sha256="$(LC_ALL=C shasum -a 256 "$dic_file" | awk '{print $1}')"
readme_sha256="$(LC_ALL=C shasum -a 256 "$readme_file" | awk '{print $1}')"
licenses_sha256="$(LC_ALL=C shasum -a 256 "$licenses_file" | awk '{print $1}')"
declared_count="$(python3 -c "import sys; print(open(sys.argv[1], encoding='utf-8-sig').readline().strip())" "$dic_file")"

python3 scripts/prepare-libreoffice-dictionary-sample.py \
  "$dic_file" \
  --limit "$limit" \
  --output "$sample_csv"

python3 - "$metadata_file" "$dic_sha256" "$readme_sha256" "$licenses_sha256" "$declared_count" "$limit" "$commit_sha" "$readme_url" "$licenses_url" <<'PY'
import json
import sys

(
    metadata_path,
    dic_sha256,
    readme_sha256,
    licenses_sha256,
    declared_count,
    limit,
    commit_sha,
    readme_url,
    licenses_url,
) = sys.argv[1:]

metadata = {
    "technical_validation_only": True,
    "source_family": "LibreOffice dictionaries Hunspell pt_PT",
    "raw_sha256": dic_sha256,
    "readme_sha256": readme_sha256,
    "licenses_sha256": licenses_sha256,
    "declared_entry_count": int(declared_count),
    "sample_limit": int(limit),
    "upstream_commit_sha": commit_sha,
    "license_review_required": True,
    "license_notes": (
        "README_pt_PT.txt declares GPLv2/LGPLv2.1/MPLv1.1; "
        "LICENSES.txt also notes GPL/BSD for the spellchecker."
    ),
    "readme_url": readme_url,
    "licenses_url": licenses_url,
    "filter": {
        "min_length": 3,
        "max_length": 15,
        "letters_only": True,
        "lowercase_source_only": True,
        "dedupe_like_database": True,
    },
}

with open(metadata_path, "w", encoding="utf-8") as metadata_handle:
    json.dump(metadata, metadata_handle, ensure_ascii=False, separators=(",", ":"))
PY

python3 scripts/prepare-dictionary-import.py \
  "$sample_csv" \
  --mode sql \
  --language pt-PT \
  --source libreoffice_hunspell_pt_pt_sample \
  --license-name "GPLv2/LGPLv2.1/MPLv1.1" \
  --source-version "$commit_sha" \
  --license-url "$readme_url" \
  --source-url "$dic_url" \
  --imported-by scripts/import-libreoffice-pt-pt-sample.sh \
  --metadata-json "$(cat "$metadata_file")" \
  > "$sql_file"

echo "LibreOffice pt-PT sample prepared"
echo "source_dir=$source_dir"
echo "upstream_commit_sha=$commit_sha"
echo "dic_sha256=$dic_sha256"
echo "readme_sha256=$readme_sha256"
echo "licenses_sha256=$licenses_sha256"
echo "sample_csv=$sample_csv"
echo "metadata_json=$metadata_file"
echo "import_sql=$sql_file"

if [ "$execute" -eq 1 ]; then
  container="${SUPABASE_DB_CONTAINER:-supabase_db_patxanga-core}"
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$sql_file"
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
select
    source,
    source_version,
    license_name,
    total_rows,
    valid_rows,
    inserted_count,
    updated_count,
    skipped_count,
    deactivated_count
from public.patxanga_dictionary_import_batches
where source = 'libreoffice_hunspell_pt_pt_sample'
order by created_at desc
limit 1;
SQL
fi

## FILE: scripts/run-bot-simulation.sh

#!/bin/zsh
set -euo pipefail

repo_dir="${PATXANGA_REPO_DIR:-$HOME/patxanga-bootstrap/patxanga-core}"
container_name="${PATXANGA_DB_CONTAINER:-supabase_db_patxanga-core}"

typeset -a smoke_simulations=(
  "sql/simulations/bot_simulation_smoke.sql"
)

typeset -a long_simulations=(
  "sql/simulations/bot_simulation_long_multi_turn.sql"
)

typeset -a all_simulations=(
  "${smoke_simulations[@]}"
  "sql/simulations/bot_simulation_pending_vote.sql"
  "sql/simulations/bot_simulation_exchange_tiles.sql"
  "sql/simulations/bot_simulation_empty_rack_end.sql"
  "sql/simulations/bot_simulation_all_passed_end.sql"
  "sql/simulations/bot_simulation_invalid_move_expected_error.sql"
  "${long_simulations[@]}"
)

usage() {
  cat <<'EOF'
Usage:
  zsh scripts/run-bot-simulation.sh smoke
  zsh scripts/run-bot-simulation.sh long
  zsh scripts/run-bot-simulation.sh all
  zsh scripts/run-bot-simulation.sh path/to/simulation.sql [path/to/other.sql ...]

Profiles:
  smoke  Minimal deterministic bot-vs-bot QA simulation
  long   Multi-turn deterministic bot-vs-bot QA simulation
  all    All predefined bot simulations
EOF
}

resolve_simulations() {
  if [[ $# -eq 0 ]]; then
    usage
    exit 1
  fi

  case "$1" in
    smoke)
      printf '%s\n' "${smoke_simulations[@]}"
      ;;
    long)
      printf '%s\n' "${long_simulations[@]}"
      ;;
    all)
      printf '%s\n' "${all_simulations[@]}"
      ;;
    *)
      printf '%s\n' "$@"
      ;;
  esac
}

cd "$repo_dir"

typeset -a simulations_to_run
while IFS= read -r simulation_file; do
  simulations_to_run+=("$simulation_file")
done < <(resolve_simulations "$@")

if [[ ${#simulations_to_run[@]} -eq 0 ]]; then
  echo "No bot simulations selected."
  exit 1
fi

for simulation_file in "${simulations_to_run[@]}"; do
  if [[ ! -f "$simulation_file" ]]; then
    echo "Bot simulation file not found: $simulation_file" >&2
    exit 1
  fi

  echo "==> $simulation_file"
  docker exec -i "$container_name" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$simulation_file"
done

## FILE: scripts/run-sql-test-suite.sh

#!/bin/zsh
set -euo pipefail

repo_dir=~/patxanga-bootstrap/patxanga-core
container_name="${PATXANGA_DB_CONTAINER:-supabase_db_patxanga-core}"

typeset -a lobby_ops_tests=(
  "sql/tests/test_resume_match.sql"
  "sql/tests/test_start_match_from_lobby.sql"
  "sql/tests/test_direct_invite_flow.sql"
  "sql/tests/test_direct_invite_decline.sql"
  "sql/tests/test_forfeit_single_player.sql"
  "sql/tests/test_forfeit_all_players.sql"
  "sql/tests/test_list_pending_invites.sql"
  "sql/tests/test_list_resumable_matches.sql"
)

typeset -a engine_regression_tests=(
  "sql/tests/test_dictionary_contract.sql"
  "sql/tests/test_dictionary_import_pipeline.sql"
  "sql/tests/test_dictionary_imported_words_engine_path.sql"
  "sql/tests/test_dictionary_policy_voting_path.sql"
  "sql/tests/test_exchange_tiles.sql"
  "sql/tests/test_pass_turn.sql"
  "sql/tests/test_submit_move_auto.sql"
  "sql/tests/test_match_end_all_passed.sql"
  "sql/tests/test_match_end_empty_rack.sql"
  "sql/tests/test_match_end_final_penalty.sql"
  "sql/tests/test_submit_move_pending_vote.sql"
  "sql/tests/test_submit_move_pending_vote_accept.sql"
  "sql/tests/test_submit_move_pending_vote_reject.sql"
)

usage() {
  cat <<'EOF'
Usage:
  zsh scripts/run-sql-test-suite.sh lobby_ops
  zsh scripts/run-sql-test-suite.sh engine_regression
  zsh scripts/run-sql-test-suite.sh all
  zsh scripts/run-sql-test-suite.sh path/to/test.sql [path/to/other.sql ...]

Profiles:
  lobby_ops          Lobby, invite, resume and forfeit operational coverage
  engine_regression  Dictionary, exchange, pass turn, match end and pending vote coverage
  all                Both predefined profiles above
EOF
}

resolve_tests() {
  if [[ $# -eq 0 ]]; then
    usage
    exit 1
  fi

  case "$1" in
    lobby_ops)
      printf '%s\n' "${lobby_ops_tests[@]}"
      ;;
    engine_regression)
      printf '%s\n' "${engine_regression_tests[@]}"
      ;;
    all)
      printf '%s\n' "${lobby_ops_tests[@]}" "${engine_regression_tests[@]}"
      ;;
    *)
      printf '%s\n' "$@"
      ;;
  esac
}

cd "$repo_dir"

typeset -a tests_to_run
while IFS= read -r test_file; do
  tests_to_run+=("$test_file")
done < <(resolve_tests "$@")

if [[ ${#tests_to_run[@]} -eq 0 ]]; then
  echo "No SQL tests selected."
  exit 1
fi

for test_file in "${tests_to_run[@]}"; do
  if [[ ! -f "$test_file" ]]; then
    echo "SQL test file not found: $test_file" >&2
    exit 1
  fi

  echo "==> $test_file"
  docker exec -i "$container_name" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$test_file"
done

## FILE: sql/migrations/002_dictionary.sql

-- ============================================================
-- PATXANGA - Migration 002
-- Dictionary Structure
-- Version: 1.0
-- ============================================================

create table if not exists patxanga_dictionary (
    language text not null default 'pt-BR',
    word_original text not null,
    word_normalized text not null,
    source text not null default 'test_seed',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (language, word_normalized)
);

create index if not exists idx_patxanga_dictionary_active_lookup
on patxanga_dictionary (language, word_normalized)
where is_active = true;

create index if not exists idx_patxanga_dictionary_source
on patxanga_dictionary (source);

## FILE: sql/migrations/003_dictionary_import_pipeline.sql

-- ============================================================
-- PATXANGA - Migration 003
-- Dictionary Import Pipeline
-- Version: 1.0
-- ============================================================

create table if not exists public.patxanga_dictionary_import_batches (
    id uuid primary key default uuid_generate_v4(),
    language text not null check (language in ('pt-BR', 'pt-PT')),
    source text not null check (length(trim(source)) > 0),
    source_version text null,
    license_name text not null check (length(trim(license_name)) > 0),
    license_url text null,
    source_url text null,
    imported_by text null,
    import_status text not null default 'completed'
        check (import_status in ('completed', 'failed')),
    total_rows integer not null default 0 check (total_rows >= 0),
    valid_rows integer not null default 0 check (valid_rows >= 0),
    inserted_count integer not null default 0 check (inserted_count >= 0),
    updated_count integer not null default 0 check (updated_count >= 0),
    skipped_count integer not null default 0 check (skipped_count >= 0),
    deactivated_count integer not null default 0 check (deactivated_count >= 0),
    metadata jsonb not null default '{}'::jsonb,
    notes text null,
    created_at timestamptz not null default now(),
    completed_at timestamptz not null default now()
);

alter table public.patxanga_dictionary
add column if not exists source_version text,
add column if not exists license_name text,
add column if not exists license_url text,
add column if not exists source_url text,
add column if not exists import_batch_id uuid,
add column if not exists imported_at timestamptz;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'patxanga_dictionary_import_batch_fk'
          and conrelid = 'public.patxanga_dictionary'::regclass
    ) then
        alter table public.patxanga_dictionary
        add constraint patxanga_dictionary_import_batch_fk
        foreign key (import_batch_id)
        references public.patxanga_dictionary_import_batches(id)
        on delete set null;
    end if;
end $$;

create index if not exists idx_patxanga_dictionary_import_batch
on public.patxanga_dictionary (import_batch_id);

create index if not exists idx_patxanga_dictionary_language_source_active
on public.patxanga_dictionary (language, source, is_active);

create index if not exists idx_patxanga_dictionary_import_batches_source
on public.patxanga_dictionary_import_batches (language, source, source_version);

## FILE: sql/rpc/import_dictionary_entries.sql

-- ============================================================
-- PATXANGA - RPC: import_patxanga_dictionary_entries()
-- Version: 1.0
-- Purpose: administrative, audited dictionary import from normalized payloads
-- ============================================================

drop function if exists public.import_patxanga_dictionary_entries(
    text,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    jsonb,
    boolean
);

create or replace function public.import_patxanga_dictionary_entries(
    p_language text,
    p_source text,
    p_license_name text,
    p_entries jsonb,
    p_source_version text default null,
    p_license_url text default null,
    p_source_url text default null,
    p_imported_by text default null,
    p_metadata jsonb default '{}'::jsonb,
    p_deactivate_missing boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as
$$
declare
    v_language text := trim(coalesce(p_language, ''));
    v_source text := nullif(trim(coalesce(p_source, '')), '');
    v_license_name text := nullif(trim(coalesce(p_license_name, '')), '');
    v_source_version text := nullif(trim(coalesce(p_source_version, '')), '');
    v_license_url text := nullif(trim(coalesce(p_license_url, '')), '');
    v_source_url text := nullif(trim(coalesce(p_source_url, '')), '');
    v_imported_by text := nullif(trim(coalesce(p_imported_by, '')), '');
    v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
    v_total_rows integer := 0;
    v_valid_rows integer := 0;
    v_inserted_count integer := 0;
    v_updated_count integer := 0;
    v_skipped_count integer := 0;
    v_deactivated_count integer := 0;
    v_batch_id uuid;
begin
    if v_language not in ('pt-BR', 'pt-PT') then
        raise exception 'Unsupported dictionary language: %', p_language;
    end if;

    if v_source is null then
        raise exception 'Dictionary import source is required';
    end if;

    if v_license_name is null then
        raise exception 'Dictionary import license_name is required';
    end if;

    if p_entries is null or jsonb_typeof(p_entries) <> 'array' then
        raise exception 'Dictionary import entries must be a JSON array';
    end if;

    if jsonb_typeof(v_metadata) <> 'object' then
        raise exception 'Dictionary import metadata must be a JSON object';
    end if;

    v_total_rows := jsonb_array_length(p_entries);

    if to_regclass('pg_temp.patxanga_dictionary_import_stage') is null then
        create temporary table patxanga_dictionary_import_stage (
            word_original text not null,
            word_normalized text not null,
            is_active boolean not null
        ) on commit drop;
    else
        truncate table patxanga_dictionary_import_stage;
    end if;

    insert into patxanga_dictionary_import_stage (
        word_original,
        word_normalized,
        is_active
    )
    with raw_entries as (
        select
            entry.value,
            entry.ordinality
        from jsonb_array_elements(p_entries) with ordinality as entry(value, ordinality)
    ),
    prepared_entries as (
        select
            nullif(trim(coalesce(value->>'word_original', value->>'word', '')), '') as word_original,
            public.normalize_patxanga_word(
                nullif(trim(coalesce(value->>'word_original', value->>'word', '')), '')
            ) as word_normalized,
            coalesce(nullif(trim(value->>'is_active'), ''), 'true')::boolean as is_active,
            ordinality
        from raw_entries
    )
    select distinct on (word_normalized)
        word_original,
        word_normalized,
        is_active
    from prepared_entries
    where word_original is not null
      and word_normalized is not null
      and word_normalized <> ''
    order by word_normalized, ordinality;

    select count(*)
    into v_valid_rows
    from patxanga_dictionary_import_stage;

    select count(*)
    into v_inserted_count
    from patxanga_dictionary_import_stage stage
    where not exists (
        select 1
        from public.patxanga_dictionary dictionary
        where dictionary.language = v_language
          and dictionary.word_normalized = stage.word_normalized
    );

    v_updated_count := v_valid_rows - v_inserted_count;
    v_skipped_count := v_total_rows - v_valid_rows;

    insert into public.patxanga_dictionary_import_batches (
        language,
        source,
        source_version,
        license_name,
        license_url,
        source_url,
        imported_by,
        total_rows,
        valid_rows,
        inserted_count,
        updated_count,
        skipped_count,
        metadata
    )
    values (
        v_language,
        v_source,
        v_source_version,
        v_license_name,
        v_license_url,
        v_source_url,
        v_imported_by,
        v_total_rows,
        v_valid_rows,
        v_inserted_count,
        v_updated_count,
        v_skipped_count,
        v_metadata
    )
    returning id into v_batch_id;

    insert into public.patxanga_dictionary (
        language,
        word_original,
        word_normalized,
        source,
        is_active,
        source_version,
        license_name,
        license_url,
        source_url,
        import_batch_id,
        imported_at,
        updated_at
    )
    select
        v_language,
        stage.word_original,
        stage.word_normalized,
        v_source,
        stage.is_active,
        v_source_version,
        v_license_name,
        v_license_url,
        v_source_url,
        v_batch_id,
        now(),
        now()
    from patxanga_dictionary_import_stage stage
    on conflict (language, word_normalized) do update
    set word_original = excluded.word_original,
        source = excluded.source,
        is_active = excluded.is_active,
        source_version = excluded.source_version,
        license_name = excluded.license_name,
        license_url = excluded.license_url,
        source_url = excluded.source_url,
        import_batch_id = excluded.import_batch_id,
        imported_at = excluded.imported_at,
        updated_at = excluded.updated_at;

    if p_deactivate_missing then
        update public.patxanga_dictionary dictionary
        set is_active = false,
            import_batch_id = v_batch_id,
            imported_at = now(),
            updated_at = now()
        where dictionary.language = v_language
          and dictionary.source = v_source
          and dictionary.is_active = true
          and not exists (
              select 1
              from patxanga_dictionary_import_stage stage
              where stage.word_normalized = dictionary.word_normalized
          );

        get diagnostics v_deactivated_count = row_count;

        update public.patxanga_dictionary_import_batches
        set deactivated_count = v_deactivated_count
        where id = v_batch_id;
    end if;

    return jsonb_build_object(
        'status', 'success',
        'batch_id', v_batch_id,
        'language', v_language,
        'source', v_source,
        'source_version', v_source_version,
        'license_name', v_license_name,
        'total_rows', v_total_rows,
        'valid_rows', v_valid_rows,
        'inserted_count', v_inserted_count,
        'updated_count', v_updated_count,
        'skipped_count', v_skipped_count,
        'deactivated_count', v_deactivated_count,
        'deactivate_missing', p_deactivate_missing
    );
end;
$$;

revoke all on function public.import_patxanga_dictionary_entries(
    text,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    jsonb,
    boolean
) from public, anon, authenticated;

grant execute on function public.import_patxanga_dictionary_entries(
    text,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    jsonb,
    boolean
) to service_role;

## FILE: sql/rpc/preview_move.sql

-- ============================================================
-- PATXANGA - RPC: preview_patxanga_move()
-- Version: 1.0
-- Purpose: Simulate move validation and score without persistence
-- ============================================================

create or replace function public.preview_patxanga_move(
    p_match_id uuid,
    p_player_id uuid,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player record;
    v_hydrated_placed_tiles jsonb;
    v_virtual_board jsonb;
    v_words jsonb;
    v_score jsonb;
    v_word jsonb;
    v_is_valid boolean;
    v_has_invalid_word boolean := false;
    v_main_word text := null;
    v_secondary_words jsonb := '[]'::jsonb;
begin
    select *
    into v_match
    from patxanga_matches
    where id = p_match_id;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'active' then
        raise exception 'Match not active';
    end if;

    if v_match.current_turn_player_id <> p_player_id then
        raise exception 'Not your turn';
    end if;

    select *
    into v_player
    from patxanga_players
    where match_id = p_match_id
      and id = p_player_id;

    if not found then
        raise exception 'Player not found';
    end if;

    perform public.validate_patxanga_tile_ownership(
        v_player.rack_state,
        p_placed_tiles
    );

    perform public.validate_patxanga_move_alignment(
        v_match.board_state,
        p_placed_tiles
    );

    v_hydrated_placed_tiles :=
        public.hydrate_patxanga_placed_tiles(
            v_player.rack_state,
            p_placed_tiles
        );

    v_virtual_board :=
        public.build_patxanga_virtual_board(
            v_match.board_state,
            v_hydrated_placed_tiles
        );

    v_words :=
        public.extract_patxanga_words(
            v_virtual_board,
            v_hydrated_placed_tiles
        );

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        if (v_word->>'type') = 'main' then
            v_main_word := v_word->>'word';
        else
            v_secondary_words := v_secondary_words || jsonb_build_array(v_word);
        end if;
    end loop;

    if char_length(coalesce(v_main_word, '')) < 2 then
        raise exception 'Main word must have at least 2 letters';
    end if;

    v_score :=
        public.calculate_patxanga_score(
            v_words,
            v_match.board_state,
            p_placed_tiles
        );

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        v_is_valid := public.validate_word(v_word->>'word', v_match.language);

        if not v_is_valid then
            v_has_invalid_word := true;
            exit;
        end if;
    end loop;

    return jsonb_build_object(
        'status', 'ok',
        'main_word', v_main_word,
        'secondary_words', v_secondary_words,
        'words', v_words,
        'score', v_score,
        'requires_vote', v_has_invalid_word,
        'is_dictionary_recognized', not v_has_invalid_word,
        'error', null
    );
exception
    when others then
        return jsonb_build_object(
            'status', 'invalid',
            'error', SQLERRM
        );
end;
$$;

grant execute on function public.preview_patxanga_move(uuid, uuid, jsonb)
to authenticated, anon;

## FILE: sql/rpc/submit_move.sql

-- ============================================================
-- PATXANGA - RPC: submit_patxanga_move()
-- Version: 1.7 (Persistent pending_vote + game end)
-- ============================================================

create or replace function public.submit_patxanga_move(
    p_match_id uuid,
    p_player_id uuid,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player record;
    v_hydrated_placed_tiles jsonb;
    v_virtual_board jsonb;
    v_words jsonb;
    v_score jsonb;
    v_word jsonb;
    v_is_valid boolean;
    v_has_invalid_word boolean := false;
    v_main_word text := null;
    v_secondary_words jsonb := '[]'::jsonb;
    v_pending_move_id uuid;
    v_accepted_move_id uuid;
    v_next_player uuid;
    v_new_turn integer;
    v_new_rack jsonb;
    v_draw_result jsonb;
    v_drawn_tiles jsonb;
    v_new_bag jsonb;
    v_tiles_to_draw integer;
    v_end_result jsonb;
begin

    select *
    into v_match
    from patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'active' then
        raise exception 'Match not active';
    end if;

    if v_match.current_turn_player_id <> p_player_id then
        raise exception 'Not your turn';
    end if;

    select *
    into v_player
    from patxanga_players
    where match_id = p_match_id
      and id = p_player_id
    for update;

    if not found then
        raise exception 'Player not found';
    end if;

    perform public.validate_patxanga_tile_ownership(
        v_player.rack_state,
        p_placed_tiles
    );

    perform public.validate_patxanga_move_alignment(
        v_match.board_state,
        p_placed_tiles
    );

    v_hydrated_placed_tiles :=
        public.hydrate_patxanga_placed_tiles(
            v_player.rack_state,
            p_placed_tiles
        );

    v_virtual_board :=
        public.build_patxanga_virtual_board(
            v_match.board_state,
            v_hydrated_placed_tiles
        );

    v_words :=
        public.extract_patxanga_words(
            v_virtual_board,
            v_hydrated_placed_tiles
        );

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        if (v_word->>'type') = 'main' then
            v_main_word := v_word->>'word';
        else
            v_secondary_words := v_secondary_words || jsonb_build_array(v_word);
        end if;
    end loop;

    if char_length(coalesce(v_main_word, '')) < 2 then
        raise exception 'Main word must have at least 2 letters';
    end if;

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        v_is_valid := public.validate_word(v_word->>'word', v_match.language);

        if not v_is_valid then
            v_has_invalid_word := true;
            exit;
        end if;
    end loop;

    -- =========================================
    -- PERSISTENT PENDING_VOTE BRANCH
    -- =========================================
    if v_has_invalid_word then
        insert into patxanga_moves (
            match_id,
            player_id,
            move_type,
            status,
            main_word,
            secondary_words,
            placed_tiles,
            board_diff,
            used_tiles_from_rack,
            used_blank_tile,
            used_skip_tile,
            used_patxanga_real,
            patxanga_real_target_word,
            target_player_skipped_id,
            score_total,
            score_breakdown,
            is_dictionary_recognized,
            requires_vote,
            created_at,
            resolved_at
        )
        values (
            p_match_id,
            p_player_id,
            'place_word',
            'pending_vote',
            v_main_word,
            v_secondary_words,
            p_placed_tiles,
            v_hydrated_placed_tiles,
            p_placed_tiles,
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') = 'wildcard'
            ),
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') = 'skip_turn'
            ),
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') in ('patxanga_real', 'PATXANGA_REAL')
            ),
            null,
            null,
            0,
            jsonb_build_object(
                'status', 'pending_vote',
                'words', v_words
            ),
            false,
            true,
            now(),
            null
        )
        returning id into v_pending_move_id;

        update patxanga_matches
        set status = 'voting',
            updated_at = now()
        where id = p_match_id;

        insert into patxanga_replay_events (
            match_id,
            event_type,
            event_payload,
            turn_number,
            created_at
        )
        values (
            p_match_id,
            'word_rejected',
            jsonb_build_object(
                'move_id', v_pending_move_id,
                'player_id', p_player_id,
                'main_word', v_main_word,
                'words', v_words,
                'requires_vote', true
            ),
            v_match.turn_number,
            now()
        );

        return jsonb_build_object(
            'status', 'pending_vote',
            'move_id', v_pending_move_id,
            'main_word', v_main_word,
            'words', v_words,
            'match_status', 'voting'
        );
    end if;

    -- =========================================
    -- SUCCESS BRANCH
    -- =========================================

    v_score :=
        public.calculate_patxanga_score(
            v_words,
            v_match.board_state,
            p_placed_tiles
        );

    v_new_rack :=
        public.remove_patxanga_tiles_from_rack(
            v_player.rack_state,
            p_placed_tiles
        );

    v_tiles_to_draw := 7 - jsonb_array_length(v_new_rack);

    v_draw_result :=
        public.draw_patxanga_tiles_from_bag(
            v_match.bag_state,
            v_tiles_to_draw
        );

    v_drawn_tiles := v_draw_result->'drawn_tiles';
    v_new_bag := v_draw_result->'new_bag_state';

    v_new_rack := v_new_rack || v_drawn_tiles;

    insert into patxanga_moves (
        match_id,
        player_id,
        move_type,
        status,
        main_word,
        secondary_words,
        placed_tiles,
        board_diff,
        used_tiles_from_rack,
        used_blank_tile,
        used_skip_tile,
        used_patxanga_real,
        patxanga_real_target_word,
        target_player_skipped_id,
        score_total,
        score_breakdown,
        is_dictionary_recognized,
        requires_vote,
        created_at,
        resolved_at
    )
    values (
        p_match_id,
        p_player_id,
        'place_word',
        'accepted',
        v_main_word,
        v_secondary_words,
        p_placed_tiles,
        v_hydrated_placed_tiles,
        p_placed_tiles,
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') = 'wildcard'
        ),
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') = 'skip_turn'
        ),
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') in ('patxanga_real', 'PATXANGA_REAL')
        ),
        null,
        null,
        (v_score->>'total_score')::integer,
        jsonb_build_object(
            'words', v_words,
            'final_score', v_score
        ),
        true,
        false,
        now(),
        now()
    )
    returning id into v_accepted_move_id;

    update patxanga_matches
    set board_state = v_virtual_board,
        bag_state = v_new_bag,
        updated_at = now()
    where id = p_match_id;

    update patxanga_players
    set score = score + (v_score->>'total_score')::integer,
        rack_state = v_new_rack,
        has_passed_last_cycle = false,
        updated_at = now()
    where match_id = p_match_id
      and id = p_player_id;

    -- valid move breaks stagnation cycle for everyone
    update patxanga_players
    set has_passed_last_cycle = false,
        updated_at = now()
    where match_id = p_match_id;

    select id
    into v_next_player
    from patxanga_players
    where match_id = p_match_id
      and turn_order >
          (
              select turn_order
              from patxanga_players
              where match_id = p_match_id
                and id = p_player_id
          )
    order by turn_order
    limit 1;

    if v_next_player is null then
        select id
        into v_next_player
        from patxanga_players
        where match_id = p_match_id
        order by turn_order
        limit 1;
    end if;

    v_new_turn := v_match.turn_number + 1;

    update patxanga_matches
    set current_turn_player_id = v_next_player,
        turn_number = v_new_turn,
        updated_at = now()
    where id = p_match_id;

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        p_match_id,
        'move_submitted',
        jsonb_build_object(
            'move_id', v_accepted_move_id,
            'player_id', p_player_id,
            'placed_tiles', p_placed_tiles,
            'words', v_words,
            'score_breakdown', v_score,
            'tiles_drawn', v_drawn_tiles,
            'next_player', v_next_player
        ),
        v_new_turn,
        now()
    );

    -- Evaluate match end after successful move
    v_end_result := public.evaluate_patxanga_match_end(p_match_id);

    return jsonb_build_object(
        'status', 'success',
        'move_id', v_accepted_move_id,
        'score', v_score,
        'next_player', v_next_player,
        'turn_number', v_new_turn,
        'end_state', v_end_result
    );

end;
$$;

grant execute on function public.submit_patxanga_move(uuid, uuid, jsonb)
to authenticated, anon;

## FILE: sql/rpc/validate_word.sql

-- ============================================================
-- PATXANGA - RPC: validate_word()
-- Version: 1.0
-- ============================================================

drop function if exists public.validate_word(text);
drop function if exists public.validate_word(text, text);

create or replace function public.validate_word(
    p_word text,
    p_language text default 'pt-BR'
)
returns boolean
language plpgsql
stable
as
$$
declare
    v_normalized text;
    v_exists integer;
begin
    if p_word is null then
        return false;
    end if;

    if coalesce(nullif(trim(p_language), ''), '') = '' then
        return false;
    end if;

    v_normalized := public.normalize_patxanga_word(p_word);

    select 1
    into v_exists
    from patxanga_dictionary
    where word_normalized = v_normalized
      and language = p_language
      and is_active = true
    limit 1;

    return v_exists is not null;
end;
$$;

grant execute on function public.validate_word(text, text)
to authenticated, anon;

## FILE: sql/seeds/001_patxanga_distribution.sql

-- ============================================================
-- PATXANGA - LETTER DISTRIBUTION SEED
-- Version: 1.0
-- ============================================================

-- ============================================================
-- TABLE: patxanga_letter_distribution
-- ============================================================

create table if not exists patxanga_letter_distribution (
    id bigserial primary key,

    language text not null check (language in ('pt-BR','pt-PT')),
    letter text not null,
    quantity integer not null,
    points integer not null,

    is_special boolean not null default false,
    special_type text null check (
        special_type in ('wildcard','skip_turn','patxanga_real')
    ),

    created_at timestamp not null default now(),

    unique(language, letter, special_type)
);

-- ============================================================
-- CLEAR EXISTING DATA (SAFE FOR DEV)
-- ============================================================

delete from patxanga_letter_distribution
where language in ('pt-BR','pt-PT');

-- ============================================================
-- INSERT DISTRIBUTION - PATXANGA v1.0
-- ============================================================

-- =============================
-- VOGAIS
-- =============================

insert into patxanga_letter_distribution (language, letter, quantity, points)
values
('pt-BR','A',14,1),
('pt-BR','E',11,1),
('pt-BR','O',9,1),
('pt-BR','I',7,1),
('pt-BR','U',5,2);

-- =============================
-- CONSOANTES FREQUENTES
-- =============================

insert into patxanga_letter_distribution (language, letter, quantity, points)
values
('pt-BR','S',7,1),
('pt-BR','R',6,1),
('pt-BR','N',5,1),
('pt-BR','D',4,2),
('pt-BR','M',4,2),
('pt-BR','T',4,2),
('pt-BR','C',4,2);

-- =============================
-- CONSOANTES INTERMEDIÁRIAS
-- =============================

insert into patxanga_letter_distribution (language, letter, quantity, points)
values
('pt-BR','L',3,2),
('pt-BR','P',2,3),
('pt-BR','B',2,3),
('pt-BR','G',2,3),
('pt-BR','V',2,3),
('pt-BR','F',1,4),
('pt-BR','H',1,4),
('pt-BR','J',1,5);

-- =============================
-- LETRAS ESTRATÉGICAS
-- =============================

insert into patxanga_letter_distribution (language, letter, quantity, points)
values
('pt-BR','Q',2,6),
('pt-BR','X',2,6),
('pt-BR','Z',2,7),
('pt-BR','K',1,7),
('pt-BR','Y',1,7),
('pt-BR','W',1,7);

-- =============================
-- PEÇAS ESPECIAIS
-- Todas são wildcard
-- =============================

insert into patxanga_letter_distribution
(language, letter, quantity, points, is_special, special_type)
values
('pt-BR','*',2,0,true,'wildcard'),          -- Coringas
('pt-BR','SKIP',4,0,true,'skip_turn'),     -- Pular turno
('pt-BR','PR',1,0,true,'patxanga_real');   -- Patxanga Real

-- =============================
-- BASELINE PT-PT
-- =============================

insert into patxanga_letter_distribution
(language, letter, quantity, points, is_special, special_type)
select
    'pt-PT',
    letter,
    quantity,
    points,
    is_special,
    special_type
from patxanga_letter_distribution
where language = 'pt-BR';

-- ============================================================
-- END OF SEED
-- ============================================================

## FILE: sql/seeds/002_dictionary_test_seed.sql

-- ============================================================
-- PATXANGA - DICTIONARY TEST SEED
-- Version: 1.0
-- Purpose: Minimal lexical seed for engine validation
-- ============================================================

insert into patxanga_dictionary (
    language,
    word_original,
    word_normalized,
    source,
    is_active
)
values
('pt-BR', 'SE', 'SE', 'test_seed', true),
('pt-BR', 'DE', 'DE', 'test_seed', true),
('pt-BR', 'EM', 'EM', 'test_seed', true),
('pt-BR', 'ME', 'ME', 'test_seed', true),
('pt-BR', 'TE', 'TE', 'test_seed', true),
('pt-BR', 'DA', 'DA', 'test_seed', true),
('pt-BR', 'DO', 'DO', 'test_seed', true),
('pt-BR', 'EU', 'EU', 'test_seed', true),
('pt-BR', 'TU', 'TU', 'test_seed', true),
('pt-BR', 'NO', 'NO', 'test_seed', true),
('pt-BR', 'NA', 'NA', 'test_seed', true),
('pt-BR', 'RE', 'RE', 'test_seed', true)
on conflict (language, word_normalized) do update
set word_original = excluded.word_original,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = now();

## FILE: sql/seeds/003_dictionary_pt_br_core_seed.sql

-- ============================================================
-- PATXANGA - PT-BR CORE DICTIONARY SEED
-- Version: 1.0
-- Purpose: Small real-word seed for deterministic QA
-- ============================================================

insert into patxanga_dictionary (
    language,
    word_original,
    word_normalized,
    source,
    is_active
)
values
('pt-BR', 'AMOR', public.normalize_patxanga_word('AMOR'), 'pt_br_core_seed', true),
('pt-BR', 'AÇÃO', public.normalize_patxanga_word('AÇÃO'), 'pt_br_core_seed', true),
('pt-BR', 'BOLA', public.normalize_patxanga_word('BOLA'), 'pt_br_core_seed', true),
('pt-BR', 'CASA', public.normalize_patxanga_word('CASA'), 'pt_br_core_seed', true),
('pt-BR', 'GATO', public.normalize_patxanga_word('GATO'), 'pt_br_core_seed', true),
('pt-BR', 'JOGO', public.normalize_patxanga_word('JOGO'), 'pt_br_core_seed', true),
('pt-BR', 'LIVRO', public.normalize_patxanga_word('LIVRO'), 'pt_br_core_seed', true),
('pt-BR', 'LUA', public.normalize_patxanga_word('LUA'), 'pt_br_core_seed', true),
('pt-BR', 'MÃO', public.normalize_patxanga_word('MÃO'), 'pt_br_core_seed', true),
('pt-BR', 'MAR', public.normalize_patxanga_word('MAR'), 'pt_br_core_seed', true),
('pt-BR', 'MESA', public.normalize_patxanga_word('MESA'), 'pt_br_core_seed', true),
('pt-BR', 'PÃO', public.normalize_patxanga_word('PÃO'), 'pt_br_core_seed', true),
('pt-BR', 'PATO', public.normalize_patxanga_word('PATO'), 'pt_br_core_seed', true),
('pt-BR', 'PORTA', public.normalize_patxanga_word('PORTA'), 'pt_br_core_seed', true),
('pt-BR', 'RUA', public.normalize_patxanga_word('RUA'), 'pt_br_core_seed', true),
('pt-BR', 'SOL', public.normalize_patxanga_word('SOL'), 'pt_br_core_seed', true),
('pt-BR', 'TEMPO', public.normalize_patxanga_word('TEMPO'), 'pt_br_core_seed', true),
('pt-BR', 'VIDA', public.normalize_patxanga_word('VIDA'), 'pt_br_core_seed', true)
on conflict (language, word_normalized) do update
set word_original = excluded.word_original,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = now();

## FILE: sql/seeds/004_dictionary_pt_pt_core_seed.sql

-- ============================================================
-- PATXANGA - PT-PT CORE DICTIONARY SEED
-- Version: 1.0
-- Purpose: Small real-word seed for deterministic QA
-- ============================================================

insert into patxanga_dictionary (
    language,
    word_original,
    word_normalized,
    source,
    is_active
)
values
('pt-PT', 'AMOR', public.normalize_patxanga_word('AMOR'), 'pt_pt_core_seed', true),
('pt-PT', 'AÇÃO', public.normalize_patxanga_word('AÇÃO'), 'pt_pt_core_seed', true),
('pt-PT', 'BOLA', public.normalize_patxanga_word('BOLA'), 'pt_pt_core_seed', true),
('pt-PT', 'CASA', public.normalize_patxanga_word('CASA'), 'pt_pt_core_seed', true),
('pt-PT', 'GATO', public.normalize_patxanga_word('GATO'), 'pt_pt_core_seed', true),
('pt-PT', 'JOGO', public.normalize_patxanga_word('JOGO'), 'pt_pt_core_seed', true),
('pt-PT', 'LIVRO', public.normalize_patxanga_word('LIVRO'), 'pt_pt_core_seed', true),
('pt-PT', 'LUA', public.normalize_patxanga_word('LUA'), 'pt_pt_core_seed', true),
('pt-PT', 'MÃO', public.normalize_patxanga_word('MÃO'), 'pt_pt_core_seed', true),
('pt-PT', 'MAR', public.normalize_patxanga_word('MAR'), 'pt_pt_core_seed', true),
('pt-PT', 'MESA', public.normalize_patxanga_word('MESA'), 'pt_pt_core_seed', true),
('pt-PT', 'PÃO', public.normalize_patxanga_word('PÃO'), 'pt_pt_core_seed', true),
('pt-PT', 'PATO', public.normalize_patxanga_word('PATO'), 'pt_pt_core_seed', true),
('pt-PT', 'PORTA', public.normalize_patxanga_word('PORTA'), 'pt_pt_core_seed', true),
('pt-PT', 'RUA', public.normalize_patxanga_word('RUA'), 'pt_pt_core_seed', true),
('pt-PT', 'SOL', public.normalize_patxanga_word('SOL'), 'pt_pt_core_seed', true),
('pt-PT', 'TEMPO', public.normalize_patxanga_word('TEMPO'), 'pt_pt_core_seed', true),
('pt-PT', 'VIDA', public.normalize_patxanga_word('VIDA'), 'pt_pt_core_seed', true)
on conflict (language, word_normalized) do update
set word_original = excluded.word_original,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = now();

## FILE: sql/tests/test_dictionary_contract.sql

-- ============================================================
-- PATXANGA - TEST: dictionary contract and real-word validation
-- Purpose: validate language, normalization, inactive entries and engine path
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_pt_pt_user1 uuid := gen_random_uuid();
    v_pt_pt_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_pt_pt_match_id uuid;
    v_current_player_id uuid;
    v_pt_pt_player_id uuid;
    v_tile_c_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_tile_s_id uuid := gen_random_uuid();
    v_tile_a2_id uuid := gen_random_uuid();
    v_pt_pt_tile_c_id uuid := gen_random_uuid();
    v_pt_pt_tile_a_id uuid := gen_random_uuid();
    v_pt_pt_tile_s_id uuid := gen_random_uuid();
    v_pt_pt_tile_a2_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_pt_pt_forced_rack jsonb;
    v_pt_pt_preview_result jsonb;
    v_pt_pt_submit_result jsonb;
    v_submit_result jsonb;
    v_dictionary_row_count integer;
    v_dictionary_import_column_count integer;
    v_real_seed_count integer;
    v_pt_pt_seed_count integer;
    v_accepted_move_count integer;
    v_pt_pt_accepted_move_count integer;
begin
    select count(*)
    into v_dictionary_row_count
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'patxanga_dictionary'
      and column_name in ('language', 'source', 'is_active', 'created_at', 'updated_at');

    if v_dictionary_row_count <> 5 then
        raise exception 'Expected dictionary contract columns to exist, got %', v_dictionary_row_count;
    end if;

    select count(*)
    into v_dictionary_import_column_count
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'patxanga_dictionary'
      and column_name in (
          'source_version',
          'license_name',
          'license_url',
          'source_url',
          'import_batch_id',
          'imported_at'
      );

    if v_dictionary_import_column_count <> 6 then
        raise exception 'Expected dictionary import metadata columns to exist, got %',
            v_dictionary_import_column_count;
    end if;

    select count(*)
    into v_real_seed_count
    from patxanga_dictionary
    where language = 'pt-BR'
      and source = 'pt_br_core_seed'
      and is_active = true
      and word_normalized in ('AMOR', 'ACAO', 'CASA', 'MESA', 'PAO');

    if v_real_seed_count <> 5 then
        raise exception 'Expected 5 active real seed words, got %', v_real_seed_count;
    end if;

    select count(*)
    into v_pt_pt_seed_count
    from patxanga_dictionary
    where language = 'pt-PT'
      and source = 'pt_pt_core_seed'
      and is_active = true
      and word_normalized in ('AMOR', 'ACAO', 'CASA', 'MESA', 'PAO');

    if v_pt_pt_seed_count <> 5 then
        raise exception 'Expected 5 active pt-PT seed words, got %', v_pt_pt_seed_count;
    end if;

    if public.validate_word('ação', 'pt-BR') is not true then
        raise exception 'Expected lowercase accented ação to validate in pt-BR';
    end if;

    if public.validate_word('ACAO', 'pt-BR') is not true then
        raise exception 'Expected unaccented ACAO to validate in pt-BR';
    end if;

    if public.validate_word('ação', 'es-ES') is not false then
        raise exception 'Expected ação not to validate in es-ES';
    end if;

    if public.validate_word('AÇÃO', '') is not false then
        raise exception 'Expected empty language not to validate';
    end if;

    if public.validate_word('CASA', 'pt-PT') is not true then
        raise exception 'Expected CASA to validate in pt-PT through pt-PT seed';
    end if;

    update patxanga_dictionary
    set is_active = false,
        updated_at = now()
    where language = 'pt-BR'
      and word_normalized = public.normalize_patxanga_word('AÇÃO');

    if public.validate_word('AÇÃO', 'pt-BR') is not false then
        raise exception 'Expected inactive AÇÃO not to validate';
    end if;

    update patxanga_dictionary
    set is_active = true,
        updated_at = now()
    where language = 'pt-BR'
      and word_normalized = public.normalize_patxanga_word('AÇÃO');

    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_c_id::text, 'letter', 'C', 'points', 3, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_a2_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_current_player_id;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile_c_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_s_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_a2_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_submit_result->>'status' <> 'success' then
        raise exception 'Expected CASA move success through real dictionary seed, got %', v_submit_result;
    end if;

    if v_submit_result->>'move_id' is null then
        raise exception 'Expected CASA move_id, got %', v_submit_result;
    end if;

    select count(*)
    into v_accepted_move_count
    from patxanga_moves
    where id = (v_submit_result->>'move_id')::uuid
      and match_id = v_match_id
      and player_id = v_current_player_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'CASA'
      and is_dictionary_recognized = true;

    if v_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted CASA move, got %', v_accepted_move_count;
    end if;

    v_pt_pt_match_id := public.create_patxanga_match(
        p_host_user_id := v_pt_pt_user1,
        p_language := 'pt-PT',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_pt_pt_match_id,
        p_user_id := v_pt_pt_user2
    );

    perform public.start_patxanga_match(v_pt_pt_match_id);

    select current_turn_player_id
    into v_pt_pt_player_id
    from patxanga_matches
    where id = v_pt_pt_match_id;

    v_pt_pt_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_pt_pt_tile_c_id::text, 'letter', 'C', 'points', 3, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_pt_pt_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_pt_pt_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_pt_pt_tile_a2_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_pt_pt_forced_rack,
        updated_at = now()
    where id = v_pt_pt_player_id;

    v_pt_pt_preview_result := public.preview_patxanga_move(
        v_pt_pt_match_id,
        v_pt_pt_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_pt_pt_tile_c_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_s_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_a2_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_pt_pt_preview_result->>'status' <> 'ok' then
        raise exception 'Expected pt-PT CASA preview ok structurally, got %', v_pt_pt_preview_result;
    end if;

    if v_pt_pt_preview_result->>'main_word' <> 'CASA' then
        raise exception 'Expected pt-PT preview main_word CASA, got %', v_pt_pt_preview_result;
    end if;

    if coalesce((v_pt_pt_preview_result->>'requires_vote')::boolean, true) is not false then
        raise exception 'Expected pt-PT CASA preview not to require vote, got %', v_pt_pt_preview_result;
    end if;

    if coalesce((v_pt_pt_preview_result->>'is_dictionary_recognized')::boolean, false) is not true then
        raise exception 'Expected pt-PT CASA preview to be dictionary-recognized, got %', v_pt_pt_preview_result;
    end if;

    v_pt_pt_submit_result := public.submit_patxanga_move(
        v_pt_pt_match_id,
        v_pt_pt_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_pt_pt_tile_c_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_s_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_pt_pt_tile_a2_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_pt_pt_submit_result->>'status' <> 'success' then
        raise exception 'Expected pt-PT CASA submit success, got %', v_pt_pt_submit_result;
    end if;

    if v_pt_pt_submit_result->>'move_id' is null then
        raise exception 'Expected pt-PT CASA move_id, got %', v_pt_pt_submit_result;
    end if;

    select count(*)
    into v_pt_pt_accepted_move_count
    from patxanga_moves
    where id = (v_pt_pt_submit_result->>'move_id')::uuid
      and match_id = v_pt_pt_match_id
      and player_id = v_pt_pt_player_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'CASA'
      and is_dictionary_recognized = true
      and requires_vote = false;

    if v_pt_pt_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 pt-PT accepted CASA move, got %', v_pt_pt_accepted_move_count;
    end if;

    raise notice 'Dictionary contract test passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'pt_pt_match_id=%', v_pt_pt_match_id;
    raise notice 'submit_result=%', v_submit_result;
    raise notice 'pt_pt_preview_result=%', v_pt_pt_preview_result;
    raise notice 'pt_pt_submit_result=%', v_pt_pt_submit_result;
    raise notice 'real_seed_count=%', v_real_seed_count;
    raise notice 'pt_pt_seed_count=%', v_pt_pt_seed_count;
end $$;

## FILE: sql/tests/test_dictionary_import_pipeline.sql

-- ============================================================
-- PATXANGA - TEST: dictionary import pipeline
-- Purpose: validate audited, idempotent dictionary imports
-- ============================================================

do $$
declare
    v_result jsonb;
    v_second_result jsonb;
    v_error_caught boolean := false;
    v_batch_count integer;
    v_dictionary_count integer;
    v_active_count integer;
    v_inactive_count integer;
    v_metadata jsonb;
begin
    if has_function_privilege(
        'anon',
        'public.import_patxanga_dictionary_entries(text,text,text,jsonb,text,text,text,text,jsonb,boolean)',
        'execute'
    ) then
        raise exception 'Expected anon not to execute dictionary import RPC';
    end if;

    if has_function_privilege(
        'authenticated',
        'public.import_patxanga_dictionary_entries(text,text,text,jsonb,text,text,text,text,jsonb,boolean)',
        'execute'
    ) then
        raise exception 'Expected authenticated not to execute dictionary import RPC';
    end if;

    if has_function_privilege(
        'service_role',
        'public.import_patxanga_dictionary_entries(text,text,text,jsonb,text,text,text,text,jsonb,boolean)',
        'execute'
    ) is not true then
        raise exception 'Expected service_role to execute dictionary import RPC';
    end if;

    delete from public.patxanga_dictionary
    where source = 'import_pipeline_test';

    delete from public.patxanga_dictionary_import_batches
    where source = 'import_pipeline_test';

    select public.import_patxanga_dictionary_entries(
        p_language := 'pt-BR',
        p_source := 'import_pipeline_test',
        p_license_name := 'Test License',
        p_entries := jsonb_build_array(
            jsonb_build_object('word', 'RATO'),
            jsonb_build_object('word', 'árvore'),
            jsonb_build_object('word', 'rato'),
            jsonb_build_object('word', ''),
            jsonb_build_object('word', 'PEIXE', 'is_active', false)
        ),
        p_source_version := 'fixture-v1',
        p_license_url := 'https://example.test/license',
        p_source_url := 'https://example.test/source',
        p_imported_by := 'sql-test',
        p_metadata := jsonb_build_object('fixture', true),
        p_deactivate_missing := false
    )
    into v_result;

    if v_result->>'status' <> 'success' then
        raise exception 'Expected import success, got %', v_result;
    end if;

    if (v_result->>'total_rows')::integer <> 5 then
        raise exception 'Expected 5 total rows, got %', v_result;
    end if;

    if (v_result->>'valid_rows')::integer <> 3 then
        raise exception 'Expected 3 distinct valid rows, got %', v_result;
    end if;

    if (v_result->>'inserted_count')::integer <> 3 then
        raise exception 'Expected 3 inserted rows, got %', v_result;
    end if;

    if (v_result->>'skipped_count')::integer <> 2 then
        raise exception 'Expected 2 skipped rows, got %', v_result;
    end if;

    if public.validate_word('arvore', 'pt-BR') is not true then
        raise exception 'Expected imported ARVORE to validate';
    end if;

    if public.validate_word('PEIXE', 'pt-BR') is not false then
        raise exception 'Expected imported inactive PEIXE not to validate';
    end if;

    select count(*)
    into v_dictionary_count
    from public.patxanga_dictionary
    where language = 'pt-BR'
      and source = 'import_pipeline_test'
      and source_version = 'fixture-v1'
      and license_name = 'Test License'
      and import_batch_id = (v_result->>'batch_id')::uuid
      and word_normalized in ('RATO', 'ARVORE', 'PEIXE');

    if v_dictionary_count <> 3 then
        raise exception 'Expected 3 dictionary rows linked to first import batch, got %', v_dictionary_count;
    end if;

    select count(*), metadata
    into v_batch_count, v_metadata
    from public.patxanga_dictionary_import_batches
    where id = (v_result->>'batch_id')::uuid
    group by metadata;

    if v_batch_count <> 1 then
        raise exception 'Expected first import batch row, got %', v_batch_count;
    end if;

    if v_metadata->>'fixture' <> 'true' then
        raise exception 'Expected metadata fixture=true, got %', v_metadata;
    end if;

    select public.import_patxanga_dictionary_entries(
        p_language := 'pt-BR',
        p_source := 'import_pipeline_test',
        p_license_name := 'Test License',
        p_entries := jsonb_build_array(
            jsonb_build_object('word', 'RATO')
        ),
        p_source_version := 'fixture-v2',
        p_license_url := 'https://example.test/license',
        p_source_url := 'https://example.test/source',
        p_imported_by := 'sql-test',
        p_metadata := jsonb_build_object('fixture', true, 'replacement', true),
        p_deactivate_missing := true
    )
    into v_second_result;

    if (v_second_result->>'inserted_count')::integer <> 0 then
        raise exception 'Expected second import to insert 0 rows, got %', v_second_result;
    end if;

    if (v_second_result->>'updated_count')::integer <> 1 then
        raise exception 'Expected second import to update RATO, got %', v_second_result;
    end if;

    if (v_second_result->>'deactivated_count')::integer <> 1 then
        raise exception 'Expected second import to deactivate ARVORE only, got %', v_second_result;
    end if;

    select count(*)
    into v_active_count
    from public.patxanga_dictionary
    where language = 'pt-BR'
      and source = 'import_pipeline_test'
      and is_active = true;

    if v_active_count <> 1 then
        raise exception 'Expected one active row after replacement import, got %', v_active_count;
    end if;

    select count(*)
    into v_inactive_count
    from public.patxanga_dictionary
    where language = 'pt-BR'
      and source = 'import_pipeline_test'
      and is_active = false
      and word_normalized in ('ARVORE', 'PEIXE');

    if v_inactive_count <> 2 then
        raise exception 'Expected ARVORE and PEIXE inactive after replacement, got %', v_inactive_count;
    end if;

    begin
        perform public.import_patxanga_dictionary_entries(
            p_language := 'es-ES',
            p_source := 'import_pipeline_test',
            p_license_name := 'Test License',
            p_entries := '[]'::jsonb
        );
    exception
        when others then
            v_error_caught := true;
    end;

    if v_error_caught is not true then
        raise exception 'Expected unsupported language import to fail';
    end if;

    raise notice 'Dictionary import pipeline test passed';
    raise notice 'first_result=%', v_result;
    raise notice 'second_result=%', v_second_result;

    delete from public.patxanga_dictionary
    where source = 'import_pipeline_test';

    delete from public.patxanga_dictionary_import_batches
    where source = 'import_pipeline_test';
end $$;

## FILE: sql/tests/test_dictionary_imported_words_engine_path.sql

-- ============================================================
-- PATXANGA - TEST: imported dictionary words through engine path
-- Purpose: validate imported words in validate, preview and submit
-- ============================================================

do $$
declare
    v_pt_br_user1 uuid := gen_random_uuid();
    v_pt_br_user2 uuid := gen_random_uuid();
    v_pt_pt_user1 uuid := gen_random_uuid();
    v_pt_pt_user2 uuid := gen_random_uuid();
    v_pt_br_match_id uuid;
    v_pt_pt_match_id uuid;
    v_pt_br_player_id uuid;
    v_pt_pt_player_id uuid;
    v_pt_br_import_result jsonb;
    v_pt_pt_import_result jsonb;
    v_pt_br_preview_result jsonb;
    v_pt_pt_preview_result jsonb;
    v_pt_br_submit_result jsonb;
    v_pt_pt_submit_result jsonb;
    v_pt_br_accepted_move_count integer;
    v_pt_pt_accepted_move_count integer;
    v_pt_br_source_row_count integer;
    v_pt_pt_source_row_count integer;
    v_n_id uuid := gen_random_uuid();
    v_e_id uuid := gen_random_uuid();
    v_x_id uuid := gen_random_uuid();
    v_o_id uuid := gen_random_uuid();
    v_a1_id uuid := gen_random_uuid();
    v_b_id uuid := gen_random_uuid();
    v_a2_id uuid := gen_random_uuid();
    v_c_id uuid := gen_random_uuid();
    v_o2_id uuid := gen_random_uuid();
begin
    delete from public.patxanga_dictionary
    where source = 'imported_words_engine_test';

    delete from public.patxanga_dictionary_import_batches
    where source = 'imported_words_engine_test';

    if public.validate_word('NEXO', 'pt-BR') is true then
        raise exception 'Fixture word NEXO unexpectedly validates before import';
    end if;

    if public.validate_word('ABACO', 'pt-PT') is true then
        raise exception 'Fixture word ABACO unexpectedly validates before import';
    end if;

    select public.import_patxanga_dictionary_entries(
        p_language := 'pt-BR',
        p_source := 'imported_words_engine_test',
        p_license_name := 'Test Fixture License',
        p_entries := jsonb_build_array(
            jsonb_build_object('word', 'NEXO'),
            jsonb_build_object('word', 'FALSO', 'is_active', false)
        ),
        p_source_version := 'fixture-v1',
        p_license_url := 'https://example.test/license',
        p_source_url := 'https://example.test/pt-br-source',
        p_imported_by := 'sql-test',
        p_metadata := jsonb_build_object(
            'fixture', true,
            'policy', 'docs/lexical-policy-v1.0.md'
        ),
        p_deactivate_missing := false
    )
    into v_pt_br_import_result;

    select public.import_patxanga_dictionary_entries(
        p_language := 'pt-PT',
        p_source := 'imported_words_engine_test',
        p_license_name := 'Test Fixture License',
        p_entries := jsonb_build_array(
            jsonb_build_object('word', 'ÁBACO')
        ),
        p_source_version := 'fixture-v1',
        p_license_url := 'https://example.test/license',
        p_source_url := 'https://example.test/pt-pt-source',
        p_imported_by := 'sql-test',
        p_metadata := jsonb_build_object(
            'fixture', true,
            'policy', 'docs/lexical-policy-v1.0.md'
        ),
        p_deactivate_missing := false
    )
    into v_pt_pt_import_result;

    if (v_pt_br_import_result->>'inserted_count')::integer <> 2 then
        raise exception 'Expected pt-BR fixture import to insert 2 rows, got %',
            v_pt_br_import_result;
    end if;

    if (v_pt_pt_import_result->>'inserted_count')::integer <> 1 then
        raise exception 'Expected pt-PT fixture import to insert 1 row, got %',
            v_pt_pt_import_result;
    end if;

    if public.validate_word('NEXO', 'pt-BR') is not true then
        raise exception 'Expected imported pt-BR NEXO to validate';
    end if;

    if public.validate_word('FALSO', 'pt-BR') is not false then
        raise exception 'Expected inactive imported pt-BR FALSO not to validate';
    end if;

    if public.validate_word('nexo', 'pt-PT') is not false then
        raise exception 'Expected imported pt-BR NEXO not to leak into pt-PT';
    end if;

    if public.validate_word('ABACO', 'pt-PT') is not true then
        raise exception 'Expected imported pt-PT ABACO to validate from ÁBACO';
    end if;

    if public.validate_word('ábaco', 'pt-PT') is not true then
        raise exception 'Expected lowercase accented pt-PT ábaco to validate';
    end if;

    select count(*)
    into v_pt_br_source_row_count
    from public.patxanga_dictionary
    where language = 'pt-BR'
      and source = 'imported_words_engine_test'
      and word_normalized in ('NEXO', 'FALSO');

    if v_pt_br_source_row_count <> 2 then
        raise exception 'Expected 2 pt-BR imported source rows, got %',
            v_pt_br_source_row_count;
    end if;

    select count(*)
    into v_pt_pt_source_row_count
    from public.patxanga_dictionary
    where language = 'pt-PT'
      and source = 'imported_words_engine_test'
      and word_normalized = 'ABACO';

    if v_pt_pt_source_row_count <> 1 then
        raise exception 'Expected 1 pt-PT imported source row, got %',
            v_pt_pt_source_row_count;
    end if;

    v_pt_br_match_id := public.create_patxanga_match(
        p_host_user_id := v_pt_br_user1,
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_pt_br_match_id,
        p_user_id := v_pt_br_user2
    );

    perform public.start_patxanga_match(v_pt_br_match_id);

    select current_turn_player_id
    into v_pt_br_player_id
    from public.patxanga_matches
    where id = v_pt_br_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_n_id::text, 'letter', 'N', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_e_id::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_x_id::text, 'letter', 'X', 'points', 6, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_o_id::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_pt_br_player_id;

    v_pt_br_preview_result := public.preview_patxanga_move(
        v_pt_br_match_id,
        v_pt_br_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_n_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_e_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_x_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_o_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_pt_br_preview_result->>'status' <> 'ok' then
        raise exception 'Expected pt-BR imported NEXO preview ok, got %',
            v_pt_br_preview_result;
    end if;

    if v_pt_br_preview_result->>'main_word' <> 'NEXO' then
        raise exception 'Expected pt-BR preview main_word NEXO, got %',
            v_pt_br_preview_result;
    end if;

    if coalesce((v_pt_br_preview_result->>'requires_vote')::boolean, true) is not false then
        raise exception 'Expected imported pt-BR NEXO not to require vote, got %',
            v_pt_br_preview_result;
    end if;

    v_pt_br_submit_result := public.submit_patxanga_move(
        v_pt_br_match_id,
        v_pt_br_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_n_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_e_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_x_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_o_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_pt_br_submit_result->>'status' <> 'success' then
        raise exception 'Expected imported pt-BR NEXO submit success, got %',
            v_pt_br_submit_result;
    end if;

    select count(*)
    into v_pt_br_accepted_move_count
    from public.patxanga_moves
    where id = (v_pt_br_submit_result->>'move_id')::uuid
      and match_id = v_pt_br_match_id
      and player_id = v_pt_br_player_id
      and main_word = 'NEXO'
      and status = 'accepted'
      and is_dictionary_recognized = true
      and requires_vote = false;

    if v_pt_br_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted imported pt-BR NEXO move, got %',
            v_pt_br_accepted_move_count;
    end if;

    v_pt_pt_match_id := public.create_patxanga_match(
        p_host_user_id := v_pt_pt_user1,
        p_language := 'pt-PT',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_pt_pt_match_id,
        p_user_id := v_pt_pt_user2
    );

    perform public.start_patxanga_match(v_pt_pt_match_id);

    select current_turn_player_id
    into v_pt_pt_player_id
    from public.patxanga_matches
    where id = v_pt_pt_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_a1_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_b_id::text, 'letter', 'B', 'points', 3, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_a2_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_c_id::text, 'letter', 'C', 'points', 2, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_o2_id::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_pt_pt_player_id;

    v_pt_pt_preview_result := public.preview_patxanga_move(
        v_pt_pt_match_id,
        v_pt_pt_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_a1_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_b_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a2_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_c_id::text, 'row', 8, 'col', 11, 'declared_letter', null),
            jsonb_build_object('tile_id', v_o2_id::text, 'row', 8, 'col', 12, 'declared_letter', null)
        )
    );

    if v_pt_pt_preview_result->>'status' <> 'ok' then
        raise exception 'Expected pt-PT imported ABACO preview ok, got %',
            v_pt_pt_preview_result;
    end if;

    if v_pt_pt_preview_result->>'main_word' <> 'ABACO' then
        raise exception 'Expected pt-PT preview main_word ABACO, got %',
            v_pt_pt_preview_result;
    end if;

    if coalesce((v_pt_pt_preview_result->>'requires_vote')::boolean, true) is not false then
        raise exception 'Expected imported pt-PT ABACO not to require vote, got %',
            v_pt_pt_preview_result;
    end if;

    v_pt_pt_submit_result := public.submit_patxanga_move(
        v_pt_pt_match_id,
        v_pt_pt_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_a1_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_b_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a2_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_c_id::text, 'row', 8, 'col', 11, 'declared_letter', null),
            jsonb_build_object('tile_id', v_o2_id::text, 'row', 8, 'col', 12, 'declared_letter', null)
        )
    );

    if v_pt_pt_submit_result->>'status' <> 'success' then
        raise exception 'Expected imported pt-PT ABACO submit success, got %',
            v_pt_pt_submit_result;
    end if;

    select count(*)
    into v_pt_pt_accepted_move_count
    from public.patxanga_moves
    where id = (v_pt_pt_submit_result->>'move_id')::uuid
      and match_id = v_pt_pt_match_id
      and player_id = v_pt_pt_player_id
      and main_word = 'ABACO'
      and status = 'accepted'
      and is_dictionary_recognized = true
      and requires_vote = false;

    if v_pt_pt_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted imported pt-PT ABACO move, got %',
            v_pt_pt_accepted_move_count;
    end if;

    raise notice 'Dictionary imported words engine path test passed';
    raise notice 'pt_br_import_result=%', v_pt_br_import_result;
    raise notice 'pt_pt_import_result=%', v_pt_pt_import_result;
    raise notice 'pt_br_preview_result=%', v_pt_br_preview_result;
    raise notice 'pt_pt_preview_result=%', v_pt_pt_preview_result;
    raise notice 'pt_br_submit_result=%', v_pt_br_submit_result;
    raise notice 'pt_pt_submit_result=%', v_pt_pt_submit_result;

    delete from public.patxanga_dictionary
    where source = 'imported_words_engine_test';

    delete from public.patxanga_dictionary_import_batches
    where source = 'imported_words_engine_test';
end $$;

## FILE: sql/tests/test_dictionary_policy_voting_path.sql

-- ============================================================
-- PATXANGA - TEST: lexical policy voting path
-- Purpose: unrecognized policy-edge words require voting and do not mutate board
-- ============================================================

do $$
declare
    v_user1 uuid := gen_random_uuid();
    v_user2 uuid := gen_random_uuid();
    v_match_id uuid;
    v_current_player_id uuid;
    v_n_id uuid := gen_random_uuid();
    v_a1_id uuid := gen_random_uuid();
    v_s_id uuid := gen_random_uuid();
    v_a2_id uuid := gen_random_uuid();
    v_preview_result jsonb;
    v_submit_result jsonb;
    v_pending_move_count integer;
    v_board_center jsonb;
begin
    if public.validate_word('NASA', 'pt-BR') is true then
        raise exception 'Expected policy-edge word NASA not to validate before voting';
    end if;

    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_user1,
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_user2
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_current_player_id
    from public.patxanga_matches
    where id = v_match_id;

    update public.patxanga_players
    set rack_state = jsonb_build_array(
            jsonb_build_object('id', v_n_id::text, 'letter', 'N', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_a1_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', v_a2_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
            jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null)
        ),
        updated_at = now()
    where id = v_current_player_id;

    v_preview_result := public.preview_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_n_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a1_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_s_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a2_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_preview_result->>'status' <> 'ok' then
        raise exception 'Expected NASA preview to be structurally ok, got %',
            v_preview_result;
    end if;

    if v_preview_result->>'main_word' <> 'NASA' then
        raise exception 'Expected preview main_word NASA, got %', v_preview_result;
    end if;

    if coalesce((v_preview_result->>'requires_vote')::boolean, false) is not true then
        raise exception 'Expected unrecognized NASA preview to require vote, got %',
            v_preview_result;
    end if;

    if coalesce((v_preview_result->>'is_dictionary_recognized')::boolean, true) is not false then
        raise exception 'Expected unrecognized NASA preview not dictionary-recognized, got %',
            v_preview_result;
    end if;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_n_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a1_id::text, 'row', 8, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_s_id::text, 'row', 8, 'col', 10, 'declared_letter', null),
            jsonb_build_object('tile_id', v_a2_id::text, 'row', 8, 'col', 11, 'declared_letter', null)
        )
    );

    if v_submit_result->>'status' <> 'pending_vote' then
        raise exception 'Expected NASA submit to enter pending_vote, got %',
            v_submit_result;
    end if;

    if v_submit_result->>'main_word' <> 'NASA' then
        raise exception 'Expected pending vote main_word NASA, got %',
            v_submit_result;
    end if;

    select count(*)
    into v_pending_move_count
    from public.patxanga_moves
    where id = (v_submit_result->>'move_id')::uuid
      and match_id = v_match_id
      and player_id = v_current_player_id
      and main_word = 'NASA'
      and status = 'pending_vote'
      and is_dictionary_recognized = false
      and requires_vote = true;

    if v_pending_move_count <> 1 then
        raise exception 'Expected exactly 1 pending_vote NASA move, got %',
            v_pending_move_count;
    end if;

    select board_state->7->7->'tile'
    into v_board_center
    from public.patxanga_matches
    where id = v_match_id;

    if v_board_center <> 'null'::jsonb then
        raise exception 'Expected board center to remain empty before vote resolution, got %',
            v_board_center;
    end if;

    if (
        select status
        from public.patxanga_matches
        where id = v_match_id
    ) <> 'voting' then
        raise exception 'Expected match to be in voting status after NASA submit';
    end if;

    raise notice 'Dictionary policy voting path test passed';
    raise notice 'preview_result=%', v_preview_result;
    raise notice 'submit_result=%', v_submit_result;
end $$;

## FILE: sql/simulations/bot_simulation_smoke.sql

-- ============================================================
-- PATXANGA - BOT SIMULATION SMOKE
-- Purpose: deterministic bot-vs-bot simulation for QA
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_bot_alpha_player_id uuid;
    v_bot_beta_player_id uuid;
    v_bot_count integer;
    v_current_player_id uuid;
    v_next_player_id uuid;
    v_tile_d_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_submit_result jsonb;
    v_pass_result jsonb;
    v_total_score integer;
    v_accepted_place_word_count integer;
    v_pass_move_count integer;
    v_move_replay_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Alpha',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_bot_alpha_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Alpha',
        updated_at = now()
    where id = v_bot_alpha_player_id;

    v_bot_beta_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    select count(*)
    into v_bot_count
    from patxanga_players
    where match_id = v_match_id
      and is_bot = true;

    if v_bot_count <> 2 then
        raise exception 'Expected 2 bot players, got %', v_bot_count;
    end if;

    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    if not exists (
        select 1
        from patxanga_players
        where id = v_current_player_id
          and match_id = v_match_id
          and is_bot = true
    ) then
        raise exception 'Current player is not a bot: %', v_current_player_id;
    end if;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object(
            'id', v_tile_d_id::text,
            'letter', 'D',
            'points', 2,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object(
            'id', v_tile_a_id::text,
            'letter', 'A',
            'points', 1,
            'is_special', false,
            'special_type', null
        ),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_current_player_id;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_current_player_id,
        jsonb_build_array(
            jsonb_build_object(
                'tile_id', v_tile_d_id::text,
                'row', 8,
                'col', 8,
                'declared_letter', null
            ),
            jsonb_build_object(
                'tile_id', v_tile_a_id::text,
                'row', 8,
                'col', 9,
                'declared_letter', null
            )
        )
    );

    if v_submit_result->>'status' <> 'success' then
        raise exception 'Expected bot move success, got %', v_submit_result;
    end if;

    if v_submit_result->>'move_id' is null then
        raise exception 'Expected accepted move_id in bot move result, got %', v_submit_result;
    end if;

    v_total_score := (v_submit_result->'score'->>'total_score')::integer;

    if v_total_score <> 6 then
        raise exception 'Expected opening DA score 6, got % from %', v_total_score, v_submit_result;
    end if;

    select current_turn_player_id
    into v_next_player_id
    from patxanga_matches
    where id = v_match_id;

    if v_next_player_id = v_current_player_id then
        raise exception 'Turn did not advance after bot move';
    end if;

    if not exists (
        select 1
        from patxanga_players
        where id = v_next_player_id
          and match_id = v_match_id
          and is_bot = true
    ) then
        raise exception 'Next player is not a bot: %', v_next_player_id;
    end if;

    select count(*)
    into v_accepted_place_word_count
    from patxanga_moves
    where match_id = v_match_id
      and player_id = v_current_player_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'DA'
      and score_total = 6;

    if v_accepted_place_word_count <> 1 then
        raise exception 'Expected exactly 1 accepted bot place_word move, got %', v_accepted_place_word_count;
    end if;

    v_pass_result := public.submit_patxanga_pass_turn(
        v_match_id,
        v_next_player_id
    );

    if v_pass_result->>'status' <> 'success' then
        raise exception 'Expected bot pass success, got %', v_pass_result;
    end if;

    select count(*)
    into v_pass_move_count
    from patxanga_moves
    where match_id = v_match_id
      and player_id = v_next_player_id
      and move_type = 'pass'
      and status = 'accepted';

    if v_pass_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted bot pass move, got %', v_pass_move_count;
    end if;

    select count(*)
    into v_move_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'move_submitted';

    if v_move_replay_count <> 1 then
        raise exception 'Expected exactly 1 move_submitted replay event, got %', v_move_replay_count;
    end if;

    raise notice 'Bot simulation smoke passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'bot_alpha_player_id=%', v_bot_alpha_player_id;
    raise notice 'bot_beta_player_id=%', v_bot_beta_player_id;
    raise notice 'first_bot_player_id=%', v_current_player_id;
    raise notice 'second_bot_player_id=%', v_next_player_id;
    raise notice 'opening_result=%', v_submit_result;
    raise notice 'pass_result=%', v_pass_result;
    raise notice 'accepted_place_word_count=%', v_accepted_place_word_count;
    raise notice 'accepted_pass_move_count=%', v_pass_move_count;
    raise notice 'move_submitted_replay_count=%', v_move_replay_count;
end $$;

## FILE: sql/simulations/bot_simulation_pending_vote.sql

-- ============================================================
-- PATXANGA - BOT SIMULATION PENDING VOTE
-- Purpose: deterministic bot scenarios for pending_vote rejection and acceptance
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_author_player_id uuid;
    v_voter_player_id uuid;
    v_tile_t_id uuid := gen_random_uuid();
    v_tile_s_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_submit_result jsonb;
    v_vote_result jsonb;
    v_move_id uuid;
    v_pending_move_count integer;
    v_vote_count integer;
    v_replay_vote_count integer;
    v_replay_rejected_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Pending Reject Author',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_author_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Pending Reject Author',
        updated_at = now()
    where id = v_author_player_id;

    v_voter_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Pending Reject Voter',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'defensive'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_author_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_voter_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_author_player_id
    limit 1;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_t_id::text, 'letter', 'T', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_author_player_id;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_author_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile_t_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_s_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    if v_submit_result->>'status' <> 'pending_vote' then
        raise exception 'Expected pending_vote submit result in reject scenario, got %', v_submit_result;
    end if;

    if v_submit_result->>'move_id' is null then
        raise exception 'Expected pending move_id in reject scenario, got %', v_submit_result;
    end if;

    if v_submit_result->>'match_status' <> 'voting' then
        raise exception 'Expected match_status voting in reject scenario, got %', v_submit_result;
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'voting' then
        raise exception 'Expected match to be voting after pending submit';
    end if;

    if (select board_state #>> '{7,7,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected board center to remain empty while move is pending_vote';
    end if;

    v_move_id := (v_submit_result->>'move_id')::uuid;

    select count(*)
    into v_pending_move_count
    from patxanga_moves
    where id = v_move_id
      and match_id = v_match_id
      and player_id = v_author_player_id
      and move_type = 'place_word'
      and status = 'pending_vote'
      and main_word = 'TS'
      and is_dictionary_recognized = false
      and requires_vote = true;

    if v_pending_move_count <> 1 then
        raise exception 'Expected exactly 1 pending_vote place_word move in reject scenario, got %', v_pending_move_count;
    end if;

    v_vote_result := public.submit_patxanga_vote(
        v_move_id,
        v_voter_player_id,
        true
    );

    if v_vote_result->>'status' <> 'rejected' then
        raise exception 'Expected vote rejection result, got %', v_vote_result;
    end if;

    if (select status from patxanga_moves where id = v_move_id) <> 'rejected' then
        raise exception 'Expected move status rejected after bot vote';
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'active' then
        raise exception 'Expected match active after vote rejection';
    end if;

    if (select current_turn_player_id from patxanga_matches where id = v_match_id) <> v_author_player_id then
        raise exception 'Expected turn to return to pending move author after rejection';
    end if;

    if (select board_state #>> '{7,7,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected board center to remain empty after rejection';
    end if;

    select count(*)
    into v_vote_count
    from patxanga_votes
    where move_id = v_move_id
      and voter_player_id = v_voter_player_id
      and vote_reject = true;

    if v_vote_count <> 1 then
        raise exception 'Expected exactly 1 rejecting bot vote, got %', v_vote_count;
    end if;

    select count(*)
    into v_replay_vote_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'vote_cast';

    if v_replay_vote_count <> 1 then
        raise exception 'Expected exactly 1 vote_cast replay event in reject scenario, got %', v_replay_vote_count;
    end if;

    select count(*)
    into v_replay_rejected_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'word_rejected';

    if v_replay_rejected_count < 1 then
        raise exception 'Expected at least 1 word_rejected replay event in reject scenario, got %', v_replay_rejected_count;
    end if;

    raise notice 'Bot pending_vote rejection simulation passed';
    raise notice 'reject_match_id=%', v_match_id;
    raise notice 'reject_author_player_id=%', v_author_player_id;
    raise notice 'reject_voter_player_id=%', v_voter_player_id;
    raise notice 'reject_submit_result=%', v_submit_result;
    raise notice 'reject_vote_result=%', v_vote_result;
end $$;

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_author_player_id uuid;
    v_voter_player_id uuid;
    v_tile_t_id uuid := gen_random_uuid();
    v_tile_s_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_submit_result jsonb;
    v_vote_result jsonb;
    v_move_id uuid;
    v_pending_move_count integer;
    v_vote_count integer;
    v_accepted_word_count integer;
    v_replay_vote_count integer;
    v_replay_validated_count integer;
    v_move_score integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Pending Accept Author',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_author_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Pending Accept Author',
        updated_at = now()
    where id = v_author_player_id;

    v_voter_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Pending Accept Voter',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'aggressive'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_author_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_voter_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_author_player_id
    limit 1;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_t_id::text, 'letter', 'T', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_author_player_id;

    v_submit_result := public.submit_patxanga_move(
        v_match_id,
        v_author_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile_t_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_s_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    if v_submit_result->>'status' <> 'pending_vote' then
        raise exception 'Expected pending_vote submit result in accept scenario, got %', v_submit_result;
    end if;

    if v_submit_result->>'move_id' is null then
        raise exception 'Expected pending move_id in accept scenario, got %', v_submit_result;
    end if;

    if v_submit_result->>'match_status' <> 'voting' then
        raise exception 'Expected match_status voting in accept scenario, got %', v_submit_result;
    end if;

    if (select board_state #>> '{7,7,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected board center to remain empty before acceptance';
    end if;

    v_move_id := (v_submit_result->>'move_id')::uuid;

    select count(*)
    into v_pending_move_count
    from patxanga_moves
    where id = v_move_id
      and match_id = v_match_id
      and player_id = v_author_player_id
      and move_type = 'place_word'
      and status = 'pending_vote'
      and main_word = 'TS'
      and is_dictionary_recognized = false
      and requires_vote = true;

    if v_pending_move_count <> 1 then
        raise exception 'Expected exactly 1 pending_vote place_word move in accept scenario, got %', v_pending_move_count;
    end if;

    v_vote_result := public.submit_patxanga_vote(
        v_move_id,
        v_voter_player_id,
        false
    );

    if v_vote_result->>'status' <> 'accepted' then
        raise exception 'Expected vote acceptance result, got %', v_vote_result;
    end if;

    if (select status from patxanga_moves where id = v_move_id) <> 'accepted' then
        raise exception 'Expected move status accepted after bot vote';
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'active' then
        raise exception 'Expected match active after vote acceptance';
    end if;

    if (select current_turn_player_id from patxanga_matches where id = v_match_id) <> v_voter_player_id then
        raise exception 'Expected turn to advance to voter after acceptance';
    end if;

    if (select board_state #>> '{7,7,tile,letter}' from patxanga_matches where id = v_match_id) <> 'T' then
        raise exception 'Expected accepted T tile at board center after vote acceptance';
    end if;

    if (select board_state #>> '{7,8,tile,letter}' from patxanga_matches where id = v_match_id) <> 'S' then
        raise exception 'Expected accepted S tile next to board center after vote acceptance';
    end if;

    select score_total
    into v_move_score
    from patxanga_moves
    where id = v_move_id;

    if v_move_score <= 0 then
        raise exception 'Expected accepted pending_vote move to have positive score, got %', v_move_score;
    end if;

    select count(*)
    into v_vote_count
    from patxanga_votes
    where move_id = v_move_id
      and voter_player_id = v_voter_player_id
      and vote_reject = false;

    if v_vote_count <> 1 then
        raise exception 'Expected exactly 1 accepting bot vote, got %', v_vote_count;
    end if;

    select count(*)
    into v_accepted_word_count
    from patxanga_match_accepted_words
    where match_id = v_match_id
      and move_id = v_move_id
      and word = 'TS'
      and accepted_reason = 'community_vote';

    if v_accepted_word_count <> 1 then
        raise exception 'Expected accepted community word TS, got %', v_accepted_word_count;
    end if;

    select count(*)
    into v_replay_vote_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'vote_cast';

    if v_replay_vote_count <> 1 then
        raise exception 'Expected exactly 1 vote_cast replay event in accept scenario, got %', v_replay_vote_count;
    end if;

    select count(*)
    into v_replay_validated_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'word_validated';

    if v_replay_validated_count <> 1 then
        raise exception 'Expected exactly 1 word_validated replay event in accept scenario, got %', v_replay_validated_count;
    end if;

    raise notice 'Bot pending_vote acceptance simulation passed';
    raise notice 'accept_match_id=%', v_match_id;
    raise notice 'accept_author_player_id=%', v_author_player_id;
    raise notice 'accept_voter_player_id=%', v_voter_player_id;
    raise notice 'accept_submit_result=%', v_submit_result;
    raise notice 'accept_vote_result=%', v_vote_result;
    raise notice 'accept_move_score=%', v_move_score;
end $$;

## FILE: sql/simulations/bot_simulation_exchange_tiles.sql

-- ============================================================
-- PATXANGA - BOT SIMULATION EXCHANGE TILES
-- Purpose: deterministic bot scenario for exchanging tiles
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_exchange_player_id uuid;
    v_next_player_id uuid;
    v_tile_d_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_result jsonb;
    v_move_id uuid;
    v_bag_before integer;
    v_bag_after integer;
    v_rack_size_after integer;
    v_exchange_move_count integer;
    v_tiles_exchanged_replay_count integer;
    v_turn_changed_replay_count integer;
    v_exchanged_tiles_still_in_rack integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Exchange Alpha',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_host_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Exchange Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Exchange Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_exchange_player_id
    from patxanga_matches
    where id = v_match_id;

    if not exists (
        select 1
        from patxanga_players
        where id = v_exchange_player_id
          and match_id = v_match_id
          and is_bot = true
    ) then
        raise exception 'Current player is not a bot: %', v_exchange_player_id;
    end if;

    select id
    into v_next_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_exchange_player_id
    limit 1;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_exchange_player_id;

    select (bag_state->>'remaining')::integer
    into v_bag_before
    from patxanga_matches
    where id = v_match_id;

    if v_bag_before < 2 then
        raise exception 'Expected at least 2 tiles in bag before exchange, got %', v_bag_before;
    end if;

    v_result := public.submit_patxanga_exchange_tiles(
        v_match_id,
        v_exchange_player_id,
        jsonb_build_array(
            v_tile_d_id::text,
            v_tile_a_id::text
        )
    );

    if v_result->>'status' <> 'success' then
        raise exception 'Expected bot exchange success, got %', v_result;
    end if;

    if v_result->>'move_id' is null then
        raise exception 'Expected move_id in bot exchange result, got %', v_result;
    end if;

    if (v_result->>'exchanged_count')::integer <> 2 then
        raise exception 'Expected exchanged_count 2, got %', v_result;
    end if;

    if (v_result->>'next_player')::uuid <> v_next_player_id then
        raise exception 'Expected next player %, got %', v_next_player_id, v_result->>'next_player';
    end if;

    if (v_result->>'turn_number')::integer <> 2 then
        raise exception 'Expected turn_number 2 after exchange, got %', v_result;
    end if;

    v_move_id := (v_result->>'move_id')::uuid;

    select (bag_state->>'remaining')::integer
    into v_bag_after
    from patxanga_matches
    where id = v_match_id;

    if v_bag_after <> v_bag_before then
        raise exception 'Expected bag remaining to stay %, got %', v_bag_before, v_bag_after;
    end if;

    if (select current_turn_player_id from patxanga_matches where id = v_match_id) <> v_next_player_id then
        raise exception 'Expected current turn to advance to next bot';
    end if;

    if (select turn_number from patxanga_matches where id = v_match_id) <> 2 then
        raise exception 'Expected persisted turn_number 2 after exchange';
    end if;

    select jsonb_array_length(rack_state)
    into v_rack_size_after
    from patxanga_players
    where id = v_exchange_player_id;

    if v_rack_size_after <> 7 then
        raise exception 'Expected bot rack size 7 after exchange, got %', v_rack_size_after;
    end if;

    select count(*)
    into v_exchanged_tiles_still_in_rack
    from patxanga_players p
    cross join jsonb_array_elements(p.rack_state) tile
    where p.id = v_exchange_player_id
      and tile->>'id' in (v_tile_d_id::text, v_tile_a_id::text);

    if v_exchanged_tiles_still_in_rack <> 0 then
        raise exception 'Expected exchanged tiles removed from rack, still found %', v_exchanged_tiles_still_in_rack;
    end if;

    select count(*)
    into v_exchange_move_count
    from patxanga_moves
    where id = v_move_id
      and match_id = v_match_id
      and player_id = v_exchange_player_id
      and move_type = 'exchange_tiles'
      and status = 'accepted'
      and score_total = 0
      and used_tiles_from_rack = jsonb_build_array(v_tile_d_id::text, v_tile_a_id::text)
      and score_breakdown->'exchanged_tile_ids' = jsonb_build_array(v_tile_d_id::text, v_tile_a_id::text)
      and (score_breakdown->>'drawn_tiles_count')::integer = 2;

    if v_exchange_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted exchange_tiles move, got %', v_exchange_move_count;
    end if;

    select count(*)
    into v_tiles_exchanged_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'tiles_exchanged'
      and event_payload->>'move_id' = v_move_id::text
      and (event_payload->>'tile_count')::integer = 2;

    if v_tiles_exchanged_replay_count <> 1 then
        raise exception 'Expected exactly 1 tiles_exchanged replay event, got %', v_tiles_exchanged_replay_count;
    end if;

    select count(*)
    into v_turn_changed_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'turn_changed'
      and event_payload->>'current_turn_player_id' = v_next_player_id::text;

    if v_turn_changed_replay_count < 1 then
        raise exception 'Expected at least 1 turn_changed replay event for next player, got %', v_turn_changed_replay_count;
    end if;

    raise notice 'Bot exchange_tiles simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'exchange_player_id=%', v_exchange_player_id;
    raise notice 'next_player_id=%', v_next_player_id;
    raise notice 'exchange_result=%', v_result;
    raise notice 'bag_before=%', v_bag_before;
    raise notice 'bag_after=%', v_bag_after;
    raise notice 'rack_size_after=%', v_rack_size_after;
    raise notice 'exchange_move_count=%', v_exchange_move_count;
    raise notice 'tiles_exchanged_replay_count=%', v_tiles_exchanged_replay_count;
    raise notice 'turn_changed_replay_count=%', v_turn_changed_replay_count;
end $$;

## FILE: sql/simulations/bot_simulation_empty_rack_end.sql

-- ============================================================
-- PATXANGA - BOT SIMULATION EMPTY RACK END
-- Purpose: deterministic bot scenario for ending a match by empty rack
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_empty_rack_player_id uuid;
    v_other_player_id uuid;
    v_tile_d_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_emptying_rack jsonb;
    v_other_rack jsonb;
    v_result jsonb;
    v_move_id uuid;
    v_empty_player_score integer;
    v_other_player_score integer;
    v_empty_player_rack_size integer;
    v_other_player_rack_size integer;
    v_accepted_move_count integer;
    v_match_finished_replay_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Empty Rack Alpha',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_host_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Empty Rack Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Empty Rack Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_empty_rack_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_other_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_empty_rack_player_id
    limit 1;

    if not exists (
        select 1
        from patxanga_players
        where id in (v_empty_rack_player_id, v_other_player_id)
          and match_id = v_match_id
          and is_bot = true
        group by match_id
        having count(*) = 2
    ) then
        raise exception 'Expected both players to be bots';
    end if;

    update patxanga_matches
    set bag_state = jsonb_build_object(
            'tiles', '[]'::jsonb,
            'remaining', 0
        ),
        updated_at = now()
    where id = v_match_id;

    v_emptying_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null)
    );

    v_other_rack := jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_emptying_rack,
        score = 0,
        updated_at = now()
    where id = v_empty_rack_player_id;

    update patxanga_players
    set rack_state = v_other_rack,
        score = 0,
        updated_at = now()
    where id = v_other_player_id;

    v_result := public.submit_patxanga_move(
        v_match_id,
        v_empty_rack_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_tile_d_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    if v_result->>'status' <> 'success' then
        raise exception 'Expected empty rack move success, got %', v_result;
    end if;

    if v_result->>'move_id' is null then
        raise exception 'Expected move_id in empty rack move result, got %', v_result;
    end if;

    if coalesce((v_result->'end_state'->>'finished')::boolean, false) is not true then
        raise exception 'Expected finished end_state, got %', v_result;
    end if;

    if coalesce((v_result->'end_state'->>'ended_by_empty_rack')::boolean, false) is not true then
        raise exception 'Expected ended_by_empty_rack true, got %', v_result;
    end if;

    if coalesce((v_result->'end_state'->>'ended_by_all_passed')::boolean, true) is not false then
        raise exception 'Expected ended_by_all_passed false, got %', v_result;
    end if;

    if (v_result->'end_state'->>'empty_rack_player_id')::uuid <> v_empty_rack_player_id then
        raise exception 'Expected empty_rack_player_id %, got %', v_empty_rack_player_id, v_result->'end_state'->>'empty_rack_player_id';
    end if;

    if (v_result->'end_state'->>'winner_player_id')::uuid <> v_empty_rack_player_id then
        raise exception 'Expected winner_player_id %, got %', v_empty_rack_player_id, v_result->'end_state'->>'winner_player_id';
    end if;

    if (v_result->'end_state'->>'total_penalties')::integer <> 4 then
        raise exception 'Expected total_penalties 4, got %', v_result;
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'finished' then
        raise exception 'Expected match status finished after empty rack end';
    end if;

    if (select winner_player_id from patxanga_matches where id = v_match_id) <> v_empty_rack_player_id then
        raise exception 'Expected persisted winner to be empty rack player';
    end if;

    if (select finished_at from patxanga_matches where id = v_match_id) is null then
        raise exception 'Expected finished_at to be set';
    end if;

    v_move_id := (v_result->>'move_id')::uuid;

    select score, jsonb_array_length(rack_state)
    into v_empty_player_score, v_empty_player_rack_size
    from patxanga_players
    where id = v_empty_rack_player_id;

    select score, jsonb_array_length(rack_state)
    into v_other_player_score, v_other_player_rack_size
    from patxanga_players
    where id = v_other_player_id;

    if v_empty_player_score <> 10 then
        raise exception 'Expected empty rack player final score 10, got %', v_empty_player_score;
    end if;

    if v_other_player_score <> -4 then
        raise exception 'Expected other player final score -4, got %', v_other_player_score;
    end if;

    if v_empty_player_rack_size <> 0 then
        raise exception 'Expected empty rack player rack size 0, got %', v_empty_player_rack_size;
    end if;

    if v_other_player_rack_size <> 2 then
        raise exception 'Expected other player rack size 2, got %', v_other_player_rack_size;
    end if;

    select count(*)
    into v_accepted_move_count
    from patxanga_moves
    where id = v_move_id
      and match_id = v_match_id
      and player_id = v_empty_rack_player_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'DA'
      and score_total = 6;

    if v_accepted_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted DA move, got %', v_accepted_move_count;
    end if;

    select count(*)
    into v_match_finished_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'match_finished'
      and event_payload->>'winner_player_id' = v_empty_rack_player_id::text
      and coalesce((event_payload->>'ended_by_empty_rack')::boolean, false) = true
      and coalesce((event_payload->>'ended_by_all_passed')::boolean, true) = false
      and (event_payload->>'total_penalties')::integer = 4;

    if v_match_finished_replay_count <> 1 then
        raise exception 'Expected exactly 1 match_finished replay event, got %', v_match_finished_replay_count;
    end if;

    raise notice 'Bot empty rack end simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'empty_rack_player_id=%', v_empty_rack_player_id;
    raise notice 'other_player_id=%', v_other_player_id;
    raise notice 'move_result=%', v_result;
    raise notice 'empty_player_score=%', v_empty_player_score;
    raise notice 'other_player_score=%', v_other_player_score;
    raise notice 'match_finished_replay_count=%', v_match_finished_replay_count;
end $$;

## FILE: sql/simulations/bot_simulation_all_passed_end.sql

-- ============================================================
-- PATXANGA - BOT SIMULATION ALL PASSED END
-- Purpose: deterministic bot scenario for ending a match after all players pass
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_first_pass_player_id uuid;
    v_second_pass_player_id uuid;
    v_first_rack jsonb;
    v_second_rack jsonb;
    v_pass_1_result jsonb;
    v_pass_2_result jsonb;
    v_first_pass_move_id uuid;
    v_second_pass_move_id uuid;
    v_first_player_score integer;
    v_second_player_score integer;
    v_first_player_passed boolean;
    v_second_player_passed boolean;
    v_pass_move_count integer;
    v_turn_passed_replay_count integer;
    v_turn_changed_replay_count integer;
    v_match_finished_replay_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot All Passed Alpha',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_host_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'defensive',
        display_name = 'Bot All Passed Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot All Passed Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'defensive'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_first_pass_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_second_pass_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_first_pass_player_id
    limit 1;

    if not exists (
        select 1
        from patxanga_players
        where id in (v_first_pass_player_id, v_second_pass_player_id)
          and match_id = v_match_id
          and is_bot = true
        group by match_id
        having count(*) = 2
    ) then
        raise exception 'Expected both players to be bots';
    end if;

    update patxanga_matches
    set bag_state = jsonb_build_object(
            'tiles', '[]'::jsonb,
            'remaining', 0
        ),
        updated_at = now()
    where id = v_match_id;

    v_first_rack := jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null)
    );

    v_second_rack := jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_first_rack,
        score = 5,
        has_passed_last_cycle = false,
        updated_at = now()
    where id = v_first_pass_player_id;

    update patxanga_players
    set rack_state = v_second_rack,
        score = 0,
        has_passed_last_cycle = false,
        updated_at = now()
    where id = v_second_pass_player_id;

    v_pass_1_result := public.submit_patxanga_pass_turn(
        v_match_id,
        v_first_pass_player_id
    );

    if v_pass_1_result->>'status' <> 'success' then
        raise exception 'Expected first pass success, got %', v_pass_1_result;
    end if;

    if v_pass_1_result->>'move_id' is null then
        raise exception 'Expected first pass move_id, got %', v_pass_1_result;
    end if;

    if coalesce((v_pass_1_result->'end_state'->>'finished')::boolean, true) is not false then
        raise exception 'Expected first pass not to finish match, got %', v_pass_1_result;
    end if;

    if v_pass_1_result->'end_state'->>'reason' <> 'no_end_condition_met' then
        raise exception 'Expected first pass reason no_end_condition_met, got %', v_pass_1_result;
    end if;

    if (v_pass_1_result->>'next_player')::uuid <> v_second_pass_player_id then
        raise exception 'Expected first pass next player %, got %', v_second_pass_player_id, v_pass_1_result->>'next_player';
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'active' then
        raise exception 'Expected match active after first pass';
    end if;

    v_first_pass_move_id := (v_pass_1_result->>'move_id')::uuid;

    v_pass_2_result := public.submit_patxanga_pass_turn(
        v_match_id,
        v_second_pass_player_id
    );

    if v_pass_2_result->>'status' <> 'success' then
        raise exception 'Expected second pass success, got %', v_pass_2_result;
    end if;

    if v_pass_2_result->>'move_id' is null then
        raise exception 'Expected second pass move_id, got %', v_pass_2_result;
    end if;

    if coalesce((v_pass_2_result->'end_state'->>'finished')::boolean, false) is not true then
        raise exception 'Expected second pass to finish match, got %', v_pass_2_result;
    end if;

    if coalesce((v_pass_2_result->'end_state'->>'ended_by_all_passed')::boolean, false) is not true then
        raise exception 'Expected ended_by_all_passed true, got %', v_pass_2_result;
    end if;

    if coalesce((v_pass_2_result->'end_state'->>'ended_by_empty_rack')::boolean, true) is not false then
        raise exception 'Expected ended_by_empty_rack false, got %', v_pass_2_result;
    end if;

    if v_pass_2_result->'end_state'->>'empty_rack_player_id' is not null then
        raise exception 'Expected empty_rack_player_id null, got %', v_pass_2_result;
    end if;

    if (v_pass_2_result->'end_state'->>'total_penalties')::integer <> 3 then
        raise exception 'Expected total_penalties 3, got %', v_pass_2_result;
    end if;

    if (v_pass_2_result->'end_state'->>'winner_player_id')::uuid <> v_first_pass_player_id then
        raise exception 'Expected winner_player_id %, got %', v_first_pass_player_id, v_pass_2_result->'end_state'->>'winner_player_id';
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'finished' then
        raise exception 'Expected match status finished after all passed';
    end if;

    if (select winner_player_id from patxanga_matches where id = v_match_id) <> v_first_pass_player_id then
        raise exception 'Expected persisted winner to be first pass player';
    end if;

    if (select finished_at from patxanga_matches where id = v_match_id) is null then
        raise exception 'Expected finished_at to be set';
    end if;

    v_second_pass_move_id := (v_pass_2_result->>'move_id')::uuid;

    select score, has_passed_last_cycle
    into v_first_player_score, v_first_player_passed
    from patxanga_players
    where id = v_first_pass_player_id;

    select score, has_passed_last_cycle
    into v_second_player_score, v_second_player_passed
    from patxanga_players
    where id = v_second_pass_player_id;

    if v_first_player_score <> 4 then
        raise exception 'Expected first player final score 4, got %', v_first_player_score;
    end if;

    if v_second_player_score <> -2 then
        raise exception 'Expected second player final score -2, got %', v_second_player_score;
    end if;

    if v_first_player_passed is not true or v_second_player_passed is not true then
        raise exception 'Expected both players marked passed, got first=% second=%', v_first_player_passed, v_second_player_passed;
    end if;

    select count(*)
    into v_pass_move_count
    from patxanga_moves
    where match_id = v_match_id
      and move_type = 'pass'
      and status = 'accepted'
      and id in (v_first_pass_move_id, v_second_pass_move_id);

    if v_pass_move_count <> 2 then
        raise exception 'Expected exactly 2 accepted pass moves, got %', v_pass_move_count;
    end if;

    select count(*)
    into v_turn_passed_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'turn_passed';

    if v_turn_passed_replay_count <> 2 then
        raise exception 'Expected exactly 2 turn_passed replay events, got %', v_turn_passed_replay_count;
    end if;

    select count(*)
    into v_turn_changed_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'turn_changed'
      and turn_number in (2, 3);

    if v_turn_changed_replay_count <> 2 then
        raise exception 'Expected exactly 2 pass-generated turn_changed replay events, got %', v_turn_changed_replay_count;
    end if;

    select count(*)
    into v_match_finished_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'match_finished'
      and event_payload->>'winner_player_id' = v_first_pass_player_id::text
      and coalesce((event_payload->>'ended_by_all_passed')::boolean, false) = true
      and coalesce((event_payload->>'ended_by_empty_rack')::boolean, true) = false
      and event_payload->>'empty_rack_player_id' is null
      and (event_payload->>'total_penalties')::integer = 3;

    if v_match_finished_replay_count <> 1 then
        raise exception 'Expected exactly 1 match_finished replay event, got %', v_match_finished_replay_count;
    end if;

    raise notice 'Bot all passed end simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'first_pass_player_id=%', v_first_pass_player_id;
    raise notice 'second_pass_player_id=%', v_second_pass_player_id;
    raise notice 'pass_1_result=%', v_pass_1_result;
    raise notice 'pass_2_result=%', v_pass_2_result;
    raise notice 'first_player_score=%', v_first_player_score;
    raise notice 'second_player_score=%', v_second_player_score;
    raise notice 'match_finished_replay_count=%', v_match_finished_replay_count;
end $$;

## FILE: sql/simulations/bot_simulation_invalid_move_expected_error.sql

-- ============================================================
-- PATXANGA - BOT SIMULATION INVALID MOVE EXPECTED ERROR
-- Purpose: deterministic bot scenarios where illegal moves must fail cleanly
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_current_player_id uuid;
    v_other_player_id uuid;
    v_tile_d_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_missing_tile_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_board_before jsonb;
    v_bag_before jsonb;
    v_rack_before jsonb;
    v_status_before text;
    v_current_turn_before uuid;
    v_turn_number_before integer;
    v_move_count_before integer;
    v_replay_count_before integer;
    v_error_message text;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Invalid Missing Tile Alpha',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_host_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Invalid Missing Tile Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Invalid Missing Tile Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_other_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_current_player_id
    limit 1;

    if not exists (
        select 1
        from patxanga_players
        where id in (v_current_player_id, v_other_player_id)
          and match_id = v_match_id
          and is_bot = true
        group by match_id
        having count(*) = 2
    ) then
        raise exception 'Expected both players to be bots';
    end if;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_current_player_id;

    select status, current_turn_player_id, turn_number, board_state, bag_state
    into v_status_before, v_current_turn_before, v_turn_number_before, v_board_before, v_bag_before
    from patxanga_matches
    where id = v_match_id;

    select rack_state
    into v_rack_before
    from patxanga_players
    where id = v_current_player_id;

    select count(*)
    into v_move_count_before
    from patxanga_moves
    where match_id = v_match_id;

    select count(*)
    into v_replay_count_before
    from patxanga_replay_events
    where match_id = v_match_id;

    begin
        perform public.submit_patxanga_move(
            v_match_id,
            v_current_player_id,
            jsonb_build_array(
                jsonb_build_object('tile_id', v_missing_tile_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
                jsonb_build_object('tile_id', v_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
            )
        );
    exception
        when others then
            v_error_message := sqlerrm;
    end;

    if v_error_message is null then
        raise exception 'Expected missing rack tile error, but submit succeeded';
    end if;

    if position('does not belong to player rack' in v_error_message) = 0 then
        raise exception 'Expected missing rack tile ownership error, got %', v_error_message;
    end if;

    if exists (
        select 1
        from patxanga_matches
        where id = v_match_id
          and (
              status <> v_status_before
              or current_turn_player_id <> v_current_turn_before
              or turn_number <> v_turn_number_before
              or board_state <> v_board_before
              or bag_state <> v_bag_before
          )
    ) then
        raise exception 'Match state changed after missing rack tile error';
    end if;

    if exists (
        select 1
        from patxanga_players
        where id = v_current_player_id
          and rack_state <> v_rack_before
    ) then
        raise exception 'Rack state changed after missing rack tile error';
    end if;

    if (
        select count(*)
        from patxanga_moves
        where match_id = v_match_id
    ) <> v_move_count_before then
        raise exception 'Move count changed after missing rack tile error';
    end if;

    if (
        select count(*)
        from patxanga_replay_events
        where match_id = v_match_id
    ) <> v_replay_count_before then
        raise exception 'Replay count changed after missing rack tile error';
    end if;

    raise notice 'Bot invalid missing rack tile simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'current_player_id=%', v_current_player_id;
    raise notice 'missing_tile_id=%', v_missing_tile_id;
    raise notice 'expected_error=%', v_error_message;
end $$;

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_current_player_id uuid;
    v_other_player_id uuid;
    v_tile_d_id uuid := gen_random_uuid();
    v_tile_a_id uuid := gen_random_uuid();
    v_forced_rack jsonb;
    v_board_before jsonb;
    v_bag_before jsonb;
    v_other_rack_before jsonb;
    v_status_before text;
    v_current_turn_before uuid;
    v_turn_number_before integer;
    v_move_count_before integer;
    v_replay_count_before integer;
    v_error_message text;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Invalid Turn Alpha',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_host_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Invalid Turn Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Invalid Turn Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    select current_turn_player_id
    into v_current_player_id
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_other_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_current_player_id
    limit 1;

    v_forced_rack := jsonb_build_array(
        jsonb_build_object('id', v_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_forced_rack,
        updated_at = now()
    where id = v_other_player_id;

    select status, current_turn_player_id, turn_number, board_state, bag_state
    into v_status_before, v_current_turn_before, v_turn_number_before, v_board_before, v_bag_before
    from patxanga_matches
    where id = v_match_id;

    select rack_state
    into v_other_rack_before
    from patxanga_players
    where id = v_other_player_id;

    select count(*)
    into v_move_count_before
    from patxanga_moves
    where match_id = v_match_id;

    select count(*)
    into v_replay_count_before
    from patxanga_replay_events
    where match_id = v_match_id;

    begin
        perform public.submit_patxanga_move(
            v_match_id,
            v_other_player_id,
            jsonb_build_array(
                jsonb_build_object('tile_id', v_tile_d_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
                jsonb_build_object('tile_id', v_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
            )
        );
    exception
        when others then
            v_error_message := sqlerrm;
    end;

    if v_error_message is null then
        raise exception 'Expected not-your-turn error, but submit succeeded';
    end if;

    if position('Not your turn' in v_error_message) = 0 then
        raise exception 'Expected Not your turn error, got %', v_error_message;
    end if;

    if exists (
        select 1
        from patxanga_matches
        where id = v_match_id
          and (
              status <> v_status_before
              or current_turn_player_id <> v_current_turn_before
              or turn_number <> v_turn_number_before
              or board_state <> v_board_before
              or bag_state <> v_bag_before
          )
    ) then
        raise exception 'Match state changed after not-your-turn error';
    end if;

    if exists (
        select 1
        from patxanga_players
        where id = v_other_player_id
          and rack_state <> v_other_rack_before
    ) then
        raise exception 'Rack state changed after not-your-turn error';
    end if;

    if (
        select count(*)
        from patxanga_moves
        where match_id = v_match_id
    ) <> v_move_count_before then
        raise exception 'Move count changed after not-your-turn error';
    end if;

    if (
        select count(*)
        from patxanga_replay_events
        where match_id = v_match_id
    ) <> v_replay_count_before then
        raise exception 'Replay count changed after not-your-turn error';
    end if;

    raise notice 'Bot invalid out-of-turn move simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'current_player_id=%', v_current_player_id;
    raise notice 'out_of_turn_player_id=%', v_other_player_id;
    raise notice 'expected_error=%', v_error_message;
end $$;

## FILE: sql/simulations/bot_simulation_long_multi_turn.sql

-- ============================================================
-- PATXANGA - BOT SIMULATION LONG MULTI TURN
-- Purpose: deterministic multi-action bot-vs-bot integration scenario
-- ============================================================

do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_host_player_id uuid;
    v_first_player_id uuid;
    v_second_player_id uuid;
    v_bot_count integer;

    v_opening_tile_d_id uuid := gen_random_uuid();
    v_opening_tile_a_id uuid := gen_random_uuid();
    v_exchange_tile_s_id uuid := gen_random_uuid();
    v_exchange_tile_e_id uuid := gen_random_uuid();
    v_bridge_tile_x_id uuid := gen_random_uuid();
    v_bridge_tile_z_id uuid := gen_random_uuid();

    v_first_rack jsonb;
    v_second_exchange_rack jsonb;
    v_second_bridge_rack jsonb;

    v_opening_result jsonb;
    v_exchange_result jsonb;
    v_first_pass_result jsonb;
    v_bridge_result jsonb;
    v_vote_result jsonb;
    v_second_pass_result jsonb;
    v_pending_move_id uuid;

    v_bag_after_start integer;
    v_bag_after_opening integer;
    v_bag_after_exchange integer;
    v_first_score integer;
    v_second_score integer;
    v_first_player_passed boolean;
    v_second_player_passed boolean;
    v_match_status text;
    v_current_turn_player_id uuid;
    v_turn_number integer;

    v_total_move_count integer;
    v_accepted_place_word_count integer;
    v_rejected_place_word_count integer;
    v_exchange_move_count integer;
    v_pass_move_count integer;
    v_vote_count integer;
    v_move_submitted_replay_count integer;
    v_tiles_exchanged_replay_count integer;
    v_turn_passed_replay_count integer;
    v_vote_cast_replay_count integer;
    v_word_rejected_replay_count integer;
    v_turn_changed_replay_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_host_user_id,
        p_host_guest_name := 'Bot Long Alpha',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    select id
    into v_host_player_id
    from patxanga_players
    where match_id = v_match_id
      and user_id = v_host_user_id;

    update patxanga_players
    set is_bot = true,
        bot_level = 'easy',
        bot_profile = 'balanced',
        display_name = 'Bot Long Alpha',
        updated_at = now()
    where id = v_host_player_id;

    perform public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Long Beta',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'defensive'
    );

    perform public.start_patxanga_match(v_match_id);

    select count(*)
    into v_bot_count
    from patxanga_players
    where match_id = v_match_id
      and is_bot = true;

    if v_bot_count <> 2 then
        raise exception 'Expected 2 bot players, got %', v_bot_count;
    end if;

    select current_turn_player_id, (bag_state->>'remaining')::integer
    into v_first_player_id, v_bag_after_start
    from patxanga_matches
    where id = v_match_id;

    select id
    into v_second_player_id
    from patxanga_players
    where match_id = v_match_id
      and id <> v_first_player_id
    limit 1;

    if v_bag_after_start < 4 then
        raise exception 'Expected at least 4 tiles in bag after start, got %', v_bag_after_start;
    end if;

    v_first_rack := jsonb_build_array(
        jsonb_build_object('id', v_opening_tile_d_id::text, 'letter', 'D', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_opening_tile_a_id::text, 'letter', 'A', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_first_rack,
        updated_at = now()
    where id = v_first_player_id;

    v_opening_result := public.submit_patxanga_move(
        v_match_id,
        v_first_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_opening_tile_d_id::text, 'row', 8, 'col', 8, 'declared_letter', null),
            jsonb_build_object('tile_id', v_opening_tile_a_id::text, 'row', 8, 'col', 9, 'declared_letter', null)
        )
    );

    if v_opening_result->>'status' <> 'success' then
        raise exception 'Expected opening move success, got %', v_opening_result;
    end if;

    if v_opening_result->>'move_id' is null then
        raise exception 'Expected opening move_id, got %', v_opening_result;
    end if;

    if (v_opening_result->'score'->>'total_score')::integer <> 6 then
        raise exception 'Expected opening DA score 6, got %', v_opening_result;
    end if;

    if (v_opening_result->>'next_player')::uuid <> v_second_player_id then
        raise exception 'Expected opening next player %, got %', v_second_player_id, v_opening_result->>'next_player';
    end if;

    if (v_opening_result->>'turn_number')::integer <> 2 then
        raise exception 'Expected opening turn_number 2, got %', v_opening_result;
    end if;

    select (bag_state->>'remaining')::integer
    into v_bag_after_opening
    from patxanga_matches
    where id = v_match_id;

    if v_bag_after_opening <> v_bag_after_start - 2 then
        raise exception 'Expected bag remaining % after opening, got %', v_bag_after_start - 2, v_bag_after_opening;
    end if;

    if (select board_state #>> '{7,7,tile,letter}' from patxanga_matches where id = v_match_id) <> 'D' then
        raise exception 'Expected D at board center after opening';
    end if;

    if (select board_state #>> '{7,8,tile,letter}' from patxanga_matches where id = v_match_id) <> 'A' then
        raise exception 'Expected A next to board center after opening';
    end if;

    v_second_exchange_rack := jsonb_build_array(
        jsonb_build_object('id', v_exchange_tile_s_id::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_exchange_tile_e_id::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'R', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'T', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'L', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_second_exchange_rack,
        updated_at = now()
    where id = v_second_player_id;

    v_exchange_result := public.submit_patxanga_exchange_tiles(
        v_match_id,
        v_second_player_id,
        jsonb_build_array(v_exchange_tile_s_id::text, v_exchange_tile_e_id::text)
    );

    if v_exchange_result->>'status' <> 'success' then
        raise exception 'Expected exchange success, got %', v_exchange_result;
    end if;

    if (v_exchange_result->>'exchanged_count')::integer <> 2 then
        raise exception 'Expected exchanged_count 2, got %', v_exchange_result;
    end if;

    if (v_exchange_result->>'next_player')::uuid <> v_first_player_id then
        raise exception 'Expected exchange next player %, got %', v_first_player_id, v_exchange_result->>'next_player';
    end if;

    if (v_exchange_result->>'turn_number')::integer <> 3 then
        raise exception 'Expected exchange turn_number 3, got %', v_exchange_result;
    end if;

    select (bag_state->>'remaining')::integer
    into v_bag_after_exchange
    from patxanga_matches
    where id = v_match_id;

    if v_bag_after_exchange <> v_bag_after_opening then
        raise exception 'Expected exchange to preserve bag remaining %, got %', v_bag_after_opening, v_bag_after_exchange;
    end if;

    v_first_pass_result := public.submit_patxanga_pass_turn(
        v_match_id,
        v_first_player_id
    );

    if v_first_pass_result->>'status' <> 'success' then
        raise exception 'Expected first pass success, got %', v_first_pass_result;
    end if;

    if (v_first_pass_result->>'next_player')::uuid <> v_second_player_id then
        raise exception 'Expected first pass next player %, got %', v_second_player_id, v_first_pass_result->>'next_player';
    end if;

    if (v_first_pass_result->>'turn_number')::integer <> 4 then
        raise exception 'Expected first pass turn_number 4, got %', v_first_pass_result;
    end if;

    if coalesce((v_first_pass_result->'end_state'->>'finished')::boolean, true) is not false then
        raise exception 'Expected first pass not to finish match, got %', v_first_pass_result;
    end if;

    if v_first_pass_result->'end_state'->>'reason' <> 'bag_not_empty' then
        raise exception 'Expected first pass end_state bag_not_empty, got %', v_first_pass_result;
    end if;

    v_second_bridge_rack := jsonb_build_array(
        jsonb_build_object('id', v_bridge_tile_x_id::text, 'letter', 'X', 'points', 8, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', v_bridge_tile_z_id::text, 'letter', 'Z', 'points', 10, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'S', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'E', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'M', 'points', 2, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'O', 'points', 1, 'is_special', false, 'special_type', null),
        jsonb_build_object('id', gen_random_uuid()::text, 'letter', 'T', 'points', 1, 'is_special', false, 'special_type', null)
    );

    update patxanga_players
    set rack_state = v_second_bridge_rack,
        updated_at = now()
    where id = v_second_player_id;

    v_bridge_result := public.submit_patxanga_move(
        v_match_id,
        v_second_player_id,
        jsonb_build_array(
            jsonb_build_object('tile_id', v_bridge_tile_x_id::text, 'row', 7, 'col', 9, 'declared_letter', null),
            jsonb_build_object('tile_id', v_bridge_tile_z_id::text, 'row', 9, 'col', 9, 'declared_letter', null)
        )
    );

    if v_bridge_result->>'status' <> 'pending_vote' then
        raise exception 'Expected bridge move pending_vote, got %', v_bridge_result;
    end if;

    if v_bridge_result->>'main_word' <> 'XAZ' then
        raise exception 'Expected bridge main_word XAZ, got %', v_bridge_result;
    end if;

    if v_bridge_result->>'match_status' <> 'voting' then
        raise exception 'Expected bridge match_status voting, got %', v_bridge_result;
    end if;

    v_pending_move_id := (v_bridge_result->>'move_id')::uuid;

    if v_pending_move_id is null then
        raise exception 'Expected bridge pending move_id, got %', v_bridge_result;
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'voting' then
        raise exception 'Expected match status voting after bridge pending_vote';
    end if;

    if (select board_state #>> '{6,8,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected upper bridge tile not to be applied while pending_vote';
    end if;

    if (select board_state #>> '{8,8,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected lower bridge tile not to be applied while pending_vote';
    end if;

    v_vote_result := public.submit_patxanga_vote(
        v_pending_move_id,
        v_first_player_id,
        true
    );

    if v_vote_result->>'status' <> 'rejected' then
        raise exception 'Expected bridge vote rejection, got %', v_vote_result;
    end if;

    if (v_vote_result->>'current_turn_player_id')::uuid <> v_second_player_id then
        raise exception 'Expected turn to return to bridge author %, got %', v_second_player_id, v_vote_result;
    end if;

    if (select status from patxanga_matches where id = v_match_id) <> 'active' then
        raise exception 'Expected match active after bridge rejection';
    end if;

    if (select current_turn_player_id from patxanga_matches where id = v_match_id) <> v_second_player_id then
        raise exception 'Expected current turn to be bridge author after rejection';
    end if;

    if (select board_state #>> '{6,8,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected upper bridge tile not to be applied after rejection';
    end if;

    if (select board_state #>> '{8,8,tile,id}' from patxanga_matches where id = v_match_id) is not null then
        raise exception 'Expected lower bridge tile not to be applied after rejection';
    end if;

    v_second_pass_result := public.submit_patxanga_pass_turn(
        v_match_id,
        v_second_player_id
    );

    if v_second_pass_result->>'status' <> 'success' then
        raise exception 'Expected second pass success, got %', v_second_pass_result;
    end if;

    if (v_second_pass_result->>'next_player')::uuid <> v_first_player_id then
        raise exception 'Expected second pass next player %, got %', v_first_player_id, v_second_pass_result->>'next_player';
    end if;

    if (v_second_pass_result->>'turn_number')::integer <> 5 then
        raise exception 'Expected second pass turn_number 5, got %', v_second_pass_result;
    end if;

    if coalesce((v_second_pass_result->'end_state'->>'finished')::boolean, true) is not false then
        raise exception 'Expected second pass not to finish match with bag not empty, got %', v_second_pass_result;
    end if;

    if v_second_pass_result->'end_state'->>'reason' <> 'bag_not_empty' then
        raise exception 'Expected second pass end_state bag_not_empty, got %', v_second_pass_result;
    end if;

    select status, current_turn_player_id, turn_number
    into v_match_status, v_current_turn_player_id, v_turn_number
    from patxanga_matches
    where id = v_match_id;

    if v_match_status <> 'active' then
        raise exception 'Expected final match status active, got %', v_match_status;
    end if;

    if v_current_turn_player_id <> v_first_player_id then
        raise exception 'Expected final current turn player %, got %', v_first_player_id, v_current_turn_player_id;
    end if;

    if v_turn_number <> 5 then
        raise exception 'Expected final turn_number 5, got %', v_turn_number;
    end if;

    select score, has_passed_last_cycle
    into v_first_score, v_first_player_passed
    from patxanga_players
    where id = v_first_player_id;

    select score, has_passed_last_cycle
    into v_second_score, v_second_player_passed
    from patxanga_players
    where id = v_second_player_id;

    if v_first_score <> 6 then
        raise exception 'Expected first bot score 6, got %', v_first_score;
    end if;

    if v_second_score <> 0 then
        raise exception 'Expected second bot score 0, got %', v_second_score;
    end if;

    if v_first_player_passed is not true or v_second_player_passed is not true then
        raise exception 'Expected both bots marked passed, got first=% second=%', v_first_player_passed, v_second_player_passed;
    end if;

    select count(*)
    into v_total_move_count
    from patxanga_moves
    where match_id = v_match_id;

    if v_total_move_count <> 5 then
        raise exception 'Expected exactly 5 persisted moves, got %', v_total_move_count;
    end if;

    select count(*)
    into v_accepted_place_word_count
    from patxanga_moves
    where match_id = v_match_id
      and move_type = 'place_word'
      and status = 'accepted'
      and main_word = 'DA'
      and score_total = 6;

    if v_accepted_place_word_count <> 1 then
        raise exception 'Expected exactly 1 accepted DA move, got %', v_accepted_place_word_count;
    end if;

    select count(*)
    into v_rejected_place_word_count
    from patxanga_moves
    where id = v_pending_move_id
      and match_id = v_match_id
      and player_id = v_second_player_id
      and move_type = 'place_word'
      and status = 'rejected'
      and main_word = 'XAZ'
      and score_total = 0
      and is_dictionary_recognized = false
      and requires_vote = true;

    if v_rejected_place_word_count <> 1 then
        raise exception 'Expected exactly 1 rejected XAZ move, got %', v_rejected_place_word_count;
    end if;

    select count(*)
    into v_exchange_move_count
    from patxanga_moves
    where match_id = v_match_id
      and player_id = v_second_player_id
      and move_type = 'exchange_tiles'
      and status = 'accepted'
      and used_tiles_from_rack = jsonb_build_array(v_exchange_tile_s_id::text, v_exchange_tile_e_id::text);

    if v_exchange_move_count <> 1 then
        raise exception 'Expected exactly 1 accepted exchange move, got %', v_exchange_move_count;
    end if;

    select count(*)
    into v_pass_move_count
    from patxanga_moves
    where match_id = v_match_id
      and move_type = 'pass'
      and status = 'accepted';

    if v_pass_move_count <> 2 then
        raise exception 'Expected exactly 2 accepted pass moves, got %', v_pass_move_count;
    end if;

    select count(*)
    into v_vote_count
    from patxanga_votes
    where move_id = v_pending_move_id
      and match_id = v_match_id
      and voter_player_id = v_first_player_id
      and vote_reject = true;

    if v_vote_count <> 1 then
        raise exception 'Expected exactly 1 rejecting vote, got %', v_vote_count;
    end if;

    select count(*)
    into v_move_submitted_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'move_submitted';

    if v_move_submitted_replay_count <> 1 then
        raise exception 'Expected exactly 1 move_submitted replay event, got %', v_move_submitted_replay_count;
    end if;

    select count(*)
    into v_tiles_exchanged_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'tiles_exchanged';

    if v_tiles_exchanged_replay_count <> 1 then
        raise exception 'Expected exactly 1 tiles_exchanged replay event, got %', v_tiles_exchanged_replay_count;
    end if;

    select count(*)
    into v_turn_passed_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'turn_passed';

    if v_turn_passed_replay_count <> 2 then
        raise exception 'Expected exactly 2 turn_passed replay events, got %', v_turn_passed_replay_count;
    end if;

    select count(*)
    into v_vote_cast_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'vote_cast';

    if v_vote_cast_replay_count <> 1 then
        raise exception 'Expected exactly 1 vote_cast replay event, got %', v_vote_cast_replay_count;
    end if;

    select count(*)
    into v_word_rejected_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'word_rejected';

    if v_word_rejected_replay_count <> 2 then
        raise exception 'Expected exactly 2 word_rejected replay events, got %', v_word_rejected_replay_count;
    end if;

    select count(*)
    into v_turn_changed_replay_count
    from patxanga_replay_events
    where match_id = v_match_id
      and event_type = 'turn_changed';

    if v_turn_changed_replay_count < 3 then
        raise exception 'Expected at least 3 turn_changed replay events, got %', v_turn_changed_replay_count;
    end if;

    raise notice 'Bot long multi-turn simulation passed';
    raise notice 'match_id=%', v_match_id;
    raise notice 'first_bot_player_id=%', v_first_player_id;
    raise notice 'second_bot_player_id=%', v_second_player_id;
    raise notice 'opening_result=%', v_opening_result;
    raise notice 'exchange_result=%', v_exchange_result;
    raise notice 'first_pass_result=%', v_first_pass_result;
    raise notice 'bridge_result=%', v_bridge_result;
    raise notice 'vote_result=%', v_vote_result;
    raise notice 'second_pass_result=%', v_second_pass_result;
    raise notice 'bag_after_start=%', v_bag_after_start;
    raise notice 'bag_after_opening=%', v_bag_after_opening;
    raise notice 'bag_after_exchange=%', v_bag_after_exchange;
    raise notice 'total_move_count=%', v_total_move_count;
    raise notice 'word_rejected_replay_count=%', v_word_rejected_replay_count;
end $$;

## FILE: supabase/migrations/20260620210000_20_persist_successful_place_word_moves.sql

-- ============================================================
-- PATXANGA - RPC: submit_patxanga_move()
-- Version: 1.7 (Persistent pending_vote + game end)
-- ============================================================

create or replace function public.submit_patxanga_move(
    p_match_id uuid,
    p_player_id uuid,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player record;
    v_hydrated_placed_tiles jsonb;
    v_virtual_board jsonb;
    v_words jsonb;
    v_score jsonb;
    v_word jsonb;
    v_is_valid boolean;
    v_has_invalid_word boolean := false;
    v_main_word text := null;
    v_secondary_words jsonb := '[]'::jsonb;
    v_pending_move_id uuid;
    v_accepted_move_id uuid;
    v_next_player uuid;
    v_new_turn integer;
    v_new_rack jsonb;
    v_draw_result jsonb;
    v_drawn_tiles jsonb;
    v_new_bag jsonb;
    v_tiles_to_draw integer;
    v_end_result jsonb;
begin

    select *
    into v_match
    from patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'active' then
        raise exception 'Match not active';
    end if;

    if v_match.current_turn_player_id <> p_player_id then
        raise exception 'Not your turn';
    end if;

    select *
    into v_player
    from patxanga_players
    where match_id = p_match_id
      and id = p_player_id
    for update;

    if not found then
        raise exception 'Player not found';
    end if;

    perform public.validate_patxanga_tile_ownership(
        v_player.rack_state,
        p_placed_tiles
    );

    perform public.validate_patxanga_move_alignment(
        v_match.board_state,
        p_placed_tiles
    );

    v_hydrated_placed_tiles :=
        public.hydrate_patxanga_placed_tiles(
            v_player.rack_state,
            p_placed_tiles
        );

    v_virtual_board :=
        public.build_patxanga_virtual_board(
            v_match.board_state,
            v_hydrated_placed_tiles
        );

    v_words :=
        public.extract_patxanga_words(
            v_virtual_board,
            v_hydrated_placed_tiles
        );

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        if (v_word->>'type') = 'main' then
            v_main_word := v_word->>'word';
        else
            v_secondary_words := v_secondary_words || jsonb_build_array(v_word);
        end if;
    end loop;

    if char_length(coalesce(v_main_word, '')) < 2 then
        raise exception 'Main word must have at least 2 letters';
    end if;

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        v_is_valid := public.validate_word(v_word->>'word');

        if not v_is_valid then
            v_has_invalid_word := true;
            exit;
        end if;
    end loop;

    -- =========================================
    -- PERSISTENT PENDING_VOTE BRANCH
    -- =========================================
    if v_has_invalid_word then
        insert into patxanga_moves (
            match_id,
            player_id,
            move_type,
            status,
            main_word,
            secondary_words,
            placed_tiles,
            board_diff,
            used_tiles_from_rack,
            used_blank_tile,
            used_skip_tile,
            used_patxanga_real,
            patxanga_real_target_word,
            target_player_skipped_id,
            score_total,
            score_breakdown,
            is_dictionary_recognized,
            requires_vote,
            created_at,
            resolved_at
        )
        values (
            p_match_id,
            p_player_id,
            'place_word',
            'pending_vote',
            v_main_word,
            v_secondary_words,
            p_placed_tiles,
            v_hydrated_placed_tiles,
            p_placed_tiles,
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') = 'wildcard'
            ),
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') = 'skip_turn'
            ),
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') in ('patxanga_real', 'PATXANGA_REAL')
            ),
            null,
            null,
            0,
            jsonb_build_object(
                'status', 'pending_vote',
                'words', v_words
            ),
            false,
            true,
            now(),
            null
        )
        returning id into v_pending_move_id;

        update patxanga_matches
        set status = 'voting',
            updated_at = now()
        where id = p_match_id;

        insert into patxanga_replay_events (
            match_id,
            event_type,
            event_payload,
            turn_number,
            created_at
        )
        values (
            p_match_id,
            'word_rejected',
            jsonb_build_object(
                'move_id', v_pending_move_id,
                'player_id', p_player_id,
                'main_word', v_main_word,
                'words', v_words,
                'requires_vote', true
            ),
            v_match.turn_number,
            now()
        );

        return jsonb_build_object(
            'status', 'pending_vote',
            'move_id', v_pending_move_id,
            'main_word', v_main_word,
            'words', v_words,
            'match_status', 'voting'
        );
    end if;

    -- =========================================
    -- SUCCESS BRANCH
    -- =========================================

    v_score :=
        public.calculate_patxanga_score(
            v_words,
            v_match.board_state,
            p_placed_tiles
        );

    v_new_rack :=
        public.remove_patxanga_tiles_from_rack(
            v_player.rack_state,
            p_placed_tiles
        );

    v_tiles_to_draw := 7 - jsonb_array_length(v_new_rack);

    v_draw_result :=
        public.draw_patxanga_tiles_from_bag(
            v_match.bag_state,
            v_tiles_to_draw
        );

    v_drawn_tiles := v_draw_result->'drawn_tiles';
    v_new_bag := v_draw_result->'new_bag_state';

    v_new_rack := v_new_rack || v_drawn_tiles;

    insert into patxanga_moves (
        match_id,
        player_id,
        move_type,
        status,
        main_word,
        secondary_words,
        placed_tiles,
        board_diff,
        used_tiles_from_rack,
        used_blank_tile,
        used_skip_tile,
        used_patxanga_real,
        patxanga_real_target_word,
        target_player_skipped_id,
        score_total,
        score_breakdown,
        is_dictionary_recognized,
        requires_vote,
        created_at,
        resolved_at
    )
    values (
        p_match_id,
        p_player_id,
        'place_word',
        'accepted',
        v_main_word,
        v_secondary_words,
        p_placed_tiles,
        v_hydrated_placed_tiles,
        p_placed_tiles,
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') = 'wildcard'
        ),
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') = 'skip_turn'
        ),
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') in ('patxanga_real', 'PATXANGA_REAL')
        ),
        null,
        null,
        (v_score->>'total_score')::integer,
        jsonb_build_object(
            'words', v_words,
            'final_score', v_score
        ),
        true,
        false,
        now(),
        now()
    )
    returning id into v_accepted_move_id;

    update patxanga_matches
    set board_state = v_virtual_board,
        bag_state = v_new_bag,
        updated_at = now()
    where id = p_match_id;

    update patxanga_players
    set score = score + (v_score->>'total_score')::integer,
        rack_state = v_new_rack,
        has_passed_last_cycle = false,
        updated_at = now()
    where match_id = p_match_id
      and id = p_player_id;

    -- valid move breaks stagnation cycle for everyone
    update patxanga_players
    set has_passed_last_cycle = false,
        updated_at = now()
    where match_id = p_match_id;

    select id
    into v_next_player
    from patxanga_players
    where match_id = p_match_id
      and turn_order >
          (
              select turn_order
              from patxanga_players
              where match_id = p_match_id
                and id = p_player_id
          )
    order by turn_order
    limit 1;

    if v_next_player is null then
        select id
        into v_next_player
        from patxanga_players
        where match_id = p_match_id
        order by turn_order
        limit 1;
    end if;

    v_new_turn := v_match.turn_number + 1;

    update patxanga_matches
    set current_turn_player_id = v_next_player,
        turn_number = v_new_turn,
        updated_at = now()
    where id = p_match_id;

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        p_match_id,
        'move_submitted',
        jsonb_build_object(
            'move_id', v_accepted_move_id,
            'player_id', p_player_id,
            'placed_tiles', p_placed_tiles,
            'words', v_words,
            'score_breakdown', v_score,
            'tiles_drawn', v_drawn_tiles,
            'next_player', v_next_player
        ),
        v_new_turn,
        now()
    );

    -- Evaluate match end after successful move
    v_end_result := public.evaluate_patxanga_match_end(p_match_id);

    return jsonb_build_object(
        'status', 'success',
        'move_id', v_accepted_move_id,
        'score', v_score,
        'next_player', v_next_player,
        'turn_number', v_new_turn,
        'end_state', v_end_result
    );

end;
$$;

grant execute on function public.submit_patxanga_move(uuid, uuid, jsonb)
to authenticated, anon;

## FILE: supabase/migrations/20260620213000_21_dictionary_contract_language.sql

-- ============================================================
-- PATXANGA - DICTIONARY CONTRACT WITH LANGUAGE
-- Purpose: prepare dictionary validation for real lexical sources
-- ============================================================

alter table public.patxanga_dictionary
add column if not exists language text;

alter table public.patxanga_dictionary
add column if not exists source text;

alter table public.patxanga_dictionary
add column if not exists is_active boolean;

alter table public.patxanga_dictionary
add column if not exists created_at timestamptz;

alter table public.patxanga_dictionary
add column if not exists updated_at timestamptz;

update public.patxanga_dictionary
set language = coalesce(nullif(language, ''), 'pt-BR'),
    source = coalesce(nullif(source, ''), 'test_seed'),
    is_active = coalesce(is_active, true),
    created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now());

alter table public.patxanga_dictionary
alter column language set default 'pt-BR',
alter column language set not null,
alter column source set default 'test_seed',
alter column source set not null,
alter column is_active set default true,
alter column is_active set not null,
alter column created_at set default now(),
alter column created_at set not null,
alter column updated_at set default now(),
alter column updated_at set not null;

alter table public.patxanga_dictionary
drop constraint if exists patxanga_dictionary_pkey;

alter table public.patxanga_dictionary
drop constraint if exists patxanga_dictionary_word_normalized_key;

alter table public.patxanga_dictionary
add constraint patxanga_dictionary_pkey
primary key (language, word_normalized);

drop index if exists public.idx_patxanga_dictionary_normalized;

create index if not exists idx_patxanga_dictionary_active_lookup
on public.patxanga_dictionary (language, word_normalized)
where is_active = true;

create index if not exists idx_patxanga_dictionary_source
on public.patxanga_dictionary (source);

drop function if exists public.validate_word(text);
drop function if exists public.validate_word(text, text);

create or replace function public.validate_word(
    p_word text,
    p_language text default 'pt-BR'
)
returns boolean
language plpgsql
stable
as
$$
declare
    v_normalized text;
    v_exists integer;
begin
    if p_word is null then
        return false;
    end if;

    if coalesce(nullif(trim(p_language), ''), '') = '' then
        return false;
    end if;

    v_normalized := public.normalize_patxanga_word(p_word);

    select 1
    into v_exists
    from patxanga_dictionary
    where word_normalized = v_normalized
      and language = p_language
      and is_active = true
    limit 1;

    return v_exists is not null;
end;
$$;

grant execute on function public.validate_word(text, text)
to authenticated, anon;

## FILE: supabase/migrations/20260620213500_22_dictionary_pt_br_core_seed.sql

-- ============================================================
-- PATXANGA - PT-BR CORE DICTIONARY SEED
-- Purpose: small real-word seed for deterministic QA
-- ============================================================

insert into public.patxanga_dictionary (
    language,
    word_original,
    word_normalized,
    source,
    is_active
)
values
('pt-BR', 'AMOR', public.normalize_patxanga_word('AMOR'), 'pt_br_core_seed', true),
('pt-BR', 'AÇÃO', public.normalize_patxanga_word('AÇÃO'), 'pt_br_core_seed', true),
('pt-BR', 'BOLA', public.normalize_patxanga_word('BOLA'), 'pt_br_core_seed', true),
('pt-BR', 'CASA', public.normalize_patxanga_word('CASA'), 'pt_br_core_seed', true),
('pt-BR', 'GATO', public.normalize_patxanga_word('GATO'), 'pt_br_core_seed', true),
('pt-BR', 'JOGO', public.normalize_patxanga_word('JOGO'), 'pt_br_core_seed', true),
('pt-BR', 'LIVRO', public.normalize_patxanga_word('LIVRO'), 'pt_br_core_seed', true),
('pt-BR', 'LUA', public.normalize_patxanga_word('LUA'), 'pt_br_core_seed', true),
('pt-BR', 'MÃO', public.normalize_patxanga_word('MÃO'), 'pt_br_core_seed', true),
('pt-BR', 'MAR', public.normalize_patxanga_word('MAR'), 'pt_br_core_seed', true),
('pt-BR', 'MESA', public.normalize_patxanga_word('MESA'), 'pt_br_core_seed', true),
('pt-BR', 'PÃO', public.normalize_patxanga_word('PÃO'), 'pt_br_core_seed', true),
('pt-BR', 'PATO', public.normalize_patxanga_word('PATO'), 'pt_br_core_seed', true),
('pt-BR', 'PORTA', public.normalize_patxanga_word('PORTA'), 'pt_br_core_seed', true),
('pt-BR', 'RUA', public.normalize_patxanga_word('RUA'), 'pt_br_core_seed', true),
('pt-BR', 'SOL', public.normalize_patxanga_word('SOL'), 'pt_br_core_seed', true),
('pt-BR', 'TEMPO', public.normalize_patxanga_word('TEMPO'), 'pt_br_core_seed', true),
('pt-BR', 'VIDA', public.normalize_patxanga_word('VIDA'), 'pt_br_core_seed', true)
on conflict (language, word_normalized) do update
set word_original = excluded.word_original,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = now();

## FILE: supabase/migrations/20260620215000_23_match_language_dictionary_validation.sql

-- ============================================================
-- PATXANGA - MATCH LANGUAGE DICTIONARY VALIDATION
-- Purpose: validate submitted and previewed words against match language
-- ============================================================

create or replace function public.preview_patxanga_move(
    p_match_id uuid,
    p_player_id uuid,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player record;
    v_hydrated_placed_tiles jsonb;
    v_virtual_board jsonb;
    v_words jsonb;
    v_score jsonb;
    v_word jsonb;
    v_is_valid boolean;
    v_has_invalid_word boolean := false;
    v_main_word text := null;
    v_secondary_words jsonb := '[]'::jsonb;
begin
    select *
    into v_match
    from patxanga_matches
    where id = p_match_id;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'active' then
        raise exception 'Match not active';
    end if;

    if v_match.current_turn_player_id <> p_player_id then
        raise exception 'Not your turn';
    end if;

    select *
    into v_player
    from patxanga_players
    where match_id = p_match_id
      and id = p_player_id;

    if not found then
        raise exception 'Player not found';
    end if;

    perform public.validate_patxanga_tile_ownership(
        v_player.rack_state,
        p_placed_tiles
    );

    perform public.validate_patxanga_move_alignment(
        v_match.board_state,
        p_placed_tiles
    );

    v_hydrated_placed_tiles :=
        public.hydrate_patxanga_placed_tiles(
            v_player.rack_state,
            p_placed_tiles
        );

    v_virtual_board :=
        public.build_patxanga_virtual_board(
            v_match.board_state,
            v_hydrated_placed_tiles
        );

    v_words :=
        public.extract_patxanga_words(
            v_virtual_board,
            v_hydrated_placed_tiles
        );

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        if (v_word->>'type') = 'main' then
            v_main_word := v_word->>'word';
        else
            v_secondary_words := v_secondary_words || jsonb_build_array(v_word);
        end if;
    end loop;

    if char_length(coalesce(v_main_word, '')) < 2 then
        raise exception 'Main word must have at least 2 letters';
    end if;

    v_score :=
        public.calculate_patxanga_score(
            v_words,
            v_match.board_state,
            p_placed_tiles
        );

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        v_is_valid := public.validate_word(v_word->>'word', v_match.language);

        if not v_is_valid then
            v_has_invalid_word := true;
            exit;
        end if;
    end loop;

    return jsonb_build_object(
        'status', 'ok',
        'main_word', v_main_word,
        'secondary_words', v_secondary_words,
        'words', v_words,
        'score', v_score,
        'requires_vote', v_has_invalid_word,
        'is_dictionary_recognized', not v_has_invalid_word,
        'error', null
    );
exception
    when others then
        return jsonb_build_object(
            'status', 'invalid',
            'error', SQLERRM
        );
end;
$$;

grant execute on function public.preview_patxanga_move(uuid, uuid, jsonb)
to authenticated, anon;

create or replace function public.submit_patxanga_move(
    p_match_id uuid,
    p_player_id uuid,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match record;
    v_player record;
    v_hydrated_placed_tiles jsonb;
    v_virtual_board jsonb;
    v_words jsonb;
    v_score jsonb;
    v_word jsonb;
    v_is_valid boolean;
    v_has_invalid_word boolean := false;
    v_main_word text := null;
    v_secondary_words jsonb := '[]'::jsonb;
    v_pending_move_id uuid;
    v_accepted_move_id uuid;
    v_next_player uuid;
    v_new_turn integer;
    v_new_rack jsonb;
    v_draw_result jsonb;
    v_drawn_tiles jsonb;
    v_new_bag jsonb;
    v_tiles_to_draw integer;
    v_end_result jsonb;
begin

    select *
    into v_match
    from patxanga_matches
    where id = p_match_id
    for update;

    if not found then
        raise exception 'Match not found';
    end if;

    if v_match.status <> 'active' then
        raise exception 'Match not active';
    end if;

    if v_match.current_turn_player_id <> p_player_id then
        raise exception 'Not your turn';
    end if;

    select *
    into v_player
    from patxanga_players
    where match_id = p_match_id
      and id = p_player_id
    for update;

    if not found then
        raise exception 'Player not found';
    end if;

    perform public.validate_patxanga_tile_ownership(
        v_player.rack_state,
        p_placed_tiles
    );

    perform public.validate_patxanga_move_alignment(
        v_match.board_state,
        p_placed_tiles
    );

    v_hydrated_placed_tiles :=
        public.hydrate_patxanga_placed_tiles(
            v_player.rack_state,
            p_placed_tiles
        );

    v_virtual_board :=
        public.build_patxanga_virtual_board(
            v_match.board_state,
            v_hydrated_placed_tiles
        );

    v_words :=
        public.extract_patxanga_words(
            v_virtual_board,
            v_hydrated_placed_tiles
        );

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        if (v_word->>'type') = 'main' then
            v_main_word := v_word->>'word';
        else
            v_secondary_words := v_secondary_words || jsonb_build_array(v_word);
        end if;
    end loop;

    if char_length(coalesce(v_main_word, '')) < 2 then
        raise exception 'Main word must have at least 2 letters';
    end if;

    for v_word in
        select value from jsonb_array_elements(v_words)
    loop
        v_is_valid := public.validate_word(v_word->>'word', v_match.language);

        if not v_is_valid then
            v_has_invalid_word := true;
            exit;
        end if;
    end loop;

    -- =========================================
    -- PERSISTENT PENDING_VOTE BRANCH
    -- =========================================
    if v_has_invalid_word then
        insert into patxanga_moves (
            match_id,
            player_id,
            move_type,
            status,
            main_word,
            secondary_words,
            placed_tiles,
            board_diff,
            used_tiles_from_rack,
            used_blank_tile,
            used_skip_tile,
            used_patxanga_real,
            patxanga_real_target_word,
            target_player_skipped_id,
            score_total,
            score_breakdown,
            is_dictionary_recognized,
            requires_vote,
            created_at,
            resolved_at
        )
        values (
            p_match_id,
            p_player_id,
            'place_word',
            'pending_vote',
            v_main_word,
            v_secondary_words,
            p_placed_tiles,
            v_hydrated_placed_tiles,
            p_placed_tiles,
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') = 'wildcard'
            ),
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') = 'skip_turn'
            ),
            exists (
                select 1
                from jsonb_array_elements(v_hydrated_placed_tiles) t
                where coalesce(t->>'special_type', '') in ('patxanga_real', 'PATXANGA_REAL')
            ),
            null,
            null,
            0,
            jsonb_build_object(
                'status', 'pending_vote',
                'words', v_words
            ),
            false,
            true,
            now(),
            null
        )
        returning id into v_pending_move_id;

        update patxanga_matches
        set status = 'voting',
            updated_at = now()
        where id = p_match_id;

        insert into patxanga_replay_events (
            match_id,
            event_type,
            event_payload,
            turn_number,
            created_at
        )
        values (
            p_match_id,
            'word_rejected',
            jsonb_build_object(
                'move_id', v_pending_move_id,
                'player_id', p_player_id,
                'main_word', v_main_word,
                'words', v_words,
                'requires_vote', true
            ),
            v_match.turn_number,
            now()
        );

        return jsonb_build_object(
            'status', 'pending_vote',
            'move_id', v_pending_move_id,
            'main_word', v_main_word,
            'words', v_words,
            'match_status', 'voting'
        );
    end if;

    -- =========================================
    -- SUCCESS BRANCH
    -- =========================================

    v_score :=
        public.calculate_patxanga_score(
            v_words,
            v_match.board_state,
            p_placed_tiles
        );

    v_new_rack :=
        public.remove_patxanga_tiles_from_rack(
            v_player.rack_state,
            p_placed_tiles
        );

    v_tiles_to_draw := 7 - jsonb_array_length(v_new_rack);

    v_draw_result :=
        public.draw_patxanga_tiles_from_bag(
            v_match.bag_state,
            v_tiles_to_draw
        );

    v_drawn_tiles := v_draw_result->'drawn_tiles';
    v_new_bag := v_draw_result->'new_bag_state';

    v_new_rack := v_new_rack || v_drawn_tiles;

    insert into patxanga_moves (
        match_id,
        player_id,
        move_type,
        status,
        main_word,
        secondary_words,
        placed_tiles,
        board_diff,
        used_tiles_from_rack,
        used_blank_tile,
        used_skip_tile,
        used_patxanga_real,
        patxanga_real_target_word,
        target_player_skipped_id,
        score_total,
        score_breakdown,
        is_dictionary_recognized,
        requires_vote,
        created_at,
        resolved_at
    )
    values (
        p_match_id,
        p_player_id,
        'place_word',
        'accepted',
        v_main_word,
        v_secondary_words,
        p_placed_tiles,
        v_hydrated_placed_tiles,
        p_placed_tiles,
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') = 'wildcard'
        ),
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') = 'skip_turn'
        ),
        exists (
            select 1
            from jsonb_array_elements(v_hydrated_placed_tiles) t
            where coalesce(t->>'special_type', '') in ('patxanga_real', 'PATXANGA_REAL')
        ),
        null,
        null,
        (v_score->>'total_score')::integer,
        jsonb_build_object(
            'words', v_words,
            'final_score', v_score
        ),
        true,
        false,
        now(),
        now()
    )
    returning id into v_accepted_move_id;

    update patxanga_matches
    set board_state = v_virtual_board,
        bag_state = v_new_bag,
        updated_at = now()
    where id = p_match_id;

    update patxanga_players
    set score = score + (v_score->>'total_score')::integer,
        rack_state = v_new_rack,
        has_passed_last_cycle = false,
        updated_at = now()
    where match_id = p_match_id
      and id = p_player_id;

    -- valid move breaks stagnation cycle for everyone
    update patxanga_players
    set has_passed_last_cycle = false,
        updated_at = now()
    where match_id = p_match_id;

    select id
    into v_next_player
    from patxanga_players
    where match_id = p_match_id
      and turn_order >
          (
              select turn_order
              from patxanga_players
              where match_id = p_match_id
                and id = p_player_id
          )
    order by turn_order
    limit 1;

    if v_next_player is null then
        select id
        into v_next_player
        from patxanga_players
        where match_id = p_match_id
        order by turn_order
        limit 1;
    end if;

    v_new_turn := v_match.turn_number + 1;

    update patxanga_matches
    set current_turn_player_id = v_next_player,
        turn_number = v_new_turn,
        updated_at = now()
    where id = p_match_id;

    insert into patxanga_replay_events (
        match_id,
        event_type,
        event_payload,
        turn_number,
        created_at
    )
    values (
        p_match_id,
        'move_submitted',
        jsonb_build_object(
            'move_id', v_accepted_move_id,
            'player_id', p_player_id,
            'placed_tiles', p_placed_tiles,
            'words', v_words,
            'score_breakdown', v_score,
            'tiles_drawn', v_drawn_tiles,
            'next_player', v_next_player
        ),
        v_new_turn,
        now()
    );

    -- Evaluate match end after successful move
    v_end_result := public.evaluate_patxanga_match_end(p_match_id);

    return jsonb_build_object(
        'status', 'success',
        'move_id', v_accepted_move_id,
        'score', v_score,
        'next_player', v_next_player,
        'turn_number', v_new_turn,
        'end_state', v_end_result
    );

end;
$$;

grant execute on function public.submit_patxanga_move(uuid, uuid, jsonb)
to authenticated, anon;

## FILE: supabase/migrations/20260620220000_24_pt_pt_language_baseline.sql

-- ============================================================
-- PATXANGA - PT-PT LANGUAGE BASELINE
-- Purpose: make pt-PT startable and lexically testable
-- ============================================================

delete from public.patxanga_letter_distribution
where language = 'pt-PT';

insert into public.patxanga_letter_distribution (
    language,
    letter,
    quantity,
    points,
    is_special,
    special_type
)
select
    'pt-PT',
    letter,
    quantity,
    points,
    is_special,
    special_type
from public.patxanga_letter_distribution
where language = 'pt-BR';

insert into public.patxanga_dictionary (
    language,
    word_original,
    word_normalized,
    source,
    is_active
)
values
('pt-PT', 'AMOR', public.normalize_patxanga_word('AMOR'), 'pt_pt_core_seed', true),
('pt-PT', 'AÇÃO', public.normalize_patxanga_word('AÇÃO'), 'pt_pt_core_seed', true),
('pt-PT', 'BOLA', public.normalize_patxanga_word('BOLA'), 'pt_pt_core_seed', true),
('pt-PT', 'CASA', public.normalize_patxanga_word('CASA'), 'pt_pt_core_seed', true),
('pt-PT', 'GATO', public.normalize_patxanga_word('GATO'), 'pt_pt_core_seed', true),
('pt-PT', 'JOGO', public.normalize_patxanga_word('JOGO'), 'pt_pt_core_seed', true),
('pt-PT', 'LIVRO', public.normalize_patxanga_word('LIVRO'), 'pt_pt_core_seed', true),
('pt-PT', 'LUA', public.normalize_patxanga_word('LUA'), 'pt_pt_core_seed', true),
('pt-PT', 'MÃO', public.normalize_patxanga_word('MÃO'), 'pt_pt_core_seed', true),
('pt-PT', 'MAR', public.normalize_patxanga_word('MAR'), 'pt_pt_core_seed', true),
('pt-PT', 'MESA', public.normalize_patxanga_word('MESA'), 'pt_pt_core_seed', true),
('pt-PT', 'PÃO', public.normalize_patxanga_word('PÃO'), 'pt_pt_core_seed', true),
('pt-PT', 'PATO', public.normalize_patxanga_word('PATO'), 'pt_pt_core_seed', true),
('pt-PT', 'PORTA', public.normalize_patxanga_word('PORTA'), 'pt_pt_core_seed', true),
('pt-PT', 'RUA', public.normalize_patxanga_word('RUA'), 'pt_pt_core_seed', true),
('pt-PT', 'SOL', public.normalize_patxanga_word('SOL'), 'pt_pt_core_seed', true),
('pt-PT', 'TEMPO', public.normalize_patxanga_word('TEMPO'), 'pt_pt_core_seed', true),
('pt-PT', 'VIDA', public.normalize_patxanga_word('VIDA'), 'pt_pt_core_seed', true)
on conflict (language, word_normalized) do update
set word_original = excluded.word_original,
    source = excluded.source,
    is_active = excluded.is_active,
    updated_at = now();

## FILE: supabase/migrations/20260621090000_25_dictionary_import_pipeline.sql

-- ============================================================
-- PATXANGA - DICTIONARY IMPORT PIPELINE
-- Purpose: audited administrative imports for licensed dictionary sources
-- ============================================================

create table if not exists public.patxanga_dictionary_import_batches (
    id uuid primary key default uuid_generate_v4(),
    language text not null check (language in ('pt-BR', 'pt-PT')),
    source text not null check (length(trim(source)) > 0),
    source_version text null,
    license_name text not null check (length(trim(license_name)) > 0),
    license_url text null,
    source_url text null,
    imported_by text null,
    import_status text not null default 'completed'
        check (import_status in ('completed', 'failed')),
    total_rows integer not null default 0 check (total_rows >= 0),
    valid_rows integer not null default 0 check (valid_rows >= 0),
    inserted_count integer not null default 0 check (inserted_count >= 0),
    updated_count integer not null default 0 check (updated_count >= 0),
    skipped_count integer not null default 0 check (skipped_count >= 0),
    deactivated_count integer not null default 0 check (deactivated_count >= 0),
    metadata jsonb not null default '{}'::jsonb,
    notes text null,
    created_at timestamptz not null default now(),
    completed_at timestamptz not null default now()
);

alter table public.patxanga_dictionary
add column if not exists source_version text,
add column if not exists license_name text,
add column if not exists license_url text,
add column if not exists source_url text,
add column if not exists import_batch_id uuid,
add column if not exists imported_at timestamptz;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'patxanga_dictionary_import_batch_fk'
          and conrelid = 'public.patxanga_dictionary'::regclass
    ) then
        alter table public.patxanga_dictionary
        add constraint patxanga_dictionary_import_batch_fk
        foreign key (import_batch_id)
        references public.patxanga_dictionary_import_batches(id)
        on delete set null;
    end if;
end $$;

create index if not exists idx_patxanga_dictionary_import_batch
on public.patxanga_dictionary (import_batch_id);

create index if not exists idx_patxanga_dictionary_language_source_active
on public.patxanga_dictionary (language, source, is_active);

create index if not exists idx_patxanga_dictionary_import_batches_source
on public.patxanga_dictionary_import_batches (language, source, source_version);

drop function if exists public.import_patxanga_dictionary_entries(
    text,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    jsonb,
    boolean
);

create or replace function public.import_patxanga_dictionary_entries(
    p_language text,
    p_source text,
    p_license_name text,
    p_entries jsonb,
    p_source_version text default null,
    p_license_url text default null,
    p_source_url text default null,
    p_imported_by text default null,
    p_metadata jsonb default '{}'::jsonb,
    p_deactivate_missing boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as
$$
declare
    v_language text := trim(coalesce(p_language, ''));
    v_source text := nullif(trim(coalesce(p_source, '')), '');
    v_license_name text := nullif(trim(coalesce(p_license_name, '')), '');
    v_source_version text := nullif(trim(coalesce(p_source_version, '')), '');
    v_license_url text := nullif(trim(coalesce(p_license_url, '')), '');
    v_source_url text := nullif(trim(coalesce(p_source_url, '')), '');
    v_imported_by text := nullif(trim(coalesce(p_imported_by, '')), '');
    v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
    v_total_rows integer := 0;
    v_valid_rows integer := 0;
    v_inserted_count integer := 0;
    v_updated_count integer := 0;
    v_skipped_count integer := 0;
    v_deactivated_count integer := 0;
    v_batch_id uuid;
begin
    if v_language not in ('pt-BR', 'pt-PT') then
        raise exception 'Unsupported dictionary language: %', p_language;
    end if;

    if v_source is null then
        raise exception 'Dictionary import source is required';
    end if;

    if v_license_name is null then
        raise exception 'Dictionary import license_name is required';
    end if;

    if p_entries is null or jsonb_typeof(p_entries) <> 'array' then
        raise exception 'Dictionary import entries must be a JSON array';
    end if;

    if jsonb_typeof(v_metadata) <> 'object' then
        raise exception 'Dictionary import metadata must be a JSON object';
    end if;

    v_total_rows := jsonb_array_length(p_entries);

    if to_regclass('pg_temp.patxanga_dictionary_import_stage') is null then
        create temporary table patxanga_dictionary_import_stage (
            word_original text not null,
            word_normalized text not null,
            is_active boolean not null
        ) on commit drop;
    else
        truncate table patxanga_dictionary_import_stage;
    end if;

    insert into patxanga_dictionary_import_stage (
        word_original,
        word_normalized,
        is_active
    )
    with raw_entries as (
        select
            entry.value,
            entry.ordinality
        from jsonb_array_elements(p_entries) with ordinality as entry(value, ordinality)
    ),
    prepared_entries as (
        select
            nullif(trim(coalesce(value->>'word_original', value->>'word', '')), '') as word_original,
            public.normalize_patxanga_word(
                nullif(trim(coalesce(value->>'word_original', value->>'word', '')), '')
            ) as word_normalized,
            coalesce(nullif(trim(value->>'is_active'), ''), 'true')::boolean as is_active,
            ordinality
        from raw_entries
    )
    select distinct on (word_normalized)
        word_original,
        word_normalized,
        is_active
    from prepared_entries
    where word_original is not null
      and word_normalized is not null
      and word_normalized <> ''
    order by word_normalized, ordinality;

    select count(*)
    into v_valid_rows
    from patxanga_dictionary_import_stage;

    select count(*)
    into v_inserted_count
    from patxanga_dictionary_import_stage stage
    where not exists (
        select 1
        from public.patxanga_dictionary dictionary
        where dictionary.language = v_language
          and dictionary.word_normalized = stage.word_normalized
    );

    v_updated_count := v_valid_rows - v_inserted_count;
    v_skipped_count := v_total_rows - v_valid_rows;

    insert into public.patxanga_dictionary_import_batches (
        language,
        source,
        source_version,
        license_name,
        license_url,
        source_url,
        imported_by,
        total_rows,
        valid_rows,
        inserted_count,
        updated_count,
        skipped_count,
        metadata
    )
    values (
        v_language,
        v_source,
        v_source_version,
        v_license_name,
        v_license_url,
        v_source_url,
        v_imported_by,
        v_total_rows,
        v_valid_rows,
        v_inserted_count,
        v_updated_count,
        v_skipped_count,
        v_metadata
    )
    returning id into v_batch_id;

    insert into public.patxanga_dictionary (
        language,
        word_original,
        word_normalized,
        source,
        is_active,
        source_version,
        license_name,
        license_url,
        source_url,
        import_batch_id,
        imported_at,
        updated_at
    )
    select
        v_language,
        stage.word_original,
        stage.word_normalized,
        v_source,
        stage.is_active,
        v_source_version,
        v_license_name,
        v_license_url,
        v_source_url,
        v_batch_id,
        now(),
        now()
    from patxanga_dictionary_import_stage stage
    on conflict (language, word_normalized) do update
    set word_original = excluded.word_original,
        source = excluded.source,
        is_active = excluded.is_active,
        source_version = excluded.source_version,
        license_name = excluded.license_name,
        license_url = excluded.license_url,
        source_url = excluded.source_url,
        import_batch_id = excluded.import_batch_id,
        imported_at = excluded.imported_at,
        updated_at = excluded.updated_at;

    if p_deactivate_missing then
        update public.patxanga_dictionary dictionary
        set is_active = false,
            import_batch_id = v_batch_id,
            imported_at = now(),
            updated_at = now()
        where dictionary.language = v_language
          and dictionary.source = v_source
          and dictionary.is_active = true
          and not exists (
              select 1
              from patxanga_dictionary_import_stage stage
              where stage.word_normalized = dictionary.word_normalized
          );

        get diagnostics v_deactivated_count = row_count;

        update public.patxanga_dictionary_import_batches
        set deactivated_count = v_deactivated_count
        where id = v_batch_id;
    end if;

    return jsonb_build_object(
        'status', 'success',
        'batch_id', v_batch_id,
        'language', v_language,
        'source', v_source,
        'source_version', v_source_version,
        'license_name', v_license_name,
        'total_rows', v_total_rows,
        'valid_rows', v_valid_rows,
        'inserted_count', v_inserted_count,
        'updated_count', v_updated_count,
        'skipped_count', v_skipped_count,
        'deactivated_count', v_deactivated_count,
        'deactivate_missing', p_deactivate_missing
    );
end;
$$;

revoke all on function public.import_patxanga_dictionary_entries(
    text,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    jsonb,
    boolean
) from public, anon, authenticated;

grant execute on function public.import_patxanga_dictionary_entries(
    text,
    text,
    text,
    jsonb,
    text,
    text,
    text,
    text,
    jsonb,
    boolean
) to service_role;

## FRASE PADRAO DE PASSAGEM DE BASTAO

ATENCAO: VOCE esta assumindo a continuidade do projeto Patxanga. Nao assuma contexto, nao altere nada antes de verificar o estado real e trate continuidade, rastreabilidade, seguranca, validacao e documentacao como requisitos obrigatorios. Peca explicitamente o arquivo docs/18-room-baton-package-current.md para receber diretivas, contexto operacional e status atualizado do projeto e, no ambiente local deste operador, solicite que ele rode o comando cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit docs/18-room-baton-package-current.md para abrir o arquivo no Mac.
Depois da leitura inicial do pacote de bastao, apresente obrigatoriamente ao operador uma escolha explicita entre tres modos de atuacao: PADRAO, GATE e GATE_CHECKLIST. Explique cada modo em uma linha, recomende PADRAO como opcao default e aguarde a decisao do operador antes de prosseguir.
Definido o modo, valide branch atual, HEAD, upstream, commits recentes, ../project-log.md, working tree, ambiente operacional, ultimo build/teste validado e artefatos de inicializacao com o rigor correspondente ao modo escolhido. Se houver divergencia entre memoria, conversa, documentacao e repositorio local, o estado local verificado prevalece. O arquivo docs/18-room-baton-package-current.md deve ser atualizado sempre que o operador solicitar ou sempre que houver mudanca relevante suficiente para impactar a retomada segura.
