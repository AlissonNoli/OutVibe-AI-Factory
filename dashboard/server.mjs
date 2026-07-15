import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env if present (simple parser — no dotenv dep)
const envPath = join(__dirname, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const PORT = Number(process.env.PORT || 3000);
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'outvibe';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('[warn] SUPABASE_URL / SUPABASE_SERVICE_KEY em falta — copia dashboard/.env.example → .env');
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

const app = express();
app.use(express.json());

function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
  if (token === DASHBOARD_PASSWORD) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, supabase: Boolean(supabase) });
});

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password === DASHBOARD_PASSWORD) {
    return res.json({ token: DASHBOARD_PASSWORD });
  }
  return res.status(401).json({ error: 'password inválida' });
});

app.get('/api/fila', requireAuth, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase não configurado' });

  const estadoPub = req.query.estado || 'por_publicar';

  const { data: pubs, error: e1 } = await supabase
    .from('publicacoes')
    .select('*')
    .eq('plataforma', 'instagram')
    .eq('estado', estadoPub)
    .order('data_sugerida', { ascending: true, nullsFirst: false });

  if (e1) return res.status(500).json({ error: e1.message });

  const projetoIds = [...new Set((pubs || []).map((p) => p.projeto_id).filter(Boolean))];
  if (!projetoIds.length) return res.json({ projetos: [] });

  const { data: projetos, error: e2 } = await supabase
    .from('projetos')
    .select('id, criado_em, estado, brief, plano, pasta_drive_id')
    .in('id', projetoIds);

  if (e2) return res.status(500).json({ error: e2.message });

  const { data: arquivos, error: e3 } = await supabase
    .from('arquivos')
    .select('id, projeto_id, nome, tipo, drive_file_id')
    .in('projeto_id', projetoIds);

  if (e3) return res.status(500).json({ error: e3.message });

  const { data: conteudos, error: e4 } = await supabase
    .from('conteudos')
    .select('id, projeto_id, criado_em, agente, tipo, conteudo, versao_prompt')
    .in('projeto_id', projetoIds)
    .eq('agente', 'social_media')
    .order('criado_em', { ascending: true });

  if (e4) return res.status(500).json({ error: e4.message });

  const byProj = {};
  for (const p of projetos || []) {
    const plano = p.plano || {};
    const resultado = plano.resultado || {};
    const foto = (arquivos || []).find((a) => a.projeto_id === p.id && a.tipo === 'foto')
      || (arquivos || []).find((a) => a.projeto_id === p.id);
    const driveId = foto?.drive_file_id;
    byProj[p.id] = {
      id: p.id,
      estado: p.estado,
      brief: p.brief,
      tema: resultado.tema || p.brief || 'Sem tema',
      cta_campanha: resultado.cta_da_campanha || null,
      data_sugerida_campanha: resultado.data_sugerida_publicacao || null,
      foto: foto
        ? {
            nome: foto.nome,
            drive_file_id: driveId,
            drive_view: driveId ? `https://drive.google.com/file/d/${driveId}/view` : null,
            drive_thumb: driveId ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w800` : null,
          }
        : null,
      pecas: [],
      publicacoes: [],
    };
  }

  for (const c of conteudos || []) {
    if (!byProj[c.projeto_id]) continue;
    const body = c.conteudo || {};
    byProj[c.projeto_id].pecas.push({
      conteudo_id: c.id,
      tipo: c.tipo || body.formato || 'post_instagram',
      texto_final: body.texto_final || '',
      hashtags: body.hashtags || [],
      foto: body.foto || byProj[c.projeto_id].foto?.nome || null,
      melhor_horario_sugerido: body.melhor_horario_sugerido || null,
      notas_publicacao_manual: body.notas_publicacao_manual || null,
    });
  }

  for (const pub of pubs || []) {
    if (!byProj[pub.projeto_id]) continue;
    byProj[pub.projeto_id].publicacoes.push({
      id: pub.id,
      data_sugerida: pub.data_sugerida,
      data_publicada: pub.data_publicada,
      estado: pub.estado,
      conteudo_id: pub.conteudo_id,
      url_publicacao: pub.url_publicacao,
      views: pub.views,
      likes: pub.likes,
      comentarios: pub.comentarios,
      partilhas: pub.partilhas,
      saves: pub.saves,
      metricas_atualizadas_em: pub.metricas_atualizadas_em,
    });
  }

  // Pair piezas with publicacoes by index when conteudo_id is null
  const list = Object.values(byProj).map((proj) => {
    const pecas = proj.pecas.map((peca, idx) => ({
      ...peca,
      publicacao: proj.publicacoes[idx] || proj.publicacoes.find((p) => p.conteudo_id === peca.conteudo_id) || null,
    }));
    return { ...proj, pecas, publicacoes: undefined };
  });

  list.sort((a, b) => {
    const da = a.pecas[0]?.publicacao?.data_sugerida || a.data_sugerida_campanha || '';
    const db = b.pecas[0]?.publicacao?.data_sugerida || b.data_sugerida_campanha || '';
    return String(da).localeCompare(String(db));
  });

  res.json({ projetos: list });
});

app.patch('/api/publicacoes/:id', requireAuth, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase não configurado' });
  const { id } = req.params;
  const body = req.body || {};
  const patch = {};

  if (body.estado) patch.estado = body.estado;
  if (body.data_sugerida !== undefined) patch.data_sugerida = body.data_sugerida;
  if (body.url_publicacao !== undefined) patch.url_publicacao = body.url_publicacao || null;
  if (body.estado === 'publicado') patch.data_publicada = new Date().toISOString();

  const metricKeys = ['views', 'likes', 'comentarios', 'partilhas', 'saves'];
  let hasMetrics = false;
  for (const key of metricKeys) {
    if (body[key] === undefined || body[key] === null || body[key] === '') continue;
    const n = Number(body[key]);
    if (!Number.isFinite(n) || n < 0) {
      return res.status(400).json({ error: `${key} deve ser um número ≥ 0` });
    }
    patch[key] = Math.round(n);
    hasMetrics = true;
  }
  if (hasMetrics) patch.metricas_atualizadas_em = new Date().toISOString();

  if (!Object.keys(patch).length) {
    return res.status(400).json({ error: 'Nada para atualizar' });
  }

  const { data, error } = await supabase
    .from('publicacoes')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ publicacao: data });
});

app.use(express.static(join(__dirname, 'public')));

app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`OutVibe dashboard em http://localhost:${PORT}`);
});
