# TODO-ALEXIS

Lo mínimo que solo Alexis puede dar. Todo lo demás lo saco de los repos. Cuando una línea se cumple, se marca y se anota dónde quedó el material.

## Video del hero, versión cinematográfica realista (11-oct-2026, sin HeyGen)
- [ ] **Generar 3 clips en Gemini (Veo), sin costo**, con los prompts de `reference\video\hero-cinematico.md` (órbita A, órbita B, entrada a la pantalla) y dejarlos en `reference\video\raw\` con los nombres indicados. La toma 4 (dentro del código, servicios en 3D) la construyo yo por código. Si prefieres, dame acceso a una de esas cuentas y lo genero yo.

## Para F0 (bloquea el prototipo)
- [ ] **HeyGen requiere plan pago para generar video por API** (error 402 `plan_upgrade_required`, 11-oct-2026; tu cuenta está en plan free). Opciones: (a) subir a plan Creator en https://app.heygen.com/home?upgrade y yo ejecuto todo; (b) usar Kling 2.x o Runway Gen-4 desde tu cuenta con los prompts de `reference\video\prompts.md`, y me dejas los clips en `reference\video\raw\`. Recomiendo (a): puedo iterar sin pedirte nada.
- [ ] **Fotos de referencia para el video con IA:** 4–6 fotos recientes con buena luz: frente, 3/4, perfil, sentado de cuerpo entero. Dejarlas en `C:\dev-portafolio\reference\alexis\`. Ya cuento con `C:\dev\nexera-web\public\team\alexis.webp`.
- [ ] **Si HeyGen pide consentimiento de identidad** (digital twin), grabar el video de consentimiento que indique la plataforma. Te aviso solo si hace falta.
- [ ] **Logros personales:** 3–4 hitos con año y una línea cada uno. Fotos opcionales en `reference\trayectoria\`.
- [ ] **Fotos de trayectoria** (Proytel, obras, equipo): 3–5, con permiso de uso. Misma carpeta.

## Para F1 (hero)
- [x] **Música del hero:** generada con IA (decidido 11-oct-2026).

## Hallazgos en los repos que afectan lo que se puede afirmar (solo informativo)
- **NexGuard360:** el cron del reporte diario está en `45 7 * * *` en `vercel.json`, es decir 07:45 UTC = **02:45 a.m. en Panamá**, no 8 a.m. Si la intención es 8 a.m. local, cambiar a `45 13 * * *`. En el portafolio lo describo como "cada madrugada". El cron de no-show (`api/cron/shift-alerts`) existe pero no está programado.
- **Atrio:** Yappy es andamiaje (`createYappyOrder` devuelve `ready:false`). No se afirma "pagos Yappy reflejados" en Atrio; sí en NutriSoft (Edge Functions `yappy-orden` / `yappy-ipn`, pendiente de confirmar con su ficha).
- **"Cuadrada al centavo contra el Excel"** viene de la bitácora (CLAUDE.md) y del prompt maestro, no de una prueba automatizada. Lo publico como "fórmula exacta del Excel replicada", no como "$0.00 de diferencia". Si tienes una comparación real quincena a quincena, se puede citar.
- **tino:** 0 pruebas automatizadas; WhatsApp abre `wa.me`, no envía solo. No se afirma envío automático por WhatsApp.
- **NutriSoft:** cifras reales mejores que las del playbook: 189 migraciones (no 179) y 729 pruebas (no 696). La app Expo está archivada; lo que existe es la PWA de la paciente empaquetada para Play Store. **Ojo:** la landing de NutriSoft (`apps/web/src/app/page.tsx` L167) anuncia el conteo de calorías por foto, que no está construido; conviene quitarlo de ahí.
- **Modus PM:** `public/` contiene el logo de un cliente real; no se usará en capturas. Solo 21 migraciones versionadas (el resto del esquema se aplicó por MCP) y sin pruebas de RLS en el repo; no se afirmará "RLS verificado" para Modus.

## Lámina 02.2 · Desarrollo de aplicaciones (11-oct-2026)
- [ ] **Capturas reales** de cada producto (laptop y teléfono) con datos de prueba, para sustituir el logo solo por logo + captura en cada tarjeta. Dejarlas en `reference\capturas\<producto>\`.
- [x] Railway retirado: Alexis confirmó que despliega en Vercel y versiona en GitHub (11-oct-2026).

## Lámina 02.5 · Automatización (proyecto confidencial, 11-oct-2026)
- [ ] **Cifra de costos:** me diste "costos operativos reducidos en un 365%". Una reducción no puede superar el 100%, así que no la publiqué. ¿Qué significa el 365? Opciones probables: retorno de la inversión de 365% (se ganó 3.65 veces lo invertido), costos reducidos en 36.5%, o costos de 3.65× menores (una reducción del 73%). Con tu respuesta la agrego al párrafo y a "Resultados". El 80% menos horas sí está publicado.
- [ ] Confirmar si puedo decir el rubro con esa precisión ("distribución de carne nacional e importada") o prefieres algo más genérico ("distribuidora de alimentos").

## Lámina 02.7 · Animación (agregada 11-oct-2026)
- [ ] **Más piezas:** deja cada video en `C:\dev-portafolio\prototype\media\` (o dime la ruta) y yo lo registro con título, marca, duración y descripción. Formato ideal: 1920×1080 o 1080×1920, H.264, con audio si lo tiene.
- [ ] **CenterFit:** confirma si es un cliente real (y si su logo puede mostrarse) o una marca de muestra. Hoy aparece como nombre de marca en la pieza 02.
- [ ] **Herramienta:** ¿estas piezas salieron de Remotion, HyperFrames u otra? Lo publico como "motion por código" hasta que lo confirmes.
- [ ] Para producción recodifico los videos (AV1 + H.264, ≤ 2.5 MB cada uno) y los subo a Vercel Blob; los originales pesan 6.6 MB y 3.1 MB.

## Para F2 (resultados verificados)
- [ ] **Resultados por servicio:** cifras reales que puedas sostener (horas ahorradas, errores eliminados, tiempos antes/después). Si no las tienes, publico solo lo verificable en código.
- [ ] **Sectores o clientes nombrables** en "Experiencia" (o confirmar que se mantienen anónimos).

## Para F1/F4 (infraestructura)
- [ ] Dominio definitivo (alexisvieto.com, alexis.nexerai.io u otro).
- [ ] Repo GitHub `alexisvieto/alexis-vieto` vacío, o token con permiso para crearlo.
- [ ] `ANTHROPIC_API_KEY` en Vercel (solo para F5).
- [ ] OK explícito para mostrar herramientas internas anonimizadas (opcional).
- [ ] CVs finales EN/ES en PDF para `/cv`.
