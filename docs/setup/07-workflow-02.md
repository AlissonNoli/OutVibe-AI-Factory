# Workflow 02 — Agente Diretor (Claude)

Poll Supabase → projetos com `estado=ingerido` → (opcional) download foto → Claude → grava `plano` + `estado=planeado`.

Precisas das credenciais: **Supabase**, **Google Drive**, **Anthropic** (já tens as 3).

## Importar

1. No PC: `git pull origin main` (ou a branch do PR) → ficheiro  
   `n8n/workflows/02-diretor.json`
2. n8n → Workflows → ⋮ → **Import from File**
3. Liga credenciais nos nós:
   - Supabase → `Supabase account`
   - Drive → `Google Drive account`
   - HTTP Claude → `Anthropic OutVibe` (tipo Anthropic API)
4. **Save** → **Publish**

## Testar com o projeto que já ingeriste

O teu projeto actual está em `estado=ingerido` — perfeito.

1. Abre o workflow **02 — Diretor**
2. Clica **Execute workflow** (trigger Manual)
3. Espera a execução (Claude pode demorar 10–30s)
4. Confirma:
   - n8n Executions → **Succeeded**
   - Supabase `projetos` → `estado = planeado` e coluna `plano` preenchida (JSON)
   - `logs` → mensagem do agente `diretor`

## Se não houver projetos ingeridos

Ou faz novo upload na Inbox (Workflow 01), ou no Supabase:

```sql
update projetos set estado = 'ingerido', plano = null
where id = 'COLA_O_UUID';
```

## Corrigir o projeto actual (já tem plano bom mas `estado=erro`)

No SQL Editor do Supabase:

```sql
update projetos
set estado = 'planeado'
where id = 'ed6ef11b-7e4b-4c26-ab91-5b9f3023ddba'
  and plano is not null;
```

(O plano JSON já está gravado — só o estado ficou mal por causa do `status: "completo"`.)

## Erros comuns

| Sintoma | Fix |
|---------|-----|
| Plano válido mas `estado=erro` | Claude usou `status: completo` — parser já normaliza; atualiza o nó Code no n8n ou re-importa `02-diretor.json` |
| 401 Anthropic | Credencial Anthropic no nó HTTP |
| 404 model | No nó **Code — prompt Diretor**, troca `claude-sonnet-4-5` por o modelo da tua conta (ex. `claude-3-5-sonnet-latest`) |
| Filtro Supabase falha | No nó listagem, usa Filter UI: `estado` equals `ingerido` |
| Plano inválido / status erro | Vê `projetos.plano.problemas` e o log |

## Prompt

A system prompt está embutida no nó Code (cópia de `agents/prompts/diretor.md`). Se mudares o markdown no repo, atualiza também o Code no n8n e re-exporta o JSON.

## Depois disto

Fase 3 — Copywriter + Social Media (consomem `plano` onde `estado=planeado`).
