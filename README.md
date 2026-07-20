# OutVibe AI Content Factory

Fábrica de conteúdo automatizada baseada em agentes de IA coordenados pelo n8n.

**Estado atual: MVP v0.2 — pipeline de texto + dashboard entrada**
Entrada: brief + fotos pelo dashboard (`publish.outvibe.pt`) **ou** pasta `Inbox/` do Drive.
Saída: legendas/hashtags/CTAs + fila de publicação no dashboard. Publicação manual.

## Arquitetura (MVP)

```
Dashboard (publish) ──┐
                      ├──► n8n 00/01 → Supabase → Diretor → Copy → Social → Output
Google Drive Inbox ───┘                              │
                                                     ▼
                                          Fila no dashboard + Drive Pronto_Para_Publicar
```

Entrada: brief + fotos (dashboard **ou** pasta `Inbox/` do Drive).  
Saída: legendas/hashtags/CTAs por plataforma + calendário. Publicação manual via dashboard.

## Stack

- **n8n** (self-hosted, Docker, VPS Hetzner) — orquestração
- **Claude API** (Anthropic) — cérebro dos agentes
- **Supabase** — metadados e histórico
- **Google Drive** — entrada/saída de ficheiros
- **Caddy** — HTTPS automático para os webhooks do n8n
- **Dashboard** (`dashboard/`) — entrada (foto + brief) em `publish.outvibe.pt` + fila de publicação Instagram (Fase 4b)

## Como correr

1. Apontar um subdomínio (ex: `n8n.outvibe.pt`) para o IP do VPS.
2. Na VPS: copiar `.env.example` → `.env` e preencher **só** secrets de infra — ver `docs/setup/04-vps-secrets.md`.
3. `docker compose up -d`
4. Abrir `https://n8n.SEU_DOMINIO`, criar conta de admin.
5. APIs externas (Anthropic, Drive, Supabase) → **Credentials** no n8n (não no `.env`). Onde obter cada chave: `docs/setup/05-onde-conseguir-chaves.md`.
6. Restantes pré-requisitos do Workflow 01: `docs/setup/00-pre-workflow-01.md`.
7. Importar workflows de `n8n/workflows/` + migração `db/migrations/001_init.sql`.
8. Dashboard online: DNS `publish` + secrets — `docs/setup/12-dashboard-online.md`.

## Convenções

- **Workflows**: qualquer alteração no n8n é exportada como JSON para `n8n/workflows/` e commitada.
- **Prompts**: são código. Cada alteração a `agents/prompts/*.md` é um commit — o Analytics vai comparar versões. Após editar, corre `node scripts/sync-prompts-to-workflows.mjs` e reimporta os workflows 02–04 no n8n. Skills curadas: `agents/skills/`.
- **Decisões técnicas**: registadas em `docs/decisions/` (ADRs numerados).
- **Produto / PRDs**: `docs/prd/` (ex. dashboard de publicação).
- **Commits**: `feat:`, `fix:`, `docs:`, `chore:`.
- **Comunicação entre agentes**: sempre no formato de `agents/schema.json`. Nunca há comunicação direta entre agentes — tudo passa pelo Diretor.

## Roadmap

- [x] Fase 0a — Fundações no repo (Docker Compose, Caddy, schema SQL, prompts, ADRs)
- [x] Fase 0b — Config live (Supabase, pastas Drive, OAuth Drive + Anthropic + Supabase no n8n)
- [x] Fase 1 — Ingestão + BD (Workflow 01) — testado: Drive Inbox → `projetos`/`arquivos`/`logs` → Processando
- [x] Fase 2 — Agente Diretor — `02-diretor.json` (testado; normalizar `status` completo→ok)
- [x] Fase 3a — Copywriter — `03-copywriter.json` (testado)
- [x] Fase 3b — Social Media Instagram — `04-social-media.json`
- [x] Fase 4 — Output humano + calendário — `05-output.json` (ver `docs/setup/10-workflow-05.md`)
- [x] Fase 4b — **Dashboard de publicação humana** — app em `dashboard/` (PRD `docs/prd/001-dashboard-publicacao-humana.md`)
- [x] Fase 4c — **Dashboard como entrada** — upload foto+brief → workflow `00` → fábrica (`docs/setup/12-dashboard-online.md`)
- [x] Fase 5 — Feedback manual de métricas (views/likes/etc. no dashboard → `publicacoes`)
- [ ] Fase 6 — Vídeo (Whisper, FFmpeg, Agente Editor)
- [ ] Fase 7 — Viralização, Publicador automático, Analytics
