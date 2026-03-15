# PATXANGA — Room Baton Process
Version: 1.0
Status: ACTIVE OPERATIONAL BASELINE

## 1. Objetivo

Padronizar a passagem de bastao para novas salas de forma robusta,
previsivel, rastreavel e segura.

## 2. Regra central

A nova sala nao deve receber contexto fragmentado como forma principal
de inicializacao.

A passagem de bastao deve usar:
- uma frase de entrada padrao
- um arquivo unico de passagem de bastao
- uma escolha explicita entre modos de atuacao apos a leitura inicial do pacote
- um protocolo de retomada na mesma sala apos interrupcao
- validacao posterior de branch, commits e `../project-log.md`

## 3. Frase de entrada da nova sala

Texto base:

ATENCAO: VOCE esta assumindo a continuidade do projeto Patxanga. Nao assuma
contexto, nao altere nada antes de verificar o estado real e trate
continuidade, rastreabilidade, seguranca, validacao e documentacao como
requisitos obrigatorios. Peca explicitamente o arquivo
`docs/18-room-baton-package-current.md` para receber diretivas, contexto
operacional e status atualizado do projeto e, no ambiente local deste
operador, solicite que ele rode o comando
`cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit docs/18-room-baton-package-current.md`
para abrir o arquivo no Mac.

Depois da leitura inicial do pacote de bastao, apresente obrigatoriamente ao
operador uma escolha explicita entre tres modos de atuacao: `PADRAO`, `GATE`
e `GATE_CHECKLIST`. Explique cada modo em uma linha, recomende `PADRAO` como
opcao default e aguarde a decisao do operador antes de prosseguir.

Definido o modo, valide branch atual, `HEAD`, upstream, commits recentes,
`../project-log.md`, working tree, ambiente operacional, ultimo build/teste
validado e artefatos de inicializacao com o rigor correspondente ao modo
escolhido. Se houver divergencia entre memoria, conversa, documentacao e
repositorio local, o estado local verificado prevalece. O arquivo
`docs/18-room-baton-package-current.md` deve ser atualizado sempre que o
operador solicitar ou sempre que houver mudanca relevante suficiente para
impactar a retomada segura.

### 3.1 Modos de atuacao da nova sala

- `PADRAO` (Recomendado): continuidade normal, com validacao objetiva do estado
  real e seguimento mais agil.
- `GATE`: nenhuma conclusao, plano fechando assunto ou alteracao antes de uma
  checagem forte do estado real.
- `GATE_CHECKLIST`: igual ao `GATE`, mas com resposta inicial obrigatoriamente
  estruturada em checklist operacional.

Bloco obrigatorio que a nova sala deve apresentar ao operador apos ler o
pacote:

- `PADRAO` (Recomendado): continuidade normal, com validacao objetiva do estado real e seguimento mais agil.
- `GATE`: nenhuma conclusao, plano fechando assunto ou alteracao antes de uma checagem forte do estado real.
- `GATE_CHECKLIST`: igual ao `GATE`, mas com resposta inicial obrigatoriamente estruturada em checklist operacional.

Pergunta obrigatoria:
`Escolha o modo de atuacao para esta sala: PADRAO, GATE ou GATE_CHECKLIST.`

### 3.2 Resposta obrigatoria quando o modo for GATE_CHECKLIST

- arquivo de bastao lido
- branch atual
- `HEAD` atual
- upstream
- ultimos commits relevantes
- estado do working tree
- ultimo build validado
- ultimos testes validados
- frente atual
- riscos ou bloqueios
- divergencias encontradas
- status do pacote de bastao: atualizado ou precisa refresh

### 3.3 Retomada na mesma sala apos interrupcao

Quando houver interrupcao na mesma sala, nao se deve confiar em memoria
implícita da conversa como fonte unica de continuidade.

A retomada deve usar:
- checkpoint curto registrado pelo assistente durante a atuacao
- historico da conversa
- estado real verificado do working tree e dos arquivos em foco
- build/teste ja concluido e confirmado

Frase padrao de retomada na mesma sala:
`RETOMADA MESMA SALA: recupere o ultimo checkpoint confirmado, diferencie o que ficou concluido do que ficou pendente, revalide qualquer acao que possa ter sido interrompida e continue apenas a partir do estado real verificado.`

Conteudo minimo do checkpoint curto:
- modo ativo
- objetivo atual
- ultimo passo confirmado como concluido
- ponto pendente ou interrompido
- arquivos em foco
- ultima validacao confirmada
- proximo passo

Resposta obrigatoria da IA apos a frase de retomada:
- modo ativo
- objetivo atual
- ultimo ponto confirmado
- ponto incerto ou interrompido
- arquivos em foco
- ultima validacao confirmada
- proximo passo


## 4. Prompt interno no topo do arquivo unico

O arquivo unico de passagem de bastao deve comecar com um prompt interno
de ativacao de continuidade.

Esse prompt deve orientar a nova sala a:
- agir como agente de continuidade tecnica e operacional
- nao assumir estado nao verificado
- confirmar branch, commits recentes e `../project-log.md`
- tratar branch + commits pushados + `../project-log.md` como fonte de verdade
  mais forte que a documentacao, em caso de divergencia
- localizar o trecho real do codigo antes de alterar
- implementar incrementalmente
- validar build/teste antes de versionar
- manter documentacao, log operacional e versionamento sincronizados

## 5. Precedencia entre fontes

A ordem correta de leitura e:
1. branch atual + commits pushados + `../project-log.md`
2. arquivo unico de passagem de bastao
3. contratos e documentos operacionais versionados
4. snapshot/context package mais recente
5. codigo local nao commitado apenas como contexto, nunca como verdade automatica

## 6. Artefatos obrigatorios do processo

O processo deve gerar e manter:
- `docs/18-room-baton-process-v1.0.md`
- `docs/18-room-baton-package-current.md`
- `docs/current-development-continuity-spec-v1.0.md`
- `generate-room-baton-package.sh`

## 7. Conteudo minimo do arquivo unico

O arquivo unico deve consolidar:
- prompt interno de ativacao
- estado operacional atual
- branch, remote, commits recentes
- working tree atual
- trechos recentes do `project-log.md`
- ambiente operacional atual do projeto
- modo de trabalho com o operador
- procedimentos de teste
- procedimento de criacao de partida de teste
- modos de atuacao e bloco de escolha obrigatorio
- protocolo de retomada na mesma sala apos interrupcao
- contratos ativos essenciais
- especificacao viva do ponto atual do desenvolvimento
- frente atual e proximos passos
- frase padrao de passagem de bastao

### 7.1 Ambiente operacional atual do projeto

Deve constar explicitamente:
- sistema operacional atual do operador
- uso via terminal do Mac
- browser local para validacao manual
- frontend local em `http://localhost:3001`
- repo em `~/patxanga-bootstrap/patxanga-core`
- `project-log.md` e `logstep.sh` em `~/patxanga-bootstrap`

### 7.2 Modo de trabalho com o operador

Deve constar explicitamente:
- o operador executa comandos no terminal
- a IA prepara comandos e scripts
- evitar edicao manual de arquivos
- preferir inspecao antes de patch
- validar build/teste antes de versionar

### 7.3 Procedimento de criacao de partida de teste

Deve constar explicitamente:
- como criar uma match local de teste
- quando a pagina suportar, como gerar cenarios reais de browser diretamente pela UI
- quando houver automacao disponivel, como executar a validacao Playwright em ambiente isolado
- quando houver automacao Playwright, que ela usa `distDir` isolado para nao contaminar o `next build`
- quando houver suites SQL reutilizaveis, como executar `zsh scripts/run-sql-test-suite.sh lobby_ops|engine_regression|all`
- como obter `match_id`
- como obter `host_user_id`
- como obter `guest_user_id`
- como usar esses ids na validacao browser
- quando houver suporte na pagina de teste, como registrar esses ids na secao `Alternar host e guest` para trocar de papel sem recolar UUIDs


## 8. Regra de atualizacao do arquivo unico

O arquivo unico de passagem de bastao e um artefato vivo de continuidade
operacional.

Ele deve ser atualizado obrigatoriamente:
- quando solicitado pelo operador
- sempre que a IA julgar que houve mudanca relevante suficiente para impactar
  a retomada segura do projeto em nova sala

Na duvida, deve-se preferir atualizar o arquivo.

Casos tipicos de atualizacao:
- novo marco relevante commitado e pushado
- mudanca de frente principal
- novo contrato ou plano versionado
- mudanca de procedimento operacional
- novo diagnostico que altera a leitura correta do projeto
- alteracao relevante de UX ou de fluxo validado
- mudanca relevante no processo de testes

## 9. Passagem de bastao padrao

Frase oficial:

ATENCAO: VOCE esta assumindo a continuidade do projeto Patxanga. Nao assuma
contexto, nao altere nada antes de verificar o estado real e trate
continuidade, rastreabilidade, seguranca, validacao e documentacao como
requisitos obrigatorios. Peca explicitamente o arquivo
`docs/18-room-baton-package-current.md` para receber diretivas, contexto
operacional e status atualizado do projeto e, no ambiente local deste
operador, solicite que ele rode o comando
`cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit docs/18-room-baton-package-current.md`
para abrir o arquivo no Mac.

Depois da leitura inicial do pacote de bastao, apresente obrigatoriamente ao
operador uma escolha explicita entre tres modos de atuacao: `PADRAO`, `GATE`
e `GATE_CHECKLIST`. Explique cada modo em uma linha, recomende `PADRAO` como
opcao default e aguarde a decisao do operador antes de prosseguir.

Definido o modo, valide branch atual, `HEAD`, upstream, commits recentes,
`../project-log.md`, working tree, ambiente operacional, ultimo build/teste
validado e artefatos de inicializacao com o rigor correspondente ao modo
escolhido. Se houver divergencia entre memoria, conversa, documentacao e
repositorio local, o estado local verificado prevalece. O arquivo
`docs/18-room-baton-package-current.md` deve ser atualizado sempre que o
operador solicitar ou sempre que houver mudanca relevante suficiente para
impactar a retomada segura.

Bloco de escolha obrigatorio:

- `PADRAO` (Recomendado): continuidade normal, com validacao objetiva do estado real e seguimento mais agil.
- `GATE`: nenhuma conclusao, plano fechando assunto ou alteracao antes de uma checagem forte do estado real.
- `GATE_CHECKLIST`: igual ao `GATE`, mas com resposta inicial obrigatoriamente estruturada em checklist operacional.

Pergunta obrigatoria:
`Escolha o modo de atuacao para esta sala: PADRAO, GATE ou GATE_CHECKLIST.`

Resposta obrigatoria quando o modo for `GATE_CHECKLIST`:

- arquivo de bastao lido
- branch atual
- `HEAD` atual
- upstream
- ultimos commits relevantes
- estado do working tree
- ultimo build validado
- ultimos testes validados
- frente atual
- riscos ou bloqueios
- divergencias encontradas
- status do pacote de bastao: atualizado ou precisa refresh

Obrigacao operacional da IA:
- reapresentar essa frase periodicamente na propria conversa com o operador
- reapresentar essa frase obrigatoriamente apos marcos importantes
- apresentar a escolha entre `PADRAO`, `GATE` e `GATE_CHECKLIST` logo apos a
  leitura inicial do pacote
- manter checkpoints curtos durante marcos relevantes para permitir retomada
  segura na mesma sala
- considerar essa reapresentacao parte imutavel do protocolo de continuidade

## 10. Fechamento

Este processo deve ser usado como base oficial para transicao entre salas
enquanto o projeto depender de continuidade assistida.

Fim do documento.
