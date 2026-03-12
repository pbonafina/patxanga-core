# ============================================================
# PATXANGA — CONTEXT SNAPSHOT MASTER
# Version: 1.4 (First Real Success Path Validated)
# Status: FROZEN BASELINE
# ============================================================

Este documento representa o estado arquitetural oficial da engine Patxanga
após validação do primeiro caminho completo de jogada com status success.

Nenhuma decisão estrutural pode ser alterada sem incremento de versão.

------------------------------------------------------------
1. ARQUITETURA GERAL
------------------------------------------------------------

• Backend 100% server-authoritative
• PostgreSQL (Supabase)
• Todas as alterações via migrations
• Nenhum SQL aplicado manualmente fora de migration
• submit_move() atômica
• UUID individual por peça
• Persistência completa de board_state, rack_state e bag_state

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

Migrations oficiais são geradas concatenando os arquivos fonte quando necessário.

------------------------------------------------------------
4. ENGINE ATUAL
------------------------------------------------------------

Fluxo completo implementado:

create_match()
join_match()
initialize_bag()
initialize_board()
start_match()
submit_patxanga_move()

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
• Cálculo oficial de score
• Patxanga Real aplicada apenas à palavra principal
• Bônus +20 para 7 peças
• Atualização de board_state
• Atualização de bag_state
• Atualização de rack_state
• Replay completo
• Avanço de turno

------------------------------------------------------------
5. DICIONÁRIO
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

Validação sempre server-side.

------------------------------------------------------------
6. REGRAS ESTRATÉGICAS CONGELADAS
------------------------------------------------------------

• Tabuleiro 15x15
• Centro (8,8) obrigatório na primeira jogada
• 4 PT nos cantos
• Multiplicadores NM | LD | LT | PD | PT
• Patxanga Real dobra apenas a palavra principal
• Patxanga Real aplica após multiplicadores
• Bônus 7 peças = +20

------------------------------------------------------------
7. PROIBIÇÕES
------------------------------------------------------------

• Não alterar layout
• Não alterar distribuição
• Não remover UUID
• Não confiar no frontend
• Não aplicar SQL fora de migrations
• Não modificar engine sem update do snapshot

------------------------------------------------------------
8. VALIDAÇÃO JÁ COMPROVADA
------------------------------------------------------------

Já foi comprovado com teste local determinístico:

• criação de partida
• entrada do segundo jogador
• início da partida
• distribuição de rack
• escolha correta do jogador do turno
• submit_patxanga_move() bem-sucedida
• palavra válida "DA"
• score total = 6
• atualização do board_state
• atualização do rack_state
• compra de novas peças
• bag reduzido
• turno avançado

------------------------------------------------------------
9. ESTADO ATUAL
------------------------------------------------------------

Engine compilável via:

supabase db reset

Primeiro caminho completo de success já validado.

Próximos blocos prioritários:

• pending_vote persistente real
• palavras secundárias e cruzamentos
• troca de peças
• passar turno
• encerramento de partida