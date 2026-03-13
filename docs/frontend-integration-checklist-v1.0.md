# PATXANGA — FRONTEND INTEGRATION CHECKLIST
Version: 1.0
Status: ACTIVE WORKING CHECKLIST
Base normativa:
- Context Snapshot Master v1.6
- docs/12-submit-move-contract.md — Version 1.2 (Frozen)
- docs/frontend-contract-rpcs-v1.0.md
- docs/frontend-contract-match-states-v1.0.md
- docs/frontend-contract-screen-actions-v1.0.md
- docs/frontend-contract-match-bootstrap-v1.0.md

## 1. Objetivo

Este documento converte os contratos frontend já consolidados em checklist operacional
para implementação do primeiro fluxo funcional de integração frontend-backend.

## 2. Pré-condições

- backend local funcional via `supabase db reset`
- contracts frontend já consolidados
- separação rígida entre `user_id` e `player_id` preservada
- fluxo `pending_vote` tratado como fluxo real

## 3. Checklist de integração mínima

### 3.1 Identificação de contexto
- [ ] resolver `match_id` da sessão atual
- [ ] resolver `player_id` correspondente ao usuário dentro da match
- [ ] nunca substituir `player_id` por `user_id` nas RPCs de gameplay

### 3.2 Bootstrap inicial
- [ ] carregar `status` oficial da match
- [ ] carregar `board_state` oficial
- [ ] carregar `rack_state` do jogador da sessão quando permitido
- [ ] carregar `current_turn_player_id`
- [ ] carregar scores persistidos

### 3.3 Renderização por estado
- [ ] renderizar lobby quando `status = waiting`
- [ ] renderizar partida normal quando `status = active`
- [ ] renderizar fluxo de votação quando `status = voting`
- [ ] renderizar resultado quando `status = finished`

### 3.4 Regras de turno
- [ ] habilitar ações de turno apenas ao `current_turn_player_id` oficial
- [ ] bloquear ação de jogar para jogador fora do turno
- [ ] bloquear `pass_turn` fora do turno
- [ ] bloquear `exchange_tiles` fora do turno

### 3.5 Submit de jogada
- [ ] enviar apenas `p_placed_tiles` da jogada atual
- [ ] não enviar board completo
- [ ] não enviar score calculado
- [ ] não enviar validação lexical como fonte de verdade
- [ ] tratar resposta accepted, pending_vote ou erro

### 3.6 Fluxo `pending_vote`
- [ ] não aplicar jogada pendente ao board oficial
- [ ] não remover peças do rack oficial
- [ ] não avançar turno localmente
- [ ] habilitar UI de votação apenas quando o backend permitir
- [ ] reidratar estado oficial após resolução

### 3.7 Pós-ação e reidratação
- [ ] após `submit_patxanga_move`, recarregar estado oficial mínimo
- [ ] após `submit_patxanga_vote`, recarregar estado oficial mínimo
- [ ] após `submit_patxanga_pass_turn`, recarregar estado oficial mínimo
- [ ] após `submit_patxanga_exchange_tiles`, recarregar estado oficial mínimo

### 3.8 Estado final
- [ ] bloquear ações de gameplay em `finished`
- [ ] exibir `winner_player_id` oficial
- [ ] exibir score final oficial
- [ ] exibir `finished_at` oficial quando disponível

## 4. Critérios mínimos para considerar a integração inicial pronta

- [ ] lobby entra sem ambiguidade de identidade
- [ ] match ativa carrega com estado oficial consistente
- [ ] fluxo de jogada respeita backend server-authoritative
- [ ] fluxo `pending_vote` funciona sem mutação local indevida
- [ ] reidratação após ações está estável

## 5. Limites deste documento

- não substitui contratos existentes
- não redefine engine
- não redefine backend
- não substitui migrations

Fim do documento.
