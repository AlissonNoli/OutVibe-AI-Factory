# ADR 002 — n8n self-hosted em VPS Hetzner com Caddy

**Data:** 2026-07-15 · **Estado:** Aceite

## Contexto
O trigger do Google Drive e os webhooks exigem o n8n sempre online e acessível por HTTPS.

## Decisão
VPS Hetzner (CX22 chega para o MVP), Docker Compose com n8n + Postgres + Caddy (HTTPS automático via Let's Encrypt). Subdomínio dedicado (ex: n8n.outvibe.pt).

## Consequências
- Custo fixo baixo vs n8n Cloud.
- Responsabilidade nossa: backups do volume `n8n_data` e do Postgres; firewall só com portas 22/80/443.
- `N8N_ENCRYPTION_KEY` guardada em local seguro — perdê-la = perder as credenciais gravadas no n8n.
