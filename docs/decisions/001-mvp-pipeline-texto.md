# ADR 001 — MVP começa como pipeline de texto (fotos + brief), sem vídeo e sem publicação automática

**Data:** 2026-07-15 · **Estado:** Aceite

## Contexto
Os blueprints descrevem uma fábrica completa (vídeo, Whisper, FFmpeg, publicação automática, analytics). No arranque não existem vídeos e a publicação será manual.

## Decisão
O MVP v0.1 implementa apenas: Ingestão (Drive) → Supabase → Agente Diretor → Copywriter → Social Media → pasta `Pronto_Para_Publicar` + calendário. Entrada: brief em texto + fotos. Publicação: humana.

## Consequências
- Valida-se primeiro o núcleo (Diretor + schema de comunicação + prompts versionados), que é o que torna o resto plugável.
- Editor, Viralização, Publicador e Analytics entram nas fases 6-7 sem alterar a arquitetura.
- Custo e complexidade mínimos (VPS ~4€/mês + API Claude + Supabase free tier).
