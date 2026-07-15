# Workflow 05 — Output Pronto_Para_Publicar (Fase 4)

Poll `projetos` com `estado=adaptado` → monta `.md` com legendas Instagram → upload na pasta Drive **Pronto_Para_Publicar** → `estado=pronto`.

**Não usa Claude** — só Supabase + Google Drive.

## Pré-requisitos

- Social Media IG feito (`estado=adaptado` + linhas `conteudos` com `agente=social_media`)
- Credenciais: Supabase + Google Drive
- Pasta Drive: `Pronto_Para_Publicar` (`10ER87nbWmwOAnMucEBP5X4wYDmlrjGP0`)

## Importar

1. `git pull` → `n8n/workflows/05-output.json`
2. n8n → Import (workflow à parte)
3. Liga Supabase + Google Drive
4. No nó upload, confirma Folder ID da Pronto_Para_Publicar
5. Save → Publish

## Testar

1. Confirma `projetos.estado = adaptado`
2. **Execute workflow**
3. Sucesso quando:
   - Ficheiro `.md` na pasta Drive **OUTVIBE / Pronto_Para_Publicar**
   - `projetos.estado = pronto`
   - log `Output Drive: IG_....md`

## O que contém o `.md`

- Cabeçalho (tema, CTA, data sugerida)
- Calendário rápido das peças
- Por cada peça IG: legenda para copiar, hashtags, notas de publicação manual

## Reset

```sql
update projetos set estado = 'adaptado'
where id = 'ed6ef11b-7e4b-4c26-ab91-5b9f3023ddba';
```

(Apaga o `.md` no Drive à mão se fores re-gerar.)

## Depois

Publicas **à mão** no Instagram a partir do `.md`. Quando publicares, podes mover ficheiros para `Publicado` e marcar `publicacoes.estado = publicado` (Fase 5 / processo humano).
