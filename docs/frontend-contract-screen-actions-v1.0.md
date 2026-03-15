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
