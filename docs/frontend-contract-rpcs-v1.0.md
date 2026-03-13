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
