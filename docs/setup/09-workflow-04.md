# Workflow 04 — Social Media (só Instagram)

Poll `projetos` com `estado=escrito` → Claude adapta textos-mãe **só para Instagram** → `conteudos` + `publicacoes` → `estado=adaptado`.

## Pré-requisitos

- Copywriter feito (`estado=escrito` + linhas em `conteudos` com `agente=copywriter`)
- Credenciais: Supabase + Anthropic

## Importar

1. `git pull` → `n8n/workflows/04-social-media.json`
2. n8n → Import from File (workflow **à parte**)
3. Liga credenciais Supabase / Anthropic
4. Save → Publish

## Testar

1. Confirma `projetos.estado = escrito`
2. **Execute workflow** no 04
3. Sucesso quando:
   - `conteudos` com novas linhas `agente=social_media`
   - `publicacoes` com `plataforma=instagram`, `estado=por_publicar`
   - `projetos.estado = adaptado`
   - log `Social Media IG: N versão(ões)`

## Reset para re-testar

```sql
delete from publicacoes where projeto_id = 'ed6ef11b-7e4b-4c26-ab91-5b9f3023ddba' and plataforma = 'instagram';
delete from conteudos where projeto_id = 'ed6ef11b-7e4b-4c26-ab91-5b9f3023ddba' and agente = 'social_media';
update projetos set estado = 'escrito'
where id = 'ed6ef11b-7e4b-4c26-ab91-5b9f3023ddba';
```

## Nota

TikTok / LinkedIn / Threads **não** entram neste workflow. Prompt: `agents/prompts/social-media.md` (Instagram only).

Seguinte (Fase 4): escrever `.md` em `Pronto_Para_Publicar` no Drive para publicação manual.
