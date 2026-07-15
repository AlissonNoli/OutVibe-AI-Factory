# Workflows n8n

Cada workflow do n8n é exportado como JSON para esta pasta e commitado. Convenção de nomes:

- `01-ingestao.json` — Drive trigger → registo no Supabase → mover para Processando
- `02-diretor.json` — chama Claude com agents/prompts/diretor.md → grava plano
- `03-copywriter.json`
- `04-social-media.json`
- `05-output.json` — escreve .md em Pronto_Para_Publicar + linha no calendário

**Antes do `01-ingestao`:** completar `docs/setup/00-pre-workflow-01.md` (credenciais n8n, migração Supabase, pastas `OUTVIBE/*` no Drive).

Para exportar: no n8n, abrir o workflow → menu ⋯ → Download.
