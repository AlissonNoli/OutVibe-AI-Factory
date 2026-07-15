-- 001_init.sql — Esquema mínimo do MVP OutVibe AI Factory
-- Correr no SQL Editor do Supabase.

create table if not exists projetos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  origem text not null default 'google_drive',        -- de onde veio
  tipo_entrada text not null,                          -- 'brief_texto' | 'fotos_texto'
  estado text not null default 'ingerido',             -- ingerido | planeado | escrito | adaptado | pronto | publicado | erro
  brief text,
  pasta_drive_id text,
  plano jsonb                                          -- output do Agente Diretor
);

create table if not exists arquivos (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references projetos(id) on delete cascade,
  nome text not null,
  tipo text not null,                                  -- foto | texto | video | audio
  drive_file_id text not null,
  metadados jsonb
);

create table if not exists conteudos (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references projetos(id) on delete cascade,
  criado_em timestamptz not null default now(),
  agente text not null,                                -- copywriter | social_media | ...
  tipo text not null,                                  -- post_instagram | post_linkedin | ...
  conteudo jsonb not null,                             -- output completo do agente
  versao_prompt text                                   -- hash/versão do prompt usado
);

create table if not exists publicacoes (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references projetos(id) on delete cascade,
  conteudo_id uuid references conteudos(id),
  plataforma text not null,
  data_sugerida date,
  data_publicada timestamptz,
  estado text not null default 'por_publicar',         -- por_publicar | publicado | descartado
  url_publicacao text,
  -- métricas manuais (Fase 5)
  views int, likes int, comentarios int, partilhas int, saves int,
  metricas_atualizadas_em timestamptz
);

create table if not exists logs (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  projeto_id uuid,
  agente text,
  nivel text not null default 'info',                  -- info | warn | erro
  mensagem text not null,
  detalhe jsonb
);

create index if not exists idx_projetos_estado on projetos(estado);
create index if not exists idx_publicacoes_estado on publicacoes(estado);
create index if not exists idx_conteudos_projeto on conteudos(projeto_id);
