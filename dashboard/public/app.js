const TOKEN_KEY = 'outvibe_dash_token';

const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const queueEl = document.getElementById('queue');
const statusLine = document.getElementById('status-line');
const filtroEstado = document.getElementById('filtro-estado');
const pageTitle = document.getElementById('page-title');
const ingestForm = document.getElementById('ingest-form');
const ingestStatus = document.getElementById('ingest-status');
const fotosInput = document.getElementById('fotos');
const previewFotos = document.getElementById('preview-fotos');
const dropzone = document.getElementById('dropzone');
const btnIngest = document.getElementById('btn-ingest');

function token() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

function setToken(t) {
  if (t) sessionStorage.setItem(TOKEN_KEY, t);
  else sessionStorage.removeItem(TOKEN_KEY);
}

async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (!(opts.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const res = await fetch(path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    setToken('');
    showLogin();
    throw new Error(data.error || 'unauthorized');
  }
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function showLogin() {
  loginView.classList.remove('hidden');
  appView.classList.add('hidden');
}

function showApp() {
  loginView.classList.add('hidden');
  appView.classList.remove('hidden');
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === name);
  });
  document.getElementById('tab-novo').classList.toggle('hidden', name !== 'novo');
  document.getElementById('tab-fila').classList.toggle('hidden', name !== 'fila');
  pageTitle.textContent = name === 'novo' ? 'Novo projecto' : 'Para publicar';
  if (name === 'fila') loadFila();
}

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatHashtags(tags) {
  if (!Array.isArray(tags) || !tags.length) return '';
  return tags.map((t) => (String(t).startsWith('#') ? t : `#${t}`)).join(' ');
}

function captionBlock(peca) {
  const tags = formatHashtags(peca.hashtags);
  return tags ? `${peca.texto_final}\n\n${tags}` : (peca.texto_final || '');
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

function renderFotoPreviews(fileList) {
  const files = [...fileList].filter((f) => f.type.startsWith('image/'));
  if (!files.length) {
    previewFotos.hidden = true;
    previewFotos.innerHTML = '';
    return;
  }
  previewFotos.hidden = false;
  previewFotos.innerHTML = files.map((f) => {
    const url = URL.createObjectURL(f);
    return `<figure class="preview-item"><img src="${url}" alt="" /><figcaption>${escapeHtml(f.name)}</figcaption></figure>`;
  }).join('');
}

function metricsFormHtml(pub) {
  if (!pub?.id) return '';
  const v = (x) => (x === null || x === undefined ? '' : x);
  const updated = pub.metricas_atualizadas_em
    ? `<p class="metricas-meta">Atualizado: ${escapeHtml(new Date(pub.metricas_atualizadas_em).toLocaleString('pt-PT'))}</p>`
    : '';
  return `
    <form class="metricas" data-pub="${escapeHtml(pub.id)}">
      <h4>Métricas (após publicar)</h4>
      <div class="metricas-grid">
        <label>Views <input type="number" min="0" name="views" value="${escapeHtml(v(pub.views))}" /></label>
        <label>Likes <input type="number" min="0" name="likes" value="${escapeHtml(v(pub.likes))}" /></label>
        <label>Comentários <input type="number" min="0" name="comentarios" value="${escapeHtml(v(pub.comentarios))}" /></label>
        <label>Partilhas <input type="number" min="0" name="partilhas" value="${escapeHtml(v(pub.partilhas))}" /></label>
        <label>Saves <input type="number" min="0" name="saves" value="${escapeHtml(v(pub.saves))}" /></label>
      </div>
      <label class="url-label">URL do post (opcional)
        <input type="url" name="url_publicacao" placeholder="https://www.instagram.com/p/..." value="${escapeHtml(v(pub.url_publicacao))}" />
      </label>
      ${updated}
      <button type="submit" class="ok">Guardar métricas</button>
    </form>`;
}

function render(projetos) {
  const mostrandoPublicados = filtroEstado.value === 'publicado';

  if (!projetos.length) {
    queueEl.innerHTML = `<div class="empty">Nada nesta fila. Envia um projecto em <strong>Novo</strong> ou corre o pipeline até <code>pronto</code>.</div>`;
    return;
  }

  queueEl.innerHTML = projetos.map((p) => {
    const thumb = p.foto?.drive_thumb
      ? `<img class="thumb" src="${escapeHtml(p.foto.drive_thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'thumb-fallback',textContent:'Sem preview — abre no Drive'}))" />`
      : `<div class="thumb-fallback">Sem foto ligada</div>`;

    const driveLink = p.foto?.drive_view
      ? `<span class="chip"><a href="${escapeHtml(p.foto.drive_view)}" target="_blank" rel="noopener">Abrir no Drive</a></span>`
      : '';

    const pecasHtml = (p.pecas || []).map((peca, idx) => {
      const pub = peca.publicacao;
      const data = pub?.data_sugerida || p.data_sugerida_campanha || '—';
      const hora = peca.melhor_horario_sugerido || '—';
      const tags = formatHashtags(peca.hashtags);
      const pubId = pub?.id || '';
      const isPub = pub?.estado === 'publicado' || mostrandoPublicados;

      return `
        <article class="peca" data-pub-id="${escapeHtml(pubId)}">
          <div class="peca-top">
            <h3>${idx + 1}. ${escapeHtml(peca.tipo)}</h3>
            <p class="horario">${escapeHtml(data)} · ${escapeHtml(hora)}</p>
          </div>
          <div class="legenda">${escapeHtml(peca.texto_final || '(sem texto)')}</div>
          ${tags ? `<p class="hashtags">${escapeHtml(tags)}</p>` : ''}
          ${peca.notas_publicacao_manual ? `<p class="notas">${escapeHtml(peca.notas_publicacao_manual)}</p>` : ''}
          <div class="actions">
            <button type="button" data-action="copy" data-idx="${idx}">Copiar legenda</button>
            ${pubId && !isPub ? `<button type="button" class="ok" data-action="published" data-pub="${escapeHtml(pubId)}">Marcar publicado</button>` : ''}
            ${pubId && !isPub ? `<button type="button" class="danger" data-action="discard" data-pub="${escapeHtml(pubId)}">Descartar</button>` : ''}
            ${pubId && isPub ? `<button type="button" class="ghost" data-action="reopen" data-pub="${escapeHtml(pubId)}">Voltar a por publicar</button>` : ''}
          </div>
          ${isPub && pubId ? metricsFormHtml(pub) : ''}
        </article>`;
    }).join('');

    return `
      <section class="project" data-projeto="${escapeHtml(p.id)}">
        <div class="project-head">
          ${thumb}
          <div class="project-meta">
            <h2>${escapeHtml(p.tema)}</h2>
            <div class="meta-row">
              <span class="chip">estado projeto: ${escapeHtml(p.estado)}</span>
              <span class="chip">${(p.pecas || []).length} peça(s) IG</span>
              ${driveLink}
            </div>
            ${p.cta_campanha ? `<p class="lede" style="margin-top:0.7rem">${escapeHtml(p.cta_campanha)}</p>` : ''}
          </div>
        </div>
        <div class="pecas">${pecasHtml || '<p class="empty">Sem peças social_media neste projeto.</p>'}</div>
      </section>`;
  }).join('');

  queueEl.querySelectorAll('.project').forEach((el, pIdx) => {
    const projeto = projetos[pIdx];
    el.querySelectorAll('[data-action="copy"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const i = Number(btn.dataset.idx);
        const text = captionBlock(projeto.pecas[i]);
        try {
          await copyText(text);
          btn.textContent = 'Copiado';
          setTimeout(() => { btn.textContent = 'Copiar legenda'; }, 1200);
        } catch {
          statusLine.textContent = 'Não foi possível copiar (permissão do browser).';
        }
      });
    });
  });

  queueEl.querySelectorAll('[data-action="published"], [data-action="discard"], [data-action="reopen"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.pub;
      const estado = btn.dataset.action === 'published'
        ? 'publicado'
        : (btn.dataset.action === 'discard' ? 'descartado' : 'por_publicar');
      btn.disabled = true;
      try {
        await api(`/api/publicacoes/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ estado }),
        });
        if (estado === 'publicado') {
          filtroEstado.value = 'publicado';
          statusLine.textContent = 'Marcado como publicado — preenche as métricas abaixo.';
        }
        await loadFila();
      } catch (err) {
        statusLine.textContent = err.message;
        btn.disabled = false;
      }
    });
  });

  queueEl.querySelectorAll('form.metricas').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = form.dataset.pub;
      const fd = new FormData(form);
      const payload = {
        views: fd.get('views'),
        likes: fd.get('likes'),
        comentarios: fd.get('comentarios'),
        partilhas: fd.get('partilhas'),
        saves: fd.get('saves'),
        url_publicacao: fd.get('url_publicacao'),
      };
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        await api(`/api/publicacoes/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        statusLine.textContent = 'Métricas guardadas.';
        await loadFila();
      } catch (err) {
        statusLine.textContent = err.message;
        btn.disabled = false;
      }
    });
  });
}

async function loadFila() {
  statusLine.textContent = 'A carregar…';
  try {
    const data = await api(`/api/fila?estado=${encodeURIComponent(filtroEstado.value)}`);
    statusLine.textContent = `${data.projetos.length} projeto(s) · ${filtroEstado.value}`;
    render(data.projetos);
  } catch (err) {
    statusLine.textContent = err.message;
    queueEl.innerHTML = '';
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  try {
    const data = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ password: document.getElementById('password').value }),
    });
    setToken(data.token);
    showApp();
    switchTab('novo');
  } catch (err) {
    loginError.textContent = err.message || 'Falhou o login';
    loginError.hidden = false;
  }
});

document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

fotosInput.addEventListener('change', () => renderFotoPreviews(fotosInput.files));

['dragenter', 'dragover'].forEach((ev) => {
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
});
['dragleave', 'drop'].forEach((ev) => {
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  });
});
dropzone.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  if (!dt?.files?.length) return;
  const transfer = new DataTransfer();
  [...dt.files].filter((f) => f.type.startsWith('image/')).slice(0, 10).forEach((f) => transfer.items.add(f));
  fotosInput.files = transfer.files;
  renderFotoPreviews(fotosInput.files);
});

ingestForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  ingestStatus.textContent = 'A enviar…';
  btnIngest.disabled = true;
  const fd = new FormData();
  fd.append('brief', document.getElementById('brief').value.trim());
  [...fotosInput.files].forEach((f) => fd.append('fotos', f));
  try {
    const data = await api('/api/ingest', { method: 'POST', body: fd });
    ingestStatus.textContent = `${data.mensagem || 'Enviado.'} ID: ${data.projeto_id}`;
    ingestForm.reset();
    renderFotoPreviews([]);
  } catch (err) {
    ingestStatus.textContent = err.message;
  } finally {
    btnIngest.disabled = false;
  }
});

document.getElementById('btn-refresh').addEventListener('click', loadFila);
document.getElementById('btn-logout').addEventListener('click', () => {
  setToken('');
  showLogin();
});
filtroEstado.addEventListener('change', loadFila);

if (token()) {
  showApp();
  switchTab('novo');
} else {
  showLogin();
}
