# PATXANGA — ROOM RESTART PROMPT
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE

## 1. Objetivo

Este documento serve para retomada rápida de trabalho em nova sala,
especialmente após crash, truncamento de resposta ou perda de contexto operacional.

## 2. Ordem obrigatória de leitura na retomada

1. `docs/continuity-package-v1.6.md`
2. snapshot master vigente
3. `docs/15-local-ops-and-collaboration-protocol.md`
4. `docs/12-submit-move-contract.md`
5. contratos curtos de frontend relevantes
6. este arquivo

## 3. Regras obrigatórias de operação

- preservar arquitetura existente
- não reabrir decisões congeladas sem motivo técnico forte
- migrations são a fonte oficial do banco
- nunca usar SQL manual como solução final
- separar rigidamente `user_id` e `player_id`
- backend é server-authoritative
- UUID por peça é obrigatório
- replay/auditoria devem ser preservados
- sempre fechar marcos importantes com:
  - `git add`
  - `git commit -m "..."`
  - `git push`
  - `logstep`

## 4. Regras práticas da sala

- evitar documentos longos gerados direto em chat
- preferir `python3` para escrever arquivos markdown ricos
- usar heredoc apenas para arquivos curtos e simples
- quando houver chance de truncamento, quebrar em arquivos menores
- validar sempre o arquivo no terminal antes de assumir sucesso
- para frontend, rodar `npm run build` antes de considerar bloco concluído

## 5. Estado atual resumido

Estado já validado:
- bootstrap real frontend-backend da match
- board read-only renderizado
- rack real renderizado
- selecao local de peças
- preview local de posicionamento no board
- preview local de `p_placed_tiles`
- submit real inicial de jogada na home
- ramo `accepted` de `submit_patxanga_move(...)` validado pela UI

## 6. Próximo passo recomendado

Próximo bloco prioritário:
- validar o ramo `pending_vote` pela UI

## 7. Comandos iniciais de inspeção recomendados

Comandos sugeridos:
- `cd ~/patxanga-bootstrap/patxanga-core`
- `git status --short`
- `sed -n '1,260p' docs/continuity-package-v1.6.md`
- `find frontend -maxdepth 3 -type f | sort`

## 8. Riscos operacionais já observados

- respostas longas podem truncar nesta interface
- terminal pode entrar em continuação (`>....`) se comando vier incompleto
- erro aparente de renderização pode ser, na verdade, arquivo não gravado
- arquivos legados podem continuar compilando e quebrar o build
- não assumir que melhoria de UI dispensa validação por build
- não assumir que `user_id` pode ser usado em RPC de gameplay

## 9. Frase curta de retomada recomendada

Vou te enviar, nesta ordem: `docs/continuity-package-v1.6.md`, snapshot master vigente, `docs/15-local-ops-and-collaboration-protocol.md`, `docs/12-submit-move-contract.md`, contratos curtos de frontend relevantes e `docs/16-room-restart-prompt-v1.0.md`. Retome Patxanga a partir desses documentos, preserve a arquitetura vigente e continue do ponto atual: bootstrap real frontend-backend validado, submit real inicial de jogada já integrado e ramo `accepted` já validado pela UI. Próximo foco: validar `pending_vote` pela UI.
