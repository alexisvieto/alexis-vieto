/* 02.6 · FDE: dos curvas en S (productividad y efectividad). Se dibujan al entrar en pantalla, con marcador de % y tooltip interactivo. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, text) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (text != null) n.textContent = text; return n; };

  const CHARTS = {
    prod: { target: 97, weeks: 12, color: 'var(--good)', unit: 'tiempo de cierre liberado', fmt: p => `${p}%`,
      note: p => p < 5 ? '06:40 h por cierre' : p >= 96 ? '00:12 h por cierre' : `${hm(6.667 * (1 - p / 100))} h por cierre` },
    efec: { target: 100, weeks: 12, color: 'var(--blue2)', unit: 'recapturas eliminadas', fmt: p => `${p}%`,
      note: p => p < 5 ? '3 recapturas por dato' : p >= 99 ? '0 recapturas · marcación → nómina → ACH' : `${(3 * (1 - p / 100)).toFixed(1)} recapturas por dato` },
  };
  const hm = h => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
  // Curva logística normalizada: arranca lento, acelera, se estabiliza en la meta
  const logistic = (x, weeks) => { const f = t => 1 / (1 + Math.exp(-0.95 * (t - weeks * .46))); return (f(x) - f(0)) / (f(weeks) - f(0)); };

  document.querySelectorAll('.chart').forEach(fig => {
    const cfg = CHARTS[fig.dataset.chart]; if (!cfg) return;
    const plot = fig.querySelector('.plot');
    const svg = el('svg', { class: 'ssvg', tabindex: '0', role: 'img', 'aria-label': fig.querySelector('figcaption').textContent + ` · curva en S hasta ${cfg.target}% ${cfg.unit}` });
    plot.append(svg);
    const state = { p: RM ? 1 : 0, hover: null, w: 640, h: 250 };
    const PADL = 44, PADR = 24, PADT = 28, PADB = 40;
    let pts = [], guide, tip, marker, mlabel, mnote, curve, area;

    function geometry() {
      state.w = Math.max(300, plot.clientWidth); svg.setAttribute('viewBox', `0 0 ${state.w} ${state.h}`); svg.setAttribute('width', state.w); svg.setAttribute('height', state.h);
      const iw = state.w - PADL - PADR, ih = state.h - PADT - PADB;
      const X = x => PADL + (x / cfg.weeks) * iw, Y = y => PADT + ih - (y / 100) * ih;
      pts = []; for (let i = 0; i <= cfg.weeks * 8; i++) { const x = i / 8; pts.push({ x, y: cfg.target * logistic(x, cfg.weeks), px: X(x), py: Y(cfg.target * logistic(x, cfg.weeks)) }); }
      svg.innerHTML = '';
      // Rejilla y ejes
      [0, 25, 50, 75, 100].forEach(v => {
        svg.append(el('line', { class: 'grid', x1: PADL, x2: state.w - PADR, y1: Y(v), y2: Y(v) }));
        svg.append(el('text', { class: 'ax', x: PADL - 8, y: Y(v) + 4, 'text-anchor': 'end' }, v + '%'));
      });
      for (let w = 0; w <= cfg.weeks; w += 2) svg.append(el('text', { class: 'ax', x: X(w), y: state.h - PADB + 18, 'text-anchor': 'middle' }, w === 0 ? 'Sem. 0' : String(w)));
      svg.append(el('text', { class: 'ax lbl', x: state.w - PADR, y: state.h - 6, 'text-anchor': 'end' }, 'Semanas desde el despliegue'));
      // Meta
      svg.append(el('line', { class: 'goal', x1: PADL, x2: state.w - PADR, y1: Y(cfg.target), y2: Y(cfg.target) }));
      svg.append(el('text', { class: 'goal-l', x: PADL + 6, y: Y(cfg.target) - 6, 'text-anchor': 'start' }, `meta ${cfg.target}%`));
      // Área y curva
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p.px.toFixed(1) + ' ' + p.py.toFixed(1)).join(' ');
      area = el('path', { class: 'area', d: d + ` L${pts[pts.length - 1].px} ${Y(0)} L${pts[0].px} ${Y(0)} Z` });
      curve = el('path', { class: 'curve', d, style: `stroke:${cfg.color}` });
      svg.append(area, curve);
      const len = curve.getTotalLength(); curve.style.strokeDasharray = len; curve.dataset.len = len;
      // Guía y tooltip
      guide = el('g', { class: 'guide', opacity: 0 });
      guide.append(el('line', { x1: 0, x2: 0, y1: PADT, y2: state.h - PADB }), el('circle', { r: 5 }));
      tip = el('g', { class: 'tip' }); tip.append(el('rect', { rx: 3, height: 34 }), el('text', { class: 't1', y: 14 }), el('text', { class: 't2', y: 27 })); guide.append(tip);
      // Marcador de progreso
      marker = el('g', { class: 'marker' });
      marker.append(el('circle', { r: 7, style: `fill:${cfg.color}` }), el('circle', { r: 12, class: 'halo', style: `stroke:${cfg.color}` }));
      mlabel = el('text', { class: 'mval', style: `fill:${cfg.color}` }); mnote = el('text', { class: 'mnote' });
      svg.append(guide, marker, mlabel, mnote);
      render();
    }
    function at(p) { const i = Math.min(pts.length - 1, Math.round(p * (pts.length - 1))); return pts[i]; }
    function render() {
      const len = +curve.dataset.len; curve.style.strokeDashoffset = len * (1 - state.p);
      area.style.opacity = .12 * state.p;
      const q = at(state.p); const pct = Math.round(q.y);
      marker.setAttribute('transform', `translate(${q.px} ${q.py})`);
      const right = q.px > state.w * .62;
      mlabel.setAttribute('x', q.px + (right ? -14 : 14)); mlabel.setAttribute('y', q.py - 24); mlabel.setAttribute('text-anchor', right ? 'end' : 'start'); mlabel.textContent = cfg.fmt(pct);
      mnote.setAttribute('x', q.px + (right ? -14 : 14)); mnote.setAttribute('y', q.py - 10); mnote.setAttribute('text-anchor', right ? 'end' : 'start'); mnote.textContent = cfg.unit + ' · ' + cfg.note(pct);
      fig.querySelector('.now').textContent = cfg.fmt(pct);
    }
    function hover(week) {
      if (week == null) { guide.setAttribute('opacity', 0); return; }
      const q = at(Math.max(0, Math.min(1, week / cfg.weeks)));
      guide.setAttribute('opacity', 1);
      guide.querySelector('line').setAttribute('x1', q.px); guide.querySelector('line').setAttribute('x2', q.px);
      guide.querySelector('circle').setAttribute('cx', q.px); guide.querySelector('circle').setAttribute('cy', q.py);
      const t1 = tip.querySelector('.t1'), t2 = tip.querySelector('.t2'), rect = tip.querySelector('rect');
      t1.textContent = `Semana ${Math.round(week)} · ${cfg.fmt(Math.round(q.y))}`; t2.textContent = cfg.note(Math.round(q.y));
      const tw = Math.max(t1.getComputedTextLength(), t2.getComputedTextLength()) + 16;
      const tx = q.px + 12 + tw > state.w - PADR ? q.px - 12 - tw : q.px + 12;
      tip.setAttribute('transform', `translate(${tx} ${Math.max(PADT, q.py - 44)})`); rect.setAttribute('width', tw); t1.setAttribute('x', 8); t2.setAttribute('x', 8);
    }
    const weekFromEvent = e => { const r = svg.getBoundingClientRect(); return ((e.clientX - r.left) - PADL) / (state.w - PADL - PADR) * cfg.weeks; };
    svg.addEventListener('pointermove', e => hover(weekFromEvent(e)));
    svg.addEventListener('pointerleave', () => hover(null));
    let kw = null;
    svg.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); kw = Math.max(0, Math.min(cfg.weeks, (kw ?? 0) + (e.key === 'ArrowRight' ? 1 : -1))); hover(kw); } if (e.key === 'Escape') { kw = null; hover(null); } });
    svg.addEventListener('blur', () => { kw = null; hover(null); });

    geometry();
    new ResizeObserver(() => geometry()).observe(plot);
    if (!RM) {
      new IntersectionObserver((es, io) => es.forEach(e => { if (!e.isIntersecting) return; io.disconnect();
        gsap.to(state, { p: 1, duration: 2.8, ease: 'power2.inOut', onUpdate: render, onComplete: () => marker.classList.add('pulse') });
      }), { threshold: .4 }).observe(fig);
    } else marker.classList.add('pulse');
  });
})();
