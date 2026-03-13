# PATXANGA — FRONTEND CONTRACT: PENDING VOTE UX
Version: 1.0
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

## 6. Proibição

É proibido:

- aplicar a jogada pendente diretamente no `board_state` oficial antes da decisão final
- avançar turno localmente antes da resolução
- tratar `pending_vote` como rejeição automática

## 7. Implicação técnica

Para suportar essa UX, o frontend precisará de leitura adicional do contexto pendente de votação.

Esse contexto deve ser obtido por read model/entrypoint específico, sem mutar o estado oficial da partida.

Fim do documento.
