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

  /* ---------- 00 · HERO: línea de tiempo de 14 s (simula el video) ---------- */
  (function hero() {
    const tbFields = $$('#hero .titleblock b[data-text]');
    if (RM) { tbFields.forEach(b => b.textContent = b.dataset.text); return; }
    tbFields.forEach((b, i) => typeInto(b, b.dataset.text, .5, .4 + i * .45));
    const speed = $('#speed');
    const sp = { v: .4 };
    const upd = () => speed.textContent = sp.v.toFixed(1) + '×';
    const tl = gsap.timeline({ repeat: -1 });
    // 0–3 s · tramo frontal lento: cota de monitores y rótulos
    tl.set(sp, { v: .4 })
      .fromTo('#a-mon', { opacity: 0 }, { opacity: 1, duration: .5 }, 0)
      .from('#a-mon .ln', { scaleX: 0, transformOrigin: 'left center', duration: .8, stagger: .08 }, 0)
      .to('#a-mon', { opacity: 0, duration: .4 }, 3.2)
      // 3–7 s · tramo rápido: speed ramp y nube de revisión
      .to(sp, { v: 2.8, duration: 1.2, ease: 'power2.in', onUpdate: upd }, 3)
      .fromTo('#a-cloud', { opacity: 0, scale: .8, transformOrigin: '1450px 560px' }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)' }, 3.6)
      .to('#a-cloud', { opacity: 0, duration: .3 }, 7)
      // 7–12 s · vuelta al frente: desacelera y entran las cifras con cotas
      .to(sp, { v: .4, duration: 1.4, ease: 'power3.out', onUpdate: upd }, 7)
      .fromTo('#a-nums', { opacity: 0 }, { opacity: 1, duration: .4 }, 8)
      .from('#a-nums .big, #a-nums .cap', { y: 24, opacity: 0, duration: .7, stagger: .06, ease: 'power3.out' }, 8)
      .from('#a-nums line', { scaleX: 0, transformOrigin: 'left center', duration: .8, stagger: .05 }, 8.3)
      .to('#a-nums', { opacity: 0, duration: .5 }, 12.6)
      .to({}, { duration: .6 });
    // contadores de las cifras
    $$('#a-nums .big').forEach(t => {
      const first = t.firstChild; const target = parseInt(first.textContent, 10); const o = { n: 0 };
      tl.to(o, { n: target, duration: 1.2, ease: 'power2.out', onUpdate: () => first.textContent = Math.round(o.n) }, 8);
    });
    // Botón de audio (sin pista aún: solo el estado)
    const audio = $('#audio');
    audio.addEventListener('click', () => {
      const on = audio.classList.toggle('on');
      audio.setAttribute('aria-pressed', on);
      $('#audio-state').textContent = on ? 'on' : 'off';
    });
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
})();
