# PATXANGA — FRONTEND CONTRACT: Rack Composition UX
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE

Base normativa:
- Context Snapshot Master vigente
- docs/frontend-contract-match-states-v1.0.md
- docs/frontend-contract-screen-actions-v1.0.md
- docs/frontend-contract-rpcs-v1.0.md
- docs/frontend-browser-validation-procedure-v1.0.md

## 1. Objetivo

Definir o contrato de UX da composicao local do rack/deck do jogador.

Este documento fixa o que pode existir como camada local de usabilidade
para montagem mental da jogada sem alterar o modelo server-authoritative
do Patxanga.

## 2. Regra central

A composicao do rack e uma camada local de frontend.

Ela:
- ajuda o jogador a organizar pecas
- ajuda o jogador a testar arranjos mentais
- nao substitui o estado oficial do backend
- nao altera o rack persistido no servidor
- nao altera o board oficial
- nao altera o payload oficial de submit

## 3. Fonte de verdade

Continuam como fonte oficial:
- `board_state`
- `rack_state`
- `current_turn_player_id`
- `status` da match
- validacao de jogada pelo backend

A composicao local do rack:
- nao e fonte de verdade
- nao pode ser tratada como reserva oficial de jogada
- nao pode ser tratada como estado persistido da partida

## 4. Escopo deste contrato

Este contrato cobre apenas:
- reorganizacao local do rack
- selecao local de pecas
- grupos locais de pecas
- slots locais permanentes
- letras de rascunho em slots
- associacoes locais opcionais com o tabuleiro

Este contrato nao redefine:
- engine
- submit real
- validacao lexical
- regras do board
- replay
- ordem oficial de turno


## 5. Conceitos operacionais

### 5.1 Rack oficial
Conjunto de pecas reais retornadas pelo backend em `rack_state`.

### 5.2 Superficie local de composicao
Camada de UX onde o frontend pode organizar visualmente:
- pecas reais do rack oficial
- slots locais permanentes de composicao

### 5.3 Slot local permanente
Espaco visual local, sempre disponivel na superficie de composicao,
usado para dar folga de montagem mental ao jogador.

O slot local permanente:
- nao e uma peca real
- nao existe no backend
- nao entra no submit
- nao altera score
- nao altera board
- nao altera `rack_state` oficial

### 5.4 Letra de rascunho
Letra digitada pelo jogador dentro de um slot local apenas como lembrete.

A letra de rascunho:
- nao e `declared_letter` de backend
- nao e reserva de letra no tabuleiro
- nao altera o jogo real
- nao pode ser enviada como parte da jogada oficial

### 5.5 Associacao local com o tabuleiro
Associacao local, explicita e reversivel entre um slot de composicao
e uma peca/casa do tabuleiro escolhida pelo jogador.

Essa associacao:
- e apenas local
- nao reserva a peca do tabuleiro
- nao reserva a casa do tabuleiro
- nao altera o backend
- pode se tornar invalida se o tabuleiro mudar antes da jogada

## 6. Comportamentos permitidos

O frontend pode permitir:
- reordenar pecas reais localmente
- selecionar uma ou mais pecas localmente
- mover grupos locais dentro da superficie do rack
- usar slots locais permanentes como apoio de composicao
- digitar letra de rascunho em slots locais
- associar localmente um slot a uma peca/casa do tabuleiro
- remover ou refazer essa associacao local

## 7. Regra de composicao com slots permanentes

A UX desejada deve oferecer slots locais permanentes de composicao,
sempre disponiveis no rack local do jogador.

Leitura correta:
- o jogador organiza pecas reais no rack
- o jogador move pecas livremente entre pecas reais e slots locais
- um slot vazio pode receber letra de rascunho
- depois, se desejar, o jogador pode associar localmente esse slot
  a uma peca/casa do tabuleiro
- a composicao inteira continua movel dentro do rack local

Leitura incorreta:
- depender de criar lacuna dinamica para cada montagem
- tratar slot local como peca oficial
- criar vinculo inicial automatico entre slot e tabuleiro
- tratar associacao local como reserva oficial do board


## 8. Relacao com o tabuleiro

A composicao local do rack pode refletir a intencao do jogador
de usar uma letra ou casa ja existente no tabuleiro.

Mas essa intencao:
- e apenas local
- nao reserva a letra no board
- nao bloqueia outros jogadores
- nao cria prioridade sobre a casa ou sobre a letra
- pode ficar invalida antes do turno do jogador

Portanto:
- a letra digitada no slot e apenas lembrete estrategico
- a associacao local com o tabuleiro e apenas referencia de composicao
- o jogador pode precisar revisar sua composicao depois

## 9. Relacao com submit de jogada

O submit oficial continua obedecendo o contrato vigente de `submit_patxanga_move(...)`.

Logo:
- apenas pecas reais colocadas entram em `p_placed_tiles`
- slots locais nao entram em `p_placed_tiles`
- letras de rascunho nao entram em `p_placed_tiles`
- associacoes locais com o tabuleiro nao entram em `p_placed_tiles`

## 10. Relacao com o estado local temporario

A composicao local do rack e estado temporario de UX.

Ela pode ser descartada quando houver:
- reload oficial da partida
- alteracao oficial de `rack_state`
- submit aceito
- troca de pecas
- nova distribuicao de pecas
- qualquer divergencia com o backend que exija reidratacao

## 11. Relacao com drag and drop para o board

Este contrato nao define drag and drop do rack para o tabuleiro como fluxo oficial.

Ate nova definicao:
- drag no rack serve para reorganizacao local
- posicionamento no board continua podendo usar fluxo de selecao + clique
- qualquer futuro suporte a drag rack -> board deve ser definido em contrato proprio ou revisao formal deste documento

## 12. Proibicoes

A composicao local do rack nao pode:
- alterar `rack_state` oficial
- alterar `board_state` oficial
- reservar letra do tabuleiro
- reservar casa do tabuleiro
- alterar validacao da engine
- gerar payload oficial com slots locais
- substituir `declared_letter` oficial de wildcard
- alterar score
- alterar turno


## 13. Leitura correta desta fase

Nesta fase do projeto:
- o rack pode evoluir como mesa local de composicao
- essa evolucao deve permanecer no frontend
- o backend continua server-authoritative
- o submit oficial continua separado da montagem mental local

## 14. Criterio de saida desta linha de UX

Esta frente pode ser considerada coerente quando:
- o jogador conseguir reorganizar pecas livremente no rack local
- o jogador conseguir usar slots locais permanentes de composicao
- o jogador conseguir usar letras de rascunho como lembrete
- o jogador conseguir associar localmente slots ao tabuleiro sem afetar o backend
- o jogador entender que isso nao altera o jogo real
- o fluxo continuar compativel com o backend atual

## 15. Limites deste documento

Este documento:
- nao redefine engine
- nao redefine RPCs
- nao redefine payload de submit
- nao redefine replay
- nao altera o modelo server-authoritative

Fim do documento.
