/* Sitio para reclutadores: idioma EN/ES recordado, copiar correo, aparición suave de secciones. */
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const nodes = $$('[data-i]');
  const EN = {};
  nodes.forEach(n => { EN[n.dataset.i] = n.innerHTML; });
  Object.assign(EN, window.I18N_EN_EXTRA || {});
  const ES = window.I18N_ES || {};
  const titles = { en: document.title, es: 'Alexis Vieto · AI Engineer · Forward Deployed Engineer · Integration Architect' };
  let lang = 'en';

  function setLang(l) {
    lang = l === 'es' ? 'es' : 'en';
    const dict = lang === 'es' ? ES : EN;
    nodes.forEach(n => { const v = dict[n.dataset.i]; if (v != null) n.innerHTML = v; });
    document.documentElement.lang = lang;
    $$('.cvlink').forEach(x => x.setAttribute('href', `media/alexis-vieto-cv-${lang}.pdf`));
    document.title = titles[lang];
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    try { localStorage.setItem('av-lang', lang); } catch {}
  }
  const t = k => (lang === 'es' ? ES : EN)[k] || k;

  let initial = 'en';
  try {
    const q = new URLSearchParams(location.search).get('lang');
    initial = q || localStorage.getItem('av-lang') || ((navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en');
  } catch {}
  setLang(initial);
  $$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  // Copiar correo con aviso
  const toast = document.getElementById('toast');
  let timer;
  const say = m => { toast.textContent = m; toast.classList.add('show'); clearTimeout(timer); timer = setTimeout(() => toast.classList.remove('show'), 2200); };
  $$('.copy').forEach(btn => btn.addEventListener('click', async () => {
    const v = btn.dataset.copy;
    try { await navigator.clipboard.writeText(v); say(t('toastCopied') + ': ' + v); return; } catch {}
    try { const ta = document.createElement('textarea'); ta.value = v; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.append(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); if (ok) { say(t('toastCopied') + ': ' + v); return; } } catch {}
    say(t('toastCopy') + ': ' + v);
  }));

  // Aparición suave al entrar en pantalla (sin movimiento con reduced motion)
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const els = $$('.sec-h, .why article, .xp li, .case, .agents, .steps li');
    els.forEach(e => e.classList.add('rv'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }
})();
