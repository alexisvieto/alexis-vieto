# NutriSoft — ficha de hechos verificables

Repo: `C:\dev-nutrisoft` (rutas relativas al repo). Verificado el 2026-10-11 leyendo código, sin abrir `.env*` ni datos de clientes.
Producto: SaaS multi-tenant para clínicas de nutrición. Portal de la clínica (Next.js) + app de la paciente (PWA, `apps/web/src/app/mi`) + sitio público por clínica (`apps/sitio`) + Supabase (Postgres/RLS/Auth/Storage/Realtime/Edge Functions/pg_cron).

> Las menciones a "la clínica piloto" sustituyen al nombre real del cliente que aparece en el código. No publicar nombres de clientes.

---

## 1. Stack exacto

| Pieza | Versión / detalle | Fuente |
|---|---|---|
| Monorepo | Turborepo `^2.3.0` + pnpm `9.15.9`, Node `>=22`, TypeScript `^5.7.0`, ESLint 9 + typescript-eslint 8 | `package.json` (raíz) |
| Workspaces activos | `apps/web`, `apps/sitio`, `packages/*`. **`apps/mobile` está fuera del workspace a propósito** | `pnpm-workspace.yaml` (comentario explica el archivado) |
| `apps/web` (portal + PWA paciente) | Next.js `^15.5.25` (App Router), React `^19`, `@supabase/ssr ^0.12.1`, `@supabase/supabase-js ^2.47.0`. **Sin ninguna otra dependencia de runtime** | `apps/web/package.json` |
| `apps/sitio` (sitio público) | Next.js `^15.5.25`, React 19, supabase-js. Puerto dev 3100. Única dependencia externa en navegador: el web component `<btn-yappy>` del banco | `apps/sitio/package.json`; `apps/sitio/src/app/yappy-boton.tsx` (comentario "Es la ÚNICA dependencia externa del sitio") |
| `apps/mobile` (archivado) | Expo `~52.0.0`, expo-router `~4.0.11`, React Native `0.76.5`, React 18.3.1. README lo marca **ARCHIVADO (2026-07-24)**: solo una pantalla maquetada con plan de ejemplo hardcodeado, nunca leyó datos reales | `apps/mobile/package.json`; `apps/mobile/README.md` líneas 1-15 |
| `packages/core` | Dominio puro TS, `vitest ^3`, `@vitest/coverage-v8`; 44 archivos .ts; 8.598 líneas en `src/` | `packages/core/package.json`; `wc -l packages/core/src/*.ts` |
| `packages/db` | Tipos generados (`types.gen.ts`, 3.251 líneas) + tests RLS con `pg ^8.13` y vitest | `packages/db/package.json`; `packages/db/vitest.rls.config.ts` |
| `packages/ai` | **Solo interfaces TS** (`AiProvider`, `GeneratePlanInput/Output`, `AnalyzeFoodPhotoOutput`, `TranscribeNoteOutput`). Sin dependencias, sin tests ("solo contratos") | `packages/ai/src/index.ts`; `packages/ai/package.json` |
| Supabase | CLI `^2.6.8`; Postgres con esquema `private` para helpers; extensión `pg_cron` (única extensión creada en migraciones) | `package.json`; `supabase/migrations/20260713000000_fundaciones.sql`; `grep "create extension"` |
| Edge Functions | Deno, `jsr:@supabase/supabase-js@2`; 3 funciones | `supabase/functions/*/index.ts` |
| CI | GitHub Actions: job `build-test` (turbo build+typecheck+test, lint) y job `rls` (levanta `supabase start` y corre `pnpm test:rls`) | `.github/workflows/ci.yml` |
| Despliegue | Vercel (web y sitio), Supabase (base y Edge Functions). PWA empaquetada como TWA para Play Store (`play store/eas.json`, `docs/play-store-twa.md`) | `apps/web/next.config.ts` (`outputFileTracingIncludes`), `play store/` |

Librerías que **NO** están (verificado por grep en `apps/*/src`, `packages/*/src`, `supabase/`): Sentry, web-push/VAPID, exceljs, jspdf/pdf-lib/pdfkit, Anthropic SDK, Twilio, Stripe. El PDF, el `.xlsx`, el `.ics`, la vCard y el markdown están **escritos a mano sin dependencias** (`packages/core/src/pdf.ts` cabecera; `apps/web/src/lib/xlsx.ts` cabecera; `packages/core/src/calendario.ts`; `packages/core/src/vcard.ts`).

---

## 2. Módulos / funciones construidas

### 2.1 Portal de la clínica (`apps/web/src/app/(app)/`) — 24 páginas

| Módulo | Qué hace (según el comentario de cabecera del archivo) | Ruta |
|---|---|---|
| Hoy (radar) | Una fila por paciente calculada por el RPC `dashboard_pacientes()`; aplica `evaluarRadar` (urgente/ojo) y enlaces WhatsApp (`waLink`) | `(app)/hoy/page.tsx` L6, L13, L91, L177 |
| Pacientes | Lista; alta "cero fricción" (nombre + un contacto → invitación de un solo uso, FL-2) | `(app)/pacientes/page.tsx`, `(app)/pacientes/nuevo/page.tsx` |
| Expediente del paciente | Información general, mediciones, archivos, consentimiento, chat, fotos de evolución, subir InBody | `(app)/pacientes/[id]/page.tsx` + `informacion-general.tsx`, `mediciones.tsx`, `archivos.tsx`, `consentimiento.tsx`, `chat.tsx`, `subir-inbody.tsx` |
| Plan de alimentación | Editor del plan con calculadora que usa el motor de `packages/core` | `(app)/pacientes/[id]/plan/page.tsx`, `plan/calculadora.tsx` |
| Importar InBody | Lee el `.xlsx` del LookinBody **en el navegador, sin librería** (zip + XML con `DecompressionStream` y `DOMParser`); el archivo no sale de la clínica | `(app)/pacientes/inbody/page.tsx`, `importar.tsx`; `apps/web/src/lib/xlsx.ts`; `packages/core/src/inbody.ts` (`leerInBody`, `compararNombres`) |
| Archivos y guías | Guías y archivos compartidos con muchas pacientes; vista idéntica a la de la paciente | `(app)/pacientes/archivos/page.tsx`, `archivos/guia/[id]/page.tsx`; `apps/web/src/components/guias/*` |
| Agenda multi-doctor | Doctora y asistente gestionan citas; cada cita asignada a un profesional; mandar cita (ics/WhatsApp/correo) | `(app)/agenda/page.tsx`, `agenda/agenda.tsx`, `agenda/mandar-cita.tsx` |
| Entrevista clínica | Cuestionario sincronizado en vivo con Realtime (una fila por tenant) | `(app)/entrevista/page.tsx`, `entrevista-form.tsx` |
| Alimentos | Catálogo base + alimentos propios de la clínica en 5 categorías | `(app)/alimentos/page.tsx` |
| Servicios | Catálogo comercial: precio, duración, abono; alimenta caja, agenda y sitio | `(app)/servicios/page.tsx` |
| Ajustes | Marca (logo, Instagram), horario, contacto; gateado por rol owner | `(app)/ajustes/page.tsx`, `ajustes/marca.tsx`, `ajustes/contacto.tsx` |
| Caja del día | Recaudado hoy (consultas + productos) para cuadrar; sin comisiones | `(app)/(admin)/caja/page.tsx`, `caja/caja.tsx` (usa `cuadrarCaja`) |
| Finanzas | Liquidación por doctor con comisión según origen del paciente; **estado de cuenta mensual en PDF** generado en servidor con logo vectorial y tipografía de marca | `(app)/(admin)/finanzas/page.tsx`, `finanzas/finanzas.tsx`, `finanzas/estado-cuenta/route.ts`; `packages/core/src/estado-cuenta-pdf.ts` |
| Planilla / RRHH (Panamá) | Motor "por excepción": salario base + novedades; ISR, décimo tercer mes | `(app)/(admin)/planilla/page.tsx`; `packages/core/src/planilla.ts` (`calcularPlanilla`, `isrAnual`, `calcularDecimo`) |
| Proveedores y cuentas por pagar | Registro interno; gestionan owner y receptionist | `(app)/(admin)/proveedores/page.tsx` |
| Ventas e inventario | Registro interno de productos y movimientos | `(app)/(admin)/ventas/page.tsx`; `packages/core/src/almacen.ts` |
| Equipo | Gobernanza: altas, reasignación en lote, historial | `(app)/(admin)/equipo/page.tsx`, `equipo/equipo.tsx` |
| Sitio web (CMS) | Blog, fichas públicas del equipo, recetas y comunicados — publicados en el sitio público sin despliegue | `(app)/(sitio-web)/blog/page.tsx`, `equipo-sitio/page.tsx`, `recetas/page.tsx` |
| Manual del usuario por rol | Ruta que comprueba el rol y el slug antes de servir el HTML del manual | `apps/web/src/app/manual/route.ts`; `apps/web/src/app/_manuales/`; `next.config.ts` L24-33 |
| Aviso de tono | Revisión de lenguaje punitivo en textos (`revisarTono`, lista de palabras vetadas) | `(app)/aviso-tono.tsx`; `packages/core/src/tono.ts` |

### 2.2 App de la paciente — PWA (`apps/web/src/app/mi/`) — 12 páginas

| Pantalla | Qué hace | Ruta |
|---|---|---|
| Entrar | Login o "primera vez" con código; canje `redeem_invitation` vincula cuenta ↔ expediente | `mi/entrar/page.tsx` |
| Hoy | Portada: qué toca ahora, marcar comidas (`registros_comida`) | `mi/page.tsx`, `mi/hoy-comidas.tsx` |
| Mi plan | Lee el plan publicado (RLS `estado='asignado'`), snapshot renderizado + lo comido hoy; plan interactivo | `mi/plan/page.tsx`, `mi/plan/plan-interactivo.tsx` |
| Mercado | Lista de compras derivada del plan: suma porciones por grupo × días a surtir, cantidades desde `alimentos.cantidad/unidad` | `mi/mercado/page.tsx` |
| Progreso | Peso, meta corta semanal, "racha amable" (sin lenguaje punitivo) | `mi/progreso/page.tsx` |
| Chat | Chat con la nutricionista con Supabase Realtime (`postgres_changes` sobre `mensajes`), badge de no leídos | `mi/chat/chat.tsx` L35-37; `mi/tabbar.tsx` L114-115; `supabase/migrations/20260722000002_mensajes.sql` L45 |
| Recetas | Broadcast de la clínica (Realtime sobre `recetas`/`comunicados`) | `mi/recetas/page.tsx`; `20260720000007_recetas_comunicados.sql` L70-71 |
| Guías / documentos | Guía "cómo leer tu plan" + guías de la clínica; abrir marca "visto" | `mi/guia/page.tsx`, `mi/guias/[id]/page.tsx`, `mi/documento/[id]/route.ts` |
| Agendar | Pedir cita con la tratante (RPCs `mi_cita_contexto` / `mi_cita_ocupadas` / `mi_cita_solicitar`); guardar en calendario (`.ics`) | `mi/agendar/page.tsx`, `mi/guardar-en-calendario.tsx` |
| Yo / Privacidad / Manual | Perfil, aviso de privacidad, manual de la paciente | `mi/yo/page.tsx`, `mi/privacidad/page.tsx`, `mi/manual/route.ts` |
| PWA | `manifest.webmanifest` (`scope: /mi`, standalone, íconos maskable); service worker con cache-first solo para assets con hash y navegación siempre a red + `offline.html` | `apps/web/public/manifest.webmanifest`; `apps/web/public/sw.js` L1-25; `mi/sw-register.tsx` L14 |

### 2.3 Superficies abiertas del portal
- Reserva pública por clínica (`/reservar/[slug]`, anónima, todo por RPC) — `apps/web/src/app/reservar/[slug]/page.tsx`.
- Unirse al equipo con código (`/unirse/[codigo]`) — `apps/web/src/app/unirse/[codigo]/page.tsx`.
- Onboarding de 3 pasos (consulta → país → horario) — `apps/web/src/app/onboarding/page.tsx`.
- Login vestido con la marca de la clínica (`?c=slug`) — `apps/web/src/app/login/page.tsx`.
- Middleware: valida sesión con `supabase.auth.getUser()`; rutas abiertas `/`, `/reservar`, `/unirse`; `/mi/entrar` abierta y el resto de `/mi` exige sesión — `apps/web/src/middleware.ts`.

### 2.4 Sitio público por clínica (`apps/sitio/src/app/`) — 12 páginas + 2 route handlers
Portada, `[profesional]` (ficha + `contacto.vcf` generado en servidor), `agendar` (reserva + pago Yappy), `consulta`, `planes`, `equipo`, `recetas` y `recetas/[slug]/receta.pdf` (PDF generado en servidor con logo y datos de la clínica), `comunidad`, `preguntas` (FAQ con JSON-LD `schema.org`), `contacto`, `privacidad`, `robots.ts`, `sitemap.ts`, `og-tarjeta`. Fuente: `find apps/sitio/src/app -name page.tsx -o -name route.ts`; `apps/sitio/src/lib/seo.ts`.

### 2.5 Dominio puro (`packages/core/src/`, 35 módulos exportados en `index.ts`)
clinico, alergenos, finanzas, planilla, energia, actividad, antropometria, inbody, intercambios, macros, porciones, radar, tono, horario, privacidad, buscar, mapa, calendario, compartir, abono, condiciones, almacen, dinero, correo, telefono, tecleado, jsonld, pdf, estado-cuenta-pdf, receta-pdf, instagram, vcard, documentos, guias, recetas. Fuente: `packages/core/src/index.ts`.

---

## 3. Integraciones externas

| Integración | Dónde | Detalle |
|---|---|---|
| **Yappy (Banco General, Panamá)** — botón de pago v2 | `supabase/functions/yappy-orden/index.ts`, `supabase/functions/yappy-ipn/index.ts`, `supabase/functions/_shared/yappy-firma.ts`, `apps/sitio/src/app/yappy-boton.tsx`, `apps/sitio/src/app/pago.tsx` L278 | Dos POST al banco desde la Edge Function (`/payments/validate/merchant`, `/payments/payment-wc`); IPN GET firmado HMAC-SHA256; web component `<btn-yappy>` en el navegador. Ver §7 |
| **Resend** (correo transaccional) | `supabase/functions/avisos-enviar/index.ts` L72, L243 (`https://api.resend.com/emails`) | Drena la cola `avisos` (citas) con `.ics` adjunto; falla cerrado sin `RESEND_API_KEY` |
| **Supabase Realtime** | `supabase/migrations/20260722000002_mensajes.sql` L45; `20260720000007_recetas_comunicados.sql` L70-71; `apps/web/src/app/mi/chat/chat.tsx` L35 | Tablas `mensajes`, `recetas`, `comunicados` en `supabase_realtime` |
| **Supabase Storage** (6 buckets) | `grep "insert into storage.buckets" supabase/migrations` | `logos` (público), `editorial` (público), `alimentos-fotos` (público), `consentimientos` (privado), `documentos` (privado), `evolucion` (privado) |
| **pg_cron** | `supabase/migrations/20260726000005_cron_respuesta_automatica.sql`, `20260911170000_retencion_prospectos.sql`, `20260911220000_abono_caduca_solo.sql` | 3 jobs, ver §6 |
| WhatsApp (enlaces `wa.me`, sin API) | `packages/core/src/radar.ts` (`waLink`), `apps/web/src/app/(app)/agenda/mandar-cita.tsx`, `apps/sitio/src/app/compartir.tsx` | Solo deep links; **no hay bot ni API de WhatsApp** (`docs/08-agente-whatsapp.md` es análisis, "nada construido") |
| Google Calendar (enlace) + `.ics` | `supabase/functions/_shared/cita.ts`; `packages/core/src/calendario.ts` | Generación propia del `.ics` |
| Google Maps (enlace "cómo llegar") | `packages/core/src/mapa.ts` | Solo URL |
| Instagram (handles en fichas) | `apps/web/src/app/(app)/ajustes/marca.tsx`; `packages/core/src/instagram.ts` | Normalización de handle, sin API |
| JSON-LD / SEO | `apps/sitio/src/lib/seo.ts`; `packages/core/src/jsonld.ts` | schema.org en FAQ/fichas |
| Supabase Auth PKCE | `apps/web/src/app/auth/callback/route.ts` | Intercambio de código tras confirmar correo / magic link |

---

## 4. Seguridad

| Hecho | Valor | Fuente |
|---|---|---|
| Tablas `public` creadas en migraciones | 49 (una, `lecturas_chat`, se dropea después → **48 vivas**) | `grep -rhoiE "create table ..." supabase/migrations/*.sql \| sort -u \| wc -l`; `grep "drop table"` |
| Tablas con `enable row level security` | 49 de 49 (diff vacío) | `comm -23 <(tablas) <(tablas con RLS)` → sin salida |
| `create policy` | 190 sentencias | `grep -c "create policy"` acumulado |
| Funciones SQL distintas (`public.` + `private.`) | 107 (58 en `private`, 49 en `public`) | `grep -rhoiE "create (or replace )?function (public\|private)\.[a-z_]+" \| sort -u \| wc -l` |
| Apariciones de `security definer` | 230 (incluye redefiniciones) | `grep -c "security definer"` acumulado |
| Esquema `private` para helpers de RLS | `private.user_tenant_ids`, `private.user_role_in`, `private.tiene_rol`, `private.es_tratante`, `private.puede_acceder_paciente`, `private.user_patient_link_ids`, etc. | `supabase/migrations/20260713000000_fundaciones.sql` + lista completa en grep anterior |
| Roles de staff (`membership_role`) | `owner`, `professional`, `receptionist` + `administrator` (añadido después) | `grep "create type public.membership_role"`; `alter type public.membership_role add value if not exists 'administrator'` |
| Pacientes | No son membership: cuenta global + `patient_links` por tenant (canje `redeem_invitation`) | `packages/db/tests/aislamiento.test.ts` L92-128 |
| Test de cobertura RLS al 100% | Consulta `pg_catalog`: falla si hay cualquier tabla en `public` sin `relrowsecurity` o sin policy | `packages/db/tests/cobertura-rls.test.ts` L11-40 |
| Tests de aislamiento entre tenants | 8 casos: B no ve/inserta/actualiza A, anónimo no ve nada, invitación de un solo uso, invitación expirada | `packages/db/tests/aislamiento.test.ts` L41-128 |
| Tests de seguridad clínica | 10 casos: coherencia tenant↔patient_link en escritura (H-1), `receptionist` no lee ni escribe datos clínicos pero sí contacto, consentimiento append-only e imborrable (H-2) | `packages/db/tests/clinico-seguridad.test.ts` L53-146 |
| CI ejecuta RLS | Job `rls` levanta `supabase start` y corre `pnpm test:rls` | `.github/workflows/ci.yml` |
| Secretos solo en Edge Functions | `abono_confirmar_pago` revocada para `anon` y `authenticated`, solo `service_role` | `supabase/migrations/20260917070000_el_pago_cierra_por_los_dos_extremos.sql` (comment + revoke/grant) |
| Verificación de firma IPN | HMAC-SHA256 sobre `orderId+status+domain`, clave = primer trozo del base64 decodificado, comparación en tiempo constante, falla cerrado | `supabase/functions/_shared/yappy-firma.ts` (`claveReal`, `firmaEsperada`, `igualEnTiempoConstante`, `ipnEsDeYappy`); test `packages/core/test/yappy-firma.test.ts` |
| CORS restringido por origen + `Vary: Origin` en `yappy-orden` | Lista `YAPPY_DOMAIN` + `YAPPY_ORIGENES_EXTRA`; rechazo registrado con `console.warn` | `supabase/functions/yappy-orden/index.ts` (`corsDe`) |
| Monto nunca viene del navegador | `yappy-orden` lee monto y celular con RPC `abono_datos_para_cobrar` por `orden_ref` (12 hex) | `supabase/functions/yappy-orden/index.ts` |
| Manuales por rol fuera de `public/` | Ruta comprueba rol y slug antes de leer el HTML | `apps/web/src/app/manual/route.ts`; `next.config.ts` L24-33 |
| Auditoría | Tabla `audit_log` + trigger `private.audit_cambios` | `supabase/migrations/20260713000000_fundaciones.sql` |
| Middleware valida con `getUser()` (no `getSession`) | — | `apps/web/src/middleware.ts` L30-33 |

---

## 5. Números verificados

| Métrica | Valor | Comando | Fuente |
|---|---|---|---|
| Migraciones SQL | **189** (se decía 179; el 179 era del 26-sep, luego hubo 10 más hasta 2026-10-06) | `ls supabase/migrations/*.sql \| wc -l` | `supabase/migrations/` (primera `20260713000000_fundaciones.sql`, última `20261006110000_avisos_ver_se_acota_como_abonos.sql`) |
| Líneas de SQL en migraciones | 16.345 | `cat supabase/migrations/*.sql \| wc -l` | — |
| Tests unitarios `packages/core` | **710 tests en 40 archivos, todos en verde** (se decía 696; ese número era del 26-sep) | `npx vitest run` en `packages/core` → "Test Files 40 passed · Tests 710 passed" (3,84 s) | `packages/core/src/*.test.ts`, `packages/core/test/*.test.ts` |
| Casos `test(`/`it(` por grep en core | 685 (vitest cuenta 710 porque hay casos generados en bucles) | `grep -rhoE "^\s*(test\|it)\(" packages/core --include=*.test.ts \| wc -l` | — |
| Tests RLS/integración `packages/db` | **19 casos en 3 archivos** (requieren stack local; corren en CI) | `grep -rhoE "^\s*(test\|it)\(" packages/db/tests \| wc -l` | `packages/db/tests/{aislamiento,clinico-seguridad,cobertura-rls}.test.ts` |
| Total automatizado | **729 casos / 43 archivos** (710 + 19) | suma | — |
| Archivos de test (sin worktrees) | 43 | `find packages apps -name "*.test.ts" \| wc -l` | — |
| Tablas `public` | 49 creadas / 48 vivas, 100% con RLS | ver §4 | — |
| Policies RLS | 190 | `grep -c "create policy"` | — |
| Funciones SQL distintas | 107 | ver §4 | — |
| Triggers distintos | 61 | `grep -rhoiE "create (or replace )?trigger [a-z_]+" \| sort -u \| wc -l` | — |
| Edge Functions | 3 (`yappy-orden`, `yappy-ipn`, `avisos-enviar`) + 2 módulos `_shared` | `ls supabase/functions` | — |
| Cron jobs pg_cron | 3 | `grep -rhoiE "cron\.schedule\(..." \| sort -u` | — |
| Buckets de Storage | 6 | `grep "insert into storage.buckets"` | — |
| Páginas Next en `apps/web` | 43 `page.tsx` + 7 `route.ts` | `find apps/web/src/app -name page.tsx \| wc -l` | — |
| Rutas en `apps/sitio` | 12 `page.tsx` + 2 `route.ts` | `find apps/sitio/src/app -name page.tsx \| wc -l` | — |
| Líneas TS/TSX (apps + packages + functions, sin tipos generados ni node_modules) | 43.436 | `find ... -name "*.ts" -o -name "*.tsx" \| xargs cat \| wc -l` | — |
| Commits | 470 (2026-07-13 → 2026-10-06) | `git log --oneline \| wc -l`; `git log --reverse --format=%ad` | `.git` |
| `packages/core/src` | 44 archivos, 8.598 líneas | `wc -l` | — |

---

## 6. Automatizaciones, crons y Edge Functions

### Edge Functions (Deno, `supabase/functions/`)
| Función | Método | Qué hace | Cuándo corre |
|---|---|---|---|
| `yappy-orden` | POST (CORS por origen) | Valida forma de `ordenRef` (`^[0-9A-F]{12}$`), lee monto y alias con RPC `abono_datos_para_cobrar` (service role), llama `POST /payments/validate/merchant` → token (vale 10 min, no se cachea), luego `POST /payments/payment-wc` con `Authorization: <token>` **sin Bearer**, impuestos `0.00`, `ipnUrl` apuntando a `yappy-ipn`. Devuelve solo `{transactionId, token, documentName}`. Timeouts de 8 s; 503 sin configuración, 409 si el apartado no está vivo, 422 sin celular, 502/504 si el banco falla | Cuando la paciente toca el botón Yappy en el sitio (`eventClick`) |
| `yappy-ipn` | GET (lo exige el contrato) | Verifica firma HMAC; anota el aviso con RPC `yappy_aviso_recibido`; acredita con RPC `abono_confirmar_pago` (devuelve `pagado \| pagado_tarde \| pagado_sin_hueco \| cerrado \| repetido \| desconocido`); cierra el aviso con `yappy_aviso_resuelto`; **siempre responde 200** salvo fallo de base (503 para que Yappy reintente); si acreditó dinero, en `EdgeRuntime.waitUntil` llama a `avisos-enviar` para mandar el correo de confirmación en segundos | Cuando el banco notifica (reintenta 3 veces, exige respuesta <5 s) |
| `avisos-enviar` | POST | Drena la cola `avisos` (encolada por trigger `private.encolar_aviso_cita`), relee la cita (si se canceló → `descartado`), arma asunto/HTML/texto + `.ics` en servidor (`_shared/cita.ts`) y manda por Resend. Quién puede drenar lo decide la RLS (`avisos_ver`) porque lee con la sesión del llamador. Falla cerrado sin `RESEND_API_KEY` | Al abrir la Agenda del portal y tras un pago acreditado (desde `yappy-ipn`) |

### Crons pg_cron (`supabase/migrations/`)
| Job | Programación | Qué hace | Fuente |
|---|---|---|---|
| `respuestas-auto-chat` | `* * * * *` (cada minuto) | `public.enviar_respuestas_automaticas()` — respuestas automáticas del chat fuera de horario | `20260726000005_cron_respuesta_automatica.sql` |
| `purgar-prospectos` | `0 8 * * *` (diario 08:00) | `private.purgar_prospectos()` — retención de prospectos de la reserva pública | `20260911170000_retencion_prospectos.sql` |
| `caducar-apartados` | `*/5 * * * *` (cada 5 min) | `private.caducar_apartados()` — cierra abonos `esperando` cuyo `apartada_hasta` venció (apartado de 15 min, `MINUTOS_APARTADO` en `packages/core/src/abono.ts` L86) | `20260911220000_abono_caduca_solo.sql` |

### Triggers relevantes (61 en total)
`private.encolar_aviso_cita` (cola de correos de cita), `private.audit_cambios` (auditoría), `private.cita_ocupa`/`cita_choca` (solapes), `private.cobro_sigue_a_su_cita`, `private.paquete_sigue_la_cita`, `private.touch_updated_at`, `private.handle_new_user`. Fuente: lista de funciones `private.*` en migraciones.

### Vercel cron
Ninguno en NutriSoft (no hay `vercel.json`).

---

## 7. Flujo clave: reserva en línea con abono por Yappy (tal como está en el código)

Actores: navegador del sitio público (`apps/sitio`), Postgres (RPCs), Edge Functions, API de Yappy, app Yappy de la paciente.

1. **Disponibilidad.** El formulario pide huecos con RPC `reserva_disponibilidad` (anónima) — `apps/sitio/src/app/agendar.tsx` L442. La parrilla sale de `private.slots_del_dia` / `private.horario_valido`, y las duraciones/abono por profesional de `private.duracion_de_la_cita`, `private.abono_de_la_reserva`, `private.tenant_pide_abono`.
2. **Crear la reserva.** RPC `reserva_crear` (`agendar.tsx` L540). Si el servidor decide que no hay abono (seguimiento de paciente activa), responde `sin_abono` y la cita queda confirmada sin pago.
3. **Apartar y pedir el pago.** Al confirmar, RPC `reserva_abonar` (`agendar.tsx` L1143) crea la fila en `abonos` (estado `esperando`), pone la cita en `esperando_pago` con `apartada_hasta = now()+15 min` y devuelve `orden_ref` (12 hex generado por `private.nueva_orden_ref`). Se guarda en el navegador para que el comprobante sobreviva a perder la pestaña (`agendar.tsx` L322-360).
4. **Botón del banco.** `yappy-boton.tsx` carga el script del CDN de Yappy (545 KB, plazo 25 s, empieza a bajar al abrir el panel) y monta `<btn-yappy>`. Escucha `eventClick`, `eventSuccess`, `eventError` (L204-206).
5. **Crear la orden (en `eventClick`, no antes).** `pago.tsx` L278 hace `fetch(${SUPABASE_URL}/functions/v1/yappy-orden, {ordenRef})`. La función valida el comercio y crea la orden (ver §6). Devuelve `{transactionId, documentName, token}` y el sitio llama `el.eventPayment({...})`. El modal del banco abre con cuenta atrás; **no hay redirección**: la paciente aprueba en su app de Yappy.
6. **Notificación del banco (IPN).** Yappy hace `GET /functions/v1/yappy-ipn?orderId&status&domain&hash[&confirmationNumber]`. `yappy-ipn` verifica la firma, anota en `yappy_avisos`, y llama `abono_confirmar_pago(p_orden_ref, p_estado, p_referencia)`:
   - `R/C/X` → abono `rechazado`/`caducado`, cita `cancelada` → `cerrado`.
   - `E` con abono `esperando` → abono `pagado`, cita `confirmada` → `pagado`.
   - `E` tarde pero el hueco sigue libre (`private.cita_choca` = false) → cita `confirmada` → `pagado_tarde` (warn).
   - `E` tarde y hueco perdido → cobro registrado, cita sigue cancelada → `pagado_sin_hueco` (**error en log: reagendar o devolver**).
   - Repetidos → `repetido` (idempotente por `unique_violation`).
   Fuente: `supabase/migrations/20260917070000_el_pago_cierra_por_los_dos_extremos.sql`.
7. **Correo de confirmación.** Si el resultado empieza por `pagado`, `yappy-ipn` llama en segundo plano a `avisos-enviar` con el `tenant_id` del abono; se manda el correo con `.ics` por Resend.
8. **Comprobante.** El sitio consulta RPC `reserva_comprobante` por `orden_ref` (`agendar.tsx` L355) y pinta el comprobante imprimible (`comprobante.tsx`, `window.print()`), con confeti (`confeti.tsx`).
9. **Si nadie paga.** Cada 5 min `caducar-apartados` libera la hora. Reintentar es seguro: `reserva_abonar` cierra el apartado anterior y abre uno nuevo (`pago.tsx` L356-357).
10. **Devolución y cancelación.** RPC `abono_devolver`; política de cancelación: el abono sobrevive solo con >24 h de aviso (`HORAS_AVISO = 24`, `veredictoCancelacion` en `packages/core/src/abono.ts` L109-134).

Documento de contrato: `docs/09-yappy-boton-de-pago.md` (ambientes, credenciales, flujo, catálogo de errores, "Lo construido" / "Falta").
Estado al cierre del repo: la cadena está probada contra el ambiente UAT del banco (validate `0000`, orden `0000` con `transactionId`); la aprobación dentro de la app UAT del banco quedó pendiente del banco, no del código (`CLAUDE.md`, revisión 2026-09-25, punto 8).

### Flujo secundario: invitación de paciente (FL-2)
Alta con nombre + contacto → `invitaciones` de un solo uso → paciente crea cuenta en `/mi/entrar` → `redeem_invitation` crea `patient_links` → ve solo su vínculo. Test: `packages/db/tests/aislamiento.test.ts` L92-128.

---

## 8. Motor nutricional determinista (`packages/core/src/`) — para replicar en una demo

Regla dura #2 del proyecto: los cálculos viven en `packages/core`, son deterministas y "la IA jamás los pisa" (`CLAUDE.md` §Reglas duras). Todo validado con `RangeError` ante entradas fuera de rango.

### 8.1 Energía — `energia.ts` (56 líneas, 8 tests)
Entradas: `{ sexo: "femenino"|"masculino", edadAnios, pesoKg, tallaCm }` (rangos: edad 0-120, peso 0-400, talla 0-260).
- `tmbMifflinStJeor(d)` = `10·peso + 6.25·talla − 5·edad` + (hombre `+5` / mujer `−161`). Método por defecto.
- `tmbHarrisBenedict(d)` (Roza & Shizgal 1984): hombre `88.362 + 13.397·peso + 4.799·talla − 5.677·edad`; mujer `447.593 + 9.247·peso + 3.098·talla − 4.33·edad`.
- `gastoEnergeticoTotal(tmb, actividad)` = `tmb × factor`, con `FACTORES_ACTIVIDAD = { sedentario 1.2, ligero 1.375, moderado 1.55, intenso 1.725, muy_intenso 1.9 }`.

### 8.2 Macros — `macros.ts` (91 líneas) + `intercambios.ts`
- `ATWATER = { hc: 4, proteina: 4, grasa: 9 }` kcal/g; `kcalDeMacros(m)` — las kcal siempre se derivan, nunca se capturan (`intercambios.ts` L19-31).
- `DISTRIBUCIONES` (% de kcal proteína/grasa/HC): `balanceada 20/30/50`, `perdida_peso 30/30/40`, `control_glicemico 25/35/40`, `deportivo 25/25/50`, `alta_proteina 35/30/35` (ej. protocolo GLP-1).
- `gramosObjetivo(kcal, dist)` → `{ proteina: kcal·p%/100/4, grasa: kcal·g%/100/9, hc: kcal·hc%/100/4 }`; exige que los % sumen 100 ± 0.01 y kcal en (0, 10000].
- `gramosProteinaMagra(kcal, masaMagraKg, gProteinaPorKg, dist)`: proteína = masa magra (InBody) × g/kg (0-4]; el resto de kcal se reparte entre HC y grasa conservando su proporción relativa.
- `desvio(objetivo, real)` → % por macro y kcal + `maxAbs` (gobierna la tolerancia ≤5%).

### 8.3 Equivalentes (SMAE) — `intercambios.ts` (92 líneas)
`SUBGRUPOS` con macros por porción (g): verdura 4/2/0 (hc/prot/grasa), fruta 15/0/0, cereal_sin_grasa 15/2/0, cereal_con_grasa 15/2/5, leguminosa 20/8/1, aoa_muy_bajo 0/7/1, aoa_bajo 0/7/3, aoa_moderado 0/7/5, aoa_alto 0/7/8, leche_descremada 12/9/2, leche_semi 12/9/4, leche_entera 12/9/8, grasa_sin_proteina 0/0/5, grasa_con_proteina 3/3/5, azucar_sin_grasa 10/0/0, azucar_con_grasa 10/0/5. Base: SMAE 4ª ed. `sumaMacros(items)` suma subgrupo × equivalentes.

### 8.4 Porciones — `porciones.ts` (142 líneas)
`distribuyePorciones(objetivoMacros, anclas = ANCLAS_DEFAULT)`:
1. Anclas fijas: `verduras 3, frutas 3, lacteos 2 (leche_descremada), leguminosas 0`, `paso 0.5` (medias porciones).
2. Cereales (`cereal_sin_grasa`) cubren el HC restante: `redondea((hc_obj − hc_anclas) / 15, 0.5)`.
3. Proteínas (`aoa_bajo`) cubren la proteína restante (descontada la de cereales): `/ 7`.
4. Grasas (`grasa_sin_proteina`) cubren la grasa restante: `/ 5`.
5. Devuelve `{ porciones, macros, kcal, desvio, dentroDeTolerancia: desvio.maxAbs ≤ TOLERANCIA_PCT (5) }`.
`distribuyeDesdeKcal(kcal, dist, anclas)` encadena `gramosObjetivo` → `distribuyePorciones`. `subgruposDelGrupo` y `macrosDeEquivalentes` sirven para sustituciones dentro del mismo grupo.

### 8.5 Antropometría y progreso — `antropometria.ts` (333 líneas)
`imc(peso, talla)`, `clasificacionImc`, `analizarComposicion(...)` (veredicto `mejora|atencion|neutral` por métrica), `seriesEvolucion`, `repartirPorFecha`.

### 8.6 InBody — `inbody.ts` (260 líneas)
`leerInBody(filas)` interpreta el export LookinBody (unidad del archivo, nivel visceral, fecha), `imcDeLectura`, `compararNombres` (igual/parecido/distinto) para cruzar con la paciente.

### 8.7 Seguridad clínica — `alergenos.ts` (152 líneas) y `tono.ts`
`ALERGENOS_VOCAB` + `ALERGENO_SINONIMOS`, `analizarAlergias`, `tagsDeAlergias`, `alergenosDeAlimento`, `esAlergenoDeclarado` (un plan jamás incluye un alérgeno declarado, CA-2.6). `revisarTono(texto)` / `tonoLimpio` con `PALABRAS_VETADAS` (regla dura #4: cero lenguaje punitivo).

### 8.8 Radar de retención — `radar.ts` (162 líneas)
`evaluarRadar(p)` → `urgente|ojo|null` con umbrales `DIAS_SIN_REGISTRAR_ALERTA = 5`, `DIAS_SIN_PESARSE_ALERTA = 14`; `waLink(telefono, texto, "507")`.

### 8.9 Dinero de la clínica — `finanzas.ts` (348), `planilla.ts` (298), `abono.ts` (174)
`liquidarDoctor(cobros, tarifas)` (comisión por origen del paciente clínica/doctor), `cuadrarCaja`, `diferenciaEfectivo`, `costoDeCobrar`, `METODOS_PAGO = efectivo|yappy|tarjeta|transferencia|otro`; `calcularPlanilla`, `isrAnual`, `isrQuincenal`, `calcularDecimo`, `PARAMETROS_PLANILLA_DEFAULT` (Panamá); `abonoDe(servicio, clinica, profesional)` (prioridad servicio > profesional > clínica; `null` = sin configurar, no gratis), `MINUTOS_APARTADO 15`, `HORAS_AVISO 24`, `veredictoCancelacion`.

Dónde lo usa la UI: `apps/web/src/app/(app)/pacientes/[id]/plan/calculadora.tsx`, `mediciones.tsx`, `subir-inbody.tsx`, `caja/caja.tsx`, `finanzas/finanzas.tsx`, `planilla/planilla.tsx`, `finanzas/estado-cuenta/route.ts`, `(app)/aviso-tono.tsx` (verificado con grep de los nombres exportados).

---

## 9. Lo que NO está construido o está a medias (no afirmarlo)

| Tema | Estado real | Fuente |
|---|---|---|
| **Conteo de calorías por foto / IA de fotos de comida** | **NO construido.** Solo existe la interfaz `AiProvider.analyzeFoodPhoto` y el tipo `AnalyzeFoodPhotoOutput` en `packages/ai/src/index.ts`. Ninguna app ni Edge Function la implementa ni la llama (grep `analyzeFoodPhoto` → 1 archivo, el de contratos). No hay SDK de ningún proveedor de IA en el repo. ⚠️ La landing `apps/web/src/app/page.tsx` L167 **anuncia** "Toma una foto de lo que estás comiendo y la IA calcula sus calorías" — es copy de marketing sin función detrás | `packages/ai/src/index.ts`; `packages/ai/package.json` ("sin tests aún (solo contratos)"); grep |
| Generación de planes con IA (`generatePlan`) y transcripción de notas (`transcribeNote`) | Solo contratos; sin implementación | `packages/ai/src/index.ts` |
| Agente / automatización de WhatsApp | Solo análisis en `docs/08-agente-whatsapp.md` ("ANÁLISIS — nada construido") | `docs/README.md` |
| App móvil nativa (Expo) | Archivada 2026-07-24; una pantalla con datos hardcodeados; fuera del workspace; no empaqueta bajo pnpm | `apps/mobile/README.md`; `pnpm-workspace.yaml` |
| Manual para el rol `administrator` | No existe; el enlace no le sale | `CLAUDE.md` revisión 2026-09-26 punto 4 |
| Pago Yappy en producción | Construido y probado contra UAT; la aprobación dentro de la app UAT del banco quedó pendiente del banco; `NEXT_PUBLIC_YAPPY_HABILITADO=1` con CDN de UAT en producción por decisión del fundador | `CLAUDE.md` revisión 2026-09-25 punto 8 y aviso; `docs/09-yappy-boton-de-pago.md` §"⛔ Falta" |
| Pago desde la app de la paciente | No hay flujo de pago dentro de `/mi` (por política, un seguimiento no lleva abono) | `CLAUDE.md` 2026-09-25 punto 7 |
| Competencias de atletas | Decidido, no construido | `CLAUDE.md` 2026-09-24 punto 7 |
| Recordatorios de cita programados por hora | `pg_net` **no está instalado**; la base no puede llamar funciones; los avisos se drenan al abrir la Agenda o tras un pago | `supabase/functions/yappy-ipn/index.ts` (comentario "pg_net no está instalado") |
| Notificaciones push / web-push | No existen (grep `web-push|vapid|pushManager` → 0 en código fuente) | — |
| Tests de `apps/web`, `apps/sitio`, `packages/ai` | Scripts `test` son `echo "sin tests aún"` | `apps/web/package.json`, `apps/sitio/package.json`, `packages/ai/package.json` |
| Datos de ejemplo (seed) | `supabase/seed.sql` tiene 2 líneas (vacío); no hay seed de demo | `wc -l supabase/seed.sql` |
| Impuestos en la orden Yappy | Fijos en `0.00` a propósito (decisión pendiente del contador) | `supabase/functions/yappy-orden/index.ts` |
| Defaults clínicos del motor de porciones | El código dice que las anclas "deben validarse con un nutricionista antes del lanzamiento" | `packages/core/src/porciones.ts` L36-39 |
| Análisis de pliegos / conteo de planos | No aplica a NutriSoft | — |

---

## 10. Logos, branding, capturas y seeds

| Qué | Ruta | Nota |
|---|---|---|
| Branding NutriSoft (producto) | `Branding/BRANDING.md`, `Branding/NutriSoft Brand.dc.html`, `Branding/NutriSoft Landing.dc.html`, `Branding/NutriSoft Landing-print.dc.html` | Guía de marca y landing de referencia |
| Íconos PWA | `apps/web/public/icono-192.png`, `icono-512.png`, `icono-apple.png`; colores `theme_color #4F7D66`, `background #F3EFE7` | `apps/web/public/manifest.webmanifest` |
| Ícono Play Store | `play store/icono-nutrisoft.svg` | Carpeta con guía de publicación, política de privacidad borrador, textos de ficha, `eas.json` |
| Marcas por clínica (white-label) | `apps/web/public/marcas/<slug>.svg`, `<slug>-intro.svg`, `apps/web/public/logos/<slug>.png` | Contienen el slug/logo de la clínica piloto: **no reutilizar en portafolio** |
| Logos del sitio público piloto | `apps/sitio/public/logo.svg`, `logo-horizontal.svg`, `logo-intro.svg`, `logo-blanco.png` | Marca del cliente: no usar |
| Ilustraciones genéricas | `apps/web/public/doctora.png`, `videollamada.png`; `docs/Doctora Nutrisoft Foto.png`, `docs/Doctora Fondo Transparente.png`, `docs/Nutricionista.png`, `docs/Video Llamada.png` | Imágenes de producto |
| Flyer | `docs/NutriSoft-Flyer.pdf` | — |
| Guías/catálogo de ejemplo | `apps/web/public/guias/<slug>/{catalogo,menu}/*.webp` | Contenido del cliente piloto |
| Seeds de demo | **No hay** (`supabase/seed.sql` vacío). Las pruebas RLS crean sus propios tenants ("Clínica A/B") en `packages/db/tests/helpers.ts` | — |
| Capturas | No hay carpeta de capturas en el repo; hay HTML de manuales/propuestas en `docs/*.html` y un muestrario de estado de cuenta en `tools/pdf-estado-cuenta-muestra.ts` | — |
| Documentación de producto | `docs/01`–`docs/09` (mercado, blueprint, arquitectura con 11 ADRs, especificación MVP E1–E10, micronutrientes, estadísticas, entrevista, WhatsApp, Yappy) | `docs/README.md` |
