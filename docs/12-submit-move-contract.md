# ============================================================
# PATXANGA — SUBMIT MOVE CONTRACT
# Version: 1.1 (Frozen)
# ============================================================

Este documento define o contrato formal da jogada enviada ao backend.

Ele complementa o Context Snapshot Master v1.1.

Nenhuma alteração neste contrato pode ser feita sem nova versão formal.

---

# 1. ASSINATURA DA RPC

submit_patxanga_move(
    p_match_id uuid,
    p_player_id uuid,
    p_placed_tiles jsonb
)

Linguagem: PL/pgSQL  
Execução: server-authoritative  
Transação: atômica

---

# 2. FORMATO DO PAYLOAD (p_placed_tiles)

p_placed_tiles é um array JSON contendo exclusivamente as peças colocadas nesta jogada.

Exemplo:

[
  {
    "tile_id": "uuid-da-peca",
    "row": 8,
    "col": 8,
    "declared_letter": "A"
  }
]

---

# 3. REGRAS DO PAYLOAD

- Apenas peças efetivamente colocadas nesta jogada devem ser enviadas.
- Não enviar peças já existentes no tabuleiro.
- row e col variam de 1 a 15.
- declared_letter é obrigatório apenas para:
  - coringas
  - peças especiais que substituem letra

Para peças normais:
- o backend pode validar declared_letter contra a letra real da peça
- o backend pode ignorar declared_letter
- o backend nunca deve confiar no cliente como fonte de verdade

---

# 4. VALIDAÇÕES OBRIGATÓRIAS DO BACKEND

submit_patxanga_move() deve validar obrigatoriamente:

1. É o turno do jogador.
2. Peças enviadas pertencem ao rack do jogador.
3. UUIDs são válidos e existentes.
4. Coordenadas estão dentro do tabuleiro (1..15).
5. Casas estão vazias.
6. Todas as peças estão alinhadas (horizontal ou vertical).
7. Não há lacunas na palavra principal.
8. Primeira jogada passa pela casa central (8,8).
9. Jogada conecta com palavras existentes (exceto primeira jogada).
10. Detectar palavra principal.
11. Detectar palavras secundárias.
12. Validar todas as palavras contra dicionário oficial.
13. Se qualquer palavra não existir no dicionário:
    - iniciar fluxo de pending_vote.
14. Se todas as palavras forem válidas:
    - calcular pontuação integralmente no servidor.
    - aplicar multiplicadores.
    - aplicar Patxanga Real (se utilizada).
    - aplicar bônus +20 se utilizar 7 peças.
    - atualizar score.
    - atualizar board_state.
    - atualizar bag_state.
    - repor peças.
    - registrar replay.
    - avançar turno.

Nenhum cálculo crítico pode ser confiado ao cliente.

---

# 5. FORMATO DO board_state

O board_state é uma matriz 15x15:

[
  [
    {
      "tile": null | objeto_da_peça,
      "multiplier_type": "NM|LD|LT|PD|PT"
    }
  ]
]

Multiplicadores aplicam apenas na primeira ocupação da célula.

---

# 5.1 PRESERVAÇÃO OBRIGATÓRIA DO UUID NO BOARD_STATE

O board_state deve preservar o objeto completo da peça colocada.

Não é permitido armazenar apenas:

- letra
- valor numérico
- special_type

O objeto persistido na célula deve manter obrigatoriamente:

- id (UUID original da peça)
- letter
- points
- is_special
- special_type (se houver)

Isso garante:

- rastreabilidade total
- auditoria histórica
- integridade do modelo UUID por peça
- consistência com replay

Qualquer tentativa de reduzir o objeto armazenado é proibida.

---

# 6. FORMATO DO rack_state

Array JSON de peças:

[
  {
    "id": "uuid",
    "letter": "A",
    "points": 1,
    "is_special": false,
    "special_type": null
  }
]

---

# 7. FORMATO DO bag_state

{
  "tiles": [ ... ],
  "remaining": integer
}

---

# 8. FORMATO DO REPLAY EVENT

Inserção na tabela patxanga_replay_events contendo:

- match_id
- event_type
- event_payload (jsonb)
- turn_number
- created_at

event_type exemplos:

- move_submitted
- word_validated
- word_rejected
- tiles_drawn
- turn_changed
- match_started

---

# 8.1 REPLAY MÍNIMO OBRIGATÓRIO PARA JOGADAS

Toda jogada aceita deve registrar evento contendo no mínimo:

- player_id
- placed_tiles (UUID + coordenadas)
- palavra principal detectada
- palavras secundárias detectadas
- score breakdown detalhado
- multiplicadores aplicados
- aplicação de Patxanga Real (se houver)
- bônus de 7 peças (se aplicado)
- próximo jogador

Replay resumido é proibido.

---

# 9. SISTEMA DE VOTAÇÃO (PENDING_VOTE)

Se qualquer palavra não existir no dicionário:

- A jogada NÃO pode ser rejeitada automaticamente.
- A jogada NÃO pode ser aceita automaticamente.
- A partida deve entrar em estado "pending_vote".
- O contexto completo da jogada deve ser persistido.
- Nenhuma modificação permanente no board_state pode ocorrer até decisão final.
- O turno NÃO deve avançar.

submit_patxanga_move() deve suportar integralmente este fluxo.

---

# 10. PROIBIÇÕES

submit_patxanga_move() NÃO pode:

- confiar no frontend para direção
- confiar em cálculo de pontuação do cliente
- confiar em validação lexical do cliente
- alterar layout do tabuleiro
- alterar multiplicadores
- remover UUID das peças
- simplificar modelo estrutural
- reduzir replay
- dividir a transação atômica

---

# FIM DO DOCUMENTO