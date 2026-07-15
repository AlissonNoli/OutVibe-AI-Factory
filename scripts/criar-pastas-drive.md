# Criar pastas OUTVIBE no Google Drive

Guia completo (cliques + OAuth): `docs/setup/00-pre-workflow-01.md` e `docs/setup/02-google-drive.md`.

Layout exigido (nomes exactos):

```
OUTVIBE/
├── Inbox
├── Processando
├── Pronto_Para_Publicar
└── Publicado
```

## Manual (recomendado no arranque)

1. Conta Google = a do OAuth do n8n → pasta raiz `OUTVIBE`.
2. Quatro subpastas com os nomes acima.
3. Copiar cada Folder ID da URL → anotar no passo B de `docs/setup/00-pre-workflow-01.md`.

## Via Google Drive API (opcional)

Com access token OAuth (`https://www.googleapis.com/auth/drive`):

```bash
curl -s -X POST 'https://www.googleapis.com/drive/v3/files' \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"OUTVIBE","mimeType":"application/vnd.google-apps.folder"}'
```

Repetir para cada subpasta com `"parents":["<ID_DA_OUTVIBE>"]`.
