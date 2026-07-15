# OutVibe AI Content Factory

Fábrica de conteúdo automatizada baseada em agentes de IA coordenados pelo n8n.

**Estado atual: MVP v0.1 — pipeline de texto**
Entrada: brief em texto + fotos na pasta `Inbox/` do Google Drive.
Saída: legendas, hashtags e CTAs adaptados por plataforma em `Pronto_Para_Publicar/` + linha no calendário. Publicação manual.

## Arquitetura (MVP)

```
Google Drive (Inbox)
      │
      ▼
n8n: Workflow 01 — Ingestão ──► Supabase (projetos)
      │
      ▼
Agente Diretor (Claude) ──► plano de produção (JSON)
      │
      ▼
Agente Copywriter ──► texto-mãe (hooks, CTA, hashtags)
      │
      ▼
Agente Social Media ──► versões por plataforma (IG, TikTok, LinkedIn, Threads)
      │
      ▼
Google Drive (Pronto_Para_Publicar) + Calendário
```

Agentes futuros (fases seguintes): Editor de Vídeo, Viralização, Publicador, Analytics, Designer, SEO, Comercial. Ver `docs/blueprints/`.

## Stack

- **n8n** (self-hosted, Docker, VPS Hetzner) — orquestração
- **Claude API** (Anthropic) — cérebro dos agentes
- **Supabase** — metadados e histórico
- **Google Drive** — entrada/saída de ficheiros
- **Caddy** — HTTPS automático para os webhooks do n8n

## Como correr

1. Apontar um subdomínio (ex: `n8n.outvibe.pt`) para o IP do VPS.
2. Na VPS: copiar `.env.example` → `.env` e preencher **só** secrets de infra — ver `docs/setup/04-vps-secrets.md`.
3. `docker compose up -d`
4. Abrir `https://n8n.SEU_DOMINIO`, criar conta de admin.
5. APIs externas (Anthropic, Drive, Supabase) → **Credentials** no n8n (não no `.env`). Onde obter cada chave: `docs/setup/05-onde-conseguir-chaves.md`.
6. Restantes pré-requisitos do Workflow 01: `docs/setup/00-pre-workflow-01.md`.
7. Importar workflows de `n8n/workflows/` + migração `db/migrations/001_init.sql`.

## Convenções

- **Workflows**: qualquer alteração no n8n é exportada como JSON para `n8n/workflows/` e commitada.
- **Prompts**: são código. Cada alteração a `agents/prompts/*.md` é um commit — o Analytics vai comparar versões.
- **Decisões técnicas**: registadas em `docs/decisions/` (ADRs numerados).
- **Commits**: `feat:`, `fix:`, `docs:`, `chore:`.
- **Comunicação entre agentes**: sempre no formato de `agents/schema.json`. Nunca há comunicação direta entre agentes — tudo passa pelo Diretor.

## Roadmap

- [x] Fase 0a — Fundações no repo (Docker Compose, Caddy, schema SQL, prompts, ADRs)
- [x] Fase 0b — Config live (Supabase, pastas Drive, OAuth Drive + Supabase no n8n) — Anthropic adiado para Fase 2
- [ ] Fase 1 — Ingestão + BD (Workflow 01) — JSON em `n8n/workflows/01-ingestao.json`
- [ ] Fase 2 — Agente Diretor
- [ ] Fase 3 — Copywriter + Social Media
- [ ] Fase 4 — Output humano + calendário
- [ ] Fase 5 — Feedback manual de métricas
- [ ] Fase 6 — Vídeo (Whisper, FFmpeg, Agente Editor)
- [ ] Fase 7 — Viralização, Publicador automático, Analytics
