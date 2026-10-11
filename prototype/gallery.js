/* Lámina 02.7 · Animación: tarjetas pequeñas + visor. Para agregar una pieza: un objeto en PIECES + media/<id>.mp4 y media/<id>.jpg */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HOVER = matchMedia('(hover: hover)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const PIECES = [
    { id: 'nexera-pago-tarjeta', title: 'Pago con tarjeta · checkout completo', brand: 'Nexera', dur: '21.7 s', spec: '1920 × 1080 · 60 fps',
      what: 'Formulario de pago, tarjeta que se llena mientras el cliente escribe, giro para el CVV, verificación, aprobación y factura enviada al correo. Datos ficticios.' },
    { id: 'centerfit-pago-tarjeta', title: 'Pago con tarjeta · abono de cita', brand: 'CenterFit', dur: '11.2 s', spec: '1920 × 1080 · 60 fps',
      what: 'La misma pieza con otra marca: cambian colores, logo y copy; el guion y el flujo no. Versión corta para redes y para la página de reservas.' },
    { id: 'nexera-login-aurora', title: 'Acceso · Aurora', brand: 'Nexera', dur: '10.0 s', spec: '1920 × 1080 · 60 fps',
      what: 'Inicio de sesión sobre fondo de auroras: tarjeta de vidrio, correo y contraseña que se escriben, botón con degradado, accesos con terceros y la transición "Preparando tu espacio" al entrar.' },
    { id: 'nexera-login-dorado', title: 'Acceso · Dorado', brand: 'Nexera', dur: '11.5 s', spec: '1920 × 1080 · 60 fps',
      what: 'De "Bienvenido de vuelta" a "Crear cuenta" sobre cintas doradas en movimiento: nombre, correo, contraseña y confirmación, aceptación de términos, "Creando…" y el cierre "Tu cuenta está lista".' },
    { id: 'nexera-login-nex-el-asistente', title: 'Acceso · Nex, el asistente', brand: 'Nexera', dur: '11.0 s', spec: '1920 × 1080 · 60 fps',
      what: 'Un asistente con personalidad acompaña el registro: pregunta el nombre y el correo, se voltea cuando escribes la contraseña ("tu contraseña es privada") y celebra con "¡Bienvenida, María!".' },
    { id: 'nexera-login-otp', title: 'Acceso · Código OTP', brand: 'Nexera', dur: '9.5 s', spec: '1920 × 1080 · 60 fps',
      what: 'Verificación en dos pasos en tema claro: cuatro casillas que se llenan dígito a dígito, botón que se activa al completar, estado "Verificado" y salto al panel.' },
    { id: 'nexera-login-panel-deslizante', title: 'Acceso · Panel deslizante', brand: 'Nexera', dur: '10.5 s', spec: '1920 × 1080 · 60 fps',
      what: 'Tarjeta partida en dos: el panel se desliza entre "Iniciar sesión" y "Crear cuenta" sobre un fondo de planos angulares; termina con el logo y "Hola, María. Ya estás dentro".' },
  ];

  const grid = $('#pieces');
  if (!grid) return;
  const pad = n => String(n).padStart(2, '0');

  /* ---------- Tarjetas ---------- */
  grid.innerHTML = PIECES.map((p, i) => `
    <button class="card" type="button" data-i="${i}" aria-label="Abrir: ${p.title} · ${p.brand}">
      <span class="thumb">
        <img src="media/${p.id}.jpg" alt="" loading="lazy" decoding="async">
        <video muted playsinline loop preload="none" aria-hidden="true"></video>
        <span class="n">${pad(i + 1)}</span>
        <span class="play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
        <span class="dur">${p.dur}</span>
      </span>
      <span class="cap"><b>${p.title}</b><small>${p.brand} · ${p.spec}</small></span>
    </button>`).join('');

  const cards = $$('.card', grid);
  if (HOVER && !RM) cards.forEach((c, i) => { // vista previa muda al pasar el cursor
    const v = $('video', c);
    c.addEventListener('mouseenter', () => { if (!v.src) v.src = `media/${PIECES[i].id}.mp4`; v.currentTime = 0; v.play().catch(() => {}); c.classList.add('live'); });
    c.addEventListener('mouseleave', () => { v.pause(); c.classList.remove('live'); });
  });

  /* ---------- Visor ---------- */
  const dlg = document.createElement('dialog');
  dlg.className = 'viewer';
  dlg.innerHTML = `
    <div class="vw">
      <div class="vhead"><span class="vn"></span><span class="vt"></span><button class="vclose" type="button" aria-label="Cerrar">×</button></div>
      <div class="vscreen">
        <video playsinline preload="metadata"></video>
        <button class="vprev" type="button" aria-label="Pieza anterior">‹</button>
        <button class="vnext" type="button" aria-label="Pieza siguiente">›</button>
        <span class="vstate" aria-live="polite"></span>
      </div>
      <div class="vbar" role="slider" aria-label="Progreso" tabindex="0"><i></i></div>
      <div class="vfoot">
        <div class="vmeta"><b></b><span></span><p></p></div>
        <div class="vctl">
          <button class="vplay" type="button" aria-label="Pausar"><svg viewBox="0 0 24 24" fill="currentColor"><path class="ip" d="M7 5h4v14H7zM13 5h4v14h-4z"/><path class="ipl" d="M8 5v14l11-7z"/></svg></button>
          <button class="vmute" type="button" aria-pressed="false" aria-label="Silenciar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path class="w1" d="M16 9.5a3.5 3.5 0 0 1 0 5"/><path class="w2" d="M18.5 7a7 7 0 0 1 0 10"/></svg></button>
          <span class="vtime">0:00 / 0:00</span>
        </div>
      </div>
    </div>`;
  document.body.append(dlg);
  const v = $('video', dlg), bar = $('.vbar', dlg), fill = $('.vbar i', dlg), vtime = $('.vtime', dlg), vstate = $('.vstate', dlg);
  const btnPlay = $('.vplay', dlg), btnMute = $('.vmute', dlg);
  let cur = 0, lastFocus = null;
  const fmt = s => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

  function load(i) {
    cur = (i + PIECES.length) % PIECES.length;
    const p = PIECES[cur];
    $('.vn', dlg).textContent = `Ejemplo ${pad(cur + 1)} / ${pad(PIECES.length)}`;
    $('.vt', dlg).textContent = p.brand;
    $('.vmeta b', dlg).textContent = p.title;
    $('.vmeta span', dlg).textContent = `${p.brand} · ${p.dur} · ${p.spec}`;
    $('.vmeta p', dlg).textContent = p.what;
    v.poster = `media/${p.id}.jpg`; v.src = `media/${p.id}.mp4`; v.currentTime = 0;
    fill.style.transform = 'scaleX(0)'; vtime.textContent = `0:00 / ${p.dur.replace(' s', '')}`;
    // Con sonido si el navegador lo permite; si no, arranca en silencio y el altavoz queda listo para activarlo
    v.play().then(() => setPlay(true)).catch(() => {
      v.muted = true; btnMute.setAttribute('aria-pressed', 'true'); btnMute.setAttribute('aria-label', 'Activar sonido');
      v.play().then(() => setPlay(true)).catch(() => setPlay(false));
    });
  }
  function setPlay(on) { dlg.classList.toggle('playing', on); btnPlay.setAttribute('aria-label', on ? 'Pausar' : 'Reproducir'); vstate.textContent = on ? '' : 'Pausado'; }
  function open(i) {
    lastFocus = document.activeElement;
    v.muted = false; btnMute.setAttribute('aria-pressed', 'false'); btnMute.setAttribute('aria-label', 'Silenciar');
    load(i); dlg.showModal(); $('.vclose', dlg).focus();
  }
  function close() { v.pause(); v.removeAttribute('src'); v.load(); dlg.close(); lastFocus && lastFocus.focus(); }

  cards.forEach((c, i) => c.addEventListener('click', () => open(i)));
  $('.vclose', dlg).addEventListener('click', close);
  $('.vprev', dlg).addEventListener('click', () => load(cur - 1));
  $('.vnext', dlg).addEventListener('click', () => load(cur + 1));
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); }); // clic fuera
  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });   // Esc
  dlg.addEventListener('keydown', e => { if (e.key === 'ArrowRight') load(cur + 1); if (e.key === 'ArrowLeft') load(cur - 1); if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); toggle(); } });
  const toggle = () => { v.paused ? v.play().then(() => setPlay(true)) : (v.pause(), setPlay(false)); };
  btnPlay.addEventListener('click', toggle);
  $('.vscreen', dlg).addEventListener('click', e => { if (e.target === v) toggle(); });
  btnMute.addEventListener('click', () => { v.muted = !v.muted; btnMute.setAttribute('aria-pressed', v.muted); btnMute.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar'); });
  v.addEventListener('timeupdate', () => { if (v.duration) { fill.style.transform = `scaleX(${v.currentTime / v.duration})`; vtime.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`; bar.setAttribute('aria-valuenow', Math.round(v.currentTime / v.duration * 100)); } });
  v.addEventListener('ended', () => { setPlay(false); vstate.textContent = 'Fin · → siguiente'; });
  bar.addEventListener('click', e => { const r = bar.getBoundingClientRect(); v.currentTime = ((e.clientX - r.left) / r.width) * v.duration; });
})();
