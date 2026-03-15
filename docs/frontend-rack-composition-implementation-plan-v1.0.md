# PATXANGA — FRONTEND: Rack Composition Implementation Plan
Version: 1.0
Status: ACTIVE WORKING PLAN

Base normativa:
- docs/frontend-rack-composition-ux-v1.0.md
- docs/frontend-contract-screen-actions-v1.0.md
- docs/frontend-contract-rpcs-v1.0.md
- docs/frontend-browser-validation-procedure-v1.0.md

## 1. Objetivo

Definir o plano tecnico incremental para implementar a composicao local do rack
no frontend sem alterar backend, engine ou contrato oficial de submit.

## 2. Regra central

Toda a implementacao desta frente deve permanecer frontend-only.

Nao entra neste plano:
- alteracao de engine
- alteracao de RPC
- alteracao de payload oficial
- drag and drop rack -> board como fluxo oficial

## 3. Resultado esperado

Ao fim desta frente, o jogador deve conseguir:
- reorganizar pecas reais no rack local
- usar slots locais permanentes de composicao
- mover pecas livremente entre pecas reais e slots locais
- escrever letras de rascunho nos slots
- associar localmente slots ao tabuleiro sem contaminar o submit
- continuar enviando jogadas reais sem contaminar o submit


## 4. Arquivos principais afetados

### 4.1 `frontend/pages/index.tsx`
Responsabilidades nesta frente:
- manter estado local da superficie de composicao do rack
- coordenar selecao de pecas reais
- coordenar slots locais permanentes
- coordenar drafts locais de letras nos slots
- coordenar associacoes locais opcionais entre slot e tabuleiro
- preservar geracao correta de `placedTilesPreview`
- garantir que slots nao entrem em submit

### 4.2 `frontend/components/RackSection.tsx`
Responsabilidades nesta frente:
- renderizar pecas reais e slots locais na mesma superficie visual
- permitir reordenacao local coerente
- permitir edicao da letra de rascunho nos slots
- manter clareza visual entre item real e item local
- manter manipulacao simples e previsivel no rack

### 4.3 `frontend/components/GamePlayScreen.tsx`
Responsabilidades nesta frente:
- continuar orquestrando o rack como parte da tela jogavel
- repassar props novas de composicao local sem assumir regra de backend

## 5. Estrutura de estado recomendada

A superficie local do rack deve deixar de depender apenas de uma lista de ids reais.

Modelo recomendado:
- itens locais heterogeneos
- cada item pode ser:
  - peca real
  - slot local permanente

Exemplo conceitual:
- `{ kind: "tile", tileId: "..." }`
- `{ kind: "slot", slotId: "slot-1" }`

Estado adicional:
- drafts por slot
- associacao opcional do slot ao tabuleiro
- selecao atual de pecas reais
- ordem local da superficie de composicao

## 6. Invariantes obrigatorios

- peca real continua identificada por `tileId`
- slot local continua sem existencia no backend
- submit oficial continua ignorando slots
- submit oficial continua ignorando drafts
- submit oficial continua ignorando associacoes locais com o tabuleiro
- `placedTilesPreview` continua derivado apenas de pecas reais colocadas no board
- reidratacao oficial pode descartar estado local temporario


## 7. Etapas de implementacao

### Etapa 1 — normalizar a superficie local do rack
Objetivo:
- substituir a ordem local baseada apenas em ids por uma ordem local baseada em itens de composicao

Saida esperada:
- rack local aceita itens reais e slots locais

### Etapa 2 — slots locais permanentes de composicao
Objetivo:
- substituir lacunas dinamicas por slots locais permanentes
- manter sempre folga de composicao no rack local
- simplificar a montagem mental sem depender de criacao pontual de lacuna

Saida esperada:
- jogador ve slots locais permanentes no rack
- jogador move pecas reais livremente entre pecas e slots
- slots nascem sem vinculo inicial com o tabuleiro

### Etapa 3 — reordenacao fluida com slots e pecas
Objetivo:
- manter reordenacao local funcionando com itens mistos
- preservar reordenacao em grupo para pecas reais selecionadas
- tornar a manipulacao no rack previsivel e user friendly

Saida esperada:
- grupo de pecas continua movel
- slots continuam moviveis
- nenhuma dessas operacoes afeta backend

### Etapa 4 — rascunho local nos slots
Objetivo:
- permitir letra de rascunho em slot local
- manter esse rascunho 100% fora do submit oficial

Saida esperada:
- slot pode receber letra de rascunho
- draft continua apenas local

### Etapa 5 — associacao local do slot ao tabuleiro
Objetivo:
- permitir que o jogador clique em um slot local e depois em uma peca/casa do tabuleiro
- registrar essa associacao apenas no frontend
- manter a associacao reversivel e nao oficial

Saida esperada:
- slot pode guardar associacao local com o tabuleiro
- associacao continua fora do backend

### Etapa 6 — preservar submit oficial
Objetivo:
- garantir que slots, drafts e associacoes locais nunca contaminem o submit real

Saida esperada:
- `placedTilesPreview` permanece correto
- submit continua aceitando apenas pecas reais

### Etapa 7 — refino visual minimo
Objetivo:
- diferenciar melhor:
  - peca real
  - slot local
  - letra de rascunho
  - associacao local com o tabuleiro
- manter legibilidade da mesa de composicao

## 8. Fora de escopo neste plano

Nao entra nesta implementacao:
- drag rack -> board
- reserva de letra do tabuleiro
- reserva de casa do tabuleiro
- associacao local tratada como reserva oficial
- alteracao do contrato de wildcard
- alteracao do submit oficial
- alteracao do backend


## 9. Riscos que devem ser evitados

- misturar slot local com peca real
- quebrar selecao multipla ja validada
- quebrar reordenacao em grupo ja validada
- deixar slot entrar em `placedTilesPreview`
- deixar draft local interferir em wildcard real
- acoplar composicao local ao board oficial
- tratar associacao local com o tabuleiro como estado oficial

## 10. Checklist de validacao

### Build
- frontend build verde

### Browser
- host ve rack normalmente fora do turno
- guest ve rack normalmente no turno
- selecao simples continua funcionando
- selecao multipla continua funcionando
- reordenacao em grupo continua funcionando
- slots locais permanentes existem na composicao
- slots podem receber letra de rascunho
- slots nascem sem vinculo inicial com o tabuleiro
- associacao local do slot ao tabuleiro nao altera backend
- submit continua ignorando slots locais
- submit continua ignorando drafts

## 11. Fechamento correto desta frente

A frente so deve ser encerrada quando:
- build passar
- browser validation passar
- commit/push/logstep forem executados
- for avaliado se continuity package precisa refletir a nova capacidade

## 12. Limites deste plano

Este plano:
- nao substitui o contrato de UX
- nao redefine engine
- nao redefine backend
- nao redefine RPC
- nao redefine fluxo oficial do board

Fim do documento.
