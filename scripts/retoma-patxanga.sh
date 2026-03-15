#!/bin/zsh
set -euo pipefail

repo_dir=~/patxanga-bootstrap/patxanga-core
prompt='RETOMADA MESMA SALA: recupere o ultimo checkpoint confirmado, diferencie o que ficou concluido do que ficou pendente, revalide qualquer acao que possa ter sido interrompida e continue apenas a partir do estado real verificado.'

exec codex -C "$repo_dir" resume --last "$@" "$prompt"
