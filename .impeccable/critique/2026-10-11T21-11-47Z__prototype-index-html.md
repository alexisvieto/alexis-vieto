---
target: prototipo v4 (prototype/index.html), run 2 + conductual
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 3
p1_count: 3
target_identity: "file:C:\\dev-portafolio\\prototype\\index.html"
target_fingerprint: "sha256:f584ae57b1b42036451490da6f6e482ae0c8cb62b4642ed0d1949186a2211757"
target_path: "C:\\dev-portafolio\\prototype\\index.html"
timestamp: 2026-10-11T21-11-47Z
slug: prototype-index-html
---
Method: dual-agent + conductual (A: revisión de diseño · B: detector + navegador · C: ux-conductual-base)

## Puntuación de salud de diseño
| # | Heurística | Nota | Problema clave |
|---|---|---|---|
| 1 | Visibilidad del estado | 3 | Audio inerte; cronómetro sigue con el flujo pausado. |
| 2 | Correspondencia con el mundo real | 4 | Residuos n8n en inglés ("1 item"). |
| 3 | Control y libertad | 2 | Pago se auto-resuelve a 4 s con el único control deshabilitado; sin siguiente pedido ni reinicio. |
| 4 | Consistencia | 2 | h3 a 64 px vs 10 px; dos cabeceras por lámina; "02.7 / 05"; video de agentes duplicado. |
| 5 | Prevención de errores | 3 | Hover en 8 tarjetas = 37 MB; flujo corre fuera de pantalla si sales en la espera de pago. |
| 6 | Reconocer antes que recordar | 3 | Subtítulos 9.5 px; sí/no 9 px. |
| 7 | Flexibilidad | n/a | |
| 8 | Estética y minimalismo | 3 | 02.5 = cuatro pantallas; celda vacía en contacto; "MARCADOR" en hero. |
| 9 | Recuperación de errores | 2 | Sin estado de error de video; reduced-motion muestra "$551.05" heredado. |
| 10 | Ayuda | n/a | |
| **Total** | | **22/32 (69%)** | Aceptable · run 1: 17/32 |

## Veredicto de especificidad
Autoral y sostenido (Detalle A de FDE es la pieza más persuasiva). Intercambiable: rejilla de 8 tarjetas iguales y columna de 4 bloques en Agentes. Detector: 91 CLI / 97 runtime (antes 64 / 47), por láminas nuevas; reales: 78 textos 9–10 px, 17 contrastes --ink3 4.0–4.5:1, línea de 89 ch, video del visor sin nombre accesible. Resuelto: foco, encabezados, aria-hidden, consola limpia.

## Problemas prioritarios
- [P0] Dominio público muestra andamiaje: "Marcador", bulto-persona, terminal falsa, pie "F0". /impeccable polish
- [P0] Ventana de pago de 4 s con Pausar deshabilitado; sin visibilitychange. Fix: 10 s con cuenta regresiva, Pausar activo, en los tres pedidos. /impeccable harden
- [P0] Táctil móvil: pay-btn 104×18 px en lienzo escalado, nodos a 7 px, sello fuera de vista. Fix: botón fijo 44 px fuera de la escala, sello anclado al contenedor, reflujo vertical. /impeccable adapt
- [P1] 02.5 = cuatro pantallas; CTA aterriza en el párrafo; flujo arranca sin público; Agentes a 64 px compite. Fix: ancla al lienzo, arranque al 60% visible, título 36 px + insignia 02.5b, fundir bloques, quitar tarjeta 08. /impeccable distill
- [P1] Contadores leídos como KPI reales; "Respuesta promedio" aleatoria. Fix: contadores de sesión desde 0, promedio real, chip Simulación junto a los números. /impeccable clarify
- [P1] Estado pausado no diseñado (spinners y reloj siguen). /impeccable harden
- [P2] Contacto sin primario, celda vacía, mailto mudo, vCard que abre web. /impeccable onboard
- [P2] Teclado: nodos sin Espacio, pay-btn enfocable invisible, pantalla de Agentes no enfocable, slider del visor. /impeccable audit
- [P3] Audio inerte, "1 item", hex crudos, cotas FDE a 2 px en móvil, media queries repetidas.

## Conductual (ux-conductual-base)
Bien: reconocer-no-recordar, feedback inmediato (desktop), Jakob, estética-usabilidad. Violados: Fogg (trigger de pago sin público), Fitts móvil, peak-end (móvil y contacto), Hick (contacto), progressive disclosure (arranque del flujo). Ética: pasa salvo contadores ficticios sin descargo al lado.

## Personas
Jordan: entiende la tesis, ve "MARCADOR", no encuentra productos ni navegación; contacta solo si vuelve al hero. Casey: pierde cifras, lienzo ilegible, 21.8 MB con datos móviles; contacta pero no entiende. Riley: cinco incoherencias, ninguna bloqueante.

## Preguntas
1. ¿Rótulo de una pantalla y el flujo como apertura mientras no haya video?
2. ¿Por qué el cliente sin nombre tiene más escenario que los cinco productos con nombre?
3. ¿Ciclo en estado retenido con "Siguiente pedido" en vez de reinicio automático?
