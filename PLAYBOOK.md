# PLAYBOOK — Portafolio web de Alexis Vieto (v3)

> Léelo completo antes de escribir código. Es la fuente de verdad del proyecto: visión, reglas de contenido, diseño, arquitectura, fases y criterios de aceptación.
> Referencia visual y de contenido de la versión actual: `reference/portfolio-v2.html` (en producción en https://alexis-vieto.vercel.app).

---

## 0. Cómo usar este playbook (instrucciones para Claude Code)

1. Trabaja por fases (sección 9). No pases a la siguiente sin cumplir los criterios de aceptación de la actual.
2. Antes de escribir cualquier texto visible, aplica las **reglas de contenido** (sección 2). Son innegociables.
3. Todo el contenido que veas en `reference/portfolio-v2.html` (textos EN/ES, datos de los dashboards, íconos SVG de las apps, tokens de color) se reutiliza; no lo reinventes.
4. Los repos de los productos están en esta misma máquina (sección 6). Úsalos para sacar logos, capturas con datos de prueba y datos técnicos verificables. **Nunca** copies secretos, `.env`, llaves ni datos reales de clientes.
5. Cuando una tarea dependa de algo que solo Alexis puede dar (sección 10), déjala con un placeholder claro y anótala en `TODO-ALEXIS.md`.

---

## 1. Visión

**Objetivo:** que un reclutador o un cliente abra el link y piense "este tipo construye producto de verdad". La página no *dice* que Alexis es un profesional de tecnología: lo *demuestra* con demos que funcionan, producto en producción y una ejecución impecable.

**La tesis (el "¿por qué yo?"):**
- 20+ años dirigiendo operaciones de ingeniería y telecomunicaciones; 17 de ellos dueño de su propia empresa (40+ colaboradores, 300+ proyectos, ISO 9001).
- Conoce desde adentro los negocios para los que construye software. Cada producto nace de un problema que vivió.
- Construye con Claude Code: él define producto, modelo de datos, seguridad y arquitectura; la IA escribe gran parte del código; él revisa, prueba y decide qué sale a producción.
- Prueba en vez de promesa: nunca usó Power BI, pero ha construido 20+ dashboards dentro de aplicaciones. La página los muestra funcionando.

**Audiencias:**
1. Reclutadores y hiring managers (roles: PM técnico, Integration Architect, Solutions/Implementation, producto, automatización con IA).
2. Clientes potenciales de Nexera (empresas que todavía operan en Excel).

**Sensación buscada:** "se me voló la cabeza". Motion con intención, demos interactivas, imágenes reales, detalle de ingeniería. Nada genérico, nada de plantilla.

---

## 2. Reglas de contenido (NO NEGOCIABLES)

### Verdad
- **Solo funciones construidas.** Si no existe en el código, no aparece. En particular: el conteo de calorías por foto de NutriSoft **NO está construido** (solo hay contratos en `packages/ai`). No lo menciones.
- **No** presentar a Alexis como programador a mano. Su código escrito a mano es básico; su valor es saber qué construir, cómo debe comportarse y cómo verificarlo. Construye con Claude Code y lo dice abiertamente.
- **No** afirmar título de ingeniero en telecomunicaciones, PMP ni inglés C1. Inglés: lectura técnica y escrito fuertes, conversación intermedia.
- **No** afirmar experiencia con Power BI.
- **Nunca** nombrar a la empresa actual (nombre omitido). Si hace falta referirse al empleo actual o a herramientas internas: "una empresa de ingeniería, telecomunicaciones y sistemas especiales".
- La empresa de producto es **Nexera** (no SUPRA). Proytel = empresa propia 2006–2023. Nada de temas personales.
- Para NutriSoft no listar "paquetes/citas adicionales" como pendientes.
- Los datos de demos son ficticios y deben verse ficticios (nombres inventados, sin datos reales de clientes).

### Marca
- **tino** siempre en minúscula. Es producto de Nexera. Nombre viene de "atinar".
- Nombres: Atrio, NutriSoft, NexGuard360, Modus PM, tino, Nexera.

### Estilo (skill no-ai-slop)
Pasa todo texto por estas reglas antes de darlo por bueno:
- Nada de "Don't take my word for it", "game-changer", "seamless", "leverage", "unlock", "elevate", "in today's fast-paced world", "passionate about".
- Nada de contrastes binarios forzados ("No es X, es Y"), preguntas retóricas como gancho, tríadas decorativas, ni cierres motivacionales.
- Sin em dashes como muletilla. Frases cortas, concretas, con números reales.
- Primera persona, voz de ingeniero: directo, específico, sin adornos.
- Español neutro panameño en ES; inglés sencillo y claro en EN (no frases que Alexis no diría).

### Bilingüe
- Todo el sitio en **EN y ES**, con selector visible. EN por defecto; recordar la elección del visitante.

---

## 3. Identidad visual

**Concepto:** "Juego de planos as-built / según construido". La página es un set de láminas de ingeniería: cuadro de rótulo, cotas en rojo de revisión (redline), láminas numeradas, grilla de plano. Esto es lo que le da carácter: es *su* lenguaje (20 años de planos), no una plantilla de dev.

### Tokens (de v2, mantener)
```css
/* Light */
--paper:#f4f6f9; --sheet:#ffffff; --sunk:#e8edf4; --ink:#0f2044; --ink2:#44526d; --ink3:#7b88a1;
--line:#d5ddea; --rule:#b9c5d8; --blue:#3d64ad; --blue2:#5b83c9; --soft:#e3ebf8; --grid:rgba(61,100,173,.07);
--red:#d9480f; --redsoft:#fde6da;
--good:#1d7f55; --goodsoft:#dcf1e6; --warn:#a8650f; --warnsoft:#fbeed7; --bad:#b4373a;
--bp:#0c1b3d; --bpink:#eef3fc; --bpink2:#a9badb; --bpline:rgba(169,194,242,.16); --bpred:#ff7a45;
/* Dark */
--paper:#081228; --sheet:#0e1a37; --sunk:#0b1630; --ink:#eef2fa; --ink2:#aab7cf; --ink3:#7584a0;
--line:#22335a; --rule:#2f4373; --blue:#7fa3e6; --blue2:#a9c2f2; --soft:#16284f; --grid:rgba(127,163,230,.06);
--red:#ff7a45; --redsoft:#3d1e10; --good:#4fc28a; --goodsoft:#0f3527; --warn:#e5a84a; --warnsoft:#3a2a10; --bad:#ef7a7c; --bp:#050d1f;
```
- Tipografía: **Barlow Condensed** 600–800 (display, títulos, números grandes) · **Geist** 400–700 (texto) · **Geist Mono** 500–600 (anotaciones, rótulos, código, cotas). Cargar con `next/font`.
- Rojo de revisión (`--red`) solo para cotas, marcas de revisión, "hoy" en gráficos y acentos puntuales.
- Tema claro/oscuro: respetar el sistema + toggle manual.

### Elementos de firma
- **Cuadro de rótulo** en el hero: Proyecto · Dibujó "A. Vieto con Claude Code" · Escala 1:1 · Rev 2026.10 · Láminas 01/0N · Estado As-built / Según construido · Constructor NEXERA.
- **Cotas redline** sobre las cifras 20+ / 300+ / 5 / 20+.
- **Insignias circulares de lámina** (02, 03…) en cada sección.
- Pie: "REV. 2026.10".

### Logos de las apps
Íconos SVG inline ya hechos en `reference/portfolio-v2.html` (buscar los `<svg>` dentro de las tarjetas de producto y el bloque `<defs>` oculto con gradientes `#ns-bg`, `#ng-sh`). Fuentes originales para versiones de mayor calidad:
- Atrio: `C:\dev-PH\Branding\atrio-appicon.svg`
- NutriSoft: `C:\dev-nutrisoft\play store\icono-nutrisoft.svg`
- NexGuard360: `C:\dev-seguridad\public\brand\logo-nexguard360-*.svg`
- tino: `C:\RRHH\public\icon.svg`
- Modus PM: no hay archivo; usar la "M" recreada (trazo #5b83c9 sobre #0f2044).

---

## 4. Motion e interacción

Herramientas sugeridas: **Framer Motion** (o Motion One) para componentes, **GSAP + ScrollTrigger** para secuencias de scroll, **Lenis** para scroll suave (opcional). SVG nativo para dibujos de plano.

1. **Hero que se dibuja:** la grilla aparece, las líneas del plano se trazan con `stroke-dashoffset`, las cotas se extienden desde los extremos y los números cuentan (20+, 300+, 5, 20+). El cuadro de rótulo se "llena" campo por campo como si se escribiera.
2. **Scroll de láminas:** cada sección entra como una lámina que se completa: líneas de construcción primero, luego contenido. Insignia de lámina con trazo circular animado.
3. **Dashboards vivos:** se animan al entrar en viewport (barras crecen, líneas se trazan), tooltips, filtros, y un "tick" de datos cada pocos segundos para que se sientan en vivo.
4. **Tarjetas de producto:** tilt 3D sutil al hover, el logo se eleva, aparece una mini captura/video.
5. **Microinteracciones:** cursor tipo mira de plano en zonas interactivas (solo desktop), transición suave al cambiar idioma (crossfade de texto) y tema.
6. **Transiciones entre páginas** (portafolio → caso de producto) con View Transitions API / shared layout: el logo viaja de la tarjeta al encabezado del caso.

**Obligatorio:**
- `prefers-reduced-motion`: todo se ve completo y estático, sin animación.
- Nada bloquea el contenido: el texto es legible aunque el JS falle.
- Lighthouse ≥ 95 en Performance, Accessibility, Best Practices y SEO (móvil). CLS < 0.05.
- Funciona a 375 px sin scroll horizontal.

---

## 5. Arquitectura del sitio

### Stack
- **Next.js (App Router) + TypeScript estricto + Tailwind** (el sitio mismo demuestra el stack de Alexis).
- i18n con rutas `/en` y `/es` (o `next-intl`). Textos en archivos de mensajes, no en componentes.
- Contenido de productos en MDX o JSON tipado (Zod) en `content/products/*`.
- Deploy en **Vercel**. Proyecto existente: `alexis-vieto` (id `prj_W4e6gxqmyqe07gdCrsmPPlS2uJjC`). Vercel Analytics + Speed Insights activados.
- Repo público en GitHub: `alexisvieto/alexis-vieto` (pendiente de crear; ver sección 10).

### Mapa de páginas
```
/                       → Portafolio principal (one-page con láminas)
/products/atrio         → Caso de producto
/products/nutrisoft     → Caso de producto  (prioridad: no tiene dominio público)
/products/nexguard360   → Caso de producto
/products/modus         → Caso de producto  (prioridad: no tiene dominio público)
/products/tino          → Caso de producto
/match                  → Analizador de vacantes (IA)
/cv                     → Descarga CV EN/ES
```

### Láminas del home
| # | Lámina | Contenido |
|---|---|---|
| 01 | Hero / rótulo | Nombre, tesis en una línea, cotas con cifras, CTA "Ver demos" y "Contacto" |
| 02 | Por qué yo | 3 argumentos (operación real, producto en producción, humano aprueba la IA) + nota sincera de cómo construye |
| 03 | Demo en vivo | 3 dashboards interactivos (proyecto, finanzas PH, contratación) — ya existen en v2 |
| 04 | Productos | 5 tarjetas con logo, una línea, stack, estado (En línea / En tiendas pronto / Piloto), botón al caso |
| 05 | Sitios web | Previews en vivo de los sitios construidos (sección 7) |
| 06 | Herramientas internas | Galería anonimizada (sección 7) — requiere OK de Alexis |
| 07 | Pregúntale / Analizador | Entrada a la función con IA (sección 8) |
| 08 | Trayectoria | Proytel 2006–2023 → empresa de ingeniería → Nexera 2025– |
| 09 | Cómo trabajo con Claude Code | Flujo: especificación → skills/agentes → revisión → pruebas → producción; números (pruebas, migraciones) |
| 10 | Contacto | Correo, LinkedIn, GitHub, WhatsApp, descarga de CV |

### SEO y compartir
- **Imagen OG** por idioma y por página de producto (1200×630), generada con `next/og` en estilo plano. Crítico: hoy el link en WhatsApp/LinkedIn sale sin imagen.
- `metadata` completa, `sitemap.xml`, `robots.txt`, JSON-LD `Person` + `SoftwareApplication` por producto.
- Favicon/ícono propio (monograma "AV" en estilo rótulo).

---

## 6. Productos — datos verificables

Los repos locales son la fuente de verdad. Confirma cada número contra el código antes de publicarlo.

### Atrio — Administración de propiedad horizontal
- Repo: `C:\dev-PH` · En línea: https://app.atrioph.net · Estado: listo; publicación en Play Store / App Store en curso.
- Stack: Next.js 16, React 19, TypeScript, Supabase (PostgreSQL 17), Capacitor (Android/iOS), Yappy, API de Claude (tool use), pg_cron, push.
- Hace: apps para residente, garita y administración. Pagos con Yappy que se reflejan solos en el estado de cuenta. Ciclo contable completo (catálogo, cargos mensuales con pg_cron el día 1, estados de cuenta, recibos, cierre de periodo bloqueado en BD). Asistente IA del administrador (Claude, 12 herramientas de solo lectura limitadas por RLS). Comunicados redactados con IA. Visitas con QR, paquetería, botón de pánico por Realtime. RRHH/planilla con reglas legales de Panamá versionadas, mantenimiento, reportes con fotos, reservas, quejas, multas, PDFs con marca.
- Seguridad: RLS deny-by-default, FKs compuestas anti-mezcla entre clientes, funciones SECURITY DEFINER atómicas.
- **Demo interactiva:** estado de cuenta de un residente ficticio → botón "Pagar con Yappy" (simulado) → el saldo y el gráfico de cobranza se actualizan en vivo. Opcional: chat simulado del asistente con respuestas pregrabadas sobre morosidad.

### NutriSoft — Clínicas de nutrición
- Repo: `C:\dev-nutrisoft` · Sin dominio público → **el caso de producto es su vitrina principal.**
- Stack: Turborepo + pnpm, Next.js (web clínica), Expo / React Native (app paciente), Supabase (Auth, Storage, Realtime, Edge Functions `yappy-orden`, `yappy-ipn`).
- Hace: app del paciente (plan de alimentación, progreso, chat con su nutricionista). Motor nutricional determinista en paquete TS separado. Pagos Yappy en Edge Functions. Agenda y reservas en línea, expedientes, caja, finanzas, planilla, proveedores, ventas. Manuales por rol protegidos.
- Calidad: **696 pruebas automatizadas**, RLS en el 100% de las tablas con pruebas de aislamiento, **179 migraciones** versionadas.
- ⚠️ NO mencionar conteo de calorías por foto.
- **Demo interactiva:** calculadora de porciones y macros (peso, altura, objetivo → requerimiento, distribución de macros, porciones por grupo) replicando la lógica del motor determinista; mockup del teléfono mostrando el plan resultante.

### NexGuard360 — ERP de seguridad privada
- Repo: `C:\dev-seguridad` · En línea: https://www.nexguard360.com
- Stack: Next.js 16, TypeScript strict, Supabase (PG17), Zod, Leaflet, API de Claude, Resend. 42+ tablas multiempresa.
- Hace: marcación QR + GPS por puesto; rastreo de flota en vivo (Leaflet + webhook GPS autenticado); analítica conversacional con Claude y redacción asistida de bitácoras; reportes diarios 8 a.m. por Resend; nómina quincenal desde marcaciones (horas extra, retenciones CSS) cuadrada al centavo contra el Excel que reemplazó; centro de comando, monitor en vivo, turnos, custodia de armamento con firma, RRHH, capacitaciones, portal del cliente.
- Seguridad: 4 roles (dueño, administrador, editor, auditor) con RLS por cliente.
- **Demo interactiva:** mapa Leaflet de Ciudad de Panamá con puestos ficticios; agentes marcan entrada (pin que pulsa verde/rojo según geocerca y turno); feed de eventos en vivo; contador de asistencia.

### Modus PM — Gestión de proyectos de ingeniería
- Repo: `C:\dev-modus` · Sin dominio público → **el caso de producto es su vitrina principal.**
- Stack: Next.js, TypeScript, Supabase, 2 microservicios Python (FastAPI + PyMuPDF) en Docker, API de Claude, Sentry, Web Push, exceljs.
- Hace: cálculo de planos (motor Python cuenta símbolos por geometría y visión; una persona confirma leyenda y corrige en visor); análisis de pliegos con IA (resumen, sistemas, tabla de equipos, panel de riesgos con cita textual); reportes diarios con IA desde el Gantt; Gantt con dependencias, curva S, control de costos importado de Excel/CSV, cotizaciones a Excel; inventario con escáner de código de barras por cámara, punch list, protocolos FAT/SAT, embudo CRM, push; PDFs con marca.
- **Demo interactiva:** plano SVG de una planta ficticia; botón "Contar" → los símbolos (cámaras, detectores, APs) se resaltan uno a uno y la tabla de cantidades se llena; el usuario puede hacer clic para corregir un símbolo (humano en el ciclo). Segundo bloque: Gantt mini con curva S.

### tino — Selección de personal con criterio
- Repo: `C:\RRHH` · Sitio: https://www.contratacontino.com · App: https://app.contratacontino.com · Producto de Nexera.
- Stack: React + Vite (PWA), Tailwind v4, Supabase con RLS vía `current_org_id()`, funciones Vercel (`apply`, `extract`, `screen`, `suggest-bank`, crons `maintenance` y `process-auto`), API de Claude, Resend. Planes y control de uso de IA (`ai_usage`), consentimiento según Ley 81, retención de 2 años.
- Hace: perfil de cargo, portal de postulación, extracción de CV y evaluación de candidatos con IA; una persona decide.
- Confirma el detalle de funciones en el repo antes de escribir el caso.
- **Demo interactiva:** perfil de cargo ficticio + 3 CVs ficticios → "Evaluar" → tarjetas con puntaje, evidencias citadas del CV y brechas; botones Aprobar/Descartar (el humano decide).

### Plantilla del caso de producto (todas las páginas)
1. Encabezado: logo grande, nombre, una línea, estado, link en vivo si existe.
2. **El problema** (de dónde salió, en la voz de Alexis, 3–4 frases).
3. **Demo interactiva** (arriba, no al final).
4. Qué hace (funciones construidas, agrupadas).
5. **Arquitectura**: diagrama SVG animado (cliente → Next.js → Supabase/RLS → Edge/Functions → Claude/Yappy/Resend), con flujo de datos que se ilumina al hacer scroll.
6. Decisiones técnicas (3–5, con el porqué).
7. Seguridad y calidad (números).
8. Galería: capturas reales en marcos de laptop y teléfono + video loop del flujo clave.
9. Navegación al siguiente producto.

---

## 7. Sitios web y herramientas internas

### Sitios web construidos (lámina 05)
- nexerai.io (Nexera) · nexguard360.com · contratacontino.com · este portafolio.
- Mostrar con captura/preview en marco de navegador, link en vivo y 1–2 datos del stack.
- Repo de Nexera web: `C:\dev\nexera-web` (confirmar ruta).

### Herramientas internas (lámina 06) — **requiere OK de Alexis**
- Herramientas que construyó para una empresa de ingeniería (sin nombrarla): suite de administración interna (caja chica, almacén, taller/flota, comercial), plataforma de operaciones con calculadora y PM, app de reserva de salas con kiosko en tablet, app de solicitudes administrativas (RRHH y compras), CRM con costos y pliegos, documentación de campo offline para datacenters.
- Capturas con **datos difuminados**, sin logos ni nombre de la empresa. Respaldan los "20+ dashboards".

---

## 8. Funciones inteligentes (IA)

### 8.1 Analizador de vacantes (`/match`) — prioridad
- El visitante pega la descripción de un puesto (o URL de texto plano).
- Una ruta API (`app/api/match/route.ts`) llama a la **API de Claude** con un system prompt que contiene **solo** un perfil verificado de Alexis (`content/profile.json`: experiencia, productos, stack, evidencias con links).
- Respuesta estructurada (JSON validado con Zod): por cada requisito → `cumple | parcial | no`, evidencia concreta con link a la lámina/caso, y una nota honesta para los "no". Resumen final.
- **Reglas del prompt:** no inventar experiencia; si no hay evidencia, decir "no" o "parcial"; nunca afirmar Power BI, título de telecom, PMP ni C1; nunca mencionar la empresa actual (nombre omitido).
- UI: tabla animada que se llena requisito por requisito (streaming), con botón "Descargar como PDF" y "Contactar a Alexis".

### 8.2 "Pregúntale a mi portafolio" (chat)
- Widget flotante. Mismo perfil verificado como contexto. Respuestas cortas en el idioma del visitante, con links a la sección relevante.

### Infraestructura común
- Variable de entorno `ANTHROPIC_API_KEY` en Vercel (la configura Alexis; nunca en el repo).
- Rate limit por IP (p. ej. Upstash Redis o Vercel KV): ~10 consultas/hora/IP, tope diario global.
- Límite de entrada (p. ej. 8.000 caracteres), `max_tokens` acotado, modelo económico rápido para el chat.
- Logs sin datos personales. Aviso breve: "Las respuestas las genera IA a partir de mi perfil verificado."
- Si la key no existe, la UI muestra un estado elegante "Disponible pronto" (no rompe el build).

---

## 9. Fases y criterios de aceptación

### Fase 1 — Base profesional
- Next.js + TS strict + Tailwind + i18n EN/ES; tokens y fuentes de la sección 3.
- Migrar todo el contenido y los 3 dashboards de v2 a componentes (mismos datos `P`, `F`, `R`).
- OG images, metadata, sitemap, JSON-LD, favicon, Analytics.
- Deploy en el proyecto Vercel existente; dominio propio si Alexis ya lo definió.
- ✅ Paridad visual con v2, Lighthouse ≥ 95 móvil, sin overflow a 375 px, OG visible al pegar el link en WhatsApp.

### Fase 2 — Motion
- Hero que se dibuja, láminas al scroll, dashboards animados, tarjetas con tilt, transiciones de idioma/tema.
- ✅ 60 fps en laptop media, `prefers-reduced-motion` respetado, Lighthouse sigue ≥ 95.

### Fase 3 — Casos de producto
- 5 páginas con la plantilla de la sección 6 y su demo interactiva. Orden: **Modus → NutriSoft → NexGuard360 → tino → Atrio**.
- Capturas reales tomadas de entornos locales con datos de prueba (o las que entregue Alexis).
- ✅ Cada demo funciona sin backend, en móvil y desktop; cada afirmación verificada contra el repo; ninguna función inexistente.

### Fase 4 — Web e internas
- Lámina de sitios web con previews. Lámina de herramientas internas (solo con OK).
- ✅ Ninguna imagen muestra nombre/logo de la empresa ni datos reales.

### Fase 5 — IA
- `/match` primero, luego el chat.
- ✅ 10 vacancias de prueba (incluida una que pide Power BI) devuelven evaluaciones honestas; rate limit probado; sin key el sitio sigue funcionando.

### Fase 6 — Pulido y consistencia
- Revisión no-ai-slop completa EN y ES.
- Sección "Cómo trabajo con Claude Code".
- Descarga de CV EN/ES (`/cv`).
- Fuera del sitio (avisar a Alexis): actualizar PDFs de portafolio, CVs y portafolio en Docs con "tino" en minúscula, contratacontino.com y el link del portafolio.
- ✅ Checklist final de la sección 11 completo.

---

## 10. Lo que necesita Alexis (registrar en `TODO-ALEXIS.md`)
1. Capturas/videos de cada app con datos de prueba (o levantar entornos locales con seed para que Claude Code las tome).
2. Foto profesional.
3. Dominio definitivo (p. ej. alexisvieto.com o alexis.nexerai.io).
4. GitHub: crear repo vacío `alexis-vieto` o renovar token.
5. `ANTHROPIC_API_KEY` en Vercel (la pone él).
6. OK explícito para mostrar herramientas internas anonimizadas.
7. CVs finales EN/ES en PDF para `/cv`.

---

## 11. Checklist de calidad final
- [ ] Ninguna mención a la empresa actual (nombre omitido), Power BI, PMP, título de telecom, C1, ni calorías por foto.
- [ ] "tino" en minúscula en todo el sitio.
- [ ] EN y ES completos, sin textos mezclados.
- [ ] Texto revisado con no-ai-slop.
- [ ] Lighthouse ≥ 95 (móvil) en home y en un caso de producto.
- [ ] Sin overflow horizontal a 375 px; probado claro y oscuro.
- [ ] `prefers-reduced-motion` probado.
- [ ] OG correcto en WhatsApp, LinkedIn y X.
- [ ] Links en vivo funcionando (app.atrioph.net, nexguard360.com, contratacontino.com, LinkedIn, GitHub).
- [ ] Sin secretos en el repo; `.env.example` documentado.
- [ ] Analytics recibiendo visitas.

---

## 12. Contacto (para la lámina final)
- Correo: alexisvieto@gmail.com
- LinkedIn: https://www.linkedin.com/in/alexis-vieto
- GitHub: https://github.com/alexisvieto
- WhatsApp: +507 6918-8423
- vCard Nexera: https://www.nexerai.io/v/alexis
