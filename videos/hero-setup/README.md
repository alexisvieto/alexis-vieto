# Hero · fuentes de producción

- `toma4.html`: escena 3D (Three.js + GSAP) de los servicios, determinista; `window.seek(t)` renderiza el fotograma t.
- `render4.mjs`: captura 240 fotogramas (30 fps, 8 s) con Chrome sin cabeza vía puppeteer-core. Uso: `HERO_DIR=<carpeta> node render4.mjs "<ruta chrome.exe>" http://127.0.0.1:4180/toma4.html`.
- `ramp.sh`: speed ramps de las tomas 1 a 3 (clips de Veo en `reference/video/raw/`).
- `assemble.sh`: toma 4 desde fotogramas, unión con fundidos, grado, grano, viñeta, encodes y póster.
- `t3-last.png`: último fotograma de la toma 3, fondo de continuidad de la toma 4.

Los scripts leen la ruta de ffmpeg de `ffmpeg-path.txt` (paquetes ffmpeg-static / ffprobe-static).
