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

Definir o contrato de UX da composicao do rack/deck do jogador
na fase atual do frontend do Patxanga.

Este documento fixa como a tela jogavel pode usar slots locais permanentes
como superficie oficial de preparo de jogada
sem alterar a autoridade do backend
nem o formato oficial de `submit_patxanga_move(...)`.

## 2. Regra central

A composicao do rack continua sendo orquestrada no frontend.

Mas, nesta fase, ela deixa de ser apenas um lembrete visual.

Leitura correta:
- o backend continua server-authoritative
- `board_state`, `rack_state`, `status` e validacao de jogada continuam oficiais
- o frontend pode usar uma superficie oficial de composicao local
  para derivar `p_placed_tiles`
- o payload enviado ao backend continua contendo apenas pecas reais
  colocadas na jogada atual

Leitura incorreta:
- tratar slot local como entidade persistida no backend
- enviar slot, associacao ou metadata local como parte da RPC
- substituir a validacao do backend por validacao local

## 3. Fonte de verdade

Continuam como fonte oficial:
- `board_state`
- `rack_state`
- `current_turn_player_id`
- `status` da match
- validacao de jogada pelo backend

A superficie de composicao do rack:
- nao e estado persistido da partida
- nao muda a autoridade do backend
- pode, sim, ser a origem oficial do `p_placed_tiles`
  antes do submit real

## 4. Escopo deste contrato

Este contrato cobre:
- reorganizacao local do rack
- selecao local de pecas
- grupos locais de pecas
- slots locais permanentes
- vinculacao oficial `slot -> tile real`
- associacao `slot -> casa do tabuleiro`
- uso condicional da letra digitada no slot como `declared_letter`
- derivacao de `placedTilesPreview` a partir dessa composicao

Este contrato nao redefine:
- engine
- RPC de backend
- validacao lexical
- regras do board
- replay
- ordem oficial de turno

## 5. Conceitos operacionais

### 5.1 Rack oficial
Conjunto de pecas reais retornadas pelo backend em `rack_state`.

### 5.2 Superficie oficial de composicao
Camada de frontend onde o jogador pode organizar visualmente:
- pecas reais do rack oficial
- slots locais permanentes

Essa superficie pode gerar jogada real,
desde que o frontend compile a composicao
para o payload oficial de `submit_patxanga_move(...)`.

### 5.3 Slot local permanente
Espaco visual local, sempre disponivel na superficie de composicao,
usado para dar folga de montagem e ancorar uma jogada.

O slot local permanente:
- nao existe no backend
- nao entra no payload como slot
- nao altera `rack_state` oficial
- nao altera `board_state` oficial por conta propria

### 5.4 Vinculacao oficial `slot -> tile real`
Vinculo local, explicito e reversivel entre um slot permanente
e uma peca real do rack oficial.

Quando esse vinculo existe:
- a peca continua sendo a entidade oficial enviada ao backend
- o slot passa a representar essa peca na composicao do frontend
- a peca nao pode aparecer ao mesmo tempo em outro preparo oficial da mesma jogada

### 5.5 Associacao `slot -> casa do tabuleiro`
Associacao local, explicita e reversivel entre um slot
e uma casa do tabuleiro.

Essa associacao:
- nao reserva a casa
- nao reserva a letra do board
- nao altera o backend sozinha
- so vira parte da jogada oficial quando o slot tambem tiver uma peca real vinculada

### 5.6 Letra digitada no slot
A letra digitada no slot continua podendo ser apenas rascunho visual.

Mas, quando estas condicoes forem verdadeiras ao mesmo tempo:
- o slot tem uma peca real vinculada
- a peca vinculada exige `declared_letter`
- o slot esta associado a uma casa do tabuleiro

entao a letra do slot passa a ser usada como `declared_letter`
daquela peca na geracao de `p_placed_tiles`.

## 6. Comportamentos permitidos

O frontend pode permitir:
- reordenar pecas reais localmente
- selecionar uma ou mais pecas localmente
- mover grupos locais dentro da superficie do rack
- usar slots locais permanentes como apoio de composicao
- vincular uma peca real a um slot
- desfazer ou refazer esse vinculo
- associar um slot ativo a uma casa do tabuleiro
- remover ou refazer essa associacao
- continuar oferecendo o fluxo direto de selecao + clique no board

## 7. Regra de composicao com slots permanentes

A UX desejada deve oferecer slots locais permanentes de composicao,
sempre disponiveis no rack local do jogador.

Leitura correta:
- o jogador organiza pecas reais no rack
- o jogador pode vincular uma peca real a um slot
- o jogador pode associar esse slot a uma casa do tabuleiro
- se houver peca real + associacao valida,
  isso entra no preparo oficial da jogada
- a composicao inteira continua movel dentro do rack local

Leitura incorreta:
- tratar o slot vazio como jogada oficial
- enviar o `slotId` ao backend
- tratar associacao sem peca real como jogada oficial
- tratar a associacao local como reserva oficial do board

## 8. Relacao com o tabuleiro

A composicao por slots pode refletir a intencao real do jogador
de colocar uma peca em uma casa especifica.

Mas essa intencao:
- continua local ate o submit
- nao bloqueia outros jogadores
- nao cria prioridade sobre a casa
- pode ficar invalida antes do submit se o board oficial mudar

Portanto:
- o frontend pode mostrar badges, preview e estado de preparo
- o backend continua validando a jogada real

## 9. Relacao com submit de jogada

O submit oficial continua obedecendo o contrato vigente de `submit_patxanga_move(...)`.

Logo:
- apenas pecas reais entram em `p_placed_tiles`
- `slotId` nao entra em `p_placed_tiles`
- associacao local nao entra como estrutura propria em `p_placed_tiles`
- a composicao por slot apenas ajuda o frontend a derivar:
  - `tile_id`
  - `row`
  - `col`
  - `declared_letter`, quando aplicavel

Leitura correta:
- slots nao sao enviados
- pecas vinculadas aos slots podem ser enviadas
- a letra do slot pode virar `declared_letter`
  se a peca vinculada exigir isso

## 10. Relacao com o estado local temporario

A composicao do rack continua sendo estado temporario de frontend.

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
- a composicao por slot usa clique e associacao explicita

## 12. Proibicoes

A composicao do rack nao pode:
- alterar `rack_state` oficial
- alterar `board_state` oficial sem RPC
- reservar letra do tabuleiro
- reservar casa do tabuleiro
- alterar validacao da engine
- enviar slot local como entidade de backend
- substituir validacao oficial do wildcard no backend
- alterar score
- alterar turno

## 13. Leitura correta desta fase

Nesta fase do projeto:
- o rack evoluiu de mesa local de composicao
  para superficie oficial de preparo de jogada
- o backend continua server-authoritative
- a composicao por slot ja pode alimentar preview e submit
- o formato do payload oficial nao mudou

## 14. Criterio de saida desta linha de UX

Esta frente pode ser considerada coerente quando:
- o jogador conseguir reorganizar pecas livremente no rack local
- o jogador conseguir usar slots locais permanentes
- o jogador conseguir vincular pecas reais a slots
- o jogador conseguir associar slots ao tabuleiro
- `placedTilesPreview` refletir essa composicao oficial
- submit continuar compativel com o backend atual
- Playwright e build confirmarem o fluxo objetivo

## 15. Limites deste documento

Este documento:
- nao redefine engine
- nao redefine RPCs
- nao redefine o formato do payload oficial
- nao redefine replay
- nao altera o modelo server-authoritative

Fim do documento.
