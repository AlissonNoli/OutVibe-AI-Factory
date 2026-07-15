# Criar pastas OUTVIBE no Google Drive

Layout exigido pelo MVP (nomes exactos):

```
OUTVIBE/
├── Inbox
├── Processando
├── Pronto_Para_Publicar
└── Publicado
```

## Manual (recomendado no arranque)

1. Na conta Google ligada ao OAuth do n8n, criar a pasta raiz `OUTVIBE`.
2. Dentro dela, criar as quatro subpastas acima.
3. Abrir cada pasta e copiar o ID da URL (`https://drive.google.com/drive/folders/<ID>`).
4. Guardar os IDs na checklist em `docs/setup/00-pre-workflow-01.md` (usados pelos nós do n8n).

Partilhar a pasta raiz com a mesma conta se o OAuth for de outro utilizador (ex.: service account futura — no MVP é OAuth de utilizador).

## Via Google Drive API (opcional)

Com um access token OAuth com scope `https://www.googleapis.com/auth/drive`:

```bash
# Criar pasta (substituir PARENT_ID; para a raiz omitir parents)
curl -s -X POST 'https://www.googleapis.com/drive/v3/files' \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"OUTVIBE","mimeType":"application/vnd.google-apps.folder"}'
```

Repetir para cada subpasta com `"parents":["<ID_DA_OUTVIBE>"]` e `name` igual a `Inbox`, `Processando`, `Pronto_Para_Publicar`, `Publicado`.
