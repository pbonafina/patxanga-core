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
- validacao posterior de branch, commits e `../project-log.md`

## 3. Frase de entrada da nova sala

Texto base:

Voce esta assumindo a continuidade do projeto Patxanga, um jogo por turnos
com backend authoritative, frontend em evolucao orientada a produto e processo
operacional rigoroso de continuidade, rastreabilidade, documentacao,
versionamento e validacao.

Seu papel nesta sala e preservar e estender esse trabalho sem perder contexto,
sem assumir estado nao verificado e sem romper o processo estabelecido.
A continuidade do projeto e condicao imutavel desta atuacao.

Antes de qualquer proposta ou alteracao, voce deve pedir o arquivo unico de
passagem de bastao com instrucoes detalhadas e, a partir dele, se inicializar
corretamente. So depois disso voce podera pedir os comandos e arquivos
complementares necessarios para validar branch, commits, logs, documentacao,
estado operacional e frente atual.


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
- contratos ativos essenciais
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
- como obter `match_id`
- como obter `host_user_id`
- como obter `guest_user_id`
- como usar esses ids na validacao browser


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

Ao abrir nova sala:
- informar que a sala esta assumindo a continuidade do projeto Patxanga
- informar que a continuidade e condicao imutavel da atuacao
- pedir o arquivo unico de passagem de bastao
- so depois validar branch, commits recentes, `../project-log.md` e comandos
  complementares de inicializacao

## 10. Fechamento

Este processo deve ser usado como base oficial para transicao entre salas
enquanto o projeto depender de continuidade assistida.

Fim do documento.
