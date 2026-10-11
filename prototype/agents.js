/* 02.5b · Agentes de automatización: reproductor del video (mudo al entrar, altavoz, barra con scrub, teclado). */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.querySelector('#agents');
  if (!root) return;
  const v = root.querySelector('video'), screen = root.querySelector('.screen'), bar = root.querySelector('.bar'), fill = root.querySelector('.bar i');
  const snd = root.querySelector('.snd'), state = root.querySelector('.state');
  const paint = () => { screen.classList.toggle('idle', v.paused); state.textContent = v.paused ? (v.currentTime > 0 ? 'Pausado' : 'Toca para reproducir') : ''; };
  const play = () => v.play().then(paint).catch(() => { v.muted = true; v.play().then(paint).catch(paint); });
  const toggle = () => { v.paused ? play() : (v.pause(), paint()); };

  paint();
  if (!RM) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) play(); else { v.pause(); paint(); } }), { threshold: .35 }).observe(root);
  screen.addEventListener('click', e => { if (e.target.closest('.snd, .bar')) return; toggle(); });
  screen.addEventListener('keydown', e => {
    if (e.target !== screen) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); v.currentTime = Math.min(v.duration || 0, v.currentTime + 5); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 5); }
    if (e.key.toLowerCase() === 'm') { e.preventDefault(); snd.click(); }
  });
  snd.addEventListener('click', e => {
    e.stopPropagation();
    v.muted = !v.muted;
    snd.setAttribute('aria-pressed', !v.muted);
    snd.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar');
    if (!v.muted && v.paused) play();
    document.querySelectorAll('.viewer video').forEach(o => { if (o !== v) o.muted = true; });
  });
  v.addEventListener('timeupdate', () => { if (v.duration) fill.style.transform = `scaleX(${v.currentTime / v.duration})`; });
  v.addEventListener('play', paint); v.addEventListener('pause', paint);
  bar.addEventListener('click', e => { e.stopPropagation(); const r = bar.getBoundingClientRect(); v.currentTime = ((e.clientX - r.left) / r.width) * v.duration; });
})();
