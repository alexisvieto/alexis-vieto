# Guion · Flujo de automatización para una empresa de alquiler (Lámina 02.5)

Todo es ficticio y debe verse ficticio. Empresa, personas, teléfonos, precios y direcciones son inventados.

## La empresa
- **Nombre:** Alquileres Bahía Azul, S.A. (ficticia). Rubro: alquiler de equipo para eventos (carpas, sillas, mesas, sonido, plantas eléctricas).
- **Por qué este rubro:** tiene inventario finito con disponibilidad por fecha, precios por unidad y día, pago anticipado y entrega física. Es el caso general: cambian los productos, no las piezas del flujo.
- **Teléfono visible:** +507 6000-0001. **WhatsApp:** mismo número. **Horario:** el flujo contesta 24/7; la entrega se programa.

## Inventario ficticio (base de datos de la demo)
| Código | Artículo | Stock | Precio/día |
|---|---|---|---|
| CAR-3x3 | Carpa 3×3 m | 24 | $35 |
| CAR-6x6 | Carpa 6×6 m | 6 | $120 |
| SIL-PLE | Silla plegable | 400 | $1.50 |
| MES-RED | Mesa redonda 8 p. | 40 | $12 |
| SON-BAS | Sonido básico (2 bocinas + mezcladora) | 5 | $90 |
| GEN-5KW | Planta eléctrica 5 kW | 4 | $150 |

## Las siete estaciones

Cada estación tiene: título EN/ES, micro-escena (lo que se anima), duración en el loop, y el patrón real que la respalda. Tiempo total por pedido: ~22 s.

| # | Estación | ES | EN | Micro-escena | Dur. | Patrón real |
|---|---|---|---|---|---|---|
| 1 | Llamada | Llamada entrante | Incoming call | Ícono de teléfono vibra, número ficticio, onda de audio; el asistente contesta: "Alquileres Bahía Azul, ¿en qué le ayudo?" | 2.5 s | Telefonía / IVR con IA |
| 2 | WhatsApp | Mensaje por WhatsApp | WhatsApp message | Burbuja verde entra: el pedido del cliente en lenguaje natural | 2.5 s | WhatsApp Business API, webhook |
| 3 | Asistente | Contestador inteligente | Smart assistant | El asistente lee el mensaje y extrae campos; aparece un JSON pequeño: `{producto, cantidad, fecha, lugar}`; pide lo que falte | 3 s | Claude con tool use (patrón de tino y Atrio) |
| 4 | Base de datos | Verificación en base de datos | Database check | Tabla de inventario; la fila del artículo se ilumina; "18 disponibles de 24 para el 18-oct"; historial del cliente: "2 alquileres previos, sin mora" | 3 s | Supabase + RLS por empresa |
| 5 | Precio | Respuesta con precio | Price reply | Cotización se arma línea por línea (unidades × días × precio + transporte + ITBMS 7%); se envía por WhatsApp con PDF adjunto | 3 s | Generación de PDF con marca (Modus, Atrio) |
| 6 | Pago | Pago por Yappy o tarjeta | Pay with Yappy or card | Dos botones; el cliente elige Yappy; aparece confirmación; el pedido cambia a "Pagado" y la cuenta por cobrar se cierra sola | 3 s | Yappy + IPN (Atrio, NutriSoft) |
| 7 | Entrega | Entrega | Delivery | Orden de despacho, ruta en mapa de Ciudad de Panamá (ficticia), camión avanza, "Entregado 08:40" con foto y firma | 4 s | Leaflet + GPS (NexGuard360), reportes con foto |

Entre estación y estación, el pedido viaja por la "tubería" (0.4 s), estilo plano de proceso P&ID: líneas con flechas, válvulas como puntos de decisión.

## Tres pedidos ficticios (se alternan en el loop)

### Pedido A · Laura Mendoza
- Mensaje: "Hola, necesito 10 carpas 3×3 y 80 sillas para el sábado 18 en Costa del Este."
- Extracción: `{ "items": [{"sku":"CAR-3x3","qty":10},{"sku":"SIL-PLE","qty":80}], "date":"2026-10-18", "place":"Costa del Este" }`
- Verificación: CAR-3x3 18/24 disponibles · SIL-PLE 310/400 · cliente con 2 alquileres previos.
- Cotización: carpas 10 × 1 día × $35 = $350 · sillas 80 × 1 × $1.50 = $120 · transporte $45 · subtotal $515 · ITBMS 7% $36.05 · **total $551.05**.
- Pago: Yappy. Confirmación YP-48213 (ficticia).
- Entrega: sáb 18-oct 08:00, entregado 08:40.

### Pedido B · Carlos Pitti
- Mensaje: "Buenas, ¿tienen planta eléctrica y sonido para un evento el viernes en Albrook? Son unas 150 personas."
- Extracción: `{ "items": [{"sku":"GEN-5KW","qty":1},{"sku":"SON-BAS","qty":1}], "date":"2026-10-17", "place":"Albrook" }`. El asistente pregunta: "¿Necesita también sillas o mesas para 150 personas?" → "Sí, 150 sillas."
- Verificación: GEN-5KW 3/4 · SON-BAS 2/5 · SIL-PLE 160/400 · cliente nuevo.
- Cotización: planta $150 · sonido $90 · sillas 150 × $1.50 = $225 · transporte $60 · subtotal $525 · ITBMS $36.75 · **total $561.75**.
- Pago: tarjeta de crédito. Autorización 004417 (ficticia).
- Entrega: vie 17-oct 14:00, entregado 14:25.

### Pedido C · Rosa Quintero
- Mensaje: "Necesito una carpa grande y 6 mesas redondas para el domingo, en Las Cumbres."
- Extracción: `{ "items": [{"sku":"CAR-6x6","qty":1},{"sku":"MES-RED","qty":6}], "date":"2026-10-19", "place":"Las Cumbres" }`
- Verificación: CAR-6x6 **0/6 disponibles** el 19-oct → el asistente ofrece 4 carpas 3×3 unidas. Cliente acepta. (Muestra que el flujo maneja el "no hay".)
- Cotización: carpas 4 × $35 = $140 · mesas 6 × $12 = $72 · transporte $50 · subtotal $262 · ITBMS $18.34 · **total $280.34**.
- Pago: Yappy. Confirmación YP-48227.
- Entrega: dom 19-oct 07:30, entregado 08:05.

## Contadores de la lámina (marcados "Simulación")
- Pedidos atendidos: cuenta desde 1,248 y sube con cada loop.
- Tiempo promedio de respuesta: 41 s (fijo con jitter ±3).
- Cobros confirmados: $ acumulado sube con cada pago.
- Sin intervención humana hasta la entrega: 100% (en el guion, el humano aparece solo si falta inventario o el cliente pide hablar con alguien).

## Interacción del visitante
- Pausar/reanudar el flujo.
- Tocar una estación: tarjeta lateral con "Qué pasa aquí", "Con qué se construye", "Dónde ya lo hice" (link al producto).
- En la estación 6, botón "Pagar con Yappy" activo: al pulsarlo, se dispara la confirmación y el resto del flujo para ese pedido.

## Textos de cierre
- ES: "Este flujo sirve para la mayoría de las empresas. Cambian los productos, no las piezas."
- EN: "This flow works for most businesses. The products change, the parts don't."

## Nota de verdad
Los patrones citados (Yappy + IPN, Claude con tool use, RLS por empresa, PDF con marca, GPS en mapa, reportes con foto) existen en los productos indicados. El flujo completo de alquiler es una composición de esos patrones, no un producto en producción; la lámina lo dice como "simulación".
