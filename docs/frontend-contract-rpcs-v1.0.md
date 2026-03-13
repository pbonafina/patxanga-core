# PATXANGA — FRONTEND CONTRACT: RPCs
Version: 1.0
Status: Draft operacional segmentado
Base normativa:
- Context Snapshot Master v1.6
- Submit Move Contract v1.2 (Frozen)

## 1. Objetivo

Este documento define o contrato operacional mínimo entre frontend e backend
para consumo das RPCs do Patxanga.

Ele não redefine regra de jogo, não substitui migrations
e não altera a autoridade do servidor.

O frontend:
- envia intenção do usuário
- renderiza estado retornado
- mantém apenas estado temporário de UX
- nunca é fonte de verdade para regras, score, validade lexical ou transição de turno

O backend:
- valida integralmente
- calcula integralmente
- persiste integralmente
- decide integralmente o estado oficial da partida

## 2. Princípios obrigatórios

- Backend é server-authoritative.
- Estado interno da partida usa `player_id`, não `user_id`.
- Frontend pode conhecer `user_id` para autenticação e identidade externa,
  mas nunca deve substituir `player_id` no fluxo interno da match.
- UUID individual por peça é obrigatório.
- `board_state`, `rack_state` e `bag_state` são estados oficiais persistidos no backend.
- `pending_vote` é fluxo real do produto, não exceção transitória.
- Cliente nunca calcula score final como fonte oficial.
- Cliente nunca decide validade de palavra como fonte oficial.
- Cliente nunca avança turno localmente como decisão final.
- Toda renderização relevante deve partir do estado oficial retornado ou recarregado do backend.

## 3. Escopo deste documento

Fluxos cobertos neste contrato:

- `create_match()`
- `join_match()`
- `start_match()`
- `submit_patxanga_move()`
- `submit_patxanga_vote()`
- `submit_patxanga_pass_turn()`
- `submit_patxanga_exchange_tiles()`

Este documento trata o consumo das RPCs pelo frontend.

Detalhes internos de engine, replay, scoring interno, locks,
persistência transacional e reconstrução do banco
permanecem definidos pelos documentos-base e pela implementação oficial do backend.

## 4. Identidades e chaves

### 4.1 `user_id`

Identidade da conta/autenticação.

Uso permitido no frontend:
- sessão autenticada
- perfil
- lobby
- convites
- listagens externas
- associação visual com jogador humano

### 4.2 `player_id`

Identidade do participante dentro de uma partida específica.

Uso obrigatório no frontend para RPCs de gameplay:
- jogar peças
- votar
- passar turno
- trocar peças

### 4.3 Regra rígida de separação

- frontend não pode enviar `user_id` em RPC de engine onde o contrato exige `player_id`
- frontend não pode reconstruir `player_id` a partir de heurística local
- frontend deve persistir o `player_id` correto por match
- frontend não pode reaproveitar `player_id` de outra partida
- qualquer cache local deve ser indexado por `match_id` + `player_id`, nunca apenas por `user_id`

## 5. Contrato operacional por RPC

### 5.1 `create_match()`

#### Finalidade
Criar uma nova partida/lobby.

#### Entrada esperada
Parâmetros definidos pela RPC oficial do backend.

#### Saída esperada para frontend
No mínimo:
- `match_id`
- estado inicial da match
- identificação do criador no contexto da partida, se a RPC já devolver isso

#### Regras de frontend
- após criação, navegar para tela/lobby da partida
- não presumir que a partida começou
- não presumir distribuição de rack antes de `start_match()`

### 5.2 `join_match()`

#### Finalidade
Entrar em uma partida existente.

#### Entrada esperada
Parâmetros definidos pela RPC oficial do backend.

#### Saída esperada
No mínimo:
- `match_id`
- `player_id` do participante dentro daquela match, quando aplicável
- estado atualizado do lobby/partida

#### Regras de frontend
- persistir `player_id` da relação usuário-partida
- nunca reaproveitar `player_id` de outra match
- exibir estado retornado pelo backend, não estado inferido localmente

### 5.3 `start_match()`

#### Finalidade
Iniciar a partida e distribuir estados iniciais jogáveis.

#### Efeitos esperados
- distribuição correta de rack
- definição de turno inicial
- match passa a estado jogável
- replay registra início

#### Regras de frontend
- após sucesso, carregar:
  - `board_state`
  - `rack_state`
  - turno atual
  - status da match
- frontend não distribui peças localmente
- frontend não decide primeiro jogador

### 5.4 `submit_patxanga_move()`

#### Finalidade
Submeter uma jogada de colocação de peças.

#### Assinatura oficial
`submit_patxanga_move(p_match_id uuid, p_player_id uuid, p_placed_tiles jsonb)`

#### Payload enviado pelo frontend
`p_placed_tiles` é um array contendo somente as peças colocadas nesta jogada.

Exemplo conceitual:

```json
[
  {
    "tile_id": "uuid-da-peca",
    "row": 8,
    "col": 8,
    "declared_letter": "A"
  }
]
```

#### Regras obrigatórias do frontend
- enviar apenas peças novas colocadas na jogada atual
- não reenviar peças já existentes no tabuleiro
- usar `tile_id` real do rack do jogador
- enviar `row` e `col` dentro da grade visual escolhida pelo usuário
- tratar `declared_letter` como campo necessário apenas quando aplicável a peça especial ou coringa
- não enviar score calculado
- não enviar direção como fonte de verdade
- não enviar palavra montada como fonte de verdade
- não enviar resultado lexical como fonte de verdade

#### Possíveis resultados operacionais para UI

##### a) `success` / jogada aceita
Efeitos esperados:
- board oficial atualizado
- rack oficial atualizado
- bag oficial atualizado
- score aplicado
- turno avançado
- avaliação de fim de partida executada

UI deve:
- substituir estado local pelo estado oficial retornado ou recarregado
- atualizar scoreboards
- atualizar indicação de turno
- checar se a match foi encerrada

##### b) `pending_vote`
Efeitos esperados:
- jogada persistida como pendente
- match entra em estado de votação
- board permanece intacto
- rack permanece intacto
- bag permanece intacto
- turno não avança

UI deve:
- abrir fluxo de votação
- sinalizar que a jogada está aguardando decisão
- não aplicar a jogada ao board oficial
- não remover peças do rack oficial
- não avançar turno localmente

##### c) erro
Exemplos de causas:
- não é o turno do jogador
- peça não pertence ao rack
- coordenada inválida
- célula ocupada
- desalinhamento
- lacuna na palavra principal
- falta de conexão com board existente
- primeira jogada sem centro
- payload inconsistente

UI deve:
- exibir erro
- manter estado oficial anterior
- não tentar corrigir estado oficial no cliente

### 5.5 `submit_patxanga_vote()`

#### Finalidade
Resolver jogada em `pending_vote`.

#### Regras já congeladas
- autor da jogada não pode votar
- uma rejeição já resolve como `rejected`
- todas as aprovações necessárias resolvem como `accepted`

#### Resultado `accepted`
Efeitos:
- jogada aplicada
- board atualizado
- rack atualizado
- bag reduzido
- score aplicado
- turno avançado
- match volta para `active`

UI deve:
- atualizar board, rack, score e turno a partir do estado oficial
- encerrar modal ou estado de votação
- refletir retorno a `active`

#### Resultado `rejected`
Efeitos:
- jogada rejeitada
- board intacto
- turno permanece com autor
- match volta para `active`

UI deve:
- manter board oficial sem aplicação da jogada
- fechar fluxo de votação
- devolver contexto visual ao autor para nova decisão de jogada

### 5.6 `submit_patxanga_pass_turn()`

#### Finalidade
Passar o turno sem jogar peças.

#### Efeitos esperados
- move persistido com `move_type = pass`
- `status = accepted`
- score da jogada = 0
- `has_passed_last_cycle = true`
- turno avança
- avaliação de fim de partida executada

#### Regras de frontend
- ação só deve ser oferecida ao jogador do turno
- após sucesso, recarregar estado oficial
- não avançar turno apenas por animação local sem confirmação do backend

### 5.7 `submit_patxanga_exchange_tiles()`

#### Finalidade
Trocar peças do rack com o bag.

#### Entrada operacional
- `match_id`
- `player_id`
- conjunto de `tile_id` selecionados para troca, conforme assinatura oficial da RPC

#### Efeitos esperados
- valida posse das peças
- peças saem do rack
- peças voltam ao bag
- mesma quantidade é comprada
- `rack_state` atualizado
- `bag_state` atualizado
- turno avança

#### Regras de frontend
- só permitir seleção de peças realmente presentes no rack oficial
- não remover peças do rack definitivamente antes da confirmação do backend
- após sucesso, substituir rack pelo estado oficial retornado ou recarregado

## 6. Estados relevantes da match para o frontend

Mínimo necessário para UX consistente:

- `waiting`
- `active`
- `voting`
- `finished`

### Regras
- `voting` bloqueia continuidade normal da jogada até resolução
- `finished` bloqueia novas ações de gameplay
- frontend não promove sozinho transições entre esses estados

## 7. Estado oficial a consumir do backend

O frontend deve sempre tratar como fonte oficial:

- `board_state`
- `rack_state`
- `bag_state`, quando exposto ou permitido
- `current_turn_player_id`
- `status` da match
- scores persistidos
- `winner_player_id`
- `finished_at`

Qualquer estado local temporário, como seleção de peças, drag-and-drop, pré-visualização de palavra
ou estimativa visual de score, é apenas auxiliar de UX e pode ser descartado a qualquer momento
diante da resposta oficial do backend.

## 8. Regras de renderização importantes

### 8.1 Board
- renderizar a partir de `board_state` oficial
- célula ocupada preserva objeto completo da peça, incluindo UUID
- multiplicadores valem apenas na primeira ocupação; UI não deve recalcular isso como fonte oficial

### 8.2 Rack
- renderizar a partir de `rack_state` oficial
- identidade visual da peça deve preservar `id`
- frontend não pode recriar peças sem UUID oficial

### 8.3 Score
- mostrar score persistido e oficial
- qualquer preview local deve ser tratado como não oficial

## 9. Erros e postura do frontend

Frontend deve assumir que erro de RPC:

- não altera estado oficial
- exige rollback visual local
- exige nova leitura do estado oficial quando houver dúvida

Frontend não deve:

- mascarar erro crítico como sucesso
- prosseguir turno localmente sem confirmação
- aplicar board ou rack provável
- converter falha de validação em ajuste silencioso

## 10. Limites deste documento

Este documento:

- não substitui migrations
- não redefine payload interno de replay
- não detalha contratos de telas, lobby, resume ou convites
- não detalha shape final de queries auxiliares ou endpoints agregadores
- não redefine regras estratégicas congeladas

Ele apenas consolida como o frontend deve consumir as RPCs validadas do backend
sem romper a arquitetura oficial do projeto.

## 11. Decisões congeladas refletidas aqui

- backend server-authoritative
- `player_id` como identidade de engine
- UUID por peça preservado
- `pending_vote` obrigatório
- replay e auditoria preservados
- nenhuma confiança em validação client-side

Fim do documento.
