# PATXANGA — FRONTEND CONTRACT: PENDING VOTE UX
Version: 1.2
Status: ACTIVE OPERATIONAL BASELINE

Base normativa:
- Context Snapshot Master vigente
- `docs/12-submit-move-contract.md` — Version 1.2 (Frozen)
- `docs/frontend-contract-rpcs-v1.0.md`
- `docs/frontend-contract-match-states-v1.0.md`

## 1. Objetivo

Definir o comportamento de UX do frontend quando uma jogada entra em `pending_vote`.

## 2. Regra central

Quando `submit_patxanga_move(...)` gerar `pending_vote`:

- o `board_state` oficial não deve ser modificado permanentemente
- o turno não deve avançar
- a match deve entrar em `voting`

Ao mesmo tempo, a UI deve continuar exibindo visualmente a jogada pendente em avaliação.

## 3. Regra de renderização obrigatória

Durante `voting`, o frontend deve renderizar um board composto por:

- `board_state` oficial persistido
- overlay visual da jogada pendente de votação

Esse overlay:

- não substitui o estado oficial
- não representa aplicação definitiva da jogada
- existe apenas para contexto visual da avaliação

## 4. Comportamento esperado do rack

Durante `pending_vote` / `voting`:

- o `rack_state` oficial pode permanecer intacto até a decisão final
- isso não impede que a UI mostre as peças pendentes no overlay visual do board
- frontend não deve interpretar o reaparecimento do rack oficial como rejeição automática

## 5. Requisitos mínimos da UI em voting

A UI deve conseguir mostrar, no mínimo:

- peças propostas e suas coordenadas
- autor da jogada pendente
- indicação clara de que a jogada está em avaliação
- distinção visual entre estado oficial e estado pendente
- palavra principal em formato legivel para jogador
- explicacao clara quando o autor nao pode votar na propria palavra
- explicacao clara quando o viewer pode votar por nao ser o autor
- mensagem persistente de resultado apos aceite/rejeicao

## 5.1 Baseline implementada no frontend

Desde a tranche de 2026-06-22, a UI de `voting` exibe:

- painel `Palavra em avaliação`
- palavra principal em pecas visuais
- coordenadas das pecas propostas
- autor da jogada
- aviso de que o tabuleiro oficial continua intacto
- mensagem `Autor não vota na própria palavra` quando o viewer e o autor sao o
  mesmo jogador
- mensagem `Você pode votar porque não é o autor desta jogada.` quando o
  viewer pode decidir a votacao
- botoes de produto `Aceitar palavra` e `Rejeitar palavra`
- mensagem pos-voto fora do painel de `voting`, incluindo aceite com
  `Palavra aceita. O tabuleiro oficial foi atualizado.` e rejeicao com
  `Palavra rejeitada. O turno voltou ao autor.`

## 5.2 Regra de resultado pos-voto

Quando a votacao resolver a jogada, a match deixa de estar em `voting`.
Portanto, a mensagem de resultado nao pode depender do painel de votacao.

O frontend deve manter uma mensagem de resolucao visivel na tela de jogo apos
recarregar o bootstrap da partida.

## 6. Proibição

É proibido:

- aplicar a jogada pendente diretamente no `board_state` oficial antes da decisão final
- avançar turno localmente antes da resolução
- tratar `pending_vote` como rejeição automática

## 7. Implicação técnica

Para suportar essa UX, o frontend precisará de leitura adicional do contexto pendente de votação.

Esse contexto deve ser obtido por read model/entrypoint específico, sem mutar o estado oficial da partida.

Fim do documento.
