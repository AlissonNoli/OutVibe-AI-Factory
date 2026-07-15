# PRD 001 — Dashboard de publicação humana (OutVibe)

**Estado:** Proposto  
**Data:** 2026-07-15  
**Autor:** feedback pós-MVP pipeline (Fases 1–4)  
**Relacionado:** ADR 001 (pipeline de texto), Workflows 01–05

---

## 1. Problema

O pipeline n8n + Claude já produz:

- plano do Diretor
- textos-mãe (Copywriter)
- versões Instagram (Social Media)
- ficheiro `.md` em `Pronto_Para_Publicar`
- linhas em `projetos` / `conteudos` / `publicacoes`

Para quem vai **publicar à mão**, isto é confuso:

| Superfície actual | Problema |
|-------------------|----------|
| Ficheiro Markdown no Drive | Difícil de folhear; sem preview da foto; copiar/colar frágil |
| Table Editor do Supabase | JSON em colunas; não é UI de conteúdo; risco de editar dados errados |
| n8n Executions | Só diagnostica automações, não serve para publicar |

O humano precisa de **ver a foto + a legenda sugerida + horário + estado**, num sítio só — não de “ler a fábrica”.

---

## 2. Hipótese / decisão de produto

> Depois de `estado=pronto` (ou `adaptado`), o output principal para humanos deixa de ser o `.md`/BD e passa a ser um **Dashboard de publicação**.

O `.md` e as tabelas continuam como **fonte de verdade / arquivo**; o dashboard é a **interface de trabalho**.

Isto é válido para o MVP: a publicação continua **manual**; só melhoramos a UX de “o que publicar e quando”.

---

## 3. Objetivos

### Objetivos (must)

1. Ver, por projecto pronto, a **foto (ou thumbnails)** e as **peças Instagram** geradas.
2. Ver **legenda completa**, **hashtags** e botão **Copiar**.
3. Ver **data/hora sugeridas** de publicação.
4. Ver **notas de publicação manual** (crop, ordem do carrossel, stickers, etc.).
5. Marcar peça como **publicada** / **descartada** / **reagendada** (atualiza `publicacoes` no Supabase).

### Não-objetivos (neste PRD)

- Publicar automaticamente no Instagram Graph API.
- Editor de imagem / design.
- Analytics (isso é Fase 5+).
- Multi-utilizador avançado (RBAC).

---

## 4. Utilizador

**Persona:** operador OutVibe (fundador / social) que recebe material e publica no Instagram.

**Job to be done:**  
“Quando o pipeline termina, quero abrir um ecrã, ver a foto com a legenda pronta, copiar e publicar no IG sem abrir Supabase nem caçar MD no Drive.”

---

## 5. User stories

1. Como operador, quero uma lista de projectos **prontos** (e opcionalmente `adaptado`), ordenados por data sugerida.
2. Como operador, quero abrir um projecto e ver a foto original ao lado de cada legenda IG.
3. Como operador, quero **copiar legenda + hashtags** num clique.
4. Como operador, quero ver o **horário sugerido** e alterar a data se necessário.
5. Como operador, quero marcar “já publiquei” e o card sair da fila (ou ir para “Publicados”).
6. Como operador, quero ver o estado da pipeline (`ingerido` → … → `pronto`) só como contexto, não como UI principal.

---

## 6. Informação a mostrar (por peça)

| Campo | Origem |
|-------|--------|
| Thumbnail / foto | Google Drive `arquivos.drive_file_id` (URL assinada ou proxy) |
| Formato | `carousel` / `reel` / `post_single` / `story_series` (`conteudos.tipo` ou JSON) |
| Legenda | `conteudos.conteudo.texto_final` (agente `social_media`) |
| Hashtags | `conteudos.conteudo.hashtags` |
| Horário sugerido | `conteudos.conteudo.melhor_horario_sugerido` + `publicacoes.data_sugerida` |
| Notas manuais | `conteudos.conteudo.notas_publicacao_manual` |
| Estado publicação | `publicacoes.estado` (`por_publicar` / `publicado` / `descartado`) |
| Tema / CTA campanha | `projetos.plano.resultado` |

Opcional v1.1: preview do plano do Diretor (colapsável).

---

## 7. UX (proposto)

### Vista A — Fila “Para publicar”

Cards ou tabela:

- thumb + tema + nº de peças + próxima data
- filtro: só Instagram, só `por_publicar`

### Vista B — Detalhe do projecto

Layout tipo “review”:

```
┌──────────────┬─────────────────────────────────────┐
│  Foto        │  Peça 1/5 — Reel                    │
│  (preview)   │  Horário: 12 Set · 18:30            │
│              │  [Copiar legenda]  [Copiar hashtags]│
│              │  Notas: …                           │
│              │  [Marcar publicado] [Descartar]     │
└──────────────┴─────────────────────────────────────┘
```

Navegação entre peças (anterior / seguinte).

### Vista C — Calendário (v1.1)

Semana/mês com peças `por_publicar` por dia.

---

## 8. Requisitos técnicos (orientação)

| Camada | Opção MVP |
|--------|-----------|
| Frontend | App simples (ex. Next.js / React) ou página protegida no mesmo domínio |
| Auth | Password / magic link / Supabase Auth (1–2 operadores) |
| Dados | Leitura Supabase (`projetos`, `conteudos`, `arquivos`, `publicacoes`) via `anon` + RLS ou API com service role no backend |
| Fotos | Link Drive (partilha) ou endpoint que faz download OAuth / URL temporária |
| Escritas | Update `publicacoes.estado`, `data_sugerida`, opcionalmente `url_publicacao` |
| Hosting | Mesma VPS (Caddy) ex. `app.outvibe.pt` ou subpath |

O n8n **não** substitui este dashboard.

O Workflow 05 (`.md`) pode permanecer como **export/arquivo**, mas deixa de ser o caminho principal de publicação.

---

## 9. Critérios de sucesso

1. Operador publica 1 peça Instagram **sem** abrir Supabase Table Editor.
2. Tempo médio “projeto pronto → primeiro post no IG” reduz versus fluxo MD+BD.
3. Zero dúvidas sobre “qual legenda vai com qual foto”.
4. Estado `publicacoes` reflecte o que foi realmente publicado.

---

## 10. Prioridade no roadmap

Inserir como **Fase 4b — Dashboard de publicação humana**, logo após o Output Drive (Fase 4), **antes** de métricas (Fase 5) e de publicação automática.

Justificação: desbloqueia o valor do que a fábrica já produz; senão o output fica “escondido” em JSON/MD.

### Fora de ordem (não fazer antes)

- Publicador automático IG (sem dashboard, o feedback humano continua cego).

---

## 11. Entregáveis

1. Este PRD (aceite / rejeitado).
2. Wireframe / mock simples (opcional).
3. Spike técnico: servir thumbnail Drive + listar `publicacoes` por_publicar.
4. MVP dashboard (Vista A + B + copiar + marcar publicado).
5. ADR curto sobre stack do dashboard (quando houver decisão).

---

## 12. Riscos

| Risco | Mitigação |
|-------|-----------|
| URLs Drive exigem OAuth | Proxy autenticado ou ficheiros espelhados em storage Supabase |
| JSON inconsistente dos agentes | Normalizar `conteudo` no Workflow 04; schema de validação |
| Scope creep (editor, multi-rede) | Trancar v1 a Instagram + estados `publicacoes` |

---

## 13. Decisão pedida

- [ ] Aceitar Fase 4b (Dashboard) como próximo foco de produto após Workflow 05 estável
- [ ] Manter `.md` só como arquivo / fallback
- [ ] Confirmar stack preferida (ex. Next.js + Supabase Auth na VPS)

---

## Apêndice — Mapeamento do que o pipeline já gera

| Etapa | Estado `projetos` | O que o humano “vê” hoje | O que o dashboard deve mostrar |
|-------|-------------------|--------------------------|--------------------------------|
| 01 Ingestão | `ingerido` | pasta Processando | (não lista na fila) |
| 02 Diretor | `planeado` | JSON `plano` | resumo tema (secundário) |
| 03 Copy | `escrito` | JSON textos-mãe | opcional / avançado |
| 04 Social IG | `adaptado` | JSON legendas | **fila principal de peças** |
| 05 Output | `pronto` | ficheiro `.md` | **mesmo conteúdo, com foto** |
