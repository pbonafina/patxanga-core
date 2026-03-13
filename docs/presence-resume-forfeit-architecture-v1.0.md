# ============================================================
# PATXANGA — PRESENCE / RESUME / FORFEIT ARCHITECTURE
# Version: 1.0
# Status: DESIGN BASELINE
# ============================================================

## 1. Objetivo

Definir a arquitetura do subsistema de presença, retomada de partida e desistência.

Este subsistema deve permitir:

- distinguir presença online/offline de participação real na partida
- permitir reconexão/retomada após saída involuntária
- permitir desistência formal do jogador
- fechar a partida quando todos desistirem
- manter histórico e integridade do gameplay

## 2. Princípio central

Sair involuntariamente da interface não remove o jogador da partida.

Depois que o convite foi aceito e o jogador entrou na match:

- o convite vira histórico
- a participação persistida em `patxanga_players` é a fonte de verdade
- a presença online/offline é tratada separadamente

## 3. Distinções conceituais

### Convite
Serve para entrada inicial na partida.

### Participação
Representada por `patxanga_players`.
É o vínculo formal do jogador com a match.

### Presença
Representada por `patxanga_match_presence`.
Indica se o jogador está online / reconectado / recentemente ativo.

### Desistência
Ação explícita do jogador para abandonar a partida.

## 4. Regras de produto

### Reconexão
Se o jogador:
- pertence à partida
- não desistiu
- a partida ainda não terminou/cancelou

então ele pode retomar a partida.

### Saída involuntária
Se o jogador:
- fecha a aba
- perde conexão
- tem crash
- recarrega a página

isso NÃO remove:
- player
- score
- rack
- assento
- histórico

Apenas a presença pode ficar offline.

### Desistência
Se o jogador desistir:
- permanece no histórico
- não joga mais
- aparece como desistente no estado da partida
- não pode votar/jogar/passar/trocar depois disso

### Encerramento por desistência total
Se todos os jogadores da partida desistirem:
- a partida deve ser encerrada
- status recomendado: `cancelled`

## 5. Ajustes de schema recomendados

### patxanga_players
Adicionar:

- `has_forfeited boolean not null default false`
- `forfeited_at timestamp null`

### patxanga_match_presence
Já existe e deve continuar sendo usada para:
- online/offline
- last_ping_at
- updated_at

## 6. RPCs mínimas recomendadas

### resume_patxanga_match(...)
Objetivo:
- retomar a participação de um usuário numa partida já existente

Input:
- p_match_id uuid
- p_user_id uuid

Output:
- match_id
- player_id
- match_status
- current_turn_player_id
- can_resume
- reason (se não puder)

Efeitos:
- marca presença como online
- atualiza last_ping_at
- não altera gameplay

### forfeit_patxanga_match(...)
Objetivo:
- marcar jogador como desistente

Input:
- p_match_id uuid
- p_player_id uuid

Output:
- status
- match_status
- next_player (se aplicável)
- everyone_forfeited boolean

Efeitos:
- marca has_forfeited = true
- define forfeited_at
- registra replay
- se era a vez do jogador, avança turno
- se todos desistiram, fecha a partida

### ping_patxanga_presence(...) [opcional]
Objetivo:
- atualizar heartbeat leve do jogador

Input:
- p_match_id uuid
- p_player_id uuid

Output:
- ok

## 7. Regras de turno após desistência

Se o jogador desistente era o jogador do turno atual:
- o turno deve avançar para o próximo jogador não desistente

Se o jogador desistente não era o jogador do turno:
- turno atual permanece

Jogadores desistentes devem ser ignorados em:
- avanço de turno
- votação
- jogadas
- passes
- trocas

## 8. Encerramento por todos desistirem

Quando todos os jogadores de uma match tiverem:
- has_forfeited = true

então:

- patxanga_matches.status = 'cancelled'
- finished_at pode permanecer null
- updated_at deve ser atualizado
- replay deve registrar `match_cancelled`

## 9. UI / produto

### O usuário deve ter duas listas distintas

#### Convites pendentes
Partidas nas quais ainda não entrou.

Fonte:
- `patxanga_match_invites`

#### Partidas em andamento
Partidas nas quais já entrou e pode retomar.

Fonte:
- `patxanga_players` + `patxanga_matches`

### Botões esperados na UI

Para jogador dentro da partida:
- Retomar
- Desistir

Para jogador fora da partida:
- Aceitar convite
- Recusar convite

## 10. Regras de segurança

- convite não deve ser usado como fonte de verdade para reconexão
- resume depende de `patxanga_players`
- presença não pode criar participação nova
- desistência deve ser explícita e persistida
- jogador desistente não pode voltar a jogar na mesma match, nesta versão

## 11. Próximos passos recomendados

1. Aprovar este documento como baseline
2. Criar migration com `has_forfeited` e `forfeited_at`
3. Implementar:
   - resume_patxanga_match
   - forfeit_patxanga_match
4. Criar testes determinísticos de:
   - reconexão
   - desistência de um jogador
   - desistência total
