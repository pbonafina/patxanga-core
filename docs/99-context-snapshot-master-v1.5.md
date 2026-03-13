# ============================================================
# PATXANGA — CONTEXT SNAPSHOT MASTER
# Version: 1.5 (Gameplay Core + Voting + End Conditions Validated)
# Status: FROZEN BASELINE
# ============================================================

Este documento representa o estado arquitetural oficial da engine Patxanga
após validação do núcleo completo do gameplay backend.

Nenhuma decisão estrutural pode ser alterada sem incremento de versão.

------------------------------------------------------------
1. ARQUITETURA GERAL
------------------------------------------------------------

• Backend 100% server-authoritative
• PostgreSQL (Supabase)
• Todas as alterações via migrations
• Nenhum SQL aplicado manualmente fora de migration
• UUID individual por peça
• Persistência completa de board_state, rack_state e bag_state
• Estado interno da partida usa player_id, não user_id

------------------------------------------------------------
2. PROCESSO OFICIAL DE BUILD
------------------------------------------------------------

Ambiente local:

1. supabase start
2. supabase db reset

Reset recria todo o banco a partir das migrations oficiais.

Ordem obrigatória das migrations:

01_initial_schema
02_dictionary
03_distribution_seed
04_core_rpcs
05_submit_engine
06_dictionary_test_seed
07_pending_vote_resolution
08_pass_turn
09_exchange_tiles
10_evaluate_match_end

------------------------------------------------------------
3. ESTRUTURA DO PROJETO
------------------------------------------------------------

/sql
    /migrations        → arquivos históricos originais
    /rpc               → funções individuais fonte
    /seeds             → seeds isolados
    /tests             → testes SQL

/supabase
    /migrations        → migrations oficiais aplicáveis

Migrations oficiais são geradas concatenando/copiando os arquivos fonte quando necessário.

------------------------------------------------------------
4. ENGINE ATUAL
------------------------------------------------------------

Fluxos implementados:

create_match()
join_match()
initialize_bag()
initialize_board()
start_match()
submit_patxanga_move()
submit_patxanga_vote()
submit_patxanga_pass_turn()
submit_patxanga_exchange_tiles()
evaluate_patxanga_match_end()

------------------------------------------------------------
5. SUBMIT_MOVE
------------------------------------------------------------

submit_move inclui:

• Lock pessimista da match
• Lock do player
• Validação de posse UUID
• Validação geométrica
• Hidratação de placed tiles com peças completas do rack
• Construção de virtual board
• Extração de palavras
• Regra: palavra principal deve ter pelo menos 2 letras
• Validação lexical via tabela local
• Branch success
• Branch pending_vote persistente
• Replay
• Atualização de board_state
• Atualização de rack_state
• Atualização de bag_state
• Avanço de turno
• Integração com avaliação de fim de partida

------------------------------------------------------------
6. PENDING_VOTE
------------------------------------------------------------

Quando a palavra não existe no dicionário:

• patxanga_moves recebe status = pending_vote
• match passa para status = voting
• move_id é retornado ao cliente
• board_state não é alterado
• rack_state não é alterado
• bag_state não é alterado
• turno não avança
• replay registra o evento

submit_patxanga_vote() resolve:

• voto do autor é proibido
• rejeição única já resolve como rejected
• todas as aprovações necessárias resolvem como accepted

Se accepted:

• move vira accepted
• board é aplicado
• rack é atualizado
• bag é reduzido
• turno avança
• match volta para active

Se rejected:

• move vira rejected
• board permanece intacto
• turno permanece no autor
• match volta para active

------------------------------------------------------------
7. PASS TURN
------------------------------------------------------------

submit_patxanga_pass_turn():

• valida match / turno / player
• persiste move_type = pass
• status = accepted
• score_total = 0
• marca has_passed_last_cycle = true
• avança turno
• replay registra turn_passed e turn_changed
• integra avaliação de fim de partida

------------------------------------------------------------
8. EXCHANGE TILES
------------------------------------------------------------

submit_patxanga_exchange_tiles():

• valida match / turno / player
• valida posse das peças
• remove peças do rack
• devolve peças ao bag
• compra mesma quantidade de peças novas
• atualiza rack_state
• atualiza bag_state
• persiste move_type = exchange_tiles
• avança turno
• replay registra tiles_exchanged e turn_changed

------------------------------------------------------------
9. FIM DE PARTIDA
------------------------------------------------------------

evaluate_patxanga_match_end():

Critério 1:
• bag vazio
• algum jogador com rack vazio
→ match finished

Critério 2:
• bag vazio
• todos os jogadores com has_passed_last_cycle = true
→ match finished

Ao terminar:

• status = finished
• winner_player_id = maior score (regra simples atual)
• finished_at preenchido
• replay registra match_finished

Ainda não implementado nesta versão:
• penalidade por peças restantes
• empate sofisticado
• tie-break formal

------------------------------------------------------------
10. DICIONÁRIO
------------------------------------------------------------

Tabela:

patxanga_dictionary (
    word_original text PK,
    word_normalized text unique
)

Funções:

normalize_patxanga_word()
validate_word()

Seed mínimo local para testes:

• SE
• DE
• EM
• ME
• TE
• DA
• DO
• EU
• TU
• NO
• NA
• RE

------------------------------------------------------------
11. REGRAS ESTRATÉGICAS CONGELADAS
------------------------------------------------------------

• Tabuleiro 15x15
• Centro (8,8) obrigatório na primeira jogada
• 4 PT nos cantos
• Multiplicadores NM | LD | LT | PD | PT
• Patxanga Real dobra apenas a palavra principal
• Patxanga Real aplica após multiplicadores
• Bônus 7 peças = +20

------------------------------------------------------------
12. PROIBIÇÕES
------------------------------------------------------------

• Não alterar layout
• Não alterar distribuição
• Não remover UUID
• Não confiar no frontend
• Não aplicar SQL fora de migrations
• Não trocar player_id por user_id no estado interno da partida
• Não modificar engine sem update do snapshot

------------------------------------------------------------
13. VALIDAÇÃO JÁ COMPROVADA
------------------------------------------------------------

Já foi comprovado com testes locais determinísticos:

• success com palavra válida ("DA")
• score = 6 com multiplicador central
• board_state persistido
• rack recomposto
• bag reduzido
• turno avançado

• pending_vote com palavra inválida ("TS")
• move persistido
• match em voting
• board intacto

• pending_vote accepted
• move aplicado ao board
• score aplicado
• match volta para active

• pending_vote rejected
• move rejeitado
• board intacto
• match volta para active

• pass turn funcional

• exchange tiles funcional

• match end por bag vazio + rack vazio

• match end por bag vazio + todos passaram

------------------------------------------------------------
14. ESTADO ATUAL
------------------------------------------------------------

Engine compilável via:

supabase db reset

Núcleo do gameplay backend está validado.

Próximos blocos prioritários:

• pontuação final por peças restantes
• empate / tie-break
• cruzamentos e palavras secundárias mais complexas
• integração com frontend
• testes de regressão mais amplos