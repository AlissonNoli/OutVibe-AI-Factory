# Workflow 03 — Copywriter (Claude → texto-mãe)

Poll `projetos` com `estado=planeado` → Claude Copywriter → grava em `conteudos` → `estado=escrito`.

## Pré-requisitos

- Workflow 02 ok (projeto com `estado=planeado` e coluna `plano` preenchida)
- Credenciais n8n: Supabase, Google Drive, Anthropic

## Importar

1. `git pull` da branch / main → `n8n/workflows/03-copywriter.json`
2. n8n → ⋮ → **Import from File**
3. Liga credenciais nos nós Supabase / Drive / HTTP Claude
4. **Save** → **Publish**

## Testar

1. Confirma no Supabase: `projetos.estado = planeado`
2. Abre **03 — Copywriter** → **Execute workflow**
3. Espera 20–60s (vários textos)
4. Confirma:
   - Executions → **Succeeded**
   - `conteudos` → várias linhas `agente=copywriter` (hook, corpo, cta…)
   - `projetos.estado` → **`escrito`**
   - `logs` → mensagem Copywriter

## Reset para re-testar

```sql
delete from conteudos where projeto_id = 'ed6ef11b-7e4b-4c26-ab91-5b9f3023ddba' and agente = 'copywriter';
update projetos set estado = 'planeado'
where id = 'ed6ef11b-7e4b-4c26-ab91-5b9f3023ddba';
```

## Erros comuns

| Sintoma | Fix |
|---------|-----|
| Nenhum projeto | `estado` tem de ser exactamente `planeado` |
| 401 Anthropic | Credencial no nó HTTP |
| status → erro apesar de textos | Parser normaliza `completo`; re-importa JSON se for versão antiga |

Seguinte: Workflow 04 Social Media (`estado=escrito` → versões por plataforma → `adaptado`).
