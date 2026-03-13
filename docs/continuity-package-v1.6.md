Leia atentamente, nesta ordem:

1) CONTEXT SNAPSHOT MASTER v1.6
2) docs/12-submit-move-contract.md — Version 1.2 (Frozen)
3) Operational Log Policy
4) Handoff Protocol

Estado atual confirmado:

• Projeto usa Supabase CLI
• Banco reconstruído exclusivamente via migrations
• supabase db reset compila engine sem erro
• submit_move hardened e integrado
• pending_vote persistente real já validado
• votação accept/reject já validada
• pass turn já validado
• exchange tiles já validado
• fim de partida já validado em dois critérios
• pontuação final por peças restantes já validada
• UUID por peça preservado
• Server-authoritative absoluto

Processo oficial:

• Nunca gerar SQL fora de migration
• Nunca confiar em validação client-side
• Nunca alterar regras estratégicas congeladas
• Toda nova função deve entrar em migration versionada
• Sempre versionar mudanças relevantes e registrar logstep

Estado técnico validado:

• create_match funcional
• join_match funcional
• start_match funcional
• rack distribuído corretamente
• current_turn_player_id funcional
• submit_move funcional nos ramos success e pending_vote
• submit_vote funcional nos ramos accepted e rejected
• pass_turn funcional
• exchange_tiles funcional
• score funcional
• board_state persistido corretamente
• rack_state atualizado corretamente
• bag_state atualizado corretamente
• next_player definido
• match_finished funcional
• score final ajustado por peças restantes

Objetivo do próximo passo:
[DESCREVER AQUI]

Não simplifique arquitetura.
Não altere regras congeladas.
Não reestruture banco.
Não remova UUID.
Não quebre replay.
Não ignore fluxo de pending_vote.
Não troque player_id por user_id no estado interno da partida.


## Observação operacional importante desta etapa

Durante a tentativa de consolidar o documento `frontend-backend-operational-contract-v1.0.md`,
foi observado um limite prático de geração/renderização de conteúdo longo nesta sala.

Sintoma:
- a resposta é truncada repetidamente no mesmo ponto
- o conteúdo deixa de chegar como documento único
- passam a surgir blocos separados e incompletos

Conclusão:
- o problema é operacional da sala/interface, não do backend do projeto

Regra de trabalho a partir daqui:
- evitar gerar documentos longos em bloco único nesta sala
- preferir documentos menores e segmentados
- quando necessário, quebrar artefatos grandes em múltiplos arquivos
- registrar sempre o ponto exato onde a geração foi interrompida

## Estado do projeto nesta etapa

O backend do Patxanga encontra-se amplamente validado, incluindo:

- gameplay core
- pending_vote
- votação accept/reject
- pass turn
- exchange tiles
- fim de partida
- penalidade final
- lobby direct
- convites
- resume
- forfeit
- listagens mínimas para frontend

Pendência atual:
- consolidação documental do contrato operacional frontend-backend

Natureza da pendência:
- limitação operacional de geração de arquivo longo nesta sala
- não representa bloqueio técnico do produto

Se qualquer dúvida estrutural surgir, pare e peça confirmação antes de gerar código e aguarde eu anexar o segundo arquivo antes de qualquer coisa.

## Atualização documental posterior a este pacote

Desde este baseline, o repositório passou a incluir o documento curto:

- `docs/frontend-contract-rpcs-v1.0.md`
- `docs/frontend-contract-match-states-v1.0.md` passa a integrar a ordem de referência para sessões de frontend
- `docs/frontend-contract-screen-actions-v1.0.md` passa a integrar a ordem de referência para sessões de frontend
- `docs/frontend-contract-match-bootstrap-v1.0.md` passa a integrar a ordem de referência para sessões de frontend

Uso recomendado em sessões de frontend:
- tratar `docs/frontend-contract-rpcs-v1.0.md` como contrato curto operacional das RPCs expostas ao frontend
- manter leitura conjunta com:
  - snapshot master vigente
  - `docs/12-submit-move-contract.md` — Version 1.2 (Frozen)
  - protocolo local/operacional vigente

