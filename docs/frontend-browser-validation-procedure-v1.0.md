# PATXANGA — Frontend Browser Validation Procedure
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE

Base normativa:
- snapshot master vigente
- continuity package vigente
- docs/15-local-ops-and-collaboration-protocol.md
- contratos curtos de frontend vigentes

## 1. Objetivo

Padronizar a validacao manual no browser para marcos de frontend do Patxanga,
especialmente quando houver mudanca de UX local, composicao visual da tela,
fluxo de preparo de jogada, rack ou votacao.

## 2. Regra central

Build verde nao substitui validacao no browser.

A ordem correta para marcos de frontend com impacto visual/interacional e:

1. aplicar patch
2. validar build
3. validar no browser
4. so depois decidir commit
5. push
6. logstep
7. avaliar se o kit de continuidade precisa ser atualizado

## 3. Ambiente padrao

- frontend local servido em `http://localhost:3001`
- repo local em `~/patxanga-bootstrap/patxanga-core`
- `project-log.md` e `logstep.sh` no diretorio pai `~/patxanga-bootstrap`

## 4. Confirmacao do frontend local

Antes de abrir o browser:

```bash
cd ~/patxanga-bootstrap/patxanga-core
lsof -nP -iTCP:3001 -sTCP:LISTEN
curl -I http://localhost:3001
```

## 5. Registro da rodada

Toda rodada deve registrar:
- `match_id`
- `user_id`
- objetivo da rodada

Registro recomendado:

```bash
cd ~/patxanga-bootstrap/patxanga-core
printf "\n### rodada browser %s\nmatch_id=COLE_AQUI\nuser_id=COLE_AQUI\nobjetivo=COLE_AQUI\n" "$(date "+%Y-%m-%d %H:%M:%S")" >> tmp/browser-validation-notes.txt
tail -n 20 tmp/browser-validation-notes.txt
```

## 6. Fluxo padrao de validacao

### 6.1 Abrir a aplicacao

```bash
open http://localhost:3001
```

Depois fazer hard refresh:
- `Cmd + Shift + R`

### 6.2 Carregar a partida

Na UI:
- preencher `match_id`
- preencher `user_id`
- carregar/bootstrap da partida

### 6.3 Validar bootstrap

Confirmar:
- a tela carregou sem erro
- board apareceu quando aplicavel
- rack apareceu quando aplicavel
- estado da match esta legivel
- turno atual esta legivel

## 7. Ordem padrao de validacao por rodada

### Rodada A — bootstrap
Validar:
- carregamento da match
- estado renderizado
- board/rack sem crash

### Rodada B — UX local do rack
Validar, conforme o marco:
- selecao simples
- selecao multipla
- reordenacao
- reordenacao em grupo
- lacunas locais
- rascunho local nas lacunas
- cronometro visual
- destaque de turno

### Rodada C — preview e preparo local de jogada
Validar:
- selecao de pecas
- preview no board
- limpeza do preview
- estabilidade visual

### Rodada D — submit real
Validar:
- submit continua funcionando
- backend continua como fonte de verdade
- UX local nao contaminou payload nem estado oficial

## 8. Checklist padrao

```text
match_id:
user_id:
objetivo:

resultado:
- status exibido:
- bootstrap carregou:
- board apareceu:
- rack apareceu:
- comportamento esperado:
- comportamento observado:
- submit continua ok:
- erro visual/console, se houver:
```

## 9. Regra de fechamento

Um marco de frontend so pode ser considerado pronto quando:
- o diff esta isolado
- o build passou
- a validacao no browser passou
- o resultado foi explicitamente descrito
- o versionamento foi executado
- o `project-log.md` foi atualizado via `logstep.sh`
- foi feita avaliacao formal sobre atualizar ou nao o kit de continuidade

## 10. Continuidade entre salas

Este procedimento deve ser repassado a novas salas quando:
- houver continuidade de UX/frontend
- houver rodada de validacao manual em browser
- houver necessidade de repetir testes com `match_id` e `user_id`

Fim do documento.
