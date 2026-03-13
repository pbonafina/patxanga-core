# PATXANGA — LOCAL OPS AND COLLABORATION PROTOCOL
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE

## 1. Objetivo

Este documento registra o protocolo operacional local e o método de colaboração
adotado para o projeto Patxanga nesta fase.

Ele existe para reduzir retrabalho, evitar comandos ambíguos, manter continuidade
e padronizar a criação de arquivos, validações e versionamento local.

## 2. Ambiente local oficial

- Sistema operacional: macOS
- Shell padrão: zsh
- Diretório de trabalho do projeto: `~/patxanga-bootstrap/patxanga-core`
- Repositório Git local: `~/patxanga-bootstrap/patxanga-core`

## 3. Fluxo local oficial de banco

Comando padrão de reconstrução local:

```bash
cd ~/patxanga-bootstrap/patxanga-core && supabase db reset
```

Regras obrigatórias:

- o banco deve ser reconstruído exclusivamente via migrations
- migrations são a fonte oficial de reconstrução do banco
- nunca usar SQL manual fora de migration como solução final

## 4. Container local padrão

Container principal de Postgres/Supabase:

- `supabase_db_patxanga-core`

## 5. Forma padrão de rodar testes SQL

Comando padrão:

```bash
cd ~/patxanga-bootstrap/patxanga-core && docker exec -i supabase_db_patxanga-core psql -U postgres < caminho/do/teste.sql
```

## 6. Forma padrão de abrir arquivos para edição local

Comando padrão:

```bash
cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit caminho/do/arquivo
```

## 7. Script local de logstep

O script local de logstep fica um nível acima do projeto.

Fluxo padrão:

```bash
cd ~/patxanga-bootstrap && ./logstep.sh "mensagem" && cd patxanga-core
```

## 8. Fluxo padrão de versionamento

Comandos padrão:

```bash
cd ~/patxanga-bootstrap/patxanga-core && git add ... && git commit -m "..." && git push
```

Regra prática:

- não assumir caminhos diferentes sem explicitar antes

## 9. Ferramentas preferenciais de validação no terminal

Quando precisar validar arquivos ou trechos de arquivo, preferir:

- `ls`
- `grep -n`
- `sed -n`
- `tail -n`
- `cat`
- `nl -ba` quando for importante inspecionar linhas com precisão

## 10. Convenções arquiteturais que devem ser preservadas

- migrations como fonte oficial do banco
- nada de SQL manual como solução final
- separação rígida entre `user_id` e `player_id`
- backend server-authoritative
- UUID individual por peça
- replay preservado
- regras estratégicas congeladas não devem ser alteradas sem motivo técnico forte e versionamento formal

## 11. Protocolo de interação operacional nesta sala

- trabalhar com o mínimo de interações possível
- preferir comandos prontos para colar no terminal do mac
- quando houver vários passos, entregar sequência operacional curta e numerada
- dizer sempre com clareza:
  - o objetivo
  - o comando exato para rodar
  - o resultado esperado
  - o próximo comando
- quando precisar de validação, pedir explicitamente para rodar um comando e colar a saída
- quando houver risco de truncamento, mudar de estratégia antes de continuar
- nunca entregar respostas fragmentadas em muitos blocos difíceis de copiar

## 12. Protocolo para criação e substituição de arquivos

Princípios gerais:

- preferir comandos completos e robustos
- para arquivos críticos, preferir pacote pronto e completo
- para documentação longa, preferir arquivos curtos ou geração por script local

### 12.1 Para geração de arquivos

- usar heredoc apenas para arquivos curtos e simples
- usar `python3` para arquivos markdown ricos, especialmente se contiverem fences, JSON, listas longas ou se houver histórico de truncamento na sala
- validar sempre o arquivo gerado com inspeção no terminal antes de concluir que houve apenas erro de renderização

### 12.2 Estratégia preferencial por tipo de arquivo

- arquivo curto e simples: heredoc pode ser aceitável
- arquivo markdown mais rico: preferir `python3` escrevendo o arquivo inteiro
- usar anexação de blocos curtos apenas quando necessário
- quando houver chance de quebra por tamanho, dividir em arquivos menores, não em blocos confusos de chat

## 13. Regras de segurança operacional para documentação e comandos

- não assumir que erro visual na interface significa apenas erro de renderização
- primeiro inspecionar o conteúdo real do arquivo no terminal
- antes de corrigir arquivo supostamente quebrado, validar o conteúdo bruto
- preferir correções precisas baseadas em inspeção real de linhas

## 14. Padrão de resposta esperado na colaboração

Formato ideal das respostas:

- diagnóstico objetivo
- recomendação objetiva
- comandos prontos para terminal
- resultado esperado
- próximo passo

## 15. Observação final

Este documento é operacional e complementar.

Ele não substitui:

- snapshot arquitetural
- contratos congelados de gameplay
- migrations oficiais
- políticas formais de log e handoff

Fim do documento.
