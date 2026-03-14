#!/usr/bin/env bash
set -euo pipefail

cd ~/patxanga-bootstrap/patxanga-core

OUT="docs/18-room-baton-package-current.md"

{
  echo "# PATXANGA — Room Baton Package (Current)"
  echo "Generated at: $(date '+%Y-%m-%d %H:%M:%S')"
  echo

  echo "## PROMPT INTERNO DE ATIVACAO DE CONTINUIDADE"
  echo
  echo "Voce esta retomando o projeto Patxanga em uma sala de continuidade operacional."
  echo "Seu papel e atuar como agente de continuidade tecnica e operacional, preservando de forma rigorosa:"
  echo "- seguranca do processo"
  echo "- rastreabilidade"
  echo "- versionamento correto"
  echo "- documentacao viva"
  echo "- validacao antes de alteracao"
  echo "- coerencia entre frontend, backend e operacao"
  echo
  echo "Regras imutaveis desta atuacao:"
  echo "1. nao assumir estado nao verificado"
  echo "2. confirmar branch, commits recentes e ../project-log.md antes de propor mudancas"
  echo "3. tratar branch + commits pushados + ../project-log.md como fonte de verdade mais forte que a documentacao"
  echo "4. localizar o trecho real do codigo antes de alterar"
  echo "5. implementar incrementalmente, sem atalhos"
  echo "6. validar build/teste antes de versionar"
  echo "7. manter documentacao, log operacional e versionamento sincronizados"
  echo "8. nao misturar frentes sensiveis sem auditoria consciente"
  echo "9. quando necessario, pedir primeiro os comandos e arquivos complementares para inicializacao correta"
  echo
  echo "Seu objetivo inicial nao e programar imediatamente."
  echo "Seu objetivo inicial e se inicializar corretamente, compreender o estado real do projeto e so entao atuar."
  echo

  echo "## FRASE DE ENTRADA DA NOVA SALA"
  echo
  echo "Voce esta assumindo a continuidade do projeto Patxanga, um jogo por turnos com backend authoritative, frontend em evolucao orientada a produto e processo operacional rigoroso de continuidade, rastreabilidade, documentacao, versionamento e validacao."
  echo "Seu papel nesta sala e preservar e estender esse trabalho sem perder contexto, sem assumir estado nao verificado e sem romper o processo estabelecido."
  echo "A continuidade do projeto e condicao imutavel desta atuacao."
  echo "Antes de qualquer proposta ou alteracao, voce deve pedir o arquivo unico de passagem de bastao com instrucoes detalhadas e, a partir dele, se inicializar corretamente."
  echo "So depois disso voce podera pedir os comandos e arquivos complementares necessarios para validar branch, commits, logs, documentacao, estado operacional e frente atual."
  echo

  echo "## ESTADO OPERACIONAL GERADO"
  echo
  echo "### git status --short --branch"
  echo '```'
  git status --short --branch
  echo '```'
  echo
  echo "### git remote -v"
  echo '```'
  git remote -v
  echo '```'
  echo
  echo "### git log --oneline --decorate -n 15"
  echo '```'
  git log --oneline --decorate -n 15
  echo '```'
  echo
  echo "### tail -n 60 ../project-log.md"
  echo '```'
  tail -n 60 ../project-log.md
  echo '```'
  echo

  echo "## AMBIENTE OPERACIONAL ATUAL"
  echo
  echo "- sistema operacional do operador: macOS"
  echo "- shell padrao: zsh"
  echo "- operador trabalha via terminal do Mac"
  echo "- browser local e usado para validacao manual"
  echo "- frontend local servido em http://localhost:3001"
  echo "- repo local em ~/patxanga-bootstrap/patxanga-core"
  echo "- project-log.md e logstep.sh em ~/patxanga-bootstrap"
  echo "- container principal local: supabase_db_patxanga-core"
  echo

  echo "## MODO DE TRABALHO COM O OPERADOR"
  echo
  echo "- o operador executa comandos no terminal do Mac"
  echo "- a IA deve preparar comandos e scripts prontos para colar"
  echo "- evitar edicao manual de arquivos"
  echo "- preferir inspecao antes de patch"
  echo "- quando houver varios passos, entregar sequencia operacional curta"
  echo "- validar build e/ou teste antes de versionar"
  echo "- ao fim de cada marco importante, avaliar atualizacao do kit de continuidade"
  echo

  echo "## PROCEDIMENTO DE TESTE BROWSER"
  echo
  echo "### Confirmacao do frontend local"
  echo '```bash'
  echo 'cd ~/patxanga-bootstrap/patxanga-core'
  echo 'lsof -nP -iTCP:3001 -sTCP:LISTEN'
  echo 'curl -I http://localhost:3001'
  echo '```'
  echo
  echo "### Abrir no browser"
  echo '```bash'
  echo 'cd ~/patxanga-bootstrap/patxanga-core'
  echo 'open http://localhost:3001'
  echo '```'
  echo "Depois fazer hard refresh com Cmd + Shift + R."
  echo
  echo "### Registro de rodada"
  echo '```bash'
  echo 'cd ~/patxanga-bootstrap/patxanga-core'
  echo 'printf "\n### rodada browser %s\nmatch_id=COLE_AQUI\nuser_id=COLE_AQUI\nobjetivo=COLE_AQUI\n" "$(date "+%Y-%m-%d %H:%M:%S")" >> tmp/browser-validation-notes.txt'
  echo 'tail -n 20 tmp/browser-validation-notes.txt'
  echo '```'
  echo

  echo "## PROCEDIMENTO DE CRIACAO DE PARTIDA DE TESTE"
  echo
  echo "### Criar host, guest e match de teste"
  echo '```bash'
  echo "cd ~/patxanga-bootstrap/patxanga-core && docker exec -i supabase_db_patxanga-core psql -U postgres -d postgres <<'SQL'"
  echo '\pset tuples_only on'
  echo '\pset format unaligned'
  echo
  echo 'with host_seed as ('
  echo '  select gen_random_uuid() as host_user_id'
  echo '), created as ('
  echo '  select'
  echo '    host_seed.host_user_id,'
  echo '    public.create_patxanga_match('
  echo '      p_host_user_id := host_seed.host_user_id,'
  echo "      p_host_guest_name := 'Host Local',"
  echo "      p_language := 'pt-BR',"
  echo "      p_match_mode := 'synchronous',"
  echo '      p_max_players := 2'
  echo '    ) as match_id'
  echo '  from host_seed'
  echo '), guest_seed as ('
  echo '  select gen_random_uuid() as guest_user_id'
  echo '), joined as ('
  echo '  select'
  echo '    created.host_user_id,'
  echo '    guest_seed.guest_user_id,'
  echo '    created.match_id,'
  echo '    public.join_patxanga_match('
  echo '      p_match_id := created.match_id,'
  echo '      p_user_id := guest_seed.guest_user_id,'
  echo "      p_guest_name := 'Guest Local',"
  echo '      p_is_bot := false,'
  echo '      p_bot_level := null,'
  echo '      p_bot_profile := null'
  echo '    ) as guest_player_id'
  echo '  from created'
  echo '  cross join guest_seed'
  echo '), started as ('
  echo '  select'
  echo '    joined.host_user_id,'
  echo '    joined.guest_user_id,'
  echo '    joined.match_id,'
  echo '    public.start_patxanga_match(joined.match_id) as started_payload'
  echo '  from joined'
  echo ')'
  echo "select 'host_user_id=' || host_user_id::text from started"
  echo 'union all'
  echo "select 'guest_user_id=' || guest_user_id::text from started"
  echo 'union all'
  echo "select 'match_id=' || match_id::text from started;"
  echo 'SQL'
  echo '```'
  echo
  echo "### Uso na UI"
  echo "- abrir http://localhost:3001"
  echo "- preencher match_id"
  echo "- usar host_user_id para validar host"
  echo "- usar guest_user_id para validar guest"
  echo

  for file in \
    docs/17-continuity-activation-brief-v1.0.md \
    docs/16-room-restart-prompt-v1.0.md \
    docs/continuity-package-v1.6.md \
    docs/99-context-snapshot-master-v1.6.md \
    docs/15-local-ops-and-collaboration-protocol.md \
    docs/frontend-browser-validation-procedure-v1.0.md \
    docs/frontend-contract-screen-actions-v1.0.md \
    docs/frontend-contract-match-states-v1.0.md \
    docs/frontend-contract-rpcs-v1.0.md \
    docs/frontend-rack-composition-ux-v1.0.md \
    docs/frontend-rack-composition-implementation-plan-v1.0.md \
    docs/18-room-baton-process-v1.0.md
  do
    if [ -f "$file" ]; then
      echo "## FILE: $file"
      echo
      cat "$file"
      echo
    fi
  done

  echo "## FRASE PADRAO DE PASSAGEM DE BASTAO"
  echo
  echo "ATENCAO: VOCE esta assumindo a continuidade do projeto Patxanga, no qual a continuidade e condicao imutavel da atuacao. Aja como responsavel tecnico de continuidade: analise antes de alterar, confirme estado real antes de concluir, preserve seguranca, rastreabilidade, documentacao, versionamento e validacao, e trabalhe de forma incremental, sem atalhos e sem assumir contexto nao verificado. Peca explicitamente o arquivo docs/18-room-baton-package-current.md para receber diretivas, contexto operacional e status atualizado do projeto e, no ambiente local deste operador, solicite que ele rode o comando cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit docs/18-room-baton-package-current.md para abrir o arquivo no Mac. So depois disso VOCE deve validar branch, commits recentes, ../project-log.md e os comandos/arquivos complementares de inicializacao. O arquivo deve ser atualizado sempre que o operador solicitar ou sempre que houver mudanca relevante suficiente para impactar a retomada segura."
} > "$OUT"

echo "Arquivo gerado em $OUT"
