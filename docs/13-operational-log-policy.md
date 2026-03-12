# ============================================================
# PATXANGA — OPERATIONAL LOG POLICY
# Version: 1.0 (Frozen)
# ============================================================

Este documento define a política oficial de logs do projeto Patxanga.

Ele complementa:

- Context Snapshot Master v1.0
- Submit Move Contract v1.0

Nenhuma etapa técnica é considerada concluída sem cumprimento desta política.

---

# 1. OBJETIVO

Garantir:

- rastreabilidade completa
- continuidade entre chats
- auditabilidade
- recuperação de contexto
- disciplina operacional

---

# 2. TIPOS DE LOG

O projeto possui dois tipos de log obrigatórios:

## 2.1 project-log.md

Arquivo executivo e estruturado.

Localização:
patxanga-bootstrap/project-log.md

Função:
- registrar marcos relevantes
- registrar criação/alteração de arquivos
- registrar commits realizados
- registrar mudanças de versão
- registrar decisões estratégicas
- registrar próximos passos

Formato obrigatório de cada entrada:

## YYYY-MM-DD HH:MM

- Ação realizada:
- Arquivos envolvidos:
- Commit:
- Resultado:
- Próximo passo:

Nenhuma entrada pode ser apenas uma frase solta.

---

## 2.2 session-YYYYMMDD-HHMM.log

Log bruto do terminal gerado com:

script session-$(date +%Y%m%d-%H%M).log

Função:
- trilha técnica completa da sessão
- auditoria detalhada
- análise de erro
- recuperação de comandos executados

Este log não substitui o project-log.md.

---

# 3. REGRA DE ENCERRAMENTO DE ETAPA

Uma etapa só é considerada concluída quando:

1. Arquivo foi criado ou atualizado.
2. git add executado.
3. git commit executado.
4. git push executado.
5. Entrada registrada no project-log.md.
6. git status retorna working tree clean.

Se qualquer um desses itens faltar, a etapa NÃO está concluída.

---

# 4. PROIBIÇÕES

Não é permitido:

- pular registro no project-log.md
- realizar múltiplas alterações sem log intermediário
- gerar código sem orientar commit
- assumir que algo foi versionado sem confirmação
- encerrar sessão sem garantir rastreabilidade

---

# 5. CONTINUIDADE ENTRE CHATS

O project-log.md é documento oficial de continuidade.

Sempre que iniciar novo chat:

- revisar último registro do project-log.md
- confirmar etapa atual
- confirmar próximo passo planejado

---

# 6. EVOLUÇÃO DESTA POLÍTICA

Qualquer alteração nesta política deve:

- gerar nova versão (v1.1, v1.2, etc.)
- indicar claramente o que mudou
- justificar tecnicamente a alteração

---

# FIM DO DOCUMENTO