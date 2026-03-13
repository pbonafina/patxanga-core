# PATXANGA — FRONTEND CONTRACT: Match Bootstrap
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE
Base normativa:
- Context Snapshot Master v1.6
- docs/12-submit-move-contract.md — Version 1.2 (Frozen)
- docs/frontend-contract-rpcs-v1.0.md
- docs/frontend-contract-match-states-v1.0.md
- docs/frontend-contract-screen-actions-v1.0.md

## 1. Objetivo

Este documento define o carregamento mínimo de dados para o frontend entrar,
reentrar ou retomar uma partida sem violar o modelo server-authoritative.

Ele não redefine engine, não substitui migrations e não altera contratos já congelados.

## 2. Regra central

- o frontend só deve renderizar a partida a partir de estado oficial retornado pelo backend
- o frontend não reconstrói estado interno crítico por heurística local
- `player_id` é a identidade correta de gameplay dentro da match
- `user_id` não substitui `player_id` no estado interno da partida

## 3. Dados mínimos para bootstrap de match

Ao entrar ou retomar uma partida, o frontend deve obter, no mínimo:

- `match_id`
- `status` da match
- `player_id` do usuário dentro daquela match, quando aplicável
- `board_state` oficial
- `rack_state` oficial do jogador atual da sessão, quando permitido
- `current_turn_player_id`
- scores oficiais persistidos
- `winner_player_id`, se a match estiver encerrada
- `finished_at`, se a match estiver encerrada

## 4. Ordem recomendada de carregamento

### Etapa 1 — identificar contexto da match
- resolver `match_id`
- resolver `player_id` correspondente àquele usuário naquela match
- resolver `status` oficial da match

### Etapa 2 — carregar estado oficial base
- carregar `board_state`
- carregar scores persistidos
- carregar `current_turn_player_id`

### Etapa 3 — carregar estado dependente do jogador
- carregar `rack_state` do jogador autenticado, quando permitido
- carregar dados auxiliares de presença, retomada ou lobby, quando aplicável

### Etapa 4 — adaptar UI ao estado oficial
- se `waiting`: renderizar lobby
- se `active`: renderizar tela normal de partida
- se `voting`: renderizar fluxo de votação
- se `finished`: renderizar resultado final

## 5. Bootstrap por estado oficial

### 5.1 `waiting`

O frontend deve priorizar:
- participantes atuais
- permissões de início de partida
- `match_id`
- `status`

Não deve presumir:
- rack jogável ativo
- turno ativo jogável

### 5.2 `active`

O frontend deve priorizar:
- `board_state`
- `rack_state` do jogador da sessão
- `current_turn_player_id`
- scores oficiais

Deve bloquear qualquer ação que não corresponda ao jogador do turno.

### 5.3 `voting`

O frontend deve priorizar:
- estado oficial ainda não aplicado ao board da jogada pendente
- contexto de votação
- indicação clara de bloqueio de jogada normal

Não deve:
- aplicar localmente a jogada pendente ao board oficial
- remover peças do rack oficial
- avançar turno localmente

### 5.4 `finished`

O frontend deve priorizar:
- scores finais oficiais
- `winner_player_id`
- `finished_at`
- bloqueio de ações de gameplay

## 6. Reidratação e retomada

Ao reabrir uma partida ou retomar sessão, o frontend deve:

- descartar qualquer suposição local não confirmada
- recarregar o estado oficial mínimo da match
- recalcular apenas estado visual temporário de UI
- tratar `status` e `current_turn_player_id` vindos do backend como fonte oficial

## 7. Estados locais temporários que não são fonte de verdade

- seleção local de peças
- drag-and-drop local
- preview visual de palavra
- score estimado local
- indicação local provisória de próxima ação

Esses estados podem existir para UX, mas devem ser descartados diante do retorno oficial.

## 8. Relação com as RPCs

- `create_match()` e `join_match()` resolvem entrada no contexto da partida
- `start_match()` faz a transição de `waiting` para `active`
- `submit_patxanga_move()` pode manter `active`, gerar erro ou levar a `voting`
- `submit_patxanga_vote()` resolve `voting` e retorna a `active`
- `submit_patxanga_pass_turn()` e `submit_patxanga_exchange_tiles()` exigem reidratação mínima do estado oficial após sucesso

## 9. Limites deste documento

- não substitui o contrato de RPCs
- não substitui o contrato de estados
- não substitui o contrato de ações por tela
- não redefine replay
- não redefine engine

Fim do documento.
