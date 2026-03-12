Leia atentamente:

1) CONTEXT SNAPSHOT MASTER v1.3
2) SUBMIT MOVE CONTRACT v1.1
3) Operational Log Policy
4) Handoff Protocol

Estado atual:

• Projeto usa Supabase CLI
• Banco reconstruído exclusivamente via migrations
• supabase db reset deve compilar engine sem erro
• submit_move hardened e integrado
• Dicionário local com duas colunas
• UUID por peça preservado
• Server-authoritative absoluto

Processo oficial:

• Nunca gerar SQL fora de migration
• Nunca confiar em validação client-side
• Nunca alterar regras estratégicas congeladas
• Toda nova função deve entrar em migration versionada

Objetivo do próximo passo:
[DESCREVER AQUI]

Não simplifique arquitetura.
Não altere regras congeladas.
Não reestruture banco.
Não remova UUID.
Não quebre replay.
Não ignore fluxo de pending_vote.

Se qualquer dúvida estrutural surgir, pare e peça confirmação antes de gerar código.