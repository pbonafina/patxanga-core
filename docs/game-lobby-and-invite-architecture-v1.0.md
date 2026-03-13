# ============================================================
# PATXANGA — GAME LOBBY AND INVITE ARCHITECTURE
# Version: 1.0
# Status: DESIGN BASELINE
# ============================================================

## 1. Objetivo

Definir a arquitetura do subsistema de lobby e convites do Patxanga.

Este subsistema deve permitir:

- criação de sala/lobby de partida
- envio de convites para usuários autenticados
- aceite/recusa de convite
- entrada controlada na partida
- modo de adesão aberta com limite de vagas
- desacoplamento do domínio do jogo em relação ao restante do site

## 2. Princípio central

Patxanga reaproveita do sistema atual apenas:

- autenticação
- identidade do usuário
- user_id
- dados básicos de perfil necessários para exibição

Toda a lógica de convite e lobby pertence ao domínio do jogo.

## 3. Decisão arquitetural

### Reaproveitar do sistema atual
- cadastro
- login
- sessão autenticada
- user_id
- nome / avatar / perfil básico

### Implementar dentro do Patxanga
- game invites
- lobby da partida
- aceite e recusa
- expiração de convite
- controle de entrada na sala
- status de presença no lobby
- transição lobby -> match active

## 4. Motivação da decisão

Essa separação permite:

- reduzir acoplamento com o produto principal
- preparar o jogo para futura separação
- manter o domínio do jogo coeso
- evitar adaptar um sistema de convites genérico para regras específicas de partida
- evoluir o Patxanga sem dependências desnecessárias

## 5. Fronteira entre sistemas

### Sistema principal
Responsável por:
- autenticar usuários
- garantir identidade válida
- disponibilizar user_id confiável

### Sistema Patxanga
Responsável por:
- criar partidas
- criar convites da partida
- controlar lobby
- registrar participantes
- iniciar a partida
- conduzir gameplay

## 6. Conceitos do domínio

### Match
Partida formal do jogo, já existente no backend.

### Lobby
Estado anterior ao início da partida, onde:
- jogadores entram
- convites são aceitos/recusados
- host acompanha participantes
- partida pode ser iniciada

### Invite
Relação entre:
- uma partida
- um usuário convidado
- um status de decisão

## 7. Modos de convite

### `direct`
O organizador escolhe explicitamente quais usuários logados receberão convite.

Características:
- convites individuais
- aceite entra direto, se ainda houver vaga
- recusa é individual
- ideal para partidas privadas

### `open_pool`
O organizador permite adesão aberta com número limitado de vagas.

Características:
- não depende de convite nominal para cada usuário
- qualquer usuário elegível pode tentar entrar
- os primeiros `N` que aceitarem ocupam as vagas
- ao atingir o limite, a sala deixa de aceitar novas entradas
- ideal para partidas rápidas / abertas

## 8. Estados do convite

Estados sugeridos:

- `pending`
- `accepted`
- `declined`
- `expired`
- `cancelled`

### Regras
- convite nasce em `pending`
- aceite muda para `accepted`
- recusa muda para `declined`
- host pode cancelar convites pendentes
- convites podem expirar por regra temporal futura
- convite aceito não deve poder ser aceito duas vezes

## 9. Estados do lobby

Estados sugeridos:

- `open`
- `ready`
- `closed`
- `started`

### Interpretação
- `open`: lobby aceitando convidados / adesões
- `ready`: número mínimo atingido, pronto para start
- `closed`: host encerrou ou cancelou
- `started`: partida já iniciada

## 10. Tabelas sugeridas

### 10.1 patxanga_match_lobbies
Responsável pelo estado do lobby associado à match.

Campos sugeridos:
- id uuid pk
- match_id uuid unique not null
- host_player_id uuid null
- status text not null
- invite_mode text not null
- open_pool_slots integer null
- created_at timestamp not null
- updated_at timestamp not null
- started_at timestamp null
- closed_at timestamp null

Regras:
- `invite_mode` in (`direct`, `open_pool`)
- `open_pool_slots` obrigatório quando `invite_mode = open_pool`

### 10.2 patxanga_match_invites
Responsável pelos convites individuais do modo `direct`.

Campos sugeridos:
- id uuid pk
- match_id uuid not null
- invited_user_id uuid not null
- invited_by_player_id uuid not null
- status text not null
- created_at timestamp not null
- responded_at timestamp null
- expires_at timestamp null
- updated_at timestamp not null

Constraint sugerida:
- unique(match_id, invited_user_id)

### 10.3 patxanga_lobby_presence
Opcional, caso queiramos separar presença de lobby da presença de match.

Campos sugeridos:
- id uuid pk
- match_id uuid not null
- player_id uuid not null
- is_online boolean not null default true
- joined_lobby_at timestamp not null
- updated_at timestamp not null

## 11. RPCs sugeridas

### create_patxanga_match_lobby(...)
Cria a match + lobby inicial.

### invite_patxanga_player(...)
Cria convite nominal para usuário autenticado.

### accept_patxanga_invite(...)
Aceita convite do modo `direct` e executa entrada controlada.

### decline_patxanga_invite(...)
Recusa convite nominal.

### cancel_patxanga_invite(...)
Cancela convite pendente.

### join_patxanga_open_lobby(...)
Entrada no modo `open_pool`, respeitando limite de vagas.

### list_patxanga_match_invites(...)
Lista convites por partida.

### list_patxanga_user_pending_invites(...)
Lista convites pendentes do usuário logado.

### close_patxanga_lobby(...)
Fecha o lobby sem iniciar.

### start_patxanga_match(...)
Já existe e será usado ao final do fluxo de lobby.

## 12. Fluxo ideal

### Fluxo de criação
1. host autenticado cria match
2. backend cria lobby vinculado à match
3. host escolhe:
   - modo `direct`
   - ou modo `open_pool`

### Fluxo `direct`
1. host seleciona usuários logados
2. backend cria convites nominais
3. usuário aceita ou recusa
4. backend executa `join_patxanga_match(...)`
5. convite vira `accepted`
6. jogador entra no lobby

### Fluxo `open_pool`
1. host define número de vagas abertas
2. lobby fica visível para usuários elegíveis
3. usuários tentam entrar
4. backend aceita apenas os primeiros N
5. ao atingir o limite, o lobby deixa de aceitar novas entradas

### Fluxo de início
1. host verifica número de jogadores
2. host inicia a partida
3. backend muda lobby para `started`
4. backend chama `start_patxanga_match(...)`

## 13. Regras importantes

- somente usuários autenticados podem aceitar convite ou entrar em open_pool
- convite pertence ao domínio do jogo, não ao domínio genérico do site
- frontend nunca cria participação sem RPC do backend
- match só inicia pelo backend
- host não precisa de convite para própria sala
- jogador não pode entrar duas vezes na mesma match
- convite aceito/recusado deve ficar auditável
- open_pool deve respeitar limite exato de vagas
- concorrência de aceite deve ser resolvida por lock no backend

## 14. Desacoplamento futuro

Essa arquitetura permite que, no futuro:

- o Patxanga vire app separado
- continue usando auth compartilhada temporariamente
- ou passe a ter auth própria depois

Porque o que já estará isolado será:
- convites
- lobby
- participantes
- estado de partida

## 15. Próximos passos recomendados

1. Aprovar este documento como baseline
2. Criar migrations do subsistema de lobby/invite
3. Implementar RPCs mínimas:
   - create lobby
   - invite player
   - accept invite
   - decline invite
   - join open lobby
4. Criar testes determinísticos dos dois modos:
   - direct
   - open_pool
5. Integrar frontend com lobby antes do gameplay completo
