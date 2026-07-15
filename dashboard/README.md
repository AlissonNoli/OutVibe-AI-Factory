# Dashboard OutVibe — publicação humana (Fase 4b)

UI para ver fotos + legendas Instagram + horários e marcar **publicado** / **descartado**.  
Lê/escreve no Supabase (não substitui o n8n).

PRD: `docs/prd/001-dashboard-publicacao-humana.md`

## Arranque local

```bash
cd dashboard
cp .env.example .env
# preenche SUPABASE_SERVICE_KEY (Settings → API → service_role)
# opcional: DASHBOARD_PASSWORD
npm install
npm start
```

Abre `http://localhost:3000` → password (default `outvibe`).

## O que faz

- Lista projectos com publicações Instagram no estado escolhido (`por_publicar` por defeito)
- Mostra tema, thumb Drive (se a partilha permitir), legenda, hashtags, notas, data/hora
- **Copiar legenda** (+ hashtags)
- **Marcar publicado** / **Descartar** → atualiza `publicacoes`
- **Fase 5 — Métricas:** no filtro *Publicados*, formulário para views / likes / comentários / partilhas / saves + URL do post

## Fluxo tipico

1. Filtro **Por publicar** → Copiar legenda → publicar no IG à mão → **Marcar publicado**
2. Filtro muda para **Publicados** → preencher métricas → **Guardar métricas**

## Notas

- Preview da foto usa URL thumbnail do Drive; se a imagem for privada, usa “Abrir no Drive”.
- `conteudo_id` nas publicações pode estar null (MVP) — o dashboard emparelha por ordem.
- Não commits o `.env` com a service_role.
