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
