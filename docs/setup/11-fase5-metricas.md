# Fase 5 — Métricas manuais no dashboard

Depois de publicar no Instagram à mão:

1. No dashboard, clica **Marcar publicado** (ou abre o filtro **Publicados**)
2. Preenche: views, likes, comentários, partilhas, saves (+ URL opcional)
3. **Guardar métricas** → grava em `publicacoes` e `metricas_atualizadas_em`

Campos já existiam em `db/migrations/001_init.sql` — não precisas de nova migração.

Código: `dashboard/server.mjs` (PATCH) + formulário em `dashboard/public/app.js`.
