# PATXANGA - Runbook Operacional Alpha/Beta

Status: baseline operacional para publicar e acompanhar alpha privado.

## 1. Objetivo

Garantir que uma versao publicada possa ser acompanhada sem depender de
inspecao manual constante no codigo.

## 2. Health check

Endpoint frontend:

```text
/api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "patxanga-frontend",
  "timestamp": "ISO-8601",
  "supabase": {
    "urlConfigured": true,
    "anonKeyConfigured": true
  }
}
```

O endpoint nao deve expor chaves, JWTs, tokens de servico ou connection
strings.

## 3. Rotina antes de publicar

Rodar localmente:

```bash
zsh scripts/preflight-alpha-deploy.sh
zsh scripts/preflight-bot-dictionary-alpha.sh
supabase db reset
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
cd frontend
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

Para alpha com dicionario amplo, elevar os minimos antes do preflight:

```bash
PATXANGA_PREFLIGHT_MIN_PT_BR_WORDS=1000 \
PATXANGA_PREFLIGHT_MIN_PT_PT_WORDS=1000 \
zsh scripts/preflight-bot-dictionary-alpha.sh
```

## 4. Smoke test depois de publicar

1. Abrir `/api/health` e confirmar `status = ok`.
2. Criar conta real.
3. Criar partida rapida.
4. Criar lobby por convite.
5. Aceitar convite com segunda conta.
6. Iniciar partida como host.
7. Jogar uma palavra reconhecida.
8. Jogar uma palavra nao reconhecida e votar.
9. Retomar partida apos refresh/logout/login.
10. Criar partida contra bot.

## 5. Monitoramento minimo

Durante alpha privado, acompanhar:

- erros de build/deploy
- erros 500 em `/api/health`
- falhas de Auth
- erros de RPC Supabase
- volume de partidas em `patxanga_matches`
- volume de pending votes sem resolucao
- partidas presas em `waiting` ou `voting`

Consultas uteis:

```sql
select status, count(*)
from public.patxanga_matches
group by status
order by status;

select status, count(*)
from public.patxanga_moves
group by status
order by status;

select language, count(*)
from public.patxanga_dictionary_words
where is_active
group by language
order by language;
```

## 6. Resposta a incidentes

### Login falhando

- verificar SMTP/Auth no Supabase
- confirmar redirect URLs
- confirmar variaveis do frontend
- testar `/api/health`

### Convite nao aparece

- confirmar `invited_user_id`
- conferir `patxanga_match_invites.status`
- conferir `patxanga_match_lobbies.status`
- validar se usuario esta autenticado com o mesmo `auth.uid()`

### Partida presa em votacao

- consultar `patxanga_moves` com `status = 'pending_vote'`
- consultar votos em `patxanga_votes`
- em 3+ jogadores, todos os nao autores precisam aprovar se nao houver rejeicao

### Bot nao joga

- confirmar turno atual em `patxanga_matches.current_turn_player_id`
- conferir `patxanga_players.is_bot`
- rodar `zsh scripts/preflight-bot-dictionary-alpha.sh`
- rodar `zsh scripts/run-bot-simulation.sh all` localmente antes de novo deploy

### Dicionario abaixo do minimo

- confirmar `PATXANGA_PREFLIGHT_MIN_PT_BR_WORDS` e
  `PATXANGA_PREFLIGHT_MIN_PT_PT_WORDS`
- rodar importacao controlada com `--full` ou `--limit` apropriado
- executar `zsh scripts/run-sql-test-suite.sh sql/tests/test_dictionary_import_pipeline.sql`
- repetir `zsh scripts/preflight-bot-dictionary-alpha.sh`

## 7. Criterios para beta

Antes de beta:

- convites por email/nome em vez de UUID
- painel admin minimo para suporte
- revisao final dos RPCs legados concedidos a `anon`
- backups revisados no Supabase hosted
- logs de erro do frontend no provedor escolhido
- smoke test publico documentado com duas contas reais
