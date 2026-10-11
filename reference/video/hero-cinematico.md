# Hero cinematográfico realista · guion de tomas y prompts

Pedido de Alexis (11-oct-2026): setup con dos pantallas de 26" con código en ejecución, giro de 360°, la cámara entra a la pantalla como si entrara al código, vista dentro del código, y aparecen en 3D los servicios: Automatización, Desarrollo Web Inteligente, Generación de Video, FDE Forward Deployed Engineer, Animaciones. Estilo: cinematográfico realista. Sin HeyGen.

## Cómo se produce (híbrido)

| Parte | Herramienta | Por qué |
|---|---|---|
| Tomas 1 a 3 (setup real, órbita, entrada a la pantalla) | **Veo dentro de Gemini, con la cuenta de Google de Alexis (sin costo adicional)**, como se hizo el comercial de Atrio (`C:\dev-atrio-web\Instagram\comercial-60s\prompts-veo.md`) | Único camino a fotorrealismo sin rodaje; ya probado |
| Toma 4 (dentro del código, servicios en 3D) | HyperFrames + Three.js, por código | La IA deforma el texto; por código las letras son legibles y editables |
| Unión, speed ramp, color, grano, encodes | HyperFrames + ffmpeg | Control total del ritmo y del peso del archivo (el comercial de Atrio se unió en Remotion; aquí se usa HyperFrames, el mismo motor de la galería de Animación) |

Duración total objetivo: 22 a 26 s. Formatos: 16:9 (hero) y 9:16 (móvil y redes).

## Bloque fijo de escena (se antepone a cada prompt)

```
A high-end developer workstation at night, photorealistic. Two 26-inch ultrawide curved monitors side by side on a dual arm, both showing a dark code editor with code scrolling and a terminal running tests (green lines appearing). Dark walnut desk, low-profile black mechanical keyboard, matte black mouse, small warm desk lamp on the left, ceramic mug, closed notebook. Deep navy room, a plant silhouette and a bookshelf out of focus behind. The monitors are the key light (cool blue-white), a warm amber rim light from the lamp, deep clean shadows, nothing overexposed, subtle film grain, shallow depth of field, 35mm lens, cinematic color grade like a tech documentary. No people, no text overlays, no captions, no watermark, no cuts, no camera shake.
```

Nota: sin persona en el encuadre. Si más adelante quieres aparecer, se graba un clip real de manos y perfil y se integra en posproducción.

## Tomas

| # | Dur. | Cámara | Prompt (añadir al bloque fijo) |
|---|---|---|---|
| 1 · Órbita A | 8 s | 0° → 180°, altura de hombros, 2 m | `The camera starts in front of the desk facing the monitors and orbits smoothly clockwise around the workstation, passing the right side and ending directly behind the chair, both monitors visible over the backrest, constant height and distance, perfectly smooth gimbal motion.` |
| 2 · Órbita B | 8 s | 180° → 360°, empieza en el último frame de la toma 1 | `The camera continues the same smooth clockwise orbit from behind the chair, passing the left side where the desk lamp produces a soft amber flare close to the lens, and returns to the front view facing the monitors, same framing as the start.` |
| 3 · Entrada | 6 s | Push-in frontal hasta atravesar el monitor derecho | `From the front view, the camera pushes in slowly toward the right monitor, the code editor fills the frame, the push continues until the screen pixels fill the view and the camera passes through the glass into the glowing code, lines of code rushing past like a tunnel of light, ending in a dark space with floating glowing code fragments.` |
| 4 · Servicios 3D | 8 s | Dentro del código (por código, HyperFrames) | No se genera con IA. Ver sección siguiente. |

## Flujo en Gemini (el mismo del robot de Atrio)

1. **Fotograma de referencia del setup** con la herramienta de imagen de Gemini: pegar el bloque fijo de escena más `Still frame, front view at shoulder height, both monitors facing the camera`. Regenerar hasta que el escritorio convenza; descargar como `setup-ref.png` y guardarlo en `referenceideoaw`.
2. **Cada toma** se genera con la herramienta de video (Veo) adjuntando esa imagen como primer fotograma y pegando bloque fijo + prompt de cámara. Dos o tres intentos por toma; quedarse con la que mantenga lámpara, teclado y monitores iguales.
3. Para la toma 2, adjuntar en vez de la referencia el último fotograma de la toma 1 elegida (captura de pantalla sirve); para la toma 3, el último fotograma de la toma 2.
4. Si Gemini solo ofrece 720p a 24 fps, es suficiente: se escala en posproducción como en el comercial.

Reglas de oro (de `prompts-veo.md` de Atrio): nada de texto legible ni interfaces reales en el clip; un solo movimiento de cámara por clip; si sale mal, regenerar sin cambiar el prompt y ajustar solo tras tres fallos.

Alternativas de pago solo si Veo en Gemini no diera la órbita: Kling 2.x (más barato por segundo) o Runway Gen-4 (mejor control de cámara).

## Toma 4 · dentro del código, servicios en 3D (HyperFrames)

Escena: espacio negro azulado con fragmentos de código real flotando en profundidad (líneas de los repos: `claim_screening`, `processFortnightPayroll`, `confirm_yappy_payment`, `cobertura-rls.test.ts`), la cámara avanza despacio. De la profundidad emergen, uno a uno, los cinco servicios como volúmenes de texto 3D en Barlow Condensed 800, extruidos, con borde en redline y una cota debajo:

1. Automatización
2. Desarrollo Web Inteligente
3. Generación de Video
4. FDE · Forward Deployed Engineer
5. Animaciones

Cada uno entra con rotación leve en Y y se alinea al frente, se queda 1.2 s, y se desplaza a un costado formando una fila; al final los cinco quedan en perspectiva y el cuadro de rótulo del sitio se escribe abajo. Transición de salida: fundido al primer frame del hero (la página).

Continuidad con la toma 3: el primer frame de la toma 4 replica la paleta y la densidad de los fragmentos del último frame de la toma 3 (se toma ese frame como fondo y se desvanece en 0.5 s).

## Posproducción

1. Concatenar 1 → 2 → 3 con fundido de 6 frames en las uniones.
2. Speed ramp: 0.5x en los primeros y últimos 1.5 s de cada órbita (frente a las pantallas), 2.2x por detrás; la entrada a la pantalla acelera progresivamente hasta 3x al atravesar el vidrio.
3. Toma 4 a velocidad normal.
4. Corrección de color unificada, grano fino, viñeta suave.
5. Encodes según PLAN-v4 §3.5 (AV1 + H.264 1080p ≤ 4 MB; 9:16 ≤ 2.5 MB; póster AVIF/WebP).

## Entrega de clips

Dejar los clips elegidos en `C:\dev-portafolio\reference\video\raw\` con estos nombres: `toma1-orbita-a.mp4`, `toma2-orbita-b.mp4`, `toma3-entrada.mp4`. Con eso construyo la toma 4, la unión y los encodes sin más preguntas.
