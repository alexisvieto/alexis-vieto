# Sitio web de Nexera (nexerai.io) — ficha de hechos verificables

Repo: `C:\dev\nexera-web`. Fecha de lectura: 2026-10-11. Solo lectura; no se abrió `.env.local`, `RESUME.md` ni `resumen-nexera.md`.
Rutas relativas al repo. "L" = línea.

Qué es (`CLAUDE.md` L3-5): sitio corporativo de Nexera (fábrica de software con IA) + CRM de ventas interno en `/propuestas/*` y kit de ventas en `/ventas/*` (tarjetas digitales, decks). Host canónico `https://www.nexerai.io` (`src/app/layout.tsx` L36-45; `src/app/sitemap.ts` L5).

## Stack

| Pieza | Versión | Fuente |
|---|---|---|
| Next.js (App Router; SSR para CRM, páginas públicas estáticas) | `16.2.6` | `package.json` L17; `CLAUDE.md` L10 |
| React / React DOM | `19.2.4` | `package.json` L19-20 |
| TypeScript | `^5` (`typescript.ignoreBuildErrors: true` en build) | `package.json` L33; `next.config.ts` L7 |
| Tailwind CSS | `^4` (`@tailwindcss/postcss`), tokens en `@theme inline {}` sin `tailwind.config` | `package.json` L25, L32; `src/app/globals.css` L6-40 |
| Supabase | `@supabase/supabase-js ^2.45.4`, `@supabase/ssr ^0.5.2`; Auth con cookies; RPCs `SECURITY DEFINER` | `package.json` L12-13; `src/lib/supabase/client.ts`, `server.ts` |
| Auth middleware | `src/proxy.ts` protege `/propuestas/*` y `/ventas/*` con sesión Supabase (en Next 16 "middleware" se llama "proxy") | `src/proxy.ts` L6-19 |
| IA | Google Gemini (`gemini-2.5-flash` por defecto, cadena de fallback `2.5-pro`, `2.0-flash-001`, `2.0-flash-lite-001`; reintento en 429/502/503/504) para generar propuestas | `src/app/api/propuestas/generar/route.ts` L9-23 |
| Animación | `framer-motion ^12.40.0` | `package.json` L14 |
| 3D | `three ^0.180.0` (componente `Brain3D`) | `package.json` L22; `src/components/sitio-operativo/Brain3D.tsx` |
| Kanban | `@dnd-kit/core ^6.3.1`, `sortable ^10.0.0` | `package.json` L9-11 |
| Gráficas | `recharts ^2.15.0` | `package.json` L21 |
| PDF | `@react-pdf/renderer ^4.5.1` (decks y propuestas) | `package.json` L11; `next.config.ts` L4 |
| QR | `qrcode ^1.5.4` | `package.json` L18 |
| Iconos | `lucide-react ^1.16.0` | `package.json` L16 |
| Fuentes | Space Grotesk (display), Inter (cuerpo), JetBrains Mono (mono) vía `next/font/google` | `src/app/layout.tsx` L2, L8-24 |
| Despliegue | Vercel (apex → www redirect) | `src/app/layout.tsx` L36-45 |
| Lint | ESLint 9 + `eslint-config-next` | `package.json` L30-31 |

Migraciones SQL: no están en este repo (`find . -name "*.sql"` → vacío). Las tablas/RPC se conocen por el código: `profiles`, `card_visits`, RPC `get_public_card`, `resolve_public_profile_id` (`src/lib/profiles/queries.ts` L57; `src/app/api/cards/[slug]/visit/route.ts` L67, L81).

## Páginas (31 `page.tsx`; comando: `find src/app -name page.tsx | wc -l`)

Públicas (en `src/app/sitemap.ts` L9-18): `/`, `/services`, `/freshops`, `/modus`, `/modus-hse`, `/nexguard360`, `/crm`, `/sitio-operativo`, `/pricing`, `/contact`. Además `/safety-epp`, `/v/[slug]`, `/auth/forgot-password`, `/auth/reset-password`.
Nota: `/sitio-operativo` figura en el sitemap pero no existe `src/app/sitio-operativo/page.tsx` (hoy es una sección `#sitio-operativo` en el home; `src/app/page.tsx` L124 lo comenta como pendiente).

Privadas (tras login, `src/proxy.ts` L16-19):
- CRM `/propuestas`: `/propuestas` (dashboard con KPIs, gráfica por mes, por producto, donut por vendedor, actividad reciente: `src/app/propuestas/dashboard/*`), `/propuestas/generar` (editor de propuesta con IA), `/propuestas/[slug]` (vista, concretar, marcar perdida), `/propuestas/pipeline` (kanban + seguimientos), `/propuestas/clientes`, `/propuestas/cliente/[id]`, `/propuestas/equipo`, `/propuestas/login`.
- Ventas `/ventas`: `/ventas`, `/ventas/perfil` (editor del perfil/tarjeta), `/ventas/decks` + 6 decks (`freshops`, `modus`, `modus-hse`, `nexera-overview`, `nexguard360`, `sitio-operativo`), `/ventas/login`.

API routes (`src/app/api/`): `cards/[slug]/qr.png`, `cards/[slug]/qr.svg`, `cards/[slug]/visit`, `decks/<6>/pdf`, `propuestas/generar`, `propuestas/pdf`, `propuestas/[slug]/pdf`; `auth/callback`.

Productos del menú (`src/lib/constants.ts` L31-70): FreshOps, Modus PM, Modus HSE, NexGuard360, Nexera CRM, + Sitio Operativo (a medida). Precios por producto en `PRICING_PLANS` (L79-327) y `SITIO_OPERATIVO_PLANS` (L329 en adelante). Stats del home: 100 % generación nativa con IA, 25+ años, 4 plataformas SaaS, 6 industrias (L72-77).

## Qué hace la vCard `/v/alexis`

- Ruta dinámica `src/app/v/[slug]/page.tsx` (`force-dynamic`, L6): lee el perfil con la RPC `get_public_card(p_slug)` `SECURITY DEFINER` que devuelve solo campos públicos del perfil activo (el rol `anon` no puede leer `email`, `telefono`, `whatsapp` directamente; bloquea scraping del directorio) (`src/lib/profiles/queries.ts` L44-61). Genera metadata OpenGraph tipo `profile` con foto (`page.tsx` L12-37). Si no existe: `not-found.tsx`.
- `CardView.tsx` (cliente, framer-motion con `useReducedMotion`): al montar registra la visita con `POST /api/cards/<slug>/visit` (L31-36); botón "Guardar contacto" que genera y descarga un `.vcf` vCard 3.0 con `FN`, `N`, `TITLE`, `ORG:Nexera`, `EMAIL`, `TEL`, `URL LinkedIn`, `URL https://nexerai.io`, `NOTE` (L38-49, L648-669); enlaces prellenados a WhatsApp (`wa.me` con saludo por nombre), correo y "agendar llamada" (L53-73); colores por producto (L16-21).
- Tracking de visitas sin IP cruda: `card_visits` guarda `user_agent`, `referer`, `country_code` (header `x-vercel-ip-country`) y `ip_hash` SHA-256 salado por slug (`src/app/api/cards/[slug]/visit/route.ts` L16-23, L75-87); responde 204.
- QR de la tarjeta: `GET /api/cards/<slug>/qr.svg?theme=dark|light` (corrección de error H, 512 px, cache 1 h/1 día) apunta a `/v/<slug>` (`qr.svg/route.ts` L13-18, L48-58); también `qr.png`.
- Campos del perfil (`src/lib/profiles/types.ts` L6-24): `slug, nombre, cargo, subtitulo, email, telefono, whatsapp, foto_url, linkedin_url, bio_corta, bio_extendida, achievements_personales, role (admin|sales|viewer), activo`.

## Formulario / backend

- `/contact`: el formulario solo hace `e.preventDefault(); setSubmitted(true)`; no envía a ningún backend (`src/app/contact/page.tsx` L11-14, L66). Datos de contacto mostrados: `info@nexerai.io`, "+507 6000-0000" (placeholder), Ciudad de Panamá (L17-19).
- Backend real existe para el CRM: generación de propuestas con Gemini (`src/app/api/propuestas/generar/route.ts`), PDFs con `@react-pdf/renderer` (`src/decks/*Pdf.tsx`, `src/proposals/ProposalPdf.tsx`), persistencia en Supabase (`src/lib/proposals/*`, `src/app/propuestas/pipeline/pipelineQueries.ts`).

## Fotos del equipo y branding de Nexera

- Foto del equipo: `public/team/alexis.webp` (79 KB). Única foto de equipo en el repo.
- Logos: `public/nexera-logo.png`, `public/nexera-logo-full.png`, `public/nexera-mark.png`, `src/app/icon.png`, `src/app/favicon.ico`, `public/og.png` (1200×630). Fuente original: `Brand Asset/Nexera Logo.png` (1.9 MB). Logo SVG en código: `src/components/logos/NexeraLogo.tsx` (hexágono + "N" en degradado, `CLAUDE.md` L32). Logos de productos: `src/components/logos/{FreshOps,Modus,ModusHse,NexGuard360,SafetyEPP,Supra}Logo.tsx`.
- Capturas en la raíz del repo (sin referencia en código): `page-1.png`, `n1.png`, `n2.png`, `n3.png`, `n8.png`, `p2.png`…`p8.png`.
- Colores (`src/app/globals.css` L6-30; `CLAUDE.md` L35-40): fondo `#0A0A0A`, superficie `#0D0D0E`, tarjeta `rgba(255,255,255,0.04)`, borde `rgba(255,255,255,0.08)`, texto `#E8EDF5` / `#7B8FAB` / `#3D4A5C`, acento `#00AAFF`, acento 2 `#00D4FF`, hover `#33BBFF`, glow `rgba(0,170,255,0.22)`, destructivo `#EF4444`, navy `#050610`. Acentos por producto (`globals.css` L63-67): FreshOps `#F97316`, Modus `#00AAFF`, HSE `#22C55E`, NexGuard360 `#84CC16`, CRM `#A78BFA`.
- Tipografía: Space Grotesk (display), Inter (cuerpo), JetBrains Mono (mono) (`src/app/layout.tsx` L8-24; `globals.css` L36-38).
- Radios 8/12/20/24 px y pill; easing `cubic-bezier(0.16,1,0.3,1)` (`globals.css` L45-55).
- Tagline/tono: "Engineered Beyond Limits", dark, futurista, AI-first (`CLAUDE.md` L29-31). Title: "Nexera — La próxima era del software empresarial" (`layout.tsx` L26).
- Documentación de diseño: `docs/NEXGUARD360_DESIGN_SYSTEM.md`, `docs/NEXGUARD360_CLAUDE_CODE_BRIEF.md`, `plan.md`.

## Números

| Métrica | Valor | Comando |
|---|---|---|
| Páginas (`page.tsx`) | 31 | `find src/app -name page.tsx \| wc -l` |
| Commits | 70, del 2026-05-26 al 2026-06-02 | `git log --oneline \| wc -l`; `git log --format=%ad --date=short` |
| Decks de venta (web + PDF) | 6 | `ls src/app/ventas/decks`; `ls src/decks` |

## C:\dev-nexus

Irrelevante para el portafolio: contiene solo `Old Nexus/` con 3 archivos (`index.html` 1880 líneas, `main.py` 485 líneas en FastAPI + psycopg2, `requirements.txt`), sin git ni package.json. Código antiguo; no se documenta más.
