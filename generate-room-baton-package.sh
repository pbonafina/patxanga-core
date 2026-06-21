#!/usr/bin/env bash
set -euo pipefail

cd ~/patxanga-bootstrap/patxanga-core

OUT="docs/18-room-baton-package-current.md"
TMP_OUT="$(mktemp)"
trap 'rm -f "$TMP_OUT"' EXIT

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
  echo "10. depois da leitura inicial do pacote, apresentar ao operador uma escolha explicita entre os modos PADRAO, GATE e GATE_CHECKLIST antes de prosseguir"
  echo "11. manter checkpoints curtos em marcos relevantes para permitir retomada segura na mesma sala apos interrupcao"
  echo
  echo "Seu objetivo inicial nao e programar imediatamente."
  echo "Seu objetivo inicial e se inicializar corretamente, compreender o estado real do projeto e so entao atuar."
  echo

  echo "## FRASE DE ENTRADA DA NOVA SALA"
  echo
  echo "ATENCAO: VOCE esta assumindo a continuidade do projeto Patxanga. Nao assuma contexto, nao altere nada antes de verificar o estado real e trate continuidade, rastreabilidade, seguranca, validacao e documentacao como requisitos obrigatorios. Peca explicitamente o arquivo docs/18-room-baton-package-current.md para receber diretivas, contexto operacional e status atualizado do projeto e, no ambiente local deste operador, solicite que ele rode o comando cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit docs/18-room-baton-package-current.md para abrir o arquivo no Mac."
  echo "Depois da leitura inicial do pacote de bastao, apresente obrigatoriamente ao operador uma escolha explicita entre tres modos de atuacao: PADRAO, GATE e GATE_CHECKLIST. Explique cada modo em uma linha, recomende PADRAO como opcao default e aguarde a decisao do operador antes de prosseguir."
  echo "Definido o modo, valide branch atual, HEAD, upstream, commits recentes, ../project-log.md, working tree, ambiente operacional, ultimo build/teste validado e artefatos de inicializacao com o rigor correspondente ao modo escolhido. Se houver divergencia entre memoria, conversa, documentacao e repositorio local, o estado local verificado prevalece. O arquivo docs/18-room-baton-package-current.md deve ser atualizado sempre que o operador solicitar ou sempre que houver mudanca relevante suficiente para impactar a retomada segura."
  echo

  echo "### MODOS DE ATUACAO DA NOVA SALA"
  echo
  echo "- PADRAO (Recomendado): continuidade normal, com validacao objetiva do estado real e seguimento mais agil."
  echo "- GATE: nenhuma conclusao, plano fechando assunto ou alteracao antes de uma checagem forte do estado real."
  echo "- GATE_CHECKLIST: igual ao GATE, mas com resposta inicial obrigatoriamente estruturada em checklist operacional."
  echo
  echo "Pergunta obrigatoria:"
  echo "Escolha o modo de atuacao para esta sala: PADRAO, GATE ou GATE_CHECKLIST."
  echo
  echo "Checklist obrigatorio quando o modo for GATE_CHECKLIST:"
  echo "- arquivo de bastao lido"
  echo "- branch atual"
  echo "- HEAD atual"
  echo "- upstream"
  echo "- ultimos commits relevantes"
  echo "- estado do working tree"
  echo "- ultimo build validado"
  echo "- ultimos testes validados"
  echo "- frente atual"
  echo "- riscos ou bloqueios"
  echo "- divergencias encontradas"
  echo "- status do pacote de bastao: atualizado ou precisa refresh"
  echo

  echo "## PROTOCOLO DE RETOMADA NA MESMA SALA"
  echo
  echo "Quando houver interrupcao nesta mesma sala, a retomada nao deve confiar apenas"
  echo "na memoria implicita da conversa."
  echo
  echo "A retomada deve usar:"
  echo "- checkpoint curto registrado pelo assistente durante a atuacao"
  echo "- historico da conversa"
  echo "- estado real verificado do working tree e dos arquivos em foco"
  echo "- build/teste ja concluido e confirmado"
  echo
  echo "Frase padrao de retomada na mesma sala:"
  echo "RETOMADA MESMA SALA: recupere o ultimo checkpoint confirmado, diferencie o que ficou concluido do que ficou pendente, revalide qualquer acao que possa ter sido interrompida e continue apenas a partir do estado real verificado."
  echo
  echo "Conteudo minimo do checkpoint curto:"
  echo "- modo ativo"
  echo "- objetivo atual"
  echo "- ultimo passo confirmado como concluido"
  echo "- ponto pendente ou interrompido"
  echo "- arquivos em foco"
  echo "- ultima validacao confirmada"
  echo "- proximo passo"
  echo
  echo "Resposta obrigatoria da IA apos a frase de retomada:"
  echo "- modo ativo"
  echo "- objetivo atual"
  echo "- ultimo ponto confirmado"
  echo "- ponto incerto ou interrompido"
  echo "- arquivos em foco"
  echo "- ultima validacao confirmada"
  echo "- proximo passo"
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
  if [ -f ../project-log.md ]; then
    tail -n 60 ../project-log.md
  else
    echo "../project-log.md nao encontrado neste clone local."
  fi
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
  echo "### Validacao automatizada com Playwright"
  echo '```bash'
  echo 'cd ~/patxanga-bootstrap/patxanga-core/frontend'
  echo 'npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium'
  echo '```'
  echo "- a automacao sobe uma instancia isolada em http://127.0.0.1:3101"
  echo "- essa execucao nao interfere na porta operacional 3001"
  echo "- usar Playwright para fluxos objetivos; manter revisao humana quando houver dependencia de julgamento visual fino"
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
  echo "### Fluxo preferencial pela UI"
  echo "- abrir http://localhost:3001"
  echo '- usar a secao `Cenarios de validacao browser` e clicar `Gerar cenarios de validacao`'
  echo '- usar `Usar host` / `Usar guest` para preencher o formulario principal'
  echo '- usar `Carregar no alternador` para trocar entre host e guest sem recolar UUIDs'
  echo
  echo "### Fallback SQL para criar host, guest e match de teste"
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
  echo '- preencher match_id e user_id no formulario principal, ou usar `Usar host` / `Usar guest`'
  echo '- se disponivel, carregar os IDs na secao `Alternar host e guest` para trocar de papel sem recolar UUIDs'
  echo

  for file in \
    docs/00-index.md \
    docs/17-continuity-activation-brief-v1.0.md \
    docs/16-room-restart-prompt-v1.0.md \
    docs/continuity-package-v1.6.md \
    docs/99-context-snapshot-master-v1.6.md \
    docs/15-local-ops-and-collaboration-protocol.md \
    docs/frontend-backend-operational-contract-v1.0.md \
    docs/frontend-browser-validation-procedure-v1.0.md \
    docs/frontend-contract-screen-actions-v1.0.md \
    docs/frontend-contract-match-states-v1.0.md \
    docs/frontend-contract-rpcs-v1.0.md \
    docs/frontend-rack-composition-ux-v1.0.md \
    docs/frontend-rack-composition-implementation-plan-v1.0.md \
    docs/como-jogar-patxanga.md \
    docs/lexical-policy-v1.0.md \
    docs/dictionary-import-pipeline-v1.0.md \
    docs/implementation-roadmap.md \
    docs/07-bot-engine.md \
    docs/current-development-continuity-spec-v1.0.md \
    docs/18-room-baton-process-v1.0.md \
    scripts/prepare-dictionary-import.py \
    scripts/prepare-libreoffice-dictionary-sample.py \
    scripts/test-dictionary-import-tooling.sh \
    scripts/test-libreoffice-dictionary-sample.sh \
    scripts/import-libreoffice-pt-br-sample.sh \
    scripts/import-libreoffice-pt-pt-sample.sh \
    scripts/run-bot-simulation.sh \
    scripts/run-sql-test-suite.sh \
    sql/migrations/002_dictionary.sql \
    sql/migrations/003_dictionary_import_pipeline.sql \
    sql/rpc/import_dictionary_entries.sql \
    sql/rpc/preview_move.sql \
    sql/rpc/submit_easy_bot_turn.sql \
    sql/rpc/submit_move.sql \
    sql/rpc/validate_word.sql \
    sql/seeds/001_patxanga_distribution.sql \
    sql/seeds/002_dictionary_test_seed.sql \
    sql/seeds/003_dictionary_pt_br_core_seed.sql \
    sql/seeds/004_dictionary_pt_pt_core_seed.sql \
    sql/tests/test_dictionary_contract.sql \
    sql/tests/test_dictionary_import_pipeline.sql \
    sql/tests/test_dictionary_imported_words_engine_path.sql \
    sql/tests/test_dictionary_policy_voting_path.sql \
    sql/tests/test_easy_bot_turn_policy.sql \
    sql/tests/test_match_bootstrap_bot_metadata.sql \
    sql/simulations/bot_simulation_smoke.sql \
    sql/simulations/bot_simulation_pending_vote.sql \
    sql/simulations/bot_simulation_exchange_tiles.sql \
    sql/simulations/bot_simulation_empty_rack_end.sql \
    sql/simulations/bot_simulation_all_passed_end.sql \
    sql/simulations/bot_simulation_invalid_move_expected_error.sql \
    sql/simulations/bot_simulation_long_multi_turn.sql \
    supabase/migrations/20260620210000_20_persist_successful_place_word_moves.sql \
    supabase/migrations/20260620213000_21_dictionary_contract_language.sql \
    supabase/migrations/20260620213500_22_dictionary_pt_br_core_seed.sql \
    supabase/migrations/20260620215000_23_match_language_dictionary_validation.sql \
    supabase/migrations/20260620220000_24_pt_pt_language_baseline.sql \
    supabase/migrations/20260621090000_25_dictionary_import_pipeline.sql \
    supabase/migrations/20260621093000_26_match_bootstrap_bot_metadata.sql \
    supabase/migrations/20260621105000_27_easy_bot_opening_policy.sql
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
  echo "ATENCAO: VOCE esta assumindo a continuidade do projeto Patxanga. Nao assuma contexto, nao altere nada antes de verificar o estado real e trate continuidade, rastreabilidade, seguranca, validacao e documentacao como requisitos obrigatorios. Peca explicitamente o arquivo docs/18-room-baton-package-current.md para receber diretivas, contexto operacional e status atualizado do projeto e, no ambiente local deste operador, solicite que ele rode o comando cd ~/patxanga-bootstrap/patxanga-core && open -a TextEdit docs/18-room-baton-package-current.md para abrir o arquivo no Mac."
  echo "Depois da leitura inicial do pacote de bastao, apresente obrigatoriamente ao operador uma escolha explicita entre tres modos de atuacao: PADRAO, GATE e GATE_CHECKLIST. Explique cada modo em uma linha, recomende PADRAO como opcao default e aguarde a decisao do operador antes de prosseguir."
  echo "Definido o modo, valide branch atual, HEAD, upstream, commits recentes, ../project-log.md, working tree, ambiente operacional, ultimo build/teste validado e artefatos de inicializacao com o rigor correspondente ao modo escolhido. Se houver divergencia entre memoria, conversa, documentacao e repositorio local, o estado local verificado prevalece. O arquivo docs/18-room-baton-package-current.md deve ser atualizado sempre que o operador solicitar ou sempre que houver mudanca relevante suficiente para impactar a retomada segura."
} > "$TMP_OUT"

mv "$TMP_OUT" "$OUT"
trap - EXIT

echo "Arquivo gerado em $OUT"
