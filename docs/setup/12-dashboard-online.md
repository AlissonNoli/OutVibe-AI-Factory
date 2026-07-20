# Setup 12 — Dashboard online + ingestão (foto + brief)

O dashboard em `publish.outvibe.pt` serve para:
1. **Novo projecto** — enviar foto(s) + brief → n8n workflow `00`
2. **Fila** — copiar legendas e marcar publicado (Fases 4b/5)

O Inbox do Google Drive (workflow `01`) continua a funcionar em paralelo.

## Pré-requisitos

- n8n já online (`https://n8n.outvibe.pt`)
- Credenciais n8n: Google Drive + Supabase
- Workflows `02`–`05` activos (ou prontos a correr)

## 1. DNS

Cria um registo **A**:

| Host | Valor |
|------|--------|
| `publish` | IP da VPS (mesmo de `n8n.outvibe.pt`) |

Espera a propagação (minutos a horas).

## 2. Secrets na VPS

No `.env` da raiz do repo (junto ao `docker-compose.yml`), além do que já tens:

```env
DASHBOARD_DOMAIN=publish.outvibe.pt
DASHBOARD_PASSWORD=escolhe-uma-password-forte
DASHBOARD_INGEST_TOKEN=openssl-rand-hex-32
SUPABASE_URL=https://TEU_REF.supabase.co
SUPABASE_SERVICE_KEY=eyJ...service_role...
N8N_INGEST_WEBHOOK_URL=https://n8n.outvibe.pt/webhook/outvibe-ingest
```

Gera o token:

```bash
openssl rand -hex 32
```

O **mesmo** `DASHBOARD_INGEST_TOKEN` tem de existir no ambiente do contentor **n8n** (já mapeado no `docker-compose.yml`). O compose define `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` para o Code do workflow 00 poder ler `$env.DASHBOARD_INGEST_TOKEN`.

## 3. Importar e activar o workflow 00

1. n8n → Import from File → `n8n/workflows/00-ingestao-dashboard.json`
2. Nos nós Supabase / Google Drive: seleccionar as credenciais OutVibe
3. **Activate** o workflow
4. Copia o URL de produção do Webhook (deve terminar em `/webhook/outvibe-ingest`) e confirma que bate certo com `N8N_INGEST_WEBHOOK_URL`

## 4. Subir o dashboard

Na VPS, na pasta do repo:

```bash
docker compose up -d --build dashboard caddy
# ou rebuild completo:
docker compose up -d --build
```

Abre `https://publish.outvibe.pt` → password → **Novo projecto**.

## 5. Teste ponta a ponta

1. Dashboard → Novo projecto → brief curto + 1 foto → Enviar
2. Resposta com `projeto_id`
3. Supabase: `projetos.estado = ingerido`, `origem = dashboard`, linha(s) em `arquivos`
4. Drive pasta **Processando**: foto(s) lá
5. Correr / esperar workflow `02` Diretor → … → `05` → fila **Por publicar** no dashboard

## Troubleshooting

| Sintoma | Verificar |
|---------|-----------|
| 401 no Enviar | `DASHBOARD_INGEST_TOKEN` igual no dashboard e no n8n; workflow 00 activo |
| 503 ingest | Token em falta no contentor n8n → `docker compose up -d` de novo |
| Webhook 404 | Path `outvibe-ingest` e URL *production* (não test) |
| Sem foto no Drive | Credencial Google Drive no nó upload; folder Processando |
| TLS / domínio | DNS A + Caddy logs: `docker compose logs caddy` |
