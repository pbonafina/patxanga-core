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
