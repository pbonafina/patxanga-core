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