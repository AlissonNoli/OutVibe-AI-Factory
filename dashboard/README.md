# Dashboard OutVibe — entrada + publicação humana

UI para:
1. **Novo projecto** — foto(s) + brief → n8n workflow `00` → fábrica
2. **Fila** — ver legendas Instagram, copiar, marcar publicado / métricas (Fases 4b/5)

PRD fila: `docs/prd/001-dashboard-publicacao-humana.md`  
Online: `docs/setup/12-dashboard-online.md`

## Arranque local (sem Docker)

```bash
cd dashboard
cp .env.example .env
# SUPABASE_*, DASHBOARD_PASSWORD, N8N_INGEST_WEBHOOK_URL, DASHBOARD_INGEST_TOKEN
npm install
npm start
```

Abre `http://localhost:3000`.

Para o Enviar funcionar, o workflow `00` tem de estar activo no n8n e o token tem de coincidir.

## Arranque com Docker (VPS)

Ver raiz: `docker compose up -d --build` com `DASHBOARD_DOMAIN=publish.outvibe.pt`.

## Fluxo tipico

1. Separador **Novo** → brief + fotos → **Enviar para a fábrica**
2. Esperar pipeline 02→05 (ou disparar manualmente)
3. Separador **Fila** → **Por publicar** → Copiar legenda → Instagram → **Marcar publicado**
4. Filtro **Publicados** → métricas

## Notas

- Preview na fila usa thumbnail do Drive; se for privado, usa “Abrir no Drive”.
- Inbox do Drive (workflow 01) continua válido em paralelo.
- Não commits o `.env` com a `service_role`.
