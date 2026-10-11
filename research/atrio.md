# Atrio — ficha de hechos verificables

Repo: `C:\dev-PH` (rama `main`, 242 commits entre 2026-06-15 y 2026-08-12 — `git log --oneline | wc -l`, `git log --format=%ad --date=short`).
Producto: SaaS multi-tenant de administración de Propiedad Horizontal (Panamá). Fabricante: Nexera. Marca «Atrio» (`src/lib/brand.ts`; CLAUDE.md:10).
Nota metodológica: **el SQL no vive en el repo** (no hay `supabase/migrations`; `find . -name "*.sql"` fuera de node_modules = 0). El esquema se verifica con los tipos generados `src/lib/supabase/database.types.ts`; las afirmaciones sobre RLS/triggers/pg_cron provienen de `CLAUDE.md`/`PENDIENTES.md` (bitácora del proyecto) y de las llamadas `.rpc()` en el código. Se marca cada caso.

---

## 1. Stack exacto

| Pieza | Versión / detalle | Fuente |
|---|---|---|
| Next.js | `^16.3.0` (App Router, `src/proxy.ts` reemplaza a middleware) | `package.json`; `src/proxy.ts:4-5` |
| React | `19.2.4` | `package.json` |
| Supabase | `@supabase/supabase-js ^2.108.1`, `@supabase/ssr ^0.12.0` (Postgres 17, Storage, Realtime) | `package.json`; CLAUDE.md:8 |
| Tailwind | `^4` (`@tailwindcss/postcss`) | `package.json` |
| PDF | `@react-pdf/renderer ^4.5.1` — 24 archivos lo importan | `package.json`; `grep -rl "@react-pdf/renderer" src \| wc -l` |
| Imagen OG / PNG | `next/og` (flyer PNG + apple-icon) | `src/app/app/comunicados/[announcementId]/imagen/route.tsx`, `src/app/apple-icon.tsx` |
| QR | `qrcode ^1.5.4` (server-side) | `package.json`; CLAUDE.md:26 |
| Markdown | `react-markdown ^10.1.0` + `remark-gfm ^4.0.1` (respuestas del asistente) | `package.json`; CLAUDE.md:51 |
| Toasts / iconos | `sonner ^2.0.7`, `lucide-react ^1.18.0` | `package.json` |
| Capacitor | `@capacitor/core ^8.4.1`, `android ^8.4.1`, `app`, `barcode-scanner ^3.0.2`, `keyboard`, `splash-screen`, `status-bar`; push `@capacitor-firebase/messaging ^8.3.0`. Modo `server.url` → `https://app.atrioph.net`; appId `io.nexerai.atrioph` | `package.json`; `capacitor.config.ts:18-31` |
| IA | API de Anthropic vía `fetch` (sin SDK), modelo `ANTHROPIC_MODEL \|\| "claude-opus-4-8"`, structured outputs (`output_config.format=json_schema`) | `src/lib/ai.ts:3-5,55-64`; `src/lib/assistant.ts:6-7,409` |
| Email | Resend vía `fetch` al endpoint batch `https://api.resend.com/emails/batch`, remitente `comunicados@atrioph.net` | `src/lib/email.ts:3-4,76-125` |
| Push | FCM HTTP v1 (OAuth2 JWT RS256 firmado con `node:crypto`), un solo canal para iOS+Android | `src/lib/push.ts:7-10,45-80` |
| WhatsApp | enlaces `wa.me` (sin API Business) | `src/lib/whatsapp.ts:1-3` |
| Pagos | Yappy (Banco General) — andamiaje; ver §9 | `src/lib/yappy.ts`; `instrucciones-yappy.md` |
| Cron | `pg_cron` en la BD (no hay `vercel.json` ni Edge Functions) | CLAUDE.md:20,29,42; `ls supabase` = no existe |
| Pruebas | `playwright ^1.62.1` (dev-dep) para capturas/smoke; **0 archivos `*.test.*`/`*.spec.*`** | `package.json`; `find . -name "*.test.*" -o -name "*.spec.*"` = 0 |
| Video promo | Remotion `@remotion/cli 4.0.448` (proyecto `video/`, excluido del tsconfig) | `video/package.json:11`; CLAUDE.md:63 |
| Mapas | **no hay** librería de mapas | `package.json` |

---

## 2. Módulos construidos (por audiencia / dominio)

### Staff `/app` — 63 páginas (`find src/app/app -name page.tsx | wc -l`)
Navegación agrupada en `src/components/app-shell.tsx:66-107` (grupos: Administración · Operaciones · Seguridad y accesos · Servicios al propietario).

**Administración**
- Asistente IA (12 herramientas, solo lectura, RLS-scoped) — `src/app/app/asistente/page.tsx`, `src/lib/assistant.ts`
- Edificios/Propietarios (padrón: edificio→piso→unidad→propietarios, inquilino, estacionamientos/depósitos; importador CSV `import_padron`) — `src/app/app/edificios/**`, `src/app/app/propietarios/**`
- Contabilidad (ciclo completo): estado de resultados + balance, catálogo 5 dígitos, libro diario, libro mayor, cierre con folio correlativo y storno, apertura contable (wizard 5 pasos), cobros y cuotas, derramas, pagos a proveedores, CxP a crédito, conciliación bancaria CSV, fondo de imprevistos, CSS/SIPE, cesantía, ISR→DGI, presupuesto vs real, auditoría, exportables DGI (Informe 03 CSV + Declaración Jurada) — `src/app/app/contabilidad/{page,cuentas,diario,mayor,cierre,apertura,cobros,gastos,cxp,conciliacion,fondo,css,cesantia,isr,presupuesto,auditoria,dgi}/`, `src/lib/{ledger,ledger-books,accounting,budget,dgi,reconciliation,statement}.ts`
- Planilla por período (ordinaria/XIII, auto-generación de quincenas, dos pasos causación→desembolso, comprobante PDF, recibo PDF por empleado) — `src/app/app/planilla/**`, `src/lib/payroll/{engine,rules,run}.ts`
- RRHH (ficha, foto/contrato en bucket, salario con historial, amonestaciones, baja/reactivar, calculadora de liquidación + carta PDF) — `src/app/app/rrhh/**`, `src/components/rrhh/` (12 archivos)
- Reportes a la Junta Directiva (PDF: novedades+quejas+anomalías por rango) — `src/app/app/reportes/jd/route.ts`

**Operaciones**
- Mantenimiento (equipos, cronograma, historial) — `src/app/app/mantenimiento/**`
- Anomalías con fotos (signed URLs) — `src/app/app/anomalias/**`
- Proveedores (catálogo del tenant) — `src/app/app/proveedores/page.tsx`
- Proyectos / transparencia del gasto (cotizaciones, adjudicación con justificación, cronograma + historial de avance) — `src/app/app/proyectos/**`, `src/components/proyectos/project-progress.tsx`
- Limpieza por QR (módulo pago, rol `limpieza`, semáforo por punto, hoja de QR imprimible) — `src/app/app/limpieza/{page,qr,[pointId],registrar/[pointId]}/`, `src/lib/cleaning.ts`

**Seguridad y accesos (módulo pago `accesos`)**
- Pases de visita (QR, WhatsApp, pase público tipo boarding pass `/pase/[id]`) — `src/app/app/accesos/**`, `src/app/pase/[id]/page.tsx`
- Garita (validar pase, entrada/salida con foto/placa, walk-in; escáner QR nativo) — `src/app/app/garita/page.tsx`, `src/lib/native.ts:30-48`
- Paquetería — `src/app/app/paqueteria/page.tsx`
- Emergencias / SOS (consola realtime) — `src/app/app/emergencias/page.tsx`, `src/components/access/emergency-console.tsx`
- Citófono digital (guardia→residente, autoriza/rechaza) — `src/components/access/intercom-*.tsx`, `src/lib/intercom.ts`

**Servicios al propietario**
- Comunicados (redacción IA + correo + flyer PDF + imagen PNG + acuse de visto) — `src/app/app/comunicados/**`
- Decisiones de Junta Directiva (PDF + acuse por residente) — `src/app/app/decisiones/**`
- Reservas de áreas (calendario, bloqueo por morosidad, reglamento con aceptación congelada, dashboard de uso) — `src/app/app/reservas/{page,dashboard}/`, `src/lib/reservas*.ts`
- Votaciones por unidad (Ley 284, acta inmutable PDF) — `src/app/app/votaciones/**`, `src/lib/votations*.ts`, `src/lib/votacion-acta.ts`
- Quejas/solicitudes (hilo bidireccional) — `src/app/app/quejas/**`, `src/lib/tickets*.ts`
- Paz y salvo como trámite gestionado — `src/app/app/paz-y-salvo/page.tsx`, `src/lib/paz-salvo.ts`
- Sanciones (multa genera cargo; PDF) — `src/app/app/sanciones/**`, `src/lib/sanctions.ts`
- Configuración (identidad del PH: logo+color; equipo del PH; pagos en línea Yappy; voz del PH) — `src/app/app/configuracion/page.tsx`, `src/components/configuracion/`
- Centro de notificaciones (campanita con sonido) — `src/components/notifications/`
- Onboarding: bienvenida → checklist 4/5 pasos → celebración — `src/components/app/onboarding-{welcome,checklist,complete}.tsx`, `src/lib/onboarding.ts`

### Portal del residente `/portal` — 23 páginas
Hubs: Inicio · Transparencia · Accesos · Comunidad · Más (`src/components/portal/hub.tsx`).
- Inicio (tablero de atención + saldo + SOS + comunicados + banner patrocinado) — `src/app/portal/page.tsx`, `src/components/portal/ad-banner.tsx`
- Estado de cuenta + PDF + recibo de pago PDF — `src/app/portal/unidades/[unitId]/{page.tsx,pdf/route.ts}`, `src/app/recibo/pago/[paymentId]/route.ts`
- Transparencia: contabilidad del PH (ingresos/egresos, nómina como un total), proyectos, decisiones JD — `src/app/portal/{finanzas,proyectos,decisiones,transparencia}/`
- Accesos (crear pases), paquetes, citófono, SOS (hold 2 s) — `src/app/portal/{accesos,paquetes,citofono,sos}/`
- Comunidad: reservas, votaciones (+acta), quejas, comunicados, directorio de proveedores del hogar con reseñas, «A domicilio» — `src/app/portal/{reservas,votaciones,quejas,comunidados,proveedores,a-domicilio,comunidad}/`
- Más: atajos, borrado de cuenta in-app — `src/app/portal/mas/page.tsx`, `src/components/portal/delete-account.tsx`
- Pago Yappy (botón) — `src/components/portal/pay-with-yappy.tsx`, `src/app/portal/pagos/`

### Panel de plataforma Nexera `/admin` — 4 páginas
Suscriptores (alta de org + admin, módulos por org, vincular usuario existente, eliminar suscriptor con purga), Proveedores (directorio global), Publicidad (campañas cross-tenant) — `src/app/admin/{page,suscriptores,proveedores,publicidad}/page.tsx`, `src/components/admin/`.

### Páginas públicas
`/login`, `/onboarding`, `/cambiar-clave`, `/baja` (unsubscribe), `/pase/[id]` — `src/app/{login,onboarding,cambiar-clave,baja,pase}/`.

### PDFs (11 documentos + kit)
`src/components/pdf/`: `statement-pdf` (estado de cuenta), `paz-salvo-pdf`, `jd-report-pdf`, `infraction-pdf`, `announcement-flyer-pdf`, `acta-votacion-pdf`, `payment-receipt-pdf`, `payslip-pdf`, `liquidation-letter-pdf`, `payroll-disbursement-pdf`, `accounting-report-pdf`; kit `_kit.tsx` (`ls src/components/pdf`).

---

## 3. Integraciones externas

| Integración | Estado | Ruta |
|---|---|---|
| Anthropic (redacción de comunicados, structured outputs, anti-inyección `<tema>`/`<ejemplo>`) | Construido; requiere `ANTHROPIC_API_KEY` en prod | `src/lib/ai.ts` |
| Anthropic (asistente con tool use, loop máx. 6 iteraciones, 12 herramientas) | Construido; requiere llave | `src/lib/assistant.ts:42-341,409` |
| Resend (comunicados por correo, 1 correo por destinatario, lotes de 100, `List-Unsubscribe`, reply-to del admin) | Construido; requiere `RESEND_API_KEY` | `src/lib/email.ts:76-125` |
| FCM push (iOS+Android) — se dispara en: comunicado, paquete recibido, citófono, SOS residente→guardia, SOS guardia→admin | Construido; requiere `FCM_SERVICE_ACCOUNT` | `src/lib/push.ts`; usos: `src/app/app/comunicados/actions.ts:74,194`, `src/app/app/paqueteria/actions.ts:57`, `src/app/app/accesos/intercom-actions.ts:86`, `src/app/portal/sos/actions.ts:77`, `src/app/app/accesos/panic-actions.ts:49` |
| Registro de token nativo (Capacitor Firebase Messaging → RPC `register_device_token`) | Construido | `src/lib/native-push.ts`, `src/app/portal/push-actions.ts` |
| Escáner QR nativo (Capacitor barcode-scanner) | Construido | `src/lib/native.ts:30-48` |
| Yappy (Banco General) | **Andamiaje**: `createYappyOrder` devuelve `{ready:false}`; retorno + RPC `confirm_yappy_payment` existen | `src/lib/yappy.ts:43-51`; `src/app/portal/pagos/yappy/route.ts` |
| WhatsApp | enlaces `wa.me` prellenados (pases, contacto) | `src/lib/whatsapp.ts` |
| Supabase Realtime | 7 canales: pánico (4), citófono (3) + fallback de polling | `grep -rn "\.channel(" src` → `src/components/access/{panic-*,intercom-*,emergency-console}.tsx` |
| Supabase Storage | buckets `ph-photos`, `ph-docs`, `ph-proyectos`, `ph-ads`; 12 usos de `createSignedUrl` | `grep -rho '\.from("ph-[a-z]*")' src`; `grep -rho createSignedUrl src \| wc -l` |

---

## 4. Seguridad

Hechos verificables en el repo:
- Guard de rutas en `src/proxy.ts:14-16,45-55`: `/app`, `/portal`, `/admin` redirigen a `/login` sin sesión; falla seguro (catch → `/login`).
- 62 RPCs expuestos en los tipos generados (sección `Functions`), 62 distintos invocados con `.rpc(` desde el código — `awk` sobre `database.types.ts`; `grep -rho '\.rpc("[a-z_]*"' src | sort -u | wc -l`.
- Roles de org (enum `org_role`): `owner | administrador | asistente | guardia | limpieza` — `database.types.ts` (sección Enums).
- Tablas de catálogo legal (`countries`, `legal_rule_sets`, `contribution_rates`, `tax_brackets`, `legal_constants`) y `platform_admins`, `organization_modules`, `audit_log`, `accounting_periods`, `email_unsubscribes` existen — lista de tablas en `database.types.ts`.
- Acciones de servidor verifican rol antes de actuar (`canManage(ctx.role)`), p. ej. `src/app/app/comunicados/actions.ts:159`.
- Asistente IA corre con la sesión del admin (RLS lo acota al PH) — `src/lib/assistant.ts` + CLAUDE.md:36.

Afirmaciones documentadas en la bitácora (SQL no está en repo; fuente = CLAUDE.md / PENDIENTES.md):
- RLS deny-by-default en todas las tablas; helpers `is_org_member`, `has_org_role`, `is_unit_resident`, `is_building_resident`, `is_org_resident`, `is_platform_admin`, `has_module` — CLAUDE.md:13-16,26.
- RPCs `SECURITY DEFINER` con `search_path` fijo, grant solo a `authenticated`, auto-autorizados; revocados de PUBLIC/anon — CLAUDE.md:16,38,52.
- FKs compuestas `(building_id/unit_id, organization_id)` para integridad cross-tenant — CLAUDE.md:16.
- Libro mayor inmutable por usuario (sin políticas UPDATE, grants revocados, constraint deferred de cuadre, índice único por origen) — PENDIENTES.md:113, sección «Blindaje».
- Audit trail append-only `audit_log` + candado de período cerrado `fn_period_guard` — PENDIENTES.md (bloque «HECHO hoy (Ola 1 + blindaje)»).
- Compuerta de registro: trigger `trg_enforce_signup_allowlist` BEFORE INSERT en `auth.users` (solo correos del padrón) — CLAUDE.md:39.
- Secretos en Supabase Vault (HMAC de unsubscribe, secret Yappy) — CLAUDE.md:35; `instrucciones-yappy.md` §2.
- Purga total por tenant (`platform_delete_org`) verificada con cero residuos — CLAUDE.md:54.
- Auditorías «3-agentes» (arquitectura · bugs/seguridad · contable-legal) por fase — CLAUDE.md:18,52,63.

---

## 5. Números verificados

| Métrica | Valor | Comando | Fuente |
|---|---|---|---|
| Commits | 242 (2026-06-15 → 2026-08-12) | `git log --oneline \| wc -l`; `git log --format=%ad --date=short` | `.git` |
| Tablas (tipos generados) | 86 | `awk` sobre sección `Tables` + `grep -c "^        Row: {"` | `src/lib/supabase/database.types.ts` |
| Vistas | 0 | idem (sección `Views`) | idem |
| RPCs/Functions expuestas | 62 | `awk` sobre sección `Functions` | idem |
| Enums | 42 | conteo líneas sección `Enums` | idem |
| Páginas (`page.tsx`) | 96 (63 `/app`, 23 `/portal`, 4 `/admin`, 6 raíz) | `find src/app -name page.tsx \| wc -l` | `src/app` |
| Route handlers (`route.ts(x)`) | 16 (PDF/CSV/PNG/retorno Yappy) | `find src/app -name "route.ts*" \| wc -l` | `src/app` |
| Archivos `"use server"` / funciones async exportadas | 50 / 152 | `grep -rl '"use server"' src \| wc -l`; `grep -rh "^export async function" …` | `src` |
| Archivos TS/TSX / líneas | 386 / 45,535 | `find src -name "*.ts*" \| wc -l`; `cat … \| wc -l` | `src` |
| Componentes | 161 (forms 33, portal 18, access 15, contabilidad 15, pdf 12, rrhh 12) | `find src/components -type f \| wc -l` | `src/components` |
| Librerías de dominio en `src/lib` | 54 archivos | `find src/lib -type f \| wc -l` | `src/lib` |
| Documentos PDF | 11 (+ kit) | `ls src/components/pdf` | `src/components/pdf` |
| Herramientas del asistente IA | 12 | `grep -c '^\s*name: "' src/lib/assistant.ts` | `src/lib/assistant.ts:42-341` |
| Canales Realtime | 7 | `grep -rn "\.channel(" src` | `src/components/access/` |
| Buckets de Storage usados | 4 | `grep -rho '\.from("ph-[a-z]*")' src \| sort -u` | `src` |
| Scripts de captura Playwright | 10 `.mjs` | `ls scripts/capturas` | `scripts/capturas/` |
| Archivos de pruebas unitarias | 0 | `find … -name "*.test.*" -o -name "*.spec.*"` | repo |
| Migraciones / Edge Functions en repo | 0 / 0 (esquema fuera del repo) | `find . -name "*.sql"`; `ls supabase` | repo |
| Categorías de servicio sembradas (directorio del hogar) | 11 | CLAUDE.md:37 (no verificable en repo) | CLAUDE.md |

---

## 6. Automatizaciones y crons

No hay `vercel.json` ni Edge Functions; todo corre en Postgres (`pg_cron`) o al abrir pantallas. Fuente: bitácora (no hay SQL en repo).

| Automatización | Cuándo | Qué hace | Fuente |
|---|---|---|---|
| `generate-monthly-charges` → `generate_all_monthly_charges()` | día 1 de cada mes (`pg_cron`) | genera las cuotas de mantenimiento de todos los edificios con `fee_settings`; idempotente | CLAUDE.md:20 |
| `generate_late_fees()` | diario (`pg_cron`) | crea el cargo «Recargo por morosidad X%» (10–20% configurable + día de corte); salta períodos cerrados | CLAUDE.md:42; PENDIENTES.md «4 cabos sueltos» |
| `sync-votation-status` + `freeze_votation_result` | cron | deriva fase abierta/cerrada por fechas y congela el acta (write-once) | CLAUDE.md:29 |
| Auto-generación de quincenas `ensureDuePayrollPeriods` | al abrir `/app/planilla` (no cron) | crea y procesa las quincenas vencidas (15 y último día), idempotente; el admin solo autoriza el pago | `src/lib/payroll/run.ts:204`; CLAUDE.md:42 |
| Auto-asientos contables por triggers | en cada cuota/pago/gasto/multa/recargo/planilla | asiento balanceado idempotente (`post_charge`, `post_payment`, `post_expense`, `post_payroll_period`…) | `database.types.ts` (Functions); CLAUDE.md:42 |
| Triggers de notificación al staff | al crear reserva pendiente / queja / respuesta / pago por un residente | insertan en `notifications`; se auto-marcan leídas al resolver | CLAUDE.md:30-31 |
| Trigger de rating | insert/update/delete de reseña | recalcula `rating_avg`/`rating_count` (`recompute_provider_rating`) | CLAUDE.md:37; `database.types.ts` |
| Polling de respaldo en cliente | cada 3–30 s | SOS (12 s), paquetes (30 s), notificaciones (25 s), reservas, decisiones | CLAUDE.md:28,30,31,58; `src/components/portal/{package,reservation,resolution}-watcher.tsx` |

---

## 7. Flujos (paso a paso, como están en el código)

### 7.1 Pago en línea Yappy (andamiaje)
1. Residente con saldo pulsa el botón (`src/components/portal/pay-with-yappy.tsx`; solo visible si `org_payment_settings.enabled`).
2. `startYappyPayment(unitId, amount)` valida unidad del residente y `getYappyConfig(orgId)` → `src/app/portal/pagos/actions.ts:15-27`.
3. `genOrderRef()` (`PH-` + 12 hex) y `createYappyOrder()` → **hoy devuelve `{ready:false, error:"Yappy aún no está conectado al sandbox."}`** → `src/lib/yappy.ts:30-51`.
4. (cuando esté conectado) inserta `payment_orders` y redirige a la URL de Yappy → `actions.ts:39-47`.
5. Retorno `GET /portal/pagos/yappy?orderId&status&confirmationNumber&hash` → RPC `confirm_yappy_payment` (valida HMAC con secret en Vault; si `status='E'` inserta en `payments`, idempotente) → redirige a `/portal/unidades/{unit}?pago=…` → `src/app/portal/pagos/yappy/route.ts:10-41`.
6. El trigger de `payments` genera el asiento DR Banco / CR Cuentas por cobrar → `instrucciones-yappy.md` §1-2.
Config por PH: Configuración → Pagos en línea (`set_yappy_config`) → `src/app/app/configuracion/actions.ts:48`.

### 7.2 Comunicado con IA + correo + push
1. Admin escribe 1–2 líneas → `draftWithAI(topic)` carga `communication_profiles` + últimos 3 comunicados → `draftAnnouncement()` (Anthropic, JSON schema `{asunto, cuerpo}`) → `src/app/app/comunicados/actions.ts:85-110`; `src/lib/ai.ts:19-105`.
2. Admin edita y publica → `createAndEmailAnnouncement` inserta `announcements` → `actions.ts:181-190`.
3. Push nativo a residentes (`sendPushToOrgResidents`, best-effort) → `actions.ts:194`.
4. Si `alsoEmail`: RPC `owner_emails_with_unsub` (pool con token HMAC, excluye bajas) → `sendAnnouncementEmail` (Resend batch, 1 email por destinatario, `List-Unsubscribe`, from = nombre del PH, reply-to = admin) → log `announcement_emails` → `actions.ts:203-215`; `src/lib/email.ts:76-125`.
5. Baja: `/baja?o&e&s` → `record_unsubscribe` verifica firma → `src/app/baja/page.tsx`; CLAUDE.md:35.
6. Residente ve el comunicado en `/portal`; acuse `announcement_reads` («Visto por N») → CLAUDE.md:21.

### 7.3 Pase de visita → garita
1. Staff o residente crea `visitor_passes` (tipo, vigencia, QR, usos) → `src/app/app/accesos/actions.ts`, `src/app/portal/accesos/`.
2. Se comparte por WhatsApp el link público `/pase/[id]` (RPC `public_pass`, anon, solo display) → `src/app/pase/[id]/page.tsx:36`.
3. Guardia valida código o escanea QR (`scanQrCode`, nativo) → pre-chequeo `canEnterNow` → RPC atómico `register_visit` (bitácora + consumo de uso + foto/placa) → `src/app/app/accesos/actions.ts:120-165`; `src/lib/native.ts:30-48`.

### 7.4 SOS / pánico
1. Residente mantiene presionado 2 s → `panic_alerts` + push al rol `guardia` → `src/app/portal/sos/actions.ts:77`.
2. Garita/staff reciben por Realtime (`panic-staff-{org}`, `panic-garita-{org}`) + sondeo cada 12 s → alarma sonora `playAlarm` + vibración → `src/components/access/panic-listener.tsx:76`; `src/lib/alert-sound.ts`.
3. Guardia→admin: push a `owner/administrador` → `src/app/app/accesos/panic-actions.ts:49`.
4. Resolver/cancelar libera el botón del residente (Realtime + sondeo 3 s) → `src/components/access/panic-button.tsx:42`.

### 7.5 Nómina → contabilidad (dos pasos)
1. Al abrir `/app/planilla` se crean/procesan las quincenas vencidas (`ensureDuePayrollPeriods`) → `src/lib/payroll/run.ts:204`.
2. Procesar = causación (DR Gasto de personal / CR 20150 Sueldos por pagar, ISR a 20165, provisión XIII 20180 y cesantía 20170) → CLAUDE.md:42; PENDIENTES.md «Ola 2».
3. «Registrar pago» = desembolso (DR 20150 / CR Banco) + comprobante PDF `/app/planilla/[id]/comprobante` → `src/app/app/planilla/[periodId]/comprobante/route.ts`.

---

## 8. Datos para «antes / después»

| Antes (proceso manual, según docs del repo) | Después en Atrio | Fuente |
|---|---|---|
| «WhatsApp, Excel, papeles, "?" de morosidad» | tablero con KPIs reales, libro que cuadra, residente viendo los mismos números | `video/GUION.md` (escenas S1, S3) |
| Cuotas generadas a mano cada mes | `pg_cron` día 1 genera todas las cuotas | CLAUDE.md:20 |
| Recargos por mora calculados a mano | `generate_late_fees()` diario | CLAUDE.md:42 |
| Planilla capturada por el admin | quincenas auto-generadas; el admin «solo revisa y autoriza el pago, no captura nada» | CLAUDE.md:42 |
| Asientos contables manuales | auto-posting por triggers de cada cuota/pago/gasto/planilla | CLAUDE.md:42 |
| Comunicado redactado y enviado uno por uno | 1–2 líneas → IA redacta → portal + correo a todos los propietarios | CLAUDE.md:34 |
| Padrón cargado unidad por unidad | importador CSV `import_padron` (hasta 2000 filas) | CLAUDE.md:55 |
| Paz y salvo en papel | trámite digital: residente solicita, admin imprime/firma/confirma | CLAUDE.md:61 |
| Libros oficiales en Excel | folio correlativo al cierre + storno; Informe 03 CSV para e-Tax | CLAUDE.md:42 |
| Limpieza «se hizo» sin evidencia | registro por QR con foto obligatoria y semáforo por punto | CLAUDE.md:62 |
| Conciliación bancaria manual | import CSV + matching monto+fecha±3 | CLAUDE.md:42 |

Resultados verificados citados en la bitácora: base $2,000 → neto $1,592.50; liquidación 7 años despido = $16,557.71 (E2E Playwright, CLAUDE.md:23); «el libro CUADRA (descuadre 0)» (CLAUDE.md:42).

---

## 9. Lo que NO está construido o está a medias (no afirmar)

- **Yappy no cobra**: `createYappyOrder` es stub; falta API real, hash canónico, webhook servidor-a-servidor, botón oficial — `src/lib/yappy.ts:43-51`; `instrucciones-yappy.md` §2 «Falta».
- **IA, correo y push requieren llaves en prod** (sin ellas la UI avisa «aún no activado»); `ANTHROPIC_API_KEY` comentada en local — CLAUDE.md:34,51; `src/lib/{ai,email,push}.ts`.
- **App móvil no publicada**: faltan cuentas Apple/Google (D-U-N-S), política de privacidad, biometría; solo proyecto Android generado — CLAUDE.md:46,90; `MOBILE-LAUNCH-PLAN.md`.
- **Sin pruebas unitarias** (0 archivos test); verificación = E2E manual/Playwright + auditorías de agentes.
- **Citófono sin voz** (solo digital: avisar/autorizar) — PENDIENTES.md «Citófono con VOZ».
- **Voto secreto no implementado** (columna `votations.secret` sin uso) — PENDIENTES.md «Voto secreto».
- **Accesos 9b/9c**: lista negra, pre-autorización, vehículos/mascotas — PENDIENTES.md «9b/9c restante».
- **Transferencia/ACH**: registro manual del pago (no automático); integración QuickBooks/Sage no hecha — PENDIENTES.md «Integraciones».
- **Rate-limit / control de costos de IA** diferido — CLAUDE.md:52,88.
- **Asistente Fase 2** (crear comunicados desde el chat, streaming) pendiente — CLAUDE.md:36.
- **Atrio Comercial** (vertical oficinas) solo roadmap — `ATRIO-COMERCIAL-ROADMAP.md`; CLAUDE.md:64.
- **Alerta de limpieza atrasada por campanita** (necesita cron) — CLAUDE.md:62.
- **Publicidad v2**: edición de campañas, geo-targeting, impresiones — PENDIENTES.md «Publicidad».
- **Retención ITBMS/ISR a proveedores**, QR de verificación en paz y salvo, asientos manuales — CLAUDE.md:42; PENDIENTES.md «Otros».
- **Contact-gating** del directorio y subida de logo/foto de reseña — CLAUDE.md:37.
- Sitio web `atrioph.net` pendiente — CLAUDE.md:91.

---

## 10. Branding, capturas y demo

- Guía de marca: `Branding/Atrio PH - Guia de Marca y Brief Web.md` (Azul Atrio `#2C5BCB`, símbolo «Prisma», wordmark «atrio.», slogan «One app. One community.»).
- Logos: `Branding/atrio-prisma-color.svg`, `atrio-prisma-blanco.svg`, `atrio-prisma-color-1024.png`, `atrio-prisma-blanco-1024.png`, `atrio-appicon.svg`, `atrio-appicon-1024.png`, `atrio-lockup-horizontal-color.png`, `atrio-lockup-horizontal-blanco.png`; en app: `public/atrio-lockup.png`, `public/atrio-prisma.svg`, `public/icons/{icon,maskable}.svg`, `src/app/icon.svg`.
- Fuentes: `assets/fonts/` (Cormorant Garamond para el flyer; Sora/Space Grotesk/JetBrains Mono en guía).
- Capturas de producto (recortes reales): `video/public/proj-{cotizaciones,ganadora,grafica,header}.png`, `video/public/lockup.png`.
- Scripts de captura Playwright (requieren dev server + demo): `scripts/capturas/*.mjs` + `scripts/capturas/README.md`.
- Video promocional Remotion (30 s, 1920×1080): `video/` (`GUION.md`, `src/`, `out/`).
- Tiendas: `Android-store/`, `Apple/`, `android/ATRIO-ANDROID.md`.
- Demo: org de muestra con datos sembrados (proyecto «Renovación de elevadores», 2 decisiones JD) — CLAUDE.md:60. No hay seeds SQL en el repo; credenciales del demo no se copian aquí.
- Docs comerciales: `Atrio PH vs Munily.docx`, `MODULO PH.docx`, `ATRIO-COMERCIAL-ROADMAP.md`, `instrucciones-comunicados-ia.md`, `instrucciones-yappy.md`.
