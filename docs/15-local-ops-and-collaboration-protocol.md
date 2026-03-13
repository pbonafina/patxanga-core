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

## 16. Regras obrigatórias de versionamento

Toda mudança relevante de arquitetura, fluxo, contrato, operação local
ou baseline documental deve resultar em arquivo versionado no repositório.

Toda mudança relevante deve terminar com a sequência operacional completa:
- `git add ...`
- `git commit -m "mensagem descritiva em português"`
- `git push`
- `cd ..`
- `./logstep.sh "mensagem"`
- `cd patxanga-core`

Regra prática:
- não considerar trabalho concluído sem indicar claramente se houve ou não versionamento
- preferir apresentar o versionamento em comandos explícitos, um por linha, no formato operacional usado no projeto
- preferir mensagens de commit descritivas em português, alinhadas ao conteúdo efetivamente alterado
- preferir mensagem de logstep curta, objetiva e compatível com a etapa concluída
- quando uma alteração exigir atualização de documento já existente, isso deve ser sinalizado explicitamente
- quando surgir novo baseline, deve ser criado ou atualizado o documento correspondente no projeto

## 17. Regras obrigatórias de continuidade entre salas

Continuidade deve ser tratada como parte do trabalho,
não como detalhe opcional.

Ao final de cada bloco importante, deve haver avaliação explícita sobre a necessidade de atualizar:
- continuity package vigente
- snapshot master vigente
- protocolo local e operacional
- contratos específicos relacionados ao tema trabalhado

Se a resposta for sim:
- preparar comandos
- preparar conteúdo
- preparar versionamento

Se a resposta for não:
- dizer explicitamente por que a atualização do kit não é necessária naquele momento

## 18. Critério prático para atualizar o kit de continuidade

A documentação de continuidade deve ser atualizada sempre que houver qualquer uma destas situações:
- nova arquitetura ou subarquitetura aprovada
- novo subsistema implementado
- mudança relevante de fluxo de produto
- novo contrato entre frontend e backend
- nova regra operacional importante
- nova limitação operacional descoberta
- novo baseline congelado
- mudança relevante no processo local de build, teste, versionamento ou colaboração

## 19. Responsabilidade ao encerrar uma etapa

Ao encerrar uma etapa importante, a resposta deve informar objetivamente:
1. estado atual do projeto
2. impacto no projeto
3. se precisa atualizar kit de continuidade: sim ou não
4. se sim, quais arquivos atualizar
5. comandos prontos para versionar
6. frase recomendada de retomada para futura sala, quando aplicável

## 20. Ordem oficial dos documentos de continuidade

A ordem oficial de referência entre salas é:
- continuity package vigente
- snapshot master vigente
- protocolo local e operacional
- contratos específicos relevantes para a sessão

## 21. Regras adicionais de continuidade

- não deixar a atualização do kit implícita
- não assumir que a atualização será lembrada manualmente depois
- não encerrar milestones sem avaliar formalmente a continuidade
- tratar continuidade como requisito de engenharia do projeto
