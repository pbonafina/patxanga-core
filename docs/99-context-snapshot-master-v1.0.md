# ============================================================
# PATXANGA — CONTEXT SNAPSHOT MASTER
# Version: 1.1 (Frozen)
# ============================================================

Este documento representa o estado oficial, congelado e governado
do projeto Patxanga.

Ele é a fonte primária de continuidade entre chats, IAs e fases de desenvolvimento.

Nenhuma alteração estrutural pode ser feita sem nova versão formal.

---

# 1. NATUREZA DO PRODUTO

Patxanga é:

- Um produto original.
- Um módulo integrado ao site principal.
- Uma propriedade intelectual própria.
- Um sistema preparado para evolução futura.
- Um jogo síncrono por turnos (MVP).
- Arquitetura preparada para modo assíncrono futuro.

---

# 2. ARQUITETURA CONGELADA

- Server-authoritative obrigatório.
- Toda lógica crítica roda no backend.
- Nenhuma validação estrutural pode depender do cliente.
- Persistência integral em PostgreSQL.
- RPCs escritas em PL/pgSQL.
- Transações atômicas obrigatórias.
- UUID individual para cada peça.
- Replay obrigatório.
- Estado crítico nunca fica apenas em memória.

Não é permitido:

- confiar no cliente para cálculo de pontuação
- confiar no cliente para validação lexical
- confiar no cliente para direção da jogada
- simplificar modelo de peças
- remover UUID
- reduzir replay

---

# 3. ESTADO ATUAL DO SISTEMA

Já implementado:

- Modelo de banco inicial
- Distribuição oficial de peças v1.0
- Layout oficial do tabuleiro v1.0
- initialize_patxanga_bag()
- initialize_patxanga_board()
- create_patxanga_match()
- join_patxanga_match()
- start_patxanga_match() v1.1
- Submit Move Contract v1.1
- Operational Log Policy v1.0
- Handoff Protocol v1.0

Ainda não implementado:

- submit_patxanga_move()
- validate_word()
- calculate_score()
- sistema de votação
- troca de peças
- passar turno
- encerramento de partida

---

# 4. TABULEIRO OFICIAL

- Matriz 15x15
- Coordenadas: 1..15
- Centro obrigatório: (8,8)
- Centro é PD (Palavra Dupla)
- 4 PT (Palavra Tripla) nos cantos
- Multiplicadores permitidos:
  - NM
  - LD
  - LT
  - PD
  - PT

Multiplicadores aplicam apenas na primeira ocupação da casa.

---

# 5. DISTRIBUIÇÃO DE PEÇAS

- Baseada em português.
- Sem letra Ç.
- C representa Ç quando necessário.
- Todas as peças especiais podem substituir qualquer letra.
- Patxanga Real dobra a pontuação total da jogada.
- Bônus de 7 peças: +20 pontos.

Cada peça possui:

- UUID próprio
- letter
- points
- is_special
- special_type (se houver)

---

# 6. BOARD_STATE (OBRIGATÓRIO)

Matriz 15x15 contendo:

{
  "tile": null ou objeto completo da peça,
  "multiplier_type": "NM|LD|LT|PD|PT"
}

O objeto da peça deve conter:

- id (UUID)
- letter
- points
- is_special
- special_type

É proibido armazenar apenas letra ou pontuação.

---

# 7. BAG_STATE

{
  "tiles": [...],
  "remaining": integer
}

---

# 8. RACK_STATE

Array JSON contendo objetos completos das peças.

---

# 9. SISTEMA DE VOTAÇÃO (PENDING_VOTE)

Se qualquer palavra não existir no dicionário:

- Jogada não pode ser rejeitada automaticamente.
- Jogada não pode ser aceita automaticamente.
- Partida entra em estado pending_vote.
- Contexto completo da jogada deve ser persistido.
- board_state não pode ser modificado permanentemente.
- turno não pode avançar.

---

# 10. PROCESSO OPERACIONAL OBRIGATÓRIO

Toda implementação deve seguir:

1. IA gera código.
2. Código é aplicado via terminal.
3. Teste manual executado.
4. git add
5. git commit
6. git push
7. ./logstep.sh executado
8. Registro em project-log.md

Não é permitido:

- pular commit
- pular log
- alterar documento sem versionar
- alterar regras sem nova versão

---

# 11. GOVERNANÇA DOCUMENTAL

Arquivos críticos:

- 99-context-snapshot-master.md
- 12-submit-move-contract.md
- 13-operational-log-policy.md
- 14-handoff-protocol.md

Qualquer alteração exige:

- nova versão
- commit
- log
- atualização cruzada se necessário

---

# 12. PRÓXIMO MARCO TÉCNICO

Implementação de:

submit_patxanga_move()

Deve respeitar integralmente:

- Submit Move Contract v1.1
- Arquitetura server-authoritative
- Replay completo
- UUID por peça
- Fluxo pending_vote
- Transação atômica

---

# FIM DO DOCUMENTO