# PATXANGA — MODELO DE BANCO DE DADOS
Versão: 1.0
Status: Fundação Técnica
Modo Atual: Partidas Síncronas

---

## 1. Objetivo

O banco de dados do Patxanga será a fonte de verdade de todo o estado do jogo.

Princípios:

- Persistência completa
- Zero dependência de estado crítico em memória
- Lógica transacional
- Compatibilidade com Supabase Realtime
- Preparação futura para partidas assíncronas

---

## 2. Estratégia Geral

O modelo foi desenhado para partidas síncronas por turnos, com:

- até 4 participantes
- combinação livre entre humanos e bots
- validação de jogadas via RPC
- sincronização por eventos de banco
- presença de jogadores
- votação de palavras não reconhecidas

---

## 3. Entidades Principais

### 3.1 patxanga_matches

Representa a partida como entidade central.

Campos previstos:

- `id` UUID PK
- `status` TEXT  
  Valores previstos:
  - `waiting`
  - `active`
  - `voting`
  - `finished`
  - `cancelled`

- `match_mode` TEXT  
  Valores previstos:
  - `synchronous`
  - `asynchronous`

- `language` TEXT  
  Valores previstos:
  - `pt-BR`
  - `pt-PT`

- `host_user_id` UUID NULL  
  Referência ao usuário anfitrião, quando houver conta

- `host_guest_name` TEXT NULL  
  Nome do anfitrião quando for convidado sem login

- `max_players` INTEGER  
  Valor padrão: 4

- `turn_time_seconds` INTEGER NULL  
  Null significa partida sem limite de tempo

- `hint_mode_enabled` BOOLEAN  
  Define se dicas para humanos estão habilitadas

- `board_state` JSONB  
  Estado completo do tabuleiro 15x15

- `bag_state` JSONB  
  Estado atual da bolsa de peças

- `current_turn_player_id` UUID NULL  
  Referência ao jogador atual da partida

- `turn_number` INTEGER  
  Número sequencial do turno

- `turn_expires_at` TIMESTAMP NULL  
  Preparação para timer e modo assíncrono

- `winner_player_id` UUID NULL  
  Jogador vencedor, quando houver

- `created_at` TIMESTAMP
- `started_at` TIMESTAMP NULL
- `finished_at` TIMESTAMP NULL
- `updated_at` TIMESTAMP

---

### 3.2 patxanga_players

Representa os participantes da partida.

Campos previstos:

- `id` UUID PK
- `match_id` UUID FK -> patxanga_matches.id
- `user_id` UUID NULL  
  Referência ao usuário autenticado

- `guest_name` TEXT NULL  
  Nome temporário para convidado sem login

- `display_name` TEXT  
  Nome exibido na partida

- `seat_index` INTEGER  
  Ordem visual/posição na mesa

- `turn_order` INTEGER  
  Ordem efetiva de turno

- `is_bot` BOOLEAN
- `bot_level` TEXT NULL  
  Valores previstos:
  - `easy`
  - `medium`
  - `hard`

- `bot_profile` TEXT NULL  
  Valores previstos:
  - `aggressive`
  - `balanced`
  - `defensive`

- `rack_state` JSONB  
  Letras/peças atuais do jogador

- `score` INTEGER
- `skip_next_turn` BOOLEAN  
  Aplicado por peça especial "Pular a Vez"

- `has_passed_last_cycle` BOOLEAN  
  Controle para encerramento por passes consecutivos

- `is_connected` BOOLEAN
- `joined_at` TIMESTAMP
- `last_seen_at` TIMESTAMP NULL
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

---

### 3.3 patxanga_moves

Representa cada jogada tentada ou confirmada.

Campos previstos:

- `id` UUID PK
- `match_id` UUID FK -> patxanga_matches.id
- `player_id` UUID FK -> patxanga_players.id

- `move_type` TEXT  
  Valores previstos:
  - `place_word`
  - `exchange_tiles`
  - `pass`
  - `timeout_pass`

- `status` TEXT  
  Valores previstos:
  - `pending_validation`
  - `pending_vote`
  - `accepted`
  - `rejected`

- `main_word` TEXT NULL
- `secondary_words` JSONB NULL  
  Lista de palavras secundárias formadas

- `placed_tiles` JSONB NULL  
  Peças colocadas na jogada, posições e metadados

- `board_diff` JSONB NULL  
  Diferença aplicada no tabuleiro

- `used_tiles_from_rack` JSONB NULL

- `used_blank_tile` BOOLEAN
- `used_skip_tile` BOOLEAN
- `used_patxanga_real` BOOLEAN

- `patxanga_real_target_word` TEXT NULL

- `target_player_skipped_id` UUID NULL  
  Jogador afetado por "Pular a Vez"

- `score_total` INTEGER DEFAULT 0
- `score_breakdown` JSONB NULL  
  Detalhamento completo da pontuação

- `is_dictionary_recognized` BOOLEAN NULL  
  Indica se a palavra estava no dicionário oficial

- `requires_vote` BOOLEAN
- `created_at` TIMESTAMP
- `resolved_at` TIMESTAMP NULL

---

### 3.4 patxanga_votes

Representa votos de rejeição em palavras não reconhecidas.

Campos previstos:

- `id` UUID PK
- `move_id` UUID FK -> patxanga_moves.id
- `match_id` UUID FK -> patxanga_matches.id
- `voter_player_id` UUID FK -> patxanga_players.id

- `vote_reject` BOOLEAN  
  True = rejeitar  
  Ausência de voto dentro do prazo = aceitação automática

- `created_at` TIMESTAMP

Restrições:

- Um voto por jogador por jogada
- Jogador autor da jogada não vota

---

### 3.5 patxanga_match_presence

Presença online dos participantes na partida.

Campos previstos:

- `id` UUID PK
- `match_id` UUID FK -> patxanga_matches.id
- `player_id` UUID FK -> patxanga_players.id
- `is_online` BOOLEAN
- `last_ping_at` TIMESTAMP
- `updated_at` TIMESTAMP

Objetivos:
- detectar reconexão
- detectar abandono
- suportar timeout e sincronização de interface

---

### 3.6 patxanga_replay_events

Log de eventos imutáveis da partida.

Campos previstos:

- `id` UUID PK
- `match_id` UUID FK -> patxanga_matches.id
- `event_type` TEXT
- `event_payload` JSONB
- `turn_number` INTEGER
- `created_at` TIMESTAMP

Eventos previstos:

- `match_created`
- `player_joined`
- `match_started`
- `tiles_drawn`
- `move_submitted`
- `move_rejected`
- `vote_started`
- `vote_cast`
- `vote_resolved`
- `score_applied`
- `turn_changed`
- `player_skipped`
- `match_finished`

---

### 3.7 patxanga_dictionary_entries

Base lexical local utilizada na validação.

Campos previstos:

- `id` BIGSERIAL PK
- `language` TEXT
- `word` TEXT
- `normalized_word` TEXT
- `source` TEXT
- `is_active` BOOLEAN
- `created_at` TIMESTAMP

Observações:
- não aceitar hífen
- armazenar versão normalizada em maiúsculas
- indexar por `language + normalized_word`

---

### 3.8 patxanga_match_accepted_words

Palavras aceitas apenas por votação naquela partida.

Campos previstos:

- `id` UUID PK
- `match_id` UUID FK -> patxanga_matches.id
- `move_id` UUID FK -> patxanga_moves.id
- `word` TEXT
- `normalized_word` TEXT
- `accepted_reason` TEXT
- `created_at` TIMESTAMP

Regra:
- válida apenas na partida corrente
- não entra no dicionário global

---

## 4. Relacionamentos Principais

- Uma `match` possui muitos `players`
- Uma `match` possui muitos `moves`
- Uma `move` pode possuir muitos `votes`
- Uma `match` possui muitos `replay_events`
- Uma `match` possui muitas `accepted_words`
- Um `player` pertence a uma `match`
- Um `player` pode realizar muitos `moves`

---

## 5. Regras de Integridade

1. Uma partida não pode ter mais de 4 jogadores.
2. Apenas jogadores da partida podem votar.
3. O autor da jogada não pode votar na própria jogada.
4. Uma jogada em votação deve ter prazo máximo de 10 segundos.
5. Palavras aceitas por votação só valem naquela partida.
6. `current_turn_player_id` deve sempre referenciar jogador da própria partida.
7. `skip_next_turn` deve ser consumido automaticamente no início do turno afetado.
8. `turn_order` deve ser único dentro da partida.
9. `seat_index` deve ser único dentro da partida.
10. Toda jogada aceita deve gerar replay event.

---

## 6. Estratégia de JSONB

Campos em JSONB serão usados para:

- `board_state`
- `bag_state`
- `rack_state`
- `placed_tiles`
- `board_diff`
- `secondary_words`
- `score_breakdown`
- `event_payload`

Motivo:
- flexibilidade estrutural
- menor custo inicial de modelagem fina
- compatível com evolução do jogo
- boa integração com Supabase

---

## 7. Preparação para Futuro Assíncrono

O modelo já prevê expansão para partidas assíncronas com:

- `match_mode`
- `turn_expires_at`
- presença desacoplada
- replay completo
- estado persistente

Não será necessário redesenhar a base para ativar modo assíncrono posteriormente.

---

## 8. Estado Atual

Modelo conceitual definido.
Pronto para transformação em:
- SQL físico
- migrações Supabase
- constraints
- índices
- funções RPC