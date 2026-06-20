# PATXANGA - BOT ENGINE

Versao: 0.6
Status: Baseline inicial com smoke, pending_vote, exchange_tiles, endgames, erros esperados e runner recorrente

---

## 1. Objetivo

Definir a primeira linha de implementacao de bots no Patxanga.

Nesta fase, bot nao significa ainda adversario final de produto.
Bot significa ferramenta de QA para:

- gerar partidas simuladas
- exercitar a engine server-authoritative
- reproduzir cenarios de regressao
- acelerar validacao sem depender de cliques manuais
- preparar terreno para o futuro modo humano contra bot

---

## 2. Separacao obrigatoria

Existem duas frentes diferentes:

| Frente | Objetivo | Prioridade atual |
|--------|----------|------------------|
| Bot de teste/simulacao | Validar engine, gerar cenarios e automatizar QA | Alta |
| Bot de produto | Jogar contra humano em uma experiencia final | Posterior |

Nao se deve misturar as duas frentes.

O bot de simulacao pode ser simples, previsivel e ate limitado.
O bot de produto precisa de UX, ritmo, dificuldade e comportamento de usuario.

---

## 3. Regras obrigatorias para bots de teste

Bots de teste devem:

1. Usar apenas RPCs oficiais.
2. Nunca alterar board, rack, bag ou score fora dos contratos da engine, exceto quando o proprio cenario de teste declarar seed controlada.
3. Ser deterministas sempre que possivel.
4. Gerar logs claros.
5. Falhar com erro explicito quando uma expectativa nao for cumprida.
6. Produzir cenarios pequenos e reproduziveis.
7. Preservar a autoridade do backend.

Bots de teste nao precisam:

- jogar bem
- ter personalidade
- ter interface final
- esconder que estao em modo QA
- cobrir todo o espaco de possibilidades no primeiro marco

---

## 4. Estado tecnico atual

O banco ja possui suporte estrutural para jogadores bot:

- `patxanga_players.is_bot`
- `patxanga_players.bot_level`
- `patxanga_players.bot_profile`
- `join_patxanga_match(... p_is_bot, p_bot_level, p_bot_profile)`

Ja existe:

- runner local recorrente em `scripts/run-bot-simulation.sh`
- smoke bot-vs-bot com jogada valida e passe
- simulacao de `pending_vote` com rejeicao
- simulacao de `pending_vote` com aceitacao
- simulacao de `exchange_tiles`
- simulacao de fim por rack vazio
- simulacao de fim por todos passarem
- simulacao de erros esperados sem mutacao de estado
- simulacao multi-turno combinando jogada aceita, troca, passes,
  `pending_vote` em ponte com peca existente e rejeicao por voto

Ainda nao existe:

- engine autonoma de bot
- Edge Function de bot
- UI de humano contra bot

---

## 5. MVP de simulacao

O primeiro MVP deve entregar:

| Item | Descricao |
|------|-----------|
| Cenario smoke | Uma partida com dois jogadores marcados como bot |
| Jogada deterministica | Um bot executa abertura valida simples |
| Passo seguinte | O outro bot executa uma acao valida simples |
| Runner local | Script executa a simulacao no Postgres local do Supabase |
| Falha explicita | Qualquer regressao gera exception/exit code nao zero |
| Persistencia | Jogada `place_word` aceita gera `move_id` e linha em `patxanga_moves` |
| Pending vote | Bot gera palavra pendente, outro bot rejeita ou aceita |
| Troca de pecas | Bot troca duas pecas e avanca turno |
| Fim por rack vazio | Bot esvazia rack com bag vazia e encerra a partida |
| Fim por todos passarem | Dois bots passam com bag vazia e encerram a partida |
| Erros esperados | Bot tenta jogadas ilegais e a engine rejeita sem mutar estado |
| Multi-turno | Uma partida encadeia jogada aceita, troca, passe, voto e passe final |

Implementacao inicial:

- `sql/simulations/bot_simulation_smoke.sql`
- `sql/simulations/bot_simulation_pending_vote.sql`
- `sql/simulations/bot_simulation_exchange_tiles.sql`
- `sql/simulations/bot_simulation_empty_rack_end.sql`
- `sql/simulations/bot_simulation_all_passed_end.sql`
- `sql/simulations/bot_simulation_invalid_move_expected_error.sql`
- `sql/simulations/bot_simulation_long_multi_turn.sql`
- `scripts/run-bot-simulation.sh`
- `supabase/migrations/20260620210000_20_persist_successful_place_word_moves.sql`

Comando:

```bash
zsh scripts/run-bot-simulation.sh long
zsh scripts/run-bot-simulation.sh all
```

---

## 6. Politicas iniciais de bot

As politicas abaixo sao suficientes para QA inicial:

### `first_valid_opening`

Forca ou encontra rack com palavra curta conhecida pelo dicionario de teste
e joga no centro.

Uso inicial:

- palavra `DA`
- posicoes `(8,8)` e `(8,9)`
- score esperado: 6

### `pass_turn`

Executa `submit_patxanga_pass_turn(...)` quando for turno do bot.

Uso inicial:

- validar avancar turno
- validar replay de passe
- validar ciclo de pass futuro

### Futuras politicas

- `finish_by_empty_rack`
- `finish_by_all_passed`

Politicas ja exercitadas por simulacao controlada:

- `exchange_first_two_tiles`: troca as duas primeiras pecas de um rack controlado
- `force_pending_vote`: rack forca palavra `TS`
- `reject_pending_vote`: voto bot rejeita a palavra pendente
- `accept_pending_vote`: voto bot aceita a palavra pendente
- `finish_by_empty_rack`: bag vazia, rack `DA` e fim imediato apos jogada valida
- `finish_by_all_passed`: bag vazia, dois bots passam e fim ocorre apos o
  segundo passe
- `invalid_missing_rack_tile`: peca inexistente no rack deve gerar erro
  esperado sem alterar estado
- `invalid_out_of_turn_move`: jogador fora do turno deve gerar erro esperado
  sem alterar estado

Observacao:

- `patxanga_players.bot_profile` aceita apenas `aggressive`, `balanced` e
  `defensive`
- politicas de QA como `force_pending_vote` nao devem ser gravadas diretamente
  em `bot_profile`; elas pertencem ao runner/cenario de teste

---

## 7. Cenarios prioritarios

Ordem recomendada:

1. smoke bot-vs-bot com jogada valida e passe - implementado
2. bot cria `pending_vote` - implementado
3. bot vota rejeicao - implementado
4. bot vota aceitacao - implementado
5. bot troca pecas - implementado
6. bot encerra partida por rack vazio - implementado
7. bot encerra partida por todos passarem - implementado
8. bot tenta jogada invalida com erro esperado - implementado

---

## 8. Limites da fase atual

Nao faz parte desta fase:

- bot com inteligencia forte
- escolha lexical ampla
- busca combinatoria no rack
- bot visivel como produto final
- Edge Function obrigatoria
- UX de humano contra bot

Esses itens pertencem a fase posterior de bot de produto.

---

## 9. Criterio de saida da primeira fase

A primeira fase de bots de teste esta iniciada. Criterios ja atendidos:

- `docs/07-bot-engine.md` define o contrato minimo
- existe runner local de simulacao
- existe pelo menos um cenario smoke
- o cenario smoke passa contra Supabase local
- o roadmap consolidado aponta bots de teste como prioridade antes do bot de produto

Proximo criterio de avanco:

- ampliar combinacoes mais longas de partida
- iniciar extracao de utilitarios de seed se os SQLs comecarem a repetir demais

Fim do documento.
