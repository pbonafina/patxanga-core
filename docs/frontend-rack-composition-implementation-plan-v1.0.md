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
- inserir lacunas locais entre posicoes da composicao
- mover lacunas junto da composicao local
- escrever letras de rascunho nas lacunas
- continuar enviando jogadas reais sem contaminar o submit


## 4. Arquivos principais afetados

### 4.1 `frontend/pages/index.tsx`
Responsabilidades nesta frente:
- manter estado local da superficie de composicao do rack
- coordenar selecao de pecas reais
- coordenar lacunas locais
- coordenar drafts locais de letras nas lacunas
- preservar geracao correta de `placedTilesPreview`
- garantir que lacunas nao entrem em submit

### 4.2 `frontend/components/RackSection.tsx`
Responsabilidades nesta frente:
- renderizar pecas reais e lacunas locais na mesma superficie visual
- permitir reordenacao local coerente
- permitir edicao da letra de rascunho
- permitir remocao local de lacunas
- manter clareza visual entre item real e item local

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
  - lacuna local

Exemplo conceitual:
- `{ kind: "tile", tileId: "..." }`
- `{ kind: "gap", gapId: "..." }`

Estado adicional:
- drafts por lacuna
- selecao atual de pecas reais
- ordem local da superficie de composicao

## 6. Invariantes obrigatorios

- peca real continua identificada por `tileId`
- lacuna local continua sem existencia no backend
- submit oficial continua ignorando lacunas
- submit oficial continua ignorando drafts
- `placedTilesPreview` continua derivado apenas de pecas reais colocadas no board
- reidratacao oficial pode descartar estado local temporario


## 7. Etapas de implementacao

### Etapa 1 — normalizar a superficie local do rack
Objetivo:
- substituir a ordem local baseada apenas em ids por uma ordem local baseada em itens de composicao

Saida esperada:
- rack local aceita itens reais e lacunas

### Etapa 2 — inserir lacuna entre duas pecas selecionadas
Objetivo:
- permitir criacao de lacuna entre duas pecas reais escolhidas na composicao local
- eliminar ambiguidade de criar lacuna a esquerda/direita de uma peca unica
- deixar de depender apenas de “adicionar lacuna no fim”

Saida esperada:
- jogador consegue selecionar exatamente duas pecas reais
- jogador consegue abrir lacuna entre essas duas pecas na ordem local atual
- a lacuna nasce sem vinculo inicial com o tabuleiro

### Etapa 3 — mover lacunas e grupos de forma coerente
Objetivo:
- manter reordenacao local funcionando com itens mistos
- preservar reordenacao em grupo para pecas reais selecionadas

Saida esperada:
- grupo de pecas continua movel
- lacuna continua movel
- nenhuma dessas operacoes afeta backend

### Etapa 4 — preservar submit oficial
Objetivo:
- garantir que lacunas e drafts nunca contaminem o submit real

Saida esperada:
- `placedTilesPreview` permanece correto
- submit continua aceitando apenas pecas reais

### Etapa 5 — refino visual minimo
Objetivo:
- diferenciar melhor:
  - peca real
  - lacuna local
  - letra de rascunho
- manter legibilidade da mesa de composicao

## 8. Fora de escopo neste plano

Nao entra nesta implementacao:
- drag rack -> board
- reserva de letra do tabuleiro
- reserva de casa do tabuleiro
- alteracao do contrato de wildcard
- alteracao do submit oficial
- alteracao do backend


## 9. Riscos que devem ser evitados

- misturar item local de lacuna com peca real
- quebrar selecao multipla ja validada
- quebrar reordenacao em grupo ja validada
- deixar lacuna entrar em `placedTilesPreview`
- deixar draft local interferir em wildcard real
- acoplar composicao local ao board oficial

## 10. Checklist de validacao

### Build
- frontend build verde

### Browser
- host ve rack normalmente fora do turno
- guest ve rack normalmente no turno
- selecao simples continua funcionando
- selecao multipla continua funcionando
- reordenacao em grupo continua funcionando
- lacuna pode ser criada entre duas pecas reais selecionadas
- lacuna pode receber letra de rascunho
- lacuna nasce sem vinculo inicial com o tabuleiro
- submit continua ignorando lacunas
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
