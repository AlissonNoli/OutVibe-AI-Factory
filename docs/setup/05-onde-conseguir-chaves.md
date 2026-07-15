# Onde conseguir cada API / secret (do zero)

Mapa rápido: o que precisas → **em que site** clicas → **o que copias** → **onde colas**.

| O que precisas | Site | O que copias | Onde colas |
|----------------|------|--------------|------------|
| Project URL + `service_role` | [supabase.com](https://supabase.com) | URL + chave secret | n8n → Credentials |
| Client ID + Client Secret (Drive) | [console.cloud.google.com](https://console.cloud.google.com) | ID + Secret | n8n → Credentials Google Drive |
| API key Claude | [console.anthropic.com](https://console.anthropic.com) | `sk-ant-...` | n8n → Credentials Anthropic |
| Encryption key + Postgres pass | Geras **na VPS** com `openssl` | hex aleatório | ficheiro `.env` na VPS |
| Folder IDs do Drive | [drive.google.com](https://drive.google.com) | ID na URL da pasta | nós do Workflow 01 |

Contas novas (grátis para começar):
1. Google (Gmail) — Drive + Cloud Console  
2. Supabase — GitHub / Google login  
3. Anthropic — email + cartão (há crédito free / pay-as-you-go)  
4. Acesso SSH à VPS Hetzner (já com o repo e Docker)

---

## 1. Supabase — URL e chave `service_role`

### Criar conta / projeto
1. Vai a **https://supabase.com** → **Start your project**.
2. Entra com GitHub ou Google.
3. **New project**:
   - Name: `outvibe-ai-factory`
   - Database password: gera e **guarda** (password manager)
   - Region: Ireland ou Frankfurt
   - **Create**

### Obter as chaves
1. No projeto aberto → ícone **Settings** (engrenagem, baixo à esquerda).
2. **API** (ou **Data API** / **API Keys**, conforme a UI).
3. Copia:
   - **Project URL** → tipo `https://abcdefgh.supabase.co`
   - Em **Project API keys** → **`service_role`** → **Reveal** → Copy  
     (é a secret longa; **não** uses a `anon` / `public` no n8n)

### Correr as tabelas
1. Menu **SQL** → **SQL Editor** → New.
2. Abre no PC o ficheiro do repo `db/migrations/001_init.sql`, copia tudo, cola, **Run**.
3. **Table Editor**: devem aparecer `projetos`, `arquivos`, `conteudos`, `publicacoes`, `logs`.

### Colar no n8n
Credentials → Header Auth (ou nó Supabase) → ver `03-credenciais-n8n.md`.

---

## 2. Google — pastas + OAuth (para o Drive no n8n)

Precisas de **duas coisas Google**: pastas no Drive + Client OAuth no Cloud Console.

### 2a. Pastas (Drive)
1. **https://drive.google.com** (conta que vais usar no n8n).
2. **Novo → Pasta** → `OUTVIBE`.
3. Dentro, cria exactamente:
   - `Inbox`
   - `Processando`
   - `Pronto_Para_Publicar`
   - `Publicado`
4. Abre cada pasta. Na barra do browser:
   `https://drive.google.com/drive/folders/`**`1ABC...xyz`**  
   Esse `1ABC...xyz` é o **Folder ID** — anota sobretudo Inbox e Processando.

### 2b. Ligar o n8n ao Drive (Cloud Console)
1. **https://console.cloud.google.com** → mesmo Google da conta do Drive.
2. Cria um **projeto** (ex. `outvibe-n8n`) ou escolhe um.
3. Menu ☰ → **APIs & Services** → **Library**.
4. Procura **Google Drive API** → **Enable**.
5. **APIs & Services** → **OAuth consent screen**:
   - User type: **External** → Create  
   - App name: `OutVibe n8n`  
   - Emails: o teu  
   - **Save**  
   - **Audience / Test users** → Add users → o teu email Gmail  
   - Deixa em **Testing**
6. **Credentials** → **+ Create credentials** → **OAuth client ID**:
   - Application type: **Web application**  
   - Name: `n8n OutVibe`  
   - **Authorized redirect URIs** → **Add URI**:

```
https://n8n.SEU_DOMINIO/rest/oauth2-credential/callback
```

   Exemplo: `https://n8n.outvibe.pt/rest/oauth2-credential/callback`  
   (substitui pelo domínio real do teu n8n; tem de ser HTTPS)

7. **Create** → ecrã com:
   - **Client ID** (tipo `xxxxx.apps.googleusercontent.com`)
   - **Client Secret** (tipo `GOCSPX-...`)  
   → copia os dois para o password manager.

### Colar no n8n
Credentials → **Google Drive OAuth2 API** → Client ID + Secret → **Sign in with Google** → Allow.

Se der `redirect_uri_mismatch`: o URI no Google ≠ o que o n8n mostra no formulário da credencial (copia o URL exacto do n8n para o Cloud Console).

---

## 3. Anthropic — API key (Claude)

1. Vai a **https://console.anthropic.com**.
2. Cria conta / login (email).
3. Se pedir plano/billing: completa o mínimo para ter acesso à API (Claude API não é ChatGPT free).
4. Menu **API Keys** (ou **Settings → API keys**).
5. **Create Key**:
   - Name: `outvibe-n8n`
   - Create → copia **já** a chave `sk-ant-api03-...` (só aparece uma vez).

### Colar no n8n
Credentials → **Anthropic** → Name `Anthropic OutVibe` → cola a key → Save.

---

## 4. Secrets da VPS (não são “APIs” — geras tu)

Não vêm de nenhum site. Na VPS, no directório do repo:

```bash
cp .env.example .env

# Encryption key (guarda no password manager + no .env)
openssl rand -hex 32

# Password Postgres interno do n8n
openssl rand -hex 24

nano .env
chmod 600 .env
docker compose up -d
```

No `.env` só:

```env
N8N_DOMAIN=n8n.outvibe.pt
N8N_ENCRYPTION_KEY=<resultado do 1.º openssl>
POSTGRES_USER=n8n
POSTGRES_PASSWORD=<resultado do 2.º openssl>
```

Detalhe: `04-vps-secrets.md`.

---

## Ordem recomendada (hoje)

1. **VPS `.env` + compose** → n8n abre em HTTPS  
2. **Supabase** → URL + `service_role` + SQL  
3. **Drive pastas** → Folder IDs  
4. **Google Cloud OAuth** → Client ID + Secret  
5. **Anthropic** → `sk-ant-...`  
6. **n8n Credentials** → colar as três  

Folha para preencheres à mão (não commits):

```
N8N_DOMAIN=
N8N_ENCRYPTION_KEY=          (só password manager + .env)
POSTGRES_PASSWORD=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DRIVE_INBOX_FOLDER_ID=
DRIVE_PROCESSANDO_FOLDER_ID=

ANTHROPIC_API_KEY=
```

Quando tiveres a primeira (Supabase ou Anthropic), diz qual e validamos o next step.
