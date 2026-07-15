# Workflow 01 — Ingestão (sem Anthropic)

Fluxo: ficheiro novo em **Inbox** → linha em `projetos` + `arquivos` → move para **Processando** → log.

Claude/Anthropic **não** entra aqui (Fase 2 — Diretor).

## Importar o JSON

1. n8n → **Workflows** → **⋯** / Add → **Import from File**
2. Escolhe `n8n/workflows/01-ingestao.json` (do repo, na VPS ou no PC)
3. Em cada nó Google Drive / Supabase: seleciona a credencial que já criaste
   - Google Drive OAuth (Account connected)
   - Supabase account
4. **Save** → **Active** (toggle)

## Teste

1. Faz **upload** de um ficheiro novo para Inbox  
   (não moves de outra pasta do Drive — o trigger `fileCreated` falha muitas vezes com move)
2. Espera até 1 minuto (poll)
3. Confirma:
   - ficheiro saiu de Inbox → entrou em **Processando**
   - Supabase **Table Editor** → `projetos` tem 1 linha `estado=ingerido`
   - `arquivos` tem o ficheiro ligado
   - `logs` tem mensagem de ingestão

## Se o trigger não dispara

- Workflow tem de estar **Active**
- Upload directo para Inbox (não “mover” dentro do Drive)
- Alternativa: no trigger muda **Event** para `fileUpdated` e testa de novo

## Folder IDs (já no JSON)

| Pasta | ID |
|-------|-----|
| Inbox | `1cZ9zefDmV35Z-LjavbbFlZa_tol6C3RV` |
| Processando | `1RiQ5JMJASZnG4bOeghOfJTjUpqDXHQBF` |

Ver também `docs/setup/drive-folder-ids.md`.
