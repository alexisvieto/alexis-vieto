# Modus PM — ficha de hechos verificables

Repo: `C:\dev-modus` (rutas relativas al repo). Verificado el 2026-10-11 leyendo código, sin abrir `.env.local` (existe, está en `.gitignore`, no se leyó) ni datos reales.
Producto: plataforma de gestión para empresas de ingeniería/instalaciones: cálculo de cotizaciones (Nexus Cálculo), CRM, gestión de proyectos (Gantt, curva S, EVM, costos, reportes diarios, inventario, punch list, FAT/SAT), HSE, documentos controlados y un motor de conteo de planos con IA. Multi-tenant por organización con marca por tenant (white-label).

> El repo contiene el nombre y el logo de un cliente real (`next.config.ts` org de Sentry, `public/<cliente>-logo.png`, un test que cita "el Excel de <cliente>"). No publicar. El vendedor aparece como **Nexera** (`public/nexera-logo.png`, `docs/comercial/Nexera-logo.png`, "Crédito Nexera" en `BUILD-PLAYBOOK.md` §4).

---

## 1. Stack exacto

| Pieza | Versión / detalle | Fuente |
|---|---|---|
| Framework web | **Next.js `^16.3.1`** (App Router, convención `src/proxy.ts` en vez de middleware), React `19.2.4`, TypeScript 5, Tailwind CSS 4, shadcn `^4.11.0` + `@base-ui/react ^1.5.0`, `lucide-react`, `next-themes`, `sonner`, `class-variance-authority` | `package.json`; `src/proxy.ts` L3; `AGENTS.md` |
| Datos / auth | Supabase: `@supabase/supabase-js ^2.108.1`, `@supabase/ssr ^0.12.0`; tipos generados `src/lib/supabase/database.types.ts` (4.442 líneas, **67 tablas, 35 funciones RPC**) | `package.json`; parse de `database.types.ts` |
| IA | `@anthropic-ai/sdk ^0.104.1` (solo servidor). Modelos referenciados en código: `claude-opus-4-8` (leyenda, conteo por glifos, pliegos, análisis ejecutivo por defecto), `claude-sonnet-4-6` (resúmenes), `claude-haiku-4-5`, `claude-opus-4-7`, `claude-sonnet-5` (lista de precios/selección) | `src/lib/takeoff/legend-vision.ts` L9; `src/app/api/takeoff/scope-analyze/route.ts` L26; `src/lib/ai/tenant.ts`; `grep -rhoE "claude-[a-z0-9.-]+" src` |
| Observabilidad | `@sentry/nextjs ^10.70.0`: solo errores (`tracesSampleRate: 0`, `sendDefaultPii: false`, `beforeSend: scrubEvent`), túnel `/monitoring` | `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation*.ts`, `src/lib/sentry-scrub.ts`, `next.config.ts` |
| Exportables | `exceljs ^4.4.0` (Excel con fórmulas vivas), `@react-pdf/renderer ^4.5.1` (PDF en cliente), `recharts ^3.8.0` (curva S, costos, CRM) | `package.json`; `src/lib/nexus/excel.ts`; `src/components/pdf/pdf-chrome.tsx`; `src/components/charts/s-curve.tsx` |
| Lectura de PDF en Node | `mupdf ^1.28.0` (WASM, `serverExternalPackages`) | `next.config.ts` L6; `src/lib/takeoff/extract.ts` |
| Código de barras | `@zxing/browser ^0.2.0` + `@zxing/library ^0.22.0` (QR, DataMatrix, Code128, Code39, EAN-13, UPC-A) | `src/components/inventory/scan-sheet.tsx` L134-146 |
| Push | `web-push ^3.6.7` (VAPID) + service worker propio | `src/app/api/push/dispatch/route.ts`; `public/sw.js` |
| Tests | `vitest ^4.1.10`; CI con `tsc --noEmit`, `eslint`, `npm test` | `vitest.config.ts`; `.github/workflows/ci.yml` |
| Microservicio 1: `takeoff-engine` | Python 3.12-slim, **FastAPI `0.139.0`**, uvicorn `0.51.0`, **PyMuPDF `1.28.0`**, httpx `0.28.1`, pydantic `2.13.4`; Dockerfile + `docker-compose.yml`; 1 worker (cola de jobs en memoria); desplegado en Railway según notas | `takeoff-engine/requirements.txt`, `Dockerfile`, `docker-compose.yml`; `TAKEOFF-ESTADO.md` §Infra |
| Microservicio 2: `survey-engine` | Python 3.12-slim, FastAPI `0.115.6`, uvicorn `0.34.0`, httpx, pydantic `2.10.4`; **Typst `0.15.1`** (binario oficial fijado en el Dockerfile) para PDFs editoriales; 9 plantillas `.typ` (1.274 líneas) | `survey-engine/requirements.txt`, `Dockerfile`; `ls survey-engine/app/*.typ` |
| Hosting | Vercel (app) con cron en `vercel.json`; Railway (motores Python) según `TAKEOFF-ESTADO.md` | `vercel.json`; `TAKEOFF-ESTADO.md` |
| Integración ERP | Cliente **Odoo JSON-RPC** solo servidor (`testConnection`, `pushToExistingOrder`); llave por tenant en Vault | `src/lib/nexus/odoo.ts` L1-5, L112, L137; `src/app/app/nexus/odoo-actions.ts` |
| Seguridad HTTP | Headers globales: `X-Frame-Options DENY`, `nosniff`, `Referrer-Policy`, HSTS preload, `Permissions-Policy camera=(self)`; sin CSP ("post-demo") | `next.config.ts` L8-33 |

---

## 2. Módulos / funciones construidas

Rutas bajo `src/app/app/` salvo indicación. 47 `page.tsx` + 19 `route.ts` en total (`find src/app -name page.tsx | wc -l`).

### 2.1 Portal por división (`/app/d/[key]`)
Tres divisiones de código (`comercial`, `operaciones`, `hse`) con sus módulos; membresía en `departments`/`department_members`; acceso por `requireDepartment()` en servidor con bypass para owner/admin y super-admin de plataforma. Documentos controlados ISO por división (`doc_formats`, `doc_records`). Fuente: `src/lib/divisions.ts` L1-4, L30-63; `src/lib/access.ts` L1-4; `app/d/[key]/page.tsx` L1-2.

### 2.2 Nexus Cálculo — cotizaciones (`/app/nexus`)
| Función | Ruta |
|---|---|
| Estimaciones multi-sistema con catálogo, categorías, perfiles de mano de obra, versiones (`nexus_new_version`, `nexus_set_current_version`, `nexus_clone_estimate`), estado (`nexus_set_estimate_status`) | `app/nexus/[estimateId]/page.tsx`; `components/nexus/estimate-editor.tsx`; tablas `nexus_*` |
| **Cálculo en cascada** (la fórmula del Excel de gerencia): base = Material + M.O. + Herramienta + Flete; Ind. Oficina 10%; Ind. Campo 2%; Financiamiento 2% sobre acumulado; Utilidad 20% sobre acumulado; ITBMS 7%; margen = utilidad/subtotal; ITBMS de compra 7% sobre todo lo comprado (no sobre M.O.) | `src/lib/nexus/calc.ts` (`calcCascade`, `bucketsFrom`, `margin`, `carriesPurchaseTax`); tests `calc.test.ts` |
| **Export a Excel con fórmulas vivas** (hoja Análisis de Presupuesto, Rentabilidad con % editables y KPIs que recalculan, Donut, Gantt por sistema, Costo del Proyecto), branding por tenant | `src/lib/nexus/excel.ts` (869 líneas); tests `excel.test.ts` |
| Gantt de cotización (días hábiles, secuencial, categorías "paralelo") en pantalla y en Excel con la misma lógica | `src/lib/nexus/schedule.ts` (`scheduleGantt`); `components/nexus/estimate-gantt.tsx` |
| Integración Odoo (probar conexión, empujar a orden existente; llave en Vault write-only) | `src/lib/nexus/odoo.ts`; `app/nexus/config/page.tsx`; RPC `set_org_odoo_key`/`get_org_odoo_key`/`clear_org_odoo_key` |
| Gestión/configuración (catálogo, divisiones, parámetros, seed por org `nexus_seed_org_defaults`) | `app/nexus/gestion/page.tsx`, `app/nexus/config/page.tsx` |

### 2.3 Cálculo de planos (Takeoff) — `/app/nexus/[estimateId]/calculo`
| Función | Ruta |
|---|---|
| Home de cálculo por estimación; sistemas (`takeoff_systems`); hojas (`takeoff_sheets`); análisis (`takeoff_analyses`) | `app/nexus/[estimateId]/calculo/page.tsx`, `calculo/sistema/[systemId]/page.tsx`, `calculo/analisis/[analysisId]/page.tsx`; `components/takeoff/takeoff-home.tsx`, `system-view.tsx` |
| **Fase 1 `sheet-legend`**: el motor recorta la leyenda (`POST /legend` del engine), Claude lee el cuadro de simbología (visión) y se mezcla con `takeoff_symbol_library` (aprendido) + convenciones del catálogo; cada fila lleva `source: vision\|biblioteca\|sugerencia`. **No cuenta.** | `src/app/api/takeoff/sheet-legend/route.ts` L22-26, L88, L115, L145; `src/lib/takeoff/legend-vision.ts` |
| **Fase 2 `sheet-count`**: confirma el diccionario (confirmar = enseñar a `symbol_library`), encola `POST /analyze` en el engine, espera `GET /jobs/{id}`, y para círculos sin clasificar manda UN mosaico de glifos a Claude; guarda `takeoff_detections` | `src/app/api/takeoff/sheet-count/route.ts` L69, L132-158, L174, L217, L251-311 |
| **Visor de verificación** (1.186 líneas): marcadores por tipo, dudosos, selección en bloque, acciones masivas, candidatos descartados con rescate, atajos de teclado, auditoría en hover | `components/takeoff/verification-viewer.tsx`; `TAKEOFF-ESTADO.md` §5 |
| **Correcciones batch append-only** que aprenden: cada evento aplica a `takeoff_detections`, enseña en `symbol_library` y se registra en `takeoff_correction_events` | `src/app/api/takeoff/corrections/route.ts` L1-8 |
| Aprobar: consolida cantidades en `takeoff_results`, mueve evidencia a bucket `takeoff-evidence` y **borra el PDF** de `takeoff-temp`; requiere `has_org_role` | `src/app/api/takeoff/approve/route.ts` L33-109 |
| **Análisis de pliegos con IA** (ver §7.2) | `src/app/api/takeoff/scope-analyze/route.ts`; `app/nexus/[estimateId]/calculo/pliego/[docId]/page.tsx`; `components/takeoff/scope-report.tsx`, `scope-pdf-button.tsx` |
| Tablas del dominio | `takeoff_analyses, takeoff_cable_params, takeoff_calibration, takeoff_correction_events, takeoff_detections, takeoff_org_settings, takeoff_results, takeoff_scope_docs, takeoff_scope_items, takeoff_scope_status, takeoff_sheets, takeoff_symbol_library, takeoff_systems` (`database.types.ts`) |

### 2.4 CRM (`/app/crm`, `/app/clientes`)
Oportunidades con estados `abierta → en_calculo → propuesta_enviada → en_revision → negociacion → ganada/perdida` (enum `opportunity_status`), motivos de pérdida y de revisión, embudo (ganada/perdida no son columnas, son desenlaces), estadísticas por fecha de apertura, envío de propuestas (`registrar_envio_propuesta`, `opportunity_sends`), traspaso Nexus → CRM ("listas para enviar"), **crear proyecto desde oportunidad ganada** (`crear_proyecto_desde_oportunidad`); clientes y contactos con aislamiento por organización y gestión separada de escritura (`can_manage_clients`). Fuente: `src/lib/crm.ts`; `app/crm/embudo/page.tsx`; `app/crm/estadisticas/page.tsx`; `components/crm/*`; migraciones `20260816110000_crm_oportunidades.sql` … `20260816230000_proyecto_desde_oportunidad_ganada.sql`.

### 2.5 Nexus PM — proyectos (`/app/proyectos/[projectId]`)
| Función | Ruta |
|---|---|
| Dashboard del proyecto con **EVM** (PV, EV, AC, SPI, CPI, salud por SPI) y **curva S** (snapshots si existen; si no, plan/real derivados del Gantt) | `app/(pm)/proyectos/[projectId]/page.tsx` L104-141, L322; `src/lib/metrics.ts` (`evm`, `healthFromSpi`, `ganttCurve`, `ganttSnapshot`); `components/charts/s-curve.tsx` |
| **Cronograma Gantt** (585 líneas) con tareas, dependencias (`task_dependencies`), línea base (`set_baseline`, `progress_snapshots`), editor de tareas | `app/(pm)/proyectos/[projectId]/cronograma/page.tsx`; `components/gantt/gantt-board.tsx`, `task-editor-sheet.tsx` |
| Avance (curva S + PDF) | `.../avance/page.tsx`; `components/projects/avance-pdf-button.tsx` |
| Costos: entradas por categoría (`labor, material, equipment, subcontract, other`), **importación CSV/XLSX** con parser propio (`hoja-importada.ts`: BOM, `;` de Excel en español, comillas, CRLF, fórmulas → valor cacheado), `import_cost_entries`, `cost_summary`, gráfico | `.../costos/page.tsx`; `components/costs/cost-import-sheet.tsx`; `src/lib/hoja-importada.ts`; `ejemplo-costos.csv` |
| Reportes diarios (`daily_reports` + entradas, precarga de actividades del cronograma, PDF) + **resumen con IA** | `.../reportes/page.tsx`; `components/reports/*`; `src/app/api/ai/report-summary/route.ts` |
| **Inventario** con estados `por_recibir, instalado, faltante, defectuoso, spare`, ubicación `en_proyecto/en_galera`, categorías, **escaneo de códigos de barras con cámara** (ZXing, 6 simbologías), export a Excel, spares (`inventory_mark_spare`/`inventory_use_spare`), limpieza de secretos iLO antes de mandar al navegador | `.../inventario/page.tsx`; `components/inventory/inventory-board.tsx` L264-294; `scan-sheet.tsx`; `src/lib/inventory.ts` (`stripIloSecrets`) |
| **Punch list** (pendientes): prioridad `low/medium/high`, estado `open/in_progress/done`, vencimiento y alertas (`dueState`, `isAlerting`), fotos | `.../pendientes/page.tsx`; `components/punch/*`; `src/lib/punch.ts` |
| **FAT/SAT**: protocolos y puntos (`fatsat_protocols`, `fatsat_points`), resultado `pass/fail/na`, estado derivado (`approved`, `approved_with_observations`, `rejected`), clonar protocolos, firmas y fotos, PDF | `.../fat-sat/page.tsx`; `components/fatsat/fatsat-board.tsx`, `fatsat-pdf-*.tsx`; `src/lib/fatsat.ts` |
| **Análisis ejecutivo con IA** del proyecto (rate-limit 15 s + gate por tenant; datos envueltos en `<datos_proyecto>` como solo-data) + PDF | `.../ia/page.tsx`; `src/app/api/ai/executive-analysis/route.ts` L15-16, L89-90, L187; `components/ia/*` |
| Ayuda en app con capturas | `app/(pm)/ayuda/page.tsx`; `public/help/{calculo,costos,inventario,reportes}/*.png` |

### 2.6 HSE (`/app/hse`)
Permisos de trabajo por tipo (altura, izaje, caliente) con checklists por plantilla, personal y firmas (`hse_permits`, `src/lib/hse/permits.ts`); charlas con asistencias; incidentes; inspecciones; empleados; inventario y asignación de EPP (`hse_epp_items`, `hse_epp_asignaciones`); despacho; indicadores; PDFs de permiso/charla/incidente/inspección. Fuente: `app/hse/*/page.tsx`; `components/hse/*`; `src/app/api/hse/**/pdf/route.ts`.

### 2.7 Comercial / Operaciones — documentos controlados
VT-F-002 encuesta de satisfacción (**pública por enlace con token, sin login**, dos modalidades suministro/obra; RPC `survey_get_public`/`survey_submit_public`), VT-F-003 minuta de visita, VT-F-004 visita técnica, PY-F-014 site survey (datos generales, sitio, técnicos, informe fotográfico). Cada uno con PDF vía survey-engine. Fuente: `src/lib/comercial/{encuesta,minuta,vtf004}.ts`; `src/lib/operaciones/site-survey.ts`; `app/encuesta/[token]/page.tsx` L25; `src/app/api/comercial/**/pdf/route.ts`, `api/operaciones/site-survey/[recordId]/pdf/route.ts`.

### 2.8 Nexus Survey (levantamientos)
Surveys con hallazgos por severidad, fotos y firmas en bucket privado con URLs firmadas, PDF. Fuente: `app/survey/page.tsx` L32; `app/survey/[surveyId]/page.tsx` L35-51; `components/survey/*`; `api/survey/[surveyId]/pdf/route.ts`.

### 2.9 Transversales
Avisos en app (`notifications`, portal por enum `notification_portal`, `mark_notifications_read`, purga `purge_old_notifications`) + push al teléfono; bitácora/auditoría (`audit_log`, `log_action` solo servidor, export CSV para owner/admin); marca por tenant (`brandFromOrg`, `docPalette`, crédito freemium `export_credit`); super-admin de plataforma (`platform_admins`, `is_platform_admin`); login y landing. Fuente: `components/avisos/*`; `src/lib/audit.ts`; `app/admin/auditoria/{page.tsx,csv/route.ts}`; `src/lib/brand.ts`; `src/lib/access.ts`.

---

## 3. Integraciones externas

| Integración | Dónde | Detalle |
|---|---|---|
| **Anthropic (Claude)** | `src/app/api/takeoff/{sheet-legend,sheet-count,scope-analyze}/route.ts`; `src/app/api/ai/{executive-analysis,report-summary}/route.ts`; `src/lib/takeoff/legend-vision.ts`; `src/lib/ai/tenant.ts` | Visión para leyenda y glifos, extracción de pliegos, análisis ejecutivo, resúmenes. **Gate por tenant**: switch `ai_provider_configs.is_enabled`, rate-limit persistente, presupuesto mensual, llave BYOK del Vault (`get_org_ai_key`) o la global del servidor; uso registrado en `ai_usage` con costo estimado por modelo (`recordAiUsage`, `PRICING`) |
| **Sentry** | `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation.ts`, `src/instrumentation-client.ts`, `src/lib/sentry-scrub.ts` | Solo errores en producción, PII desactivada, scrubbing |
| **Web Push (VAPID)** | `src/app/api/push/dispatch/route.ts`; `public/sw.js`; `components/avisos/push-manager.tsx`; tablas `push_subscriptions`, `push_config` | La fila de `notifications` es la fuente de verdad: trigger `notifications_dispatch_push` (after insert) hace `net.http_post` (pg_net) a `/api/push/dispatch` con firma HMAC `hmac(id.exp, secreto)` en vez de secreto en claro |
| **pg_net** | `supabase/migrations/20260816093000_push_dispatch.sql` L57-77; `20260816180000_cierra_pg_net_a_roles_de_navegador.sql`; `20260816181000_push_firma_en_vez_de_secreto_en_claro.sql` L50-56 | Acceso a `net.*` revocado a roles de navegador |
| **Supabase Vault** | `src/lib/ai/tenant.ts`; `src/app/app/nexus/odoo-actions.ts`; RPCs `set_org_ai_key`, `get_org_ai_key`, `clear_org_ai_key`, `set_org_odoo_key`, `get_org_odoo_key`, `clear_org_odoo_key` | Llaves de IA y Odoo por tenant, RPC write-only |
| **Odoo JSON-RPC** | `src/lib/nexus/odoo.ts` | Empuja cotizaciones a órdenes existentes |
| **exceljs** | `src/lib/nexus/excel.ts`; `components/costs/cost-import-sheet.tsx`; `components/inventory/inventory-board.tsx` | Export con fórmulas; import de costos; export de inventario |
| **@react-pdf/renderer** | `components/pdf/pdf-chrome.tsx`; `components/{dashboard,fatsat,ia,projects,reports}/*-pdf-*.tsx` | PDFs generados en el navegador con marca del tenant |
| **Typst (survey-engine)** | `survey-engine/app/main.py` L440-743; plantillas `*.typ` | 9 endpoints `/render*`: survey, permit, incidente, inspección, charla, minuta, vtf004, site survey, encuesta |
| **PyMuPDF (takeoff-engine)** | `takeoff-engine/app/engine.py`, `legend.py` | Geometría vectorial determinista |
| **mupdf (WASM en Next)** | `src/lib/takeoff/extract.ts` | PDF → markdown con anclas de página; páginas pobres en texto → visión |
| **ZXing** | `components/inventory/scan-sheet.tsx` | Escaneo con cámara |
| **Supabase Storage** | buckets `takeoff-temp` (efímero, URL firmada 600 s), `takeoff-evidence`, fotos/firmas de survey/HSE (privados, URL firmada) | `sheet-legend/route.ts` L88-89; `approve/route.ts` L93-98; `app/survey/[surveyId]/page.tsx` L51 |
| Vercel Cron | `vercel.json` | `GET /api/takeoff/cleanup` diario 06:00 |
| Correo | **No hay proveedor de correo** (grep `resend\|sendgrid\|nodemailer\|smtp` en `src` → 0) | — |

---

## 4. Seguridad

| Hecho | Valor | Fuente |
|---|---|---|
| Modelo multi-tenant | `organization_id` + RLS con `is_org_member()`; gating admin en dos capas (servidor `has_org_role(owner/admin)` real; cliente solo UX) | `BUILD-PLAYBOOK.md` §0, §4; `grep .rpc("has_org_role"` → 11 usos; `is_platform_admin` → 7 |
| Roles (`org_role`) | `owner, admin, project_manager, member, viewer` + `platform_admins` (super-admin) + membresía por división (`department_members`) | `database.types.ts` Enums; `src/lib/access.ts` |
| Funciones RPC expuestas | 35 (todas en `database.types.ts`): `can_manage_clients, can_write, cost_summary, doc_*, fatsat_clone_protocols, has_department_access, has_org_role, import_cost_entries, inventory_*, is_org_member, is_platform_admin, log_action, mark_notifications_read, nexus_*, set_baseline, save_report_entries, survey_get_public, survey_submit_public, *_org_ai_key, *_org_odoo_key, …` | parse de `database.types.ts` |
| Migraciones versionadas en el repo | **21 archivos** (2026-08-15 → 2026-08-16), 2.354 líneas: bitácora, notificaciones, push, CRM, clientes. El resto del esquema (67 tablas) se aplicó con `apply_migration` del MCP de Supabase y **no está en el repo** | `ls supabase/migrations`; `BUILD-PLAYBOOK.md` §5 ("DDL → `apply_migration`") |
| RLS en migraciones del repo | 9 tablas creadas, 9 con `enable row level security`, **14 policies** (`audit_log`, `notifications`, `push_subscriptions`, `opportunities`, `clients`, `client_contacts`, `opportunity_sends`) | `grep "create policy" supabase/migrations/*.sql` |
| RLS del resto de tablas | **No verificable desde el repo** (esquema fuera de git). Las notas afirman "RLS + FKs compuestas + FORCE RLS" para takeoff, pero `force row level security` aparece 0 veces en las migraciones del repo | `TAKEOFF-ESTADO.md` §Infra; grep |
| Pruebas de aislamiento RLS | **No hay en el repo ni en CI.** `vitest.config.ts` lo dice: "se verifica contra la BD por separado (simulación de JWT por rol en transacción revertida), no en CI" | `vitest.config.ts` L6-8 |
| `SECURITY DEFINER` | 32 apariciones en las 21 migraciones; RPCs con `search_path` fijo que se auto-autorizan con `has_org_role` | `grep -c "security definer"`; `BUILD-PLAYBOOK.md` §5 |
| Bitácora | `audit_log` sin policy de insert (RLS niega al navegador), `log_action` revocada a `authenticated`; se escribe solo desde servidor con service role | `src/lib/audit.ts` L1-8 |
| Secretos fuera del cliente | `ANTHROPIC_API_KEY` solo server; llaves de tenant en Vault write-only; `stripIloSecrets` antes de mandar inventario al navegador | `BUILD-PLAYBOOK.md` §4; `src/lib/inventory.ts` L69; test `inventory.test.ts` |
| Motores Python no públicos | Header `X-Engine-Secret` obligatorio (`require_secret`); PDFs e imágenes **por URL firmada, nunca en el body**; survey-engine resuelve DNS y rechaza IPs privadas (anti-SSRF, `ipaddress`), límites `MAX_IMAGES`/`MAX_IMAGE_BYTES`, timeouts de descarga y compilación | `takeoff-engine/app/main.py` L33-36; `survey-engine/app/main.py` L1-10, L399, L412, L529 |
| Cron protegido | `/api/takeoff/cleanup` exige `Authorization: Bearer CRON_SECRET`; falla cerrado sin la variable | `src/app/api/takeoff/cleanup/route.ts` L8-19 |
| IA: prompt-injection | Datos del proyecto envueltos como solo-data (`<datos_proyecto>`); rate-limit por usuario en memoria + persistente en `gateAiRequest` | `executive-analysis/route.ts` L15-16, L187 |
| Logos | `brandFromOrg` bloquea esquemas peligrosos (XSS) y solo permite `https://` o same-origin | `src/lib/brand.test.ts` L42 |
| Headers HTTP | DENY framing, nosniff, HSTS preload, Permissions-Policy; **sin CSP** | `next.config.ts` |
| Proxy de auth | `/app/*` y `/admin/*` protegidos; sesión por `@supabase/ssr` | `src/proxy.ts` L7-9 |

---

## 5. Números verificados

| Métrica | Valor | Comando | Fuente |
|---|---|---|---|
| Tests unitarios | **57 casos en 6 archivos, todos en verde** (una primera corrida marcó 1 fallo por tiempo al importar exceljs en frío; la segunda y tercera, 57/57) | `npx vitest run` → "Test Files 6 passed · Tests 57 passed" | `src/lib/{brand,crm,hoja-importada,inventory}.test.ts`, `src/lib/nexus/{calc,excel}.test.ts` |
| Casos `it(` por grep | 57 | `grep -rhoE "^\s*(test\|it)\(" src --include=*.test.ts \| wc -l` | — |
| Pruebas RLS | 0 en repo | ver §4 | `vitest.config.ts` |
| Páginas Next | 47 `page.tsx` | `find src/app -name page.tsx \| wc -l` | — |
| Route handlers | 19 `route.ts` (6 takeoff, 2 ai, 9 PDF, 1 push, 1 CSV) | `find src/app -name route.ts` | — |
| Server actions | 7 archivos `actions.ts` | `find src -name actions.ts \| wc -l` | — |
| Componentes | 102 archivos en 24 carpetas | `find src/components -type f \| wc -l` | — |
| Líneas TS/TSX (sin tipos generados) | 43.253 | `find src -name "*.ts*" -not -name database.types.ts \| xargs cat \| wc -l` | — |
| `database.types.ts` | 4.442 líneas, **67 tablas, 35 funciones, 18 enums** | parse con node | `src/lib/supabase/database.types.ts` |
| Migraciones en repo | 21 (2.354 líneas SQL) | `ls supabase/migrations \| wc -l` | — |
| Policies en repo | 14 | `grep -c "create policy"` | — |
| `takeoff-engine` | 7 módulos Python, 686 líneas; 5 endpoints (`/health`, `/legend`, `/render`, `/analyze`, `/jobs/{id}`) | `wc -l takeoff-engine/app/*.py`; `grep "@app."` | — |
| `survey-engine` | 772 líneas Python + 9 plantillas Typst (1.274 líneas); 10 endpoints | `wc -l`; `grep "@app."` | — |
| Visor de verificación | 1.186 líneas | `wc -l src/components/takeoff/verification-viewer.tsx` | — |
| Export Excel Nexus | 869 líneas | `wc -l src/lib/nexus/excel.ts` | — |
| Modelos Claude referenciados | 5 ids distintos | `grep -rhoE "claude-[a-z0-9.-]+" src \| sort -u` | — |
| Commits | 171 (2026-06-10 → 2026-08-16) | `git log --oneline \| wc -l` | `.git` |
| Capturas comerciales | 4 PNG + flyer PDF + zip de logo | `ls docs/comercial` | — |

---

## 6. Automatizaciones, crons y jobs

| Qué | Cuándo | Qué hace | Fuente |
|---|---|---|---|
| Vercel cron `/api/takeoff/cleanup` | `0 6 * * *` (diario) | Con service role borra de `takeoff-temp` los PDF de análisis/pliegos abandonados >7 días sin completar; protegido por `CRON_SECRET` | `vercel.json`; `src/app/api/takeoff/cleanup/route.ts` |
| Trigger `notifications_dispatch_push` | `after insert on notifications` | `net.http_post` a `/api/push/dispatch` con firma HMAC; la ruta Node manda el push (web-push) a las `push_subscriptions` del usuario y marca `pushed_at` | `supabase/migrations/20260816093000_push_dispatch.sql` L57-77; `20260816181000_...sql`; `src/app/api/push/dispatch/route.ts` |
| Triggers CRM/clientes | insert/update | `clients_before_write`, `opportunities_before_write`, `sync_client_name`, `sync_contact_fields`, `clients_propaga_nombre`, `contacts_propaga` | `supabase/migrations/202608161*.sql` |
| Purga de avisos | RPC `purge_old_notifications` | (sin cron en repo que la invoque) | `database.types.ts` |
| Cola de jobs del motor de conteo | en memoria, 1 worker | `POST /analyze` responde `{job_id}` al instante; el cliente Next hace polling a `/jobs/{id}` (`engineWaitResult`) | `takeoff-engine/app/jobs.py`, `Dockerfile` (comentario "1 worker") ; `src/lib/takeoff/engine-client.ts` L98-121 |
| Procesamiento por lotes del pliego | dirigido desde el navegador | Cada POST ejecuta un paso (extraer / lote de fragmentos / síntesis) y devuelve progreso hasta `done=true` para convivir con límites serverless (`maxDuration = 300`) | `scope-analyze/route.ts` L16-20 |
| Edge Functions de Supabase | **Ninguna** en el repo | — | `ls supabase` → solo `migrations` |

---

## 7. Flujos clave paso a paso (como están en el código)

### 7.1 Conteo de símbolos en un plano (Takeoff)
1. **Subida.** El usuario sube el PDF de la hoja a `takeoff-temp` y se crea `takeoff_sheets` dentro de un `takeoff_analyses` / `takeoff_systems` (tipo de sistema: p. ej. detección de incendio) — `components/takeoff/system-view.tsx`.
2. **Fase 1 — leyenda (`POST /api/takeoff/sheet-legend`).** Next marca la hoja `procesando`, firma la URL del PDF (600 s), llama al engine `POST /legend {pdf_url, system_type}` que localiza y recorta el cuadro de simbología (`legend.py: _find_legend_rect`, `render_legend`) y devuelve la imagen. Next pasa el recorte a Claude (`readLegend`, modelo `claude-opus-4-8`, "sin sesgo de convenciones: se mapea exclusivamente por lo que dice cada fila"), mezcla con `takeoff_symbol_library` de la org y con sugerencias del catálogo (`legendDefaults`), exige `MIN_LEGEND_ROWS = 5`, y deja la hoja en estado `leyenda` con las filas propuestas y su `source`. Fuente: `sheet-legend/route.ts` L22-26, L83-162.
3. **Confirmación humana.** En el visor el usuario agrega/corrige/borra filas del diccionario. Nada se cuenta sobre un diccionario sin confirmar (`TAKEOFF-ESTADO.md` §1).
4. **Fase 2 — conteo (`POST /api/takeoff/sheet-count`).** Cada fila confirmada se escribe/actualiza en `takeoff_symbol_library` con `sig_key = leyenda|SYM` ("confirmar = enseñar", L132-158). Next llama `POST /analyze` con `{pdf_url, system_type, symbols}`; el engine encola el job y Next hace polling a `GET /jobs/{id}`.
5. **Detección determinista (engine `count()`, `engine.py`).** Todo en coordenadas normalizadas 0-1 del pixmap del visor (`_transform`). Tres detectores:
   - **Círculos** (detectores): firma Bézier (≥3 curvas, aspecto 0.7-1.4, 5-30 pt), tamaño = **moda** de la distribución (±10 %), letra cercana (≤0.013) → tipo.
   - **Cajas-con-X** (bocinas/estrobos): pares de diagonales ~45° (10-25 pt) cuya intersección cae dentro de ambos segmentos (`_seg_intersection`, `_xboxes`).
   - **Etiquetas de texto** (extintores, gas, módulos…): tokens ≤12 caracteres que casan con un símbolo del diccionario y no fueron consumidos por un círculo.
   Zonas excluidas: leyenda (20 %×24 %), cajetín (x>0.86), esquina decorativa (0.13). Confianza ALTA (círculo+letra, texto exacto) vs MEDIA (geometría sin etiqueta). Dedup por distancia. Parámetros en `PARAMS` (L30-52).
6. **Clasificación en capas** (Next, `sheet-count/route.ts`): (1) leyenda confirmada → (2) `symbol_library` por firma (`circulo|P`, `texto|E-1`, `circulo|~N`) → (3) **lectura de glifos**: los círculos sin clasificar se recortan en UN mosaico (`build_glyph_mosaic`, 12 columnas, zoom 6) y se mandan a Claude en una sola llamada para leer la marca interna y mapearla por la leyenda (L217). "La geometría encuentra; la visión solo lee lo encontrado."
7. **Persistencia.** Se insertan `takeoff_detections` (tipo, confianza, firma, posición, estado `detectado`) y candidatos descartados; la hoja pasa a `en_verificacion` (L251-318).
8. **Verificación en el visor** (`verification-viewer.tsx`): marcadores por tipo, dudosos, selección click-a-click/rectángulo, acciones masivas, rescate de candidatos, atajos `C/X/A/N/P`, revisión guiada. Cada acción va al escritor batch `POST /api/takeoff/corrections` (eventos append-only → aplica a `takeoff_detections`, aprende en `symbol_library` con propagación por firma similar, registra en `takeoff_correction_events`).
9. **Aprobación (`POST /api/takeoff/approve`).** Requiere `has_org_role`; consolida cantidades por `element_key` en `takeoff_results` (estados activos `detectado, confirmado, reclasificado, agregado_manual`), mueve evidencia a `takeoff-evidence` y **borra el PDF** de `takeoff-temp`. Las cantidades alimentan el cálculo de costos de Nexus.
10. **Límites declarados en el código/notas:** círculos idénticos sin marca no se distinguen automáticamente; el cacheo del glifo como firma geométrica y las zonas de exclusión marcables están pendientes (`TAKEOFF-ESTADO.md` §"DÓNDE QUEDAMOS").

### 7.2 Análisis de pliegos de cargos / memorial con IA (`POST /api/takeoff/scope-analyze`)
1. El PDF del pliego se sube a `takeoff-temp` y se crea `takeoff_scope_docs` (`calculo/pliego/[docId]/page.tsx`).
2. **Paso "extraer"**: Next descarga el PDF y lo convierte a **markdown con anclas de página** usando `mupdf` WASM (`extractPdfMarkdown`: encabezados por tamaño de fuente; página con <80 caracteres útiles → `needsVision`). "Código primero: la IA recibe documento estructurado." Fuente: `src/lib/takeoff/extract.ts` L1-16.
3. **Paso "lote"**: el documento se parte en fragmentos (`chunkPages`) y cada lote se manda **en paralelo** a Claude (`EXTRACT_MODEL = "claude-opus-4-8"`, elegido explícitamente: "la confianza en la información manda sobre el costo", L24-26); las páginas pobres en texto van como imagen (`renderPageJpeg`). Cada ítem extraído se guarda en `takeoff_scope_items` con `category` (técnica, `SCOPE_TECH_CATEGORIES`, o de riesgo, `SCOPE_RISK_CATEGORIES`), `system_type` (o null si aplica a todo el proyecto), `description`, `quote` (cita textual ≤300 caracteres que sustenta el ítem), `manufacturer`/`model` y `page_ref` (anclas `[p. N]` del texto) — prompt en L69-76, inserción L267-331.
4. **Paso "síntesis"**: una llamada final consolida requisitos y riesgos, sugiere los `takeoff_systems` a cotizar (L371-418) y escribe `takeoff_scope_status`.
5. El navegador repite el POST hasta `done=true` (progreso visible); al terminar se borra el PDF de `takeoff-temp` (L443). Cada llamada pasa por `gateAiRequest` (switch, rate-limit, presupuesto, BYOK) y se contabiliza en `ai_usage`.
6. Salida: informe de alcance en pantalla y en PDF (`components/takeoff/scope-report.tsx`, `scope-pdf-button.tsx`, `scope-report-pdf.tsx`). Pendiente declarado: "Lote 3.9 — contraste con pliego" (cruzar conteo vs pliego) — `TAKEOFF-ESTADO.md`.

### 7.3 Generación de PDF editorial (survey-engine)
`POST /render*` con `X-Engine-Secret` → valida color de marca (`^#[0-9A-Fa-f]{6}$`) → descarga logo/fotos/firmas por URL firmada con guardas anti-SSRF y límites → escribe JSON + plantilla `.typ` en un tmp → `typst compile` con timeout → devuelve el PDF. Fuente: `survey-engine/app/main.py` L1-10, L440-470, L412, L529.

### 7.4 Oportunidad → cotización → proyecto
Oportunidad `abierta` → `en_calculo` (estimación Nexus con cascada y Gantt) → `propuesta_enviada` (`registrar_envio_propuesta`, `opportunity_sends`, "listas para enviar" en el CRM) → `en_revision`/`negociacion` → `ganada` → `crear_proyecto_desde_oportunidad` crea el proyecto PM. Fuente: `src/lib/crm.ts`; `components/crm/listas-para-enviar.tsx`; `supabase/migrations/20260816230000_proyecto_desde_oportunidad_ganada.sql`.

---

## 8. Motores deterministas (equivalente a "motor nutricional"): fórmulas replicables

- **Cascada de cotización** (`src/lib/nexus/calc.ts`, test `calc.test.ts` L21-53): `base = material + mo + herramienta + flete`; `indOficina = base×10%`; `indCampo = base×2%`; `financiamiento = (base+ind)×2%`; `utilidad = (base+ind+fin)×20%`; `subtotal`; `ITBMS = subtotal×7%`; `margen = utilidad/subtotal ≈ 16.67%`; ITBMS de compra 7 % sobre lo comprado (no M.O.). Lineal: total agregado == suma por ítem. `DEFAULT_PARAMS` editables por org (`nexus_settings`).
- **EVM** (`src/lib/metrics.ts`): `evm(snapshot)` → PV, EV, AC, SPI = EV/PV, CPI = EV/AC; `healthFromSpi`; `taskPlanPct`; `ganttCurve(leaves, …)` sintetiza plan/real día a día desde el Gantt cuando no hay `progress_snapshots`.
- **Programación del Gantt de cotización** (`src/lib/nexus/schedule.ts`): días hábiles, secuencial, categoría "paralelo" arranca junto a la anterior; misma función para pantalla y Excel.
- **Punch list** (`src/lib/punch.ts`): `daysUntil`, `dueState`, `isAlerting`, `dueLabel`.
- **FAT/SAT** (`src/lib/fatsat.ts`): `countResults`, `deriveStatus` (pass/fail/na → approved / approved_with_observations / rejected).
- **Importador de hojas** (`src/lib/hoja-importada.ts`): `normalizarCelda` (fórmula → valor cacheado; hipervínculo → texto; errores de Excel descartados), `detectarDelimitador`, `parseCsv` (BOM, `;`, comillas escapadas, CRLF).
- **Detección geométrica** (`takeoff-engine/app/engine.py` `PARAMS`): ver §7.1 paso 5.

---

## 9. Lo que NO está construido o está a medias (no afirmarlo)

| Tema | Estado real | Fuente |
|---|---|---|
| Pruebas de aislamiento RLS automatizadas | No existen en el repo ni en CI | `vitest.config.ts` L6-8 |
| Esquema completo versionado | Solo 21 migraciones en git; 58 de las 67 tablas no tienen DDL en el repo (aplicado por MCP) | `ls supabase/migrations`; `BUILD-PLAYBOOK.md` §5 |
| `FORCE ROW LEVEL SECURITY` | Afirmado en notas, 0 apariciones en migraciones del repo | `TAKEOFF-ESTADO.md`; grep |
| Takeoff: lectura de glifos | Implementada pero **"[PRIORIDAD] validar"** (riesgo: alineación del recorte con rotación de página) | `TAKEOFF-ESTADO.md` §"DÓNDE QUEDAMOS" |
| Takeoff: cacheo de glifo como firma, zonas de exclusión marcables (2.3), undo/redo (3.7), sincronía lista↔plano (3.5), contraste con pliego (3.9), extracción de firma retroactiva | Pendientes declarados ("Alto puesto el 2026-07-15") | `TAKEOFF-ESTADO.md` |
| `takeoff_cable_params` / `takeoff_calibration` | Tablas existen en tipos; no hay uso en componentes del visor (grep `calibr|cable_params` en `components/takeoff` → 0; solo `lib/takeoff/catalog.ts` menciona "cable") | grep |
| Motor de conteo: escalado horizontal | 1 worker, cola en memoria ("para escalar, mover a Redis/DB — hoy no hace falta") | `takeoff-engine/Dockerfile` |
| Spec detallada del módulo de planos | `INSTRUCCIONES_MODULO_CALCULO_PLANOS.md` existe localmente pero **no está en git** | `git ls-files \| grep INSTRUCCIONES` → vacío; `TAKEOFF-ESTADO.md` L3-4 |
| CSP | "Sin CSP por ahora … se deja para post-demo" | `next.config.ts` L8-11 |
| Correo transaccional | No hay proveedor (0 referencias) | grep |
| Proveedores de IA alternativos | Enum `ai_provider` incluye `openai`, `google`, pero solo hay SDK e implementación de Anthropic | `database.types.ts`; `package.json` |
| Portales declarados en `notification_portal` sin módulo | `mantenimiento`, `almacen`, `caja_chica`, `viaticos`, `rrhh` existen solo en el enum ("módulos que aún no existen") | `supabase/migrations/20260815220000_notificaciones.sql` L11-13 |
| Purga de notificaciones | RPC existe, ningún cron la invoca en el repo | — |
| README | Es el boilerplate de `create-next-app`, sin documentación del producto | `README.md` |
| Tests de componentes/E2E | Playwright se usa como smoke manual "de un solo uso y se desinstala"; no hay E2E en CI | `BUILD-PLAYBOOK.md` §2 |
| Sentry: subida de source maps | Depende de `SENTRY_AUTH_TOKEN`; slug del proyecto marcado como TODO | `next.config.ts` L40-44 |

---

## 10. Logos, branding, capturas y seeds

| Qué | Ruta | Nota |
|---|---|---|
| Capturas comerciales | `docs/comercial/Modus-1-reporte-diario-IA.png`, `Modus-2-costos.png`, `Modus-3-inventario.png`, `Modus-4-calculo-de-planos.png` | 4 pantallas listas para portafolio (revisar que no muestren datos de clientes) |
| Flyer y logo | `docs/comercial/Modus-PM-Flyer.pdf`, `docs/comercial/Modus-PM-logo-e-imagenes.zip`, `docs/comercial/Nexera-logo.png` | — |
| Íconos PWA | `public/icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png` | — |
| Logo del vendedor | `public/nexera-logo.png` | — |
| Logo de cliente real | `public/<cliente>-logo.png` | **No usar** |
| Capturas de ayuda en app | `public/help/calculo/{pliego-subir,sistema}.png`, `public/help/costos/{importar,tabla}.png`, `public/help/inventario/lista.png`, `public/help/reportes/nuevo.png` | 6 capturas |
| Marca por tenant (código) | `src/lib/brand.ts` (`DEFAULT_BRAND`, `brandFromOrg`, `ORG_BRAND_COLUMNS`); Excel con navy `#0F2044` + Calibri | `src/lib/nexus/excel.ts` L2-3 |
| Seeds de demo | `src/lib/nexus/seed.ts` + RPC `nexus_seed_org_defaults` (catálogo/parámetros por org); `ejemplo-costos.csv` (5 filas de costos de ejemplo: Código, Descripción, Categoría, Presupuesto, Comprometido, Real) | No hay seed SQL de proyectos/demo |
| Método de trabajo | `BUILD-PLAYBOOK.md` (principios, verificación, patrones), `TAKEOFF-ESTADO.md` (estado del motor) | — |
