/* Prototipo v4 · hero (00) y FDE (02.6). El flujo (02.5) vive en flow.js. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (!RM) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Insignias: trazo circular al entrar ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .4 });
  $$('.badge').forEach(b => io.observe(b));

  /* ---------- Cuadro de rótulo: se escribe campo por campo, una sola vez ---------- */
  function typeInto(node, text, dur, delay) {
    if (RM) { node.textContent = text; return; }
    const o = { n: 0 };
    return gsap.to(o, { n: text.length, duration: dur, delay, ease: 'none', onUpdate: () => node.textContent = text.slice(0, Math.round(o.n)) });
  }

  /* ---------- 00 · HERO: video real + anotaciones sincronizadas con su tiempo ---------- */
  (function hero() {
    const tbFields = $$('#hero .titleblock b[data-text]');
    const video = $('#hero-video');
    // Fuente según orientación: 16:9 en escritorio, 9:16 en teléfono vertical
    if (video) {
      const tall = matchMedia('(max-aspect-ratio: 3/4)').matches;
      const base = tall ? video.dataset.srcTall : video.dataset.srcWide;
      if (!tall) { const w = document.createElement('source'); w.src = base + '.webm'; w.type = 'video/webm'; video.append(w); }
      const m = document.createElement('source'); m.src = base + '.mp4'; m.type = 'video/mp4'; video.append(m);
      if (RM || (navigator.connection && navigator.connection.saveData)) { video.removeAttribute('autoplay'); video.pause(); }
    }
    if (RM) { tbFields.forEach(b => b.textContent = b.dataset.text); return; }
    tbFields.forEach((b, i) => typeInto(b, b.dataset.text, .5, .4 + i * .45));
    // Línea de tiempo pausada, en segundos del video (27.6 s): se busca con video.currentTime
    const tl = gsap.timeline({ paused: true });
    // 0.4–2.4 s · frente, lento: cota de monitores y rótulos
    tl.fromTo('#a-mon', { opacity: 0 }, { opacity: 1, duration: .5 }, .4)
      .from('#a-mon .ln', { scaleX: 0, transformOrigin: 'left center', duration: .8, stagger: .08 }, .4)
      .to('#a-mon', { opacity: 0, duration: .4 }, 2.4)
      // 5.8–8.6 s · por detrás: nube de revisión
      .fromTo('#a-cloud', { opacity: 0, scale: .8, transformOrigin: '1280px 560px' }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)' }, 5.8)
      .to('#a-cloud', { opacity: 0, duration: .3 }, 8.6)
      // 9.8–12.2 s · vuelta al frente: cifras con cotas
      .fromTo('#a-nums', { opacity: 0 }, { opacity: 1, duration: .4 }, 9.8)
      .from('#a-nums .big, #a-nums .cap', { y: 24, opacity: 0, duration: .7, stagger: .06, ease: 'power3.out' }, 9.8)
      .from('#a-nums line', { scaleX: 0, transformOrigin: 'left center', duration: .8, stagger: .05 }, 10.1)
      .to('#a-nums', { opacity: 0, duration: .5 }, 12.2)
      // 19.6–27.4 s · dentro del código: el texto del hero se atenúa para que los servicios en 3D se lean
      .to('.hero-copy', { opacity: .18, duration: .8 }, 19.6)
      .to('.hero-copy', { opacity: 1, duration: .6 }, 27.0)
      .to({}, { duration: .3 }, 27.3);
    $$('#a-nums .big').forEach(t => {
      const first = t.firstChild; const target = parseInt(first.textContent, 10); const o = { n: 0 };
      tl.to(o, { n: target, duration: 1.2, ease: 'power2.out', onUpdate: () => first.textContent = Math.round(o.n) }, 9.8);
    });
    const sync = () => { if (video && !video.paused) tl.time(video.currentTime); requestAnimationFrame(sync); };
    if (video) requestAnimationFrame(sync); else tl.play();
  })();

  /* ---------- 02.6 · FDE: relojes y cotas de mejora ---------- */
  (function fde() {
    const before = $('#clk-before'), after = $('#clk-after');
    const hhmm = (t) => `${String(Math.floor(t)).padStart(2, '0')}:${String(Math.round((t % 1) * 60)).padStart(2, '0')}`;
    if (RM) { before.textContent = '06:40'; after.textContent = '00:12'; return; }
    ScrollTrigger.create({
      trigger: '#fde', start: 'top 60%', once: true,
      onEnter: () => {
        const a = { t: 0 }, b = { t: 0 };
        gsap.to(a, { t: 6.6667, duration: 2.2, ease: 'power2.out', onUpdate: () => before.textContent = hhmm(a.t) });
        gsap.to(b, { t: .2, duration: 1.2, delay: .6, ease: 'power2.out', onUpdate: () => after.textContent = hhmm(b.t) });
        gsap.from('.steps li', { x: 24, opacity: 0, duration: .6, stagger: .15, delay: .4, ease: 'power3.out' });
      }
    });
    // Cotas: la línea "antes" se extiende en rojo, luego la "después" en verde
    $$('.dimsvg').forEach(svg => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 85%', once: true } });
      tl.from($('.before-dim .dim', svg), { scaleX: 0, transformOrigin: 'left center', duration: 1.1, ease: 'expo.out' })
        .from($$('.before-dim .ext, .before-dim .dv', svg), { opacity: 0, duration: .3 }, '<.2')
        .from($('.after-dim .dim', svg), { scaleX: 0, transformOrigin: 'left center', duration: .6, ease: 'expo.out' }, '-=.3')
        .from($$('.after-dim .ext, .after-dim .dv', svg), { opacity: 0, duration: .3 }, '<.1');
    });
  })();

  /* ---------- 05 · Contacto: copiar correo con aviso ---------- */
  (function contact() {
    const btn = document.querySelector('.contacts .copy'), toast = document.querySelector('#toast');
    if (!btn || !toast) return;
    let timer;
    const say = msg => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(timer); timer = setTimeout(() => toast.classList.remove('show'), 2200); };
    btn.addEventListener('click', async () => {
      const v = btn.dataset.copy;
      try { await navigator.clipboard.writeText(v); say('Correo copiado: ' + v); return; } catch {}
      try { const t = document.createElement('textarea'); t.value = v; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; document.body.append(t); t.select(); const ok = document.execCommand('copy'); t.remove(); if (ok) { say('Correo copiado: ' + v); return; } } catch {}
      say('Copia este correo: ' + v);
    });
  })();
})();
