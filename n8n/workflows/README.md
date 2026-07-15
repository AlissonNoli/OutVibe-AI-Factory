# Workflows n8n

Cada workflow do n8n é exportado como JSON para esta pasta e commitado. Convenção de nomes:

- `01-ingestao.json` — Drive trigger → registo no Supabase → mover para Processando
- `02-diretor.json` — projetos `ingerido` → Claude (`agents/prompts/diretor.md`) → `plano` + `estado=planeado`
- `03-copywriter.json` — projetos `planeado` → Claude (`copywriter.md`) → `conteudos` + `estado=escrito`
- `04-social-media.json` — projetos `escrito` → Claude Instagram only → `conteudos`/`publicacoes` + `estado=adaptado`
- `05-output.json` — `adaptado` → `.md` em Pronto_Para_Publicar (Drive) → `estado=pronto`

**Antes do `01-ingestao`:** credenciais Drive + Supabase no n8n, migração SQL, pastas Drive (`docs/setup/00-pre-workflow-01.md`). Anthropic **não** é necessário para o 01.

**Antes do `02-diretor`:** Anthropic no n8n + pelo menos 1 projeto `ingerido`. Guia: `docs/setup/07-workflow-02.md`.

**Antes do `03-copywriter`:** projeto com `estado=planeado` + `plano`. Guia: `docs/setup/08-workflow-03.md`.

**Antes do `04-social-media`:** projeto `escrito` + texts do copywriter. Guia: `docs/setup/09-workflow-04.md` (MVP: **só Instagram**).

**Antes do `05-output`:** projeto `adaptado` + peças `social_media`. Guia: `docs/setup/10-workflow-05.md`.

Para exportar: no n8n, abrir o workflow → menu ⋯ → Download.
