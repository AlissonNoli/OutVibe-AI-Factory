# Secrets na VPS — o que vai onde

**Onde obter cada chave (sites e cliques):** `docs/setup/05-onde-conseguir-chaves.md`.

Há **dois sítios** de secrets. Não mistures.

```
┌─────────────────────────────────────────────────────────┐
│  VPS  →  ficheiro .env  (só infra)                      │
│  • N8N_DOMAIN                                           │
│  • N8N_ENCRYPTION_KEY   ← encripta as credenciais n8n   │
│  • POSTGRES_USER / POSTGRES_PASSWORD                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  n8n UI  →  Credentials  (APIs externas)                │
│  • Anthropic API key                                    │
│  • Google Drive OAuth (Client ID + Secret + tokens)     │
│  • Supabase service_role                                │
│  Guardadas encriptadas no volume n8n_data / Postgres    │
│  com a N8N_ENCRYPTION_KEY                               │
└─────────────────────────────────────────────────────────┘
```

**Regra:** Anthropic, Supabase e Google Drive **não** entram no `.env` da VPS. Configuram-se em `https://n8n.SEU_DOMINIO` → Credentials (ver `03-credenciais-n8n.md`).

Se perderes a `N8N_ENCRYPTION_KEY`, as credenciais no n8n ficam ilegíveis — tens de as recriar.

---

## 1. Preparar o `.env` na VPS

SSH na máquina (exemplo):

```bash
ssh root@IP_DA_VPS
cd /opt/outvibe-ai-factory   # ou o path onde clonaste o repo
```

Se ainda não existe `.env`:

```bash
cp .env.example .env
nano .env   # ou vim
```

Gera os secrets **na própria VPS** (não cries passwords fracas à mão):

```bash
# Encryption key do n8n (32 bytes hex). GERAR UMA VEZ e nunca mudar.
openssl rand -hex 32

# Password do Postgres interno do n8n
openssl rand -hex 24
```

Preenche o `.env` assim:

```env
N8N_DOMAIN=n8n.outvibe.pt

N8N_ENCRYPTION_KEY=<cola_o_primeiro_openssl>

POSTGRES_USER=n8n
POSTGRES_PASSWORD=<cola_o_segundo_openssl>
```

Permissões (só o teu user lê):

```bash
chmod 600 .env
```

Confirma que `.env` está no `.gitignore` (já está no repo) — **nunca** commits este ficheiro.

Guarda a `N8N_ENCRYPTION_KEY` também num password manager (backup fora da VPS).

---

## 2. Arrancar / recarregar a stack

Primeira vez (DNS A de `N8N_DOMAIN` já a apontar para o IP da VPS):

```bash
docker compose up -d
docker compose ps
docker compose logs -f caddy   # HTTPS / certificados
```

Se **alterares** o `.env` depois (password, domínio, etc.):

```bash
docker compose up -d --force-recreate
```

**Atenção:** mudar `N8N_ENCRYPTION_KEY` depois do 1.º arranque parte as credenciais já gravadas. Só muda se fores apagar volumes e começar do zero.

---

## 3. APIs e secrets no n8n (não no `.env`)

1. Abre `https://n8n.SEU_DOMINIO` → cria o admin na primeira visita.
2. **Credentials → Add credential** e cria:

| Nome | Tipo | O que colar |
|------|------|-------------|
| `Anthropic OutVibe` | Anthropic | API key `sk-ant-...` |
| `Google Drive OutVibe` | Google Drive OAuth2 | Client ID + Secret → Connect |
| `Supabase OutVibe` | Header Auth / Supabase | `service_role` + URL do projeto |

Detalhe clique a clique: `docs/setup/03-credenciais-n8n.md`.

Estas chaves ficam encriptadas com `N8N_ENCRYPTION_KEY` e persistidas nos volumes Docker `n8n_data` + `postgres_data`.

---

## 4. Checklist de segurança na VPS

```bash
# Firewall: só SSH + HTTP/HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

- Não abras a porta `5678` do n8n à internet (o Compose já só faz `expose` interno; o Caddy faz proxy em 443).
- Backup periódico: volumes `n8n_data`, `postgres_data`, e cópia segura do `.env` (com a encryption key).
- Updates: `docker compose pull && docker compose up -d`.

---

## 5. O que NÃO fazer

| Errado | Porquê |
|--------|--------|
| Meter `ANTHROPIC_API_KEY` no `.env` “para facilitar” | O Compose actual não injecta isso; o padrão do projeto é Credentials no n8n |
| Commitar `.env` | Expõe Postgres + encryption key |
| Rodar sem `N8N_ENCRYPTION_KEY` | n8n gera uma aleatória; se recriares o contentor podes perder as credentials |
| Partilhar `service_role` do Supabase em Slack/PR | Acesso total à BD |

---

## 6. Recuperação rápida

| Situação | Acção |
|----------|--------|
| Esqueci a password do admin n8n | Reset via UI ou recriar user na DB interna (último recurso) |
| Perdi `N8N_ENCRYPTION_KEY` | Recriar as 3 Credentials no n8n; a key antiga no backup já não ajuda sem o mesmo key |
| Quero rodar tudo de novo | `docker compose down -v` apaga dados; gera nova encryption key; recria Credentials |

Quando o `.env` estiver estável e o n8n abrir em HTTPS, volta a `00-pre-workflow-01.md` (passos D–E) para colar as APIs na UI.
