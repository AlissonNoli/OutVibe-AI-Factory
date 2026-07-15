# D + E — Anthropic + credenciais no n8n

Pré-requisito: VPS com `.env` (só infra) e n8n em HTTPS — ver `04-vps-secrets.md`.

As chaves abaixo **não** se metem no `.env` da VPS: vão para **Credentials** na UI do n8n (ficam encriptadas com `N8N_ENCRYPTION_KEY`).

## D. Anthropic

1. [console.anthropic.com](https://console.anthropic.com/) → API Keys.
2. Create Key → `outvibe-n8n`.
3. Copia `sk-ant-api...` para o password manager.

## E. Três credenciais no n8n

UI: menu esquerdo (⋯ ou ícone) → **Credentials** → **Add credential**.

### 1) Anthropic OutVibe

| Campo | Valor |
|-------|--------|
| Type | Anthropic |
| Name | `Anthropic OutVibe` |
| API Key | chave do passo D |

Save. Sem teste obrigatório até usares um nó Claude.

### 2) Google Drive OutVibe

| Campo | Valor |
|-------|--------|
| Type | Google Drive OAuth2 API |
| Name | `Google Drive OutVibe` |
| Client ID | do Google Cloud |
| Client Secret | do Google Cloud |

1. Confirma o **OAuth Redirect URL** no topo do formulário n8n.
2. Esse URL tem de existir em Authorized redirect URIs no Google Cloud.
3. **Connect** / Sign in with Google → conta das pastas OUTVIBE → Allow.
4. Save.

Teste rápido: cria um workflow vazio → nó Google Drive → File → List → Folder = Inbox ID → Execute. Deve listar sem erro 401.

### 3) Supabase OutVibe

**Opção A — Header Auth** (funciona em qualquer versão):

| Campo | Valor |
|-------|--------|
| Type | Header Auth |
| Name | `Supabase OutVibe` |
| Header Name | `apikey` |
| Header Value | `service_role` do Supabase |

Nos HTTP Request:

- Method: `POST`
- URL: `https://<REF>.supabase.co/rest/v1/projetos`
- Authentication: Header Auth → `Supabase OutVibe`
- Headers extras:
  - `Authorization`: `Bearer <service_role>`
  - `Content-Type`: `application/json`
  - `Prefer`: `return=representation`
- Body (exemplo insert Workflow 01):

```json
{
  "origem": "google_drive",
  "tipo_entrada": "brief_texto",
  "estado": "ingerido",
  "brief": "{{ $json.brief }}",
  "pasta_drive_id": "{{ $json.folderId }}"
}
```

**Opção B — nó Supabase** (se existir na tua build):

| Campo | Valor |
|-------|--------|
| Host | Project URL (`https://….supabase.co`) |
| Service Role Secret | `service_role` |

## Verificação final

Em **Credentials** devem existir, sem badge de erro:

1. `Anthropic OutVibe`
2. `Google Drive OutVibe`
3. `Supabase OutVibe`

Aí podes desenhar o Workflow 01.
