# tino — ficha de hechos verificables

Repo: `C:\RRHH`. Fecha de lectura: 2026-10-11. Solo lectura; no se abrieron `.env*`, `Hojas de Vida/`, `Finanzas/` ni `auditorias/`.
Todas las rutas son relativas al repo. "L" = línea.

Qué es (según `CLAUDE.md` L3-4 y `README.md` L5): SaaS multitenant de reclutamiento para RRHH en Panamá y Latinoamérica: perfil de cargo con IA, portal público de postulación, banco de talento y screening con ranking. Lo vende Nexera. App en `app.contratacontino.com`, sitio en `www.contratacontino.com` (`CLAUDE.md` L8-14).

---

## 1. Stack exacto

| Pieza | Versión / detalle | Fuente |
|---|---|---|
| React | `^19.2.8` (+ `react-dom ^19.2.8`) | `package.json` L21-23 |
| Vite | `^8.3.0` | `package.json` L32 |
| Tailwind | `^4.3.3` (`tailwindcss` + `@tailwindcss/vite`) | `package.json` L15, L25 |
| PWA | `vite-plugin-pwa ^2.0.0`, `registerType: 'autoUpdate'`, manifest `name: 'Tino'`, `display: 'standalone'`, iconos any + maskable, 2 shortcuts (`/vacantes/nueva`, `/candidatos`), service worker importa `push-sw.js` | `package.json` L33; `vite.config.js` L37-67 |
| Router | `react-router-dom ^7.18.4`; rutas lazy con `lazyRetry` + `ErrorBoundary` | `package.json` L24; `src/main.jsx` L10-13, L15-32 |
| Supabase | `@supabase/supabase-js ^2.117.3`; Postgres + RLS + Auth + Storage (bucket privado `cvs`, 10 MB, solo PDF) | `package.json` L14; `supabase/migrations/0004_fase2_portal_candidatos.sql` L97-101 |
| Funciones serverless | Vercel, archivos planos en `api/*.js`, `maxDuration: 300`; `@vercel/functions ^3.9.11` (`waitUntil`) | `vercel.json` L3; `package.json` L16; `api/_lib.js` L3, L12 |
| IA | `@anthropic-ai/sdk ^0.131.0`; `beta.messages.create` con `output_config.format: json_schema` (salida estructurada), `cache_control: ephemeral` en el system prompt, beta `server-side-fallback-2026-07-01` | `package.json` L12; `api/_extract.js` L62-71; `api/_screen.js` L63-70 |
| Modelos en código | extracción `claude-sonnet-5-5` (`api/_extract.js` L8); screening `claude-sonnet-5-5` (`api/_screen.js` L7; comentario L5-6: cambiado desde Opus el 2026-10-09 tras prueba con 15 CV: mismo top 5, correlación 0.96, $0.037 vs $0.088 por CV); perfil de cargo `claude-opus-5-5` (`api/profile-draft.js` L6); sugerencias del banco `claude-sonnet-5-5` (`api/suggest-bank.js` L8); tabla de precios de 3 modelos en `api/_lib.js` L27 | ver celdas |
| Correo | Resend por API HTTP (sin SDK), `fetch('https://api.resend.com/emails')`; sin `RESEND_API_KEY` solo registra en consola | `api/_mail.js` L1-18 |
| Push | `web-push ^3.6.7` (VAPID); SW `public/push-sw.js` | `package.json` L27; `api/push-dispatch.js` L1, L18 |
| Anti-bot | Cloudflare Turnstile (opcional: sin `TURNSTILE_SECRET` no exige) + campo trampa `website` | `api/_lib.js` L74-83; `api/apply.js` L16 |
| Gráficas | `chart.js ^4.5.1`, `react-chartjs-2 ^5.3.1` | `package.json` L17, L22 |
| Otros | `gsap ^3.15.0`, `qrcode-generator ^2.0.4` (QR de vacante), `vaul ^1.1.2` (drawers) | `package.json` L18-19, L26 |
| Lint | `oxlint ^1.81.0` | `package.json` L31 |
| Tipografía UI | Onest (Google Fonts) | `index.html` L9; `src/index.css` L4 |
| Sitio público | Astro `^7.3.8` + Tailwind v4, carpeta `site/` (4 páginas: `index`, `nosotros`, `preguntas`, `seguridad`) | `site/package.json` L15-17; `site/src/pages/` |
| Dev server | plugin Vite `apiDev` sirve `api/*.js` en local igual que Vercel, bloqueando módulos `_*` | `vite.config.js` L10-31 |

---

## 2. Funciones construidas (con ruta)

- **Perfil de cargo con IA** (requisición → perfil formal + texto de publicación + criterios de ranking + perfil conductual Big Five con pregunta de entrevista por rasgo + preguntas abiertas para RRHH): `api/profile-draft.js` L14-50 (esquema JSON), L52-63 (prompt), L66-83 (`draft()`), L85-110 (endpoint autenticado, roles admin/recruiter/manager, rate limit 5/min por org, cuota `profiles`). UI: `src/pages/NewVacancy.jsx`, `src/IntakeForm.jsx`.
- **Requisición por enlace para jefes sin cuenta**: RRHH crea token de 32 hex (`api/requisition.js` L16) y envía correo (`api/_mail.js` L73-81); el jefe responde en `/requisicion/:token` (`src/main.jsx` L68; `src/pages/Requisition.jsx`); `api/requisition-submit.js` guarda al instante, reclama el enlace de un solo uso (L39-40), crea la vacante en borrador y redacta el perfil en segundo plano (L48-71). Enlace vence a los 30 días (`api/_mail.js` L79); `api/maintenance.js` L10 cancela los vencidos.
- **Flujo de estados de la vacante**: `draft → review → approved → published → closed` (`supabase/migrations/0002_fase1_job_profiles.sql` L15); botones Aprobar / Publicar en `src/pages/Vacancy.jsx` L205-206; trigger `job_profiles_dates` fija `published_at`/`closed_at` (`0007_fase4_pipeline.sql` L19-26).
- **Portal público de postulación** `/postular/:slug`: `src/main.jsx` L67; `src/pages/Apply.jsx` (lee la vacante con RPC `public_job` L36; sube el PDF con URL firmada L45-46; consentimiento L131; Turnstile L13-19, L135; `?src=` para medir origen L67). Marca blanca del cliente: logo y color con guardia de contraste (`src/pages/Apply.jsx` L82-89; `src/brandColor.js`).
- **QR de la vacante** `/vacantes/:id/qr`: `src/main.jsx` L69; `src/pages/VacancyQr.jsx`.
- **Extracción de CV con IA** (PDF → JSON estructurado: experiencia, educación, habilidades, idiomas, certificaciones, calidad, especificidad, escaneado, alertas, área y senioridad): `api/_extract.js` L14-36 (esquema), L38-51 (prompt), L54-96 (`extractApplication`). Prohíbe extraer edad, sexo, nacionalidad, foto, etc. (L51).
- **Evaluación (screening) con IA** contra el perfil: `api/_screen.js` L14-28 (esquema: 3 puntajes 0-100, confianza, recomendación `avanzar/revisar/no_prioritario`, criterios con evidencia, alertas, perfil conductual observado, 3 preguntas de entrevista, cómo abordar), L30-45 (prompt), L50-83 (`evaluateApplication`: quita nombre/email/teléfono del CV antes de enviarlo L61; el puntaje total lo calcula el sistema con los pesos de la vacante, no el modelo L77-81), L86-113 (`screenApplication`: guarda, registra uso y avisa al equipo si la recomendación es `avanzar` L100-106).
- **Ranking de candidatos** por puntaje con filtros de etapa y recomendación: `src/pages/Vacancy.jsx` L15, L174-177; `src/RankingCard.jsx`.
- **Pipeline de selección** `suggested → new → shortlist → interview → offer → hired` + `rejected/withdrawn` (`0010_fase6_seleccion.sql` L5-6; `src/RankingCard.jsx` L24); cambio de etapa y descarte con motivo (`src/pages/Vacancy.jsx` L138-146; `src/RankingCard.jsx` L201-222); trigger `applications_stage` sella `stage_changed_at` (`0007_fase4_pipeline.sql` L11-17).
- **Hoja del candidato** y **comparador**: `src/CandidateSheet.jsx`, `src/CompareSheet.jsx`.
- **Modo entrevista** `/vacantes/:id/entrevista/:appId` con scorecard por entrevistador (upsert por `application_id,interviewer_id`) y calificación por rasgo conductual 1-5: `src/main.jsx` L70; `src/pages/InterviewMode.jsx` L138; `0018_scorecards_traits.sql` L1-2. Entrevistas programadas y comentarios con menciones: `src/ApplicationPanel.jsx` L43-46, L77, L125.
- **Mensajes al candidato por plantilla** (entrevista, en espera, oferta, cierre cortés) por correo (Resend) o WhatsApp (`wa.me`, número panameño de 8 dígitos → `507…`), siempre con registro en `messages` y respeto de `email_opt_out`: `api/message.js` L7, L25, L33-37; plantillas en `api/_mail.js` L23-28.
- **Cierre de vacante con aviso masivo**: descarta a los activos con motivo "Vacante cerrada" y envía cierre cortés en lotes de 5, idempotente: `api/notify-closed.js` L4-43.
- **Sugerencia desde el banco de talento al publicar** (`suggest-bank`): candidatos de procesos anteriores que podrían encajar, por área + coincidencia de palabras (RPC `bank_matches`) y juicio de IA sobre un pool de 30, máximo 12 sugerencias con motivo de ≤20 palabras; entran como postulaciones `suggested` sin evaluar: `api/suggest-bank.js` L6-8, L28-79; disparo automático al publicar en `src/pages/Vacancy.jsx` L100.
- **Banco de talento** con catálogo fijo de 14 áreas y 4 senioridades que la IA asigna al extraer: `src/areas.js` L3-31; RPCs `bank_area_counts` y `set_job_area` con `security invoker` (`0031_banco_areas_rpc.sql` L4-15); página `src/pages/Candidates.jsx`. Script de clasificación por lotes: `scripts/clasificar-areas.mjs`.
- **Importación de CVs por RRHH** (Konzerta, correo, WhatsApp) con candidato provisional `pendiente-<id>@import.tino` que se completa con los datos del propio PDF y se funde con un candidato existente si el correo ya existe: `api/_import.js` L5-56; usado por `scripts/import-cvs.mjs` L12, L45 (script con service role; no hay endpoint público de importación).
- **Planes y control de uso de IA**: planes `free (2 perfiles / 20 CVs, $0)`, `starter (10/150, $49)`, `pro (50/600, $149)`, `empresa (200/2000, $399)` en `src/plans.js` L4-9 (única fuente para front y API). Tabla `ai_usage` con tokens de entrada, caché escritura/lectura, salida y `cost_usd numeric(10,6)` (`0003_audit_fixes.sql` L45-59). Cálculo de costo por modelo `costUsd` (`api/_lib.js` L27-32). Cuota mensual para planes de pago; en plan gratis cuenta el total histórico y caduca a los 30 días (`api/_lib.js` L85-113). Rate limit por org (`api/_lib.js` L64-68) y por IP en memoria (L17-24).
- **Prueba gratis única por empresa**: `trial_status in ('ok','public_email','duplicate_domain','disposable')`, `trial_ends_at = now() + 30 días` (`0022_prueba_unica.sql` L8-9); función `email_domain_kind` (mismo archivo); lista de dominios en `src/emailDomains.js`. Plan solo modificable desde plataforma (`0023_plan_solo_plataforma.sql` L2).
- **Panel de superadministración** `/admin` para `platform_admins`: ver orgs, activar plan y prueba a mano (`src/pages/Admin.jsx`; RPCs `admin_orgs`, `admin_set_plan`, `admin_set_trial`, `is_platform_admin` en `0008_fase5_planes.sql`, `0024_admin_prueba.sql`).
- **Consentimiento Ley 81 de 2019 (Panamá)**: texto exacto en `api/apply.js` L7; se guarda `consent_at` + `consent_text` por candidato (`api/apply.js` L42; columnas en `0004_fase2_portal_candidatos.sql` L15-16). Para importados, texto distinto en `api/_import.js` L7.
- **Retención de datos de 2 años**: `RETENTION_YEARS = 2` (`api/apply.js` L8, L35) y `retention_until` (`0004…sql` L17, comentario "Ley 81: se borra al vencer"); borrado diario en `api/maintenance.js` L31-38.
- **Multi-organización con `current_org_id()`**: función `security definer` que devuelve la org del usuario (`0001_fase0_tenants.sql` L29-32); toda tabla de negocio lleva `org_id` y políticas RLS basadas en ella (`CLAUDE.md` L47; `README.md` L22). Nota: un usuario = una org (`0001…sql` L28).
- **Roles** `admin · recruiter · manager · viewer` en `org_members` (`CLAUDE.md` L47); invitaciones (`invitations` en `0001`); página `src/pages/Members.jsx`.
- **Avisos in-app y push**: tabla `notifications`; trigger `notify_push` → `push_call` (secreto desde Supabase Vault) → `net.http_post` a `/api/push-dispatch` (`0027_avisos.sql` L4-5, L62; `0029_recordatorios_robustos.sql` L7-8); envío a dispositivos con preferencias por tipo y limpieza de suscripciones 404/410 (`api/push-dispatch.js` L5, L21-40); crons `remind-interviews` y `retry-push` cada 5 min (`0027…sql` L56; `0029…sql` L70). UI: `src/pages/Notices.jsx`, `src/PushSettings.jsx`, `src/push.js`.
- **Rotación de personal**: `hired_at`, `salary_monthly`, `left_at`, `leave_reason` en applications y `settings` de costo por empresa (`0012_fase7_rotacion.sql` L2-11); tabla `hires`; recordatorios a los 3, 6 y 12 meses de cada contratación (`api/maintenance.js` L13-29); informe `src/TurnoverReport.jsx`, `src/turnover.js`, `src/pages/Reports.jsx`.
- **Inicio con gráficas** (`src/pages/Home.jsx`, `src/HomeCharts.jsx`, `src/charts.jsx`), **Ajustes** con marca del cliente (`src/pages/Settings.jsx`), **Ayuda** (`src/pages/Help.jsx`, `src/help.js`), celebración al contratar (`src/Confetti.jsx`).
- **Resiliencia PWA tras despliegues**: `lazyRetry` recarga una vez si un chunk no carga (`src/main.jsx` L8-13).

---

## 3. Funciones serverless y crons

Protección de crons: `CRON_SECRET` en header Authorization (`api/process-auto.js` L12; `api/maintenance.js` L5). Crons de Vercel (`vercel.json` L4-7): `process-auto` a las 06:30 UTC diario; `maintenance` a las 06:00 UTC diario (plan Hobby: máximo dos crons diarios, `README.md` L33).

| Endpoint | Trigger | Qué hace | Fuente |
|---|---|---|---|
| `api/apply.js` | POST público desde `/postular/:slug` | Valida honeypot, nombre, correo, consentimiento, slug; límite 10/h por IP; Turnstile; verifica que la vacante esté publicada y que el PDF esté en `org/incoming/`; upsert de candidato (por `org_id,email`) con consentimiento y retención a 2 años; inserta postulación (409 si ya existe); mueve el PDF; responde 200; correo de acuse; si hay cupo, extrae y evalúa en segundo plano con `waitUntil` | L11-76 |
| `api/upload-url.js` | POST público | Entrega URL firmada de Supabase Storage para subir el PDF directo (límite 20/h por IP) | L5-19 |
| `api/_extract.js` (interno) | llamado por apply / process-* | Descarga PDF, lo manda a Claude como `document` base64 con JSON schema, guarda `extracted`, área/senioridad, marca `done/failed`, registra `ai_usage` | L54-96 |
| `api/_screen.js` (interno) | llamado tras extraer | Evalúa contra perfil y criterios; calcula puntaje ponderado; guarda análisis; avisa (campana + correo) si `avanzar` | L86-113 |
| `api/suggest-bank.js` | POST autenticado (admin/recruiter), al publicar | Sugerencias del banco con IA (ver §2) | L81-91 |
| `api/profile-draft.js` | POST autenticado (admin/recruiter/manager) | Redacta perfil + publicación + criterios; avisa al equipo la primera vez | L85-110 |
| `api/requisition.js` | POST autenticado | Crea enlace de requisición y envía invitación | L8-33 |
| `api/requisition-submit.js` | POST público (token) | Guarda requisición, crea vacante, redacta perfil en segundo plano, avisa | L9-70 |
| `api/process-pending.js` | POST autenticado; disparado por `autoProcess` al abrir inicio/vacante (máx. 1 vez cada 10 min) o botón manual | Cola en Postgres: reclama con `claim_extraction`/`claim_screening` (`for update skip locked`, reintento ≤3, procesos colgados >5 min) hasta 110 s | L5-28; `src/api.js` L3-11; `0004…sql` L81-95 |
| `api/process-auto.js` | Cron diario 06:30 UTC | Red de seguridad: reprocesa pendientes de todas las orgs (máx. 5 por org y pasada, presupuesto 240 s) y genera perfiles de requisiciones atascadas | L7-51 |
| `api/maintenance.js` | Cron diario 06:00 UTC | Cancela enlaces de requisición vencidos; recordatorios 3/6/12 meses de contratados; borra candidatos con `retention_until` vencida y sus PDFs (hasta 500 por corrida); borra subidas huérfanas >24 h y PDFs sin postulación | L4-57 |
| `api/message.js` | POST autenticado | Mensaje por plantilla: correo o enlace WhatsApp; límite 30/min por org | L10-38 |
| `api/notify-closed.js` | POST autenticado (admin/recruiter) | Cierra vacante, descarta activos y envía cierre cortés | L8-43 |
| `api/push-dispatch.js` | Llamado por trigger de BD con `PUSH_SECRET` | Envía web push a los dispositivos del usuario | L11-43 |
| Crons en Postgres (`pg_cron`) | cada 5 min | `remind-interviews` (recordatorio de entrevistas) y `retry-push` (reintenta avisos sin `pushed_at` entre 2 y 60 min) | `0027_avisos.sql` L56; `0029_recordatorios_robustos.sql` L52, L70 |

---

## 4. Flujo completo de una postulación (tal como está en el código)

1. **RRHH publica la vacante** → `job_profiles.status = 'published'`, trigger fija `published_at`; la app llama `suggest-bank` para proponer candidatos del banco (`src/pages/Vacancy.jsx` L95-100; `0007…sql` L19-26). La vacante queda con `slug` y enlace `/postular/<slug>` (+ QR).
2. **El candidato abre `/postular/:slug`**: la página lee título, texto de publicación, nombre y marca de la empresa con la RPC anónima `public_job` (solo vacantes publicadas) (`src/pages/Apply.jsx` L36; `0004…sql` L71-78).
3. **Sube el PDF directo a Storage**: `api/upload-url` crea una URL firmada en `org/incoming/<uuid>.pdf`; el navegador usa `uploadToSignedUrl` (`src/pages/Apply.jsx` L45-46; `api/upload-url.js` L15-17).
4. **Envía el formulario** (nombre, correo, teléfono, LinkedIn opcionales, casilla de consentimiento Ley 81, Turnstile invisible, `?src=` de origen) → `api/apply` (`src/pages/Apply.jsx` L58-67).
5. **`api/apply` valida y registra**: honeypot, campos, consentimiento obligatorio, límite por IP, Turnstile; comprueba que el archivo exista; upsert de `candidates` con `consent_at`, `consent_text`, `retention_until = hoy + 2 años`; inserta `applications` (`status 'new'`, `extraction_status 'pending'`); mueve el PDF a `org/<app_id>.pdf`; responde `{ok:true}` (`api/apply.js` L16-61).
6. **Correo de acuse al candidato** en segundo plano ("Recibimos tu hoja de vida para …") (`api/apply.js` L62; `api/_mail.js` L42-51).
7. **Cuota**: si la org agotó su plan, la postulación queda guardada en cola con `extraction_error` explicativo; nunca se pierde (`api/apply.js` L65-68).
8. **Extracción en segundo plano** (`waitUntil`): `extraction_status = 'processing'`; Claude lee el PDF y devuelve JSON estructurado; se guarda en `candidates.extracted` + área/senioridad; `extraction_status = 'done'`; fila en `ai_usage` (`api/apply.js` L70-72; `api/_extract.js` L54-96).
9. **Screening encadenado**: `screening_status = 'processing'`; se envía el CV sin nombre ni contacto + perfil, criterios y contexto de la requisición; el modelo devuelve 3 puntajes, criterios con evidencia, alertas, preguntas de entrevista y recomendación; el sistema calcula el total con los pesos de la vacante; `screening_status = 'done'`, `screened_at` (`api/apply.js` L73-74; `api/_screen.js` L50-93).
10. **Aviso al equipo si la recomendación es `avanzar`**: campana (`notifications`) a admins/reclutadores/creador y correo con enlace `/vacantes/<id>?app=<id>#ranking`; el trigger `notify_push` dispara el web push al móvil (`api/_screen.js` L100-106; `0027_avisos.sql`; `api/push-dispatch.js`).
11. **Si algo falla o se agota el tiempo**: la cola lo recupera: `autoProcess` al abrir la app (≤1 vez/10 min), botón manual "procesar pendientes", o el cron diario `process-auto`; `claim_*` reintenta hasta 3 veces y rescata procesos colgados >5 min (`src/api.js` L3-11; `api/process-pending.js`; `api/process-auto.js`; `0004…sql` L81-93).
12. **RRHH abre la vacante y ve el ranking** ordenado por puntaje (descartados al final), con filtros por recomendación y etapa (`src/pages/Vacancy.jsx` L174-177; `src/RankingCard.jsx`).
13. **RRHH decide**: abre la hoja del candidato, mueve de etapa (`shortlist → interview → offer → hired`) o descarta con motivo; al contratar pide fecha de ingreso y celebra; los sugeridos del banco que se incluyen entran a la cola de evaluación recién ahí (`src/pages/Vacancy.jsx` L138-150; `src/RankingCard.jsx` L201-222; `src/CandidateSheet.jsx` L185-203).
14. **Entrevista**: programa entrevistas, usa el modo entrevista con las preguntas por rasgo del perfil y llena el scorecard; comenta con menciones; envía mensajes por plantilla (correo/WhatsApp) (`src/ApplicationPanel.jsx`; `src/pages/InterviewMode.jsx`; `api/message.js`).
15. **Cierre**: al cerrar la vacante, los activos quedan `rejected` con "Vacante cerrada" y reciben cierre cortés (`api/notify-closed.js`). Los contratados pasan al seguimiento de rotación con recordatorios a 3/6/12 meses (`api/maintenance.js` L13-29).
16. **Fin de vida del dato**: a los 2 años `maintenance` borra candidato y PDFs (`api/maintenance.js` L31-38).

---

## 5. Seguridad y cumplimiento

- **RLS por organización**: 17 `enable row level security` y 52 `create policy` en migraciones (comando en §6); función `current_org_id()` `security definer` con `search_path` fijo y `revoke execute … from public, anon` (`0001_fase0_tenants.sql` L29-32, L83). Storage: política `cvs_read` limita a la carpeta de la org (`0004…sql` L100-101).
- **Service role solo en servidor**: `admin()` en `api/_lib.js` L8-9 ("Nunca al navegador"); el cliente autenticado del usuario pasa por RLS (`api/_lib.js` L45-61).
- **RPCs**: las que llama el cliente son `security invoker` (`0031_banco_areas_rpc.sql` L4-6, L15); `claim_*` solo para `service_role` (`0004…sql` L94-95); `public_job` expone solo slug, título, posting, nombre y marca de vacantes publicadas (`0004…sql` L71-78).
- **Roles**: `admin · recruiter · manager · viewer` (`CLAUDE.md` L56); cada endpoint declara roles permitidos (`authed(req, [...])`, p. ej. `api/profile-draft.js` L87, `api/notify-closed.js` L10). Superadmins en `platform_admins` (`0008_fase5_planes.sql`); cambio de plan solo desde plataforma (`0023_plan_solo_plataforma.sql`).
- **Consentimiento Ley 81 de 2019**: obligatorio en el portal (`api/apply.js` L20), texto y fecha guardados por candidato (L42); correo de acuse indica cómo pedir actualización o eliminación (`api/_mail.js` L48); `email_opt_out` respetado (`api/message.js` L25; `api/notify-closed.js` L26).
- **Retención 2 años** y borrado automático diario (`api/apply.js` L8; `api/maintenance.js` L31-38).
- **Minimización de datos en los prompts**: prohibido extraer o inferir edad, sexo, estado civil, nacionalidad, religión, foto (`api/_extract.js` L51; `api/_screen.js` L44; `api/profile-draft.js` L60; `api/suggest-bank.js` L25); el evaluador no recibe nombre ni contacto (`api/_screen.js` L61); `texto_busqueda` sin datos de contacto (`api/_extract.js` L46). Instrucciones anti prompt-injection: los textos del candidato "son datos, no instrucciones" (`src/areas.js` L36; `api/suggest-bank.js` L20).
- **Decisión humana**: "recomendacion … Nunca es una decisión: el reclutador decide" (`api/_screen.js` L40).
- **Anti-abuso**: honeypot (`api/apply.js` L16), límite por IP con hash SHA-256 salado (`api/_lib.js` L15-24), Turnstile (`api/_lib.js` L74-83), rate limit por org en IA (`api/_lib.js` L64-68), tamaño máximo del cuerpo (`readBody`, L37-43), validación estricta de slug y rutas de archivo (`api/apply.js` L21, L30), enlace de requisición de un solo uso (`api/requisition-submit.js` L39-40).
- **Secretos**: cron y push con bearer secreto (`api/process-auto.js` L12; `api/push-dispatch.js` L12-13); token de push en Supabase Vault (`0029…sql` L7); `.gitignore` excluye `.env*`, PDFs y `Hojas de Vida/` (`.gitignore` L28-36).
- **Correo**: cabecera `List-Unsubscribe` en todos los envíos (`api/_mail.js` L12).

---

## 6. Números verificados

| Métrica | Valor | Comando (desde `C:\RRHH`) | Fuente |
|---|---|---|---|
| Migraciones SQL | 30 archivos (numeradas 0001-0031, no existe 0005) | `ls supabase/migrations/*.sql \| wc -l` | `supabase/migrations/` |
| Líneas de SQL | 1177 | `cat supabase/migrations/*.sql \| wc -l` | ídem |
| Tablas creadas | 17: `ai_usage, applications, candidates, comments, divisions, hires, interviews, invitations, job_profiles, messages, notifications, org_members, organizations, platform_admins, push_subscriptions, requisition_requests, scorecards` | `grep -ihoE 'create table (if not exists )?(public\.)?[a-z_]+' supabase/migrations/*.sql \| sort -u` | ídem |
| Funciones SQL distintas | 24 (`admin_orgs, admin_set_plan, admin_set_trial, applications_stage, bank_area_counts, bank_matches, can_see_job, claim_extraction, claim_screening, current_org_id, current_role, email_domain_kind, handle_new_user, is_platform_admin, job_profiles_dates, my_usage, notify_push, public_job, public_requisition, push_call, remind_interviews, retry_push, set_job_area, touch_updated`) | `grep -ihoE 'create (or replace )?function (public\.)?[a-z_]+' … \| sort -u \| wc -l` | ídem |
| Políticas RLS | 52 `create policy` | `grep -ihE '^\s*create policy' supabase/migrations/*.sql \| wc -l` | ídem |
| Tablas con RLS | 17 `enable row level security` | `grep -ihE 'enable row level security' … \| wc -l` | ídem |
| Triggers | 8 (`applications_stage, applications_touch, hires_touch, job_profiles_dates, job_profiles_touch, notifications_push, on_auth_user_created, scorecards_touch`) | `grep -ihoE 'create (or replace )?trigger [a-z_]+' … \| sort -u` | ídem |
| Crons Postgres | 2 (`remind-interviews`, `retry-push`, cada 5 min) | `grep -ih 'cron.schedule' supabase/migrations/*.sql` | `0027` L56, `0029` L70 |
| Crons Vercel | 2 (diarios) | `cat vercel.json` | `vercel.json` L4-7 |
| Endpoints públicos en `api/` | 12 (`apply, maintenance, message, notify-closed, process-auto, process-pending, profile-draft, push-dispatch, requisition, requisition-submit, suggest-bank, upload-url`) + 5 módulos internos `_*` | `ls api \| grep -v '^_' \| wc -l` | `api/` |
| Líneas en `api/` | 1127 | `cat api/*.js \| wc -l` | `api/` |
| Archivos en `src/` | 53 (16 páginas en `src/pages/`) | `find src -type f \| wc -l`; `ls src/pages \| wc -l` | `src/` |
| Líneas en `src/` | 4966 | `cat src/*.js src/*.jsx src/pages/*.jsx src/index.css \| wc -l` | `src/` |
| Rutas de la app | 18 `<Route>` (16 pantallas + layout + comodín; 3 públicas: `/login`, `/postular/:slug`, `/requisicion/:token`) | `grep -c '<Route ' src/main.jsx` → 18 | `src/main.jsx` L66-84 |
| Áreas / senioridades del banco | 14 / 4 | leer `src/areas.js` | L3-18, L24-29 |
| Planes | 4 (free, starter $49, pro $149, empresa $399) | leer `src/plans.js` | L4-9 |
| Modelos de IA con precio | 3 (`claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-4-5`) | leer `api/_lib.js` | L27 |
| Scripts de humo/utilidad | 9 archivos, 516 líneas (`smoke-apply, smoke-bank, smoke-draft, smoke-recover, smoke-requisition, compare-models, import-cvs, clasificar-areas, seed-demo`) | `ls scripts \| wc -l`; `cat scripts/*.mjs \| wc -l` | `scripts/` |
| Pruebas automatizadas | 0 (no hay script `test` en `package.json`; no hay runner) | `grep -c '"test"' package.json` → 0 | `package.json` |
| Commits | 132, del 2026-10-07 al 2026-10-11 | `git log --oneline \| wc -l`; `git log --format=%ad --date=short` | `.git` |
| Iconos PWA / splash iOS | 6 iconos en manifest; 10 imágenes de arranque | leer `vite.config.js` L47-54; `ls public/splash \| wc -l` | `public/` |

---

## 7. Lo que NO está construido o está a medias

- **Pasarela de pago**: el plan se activa a mano desde `/admin` ("La pasarela se conecta aquí cuando esté definida", `src/pages/Admin.jsx` L71; `README.md` L31).
- **Pruebas automatizadas**: ninguna; solo scripts de humo que gastan llamadas reales (`package.json`; `CLAUDE.md` L69).
- **Límite por IP en memoria de la instancia**, no persistente ("si aparece abuso real, mover a una tabla", `api/_lib.js` L17).
- **Un usuario = una organización** (sin cambio de org activa) (`0001_fase0_tenants.sql` L28).
- **Importación de CVs solo por script** con service role (`scripts/import-cvs.mjs`); no hay pantalla ni endpoint de importación masiva.
- **Correo y Turnstile opcionales por configuración**: sin `RESEND_API_KEY` los correos se "saltan" y la UI avisa que "el envío de correo se activa al configurar Resend" (`api/_mail.js` L6; `src/pages/Vacancy.jsx` L107); sin `TURNSTILE_SECRET` no se exige verificación (`api/_lib.js` L76).
- **WhatsApp no envía**: la app abre `wa.me` con el texto y la persona confirma el envío (`api/message.js` L33).
- **Crons de Vercel limitados a diarios (plan Hobby)**; `waitUntil` es "mejor esfuerzo", de ahí la cola y `process-auto` como red de seguridad (`api/process-auto.js` L9, L32).
- **Discrepancia doc/código**: `CLAUDE.md` L62 dice screening con `claude-opus-5-5`; el código usa `claude-sonnet-5-5` desde 2026-10-09 (`api/_screen.js` L5-7).
- **Edge Functions de Supabase**: no hay carpeta `supabase/functions`; toda la lógica de servidor vive en `api/` de Vercel.

---

## 8. Logos y branding (rutas)

- Icono PWA maskable (navy `#0f172a` a sangre, anillo `#38bdf8` al 72 %, punto blanco): `public/icon.svg`; variantes: `public/icon-any.svg`, `public/icon-192.png`, `public/icon-512.png`, `public/icon-any-192.png`, `public/icon-any-512.png`, `public/apple-touch-icon.png`, `public/badge-96.png`; pantallas de arranque iOS: `public/splash/*.png` (10).
- Componente de logo (anillo de compatibilidad detenido en 72 % + palabra "tino" en Onest 800, letter-spacing −0.04em; 5 tonos `light/dark/mono/white/muted`): `src/Logo.jsx` L1-32.
- Sistema de marca completo: `Branding/Tino Sistema de Marca.html` (usa Onest, `#0f172a`, `#0369a1`, `#38bdf8`). Flyer: `Branding/flyer_comercial.html`, `Flyer_comercial.pdf`. Bocetos de pantallas: `Branding/*-boceto*.html`. Logo de Nexera: `Branding/nexera-logo.png`.
- Tokens de color de la app (`src/index.css` L3-15): `brand #0f172a`, `accent #0369a1`, `accent-soft #e0f2fe`, `success #15803d`, `warning #b45309`, `danger #b91c1c`; fuente `Onest`.
- Manifest: `theme_color #0f172a`, `background_color #f8fafc` (`vite.config.js` L41-42).
- Sitio público (Astro): `site/src/components/Logo.astro`, `site/src/styles/global.css`, `site/public/`.
- Videos de lanzamiento (HyperFrames): `videos/` (renders no versionados).
