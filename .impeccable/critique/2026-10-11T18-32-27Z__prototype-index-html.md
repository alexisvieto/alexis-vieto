---
target: prototipo de dirección (prototype/index.html)
total_score: 17
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 3
target_identity: "file:C:\\dev-portafolio\\prototype\\index.html"
target_fingerprint: "sha256:07095b73880db07108d77ebdc0d0d026ab938b520bfd0c25729e6de6e50ffdbe"
target_path: "C:\\dev-portafolio\\prototype\\index.html"
timestamp: 2026-10-11T18-32-27Z
slug: prototype-index-html
---
Method: dual-agent (A: revisión de diseño · B: detector + navegador)

## Puntuación de salud de diseño

| # | Heurística | Nota | Problema clave |
|---|---|---|---|
| 1 | Visibilidad del estado | 2 | "Pausar" no refleja el estado real cuando el flujo se congela; cronómetro sigue hasta 24 s; "Audio" no hace nada. |
| 2 | Correspondencia con el mundo real | 4 | Metáfora de planos sostenida; vocabulario panameño real. |
| 3 | Control y libertad | 1 | Un solo control; sin reiniciar, saltar de pedido ni deseleccionar nodo. |
| 4 | Consistencia | 2 | Dos numeraciones ("Servicio 05" y "02.5"); "1:1" vs "S/E"; botón rojo único; H2→H5. |
| 5 | Prevención de errores | 1 | Guion de pago falla determinista (P0); lienzo recortado en móvil. |
| 6 | Reconocer antes que recordar | 3 | Nodos sin affordance de clic; "sí/no" a 9 px. |
| 7 | Flexibilidad y eficiencia | n/a | Portafolio de lectura única. |
| 8 | Estética y minimalismo | 3 | Rejilla de cuatro celdas repetida; bloque de resultados duplicado. |
| 9 | Recuperación de errores | 1 | Sin mensaje al congelarse; recuperación solo por viewport. |
| 10 | Ayuda y documentación | n/a | Portafolio. |
| **Total** | | **17/32** | **Aceptable (53%)** |

## Veredicto de especificidad
Autoral (sistema de lámina, narrativa de datos del flujo) con dos excepciones de catálogo: lienzo n8n literal y lámina FDE (rejilla de 4 columnas + medidores circulares). Detector: 64 hallazgos estáticos / 47 en vivo; reales: 28–31 textos <11 px, 17 contrastes 4.0–4.46:1 por el token --ink3, 2 saltos de encabezado. Falsos positivos: scanlines, retícula, glow de pantallas, skyline, tracking en mayúsculas mono, kicker, fuentes del sistema.

## Problemas prioritarios
- [P0] El pago nunca se muestra y el flujo se congela (flow.js, tres callbacks en la misma posición del timeline; master.pause() y clearTimeout en el mismo tick). Fix: un solo callback que pausa, muestra botón y programa reanudación; clic llama a la misma función; sincronizar Pausar/Reanudar con master.paused(). /impeccable harden
- [P0] "Hablemos" no lleva a ningún contacto (footer sin correo, LinkedIn, WhatsApp, vCard). Fix: lámina 05 mínima. /impeccable onboard
- [P1] Leyendas de las cifras del hero se superponen en el tramo 8–12 s; "5" a otra altura; cota bajo el rótulo. Fix: una cifra por 200 unidades, anclaje centrado, leyendas de dos palabras, mismo dy. /impeccable layout
- [P1] Kicker rojo pisa el título de lámina en 02.5 y 02.6. Fix: más padding superior o eliminar una numeración. /impeccable layout
- [P1] En móvil el flujo no existe (escala mínima .56 con overflow hidden). Fix: scroll horizontal con snap y auto-scroll al nodo activo, o grafo vertical. /impeccable adapt
- [P2] Tamaños 9–10 px en texto funcional, cero :focus, #annot sin aria-hidden, --ink3 a 4.0:1 sobre gradientes. Fix: piso 11 px, :focus-visible global, aclarar --ink3. /impeccable audit

## Banderas rojas por persona
- Jordan: entiende el qué en 5 s; en 02.5 duda si es demo de n8n o producto propio; nombres de producto escondidos en panel inferior; "Hablemos" sin contacto. Acción fallida.
- Casey: ve tres nodos; sello fuera de pantalla; textos 9–10 px; observer pausa/arranca con cada scroll; sin contacto de un toque. Acción fallida.
- Riley: flujo muere en "Esperar pago"; sin foco; reduced-motion superpone capas del hero; botón de pago no se reposiciona; audio inerte; "00 / 05" promete 6 láminas. Cinco bugs.

## Observaciones menores
Re-sello de revisión parece parpadeo; velocímetro sin video; "Respuesta promedio" aleatoria; "FDE" sigla sin explicar en el titular; rutas sin enlace; marcador del personaje en capturas.

## Preguntas
1. ¿Sello sobre un pedido real anonimizado en vez de empresa ficticia?
2. ¿Empezar el prototipo por el contacto funcionando?
3. ¿Flujo como plano de proceso real en vez de estética n8n?
