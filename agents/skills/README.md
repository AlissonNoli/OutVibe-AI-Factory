# Skills OutVibe (agentes n8n + Cursor)

Skills curadas a partir dos repos do PDF "7 repos founder Claude Code",
adaptadas ao pipeline OutVibe (Diretor → Copywriter → Social Media).

## O que instalámos

| Origem | Uso no OutVibe |
|--------|----------------|
| [blader/humanizer](https://github.com/blader/humanizer) | Regras anti-"cheiro de IA" nos prompts Copywriter + Social Media |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) `copywriting` / `copy-editing` | Hooks, clareza, CTA, checklist de qualidade no Copywriter |
| idem `social` | Formatos IG, hooks, Reels/carrossel no Social Media |
| idem `content-strategy` + `marketing-psychology` | Pilares, ângulo, jobs-to-be-done no Diretor |

**Não instalámos agora:** Remotion (Fase 6 vídeo), SEO pack completo, Meta/Google Ads, deep-research. Ver roadmap no `README.md`.

## Onde vive cada coisa

| Caminho | Função |
|---------|--------|
| `agents/prompts/*.md` | **Fonte de verdade** dos agentes Claude no n8n (v0.2) |
| `agents/skills/outvibe-humanizer/SKILL.md` | Skill de projeto: humanizar copy OutVibe |
| `agents/skills/outvibe-social-ig/SKILL.md` | Skill de projeto: legendas Instagram |
| `.agents/skills/` | Cópia para o Cursor descobrir as skills automaticamente |
| `n8n/workflows/02–04-*.json` | Prompts embutidos (sincronizar após editar `.md`) |

## Sincronizar prompts → workflows n8n

Depois de editar `agents/prompts/*.md`:

```bash
node scripts/sync-prompts-to-workflows.mjs
```

Depois: reimportar os JSON no n8n (ou actualizar os nós Code dos workflows 02–04).

## Vendor (opcional, não commitado)

Clones completos para consulta local:

```powershell
New-Item -ItemType Directory -Force -Path agents\skills\_vendor | Out-Null
git clone --depth 1 https://github.com/blader/humanizer.git agents\skills\_vendor\humanizer
git clone --depth 1 https://github.com/coreyhaines31/marketingskills.git agents\skills\_vendor\marketingskills
```

`_vendor/` está no `.gitignore`.
