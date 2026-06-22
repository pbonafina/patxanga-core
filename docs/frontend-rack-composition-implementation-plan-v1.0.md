# PATXANGA — FRONTEND: Rack Composition Implementation Plan
Version: 1.0
Status: ACTIVE IMPLEMENTED BASELINE

Base normativa:
- docs/frontend-rack-composition-ux-v1.0.md
- docs/frontend-contract-screen-actions-v1.0.md
- docs/frontend-contract-rpcs-v1.0.md
- docs/frontend-browser-validation-procedure-v1.0.md

## 1. Objetivo

Documentar a implementacao atual da composicao do rack
e congelar a leitura correta da superficie que passou a ser oficial
para preparar jogadas no frontend.

## 2. Regra central

A implementacao continua frontend-led,
mas agora ela pode gerar a jogada oficial
sem mudar o formato da RPC de backend.

Leitura correta:
- nao houve mudanca de engine
- nao houve mudanca do formato de `submit_patxanga_move(...)`
- o frontend passou a compilar a composicao do rack
  em `p_placed_tiles`

## 3. Resultado efetivamente entregue

O jogador ja consegue:
- reorganizar pecas reais no rack local
- usar slots locais permanentes de composicao
- mover pecas livremente entre pecas e slots na ordem visual do rack
- escrever letra em slots
- vincular uma peca real a um slot
- associar o slot a uma casa do tabuleiro
- ver `placedTilesPreview` e preview do backend refletindo essa composicao
- limpar essa composicao oficial sem afetar o backend

## 4. Arquivos principais afetados

### 4.1 `frontend/pages/index.tsx`
Responsabilidades atuais:
- manter estado local da superficie de composicao do rack
- coordenar selecao de pecas reais
- coordenar slots locais permanentes
- coordenar drafts locais de letras nos slots
- coordenar vinculacao `slot -> tile real`
- coordenar associacoes `slot -> casa do tabuleiro`
- compilar `placedTilesPreview` a partir de:
  - colocacao direta no board
  - composicao oficial por slot

### 4.2 `frontend/components/RackSection.tsx`
Responsabilidades atuais:
- renderizar pecas reais e slots locais na mesma superficie visual
- expor visualmente quando um slot tem peca vinculada
- expor visualmente quando uma peca esta vinculada a um slot
- permitir limpar a vinculacao oficial do slot
- manter legibilidade entre:
  - peca real
  - slot
  - associacao de slot
  - peca oficial vinculada ao slot

### 4.3 `frontend/components/BoardSection.tsx`
Responsabilidades atuais:
- renderizar preview oriundo da composicao oficial por slot
- diferenciar visualmente preview direto e preview por slot
- manter badges de slot associados no board

### 4.4 `frontend/components/GamePlayScreen.tsx`
Responsabilidades atuais:
- orquestrar a tela jogavel
- repassar a composicao oficial para rack e board
- refletir o contador real de pecas em preparo

## 5. Estrutura de estado implementada

### 5.1 Ordem local do rack
- itens heterogeneos
- cada item pode ser:
  - peca real
  - slot local permanente

### 5.2 Estado adicional ativo
- drafts por slot
- associacao `slot -> casa`
- vinculacao `slot -> tile real`
- selecao atual de pecas reais
- ordem local da superficie
- colocacao direta no board, mantida por compatibilidade operacional

### 5.3 Derivacao oficial
`placedTilesPreview` passa a ser derivado de duas origens oficiais de frontend:

1. colocacao direta de peca no board
2. composicao por slot com:
   - peca real vinculada
   - slot associado ao tabuleiro

## 6. Invariantes obrigatorios

- peca real continua identificada por `tileId`
- slot local continua sem existencia no backend
- o payload enviado continua contendo apenas pecas reais
- `slotId` nunca entra em `p_placed_tiles`
- associacao de slot nunca entra como estrutura propria da RPC
- `declared_letter` pode vir do slot quando:
  - houver peca especial vinculada
  - houver associacao ativa no tabuleiro
- reidratacao oficial pode descartar estado local temporario

## 7. Etapas implementadas

### Etapa 1 — normalizar a superficie local do rack
Status:
- implementada

Saida entregue:
- rack aceita pecas reais e slots locais na mesma ordem visual

### Etapa 2 — slots locais permanentes de composicao
Status:
- implementada

Saida entregue:
- slots locais permanentes sempre disponiveis no rack

### Etapa 3 — reordenacao fluida com slots e pecas
Status:
- implementada

Saida entregue:
- grupo de pecas continua movel
- slots continuam moviveis

### Etapa 4 — letra no slot
Status:
- implementada

Saida entregue:
- slot aceita letra local
- quando aplicavel, essa letra pode virar `declared_letter`

### Etapa 5 — vinculacao oficial `slot -> tile real`
Status:
- implementada

Saida entregue:
- clique em peca + clique em slot vincula a peca ao slot
- clique em peca com slot ativo tambem vincula
- limpar vinculacao desfaz a composicao oficial daquele slot

### Etapa 6 — associacao `slot -> casa do tabuleiro`
Status:
- implementada

Saida entregue:
- slot ativo pode ser associado a uma casa do tabuleiro
- badges no board e no rack refletem essa composicao

### Etapa 7 — compilacao oficial para preview e submit
Status:
- implementada

Saida entregue:
- `placedTilesPreview` agora reflete a composicao por slot
- preview do backend responde a essa nova superficie
- submit continua usando a mesma RPC oficial

### Etapa 8 — guardrail de peca especial em slot
Status:
- implementada

Saida entregue:
- slot com `wildcard`, `skip_turn` ou `patxanga_real` vinculado e associado ao
  board exige letra local antes do submit
- a tela mostra aviso de composicao quando a letra declarada esta ausente
- o botao de confirmar jogada fica bloqueado enquanto houver esse aviso
- Playwright cobre wildcard em slot formando palavra aceita depois da letra
  declarada

### Etapa 9 — limpeza parcial da associacao do slot
Status:
- implementada

Saida entregue:
- slot associado ao board pode limpar apenas a casa de destino
- a peca vinculada ao slot permanece vinculada
- badges do board e resumo de composicao sao atualizados sem limpar o slot todo
- Playwright cobre esse comportamento antes de limpar a jogada completa

### Etapa 10 — leitura local da palavra e diagnostico de votacao
Status:
- implementada

Saida entregue:
- a palavra composta localmente e exibida antes do preview do backend
- o preview continua sendo a fonte oficial de pontuacao e votacao
- palavras fora do lexico ativo mostram diagnostico explicito antes do submit
- Playwright cobre a leitura local e o diagnostico de votacao em palavra nao
  reconhecida

## 8. Fora de escopo atual

Nao entra nesta baseline:
- drag rack -> board como fluxo oficial
- reserva de letra do tabuleiro
- reserva de casa do tabuleiro
- alteracao de engine
- alteracao de backend
- mudanca do formato de `submit_patxanga_move(...)`

## 9. Riscos que continuam relevantes

- misturar slot local vazio com jogada oficial
- deixar a mesma peca aparecer em mais de uma origem de composicao
- regredir selecao multipla ou reordenacao em grupo
- regredir pending_vote
- quebrar o fluxo direto de clique no board por causa da composicao por slot

## 10. Checklist de validacao atual

### Build
- `cd frontend && npm run build`

### Browser automatizado
- `cd frontend && npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium`

Coberturas minimas atuais:
- convites/lobby/retomada/desistencia
- associacao local de slot sem contaminar gameplay
- composicao oficial por slot alimentando `placedTilesPreview`
- bloqueio de submit para peca especial sem `declared_letter`
- submit aceito com wildcard por slot e letra declarada
- limpeza parcial de casa associada ao slot sem perder a peca vinculada

## 11. Proximos passos produtivos

Depois desta baseline, os proximos passos com melhor retorno sao:

1. ampliar recomposicao parcial: trocar associacao de casa por gesto direto
2. decidir se o fluxo direto de peca -> board continua coexistindo
   ou se a tela jogavel converge para um unico fluxo oficial
3. ampliar Playwright para limpar, trocar e recompor slots em uma mesma jogada
4. revisar a UX de drag/drop para ficar menos dependente de clique sequencial

## 12. Fechamento correto desta frente

Esta linha de implementacao so deve ser considerada fechada quando:
- build passar
- Playwright passar
- a documentacao normativa estiver sincronizada
- commit/push/logstep forem executados
- o kit de continuidade for atualizado

## 13. Limites deste plano

Este plano:
- nao substitui o contrato de UX
- nao redefine engine
- nao redefine backend
- nao redefine a RPC oficial
- nao redefine o fluxo final de produto alem da baseline atual

Fim do documento.
