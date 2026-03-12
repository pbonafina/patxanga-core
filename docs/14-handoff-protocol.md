# ============================================================
# PATXANGA — HANDOFF PROTOCOL
# Version: 1.0 (Frozen)
# ============================================================

Este documento define o protocolo oficial de continuidade do projeto
Patxanga entre diferentes chats de IA.

Ele complementa:

- Context Snapshot Master v1.0
- Submit Move Contract v1.0
- Operational Log Policy v1.0

Nenhum novo chat deve iniciar desenvolvimento técnico sem seguir este protocolo.

---

# 1. OBJETIVO

Garantir:

- continuidade sem perda de contexto
- preservação da arquitetura
- prevenção de deriva criativa da IA
- disciplina operacional
- rastreabilidade completa

---

# 2. ORDEM OBRIGATÓRIA DE USO EM NOVO CHAT

A sequência deve ser EXATAMENTE esta:

1. Colar PROMPT MESTRE v3 completo.
2. Colar CONTEXT SNAPSHOT MASTER v1.0 completo.
3. Colar SUBMIT MOVE CONTRACT v1.0 completo.
4. Solicitar confirmação de leitura.
5. Aguardar confirmação.
6. Somente então solicitar implementação.

Nenhuma etapa pode ser pulada.

---

# 3. CONFIRMAÇÃO OBRIGATÓRIA DA IA

A primeira resposta da nova IA deve:

- Confirmar leitura dos documentos.
- Listar pontos estratégicos imutáveis.
- Listar regras arquiteturais.
- Listar regras operacionais.
- Declarar que não fará alterações estruturais sem aprovação.
- Não implementar nada.

Se qualquer desses itens faltar, interromper e corrigir.

---

# 4. SOLICITAÇÃO DE IMPLEMENTAÇÃO

Após confirmação satisfatória, solicitar implementação especificando:

- Nome da função.
- Escopo exato.
- Obrigatoriedade de:
  - arquivo completo
  - caminho relativo
  - conteúdo integral
  - comandos de terminal
  - git add
  - git commit
  - git push
  - registro no project-log.md
  - confirmação antes de avançar

Nenhum diff parcial.
Nenhum pseudocódigo.
Nenhum trecho isolado.

---

# 5. CRITÉRIOS DE BLOQUEIO IMEDIATO

Interromper a IA se ela tentar:

- Remover UUID por peça.
- Confiar em cálculo do cliente.
- Mover lógica para frontend.
- Simplificar board_state.
- Reduzir replay.
- Alterar arquitetura.
- Dividir RPC atômica.
- Omitir votação quando aplicável.
- Pular log ou commit.
- Gerar apenas diff.

---

# 6. ENCERRAMENTO DE ETAPA

Uma etapa só é considerada concluída quando:

1. Código aplicado.
2. Commit realizado.
3. Push realizado.
4. Log registrado.
5. git status limpo.

Sem isso, não avançar.

---

# 7. EVOLUÇÃO DO PROTOCOLO

Qualquer alteração neste protocolo deve:

- gerar nova versão
- indicar seção alterada
- indicar texto antigo
- indicar texto novo
- justificar tecnicamente

Sem aprovação explícita, a nova versão não entra em vigor.

---

# FIM DO DOCUMENTO