# Room Restart Prompt v1.0

Antes de qualquer análise ou proposta:
- vou encaminhar os arquivos de leitura nesta conversa
- leia os arquivos na ordem enviada
- considere a enumeração abaixo como checklist de ingestão
- aguarde receber todos os arquivos antes de concluir a leitura e antes de propor o próximo passo
- só avance depois de confirmar que recebeu e integrou todo o conjunto

Arquivos que serão encaminhados para leitura:
1. `docs/continuity-package-v1.6.md`
2. snapshot master vigente (`docs/99-context-snapshot-master-v1.6.md`)
3. `docs/15-local-ops-and-collaboration-protocol.md`
4. `docs/12-submit-move-contract.md`
5. contratos curtos de frontend relevantes:
   - `docs/frontend-contract-match-bootstrap-v1.0.md`
   - `docs/frontend-contract-match-states-v1.0.md`
   - `docs/frontend-contract-pending-vote-ux-v1.0.md`
   - `docs/frontend-contract-rpcs-v1.0.md`
   - `docs/frontend-contract-screen-actions-v1.0.md`
   - `docs/frontend-backend-operational-contract-v1.0.md`
   - `docs/frontend-integration-checklist-v1.0.md`
6. `docs/16-room-restart-prompt-v1.0.md`
7. `docs/17-continuity-activation-brief-v1.0.md`

Você está entrando na continuidade do projeto Patxanga.

Leia e use, nesta ordem:
1. `docs/continuity-package-v1.6.md`
2. snapshot master vigente (`docs/99-context-snapshot-master-v1.6.md`)
3. `docs/15-local-ops-and-collaboration-protocol.md`
4. `docs/12-submit-move-contract.md`
5. contratos curtos de frontend relevantes:
   - `docs/frontend-contract-match-bootstrap-v1.0.md`
   - `docs/frontend-contract-match-states-v1.0.md`
   - `docs/frontend-contract-pending-vote-ux-v1.0.md`
   - `docs/frontend-contract-rpcs-v1.0.md`
   - `docs/frontend-contract-screen-actions-v1.0.md`
   - `docs/frontend-backend-operational-contract-v1.0.md`
   - `docs/frontend-integration-checklist-v1.0.md`
6. `docs/16-room-restart-prompt-v1.0.md`
7. `docs/17-continuity-activation-brief-v1.0.md`

Antes de propor ou executar qualquer novo passo:
- confirme o estado atual do branch
- leia os commits mais recentes
- use `project-log.md` como trilha operacional
- trate branch + commits ja pushados como fonte de verdade mais forte em caso de divergencia

Estado consolidado do projeto:
- backend central do jogo ja funcional
- bootstrap real frontend-backend ja validado
- submit real de jogada ja validado
- ramo `accepted` ja validado pela UI
- ramo `pending_vote` ja validado pela UI
- votacao `accepted` e `rejected` ja validadas
- overlay visual de `pending_vote` ja implementado
- home atual continua existindo como sandbox operacional
- `VotingSection`, `BoardSection`, `RackSection`, `PlayersSection`, `MatchStatusPanel` e `MoveSubmitSection` ja foram extraidos
- wildcard com `declared_letter` foi fechado ponta a ponta
- a primeira composicao de tela jogavel orientada a produto ja foi aberta
- o rack jogavel ja suporta reordenacao local via drag and drop no frontend

Leitura correta do momento atual:
- a home atual nao deve ser tratada como layout final de produto
- ela deve ser entendida como tela operacional/sandbox de validacao
- a tela jogavel inicial ja existe e deve ser a frente principal de evolucao
- a proxima prioridade principal nao e mais infra nem integracao
- a proxima prioridade principal e evoluir a primeira tela de jogo orientada a produto

Diretriz para a proxima fase:
- priorizar visualmente tabuleiro, rack/deck, acao principal do turno e votacao apenas quando necessaria
- reduzir detalhes tecnicos visiveis por padrao
- manter debug como camada secundaria
- nao reabrir contratos funcionais ja validados sem necessidade
- continuar trabalhando com commits pequenos, frequentes e tematicos
- apos cada marco relevante: validar, commitar, pushar, registrar com `logstep.sh` e refletir no continuity package quando houver mudanca operacional real

Modo de operacao:
- pesquisar primeiro
- localizar o trecho real do codigo antes de alterar
- decidir com base no estado atual do repositorio
- implementar de forma incremental
- evitar adivinhacao em patches
- confirmar build/teste sempre que mexer em frontend ou SQL critico

Recomendacao de partida para a proxima sala:
- nao voltar a polir a sandbox antes disso
- continuar diretamente a evolucao da primeira tela de jogo orientada a produto
- usar a sandbox apenas como apoio operacional e de validacao

