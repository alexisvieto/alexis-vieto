/* 02.5b · Agentes de automatización: reproductor del video (mudo al entrar, altavoz, barra con scrub). */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.querySelector('#agents');
  if (!root) return;
  const v = root.querySelector('video'), screen = root.querySelector('.screen'), bar = root.querySelector('.bar'), fill = root.querySelector('.bar i');
  const snd = root.querySelector('.snd'), state = root.querySelector('.state');
  const setState = () => { state.textContent = v.paused ? 'Pausado' : ''; };

  if (RM) {
    state.textContent = 'Toca para reproducir';
    screen.addEventListener('click', e => { if (e.target.closest('.snd, .bar')) return; v.paused ? v.play() : v.pause(); state.textContent = v.paused ? 'Pausado' : ''; });
  } else {
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: .35 }).observe(root);
    screen.addEventListener('click', e => { if (e.target.closest('.snd, .bar')) return; v.paused ? v.play() : v.pause(); setState(); });
  }
  snd.addEventListener('click', e => {
    e.stopPropagation();
    v.muted = !v.muted;
    snd.setAttribute('aria-pressed', !v.muted);
    snd.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar');
    if (!v.muted && v.paused) v.play().catch(() => {});
    // Silencia las piezas de la galería si alguna sonaba
    document.querySelectorAll('.viewer video').forEach(o => { if (o !== v) o.muted = true; });
  });
  v.addEventListener('timeupdate', () => { if (v.duration) fill.style.transform = `scaleX(${v.currentTime / v.duration})`; });
  bar.addEventListener('click', e => { e.stopPropagation(); const r = bar.getBoundingClientRect(); v.currentTime = ((e.clientX - r.left) / r.width) * v.duration; });
})();
