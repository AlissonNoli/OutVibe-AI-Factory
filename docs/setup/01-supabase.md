# A — Supabase: projeto + migração

## Criar o projeto

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Organização: a tua (ou cria uma `OutVibe`).
3. Project name: `outvibe-ai-factory`.
4. Database password: gera e guarda num sítio seguro (password manager).
5. Region: **West EU (Ireland)** ou **Central EU (Frankfurt)**.
6. **Create new project** → espera status Healthy.

## Correr a migração

1. Sidebar → **SQL** → **SQL Editor**.
2. **+ New query**.
3. Copia o ficheiro do repo `db/migrations/001_init.sql` na íntegra.
4. Cola → **Run** (canto inferior direito).
5. Deve aparecer *Success. No rows returned* (ou similar).

## Verificar

1. Sidebar → **Table Editor**.
2. Deves ver:

| Tabela | Uso no MVP |
|--------|------------|
| `projetos` | Workflow 01 cria uma linha por ingestão |
| `arquivos` | Ficheiros ligados ao projeto |
| `conteudos` | Outputs dos agentes (fases 2–3) |
| `publicacoes` | Calendário / estado publicação (fase 4+) |
| `logs` | Diagnóstico |

## Guardar para o n8n

**Project Settings → API**:

- Project URL: `https://______.supabase.co`
- `anon` `public` — **não** usar no n8n do pipeline
- `service_role` `secret` — **esta** vai para a credencial n8n (Reveal → copy)

Não commits esta key. Não a metas em `.env` da VPS (só dentro do n8n).
