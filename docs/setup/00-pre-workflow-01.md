# Passo a passo — antes do Workflow 01

Faz **nesta ordem**. Cada secção termina com “como saber que está feito”.

| # | O quê | Onde |
|---|--------|------|
| 0 | `.env` na VPS (domínio, encryption key, Postgres) | `docs/setup/04-vps-secrets.md` |
| A | Projeto + tabelas | Supabase |
| B | Pastas OUTVIBE | Google Drive |
| C | OAuth do Drive | Google Cloud Console |
| D | API key Claude | Anthropic |
| E | As 3 credenciais | n8n (não no `.env`) |

Checklist:

- [ ] 0 — `.env` na VPS + `docker compose up -d` + n8n em HTTPS
- [ ] A — Supabase + `001_init.sql`
- [ ] B — Pastas Drive + IDs anotados
- [ ] C — Client OAuth Google (redirect URI do n8n)
- [ ] D — Chave Anthropic (**adiado** — só na Fase 2 / Agente Diretor)
- [x] E parcial — Credenciais no n8n: Drive + Supabase (Anthropic depois)

Detalhe: `05-onde-conseguir-chaves.md` (links e cliques), `04-vps-secrets.md`, `01`–`03`.

---

## 0. Secrets na VPS (antes de tudo)

Na VPS: `cp .env.example .env` → preencher só `N8N_DOMAIN`, `N8N_ENCRYPTION_KEY`, `POSTGRES_*` → `docker compose up -d`.

APIs (Anthropic, Drive, Supabase) **não** vão para o `.env`. Passo a passo: **`docs/setup/04-vps-secrets.md`**.

✅ Feito quando `https://n8n.SEU_DOMINIO` abre e pedes criar o admin.

---

## A. Supabase (10–15 min)

1. Abre [supabase.com](https://supabase.com) → **Start your project** / Sign in.
2. **New project**
   - Name: `outvibe-ai-factory` (ou similar)
   - Database password: gera uma forte e **guarda-a** (não vais precisar dela no n8n, mas sim se usares SQL direto)
   - Region: **West EU (Ireland)** ou **Central EU (Frankfurt)** — a mais perto de PT
   - Plan: Free
3. Espera o projeto ficar **Healthy** (1–2 min).
4. Menu esquerdo → **SQL Editor** → **New query**.
5. Abre no repo o ficheiro `db/migrations/001_init.sql`, copia **tudo**, cola no editor → **Run**.
6. Confirma: menu **Table Editor** deve mostrar `projetos`, `arquivos`, `conteudos`, `publicacoes`, `logs`.
7. **Project Settings** (ícone engrenagem) → **API** — anota:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **service_role** (secret) → só colar no n8n; **nunca** no Git

✅ Feito quando as 5 tabelas existem e tens URL + `service_role`.

---

## B. Pastas no Google Drive (5 min)

Na **mesma conta Google** que vais autorizar no n8n:

1. [drive.google.com](https://drive.google.com) → **Novo** → **Pasta** → nome `OUTVIBE`.
2. Entra em `OUTVIBE` e cria 4 pastas (nomes exactos):

```
Inbox
Processando
Pronto_Para_Publicar
Publicado
```

3. Abre cada pasta; na barra de endereço copia o ID:

`https://drive.google.com/drive/folders/`**`ESTE_E_O_ID`**

4. Preenche:

| Pasta | Folder ID |
|-------|-----------|
| OUTVIBE | |
| Inbox | |
| Processando | |
| Pronto_Para_Publicar | |
| Publicado | |

O Workflow 01 usa sobretudo **Inbox** (trigger) e **Processando** (destino do move).

✅ Feito quando as 5 pastas existem e os IDs estão anotados.

---

## C. Google Cloud — OAuth para o Drive (10–15 min)

Precisas do n8n já acessível em HTTPS (ex. `https://n8n.outvibe.pt`).

1. [console.cloud.google.com](https://console.cloud.google.com/) → cria projeto `outvibe-n8n` (ou escolhe um existente).
2. **APIs & Services → Library** → procura **Google Drive API** → **Enable**.
3. **APIs & Services → OAuth consent screen**
   - User type: **External** (ou Internal se for Google Workspace)
   - App name: `OutVibe n8n`
   - User support email + developer contact: o teu email
   - Scopes: adiciona `.../auth/drive` (ou o que o n8n pedir ao conectar)
   - Test users: adiciona o email da conta Google do passo B
   - Publishing status: **Testing** chega para o MVP
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `n8n OutVibe`
   - **Authorized redirect URIs** → adiciona exactamente:

```
https://n8n.SEU_DOMINIO/rest/oauth2-credential/callback
```

   Substitui `n8n.SEU_DOMINIO` pelo teu (ex. `n8n.outvibe.pt`).  
   Dica: no n8n, ao criar a credencial Drive, o ecrã mostra este URL — copia de lá para não errar.
5. Guarda **Client ID** e **Client Secret**.

✅ Feito quando tens Client ID + Secret e o redirect URI aponta para o teu n8n.

---

## D. Anthropic API key (2 min)

1. [console.anthropic.com](https://console.anthropic.com/) → sign in.
2. **API Keys** → **Create Key** → nome `outvibe-n8n`.
3. Copia a chave (`sk-ant-...`) — só aparece uma vez.

✅ Feito quando tens a `sk-ant-...` guardada fora do Git.

---

## E. Credenciais dentro do n8n (10 min)

Abre `https://n8n.SEU_DOMINIO` (já com admin criado).

### E1. Anthropic

1. Menu esquerdo → **Credentials** → **Add credential**.
2. Procura **Anthropic** → seleciona.
3. Name: `Anthropic OutVibe`
4. API Key: cola a chave do passo D → **Save**.

### E2. Google Drive

1. **Add credential** → **Google Drive OAuth2 API**.
2. Name: `Google Drive OutVibe`
3. Cola Client ID + Client Secret do passo C.
4. Confirma que o **OAuth Redirect URL** mostrado no n8n é o mesmo que registaste no Google Cloud.
5. **Sign in with Google** → escolhe a conta do passo B → Allow.
6. **Save**.

### E3. Supabase

O nó nativo “Supabase” pode variar por versão. Forma estável para o MVP:

1. **Add credential** → **Header Auth**.
2. Name: `Supabase OutVibe`
3. Name (header): `apikey`
4. Value: a **service_role** do passo A
5. **Save**.

Nos HTTP Request nodes do workflow, URL base:

```
https://<PROJECT_REF>.supabase.co/rest/v1/
```

Headers em cada request (além da credencial `apikey`):

| Header | Valor |
|--------|--------|
| `Authorization` | `Bearer <service_role>` |
| `Content-Type` | `application/json` |
| `Prefer` | `return=representation` (em inserts) |

Se a tua versão do n8n tiver credencial/nó **Supabase**, podes usá-la com Host = Project URL e Service Role Secret = `service_role`.

✅ Feito quando as 3 credenciais aparecem em Credentials sem erro de auth.

---

## Pronto para desenhar o Workflow 01

Só depois de A–E:

1. No n8n: trigger **Google Drive** (pasta `Inbox`) → **HTTP Request** insert em `projetos` → **Google Drive** move para `Processando`.
2. Exportar → `n8n/workflows/01-ingestao.json` → commit.
3. Marcar Fase 0b / Fase 1 no `README.md`.
