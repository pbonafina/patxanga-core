# PATXANGA - COMO JOGAR

Versao: 0.1
Status: Manual inicial para jogador
Base: regras e contratos tecnicos existentes no projeto

---

## 1. Objetivo do jogo

Patxanga e um jogo competitivo de formacao de palavras em portugues.

Cada jogador tenta somar mais pontos criando palavras no tabuleiro, usando as pecas do proprio rack e aproveitando multiplicadores de letras e palavras.

O backend e sempre a autoridade final:

- valida se a jogada e permitida
- valida posse das pecas
- valida geometria da palavra
- valida palavras no dicionario
- calcula a pontuacao
- atualiza placar, rack, bolsa e turno

---

## 2. Componentes principais

### Tabuleiro

- 15 x 15 casas.
- Coordenadas de 1 a 15.
- A primeira jogada deve passar pelo centro: linha 8, coluna 8.
- O centro e uma casa de palavra dupla.

### Pecas

A bolsa oficial tem 110 pecas:

- 103 letras comuns.
- 7 pecas especiais.

As letras comuns tem valores proprios. Nao existe peca "C cedilha"; quando necessario, usa-se C.

### Rack do jogador

- Cada jogador joga com um rack de ate 7 pecas.
- Apos uma jogada aceita, o backend remove as pecas usadas e compra novas pecas da bolsa para recompor o rack ate 7, quando houver pecas disponiveis.

---

## 3. Pecas especiais

As pecas especiais podem representar qualquer letra, mas exigem declaracao da letra usada naquela jogada.

| Peca | Quantidade | Pontos | Estado no jogo |
|------|------------|--------|----------------|
| Coringa | 2 | 0 | Implementado como peca sem valor que representa uma letra declarada |
| Pular Turno | 4 | 0 | Existe na distribuicao e exige letra declarada; o efeito de escolher alvo/pular turno ainda nao esta consolidado na UI atual |
| Patxanga Real | 1 | 0 | Implementada como peca especial que representa uma letra declarada e ativa multiplicador especial de pontuacao |

Regra pratica:

- Se a peca especial nao tem letra fixa, o jogador deve declarar qual letra ela representa.
- Sem essa declaracao, a jogada nao deve ser considerada completa.

---

## 4. Multiplicadores do tabuleiro

As casas podem ter estes tipos:

| Sigla | Significado |
|-------|-------------|
| NM | Normal |
| LD | Letra dupla |
| LT | Letra tripla |
| PD | Palavra dupla |
| PT | Palavra tripla |

Regras:

- Multiplicadores so valem quando uma peca e colocada naquela casa pela primeira vez.
- Pecas que ja estavam no tabuleiro contam para formar palavras, mas nao reaplicam multiplicadores antigos.
- Multiplicadores de letra afetam apenas a peca colocada naquela casa.
- Multiplicadores de palavra afetam a palavra correspondente.

---

## 5. Fluxo de uma partida

### 5.1 Lobby

Antes de jogar:

1. Uma partida e criada.
2. Jogadores entram na partida.
3. A partida e iniciada.
4. O backend distribui rack, bolsa, tabuleiro e define o primeiro turno.

### 5.2 Turno ativo

Quando for seu turno, voce pode:

- montar uma palavra com pecas do seu rack
- enviar a jogada
- passar o turno
- trocar pecas
- desistir formalmente da partida

Jogadores fora do turno podem acompanhar o tabuleiro, o placar e o proprio rack, mas nao podem executar acao de turno.

### 5.3 Votacao

Se uma palavra enviada nao for reconhecida pelo dicionario:

1. A partida entra em estado de votacao.
2. A jogada fica pendente.
3. O tabuleiro oficial ainda nao muda.
4. O turno ainda nao avanca.
5. Jogadores elegiveis podem votar.
6. A resolucao oficial do backend decide se a jogada e aceita ou rejeitada.

Na regra de produto documentada:

- nao votar conta como aceitar
- empate rejeita
- o autor da jogada nao vota

Na implementacao atual validada:

- uma rejeicao pode resolver a jogada como rejeitada
- aprovacoes suficientes resolvem a jogada como aceita

---

## 6. Como fazer uma jogada

Uma jogada de palavra deve respeitar estas regras:

1. Deve ser o turno do jogador.
2. Todas as pecas enviadas devem pertencer ao rack do jogador.
3. As coordenadas devem estar dentro do tabuleiro.
4. As casas escolhidas devem estar vazias.
5. As pecas novas devem estar alinhadas na mesma linha ou coluna.
6. A palavra principal nao pode ter lacunas.
7. A primeira jogada deve passar pelo centro.
8. Depois da primeira jogada, a nova jogada deve se conectar ao tabuleiro existente.
9. A palavra principal deve ter pelo menos 2 letras.
10. Todas as palavras formadas, principal e secundarias, passam por validacao.

O frontend pode ajudar a montar a jogada com:

- clique direto no tabuleiro
- selecao de pecas do rack
- slots locais de composicao
- preview de jogada e score estimado

Mas a jogada oficial enviada ao backend contem apenas:

- id da peca
- linha
- coluna
- letra declarada, quando aplicavel

---

## 7. Palavras principais e secundarias

Cada jogada gera:

- uma palavra principal, formada na direcao da jogada
- possiveis palavras secundarias, formadas por cruzamentos

Todas as palavras contam para validacao.

Se todas forem reconhecidas, a jogada pode ser aceita automaticamente.

Se qualquer palavra nao for reconhecida, a jogada entra em votacao.

---

## 8. Pontuacao

A pontuacao e calculada pelo backend.

Regra geral:

1. Soma-se o valor das letras da palavra principal.
2. Aplicam-se multiplicadores de letra das casas novas.
3. Aplicam-se multiplicadores de palavra das casas novas.
4. Calculam-se tambem palavras secundarias formadas por cruzamentos.
5. Se o jogador usou 7 pecas na jogada, recebe bonus de 20 pontos.
6. Se Patxanga Real foi usada, o backend aplica o multiplicador especial sobre a parte principal da pontuacao conforme a implementacao atual.

Observacao importante:

- O score mostrado em preview e apenas estimativa.
- O placar oficial e sempre o retornado/persistido pelo backend.

---

## 9. Passar turno

O jogador pode passar sem colocar pecas.

Ao passar:

- nenhuma peca e removida
- o tabuleiro nao muda
- a jogada de passe e registrada
- o turno avanca
- o jogador fica marcado como tendo passado naquele ciclo

Se a bolsa estiver vazia e todos os jogadores passarem no ciclo, a partida pode terminar.

---

## 10. Trocar pecas

O jogador pode trocar uma ou mais pecas do rack.

Ao trocar:

- as pecas escolhidas voltam para a bolsa
- o backend compra a mesma quantidade de novas pecas
- o rack e atualizado
- a troca e registrada como jogada
- o turno avanca

Nao e permitido trocar zero pecas.

---

## 11. Desistencia

O jogador pode desistir formalmente da partida.

Ao desistir:

- o jogador fica marcado como desistente
- se era o turno dele, o backend avanca o turno
- se todos desistirem, a partida e cancelada

---

## 12. Fim de partida

A partida pode terminar quando a bolsa esta vazia e acontece pelo menos uma destas condicoes:

- algum jogador fica sem pecas no rack
- todos os jogadores passam no ciclo

Quando a partida termina:

1. Cada jogador perde pontos iguais ao valor das pecas restantes no rack.
2. Se alguem esvaziou o rack, esse jogador recebe como bonus a soma das penalidades dos outros racks.
3. Vence quem tiver o maior score final.
4. Em empate simples na implementacao atual, vence quem tiver menor ordem de turno.

---

## 13. Estados da partida

| Estado | Significado |
|--------|-------------|
| waiting | Partida criada, ainda nao iniciada |
| active | Partida em andamento, jogadas normais liberadas |
| voting | Existe uma jogada pendente de votacao |
| finished | Partida encerrada |
| cancelled | Partida cancelada |

O frontend deve sempre respeitar o estado oficial vindo do backend.

---

## 14. O que ja esta jogavel hoje

De acordo com a implementacao atual do projeto:

- partida sincrona humano contra humano
- lobby basico, convite, aceite, recusa e retomada
- rack oficial do jogador
- montagem de jogada no tabuleiro
- composicao local por slots no rack
- preview de jogada
- submit real de jogada
- pending vote
- voto de aceitacao/rejeicao
- passar turno
- trocar pecas
- desistencia
- fim de partida por bolsa vazia e rack vazio ou todos passarem

---

## 15. O que ainda nao e um modo completo de jogo

Ainda nao ha modo humano contra bot implementado de ponta a ponta.

O banco ja consegue marcar um jogador como bot, mas ainda falta:

- interface para criar partida humano contra bot
- engine que escolha jogadas do bot
- Edge Function ou rotina equivalente para executar turno de bot
- testes especificos de bot jogando

Tambem ainda falta um refinamento de produto para o efeito completo da peca Pular Turno na UI atual.

---

## 16. Referencias tecnicas

Documentos-base:

- `docs/01-product-vision.md`
- `docs/10-letter-distribution.md`
- `docs/11-board-layout.md`
- `docs/12-submit-move-contract.md`
- `docs/frontend-contract-rpcs-v1.0.md`
- `docs/frontend-contract-screen-actions-v1.0.md`
- `docs/frontend-contract-match-states-v1.0.md`
- `docs/frontend-rack-composition-ux-v1.0.md`

Arquivos SQL relevantes:

- `sql/rpc/submit_move.sql`
- `sql/rpc/calculate_score.sql`
- `sql/rpc/submit_vote.sql`
- `sql/rpc/pass_turn.sql`
- `sql/rpc/exchange_tiles.sql`
- `sql/rpc/evaluate_match_end.sql`
- `sql/rpc/forfeit_match.sql`
