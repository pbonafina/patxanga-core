# PATXANGA — ARQUITETURA TÉCNICA
Versão: 1.0
Status: Fundação Arquitetural
Modo Atual: Partidas Síncronas

---

## 1. Stack Tecnológica

Baseado no ambiente já existente do site:

### Frontend
- React 18
- TypeScript
- Vite 5
- Tailwind CSS
- shadcn/ui
- Framer Motion

### Backend
- Supabase (Lovable Cloud)
- PostgreSQL gerenciado
- Supabase Realtime (escuta de mudanças no banco)
- Edge Functions (Deno runtime)

### Autenticação
- Supabase Auth
- Suporte a usuários autenticados
- Suporte a convidados sem login

---

## 2. Princípios Arquiteturais

1. Server-Authoritative  
   Toda decisão oficial ocorre no backend (RPC ou Edge Function).

2. Banco como Fonte de Verdade  
   Nenhum estado crítico vive apenas no frontend.

3. Lógica Transacional  
   Jogadas validadas por funções atômicas.

4. Realtime baseado em mudanças de banco  
   Cliente escuta eventos do Supabase Realtime.

5. Preparação para modo assíncrono  
   Modelo já contempla turnos com expiração futura.

---

## 3. Arquitetura de Alto Nível

Frontend → RPC SQL / Edge Function → PostgreSQL → Realtime → Frontend

Fluxo padrão:

1. Jogador executa ação.
2. Frontend chama RPC.
3. Banco valida e persiste.
4. Mudança dispara evento Realtime.
5. Todos clientes sincronizam estado.

---

## 4. Responsabilidades por Camada

### Frontend

Responsável por:

- Renderizar tabuleiro
- Controlar drag and drop
- Exibir contagem regressiva
- Mostrar votos
- Exibir histórico/replay
- Chamar RPCs
- Assinar canais Realtime

Não deve:

- Calcular pontuação final oficial
- Decidir validade de palavra
- Alterar turno localmente sem confirmação

---

### PostgreSQL (RPC Server-Authoritative)

Responsável por:

- Validar jogadas
- Validar turno
- Validar peças especiais
- Calcular pontuação
- Atualizar tabuleiro
- Atualizar bolsa
- Controlar estado da partida
- Encerrar partida
- Resolver votação
- Aplicar efeitos (skip turn, patxanga real)

Toda jogada aceita deve ocorrer dentro de transação.

---

### Supabase Realtime

Responsável por:

- Notificar mudança de partida
- Notificar nova jogada
- Notificar início de votação
- Notificar resolução de votação
- Notificar mudança de turno
- Notificar fim da partida

Não executa lógica.

---

### Edge Functions

Usadas para:

- Geração de jogada de bot
- Cálculo complexo opcional
- Futuras integrações externas
- Possível expansão para modo assíncrono

Bots não executam lógica no frontend.

---

## 5. Fluxo de Jogada (Síncrono)

### Cenário: Jogador humano envia palavra

1. Frontend envia `submit_move()`.
2. RPC valida:
   - É o turno correto?
   - Letras estão no rack?
   - Estrutura da palavra é válida?
3. Verifica dicionário.
4. Se reconhecida:
   - Calcula pontuação
   - Atualiza estado
   - Avança turno
5. Se não reconhecida:
   - Marca `requires_vote = true`
   - Inicia período de votação
6. Evento é publicado via Realtime.

---

## 6. Fluxo de Votação

1. Jogada marcada como `pending_vote`.
2. Timer de 10 segundos iniciado no frontend.
3. Jogadores podem votar rejeição.
4. Não votar = aceitação.
5. RPC `resolve_vote()` executada ao fim do prazo.
6. Se maioria rejeitar → jogada rejeitada.
7. Se aceita → pontuação aplicada e turno avança.

---

## 7. Fluxo de Bot

1. Se jogador atual for bot:
2. Sistema agenda Edge Function.
3. Edge Function calcula jogada com base no estado atual.
4. Chama RPC `submit_move()` como se fosse jogador humano.
5. Estado persiste normalmente.

---

## 8. Controle de Conectividade

Tabela `patxanga_match_presence` mantém:

- status online
- último ping
- detecção de abandono

Frontend envia heartbeat periódico.

---

## 9. Timeout de Turno

Se houver `turn_time_seconds`:

1. Frontend monitora contagem.
2. Ao expirar:
   - Chama RPC `expire_turn()`.
3. RPC decide:
   - passar turno
   - permitir troca de letras
   - aplicar regra definida

---

## 10. Segurança

- RPCs validam `auth.uid()` quando usuário autenticado.
- Jogadores convidados só atuam dentro da partida criada.
- Nenhum jogador pode agir fora do turno.
- Votação não pode ser manipulada pelo autor.
- Todas ações validadas no backend.

---

## 11. Escalabilidade Inicial

Escopo inicial:

- Até 10 salas simultâneas
- Até 4 jogadores por sala
- Latência tolerável (200–500ms)

Sem necessidade de:

- Redis
- Servidor dedicado
- WebSocket customizado

---

## 12. Evolução Futura

Arquitetura permite:

- Modo assíncrono
- Notificações push
- Ranking avançado
- Estatísticas detalhadas
- Histórico persistente
- Integração com sistema maior do site

---

## 13. Estado Atual

Arquitetura conceitual definida.
Pronta para:

- Transformação em SQL físico
- Definição de constraints
- Criação de RPCs
- Modelagem de fluxos Realtime detalhados