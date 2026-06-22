# PATXANGA - Plano de Publicacao Alpha

Status: pacote local preparado. Publicacao real depende de credenciais externas
do projeto Supabase remoto, provedor de frontend e dominio.

## 1. Objetivo do alpha

Publicar uma versao privada do Patxanga para poucos usuarios reais testarem:

- cadastro/login
- criacao de mesa
- convite direto
- retomada de partida
- partida humano vs humano
- partida humano vs bot
- votacao de palavra
- dicionarios `pt-BR` e `pt-PT`

Nao e objetivo desta fase:

- ranking publico
- monetizacao
- matchmaking aberto
- painel administrativo completo
- importacao ampla de dicionario por operador nao tecnico

## 2. Arquitetura de publicacao recomendada

### Frontend

Recomendado: Vercel ou Netlify.

Requisitos:

- build Next.js com `npm run build`
- variaveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- dominio HTTPS
- redirect URLs cadastradas no Supabase Auth

### Backend

Recomendado: Supabase hosted.

Requisitos:

- projeto Supabase remoto criado
- migrations aplicadas em ordem
- Auth email/senha habilitado
- SMTP de producao configurado antes de abrir para usuarios externos
- backups habilitados
- logs acessiveis

## 3. Variaveis obrigatorias

Frontend:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Supabase Auth:

- `site_url`: URL publica final do frontend
- `additional_redirect_urls`: URL de preview/staging se usada
- email signup habilitado
- email confirmations: decidir por ambiente
- SMTP: obrigatorio para uso externo

## 4. Ordem segura de publicacao

1. Criar projeto Supabase remoto.
2. Configurar Auth URL e SMTP.
3. Aplicar migrations no banco remoto.
4. Rodar importacao limitada de dicionario:
   - `zsh scripts/import-libreoffice-pt-br-sample.sh --limit 100 --execute`
   - `zsh scripts/import-libreoffice-pt-pt-sample.sh --limit 100 --execute`
5. Configurar variaveis no provedor de frontend.
6. Rodar build local:
   - `zsh scripts/preflight-alpha-deploy.sh`
7. Publicar frontend.
8. Criar usuario real de teste.
9. Testar fluxo minimo de alpha.

## 5. Checklist minimo de alpha

Antes de compartilhar URL:

- usuario consegue criar conta
- usuario consegue sair e entrar novamente
- usuario consegue criar partida rapida
- usuario consegue criar lobby por convite
- convidado consegue aceitar convite
- host consegue iniciar lobby
- partida humano vs humano abre
- partida humano vs bot abre
- palavra fora do lexico vai para votacao
- partida pode ser retomada
- desistir de partida nao quebra listagem

## 6. Validacao local obrigatoria antes do deploy

```bash
zsh scripts/preflight-alpha-deploy.sh
supabase db reset
zsh scripts/run-sql-test-suite.sh all
zsh scripts/run-bot-simulation.sh all
zsh scripts/test-dictionary-import-tooling.sh
zsh scripts/test-libreoffice-dictionary-sample.sh
cd frontend
npm run test:e2e -- tests/browser-validation.spec.ts --project=chromium
```

## 7. Riscos conhecidos antes do beta

- convites ainda usam `user_id` no fluxo de produto; falta diretorio por email/nome
- RPCs legadas por `user_id` seguem disponiveis para debug e testes
- frontend ainda nao tem painel administrativo
- publicacao real ainda precisa de credenciais externas
- monitoramento e alertas ainda sao basicos

## 8. Criterio de pronto para alpha privado

Alpha privado pode iniciar quando:

- migrations aplicam no Supabase remoto sem erro
- frontend publicado aponta para o Supabase remoto
- cadastro/login funcionam com email real
- pelo menos duas contas externas jogam uma partida curta
- operador consegue consultar logs e restaurar backup se necessario
