Leia atentamente, nesta ordem:

1) CONTEXT SNAPSHOT MASTER v1.4
2) SUBMIT MOVE CONTRACT v1.1
3) Operational Log Policy
4) Handoff Protocol

Estado atual confirmado:

• Projeto usa Supabase CLI
• Banco reconstruído exclusivamente via migrations
• supabase db reset compila engine sem erro
• submit_move hardened e integrado
• Dicionário local com seed mínimo de validação
• UUID por peça preservado
• Server-authoritative absoluto
• Primeiro caminho real de success já validado com a palavra "DA"

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
• submit_move funcional no caminho de success
• score funcional
• board_state persistido
• rack_state atualizado
• bag_state reduzido
• next_player definido

Objetivo do próximo passo:
[DESCREVER AQUI]

Não simplifique arquitetura.
Não altere regras congeladas.
Não reestruture banco.
Não remova UUID.
Não quebre replay.
Não ignore fluxo de pending_vote.
Não troque player_id por user_id no estado interno da partida.

Se qualquer dúvida estrutural surgir, pare e peça confirmação antes de gerar código.