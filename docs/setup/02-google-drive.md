# B + C — Google Drive pastas + OAuth

## B. Pastas

Conta Google = a que vais autorizar no n8n.

```
OUTVIBE/
├── Inbox/
├── Processando/
├── Pronto_Para_Publicar/
└── Publicado/
```

Nomes **exactos** (underscore em `Pronto_Para_Publicar`).

### Como copiar o Folder ID

1. Abre a pasta no browser.
2. URL: `https://drive.google.com/drive/folders/1AbC...xyz`
3. Tudo depois de `/folders/` é o ID.

Guarda numa nota (vão para o Workflow 01):

| Pasta | ID |
|-------|-----|
| Inbox | |
| Processando | |

## C. Google Cloud OAuth

### Drive API

1. [Google Cloud Console](https://console.cloud.google.com/) → projeto `outvibe-n8n`.
2. **APIs & Services → Library** → **Google Drive API** → **Enable**.

### OAuth consent screen

1. **OAuth consent screen** → External → Create.
2. App name: `OutVibe n8n`.
3. Emails de suporte e contacto: os teus.
4. Scopes → Add → filtra `drive` → escolhe
   `https://www.googleapis.com/auth/drive`
   (acesso completo às pastas OUTVIBE; o MVP precisa de move).
5. Test users → Add → email da conta do Drive.
6. Guarda. Deixa em **Testing**.

### OAuth client

1. **Credentials → + Create credentials → OAuth client ID**.
2. Type: **Web application**.
3. Name: `n8n OutVibe`.
4. Authorized redirect URIs:

```
https://n8n.SEU_DOMINIO/rest/oauth2-credential/callback
```

Exemplo real:

```
https://n8n.outvibe.pt/rest/oauth2-credential/callback
```

5. Create → copia **Client ID** e **Client Secret**.

### Erros comuns

| Sintoma | Correção |
|---------|----------|
| `redirect_uri_mismatch` | URI no Google ≠ a do ecrã do n8n (https, domínio, path exactos) |
| App blocked / access denied | Email não está em Test users |
| Drive API has not been used… | API não Enable no projeto certo |
