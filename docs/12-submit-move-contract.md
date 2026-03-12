# ============================================================
# PATXANGA — SUBMIT MOVE CONTRACT
# Version: 1.0 (Frozen)
# ============================================================

Este documento define o contrato formal da jogada enviada ao backend.

Ele complementa o Context Snapshot Master v1.0.

Nenhuma alteração neste contrato pode ser feita sem nova versão.

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

p_placed_tiles é um array JSON contendo as peças colocadas nesta jogada.

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

- Apenas peças realmente colocadas nesta jogada devem ser enviadas.
- Não enviar peças já existentes no tabuleiro.
- row e col variam de 1 a 15.
- declared_letter é obrigatório apenas para:
  - coringas
  - peças especiais que substituem letra

Para peças normais:
- backend pode validar que declared_letter corresponde à letra da peça
- ou ignorar declared_letter

---

# 4. VALIDAÇÕES OBRIGATÓRIAS DO BACKEND

submit_move() deve validar:

1. É o turno do jogador.
2. Peças enviadas pertencem ao rack do jogador.
3. UUIDs são válidos.
4. Coordenadas estão dentro do tabuleiro.
5. Casas estão vazias.
6. Todas as peças estão alinhadas (horizontal ou vertical).
7. Não há lacunas na palavra principal.
8. Primeira jogada passa pelo centro (8,8).
9. Jogada conecta com palavras existentes (exceto primeira).
10. Detectar palavra principal.
11. Detectar palavras secundárias.
12. Validar palavras contra dicionário oficial.
13. Se palavra inexistente:
    - criar estado pending_vote
14. Se válida:
    - calcular pontuação
    - aplicar multiplicadores
    - aplicar Patxanga Real
    - aplicar bônus +20 se usar 7 peças
    - atualizar score
    - atualizar board_state
    - atualizar bag_state
    - repor peças
    - criar replay event
    - avançar turno

---

# 5. FORMATO DO board_state

Matriz 15x15:

[
  [
    {
      "tile": null | objeto_da_peça,
      "multiplier_type": "NM|LD|LT|PD|PT"
    }
  ]
]

Multiplicadores só aplicam na primeira ocupação.

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

insert into patxanga_replay_events:

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

# 9. SISTEMA DE VOTAÇÃO (PREPARAÇÃO)

Se palavra não existir no dicionário:

- match entra em estado pending_vote
- salvar palavra em disputa
- bloquear avanço de turno
- aguardar votos
- maioria simples aceita
- empate rejeita

Este mecanismo será implementado posteriormente,
mas submit_move() já deve suportar esse fluxo.

---

# 10. PROIBIÇÕES

submit_move() NÃO pode:

- confiar no frontend para direção
- confiar em cálculo de pontuação do cliente
- confiar em validação lexical do cliente
- alterar layout do tabuleiro
- alterar multiplicadores
- remover UUID das peças

---

# FIM DO DOCUMENTO