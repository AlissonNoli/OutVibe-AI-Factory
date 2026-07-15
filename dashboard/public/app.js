const TOKEN_KEY = 'outvibe_dash_token';

const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const queueEl = document.getElementById('queue');
const statusLine = document.getElementById('status-line');
const filtroEstado = document.getElementById('filtro-estado');

function token() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

function setToken(t) {
  if (t) sessionStorage.setItem(TOKEN_KEY, t);
  else sessionStorage.removeItem(TOKEN_KEY);
}

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
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

function render(projetos) {
  if (!projetos.length) {
    queueEl.innerHTML = `<div class="empty">Nada nesta fila. Corre o pipeline até <code>adaptado</code>/<code>pronto</code> ou muda o filtro.</div>`;
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
            ${pubId ? `<button type="button" class="ok" data-action="published" data-pub="${escapeHtml(pubId)}">Marcar publicado</button>` : ''}
            ${pubId ? `<button type="button" class="danger" data-action="discard" data-pub="${escapeHtml(pubId)}">Descartar</button>` : ''}
          </div>
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

  // Bind copy payloads on project elements
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

  queueEl.querySelectorAll('[data-action="published"], [data-action="discard"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.pub;
      const estado = btn.dataset.action === 'published' ? 'publicado' : 'descartado';
      btn.disabled = true;
      try {
        await api(`/api/publicacoes/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ estado }),
        });
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
    await loadFila();
  } catch (err) {
    loginError.textContent = err.message || 'Falhou o login';
    loginError.hidden = false;
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
  loadFila();
} else {
  showLogin();
}
