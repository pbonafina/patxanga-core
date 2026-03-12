# ============================================================
# PATXANGA — CONTEXT SNAPSHOT MASTER
# Version: 1.0 (Frozen)
# ============================================================

Este documento define o estado oficial e congelado do projeto Patxanga.
Ele deve ser utilizado como fonte única de verdade ao iniciar um novo chat com outra IA.

Nenhuma decisão estrutural descrita aqui pode ser alterada sem criação de nova versão do snapshot.

---

# 1. VISÃO DO PRODUTO

Patxanga é um jogo de estratégia por turnos inspirado no conceito de formação de palavras,
com regras próprias e propriedade intelectual independente.

Objetivo:
Produto principal do ecossistema do site.

Modo atual:
Partidas síncronas (tempo real por turno).

Modo futuro:
Partidas assíncronas.

---

# 2. DECISÕES ESTRATÉGICAS IMUTÁVEIS

- Tabuleiro 15x15
- Coordenadas de 1 a 15
- Primeira jogada obrigatoriamente passa pelo centro (8,8)
- Centro é PD (Palavra Dupla)
- Apenas 4 PT (Palavra Tripla) — nos cantos
- Multiplicadores oficiais:
  - NM
  - LD
  - LT
  - PD
  - PT
- Bônus por usar 7 peças: +20 pontos
- Patxanga Real dobra o valor TOTAL da jogada (incluindo cruzamentos)
- Todas as peças possuem UUID individual
- Estado do jogo é 100% server-authoritative
- Nenhum estado crítico fica em memória
- Tudo persiste em PostgreSQL
- RPCs são atômicas
- Replays são obrigatórios

Essas decisões NÃO podem ser alteradas nesta versão.

---

# 3. LAYOUT OFICIAL DO TABULEIRO

Documento fonte:
docs/11-board-layout.md

Representação técnica:
Matriz 15x15 JSON contendo:

{
  "tile": null | objeto_da_peça,
  "multiplier_type": "NM|LD|LT|PD|PT"
}

Multiplicadores aplicam-se apenas na primeira ocupação.

---

# 4. DISTRIBUIÇÃO DE PEÇAS

Documento fonte:
docs/10-letter-distribution.md

Regras:

- Distribuição oficial PT-BR
- Ç NÃO existe como peça separada (usa C)
- Existem:
  - Coringas normais
  - 4 peças "pular a vez"
  - 1 peça Patxanga Real
- Peças especiais podem substituir qualquer letra
- Peça Patxanga Real dobra pontuação final da jogada
- Todas as peças têm UUID único

---

# 5. ESTRUTURA DO BANCO (RESUMO)

Tabelas principais:

- patxanga_matches
- patxanga_players
- patxanga_replay_events
- patxanga_letter_distribution

Campos críticos:

patxanga_matches:
- id
- status (waiting | active | finished)
- language
- board_state (jsonb)
- bag_state (jsonb)
- current_turn_player_id
- turn_number
- started_at

patxanga_players:
- id
- match_id
- rack_state (jsonb)
- score
- turn_order

---

# 6. RPCs IMPLEMENTADAS

- create_patxanga_match()
- join_patxanga_match()
- initialize_patxanga_bag()
- initialize_patxanga_board()
- start_patxanga_match() v1.1

start_patxanga_match faz:

- valida match
- valida jogadores
- inicializa bolsa
- inicializa tabuleiro
- distribui 7 peças
- define ordem
- ativa partida
- cria replay inicial

---

# 7. MOTOR ATUAL DO JOGO

Já implementado:

✔ Inicialização completa do estado
✔ Bolsa com UUID
✔ Tabuleiro com multiplicadores
✔ Distribuição inicial
✔ Replay base

Ainda NÃO implementado:

- submit_move()
- validate_word()
- calculate_score()
- sistema de votação
- troca de peças
- passar turno
- encerramento de partida

---

# 8. PRÓXIMO MARCO

Implementar:

submit_move()

Requisitos:

- Validar turno
- Validar peças por UUID
- Validar posicionamento
- Detectar palavras principais e secundárias
- Validar contra dicionário
- Calcular pontuação
- Aplicar multiplicadores
- Aplicar Patxanga Real
- Aplicar bônus 7 peças
- Atualizar tabuleiro
- Atualizar bolsa
- Atualizar pontuação
- Gerar replay
- Avançar turno
- Criar estado de votação se necessário

---

# 9. PROIBIÇÕES

A próxima IA:

- NÃO pode alterar regras estratégicas
- NÃO pode alterar layout do tabuleiro
- NÃO pode alterar distribuição de peças
- NÃO pode simplificar estrutura de dados
- NÃO pode remover UUID por peça
- NÃO pode propor arquitetura client-authoritative
- NÃO pode alterar modelo de persistência

Somente evolução incremental é permitida.

---

# 10. DIRETRIZ PARA A PRÓXIMA IA

Você está entrando em um projeto já estruturado.

Seu papel é:

- Executar dentro da arquitetura definida
- Não reescrever fundamentos
- Não propor mudança estrutural
- Implementar submit_move() conforme regras oficiais

Se houver conflito, solicitar esclarecimento antes de alterar qualquer decisão.

---

# FIM DO SNAPSHOT MASTER v1.0