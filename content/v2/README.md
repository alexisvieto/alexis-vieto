# content/v2 — contenido extraído de `portfolio-v2.html`

Datos reutilizables del portafolio de una sola página (`C:\dev-portafolio\portfolio-v2.html`, rev. 2026.10).
No incluye diseño, CSS de layout ni JS de render; solo textos, datos, logos y tokens.
Generado con un script Node (`extract.mjs`, scratchpad), no a mano. Fecha: 2026-10-11.

## Inventario

| Archivo | Contenido |
|---|---|
| `texts.json` | 151 claves i18n (EN + ES emparejadas) organizadas en 7 secciones, más cadenas neutras del markup (`static`). |
| `dashboards.ts` | `P`, `F`, `R` copiadas literalmente desde el `<script>` de la página, con comentarios de qué gráfico usa cada una y la lógica de cálculo. |
| `tokens.css` | Variables CSS literales: `:root` (claro, 27 vars incl. 3 familias tipográficas), `@media (prefers-color-scheme:dark)` y `:root[data-theme="dark"]` (oscuro, 20 vars cada uno; 67 declaraciones en 3 bloques). |
| `logos/atrio.svg` | Logo Atrio, viewBox 0 0 1024 1024. |
| `logos/nutrisoft.svg` | Logo NutriSoft, viewBox 0 0 1024 1024. Incluye `<defs>` con `#ns-bg`. |
| `logos/nexguard360.svg` | Logo NexGuard360, viewBox 0 0 120 120. Incluye `<defs>` con `#ng-sh`. |
| `logos/modus.svg` | Logo Modus PM, viewBox 0 0 120 120. |
| `logos/tino.svg` | Logo tino, viewBox 0 0 512 512. |
| `logos/ui/gradients.svg` | El sprite oculto `<svg width=0 height=0>` con los dos gradientes compartidos (`#ns-bg`, `#ng-sh`). No es un logo; se guarda por referencia. |

Los 6 SVG se validaron como XML bien formado (PowerShell `[xml]`). Cada logo lleva `xmlns`, `role="img"`, `aria-label` y `<title>`.

No hay iconos de UI en SVG en la página: los otros `<svg>` son los cinco contenedores vacíos de los gráficos (`pj-s`, `pj-b`, `fn-b`, `fn-a`, `hr-f`) que se dibujan en runtime; los marcadores de cota del hero son CSS puro.

## texts.json

Estructura: `{ sección: { i18n: { clave: {en, es} }, static: {...} } }`.

- `i18n`: diccionario `I` de la página. `html: true` marca valores que la página inyecta con `innerHTML` (`data-ih`, contienen `<b>`/`<em>`/`<i>`). Los arrays (cats, projs, per, months, aging, vac, stages) se conservan como arrays. `tipS` y `tipF` eran funciones flecha: se guardan como plantilla `{param}` (`type: "template"`) más el código original en `source`.
- `static`: cadenas sin traducción leídas del markup: título y meta description, marca ("Alexis Vieto", "NEXERA · PANAMÁ"), valores fijos del cajetín (1:1, 2026.10, 01 / 06, NEXERA), las cuatro cifras del hero (20+, 300+, 5, 20+), números de hoja, nombres/URLs/stacks de los 5 productos, periodos de la línea de tiempo, filas de contacto (email, WhatsApp, LinkedIn, GitHub), footer, aria-labels e ids de tabs y gráficos.

Claves por sección (i18n / static): hero 23 / 10 · why 15 / 1 · live 57 / 4 · work 27 / 2 · path 8 / 2 · how 15 / 1 · contact 6 / 2.

Verificaciones hechas por el script: todas las claves existen en EN y ES (0 faltantes); el texto inline del HTML coincide con el diccionario EN en todas las claves `data-i`/`data-ih` (0 discrepancias).

## dashboards.ts

| Const | Datos | Gráficos |
|---|---|---|
| `P` | 3 proyectos: `w` semanas, `now` semana actual, `bud[4]` presupuesto por categoría (USD miles), `spentF[4]` fracción gastada, `plan[w]` y `act[now]` avance acumulado %. | Tab `t-proj` / panel `p-proj`: segmentos `pj-seg`, KPIs `pj-k`, curva S `pj-s` + tooltip `pj-tip`, barras `pj-b`. |
| `F` | 12 meses de `billed` y `coll` (USD), `aging[4]` unidades en mora por meses de atraso (14, 7, 4, 3), `units: 120`. | Tab `t-fin` / panel `p-fin`: segmentos `fn-seg` (6/12 meses), KPIs `fn-k`, barras `fn-b` + tooltip `fn-tip`, aging `fn-a`. |
| `R` | 3 vacantes: `f[5]` embudo (312/146/228 postulaciones), `time` tiempo medio de evaluación, `c[6]` candidatos `[id, match %, 'adv'|'rev'|'low']`. | Tab `t-hire` / panel `p-hire`: segmentos `hr-seg`, KPIs `hr-k`, embudo `hr-f`, tabla `hr-t`. |

Las fórmulas (SPI, valor ganado, tasa de cobro y umbral 93 %, horas ahorradas a 15 min por CV, escala raíz cuadrada del embudo, tooltips) están descritas en los comentarios del archivo.

## Textos que violan las reglas (corregir antes de reutilizar)

Reglas revisadas sobre todos los valores de `texts.json`, `dashboards.ts` y los SVG: la empresa actual (nombre omitido), Power BI, PMP, título de telecomunicaciones, inglés C1, calorías por foto, "Tino" con mayúscula, SUPRA.

Resultado: **0 violaciones directas.** No aparece la empresa actual (nombre omitido), Power BI, PMP, C1, calorías, "Tino" (siempre `tino` en minúscula: `h3.lc`, aria-label del logo, dominio contratacontino.com) ni SUPRA.

Menciones a revisar (no son un título profesional, pero contienen la palabra "telecomunicaciones"):

- `path.i18n.s1p` (EN/ES): "Telecommunications and electronic security. …" — describe el giro de Proytel.
- `path.i18n.s2p` (EN/ES): "At an engineering, telecommunications and special systems company. …" — describe al empleador 2024 sin nombrarlo.

Si la regla "título de telecomunicaciones" se refiere a un grado académico, no hay ninguna mención en la página.
