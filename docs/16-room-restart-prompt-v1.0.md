# Room Restart Prompt v1.0

Você está entrando na continuidade do projeto Patxanga.

Leia e use, nesta ordem:
1. `docs/continuity-package-v1.6.md`
2. snapshot master vigente
3. `docs/15-local-ops-and-collaboration-protocol.md`
4. `docs/12-submit-move-contract.md`
5. contratos curtos de frontend relevantes
6. `docs/16-room-restart-prompt-v1.0.md`

Antes de propor ou executar qualquer novo passo:
- confirme o estado atual do branch
- leia os commits mais recentes
- use `project-log.md` como trilha operacional
- trate branch + commits já pushados como fonte de verdade mais forte em caso de divergência

Estado consolidado do projeto:
- backend central do jogo já funcional
- bootstrap real frontend-backend já validado
- submit real de jogada já validado
- ramo `accepted` já validado pela UI
- ramo `pending_vote` já validado pela UI
- votação `accepted` e `rejected` já validadas
- overlay visual de `pending_vote` já implementado
- home atual já foi modularizada e hoje funciona como sandbox operacional
- `VotingSection`, `BoardSection`, `RackSection`, `PlayersSection`, `MatchStatusPanel` e `MoveSubmitSection` já foram extraídos
- wildcard com `declared_letter` foi fechado ponta a ponta:
  - backend exige `declared_letter` para `wildcard`
  - frontend pede a letra ao posicionar a peça
  - preview local mostra a letra declarada
  - remoção local da peça no board funciona
  - submit real com wildcard foi validado até o ramo `pending_vote`

Leitura correta do momento atual:
- a home atual não deve ser tratada como layout final de produto
- ela deve ser entendida como tela operacional/sandbox de validação
- a próxima prioridade principal não é mais infra nem integração
- a próxima prioridade principal é desenhar e implementar a primeira tela de jogo orientada a produto

Diretriz para a próxima fase:
- priorizar visualmente tabuleiro, rack/deck, ação principal do turno e votação apenas quando necessária
- reduzir detalhes técnicos visíveis por padrão
- manter debug como camada secundária
- não reabrir contratos funcionais já validados sem necessidade
- continuar trabalhando com commits pequenos, frequentes e temáticos
- após cada marco relevante: validar, commitar, pushar, registrar com `logstep.sh` e refletir no continuity package quando houver mudança operacional real

Modo de operação:
- pesquisar primeiro
- localizar o trecho real do código antes de alterar
- decidir com base no estado atual do repositório
- implementar de forma incremental
- evitar adivinhação em patches
- confirmar build/teste sempre que mexer em frontend ou SQL crítico

Recomendação de partida para amanhã:
- não voltar a polir a sandbox antes disso
- começar direto pela definição do escopo exato da primeira tela de jogo orientada a produto
- manter a home atual como sandbox operacional
- só depois iniciar a implementação da nova composição visual
\n