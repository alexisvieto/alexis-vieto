# PLAN v4 — Portafolio de Alexis Vieto (desde cero)

> Estado: APROBADO EN DIRECCIÓN (decisiones del 11-oct-2026). Falta aprobar el prototipo de F0 antes de construir el sitio.
> Sustituye las secciones 1, 3, 4, 5 y 9 del `PLAYBOOK.md`. Las secciones 2 (reglas de contenido), 6 (datos verificables), 10 y 12 siguen vigentes.
> `portfolio-v2.html` es solo fuente de datos (textos verificados, dashboards `P`/`F`/`R`, SVG de logos). Nada de su diseño ni de su código se hereda.

## Decisiones tomadas por Alexis (11-oct-2026)
1. El video del hero se produce **con IA**, no con cámara.
2. La identidad visual **evoluciona el estilo de planos** (as-built), no se reemplaza.
3. **FDE = Forward Deployed Engineer.** La sección explica qué es, cómo se hace y el resultado.
4. Automatización: flujo completo para una **empresa de alquiler ficticia** (llamada → WhatsApp → contestador → verificación en base de datos → respuesta con precio → pago Yappy o tarjeta → entrega). Se le da vida con motion construido por Claude Code.
5. Se quedan los capítulos Proyectos, Cómo trabajo y Contacto.
6. Alexis da acceso a todas las carpetas de proyecto; la interacción con él debe ser mínima. Todo dato se saca del código y se registra con su fuente.

---

## 1. Qué cambia respecto a v2

| | v2 (descartado) | v4 |
|---|---|---|
| Tesis | "Construye producto con Claude Code" | "Experto en tecnología que entrega sistemas completos: web inteligente, apps, móvil, BI, automatización y FDE" |
| Apertura | Hero tipográfico con rótulo | **Video de Alexis en su setup PRO, órbita 360° con cambios de velocidad, anotado como plano as-built** |
| Lenguaje visual | Planos, versión básica | **Planos, versión premium**: plano nocturno como lienzo principal, detalle de delineación real, motion de trazado, grano, luz de pantallas |
| Estructura | 10 láminas | 6 capítulos: Hero · Por qué yo · Servicios (6) · Proyectos · Cómo trabajo · Contacto |
| Motion | Trazos sueltos | Sistemas funcionando: video con speed ramp, flujo de automatización vivo, antes/después de FDE, dashboards con tick |
| Percepción | "Ingeniero que hace planos" | "Esto costó dinero y lo vale" |

---

## 2. Dirección visual: "Planos, evolucionados"

**Idea:** el portafolio es el juego de planos as-built de la carrera de Alexis, pero dibujado por alguien con presupuesto. Las láminas no son fondos con grilla: son documentos de ingeniería con la densidad de detalle de un plano real, animados como una pieza cinematográfica.

### Lienzo
- **Plano nocturno (`--bp #0c1b3d` → más profundo `#07122c`) como modo principal** y el que se abre por defecto. Es el que hace juego con el video y el que se ve caro.
- **Papel (`--paper`) como modo claro**, con la misma paleta de v2 (tokens del playbook §3). Toggle manual + sistema.
- Grilla de plano en dos niveles (fina y gruesa), con punto de fuga sutil en el hero. Grano fotográfico a 3–4% de opacidad sobre todo el sitio.

### Detalle de delineación (lo que lo separa de una plantilla)
- **Cuadro de rótulo** real en el hero y pie de cada lámina: proyecto, dibujó, revisión, escala, lámina N/NN, estado "Según construido".
- **Cotas redline** (`--red`) sobre cifras y sobre el propio video (ver §3.4).
- **Nubes de revisión** alrededor de los cambios importantes ("Rev. 2026.10: Nexera").
- **Marcas de sección** (A-A, B-B) para navegar entre capítulos; flecha de norte; escala gráfica; leyenda de símbolos para los servicios.
- Numeración de lámina en insignia circular con trazo animado.

### Tipografía (se mantiene, a otra escala)
- **Barlow Condensed** 700–800 para display, a 120–180 px en desktop. Números como protagonistas.
- **Geist** 400–600 para lectura. **Geist Mono** 500 para cotas, rótulos y datos.
- Interletrado y métricas afinadas por tamaño. Sin más de 3 tamaños por pantalla.

### Motion de la identidad
- Todo entra "dibujándose": líneas con `stroke-dashoffset`, cotas que se extienden desde los extremos, textos de rótulo que se escriben.
- Scroll controlado con Lenis. Cada lámina ocupa su pantalla y se completa a medida que entra.
- `prefers-reduced-motion`: todo visible y estático desde el primer frame.

---

## 3. El video del hero (producción con IA)

### 3.1 Qué se ve
Alexis sentado en un setup PRO: dos monitores wide de 26", terminal en uno y una app en el otro, teclado mecánico, lámpara de escritorio, cuarto oscuro con luz de pantallas. La cámara orbita 360° a su alrededor. La velocidad cambia: lenta frente a las pantallas y al rostro, rápida por detrás. Loop de 12–16 s sin corte visible. Sobre el video, cotas y rótulos redline anotan la escena como si fuera un plano del puesto de trabajo.

### 3.2 Herramientas
- **Primera opción: HeyGen** (conectado a esta sesión, lo opero yo directamente). Ruta: `create_image_generation` para los fotogramas clave con la identidad de Alexis → `image_to_video` / `reference_to_video` (HeyGen Video 1) para los segmentos de órbita → `get_model_video` para recoger.
- **Alternativas si HeyGen no da la consistencia:** Kling 2.x, Runway Gen-4 (referencias de personaje) o Veo 3.1. Las operaría Alexis desde su cuenta con los prompts y referencias que yo prepare.
- **Edición y encodes:** `ffmpeg` (scripts en el repo). Speed ramp con `setpts` por tramos o con HyperFrames si hace falta control fino. Escalado opcional con Topaz si el master sale a 1080p.

### 3.3 Proceso
1. **Referencias.** Ya existe `C:\dev\nexera-web\public\team\alexis.webp`. Se necesitan además 4–6 fotos reales de Alexis (frente, 3/4, perfil, sentado de cuerpo entero) con buena luz. Ver `TODO-ALEXIS.md`. El setup se genera por prompt (no depende del escritorio real).
2. **Fotograma clave.** Generar 8–12 imágenes del plano frontal (Alexis en el setup, iluminación cinematográfica, 16:9 y 9:16). Elegir una por formato. Esta imagen fija la paleta de todo el sitio.
3. **Segmentos de órbita.** Generar la vuelta en 4–5 clips de 8–10 s (frente → lateral derecho → espalda → lateral izquierdo → frente), cada uno partiendo del último frame del anterior para mantener continuidad. Prompt de cámara: órbita lenta a altura de hombros, foco en el sujeto, sin cortes.
4. **Selección y prueba.** Mínimo 3 generaciones por segmento. Criterio: rostro consistente, manos aceptables, monitores con forma correcta, sin deformación del cuarto. Si no se alcanza en dos rondas, se cambia de modelo; si tampoco, se vuelve a video real (plan anterior, guardado en el historial de este archivo).
5. **Edición.** Concatenar, speed ramp (0.4x frente a pantallas, 2.5x–3x por detrás), corrección de color unificada, costura del loop en el tramo rápido, grano.
6. **Pantallas.** Las pantallas generadas por IA no muestran contenido legible. Solución: en el video emiten luz y color; el contenido legible va en la capa de la página (anotaciones redline y mini UI real que aparece anclada a la pantalla en el tramo lento frontal). En el tramo frontal más estable se evalúa componer UI real por tracking; si no queda perfecto, no se hace.
7. **Encodes** (abajo). Posters AVIF/WebP del frame frontal.

### 3.4 Capa de anotaciones sobre el video
Sincronizada con el tiempo del video (`requestVideoFrameCallback`): al pasar frente al monitor izquierdo aparece la cota "2 × 26\" ultrawide" y el rótulo "Claude Code · pruebas en ejecución"; frente al derecho, "Atrio · producción"; en el tramo trasero, el cuadro de rótulo se completa campo por campo; al volver al frente, las cifras 20+ / 300+ / 5 / 20+ con sus cotas. El video es la escena; el plano es la narración.

### 3.5 Encodes y comportamiento
| Uso | Formato | Resolución | Peso objetivo |
|---|---|---|---|
| Desktop | AV1 (webm) + H.264 (mp4) | 1920×1080 | ≤ 4 MB |
| Móvil | AV1 + H.264 | 1080×1920 | ≤ 2.5 MB |
| Poster (LCP) | AVIF + WebP | ambos formatos | ≤ 80 KB |
| Scroll-scrub "Cómo trabajo" | 150 frames WebP | 1280 px | ≤ 6 MB, diferido |

Alojamiento en Vercel Blob. Poster primero (LCP), video después en silencio con fundido, `autoplay muted playsinline loop`, pausa fuera de viewport, solo poster con `prefers-reduced-motion` o `Save-Data`.

### 3.6 Audio
- **Autoplay siempre mudo.** Los navegadores bloquean el audio sin interacción; el loop se diseña para funcionar en silencio.
- **Botón de sonido en el hero** ("Audio · OFF/ON", estilo rótulo). Al activarlo entra una pista de 12–16 s en loop sincronizada con el speed ramp (tensión baja en tramos lentos, impacto al acelerar). La elección se recuerda; se silencia al salir del hero. Nunca se engancha el audio a un clic genérico en la página.
- **Diseño sonoro** a volumen bajo bajo la pista: teclado mecánico lejano, ventilación de equipo, tono corto cuando aparece una cota.
- **Versión para redes** (16:9 y 9:16) con música y diseño sonoro horneados, para LinkedIn, WhatsApp y X.
- **Fuente de la música**, en orden de preferencia: generada con IA a medida del ramp (Suno, Udio o ElevenLabs Music, licencia comercial en plan pago); catálogo con licencia web perpetua (Artlist, Epidemic); biblioteca libre solo como último recurso. Efectos de bancos licenciados o vía la skill de media. Nada con derechos ambiguos.
- Encodes: `.mp3` 128 kbps + `.ogg`, ≤ 300 KB, cargados solo al activar el botón.

---

## 4. Estructura del sitio

Home de una página con láminas numeradas 00–05 y navegación por marcas de sección. Casos de producto y funciones de IA en fases posteriores (playbook §6 y §8).

### 00 · Hero (Lámina 00 · Portada del juego de planos)
Video anotado. Titular de 2 líneas. Una línea de posicionamiento. CTA: "Ver servicios" · "Hablemos". Cuadro de rótulo completo.

### 01 · ¿Por qué yo? (Lámina 01)
1. **Trayectoria.** Línea de tiempo que avanza con el scroll, dibujada como eje de cotas: Proytel 2006–2023 → empresa de ingeniería, telecomunicaciones y sistemas especiales → Nexera 2025–.
2. **Experiencia.** Lo que operó: equipos, tipos de proyecto, sectores, certificaciones.
3. **Logros corporativos.** Cifras grandes con cota y contexto: 40+ colaboradores, 300+ proyectos, ISO 9001, 17 años de empresa propia, 5 productos en producción.
4. **Logros personales.** 3–4 hitos (contenido de Alexis, ver TODO).

### 02 · Servicios (Láminas 02.1–02.6)
Mismo esqueleto en los seis: **Para qué se hizo · Cómo lo hace · Qué entrega · Resultados.** Cada uno con pieza visual propia y evidencia enlazada a un producto real.

| # | Servicio | Pieza visual | Evidencia |
|---|---|---|---|
| 02.1 | **Desarrollo Web inteligente** (sitios ligados a BD, pagos, estadísticas) | Un sitio que cobra: formulario → Yappy → fila en BD → panel con la venta apareciendo | contratacontino.com, nexguard360.com, nexerai.io |
| 02.2 | **Aplicaciones Web** | Laptop con app real; capas UI → API → BD/RLS que se separan al scroll | Atrio, NexGuard360, Modus PM, tino |
| 02.3 | **Aplicaciones Móviles** | Dos teléfonos con flujo real; push que llega | Atrio (Capacitor), NutriSoft (Expo), tino (PWA) |
| 02.4 | **Inteligencia de Negocios** | Los 3 dashboards de v2 reconstruidos, con filtros, tooltips y tick | 20+ dashboards dentro de aplicaciones |
| 02.5 | **Automatización** | **Flujo de la empresa de alquiler funcionando** (§5) | Patrones reales de Atrio (Yappy/IPN), tino (WhatsApp/Resend), NexGuard360 |
| 02.6 | **FDE** | Antes/después animado + medidores de productividad y efectividad (§6) | Nómina al centavo vs. Excel (NexGuard360), reporte 8 a.m., 696 pruebas / 179 migraciones (NutriSoft) |
| 02.7 | **Animación** (motion por código para explicar producto; agregado 11-oct-2026) | Galería de piezas de video en marco de pantalla: autoplay mudo al entrar en viewport, altavoz por pieza (una con sonido a la vez), barra de progreso con scrub, póster como LCP. Alexis carga ejemplos; cada uno es un objeto en `prototype/gallery.js` + `.mp4` y `.jpg` en `prototype/media/` | Piezas reales: "Pago con tarjeta" para Nexera (21.7 s) y para CenterFit (11.2 s), mismo guion, distinta marca |

### 03 · Proyectos (Lámina 03)
Cinco productos como evidencia: logo grande, una línea, estado, stack, captura real en marco, enlace en vivo. Clic → caso de producto (fase posterior).

### 04 · Cómo trabajo (Lámina 04)
Especificación → modelo de datos y seguridad → agentes y skills → revisión → pruebas → producción. Scroll-scrub de la órbita del video mientras se explican los pasos.

### 05 · Contacto (Lámina 05)
Correo, LinkedIn, GitHub, WhatsApp, vCard, CV EN/ES. Formulario sobre Supabase + Resend (el propio sitio demuestra 02.1).

---

## 5. Motion de Automatización: la empresa de alquiler

**Empresa ficticia:** nombre y rubro por definir en F0 (propuesta: alquiler de equipos para eventos o maquinaria liviana; el nombre debe verse inventado). Toda persona, número y precio son ficticios.

**Formato (decidido 11-oct-2026):** lienzo tipo **n8n**, literal: nodos con icono, título, subtítulo y puertos de entrada/salida; dos triggers con rayo (Llamada, WhatsApp); conexiones curvas por las que viaja un pulso de datos que activa el siguiente nodo; estados por nodo (en ejecución con spinner, completado con check); nodo IF "¿Hay stock?" con ramas sí/no y nodo Alternativa en la rama "no"; barra de ejecución con cronómetro. Al terminar, el nodo Entrega se pone verde, todas las conexiones del recorrido se iluminan en verde y aparece el sello "Proceso completado" con pedido, tiempo y monto; luego se reinicia con el siguiente pedido. Implementado en `prototype/flow.js`. La tabla de estaciones de abajo se mantiene como guion de contenido de cada nodo.

| # | Estación | Qué se ve | Patrón real detrás |
|---|---|---|---|
| 1 | **Llamada entrante** | Teléfono suena, número ficticio, onda de audio | Telefonía / WhatsApp Business API |
| 2 | **WhatsApp** | Burbujas de chat: "Hola, ¿tienen 10 carpas para el sábado?" | Webhook de mensajería |
| 3 | **Contestador / asistente** | Asistente IA entiende el pedido, extrae fecha, cantidad y producto; muestra el JSON que extrajo | Claude con tool use (como en tino y Atrio) |
| 4 | **Verificación en base de datos** | Consulta de disponibilidad e historial del cliente; filas que se iluminan; "10 disponibles de 24" | Supabase + RLS |
| 5 | **Respuesta con precio** | Cotización generada y enviada por WhatsApp con PDF | Generación de PDF con marca (Modus/Atrio) |
| 6 | **Pago Yappy o tarjeta** | El cliente elige; aparece la confirmación; el estado de cuenta se actualiza solo | Yappy + IPN (Atrio, NutriSoft) |
| 7 | **Entrega** | Orden de despacho, ruta en mapa, confirmación con foto y firma | Leaflet + GPS (NexGuard360), reportes con foto |

**Comportamiento:** entra un pedido nuevo cada 4–5 s, recorre las estaciones en 20–25 s, varios pedidos conviven en el flujo. Arriba, contadores: pedidos atendidos, tiempo promedio de respuesta, cobros confirmados (marcados "simulación"). El visitante puede pausar y tocar una estación para ver el detalle. En el paso 6 puede pulsar "Pagar con Yappy" y ver el resto del flujo responder.

**Cierre de la lámina:** "Este flujo sirve para la mayoría de las empresas. Cambian los productos, no las piezas."

**Técnica:** SVG + GSAP timeline en la página (sin backend, sin video), pausado fuera de viewport, estático con reduced-motion. Opcional: versión renderizada con HyperFrames para redes, a partir del mismo guion.

---

## 6. FDE · Forward Deployed Engineer (Lámina 02.6)

**Qué es.** Un ingeniero que se instala dentro de la operación del cliente, aprende el proceso real con la gente que lo ejecuta y despliega software sobre ese proceso en semanas. No entrega un sistema genérico para que el cliente lo adapte: adapta el sistema al cliente, en sitio, con sus datos.

**Cómo lo hacemos.**
1. Semana 1: diagnóstico en sitio. Se mapea el proceso real (no el documentado), se identifican el Excel, los correos y los pasos manuales.
2. Semanas 2–4: primera versión en producción con usuarios reales y datos reales. Se mide contra el proceso anterior.
3. Iteración sobre lo que la gente usa. Lo que no se usa se quita.
4. Entrega con documentación por rol, capacitación y traspaso. El cliente queda dueño del sistema.

**Qué mejoramos.**
- **Productividad:** horas que desaparecen (cierres, reportes, conciliaciones, nómina).
- **Efectividad:** errores que dejan de ocurrir (cálculos, estados de cuenta, asistencia, cotizaciones).

**Resultados (solo verificables).** Nómina quincenal calculada desde marcaciones, cuadrada al centavo contra el Excel que reemplazó. Reporte diario automático a las 8 a.m. Cargos mensuales el día 1 sin intervención. Cada cifra se enlaza a su producto. Los números de horas ahorradas los aporta Alexis o no se publican.

**Pieza visual:** la misma lámina partida en dos. Izquierda, "Antes": Excel, correos, llamadas, un reloj que corre. Derecha, "Después": el sistema desplegado, el mismo proceso en tres pasos, el reloj detenido. Dos medidores (productividad, efectividad) que suben con el scroll.

---

## 7. Arquitectura técnica

- **Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind v4.** Mismo stack que los productos.
- **i18n:** `next-intl`, rutas `/en` y `/es`. EN por defecto, elección recordada.
- **Contenido:** JSON tipado con Zod en `content/`. Cada dato lleva campo `source` (repo y archivo de donde salió).
- **Motion:** GSAP + ScrollTrigger, Framer Motion, Lenis. Un `MotionProvider` apaga todo con `prefers-reduced-motion`.
- **Video:** Vercel Blob. `HeroVideo` con poster, selección desktop/móvil, carga diferida, capa de anotaciones sincronizada.
- **Gráficos BI:** SVG propio, datos `P`/`F`/`R` migrados a `content/dashboards.ts`.
- **Contacto:** Server Action → Supabase → Resend. Rate limit por IP.
- **SEO:** OG por idioma con `next/og` (frame del video + rótulo), metadata, sitemap, robots, JSON-LD Person, favicon monograma "AV".
- **Deploy:** proyecto Vercel `alexis-vieto`, Analytics + Speed Insights. Repo GitHub `alexisvieto/alexis-vieto`.
- **Estado al 11-oct-2026:** repo creado y subido (privado) en `https://github.com/alexisvieto/alexis-vieto`. El prototipo se despliega en un proyecto Vercel aparte, `alexis-vieto-v4` (id `prj_Wub9SxuDC0yWL70MTi7w5K77T2nT`, enlazado al repo; `vercel.json` en la raíz sirve `prototype/` como directorio de salida, sin build; cada push a `main` despliega solo) en `https://alexis-vieto-v4.vercel.app`, para no tocar el sitio v2 que sigue en `alexis-vieto.vercel.app`. Cuando el sitio real (F1) esté listo, se apunta `alexis-vieto` al nuevo código y se retira `alexis-vieto-v4`.

**Presupuesto (home, móvil):** LCP ≤ 2.5 s, CLS < 0.05, JS inicial ≤ 180 KB gz, video fuera del camino crítico. Lighthouse objetivo ≥ 95; con video en hero se acepta Performance 90–95 si el resto da 100.

```
app/[locale]/(home)/page.tsx
components/hero/{HeroVideo,HeroAnnotations,TitleBlock}.tsx
components/sheet/{Sheet,SheetBadge,Dimension,RevisionCloud,SectionMark}.tsx
components/chapters/{Why,Services,Projects,How,Contact}/
components/motion/{RentalFlow,FdeBeforeAfter,Timeline,Counter}.tsx
components/bi/{ProjectDash,FinanceDash,HiringDash}.tsx
content/{profile,services,achievements,projects,dashboards,rental-flow}.ts
messages/{en,es}.json
scripts/video/{encode.sh,frames.sh,ramp.sh}
public/video/   (posters; los videos van en Blob)
```

---

## 8. Mapa de fuentes (de dónde sale cada dato, sin preguntar)

| Dato | Fuente |
|---|---|
| Textos EN/ES verificados, dashboards `P`/`F`/`R`, SVG de logos | `portfolio-v2.html` |
| Atrio: funciones, migraciones, pruebas, stack | `C:\dev-PH` (package.json, supabase/migrations, tests, CLAUDE.md) |
| NutriSoft: 696 pruebas, 179 migraciones, Edge Functions | `C:\dev-nutrisoft` |
| NexGuard360: tablas, roles, nómina, Resend 8 a.m. | `C:\dev-seguridad` |
| Modus PM: microservicios Python, motor de conteo | `C:\dev-modus` |
| tino: funciones Vercel, crons, consentimiento Ley 81 | `C:\RRHH` |
| Sitios web, retrato de Alexis | `C:\dev\nexera-web` (`public/team/alexis.webp`) |
| Logos alta calidad | `C:\dev-PH\Branding`, `C:\dev-nutrisoft\play store`, `C:\dev-seguridad\public\brand`, `C:\RRHH\public\icon.svg` |
| Precedente de video por código | `C:\dev-nutrisoft-promo` (Remotion), skill `launch-videos` |
| Por revisar | `C:\dev-atrio-web`, `C:\dev-nexus`, `C:\dev-proyectos` (vacía) |

Regla: nunca copiar `.env`, llaves, ni datos de clientes. Cada cifra publicada lleva su fuente en `content/`.

---

## 9. Fases

### F0 · Dirección y prototipo — estado al 11-oct-2026
1. Prueba de video con IA: **bloqueada**. HeyGen exige plan pago para generar por API (402). Prompts listos en `reference/video/prompts.md`. Decisión de Alexis en `TODO-ALEXIS.md`.
2. Paleta: provisional (tokens del plano nocturno, §2). La definitiva se deriva del fotograma clave cuando exista video. Moodboard: pendiente.
3. Extracción de datos: **hecha** → `research/{atrio,nexguard360,nutrisoft,modus,tino,nexera-web,atrio-web}.md` y `content/v2/` (151 claves EN/ES, dashboards P/F/R, 5 logos SVG, tokens). Copy EN/ES: **borrador 1** en `content/copy-v4.md`; revisión no-ai-slop al cierre.
4. Guion del flujo de alquiler: **hecho** → `content/rental-flow.md` (Alquileres Bahía Azul, S.A., 7 estaciones, 3 pedidos).
5. **Prototipo**: **hecho** → `prototype/index.html` (hero con marcador de video y capa de anotaciones sincronizada, lámina 02.5 con el flujo corriendo, lámina 02.6 FDE con antes/después y medidores). Abrir el archivo directamente en el navegador. Pendiente: prueba a 375 px con emulación (se hará en F1).
6. Hallazgos que cambiaron afirmaciones (ver `TODO-ALEXIS.md` → "Hallazgos"): reporte diario de NexGuard360 a las 07:45 UTC; Yappy en Atrio es andamiaje; "al centavo" viene de bitácora; tino sin pruebas automatizadas.
7. Crítica `/impeccable critique` (11-oct-2026, 17/32, archivo en `.impeccable/critique/`) y pasada de corrección P0+P1: guion de pago arreglado (el sello llega siempre), lámina 05 de contacto mínima, cifras del hero sin superposición, kickers eliminados (sin numeración duplicada), flujo n8n con scroll horizontal y auto-seguimiento en móvil, FDE rediseñada con detalles de plano y cotas de mejora en lugar de medidores circulares, notas de lámina en lugar de rejilla de tarjetas, foco visible y selección temadas. **Pendiente para F1 (P2, decisión de Alexis):** piso de 11 px en texto funcional (36 hallazgos del detector), contraste del token `--ink3` sobre gradientes (16), `aria-hidden` ya aplicado a la capa de anotaciones.
✅ Alexis aprueba el prototipo.

### F1 · Fundación
Scaffold, design system de planos (tokens, tipografía, grilla, grano, componentes `Sheet`, `Dimension`, `TitleBlock`), i18n, `HeroVideo` con video final y anotaciones, Lenis + MotionProvider, deploy en Vercel.
✅ Hero en producción, Lighthouse móvil medido, 375 px sin overflow.

### F2 · Por qué yo + Servicios
Línea de tiempo, contadores, seis láminas de servicios con sus piezas, flujo de alquiler, antes/después de FDE.
✅ Cada afirmación con evidencia enlazada. 60 fps. Reduced-motion probado.

### F3 · Proyectos + BI
Tarjetas con capturas reales (tomadas de entornos locales con datos de prueba), tres dashboards migrados con animación y tick.
✅ Sin datos reales en capturas. Dashboards usables en móvil.

### F4 · Cómo trabajo + Contacto + Pulido
Scroll-scrub, formulario, OG, JSON-LD, favicon, revisión no-ai-slop final, checklist playbook §11.
✅ OG visible en WhatsApp y LinkedIn. Lighthouse final.

### F5 · (después) Casos de producto y funciones de IA
Playbook §6 y §8: Modus → NutriSoft → NexGuard360 → tino → Atrio; `/match`; chat.
