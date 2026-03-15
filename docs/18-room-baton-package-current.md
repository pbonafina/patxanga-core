# PATXANGA — Room Baton Package (Current)
Generated at: 2026-03-15 18:57:01

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
## develop...origin/develop
 M docs/18-room-baton-package-current.md
 M docs/current-development-continuity-spec-v1.0.md
 M docs/frontend-browser-validation-procedure-v1.0.md
 M docs/frontend-contract-rpcs-v1.0.md
 M docs/frontend-contract-screen-actions-v1.0.md
 M docs/frontend-rack-composition-implementation-plan-v1.0.md
 M docs/frontend-rack-composition-ux-v1.0.md
 M frontend/components/BoardSection.tsx
 M frontend/components/GamePlayScreen.tsx
 M frontend/components/RackSection.tsx
 M frontend/pages/index.tsx
 M frontend/tests/browser-validation.spec.ts
?? docs/15-pacote-final-colagem-v1.2-ultra-blindado.md
?? generate-continuity-package.sh
```

### git remote -v
```
origin	https://github.com/pbonafina/patxanga-core.git (fetch)
origin	https://github.com/pbonafina/patxanga-core.git (push)
```

### git log --oneline --decorate -n 15
```
b78659e (HEAD -> develop, origin/develop) Estabiliza especificacao de continuidade pos-push
978c27c Atualiza kit de continuidade com especificacao do estado atual
13fa822 Tighten local ignore rules
9fa27ce Implement local rack slot associations
0722828 Add SQL regression test suites
372d0e7 Add operational lobby invite baseline
d584091 Add browser validation scenarios and Playwright coverage
9e0feae Formalize same-room resume continuity protocol
54da7e4 Implement rack UX and backend move preview
339e716 Inclui comando local de abertura na frase de passagem de bastao
4b181f0 Refina frase oficial de passagem de bastao
1ddb5a6 Adiciona processo e pacote unico de passagem de bastao
9092d55 Refina regra de lacuna entre duas pecas selecionadas
71716b1 Normaliza superficie local de composicao do rack
5aa2663 Adiciona plano de implementacao da composicao local do rack
```

### tail -n 60 ../project-log.md
```
## 2026-03-13 22:42
- Ajustado room restart prompt para instruir a nova sala a aguardar todos os arquivos enviados antes de seguir.

## 2026-03-13 23:07
- Refinado room restart prompt listando explicitamente snapshot vigente e contratos curtos concretos do frontend.

## 2026-03-14 11:27
- Refinada composicao visual da tela jogavel

## 2026-03-14 12:01
- Destacado turno ativo no rack com cronometro visual

## 2026-03-14 12:05
- Destacado turno ativo no rack com cronometro visual

## 2026-03-14 12:22
- Adicionada selecao multipla e reordenacao em grupo no rack

## 2026-03-14 13:37
- Adicionado procedimento de validacao manual no browser

## 2026-03-14 13:37
- Corrigido destaque de turno e cronometro do rack

## 2026-03-14 13:41
- Adicionado contrato de UX para composicao local do rack

## 2026-03-14 13:45
- Adicionado plano de implementacao da composicao local do rack

## 2026-03-14 14:01
- Normalizada superficie local de composicao do rack

## 2026-03-14 14:06
- Refinada regra de lacuna entre duas pecas selecionadas

## 2026-03-14 14:53
- Adicionado processo e pacote unico de passagem de bastao

## 2026-03-14 15:06
- Refinada frase oficial de passagem de bastao

## 2026-03-14 16:30
- Incluido comando local de abertura na frase de passagem de bastao

## 2026-03-14 23:23
- Commit 54da7e4: refinada a UX do rack e do tabuleiro, exigido declared_letter para todas as pecas especiais e adicionada RPC preview_patxanga_move com score estimado no frontend.

## 2026-03-14 23:38
- Revisado o protocolo de continuidade para exigir escolha explicita entre PADRAO, GATE e GATE_CHECKLIST apos a leitura inicial do pacote de bastao.

## 2026-03-14 23:44
- Formalizado protocolo de retomada na mesma sala com checkpoint curto, frase padrao de retomada e revalidacao do ultimo passo incerto.

## 2026-03-15 18:38
- Atualizada especificacao viva de continuidade e confirmado push da baseline atual.

## 2026-03-15 18:39
- Estabilizada especificacao de continuidade pos-push e mantido pacote current como artefato vivo local.

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
printf "\n### rodada browser %s\nmatch_id=COLE_AQUI\nuser_id=COLE_AQUI\nobjetivo=COLE_AQUI\n" "$(date "+%Y-%m-%d %H:%M:%S")" >> tmp/browser-validation-notes.txt
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

## FILE: docs/current-development-continuity-spec-v1.0.md

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

## 4. Ultima validacao confirmada

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

## 5. O que ainda nao esta fechado

### 5.1 O contrato oficial por slots ja existe, mas ainda precisa consolidacao

A associacao entre slot, peca real e casa do tabuleiro
ja foi promovida a contrato oficial de composicao no frontend.

Consequencia:
- preview e submit ja podem nascer dessa superficie
- o proximo risco deixa de ser "promover a contrato"
  e passa a ser consolidar a UX e ampliar a cobertura de validacao

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

### 5.5 Versionamento remoto principal ja foi concluido

O versionamento remoto dos commits principais desta frente ja foi concluido.

Consequencia:
- `origin/develop` ja contem a baseline funcional e a especificacao viva desta etapa
- a continuidade entre salas deixa de depender apenas desta maquina local

### 5.6 O pacote `current` e um artefato vivo e autorreferente

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

### 5.7 O `logstep.sh` precisa rodar no diretorio pai

O script `logstep.sh` grava em `project-log.md` relativo ao diretório corrente.

Consequencia:
- para atualizar o log operacional oficial em `~/patxanga-bootstrap/project-log.md`,
  o comando deve ser executado a partir de `~/patxanga-bootstrap`
- rodar o script a partir do root do repo cria ou atualiza um `project-log.md`
  local no repositório, que nao e o log operacional oficial

## 6. Proximos passos recomendados

### 6.1 Prioridade imediata: fechar continuidade operacional

Sequencia recomendada:

1. triar os dois arquivos untracked
2. manter apenas o que for realmente baseline ou trabalho deliberado
3. usar esta especificacao e os commits pushados como baseline estavel
4. regenerar o pacote `current` sempre que o estado real mudar de forma relevante
5. garantir que o `logstep` seja executado no diretorio pai correto

Resultado esperado:
- retomada segura em outra sala sem depender da memoria desta conversa

### 6.2 Proxima frente funcional: consolidar a composicao oficial por slots

Sequencia recomendada:

1. validar submit real com cenarios mais ricos da nova composicao
2. revisar comportamento de limpar, mover, substituir e recompor slots
3. decidir se o fluxo direto peca -> board continua coexistindo
   ou se a tela converge para um unico fluxo oficial
4. ampliar Playwright para cobrir recomposicao e pending_vote nessa superficie
5. manter docs de UX, RPC e validacao sincronizados

### 6.3 Consolidar a primeira tela jogavel como baseline de produto

Depois da etapa acima, a frente mais produtiva e:

1. reduzir divergencias entre tela de teste e tela de produto
2. consolidar a home/tela jogavel como superficie principal
3. eliminar controles temporarios que nao agreguem ao fluxo real
4. manter apenas ferramentas operacionais que acelerem validacao e debug

### 6.4 Expandir cobertura automatizada com foco no fluxo jogavel

Coberturas mais valiosas a seguir:

1. submit real a partir da composicao oficial por slots
2. cancelamento/limpeza parcial de composicao
3. estados de pending vote e resolucao
4. regressao do rack apos acoes de partida real

## 7. Ordem segura de retomada a partir daqui

Ao retomar esta frente em outra sala:

1. ler `docs/18-room-baton-package-current.md`
2. escolher modo de atuacao
3. validar `git status --short --branch`
4. validar `git log --oneline --decorate -5`
5. confirmar que `origin/develop` contem os commits mais recentes desta frente
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

## FRASE PADRAO DE PASSAGEM DE BASTAO

ATENCAO: VOCE esta assumindo a continuidade do projeto Patxanga. Nao assuma contexto, nao altere nada antes de verificar o estado real e trate continuidade, rastreabilidade, seguranca, validacao e documentacao como requisitos obrigatorios. Peca explicitamente o arquivo docs/18-room-baton-package-current.md para receber diretivas, contexto operacional e status atualizado do projeto e, no ambiente local deste operador, solicite que ele rode o comando cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit docs/18-room-baton-package-current.md para abrir o arquivo no Mac.
Depois da leitura inicial do pacote de bastao, apresente obrigatoriamente ao operador uma escolha explicita entre tres modos de atuacao: PADRAO, GATE e GATE_CHECKLIST. Explique cada modo em uma linha, recomende PADRAO como opcao default e aguarde a decisao do operador antes de prosseguir.
Definido o modo, valide branch atual, HEAD, upstream, commits recentes, ../project-log.md, working tree, ambiente operacional, ultimo build/teste validado e artefatos de inicializacao com o rigor correspondente ao modo escolhido. Se houver divergencia entre memoria, conversa, documentacao e repositorio local, o estado local verificado prevalece. O arquivo docs/18-room-baton-package-current.md deve ser atualizado sempre que o operador solicitar ou sempre que houver mudanca relevante suficiente para impactar a retomada segura.
