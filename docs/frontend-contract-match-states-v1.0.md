# PATXANGA — FRONTEND CONTRACT: Match States
Version: 1.0
Status: Draft operacional segmentado
Base normativa:
- Context Snapshot Master v1.6
- Submit Move Contract v1.2 (Frozen)
- frontend-contract-rpcs-v1.0.md

## 1. Objetivo

Este documento define o contrato operacional dos estados de partida
que o frontend deve respeitar ao consumir o backend do Patxanga.

Ele não redefine regras de engine, não substitui migrations
e não altera a autoridade do servidor.

## 2. Princípio central

O estado oficial da match é sempre definido pelo backend.

O frontend:
- renderiza o estado retornado
- adapta a UI ao estado oficial
- não promove transições por conta própria
- não assume sucesso local como mudança definitiva de estado

## 3. Estados oficiais mínimos

Os estados mínimos relevantes para o frontend nesta fase são:

- `waiting`
- `active`
- `voting`
- `finished`

## 4. Estado `waiting`

### Definição
Partida ainda não iniciada.

### Características
- lobby ativo
- jogadores ainda podem entrar, conforme regras do backend
- tabuleiro ainda não está em fluxo normal de jogo
- turno jogável ainda não deve ser tratado como ativo pelo frontend

### UI esperada
- exibir contexto de lobby
- exibir participantes atuais
- permitir ações compatíveis com pré-início
- não habilitar ações de gameplay normal

## 5. Estado `active`

### Definição
Partida em andamento, apta para jogadas normais.

### Características
- existe `current_turn_player_id`
- jogadas normais podem ser submetidas
- fluxo de turno está ativo
- board, rack e score devem ser tratados como oficiais

### UI esperada
- habilitar ação de jogar apenas ao jogador do turno
- habilitar `pass_turn` apenas ao jogador do turno
- habilitar `exchange_tiles` apenas ao jogador do turno
- manter demais jogadores em estado de espera
- refletir turno atual de forma explícita

## 6. Estado `voting`

### Definição
Partida temporariamente em fluxo de votação por jogada pendente.

### Características
- existe jogada em `pending_vote`
- board oficial ainda não foi alterado por essa jogada
- rack oficial ainda não foi alterado por essa jogada
- bag oficial ainda não foi alterado por essa jogada
- turno ainda não avançou
- a resolução depende de `submit_patxanga_vote()`

### UI esperada
- bloquear continuidade do fluxo normal de jogada
- destacar que a partida está aguardando votação
- permitir votação apenas a quem puder votar segundo o backend
- impedir que a UI trate a jogada pendente como aplicada ao board oficial
- impedir avanço local de turno

## 7. Estado `finished`

### Definição
Partida encerrada pelo backend.

### Características
- novas ações de gameplay não devem prosseguir
- `winner_player_id` deve ser tratado como resultado oficial
- `finished_at` deve ser tratado como timestamp oficial de encerramento
- score final já deve refletir ajustes finais aplicáveis

### UI esperada
- bloquear ações de gameplay
- exibir resultado final
- exibir vencedor oficial
- exibir score final oficial
- permitir apenas ações compatíveis com partida encerrada

## 8. Transições oficiais esperadas

### `waiting` → `active`
Ocorre quando a partida é iniciada com sucesso.

Trigger típico:
- `start_match()`

### `active` → `voting`
Ocorre quando `submit_patxanga_move()` encontra palavra não validada no dicionário
e entra no fluxo de `pending_vote`.

### `voting` → `active`
Ocorre quando `submit_patxanga_vote()` resolve a jogada pendente, seja como:
- `accepted`
- `rejected`

### `active` → `finished`
Ocorre quando o backend conclui fim de partida por critério válido.

### `voting` → `finished`
Não deve ser presumido pelo frontend como fluxo normal direto.
O frontend deve sempre respeitar o estado oficial devolvido pelo backend.

## 9. Regras de bloqueio de UI por estado

### Em `waiting`
- não permitir submit de jogada normal
- não permitir `pass_turn`
- não permitir `exchange_tiles`

### Em `active`
- permitir ações normais apenas ao jogador do turno
- não permitir que jogador fora do turno envie jogada como se estivesse autorizado

### Em `voting`
- bloquear nova jogada normal
- bloquear avanço local de turno
- bloquear aplicação visual definitiva da jogada pendente ao board oficial

### Em `finished`
- bloquear toda ação de gameplay
- não permitir nova jogada
- não permitir voto
- não permitir `pass_turn`
- não permitir `exchange_tiles`

## 10. Relação com estado local temporário

Estados locais de UX, como:
- seleção de peças
- drag-and-drop
- preview visual
- animações de turno
- score estimado

nunca substituem o estado oficial da match.

Se houver divergência entre frontend e backend:
- o frontend deve descartar o estado local temporário
- o backend prevalece

## 11. Limites deste documento

Este documento:
- não substitui o contrato de RPCs
- não redefine regras estratégicas
- não redefine payloads internos de replay
- não substitui migrations
- não altera o fluxo server-authoritative

## 12. Decisões congeladas refletidas aqui

- backend server-authoritative
- `player_id` como identidade de engine
- `pending_vote` como estado real do produto
- turno só muda por decisão oficial do backend
- fim de partida só existe quando o backend o define

Fim do documento.
