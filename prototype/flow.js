/* Lámina 02.5 · Flujo de automatización estilo n8n. Proyecto confidencial: distribuidora de carne. Clientes, cortes, precios y pedidos son ficticios. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}, text) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (text != null) n.textContent = text; return n; };
  if (!RM && window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);

  /* ---------- Íconos (trazo 1.6) ---------- */
  const I = {
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    chat: '<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
    ai: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    split: '<path d="M6 4v6a4 4 0 0 0 4 4h4"/><path d="M6 10v10"/><circle cx="6" cy="4" r="1.5"/><circle cx="18" cy="14" r="1.5"/><circle cx="6" cy="20" r="1.5"/>',
    alt: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 16"/><path d="M4 20v-4h4"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 13h5M9.5 16.5h5"/>',
    pay: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/><path d="M7 14.5h4"/>',
    truck: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  };
  const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg>`;

  /* ---------- Grafo ---------- */
  const W = 168, H = 64, COL = x => 30 + x * 196;
  const NODES = [
    { id: 'call', x: COL(0), y: 96, type: 'trigger', ic: 'phone', t: 'Llamada', s: 'Trigger · voz', what: 'Un asistente contesta la llamada, saluda con el nombre de la empresa y transcribe el pedido.', how: 'Telefonía con asistente de voz (voz a texto) que dispara el flujo.', where: 'Patrón nuevo; la extracción posterior es la misma de tino.' },
    { id: 'wa', x: COL(0), y: 232, type: 'trigger', ic: 'chat', t: 'WhatsApp', s: 'Trigger · webhook', what: 'El mensaje del cliente llega por WhatsApp y un webhook lo recibe.', how: 'WhatsApp Business API → webhook en función serverless.', where: 'Webhook GPS autenticado (HMAC) en NexGuard360; mensajes por correo y WhatsApp en tino.' },
    { id: 'ai', x: COL(1), y: 164, ic: 'ai', t: 'Asistente IA', s: 'Claude · extrae el pedido', what: 'Claude lee el texto y extrae producto, cantidad, fecha y lugar. Si falta algo, pregunta.', how: 'API de Claude con salida estructurada (JSON schema) validada con Zod.', where: 'Extracción de CV y evaluación en tino; asistente con 12 herramientas en Atrio.' },
    { id: 'db', x: COL(2), y: 164, ic: 'db', t: 'Supabase', s: 'Inventario · cliente', what: 'Consulta el inventario por corte y origen (nacional o importado), la lista de precios del cliente y su estado de crédito, con RLS por empresa.', how: 'PostgreSQL con políticas RLS deny-by-default.', where: '45/45 tablas con RLS en NexGuard360; 49/49 en NutriSoft con prueba de cobertura.' },
    { id: 'if', x: COL(3), y: 164, type: 'if', ic: 'split', t: '¿Hay stock?', s: 'IF · stock por fecha', what: 'Decide la rama: si hay kilos del corte pedido, cotiza; si no, ofrece un corte equivalente.', how: 'Regla de negocio en el flujo, sin IA.', where: 'Lógica de decisión en todos los productos.' },
    { id: 'alt', x: COL(4), y: 300, ic: 'alt', t: 'Alternativa', s: 'Corte equivalente', what: 'Busca un corte equivalente con existencia (otro origen o pieza similar) y lo propone al cliente.', how: 'Consulta de sustitutos + mensaje por el mismo canal.', where: 'Sugerencias del banco de talento en tino (mismo patrón).' },
    { id: 'quote', x: COL(5), y: 164, ic: 'doc', t: 'Cotización PDF', s: 'Precio por kg · lista del cliente', what: 'Arma la cotización por kilo con la lista de precios de ese cliente y la envía con PDF por el mismo canal.', how: 'PDF con marca generado en servidor y enviado por WhatsApp.', where: '11 PDFs corporativos en Atrio; cotizaciones a Excel con fórmulas vivas en Modus PM.' },
    { id: 'pay', x: COL(6), y: 164, ic: 'pay', t: 'Esperar pago', s: 'Yappy · tarjeta · crédito', what: 'El cliente paga o usa su crédito aprobado. La confirmación llega sola y el pedido pasa a "Pagado".', how: 'Yappy + IPN (firma HMAC) o pasarela de tarjeta.', where: 'Edge Functions yappy-orden / yappy-ipn en NutriSoft.' },
    { id: 'go', x: COL(7), y: 164, type: 'final', ic: 'truck', t: 'Entrega', s: 'Ruta refrigerada · firma', what: 'Se genera la orden de despacho en la ruta refrigerada. El chofer confirma con foto y firma.', how: 'Mapa con GPS en vivo, reportes con foto, push al cliente.', where: 'Rastreo de flota y reportes con foto en NexGuard360.' },
  ];
  const EDGES = [
    ['call', 'ai'], ['wa', 'ai'], ['ai', 'db'], ['db', 'if'],
    ['if', 'quote', 'a'], ['if', 'alt', 'b'], ['alt', 'quote'], ['quote', 'pay'], ['pay', 'go'],
  ];
  const ORDERS = [
    { id: 'A', name: 'Carnicería La Central', total: 1235.00, trigger: 'wa', branch: 'a', payWait: true, cash: '$1,235.00 · Yappy',
      steps: { wa: 'La Central · 40 kg lomo nac. + 25 kg costilla imp.', ai: '2 cortes · jue 16-oct · San Miguelito', db: 'Lomo nac. 320 kg · Costilla imp. 180 kg · crédito al día', if: 'Hay kilos → sí', quote: 'Total $1,235.00 · lista mayorista · PDF enviado', pay: 'Yappy · YP-48213 · pagado', go: 'Entregado jue 06:30 · ruta 2 · firma' } },
    { id: 'B', name: 'Restaurante Punta Mar', total: 612.00, trigger: 'call', branch: 'a', cash: '$612.00 · tarjeta',
      steps: { call: '+507 6xxx-xxxx · transcrito', ai: 'Preguntó origen → picaña importada · 30 kg', db: 'Picaña imp. 95 kg · cliente nuevo', if: 'Hay kilos → sí', quote: 'Total $612.00 · lista restaurantes · PDF enviado', pay: 'Tarjeta · aut. 004417 · pagado', go: 'Entregado vie 05:45 · ruta 1 · firma' } },
    { id: 'C', name: 'Minisúper Doña Ana', total: 171.00, trigger: 'wa', branch: 'b', cash: '$171.00 · Yappy',
      steps: { wa: 'Doña Ana · 15 kg bife ancho importado', ai: '1 corte · sáb 18-oct · Las Cumbres', db: 'Bife ancho imp. 0 kg el 18-oct', if: 'Sin kilos → no', alt: 'Ofrece bife ancho nacional · cliente acepta', quote: 'Total $171.00 · lista minoristas · PDF enviado', pay: 'Yappy · YP-48227 · pagado', go: 'Entregado sáb 06:10 · ruta 3 · firma' } },
  ];

  /* ---------- Render ---------- */
  const canvas = $('#canvas'), wrap = $('#canvas-wrap'), svg = $('#edges');
  const nodeEl = {}, edgeEl = {};
  NODES.forEach(n => {
    const d = document.createElement('div');
    d.className = `node ${n.type || ''}`; d.id = 'n-' + n.id; d.tabIndex = 0; d.setAttribute('role', 'button');
    d.style.left = n.x + 'px'; d.style.top = n.y + 'px';
    d.innerHTML = `<span class="ic">${icon(n.ic)}</span><span class="tx"><b>${n.t}</b><small data-default="${n.s}">${n.s}</small></span>
      <i class="st"><em class="spin"></em><em class="ok">${icon('check')}</em></i>
      ${n.type === 'trigger' ? '<i class="bolt"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg></i>' : '<i class="port in"></i>'}
      ${n.type === 'if' ? '<i class="port out a"><u>sí</u></i><i class="port out b"><u>no</u></i>' : n.type === 'final' ? '' : '<i class="port out"></i>'}`;
    canvas.append(d); nodeEl[n.id] = d;
    const show = () => { $('#fd-what').textContent = n.what; $('#fd-how').textContent = n.how; $('#fd-where').textContent = n.where; $$('.node').forEach(x => x.classList.remove('sel')); d.classList.add('sel'); };
    d.addEventListener('click', show); d.addEventListener('keydown', e => e.key === 'Enter' && show());
  });
  const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
  const outPt = (n, port) => ({ x: n.x + W, y: n.type === 'if' ? n.y + (port === 'a' ? 20 : 44) : n.y + H / 2 });
  const inPt = n => ({ x: n.x, y: n.y + H / 2 });
  EDGES.forEach(([a, b, port]) => {
    const p1 = outPt(byId[a], port), p2 = inPt(byId[b]);
    const dx = Math.max(50, Math.abs(p2.x - p1.x) * .45);
    const d = `M${p1.x} ${p1.y} C${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;
    const g = svgEl('g', { class: 'edge', id: `e-${a}-${b}` });
    const path = svgEl('path', { d, class: 'line' });
    const mid = svgEl('text', { class: 'lbl', x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 - 8, 'text-anchor': 'middle' }, '1 item');
    g.append(path, mid); svg.append(g); edgeEl[`${a}-${b}`] = { g, path, mid };
  });
  const pulse = svgEl('circle', { class: 'pulse', r: 5, cx: -20, cy: -20 }); svg.append(pulse);

  // Escala del lienzo
  const fit = () => { const s = Math.max(.62, Math.min(1, wrap.clientWidth / 1600)); canvas.style.transform = `scale(${s})`; canvas.style.width = '1600px'; wrap.style.height = (420 * s) + 'px'; wrap.scrollLeft = 0; };
  fit(); addEventListener('resize', fit);

  $('#n-ai').click();
  payBtn0();
  function payBtn0(){ const b = $('#pay-btn'); b.style.left = byId.pay.x + 'px'; b.style.top = (byId.pay.y + H + 12) + 'px'; }

  /* ---------- Estado y contadores ---------- */
  const execText = $('#exec-text'), execTime = $('#exec-time'), exec = $('#exec'), done = $('#done'), doneSub = $('#done-sub');
  const cOrders = $('#c-orders'), cCash = $('#c-cash'), cTime = $('#c-time'), payBtn = $('#pay-btn');
  let orders = 1248, cash = 0, execNo = 1249;
  const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const setSub = (id, txt) => { const s = $('small', nodeEl[id]); s.textContent = txt ?? s.dataset.default; };
  const reset = () => {
    $$('.node').forEach(n => n.classList.remove('running', 'ok', 'lit'));
    NODES.forEach(n => setSub(n.id));
    Object.values(edgeEl).forEach(e => e.g.classList.remove('active', 'done'));
    exec.className = 'exec'; execTime.textContent = '';
  };

  if (RM) { // estado final estático del pedido A
    const o = ORDERS[0]; const path = ['wa', 'ai', 'db', 'if', 'quote', 'pay', 'go'];
    path.forEach(id => { nodeEl[id].classList.add('ok'); setSub(id, o.steps[id]); });
    ['wa-ai', 'ai-db', 'db-if', 'if-quote', 'quote-pay', 'pay-go'].forEach(k => edgeEl[k].g.classList.add('done'));
    done.classList.add('show'); doneSub.textContent = 'Pedido A · 21.6 s · $551.05 cobrado';
    execText.textContent = 'Completado · Pedido A'; exec.classList.add('ok');
    cCash.textContent = '$551.05';
    return;
  }

  /* ---------- Línea de tiempo ---------- */
  let resumeTimer = null, pendingResume = null;
  const master = gsap.timeline({ repeat: -1, repeatDelay: .4 });
  const toggle = $('#flow-toggle');
  const setToggle = () => {
    if (pendingResume) { toggle.textContent = 'Esperando pago…'; toggle.disabled = true; return; }
    toggle.disabled = false; toggle.textContent = master.paused() ? 'Reanudar' : 'Pausar'; toggle.setAttribute('aria-pressed', master.paused());
  };

  function travel(tl, key, dur = .7) {
    const e = edgeEl[key];
    tl.add(() => { e.g.classList.add('active'); gsap.set(pulse, { opacity: 1 }); });
    tl.to(pulse, { duration: dur, ease: 'power1.inOut', motionPath: { path: e.path, align: e.path, alignOrigin: [.5, .5] } });
    tl.add(() => { e.g.classList.remove('active'); e.g.classList.add('done'); gsap.set(pulse, { opacity: 0 }); });
  }
  const follow = id => {
    if (wrap.scrollWidth <= wrap.clientWidth + 4) return;
    const s = canvas.getBoundingClientRect().width / 1600;
    wrap.scrollTo({ left: Math.max(0, (byId[id].x + W / 2) * s - wrap.clientWidth / 2), behavior: 'smooth' });
  };
  function run(tl, id, txt, dur) {
    tl.add(() => { nodeEl[id].classList.add('running'); setSub(id, txt); follow(id); });
    tl.to({}, { duration: dur });
    tl.add(() => { nodeEl[id].classList.remove('running'); nodeEl[id].classList.add('ok'); });
  }

  ORDERS.forEach(o => {
    const tl = gsap.timeline();
    const t0 = { t: 0 };
    tl.add(() => {
      reset();
      execText.textContent = `Ejecución #${execNo.toLocaleString('en-US')} · Pedido ${o.id} · ${o.name}`;
      exec.classList.add('live');
      gsap.fromTo(t0, { t: 0 }, { t: 24, duration: 24, ease: 'none', onUpdate: () => execTime.textContent = t0.t.toFixed(1) + ' s' });
    });
    // Trigger
    tl.add(() => nodeEl[o.trigger].classList.add('lit'));
    tl.to({}, { duration: .5 });
    run(tl, o.trigger, o.steps[o.trigger], 1.2);
    travel(tl, `${o.trigger}-ai`);
    run(tl, 'ai', o.steps.ai, o.id === 'B' ? 2.2 : 1.6);
    travel(tl, 'ai-db');
    run(tl, 'db', o.steps.db, 1.3);
    travel(tl, 'db-if');
    run(tl, 'if', o.steps.if, .9);
    if (o.branch === 'a') {
      travel(tl, 'if-quote', .9);
    } else {
      travel(tl, 'if-alt', .8);
      run(tl, 'alt', o.steps.alt, 1.8);
      travel(tl, 'alt-quote', .9);
    }
    run(tl, 'quote', o.steps.quote, 1.5);
    travel(tl, 'quote-pay');
    // Pago: el pedido A espera al visitante hasta 4 s (addPause: la pausa y su reanudación viven en un solo lugar)
    tl.add(() => { nodeEl.pay.classList.add('running'); setSub('pay', o.payWait ? 'Esperando confirmación…' : o.steps.pay); });
    if (o.payWait) {
      tl.to({}, { duration: .05 });
      tl.add(() => {
        master.pause();
        payBtn.classList.add('show');
        pendingResume = () => { clearTimeout(resumeTimer); pendingResume = null; payBtn.classList.remove('show'); setSub('pay', o.steps.pay); master.play(); setToggle(); };
        resumeTimer = setTimeout(pendingResume, 4000);
        setToggle();
      });
      tl.to({}, { duration: .8 });
    } else {
      tl.to({}, { duration: 1.4 });
    }
    tl.add(() => { nodeEl.pay.classList.remove('running'); nodeEl.pay.classList.add('ok'); cash += o.total; cCash.textContent = '$' + fmt(cash); });
    travel(tl, 'pay-go');
    run(tl, 'go', o.steps.go, 1.4);
    // Cierre: todo en verde + sello
    tl.add(() => {
      gsap.killTweensOf(t0);
      exec.classList.remove('live'); exec.classList.add('ok');
      execText.textContent = `Completado · Pedido ${o.id} · ${o.name}`;
      doneSub.textContent = `Pedido ${o.id} · ${execTime.textContent} · ${o.cash}`;
      orders++; cOrders.textContent = orders.toLocaleString('en-US');
      cTime.textContent = (38 + Math.round(Math.random() * 6)) + ' s';
      execNo++;
    });
    tl.add(() => follow('go'));
    tl.fromTo(done, { opacity: 0 }, { opacity: 1, duration: .25 });
    tl.fromTo('#done .stamp', { scale: 1.35, rotate: -2 }, { scale: 1, rotate: -4, duration: .5, ease: 'back.out(2.5)' }, '<');
    tl.fromTo('#n-go', { boxShadow: '0 0 0 0 rgba(79,194,138,.6)' }, { boxShadow: '0 0 0 22px rgba(79,194,138,0)', duration: 1.2, ease: 'power2.out' }, '<');
    tl.to({}, { duration: 2.4 });
    tl.to(done, { opacity: 0, duration: .4 });
    tl.to({}, { duration: .5 });
    master.add(tl);
  });

  payBtn.addEventListener('click', () => pendingResume && pendingResume());

  // Pausar / reanudar y auto-pausa fuera de viewport
  let userPaused = false, visible = false;
  const sync = () => { if (pendingResume) return; (userPaused || !visible) ? master.pause() : master.play(); setToggle(); };
  toggle.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; sync(); }), { threshold: 0 }).observe(wrap);
  master.pause(); setToggle();
})();
