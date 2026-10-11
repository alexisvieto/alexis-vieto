# NexGuard360 — ficha de hechos verificables

Repo: `C:\dev-seguridad` (147 commits entre 2026-05-30 y 2026-06-03 — `git log --oneline | wc -l`, `git log --format=%ad --date=short`).
Producto: ERP multi-tenant SaaS para empresas de seguridad privada (Panamá/LATAM). Fabricante: Nexera. Producción declarada: `www.nexguard360.com` (CLAUDE.md «Deploy»).
Nota: `CLAUDE.md` dice «26 migraciones / 42+ tablas»; el repo tiene **35 migraciones y 45 tablas** (verificado abajo). Se usan los números verificados.

---

## 1. Stack exacto

| Pieza | Versión / detalle | Fuente |
|---|---|---|
| Next.js | `16.2.6` (App Router, TypeScript strict) | `package.json` |
| React | `19.2.4` | `package.json` |
| Supabase | `@supabase/supabase-js ^2.106.2`, `@supabase/ssr ^0.10.3`, CLI `supabase ^2.102.0` (dev) | `package.json` |
| Tailwind | `^4`, tema dark OLED lime `#84CC16` | `package.json`; CLAUDE.md «Estilos» |
| Validación | `zod ^4.4.3` — 62 `z.object(` en `src`, 13 archivos `schemas/` | `grep -rho 'z\.object(' src \| wc -l` |
| IA | `@anthropic-ai/sdk ^0.100.1`, modelo `claude-sonnet-4-20250514`, timeout 15 s | `src/lib/ai/refine-incident.ts:5-33`; `src/app/api/analytics/chat/route.ts:718` |
| Email | `resend ^6.12.4` (SDK) | `src/lib/email/send-email.ts` |
| Mapas | `leaflet ^1.9.4` (+ `react-leaflet ^5.0.0` instalado; el mapa importa `leaflet` directo) | `package.json`; `src/app/[tenant]/dashboard/flota/map.tsx:4-5` |
| Gráficos | `recharts ^3.8.1` | `package.json` |
| PDF | `@react-pdf/renderer ^4.5.1` | `package.json`; `src/lib/pdf/{styles,tenant-branding,report-number}.ts` |
| QR | `qrcode.react ^4.2.0` (QR por puesto) | `package.json` |
| Animación / iconos | `framer-motion ^12.40.0`, `lucide-react ^1.17.0` | `package.json` |
| Cron | Vercel Cron (`vercel.json`) — 1 job programado | `vercel.json` |
| Middleware | Edge, cero deps: solo parsea subdominio → rewrite `/[tenant]/…` | `middleware.ts:3-7,55-77` |
| Storage | bucket privado `hr-documents` (10 MB; pdf/jpeg/png/webp) + compresión client-side | `supabase/migrations/00010_create_storage_hr_documents.sql:1-9`; `src/lib/upload/compress-image.ts` |
| Scripts | `tsx` CLI: `admin-cli.ts`, `seed-tenant.ts`, `generate-demo-data.ts` | `package.json` (`admin-cli`); `scripts/` |
| Pruebas | **0 archivos `*.test.*`/`*.spec.*`**; sin framework de test en `package.json` | `find … -name "*.test.*" -o -name "*.spec.*"` |
| Capacitor / push nativo | **no hay** | `package.json` |
| Pagos (Stripe/Yappy) | **no hay** | `package.json`; CLAUDE.md «Pendientes» #5 |

---

## 2. Módulos construidos (por rol)

Sidebar con gating por rol: `src/app/[tenant]/sidebar.tsx:52-183`. Roles `owner | admin | editor | viewer` (`get_user_role_in_tenant`, `00001:109-121`). Módulos activables por tenant vía `tenants.settings.enabled_modules` (leído en `src/app/[tenant]/layout.tsx:57`, editado desde `/admin` → `src/app/api/admin/route.ts:56-88`).

### Gerente / operador (`owner`, `admin`) — `src/app/[tenant]/dashboard/`
- **Gerencial + IA Analytics** — `dashboard/page.tsx`; `api/analytics/chat/route.ts`
- **NOC Monitor** (3 estados verde/amarillo/rojo, Realtime `shifts-realtime` + `incidents-realtime`) — `dashboard/live-monitor/page.tsx:214,256`
- **Centro de Comando** (incidentes + tickets + daños, flujo con nota obligatoria y auditoría `alert_audit_log`) — `dashboard/executive/page.tsx`; `api/command-center/route.ts:8-14`; `api/dashboard/executive/route.ts`
- **Cambio de Turno** (reporte con narrativa por evento + PDF) — `dashboard/cambio-turno/page.tsx`; `api/shifts/change-report/{route,pdf/route}.ts`
- **Turnos** (asignaciones fijo/temporal/mensual) — `dashboard/turnos/page.tsx`; `api/shifts/assignments/route.ts`; migración `00020_create_shift_assignments.sql`
- **Consignas por puesto** — `dashboard/consignas/page.tsx`; `00018_create_station_consignas.sql`
- **Comercial** (clientes → contratos → propiedades → puestos → QR) — `dashboard/comercial/page.tsx`; `00019_create_commercial_module.sql`
- **Armamento** (inventario, armerías/ubicaciones, asignaciones con firma, permisos, acta PDF) — `dashboard/armamento/page.tsx`; `api/firearms/delivery-pdf/route.ts`; `00003`, `00026`
- **Inventario** (stock atómico `decrement_stock`/`increment_stock`, custodia por puesto, préstamos con firma + PDF) — `dashboard/inventario/page.tsx`; `api/inventory/loans-pdf/route.ts`; `00004`
- **Flota** (vehículos, GPS logs, violaciones de velocidad, inspecciones, mantenimiento por odómetro, mapa Leaflet) — `dashboard/flota/{page,map}.tsx`; `00006`, `00028`
- **RRHH** (perfiles, contratos, disciplinarios, vault de documentos, incapacidades, polígrafo/terminación, tipos de empleado, foto) — `dashboard/rrhh/page.tsx`; `00007`, `00009`, `00010`, `00017`, `00027`, `00029`, `00034`
- **Capacitaciones** (cursos, logs, requisitos por puesto, cumplimiento) — `dashboard/capacitaciones/page.tsx`; `00011_create_training_module.sql`
- **Planilla Operativa** — `dashboard/planilla-operativa/page.tsx`; `00031_operative_paysheet.sql`, `00033`
- **Nómina** (solo `owner`: períodos quincenales, motor, consolidado, archivo ACH) — `dashboard/nomina/{page,[periodId]/page}.tsx`; `src/lib/payroll/{engine,ach-generator}.ts`; `00013`
- **Configuración** del tenant — `dashboard/configuracion/page.tsx`; `api/tenant-config/route.ts`

### Agente (`editor`) — «Mi Puesto»
- Marcación QR + GPS, reporte de novedad por **voz** (`SpeechRecognition`), «acción tomada», consignas — `src/app/[tenant]/puesto/page.tsx:52-56,83,239-254`; `api/shift/clock-in/route.ts`; `api/incidents/report/route.ts`

### Cliente contratante (`viewer`) — Portal Cliente
- PQR/tickets y reportes de daños — `src/app/[tenant]/cliente/page.tsx`; `00012_create_client_service_module.sql`; `00035_add_client_admin_contact.sql`

### Super admin Nexera
- `/admin`: crear tenants/usuarios, activar módulos — `src/app/admin/page.tsx`; `api/admin/route.ts` (lista fija `SUPER_ADMIN_EMAILS`, service-role)
- CLI `npm run admin-cli create-tenant|create-user` — `scripts/admin-cli.ts`

### Sitio público (7 páginas)
`/` landing, `/producto` (14 módulos con capturas), `/precios`, `/sobre`, `/contacto`, `/terminos`, `/privacidad`, `/seguridad` + `opengraph-image`, `sitemap`, `robots` — `src/app/{page,producto,precios,sobre,contacto,terminos,privacidad,seguridad}`.

### Manual de usuario generado
`GET /api/manual?empresa=…` devuelve un manual HTML con marca por capítulo (47 KB de plantilla) — `src/app/api/manual/route.ts`.

### Capa de dominio
13 módulos en `src/modules/` (auth, client-service, documents, firearms, fleet, hr, incidents, inventory, payroll, properties, shifts, tenant, training) con `actions/components/hooks/schemas/services/types`; 15 archivos `services/` (`find src/modules -path '*/services/*' | wc -l`).

---

## 3. Integraciones externas

| Integración | Qué hace | Ruta |
|---|---|---|
| Anthropic — refinamiento de bitácora | texto rústico/dictado → informe técnico en 3.ª persona; no bloqueante (si falla se guarda `raw_text`) | `src/lib/ai/refine-incident.ts`; `src/app/api/incidents/report/route.ts:60-68` |
| Anthropic — analítica conversacional | clasificación por **keywords** (`classifyQuestion`) y, si hay `ANTHROPIC_API_KEY`, mejora con Claude (`max_tokens 300`, timeout 12 s) usando `MASTER_PROMPT`; luego ejecuta consultas predefinidas en 8 categorías (attendance, punctuality, fleet/CPK, payroll, hr, incidents, clients, inventory) | `src/app/api/analytics/chat/route.ts:710-770`; `master_prompt.ts` |
| Resend — reporte diario por correo | envía HTML a contactos de emergencia de cada propiedad | `src/lib/email/send-email.ts`; `src/app/api/cron/daily-reports/route.ts` |
| Webhook GPS (proveedor) | `POST /api/fleet/telemetry` con header `x-gps-auth-token` (comparación `timingSafeEqual`), batch hasta 500 puntos, Zod; registra `vehicle_gps_logs`, crea `geofence_violations` por >80 km/h y marca mantenimiento por odómetro | `src/app/api/fleet/telemetry/route.ts:6-28,31-40,130-150` |
| Supabase Realtime | 3 canales: `shifts-realtime`, `incidents-realtime`, `global-alerts-{tenant}` (INSERT en `incidents_log`, `*` en `shift_alerts`); publicación para 4 tablas | `src/app/[tenant]/realtime-alerts.tsx:81-111`; migraciones `00020,00022,00023` (`ALTER PUBLICATION supabase_realtime`) |
| Supabase Storage | bucket `hr-documents` con signed URLs | `src/lib/storage/signed-url.ts`; `00010` |
| Geolocalización del navegador | `navigator.geolocation` en marcación | `src/app/[tenant]/puesto/page.tsx:52-56` |
| Web Speech API | dictado de novedad | `puesto/page.tsx:239-254`; `src/shared/types/speech.d.ts` |
| Archivo ACH Panamá | genera CSV plano para transferencias masivas con validación de datos bancarios faltantes | `src/lib/payroll/ach-generator.ts`; uso en `dashboard/nomina/[periodId]/page.tsx:6` |
| Formulario de contacto | **no hay** `api/contact` (CLAUDE.md lo lista como pendiente) | `find src/app/api -name route.ts` |

---

## 4. Seguridad

| Hecho | Valor | Fuente |
|---|---|---|
| Tablas con `ENABLE ROW LEVEL SECURITY` | **45 de 45** | `grep -ih "enable row level security" supabase/migrations/*.sql` → 45 tablas distintas |
| `CREATE POLICY` | **167** sentencias (46 objetivos incl. `storage.objects`) | `cat *.sql \| grep -ci 'create policy'` |
| Patrón de aislamiento | `tenant_id IN (SELECT get_user_tenant_ids())` con `USING` + `WITH CHECK` (migración dedicada a cerrar INSERTs) | `00032_rls_with_check.sql:1-16` |
| Helpers `SECURITY DEFINER` | `get_user_tenant_ids()` y `get_user_role_in_tenant()` (`STABLE`, `SET search_path = public`, leen `memberships` por `auth.uid()`) | `00001_create_tenants_memberships_documents.sql:96-121` |
| Funciones `SECURITY DEFINER` en total | 8 menciones; funciones: `get_user_tenant_ids`, `get_user_role_in_tenant`, `handle_new_user`, `handle_new_tenant_seed`, `handle_new_tenant_payroll`, `handle_gps_odometer_sync`, `decrement_stock`, `increment_stock` | `grep -ci 'security definer'`; `grep -B30 -i "security definer" *.sql` |
| Funciones SQL distintas | 12 (`+ handle_updated_at, next_report_number, storage_extract_tenant_id, storage_extract_user_id`) | `grep -io 'create (or replace )?function …' \| sort -u` |
| Triggers | 36 `CREATE TRIGGER` | `grep -ci 'create trigger'` |
| Índices | 131 (incl. parciales únicos anti-carrera) | `grep -ci 'create (unique )?index'` |
| Roles | `owner`, `admin`, `editor`, `viewer` (enum `membership_role`) | `00001`; CLAUDE.md tabla de permisos |
| Policies por tabla (máx.) | `hr_employee_vault`, `hr_disciplinary_records`, `hr_agent_profiles`: 6 cada una | `grep -A3 "create policy" \| grep -o "on <tabla>" \| uniq -c` |
| API: validación de membership explícita | todas las rutas leen `memberships` por `tenant_id`+`user_id` antes de actuar; nómina y centro de comando exigen `owner/admin` | `api/payroll/calculate/route.ts:26-36`; `api/command-center/route.ts:24-34`; `api/shift/clock-in/route.ts:43-52` |
| Cron protegido | `Authorization: Bearer CRON_SECRET` | `api/cron/daily-reports/route.ts:17-40`; `api/cron/shift-alerts/route.ts:5-10` |
| Webhook GPS protegido | `timingSafeEqual` contra `GPS_PROVIDER_SECRET` | `api/fleet/telemetry/route.ts:22-40` |
| Auth en layout (no en middleware) | `[tenant]/layout.tsx` valida tenant + membership + rol; middleware sin DB | `src/app/[tenant]/layout.tsx:43-60`; `middleware.ts:3-7` |
| Super admin | lista fija de correos + service-role solo server-side | `api/admin/route.ts:7-23` |
| `FORCE ROW LEVEL SECURITY` | 0 (no usado) | `grep -ci 'force row level security'` |
| Deny-by-default | RLS habilitada en las 45 tablas y **0 policies `USING (true)`** en todas las migraciones | `grep -ni "using (true)" supabase/migrations/*.sql` = 0 |

---

## 5. Números verificados

| Métrica | Valor | Comando | Fuente |
|---|---|---|---|
| Commits | 147 (2026-05-30 → 2026-06-03) | `git log --oneline \| wc -l` | `.git` |
| Migraciones SQL | 35 (`00001`…`00035`) | `ls supabase/migrations/*.sql \| wc -l` | `supabase/migrations/` |
| Líneas SQL | 2,735 | `cat *.sql \| wc -l` | idem |
| `CREATE TABLE` | 45 (45 nombres distintos) | `grep -ci 'create table'` + `sort -u` | idem |
| Tablas con RLS | 45 | ver §4 | idem |
| `CREATE POLICY` | 167 | `grep -ci 'create policy'` | idem |
| Triggers / índices / funciones | 36 / 131 / 12 | `grep -ci …` | idem |
| Edge Functions | 0 (no existe `supabase/functions`) | `ls supabase` | `supabase/` |
| API routes (`route.ts`) | 19 | `find src/app/api -name route.ts \| wc -l` | `src/app/api/` |
| Páginas (`page.tsx`) | 29 (19 bajo `[tenant]`, 1 `/admin`, 9 públicas/login) | `find src/app -name page.tsx \| wc -l` | `src/app/` |
| Módulos de dominio | 13 carpetas | `ls src/modules \| wc -l` | `src/modules/` |
| Ítems de navegación | 17 (incl. Configuración y Portal Cliente) | `grep -c "label:" sidebar.tsx` | `src/app/[tenant]/sidebar.tsx` |
| Archivos TS/TSX / líneas | 143 / 27,747 | `find src -name "*.ts*" \| wc -l`; `cat … \| wc -l` | `src/` |
| Esquemas Zod (`z.object`) | 62 | `grep -rho 'z\.object(' src \| wc -l` | `src/` |
| Capturas de módulos | 14 PNG | `ls public/modules \| wc -l` | `public/modules/` |
| Categorías de analítica IA | 8 (`switch` de `category`) | `sed -n '740,770p' route.ts` | `src/app/api/analytics/chat/route.ts` |
| Archivos de prueba | 0 | `find … -name "*.test.*" -o -name "*.spec.*"` | repo |
| Crons programados | 1 (`daily-reports` a `45 7 * * *`) | `cat vercel.json` | `vercel.json` |
| Seed por tenant (trigger) | 1 `payroll_configs` + 3 cursos + 8 categorías de incidente | `sed -n '55,75p' 00015…sql` | `00015_create_incident_categories_and_tenant_seed.sql` |
| Datos de demo | 15 tenants × 3 agentes × 2 puestos, 6 meses (Ene–Jun 2026) | `head -40 scripts/generate-demo-data.ts` | `scripts/generate-demo-data.ts:22-40` |
| Límite de velocidad GPS | 80 km/h; batch máx. 500 puntos | `telemetry/route.ts:6,19` | `src/app/api/fleet/telemetry/route.ts` |
| Radio de marcación | 200 m (Haversine) — **no activo** (ver §9) | `validate-proximity.ts:3,42-50` | `src/lib/geo/validate-proximity.ts` |

---

## 6. Automatizaciones y crons

| Automatización | Cuándo | Qué hace | Fuente |
|---|---|---|---|
| `GET /api/cron/daily-reports` | **07:45 UTC diario** (`45 7 * * *`) — único cron en `vercel.json` | con cliente admin busca `incidents_log` con `am_report_sent=false` de las últimas 24 h, agrupa por propiedad y puesto, arma HTML (`buildReportHtml`), envía a los `contact_emergency` con email vía Resend, y **solo tras enviar** marca `am_report_sent=true` | `vercel.json`; `src/app/api/cron/daily-reports/route.ts:45-150`; `src/lib/reports/daily-report.ts` |
| `GET /api/cron/shift-alerts` | endpoint existe; ventanas 05–12 h UTC (diurno) y ≥17 h (nocturno); **NO está en `vercel.json`** | por tenant compara `shift_assignments` del turno vs `agent_shifts` en los primeros 30 min (+ holdovers sin clock_out) y hace upsert de `shift_alerts` (no-show persistente) | `src/app/api/cron/shift-alerts/route.ts:13-98`; `grep -rn shift-alerts vercel.json` = 0 |
| Trigger `on_tenant_created_seed` | al insertar en `tenants` | siembra `payroll_configs`, 3 cursos obligatorios, 8 categorías de incidente | `00015…sql:55-85` |
| Trigger `handle_new_user` | al crear usuario auth | crea `profiles` | `00001…sql` |
| Trigger `handle_gps_odometer_sync` | al insertar GPS log | sincroniza odómetro del vehículo | `00006_create_fleet_vehicles.sql` |
| `next_report_number` | al generar reportes | numeración correlativa por tenant (`report_sequences`) | `00030_report_sequences.sql`; `src/lib/pdf/report-number.ts` |
| Realtime banner global | continuo (owner/admin) | alerta en vivo por nuevos incidentes y cambios en `shift_alerts` | `src/app/[tenant]/realtime-alerts.tsx:81-111` |
| Doble turno | al re-escanear QR en el mismo puesto | auto-cierra el turno anterior y abre uno nuevo | `src/modules/shifts/services/shift.service.ts:21-29` |
| Stock atómico | en préstamos/devoluciones | `decrement_stock`/`increment_stock` SQL | `00004_create_inventory_custody.sql` |

Sin `pg_cron`/`pg_net` en migraciones (`grep -ci 'cron.schedule'` = 0).

---

## 7. Flujos (paso a paso, como están en el código)

### 7.1 Marcación QR + GPS → nómina
1. Agente pulsa «Marcar» → `navigator.geolocation.getCurrentPosition` → `puesto/page.tsx:52-56,98-103`.
2. Se arma el payload QR → **hoy `simulatedQrPayload` con `PLACEHOLDER_STATION_ID`/`PLACEHOLDER_QR_TOKEN` (TODO: escáner real)** → `puesto/page.tsx:106-110`.
3. `POST /api/shift/clock-in` → auth → lee `work_stations` → valida membership del tenant → compara `qr_code_token` → `is_active` → `validateGpsProximity` (**devuelve `true` porque la propiedad no tiene lat/lng**) → `clockIn()` → `api/shift/clock-in/route.ts:24-90`; `src/lib/geo/validate-proximity.ts:42-50`.
4. `clockIn`: si hay turno abierto en el mismo puesto lo cierra y abre otro (doble turno) → `shift.service.ts:21-29`.
5. Owner abre período y `POST /api/payroll/calculate` (solo owner/admin) → `processFortnightPayroll` → carga `payroll_configs` (tope 96 h, `overtime_flat_rate`, `pays_holiday_premium`, CSS 9.75 %, SE 1.25 %) → suma horas de `agent_shifts` → `distributeHours` (ordinarias hasta el tope, excedente extra; feriado ×1.50 si aplica) → escribe `payroll_agent_consolidated` → `src/lib/payroll/engine.ts:58-110,199-201,403-411`.
6. Pantalla del período genera **archivo ACH** (CSV) con cédula/banco/cuenta/neto y lista datos bancarios faltantes → `dashboard/nomina/[periodId]/page.tsx:6`; `ach-generator.ts:6-22`.

### 7.2 Novedad → IA → reporte 8 a.m.
1. Agente dicta o escribe la novedad (+ «acción tomada») → `puesto/page.tsx:182,239-254`.
2. `POST /api/incidents/report` → auth + membership + puesto activo → `refineIncidentText` (Claude Sonnet, 15 s; si falla sigue) → inserta `incidents_log` con `raw_text`, `ai_refined_text`, `action_taken`, `am_report_sent=false` → `api/incidents/report/route.ts:20-95`.
3. Realtime: banner global a owner/admin por INSERT en `incidents_log` → `realtime-alerts.tsx:81-90`.
4. Operador gestiona en Centro de Comando (`PATCH /api/command-center`, nota obligatoria, registra `alert_audit_log`) → `api/command-center/route.ts:8-60`.
5. 07:45 UTC: cron agrupa pendientes por propiedad/puesto, envía email Resend a contactos de emergencia, marca `am_report_sent=true` → `api/cron/daily-reports/route.ts:49-150`.

### 7.3 GPS de flota
1. Proveedor GPS `POST /api/fleet/telemetry` (1 punto o array ≤500) con `x-gps-auth-token` → `telemetry/route.ts:31-61`.
2. Resuelve vehículos por `gps_device_id` en lote → inserta `vehicle_gps_logs`; >80 km/h → `geofence_violations` (`exceso_velocidad`); odómetro ≥ `next_maintenance_odometer` → flag de mantenimiento → `telemetry/route.ts:66-150`.
3. Dashboard Flota pinta posiciones en Leaflet → `dashboard/flota/map.tsx`.

### 7.4 No-show de turno (parcial)
1. Programación en `shift_assignments` (`api/shifts/assignments/route.ts`).
2. `cron/shift-alerts` compara con marcaciones y hace upsert en `shift_alerts` → Realtime → banner persistente (`realtime-alerts.tsx:109-111`). **Falta programarlo en `vercel.json`.**

### 7.5 Cliente contratante
Cliente (`viewer`) crea `client_tickets` / `client_damage_reports` en `/[tenant]/cliente` → aparecen en Centro de Comando → operador cambia estado con nota → `api/command-center/route.ts:50-60`; `00012`.

---

## 8. Datos para «antes / después»

| Antes (según docs/código del repo) | Después en NexGuard360 | Fuente |
|---|---|---|
| Nómina en Excel: «Suma marcas QR/GPS, topa 96h ordinarias, excedente a extras planas, retenciones CSS 9.75% + SE 1.25%… Centavo a centavo con el Excel» | motor `processFortnightPayroll` replica la fórmula exacta y la hace configurable por tenant (`overtime_flat_rate`, `pays_holiday_premium`) | CLAUDE.md «Modelo de nómina»; `master_prompt.ts` «Fórmula exacta del Excel de operaciones»; `engine.ts:403-411` |
| Transferencias de planilla cargadas a mano en el banco | archivo ACH generado desde el período | `src/lib/payroll/ach-generator.ts:1-4` |
| Reporte matutino redactado por el supervisor | novedades dictadas por voz, refinadas por IA y enviadas solas a las 7:45 UTC | `refine-incident.ts:3`; `cron/daily-reports` |
| «Sin Excel, sin WhatsApp, sin parches» / «por qué los reportes llegaban tarde y por qué WhatsApp no escala» | reportes automáticos + NOC en tiempo real | `src/app/page.tsx:91,270` |
| Cambio de turno: «Envío manual a gerencia» (todavía manual) | reporte con detección automática + PDF | `src/app/producto/page.tsx:50` |
| Control de asistencia en papel | marcación QR+GPS por puesto, doble turno auto-cerrado | `shift.service.ts:21-29` |
| Actas de entrega de armas/equipo en papel | acta PDF con firma digital y numeración correlativa | `api/firearms/delivery-pdf`, `api/inventory/loans-pdf`, `00030` |

---

## 9. Lo que NO está construido o está a medias (no afirmar)

- **Escáner QR real en «Mi Puesto»**: el payload es simulado (`PLACEHOLDER_STATION_ID`/`PLACEHOLDER_QR_TOKEN`, `// TODO: Replace with real QR scanner output`) → `src/app/[tenant]/puesto/page.tsx:106-110`. El QR por puesto sí se genera y descarga en Comercial.
- **Validación de proximidad GPS inactiva**: `validateGpsProximity` devuelve `valid:true` porque `properties_ph` no guarda lat/lng (Haversine lista, sin fuente de datos) → `src/lib/geo/validate-proximity.ts:9-11,42-50`.
- **Cron de no-show no programado**: `api/cron/shift-alerts` existe pero `vercel.json` solo tiene `daily-reports` → `vercel.json`.
- **Analítica IA no es tool-use**: clasifica a 8 categorías (keywords + Claude opcional) y corre consultas fijas; sin `ANTHROPIC_API_KEY` funciona solo por keywords → `analytics/chat/route.ts:710-770`.
- **Sin `api/contact`**: el formulario de demo no envía por Resend → CLAUDE.md «Pendientes» #6.
- **Sin pagos** (Stripe Checkout pendiente) → CLAUDE.md #5.
- **Sin app nativa ni push** (sin Capacitor/FCM) → `package.json`.
- **Sin pruebas automatizadas** (0 archivos test) → repo.
- **Geofence real**: `geofence_violations` solo se alimenta por exceso de velocidad (no hay polígonos) → `telemetry/route.ts:131-139`.
- **Banner para cliente filtrado por propiedad**, **novedades en Cambio de Turno**, **modo manual sin QR**, **blog**, **PDF ejecutivo con branding**, **wizard de onboarding** → CLAUDE.md «Pendientes priorizados» #2-#9.
- **Cambio de turno: envío a gerencia manual** → `producto/page.tsx:50`.
- **`react-leaflet`** instalado pero el mapa usa `leaflet` directo → `flota/map.tsx:4`.
- CLAUDE.md desactualizado en conteos (dice 26 migraciones; hay 35).

---

## 10. Branding, capturas y demo

- Logos: `public/brand/logo-nexguard360-light.svg`, `logo-nexguard360-dark.svg`, `logo-nexguard360-light.png`, `nexera-logo.png`; `public/nexguard360-logo.png`. Generador: `scripts/gen-logo-png.py`.
- Capturas de los 14 módulos (usadas en `/producto`): `public/modules/{analitica-ia,armamento,cambio-turno,capacitaciones,comercial,dashboard,executive,flota,inventario,noc-monitor,nomina,portal-cliente,rrhh,turnos}.png`.
- Material comercial: `docs/comercial/NexGuard360-Flyer.pdf`, `docs/comercial/NexGuard360-logo-e-imagenes.zip`; `NexGuard360_Certificaciones_v2.docx`, `NexGuard360_Estrategia_Certificaciones.docx` (generados con `scripts/generate-cert-doc.py`).
- Color de marca: lime tactical `#84CC16`, tema dark OLED → CLAUDE.md «Stack».
- Seeds de demo: `scripts/seed-tenant.ts` (tenant + owner; nombres ficticios), `scripts/generate-demo-data.ts` (15 tenants ficticios, 45 agentes, 6 meses), `scripts/insert-miami-inventory.sql` + `parse-inventory.py` (inventario de ejemplo). No se copian credenciales de ejemplo.
- Manual de usuario con marca: `GET /api/manual?empresa=<nombre>` → `src/app/api/manual/route.ts`.
- OG image / SEO: `src/app/opengraph-image.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts` (verificados con `ls`).
