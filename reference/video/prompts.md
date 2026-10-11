# Prompts del video del hero (producción con IA)

Identidad: usar como referencia `https://www.nexerai.io/team/alexis.webp` más las fotos de `reference/alexis/` cuando existan. Todos los prompts en inglés porque los modelos responden mejor así. Herramienta primaria: HeyGen Video 1 (`reference_to_video` / `image_to_video`). Alternativas: Kling 2.x, Runway Gen-4 (Character Reference), Veo 3.1.

## Bloque fijo de escena (se antepone a todos los prompts)

```
SUBJECT: the man from the reference image, Latino, early 40s, short dark hair neatly combed back, light stubble beard, calm focused expression. Plain dark charcoal crew-neck sweater, no logos, no glasses.

SET: a high-end developer workstation at night. Two 26-inch ultrawide curved monitors side by side on a single dual-arm mount, dark walnut desk, low-profile black mechanical keyboard, matte black mouse, small warm desk lamp on the left, ceramic coffee mug, closed notebook. Left monitor: dark terminal with scrolling white and green text. Right monitor: dark dashboard with blue charts. Behind him: dark room, deep navy walls, a plant silhouette, a bookshelf out of focus.

LIGHT: the screens are the key light (cool blue-white on his face), a warm amber rim light from the desk lamp, deep clean shadows, nothing overexposed, subtle film grain, shallow depth of field, 35mm lens.

STYLE: photorealistic, color-graded like a tech documentary, 4K quality. No text overlays, no captions, no watermark, no cuts, no camera shake, no zoom.
```

## Fotograma clave (imagen, 16:9 y 9:16)
```
[bloque fijo] Still frame. Camera at shoulder height, in front of him, slightly to his right, looking at him across the monitors. He is typing, eyes on the left monitor. Composition with the two monitors framing his face, the lamp glow on the left edge.
```
Generar 8–12 variantes, elegir una por formato. Esa imagen fija la paleta.

## Segmentos de órbita (video, 10 s cada uno, 16:9, 1080p)
Cada segmento parte del último frame del anterior (image_to_video con ese frame) para continuidad. Órbita horaria vista desde arriba. Altura constante (hombros), distancia constante (~2 m), movimiento de gimbal perfectamente suave.

| # | Tramo | Prompt de cámara |
|---|---|---|
| S1 | Frente → lateral derecho (0°→90°) | `[bloque fijo] The camera starts directly in front of him facing him through the monitors and orbits smoothly clockwise around the desk to his right side, ending in a full profile view of him typing, the right monitor now edge-on.` |
| S2 | Lateral derecho → espalda (90°→180°) | `[bloque fijo] The camera starts at his right profile and continues orbiting clockwise until it is directly behind him, framing both ultrawide monitors over his shoulders, the terminal and the dashboard fully visible, his hands on the keyboard.` |
| S3 | Espalda → lateral izquierdo (180°→270°) | `[bloque fijo] The camera starts directly behind him and continues orbiting clockwise to his left side, ending in a full left profile with the warm desk lamp close to the lens producing a soft amber flare.` |
| S4 | Lateral izquierdo → frente (270°→360°) | `[bloque fijo] The camera starts at his left profile and completes the orbit clockwise, returning to the front view facing him through the monitors, the same framing as the start of the orbit, he looks up from the screen for a moment and back down.` |

Opcional S0 (una sola vuelta completa en 15 s) para evaluar si el modelo sostiene la órbita entera: `[bloque fijo] One continuous 360-degree clockwise orbit around him and the desk, starting and ending in front of him, constant height and distance.`

## Detalles (video, 5–8 s, para cortes y para la versión de redes)
- `[bloque fijo] Close-up of his hands typing on the mechanical keyboard, screen light reflecting on the keycaps, slow push-in.`
- `[bloque fijo] Close-up over his shoulder of the left monitor: a terminal running a test suite, lines of green PASS results scrolling, slight camera drift.`
- `[bloque fijo] Slow push-in from across the room toward his face lit by the screens, the monitors glowing, rack focus from the mug in the foreground to his eyes.`

## Vertical 9:16 (móvil)
Mismos prompts con "vertical composition, the subject centered, monitors cropped at the edges, more headroom".

## Criterios de aceptación por clip
- Rostro consistente con la referencia en todos los ángulos (sin cambiar edad, barba ni peinado).
- Manos con 5 dedos y teclado estable.
- Monitores con forma correcta; no se multiplican ni se derriten.
- Cuarto sin cambios bruscos de geometría durante la órbita.
- Sin texto generado, sin marca de agua.
Mínimo 3 generaciones por segmento; se elige la mejor. Dos rondas sin aprobar un segmento → cambiar de modelo.

## Postproducción (ffmpeg, scripts en `scripts/video/`)
1. Concatenar S1–S4 con fundido de 6 frames en cada unión.
2. Speed ramp: 0.4x en los tramos frontales (inicio de S1, final de S4), 2.5x–3x en S2–S3, curvas suaves (`setpts` por tramo + `minterpolate` para los tramos lentos).
3. Costura del loop en el tramo rápido trasero.
4. Corrección de color unificada, grano, exportar según §3.5 del plan.
