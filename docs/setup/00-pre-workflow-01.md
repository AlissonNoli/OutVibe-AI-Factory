# Pré-requisitos antes do Workflow 01 (Ingestão)

Antes de desenhar/exportar `n8n/workflows/01-ingestao.json`, completar estes 3 passos na ordem abaixo.

Checklist rápido:

- [ ] Credenciais no n8n: Anthropic, Google Drive (OAuth), Supabase
- [ ] Projeto Supabase criado + migração `db/migrations/001_init.sql`
- [ ] Pastas no Google Drive: `OUTVIBE/{Inbox,Processando,Pronto_Para_Publicar,Publicado}`

---

## 1. Credenciais no n8n

Abrir `https://n8n.SEU_DOMINIO` → **Credentials** → criar as três abaixo.

### Anthropic API

| Campo | Valor |
|-------|--------|
| Tipo | Anthropic |
| Nome sugerido | `Anthropic OutVibe` |
| API Key | chave de [console.anthropic.com](https://console.anthropic.com/) |

Usada pelos agentes (Diretor, Copywriter, Social Media) via nó Anthropic / HTTP Request.

### Google Drive (OAuth2)

1. No [Google Cloud Console](https://console.cloud.google.com/): criar (ou reutilizar) um projeto → ativar **Google Drive API**.
2. **APIs & Services → Credentials → OAuth client ID** (tipo *Web application*).
3. Em **Authorized redirect URIs**, colar o URL OAuth que o n8n mostra ao criar a credencial (formato típico: `https://n8n.SEU_DOMINIO/rest/oauth2-credential/callback`).
4. No n8n: **Credentials → Google Drive OAuth2 API** → Client ID + Client Secret → Connect → autorizar a conta Google da OutVibe.

| Campo | Valor |
|-------|--------|
| Nome sugerido | `Google Drive OutVibe` |
| Scopes | Drive (ler/escrever/mover ficheiros nas pastas OUTVIBE) |

Guardar o **Folder ID** de cada pasta criada no passo 3 (aparece na URL do Drive: `.../folders/<ID>`). O Workflow 01 vai fixar pelo menos o de `Inbox` e `Processando`.

### Supabase

1. No projeto Supabase (passo 2): **Project Settings → API**.
2. No n8n: credencial **Header Auth** (ou nó Supabase, se disponível na versão instalada).

| Campo | Valor |
|-------|--------|
| Nome sugerido | `Supabase OutVibe` |
| URL base | `https://<PROJECT_REF>.supabase.co` |
| Header | `apikey` = **service_role** key |
| Header extra | `Authorization` = `Bearer <service_role>` |

Usar a **service_role** (nunca a `anon` no n8n): o pipeline precisa de escrita sem RLS do utilizador final. Não commitar a service_role no repo.

Referência: as variáveis estão comentadas em `.env.example` — vivem só dentro do n8n, não no `.env` da VPS.

---

## 2. Projeto Supabase + migração

1. Criar projeto em [supabase.com](https://supabase.com) (região próxima de PT/EU, ex. `eu-west-1` / Frankfurt).
2. **SQL Editor → New query** → colar o conteúdo de `db/migrations/001_init.sql` → Run.
3. Confirmar tabelas: `projetos`, `arquivos`, `conteudos`, `publicacoes`, `logs`.

O Workflow 01 escreve em `projetos` (+ opcionalmente `arquivos` e `logs`) assim que um ficheiro entra em `Inbox`.

---

## 3. Estrutura de pastas no Google Drive

Criar (partilha com a conta OAuth usada no n8n):

```
OUTVIBE/
├── Inbox/                 ← trigger do Workflow 01
├── Processando/           ← após registo no Supabase
├── Pronto_Para_Publicar/  ← output humano (fase 4)
└── Publicado/             ← após publicação manual
```

Convenção de nomes: exactamente estes segmentos (case-sensitive no código do workflow).

Anotar:

| Pasta | Folder ID |
|-------|-----------|
| OUTVIBE | |
| Inbox | |
| Processando | |
| Pronto_Para_Publicar | |
| Publicado | |

Opcional: `scripts/criar-pastas-drive.md` descreve o mesmo layout para quem cria à mão ou via API.

---

## Pronto para o Workflow 01

Quando os 3 itens estiverem feitos:

1. Desenhar no n8n: trigger Drive (`Inbox`) → insert Supabase → mover para `Processando`.
2. Exportar JSON para `n8n/workflows/01-ingestao.json` e commit.
3. Atualizar o roadmap no `README.md` (Fase 1).
