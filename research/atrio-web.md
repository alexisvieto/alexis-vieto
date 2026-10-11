# Sitio web de Atrio (atrioph.net) — ficha breve de hechos verificables

Repo: `C:\dev-atrio-web`. Fecha de lectura: 2026-10-11. Solo lectura; no se abrieron `Instagram/`, `Branding/`, `Image/` ni `Atrio Info/` (material interno según `CLAUDE.md` L26-31).
Rutas relativas al repo. "L" = línea.

Qué es (`CLAUDE.md` L3): sitio oficial de Atrio PH, plataforma de administración de propiedad horizontal en Panamá, producto de Nexera. Dominio `www.atrioph.net`; app en `app.atrioph.net/login` (`CLAUDE.md` L56). Tagline "One app. One community." (L57).

## Stack

| Pieza | Versión / detalle | Fuente |
|---|---|---|
| SPA estática: React + Vite, build commiteado en la raíz y servido por Vercel sin build step; rewrites a `/index.html` | React `^19.2.8`, Vite `^8.2.0` (`@vitejs/plugin-react-swc ^4.3.3`) | `site/package.json` L21-22, L16; `vercel.json`; `CLAUDE.md` L5-13 |
| TypeScript | `~6.0.2`; build = `tsc --noEmit && vite build` | `site/package.json` L15, L9 |
| Tailwind CSS v4 | `^4.3.3`, tokens en `@theme` | `site/package.json` L20, L25; `site/src/styles/index.css` L7-27 |
| Router | `react-router-dom ^7.18.2` | `site/package.json` L24 |
| Animación en el sitio | `motion ^12.43.0` | `site/package.json` L23 |
| Video programático | Remotion `^4.0.503` (`remotion`, `@remotion/cli`, `@remotion/player`, `@remotion/google-fonts`): las animaciones del sitio son composiciones Remotion reproducidas con `<Player>` (`HeroPlayer`, `DashboardPlayer`, `AtrioChatPlayer`, `ProyectoPlayer`, `PhoneAppShowcase`) y también se renderizan a MP4 para redes | `site/package.json` L17-19, L26; `site/src/components/*Player.tsx`; `CLAUDE.md` L41-42 |
| Fuentes | Sora (display, 600/700), Space Grotesk (UI, 400/500/600), JetBrains Mono (400/500), cargadas de forma determinística en Remotion | `site/src/styles/index.css` L21-23; `site/src/remotion/lib/fonts.ts` L1-20 |
| Despliegue | `git push main → GitHub → Vercel`; DNS en Namecheap | `CLAUDE.md` L5-13 |

## Páginas (6 rutas en `site/src/App.tsx` L17-23; mismas 6 URLs en `sitemap.xml`)

`/` (Home), `/producto`, `/modulos`, `/ia`, `/transparencia`, `/demo`; comodín `*` → Home. Archivos: `site/src/pages/{Home,Producto,Modulos,IA,Transparencia,Demo}.tsx`. Componentes: `Nav`, `Footer`, `Layout`, `Reveal`, `WhatsAppFab` (botón flotante), `ui.tsx`.

Formulario de demo: sin backend; compone la solicitud y la abre en WhatsApp (`openWhatsApp`) (`site/src/pages/Demo.tsx` L6-11, L29-33); alternativa `mailto:comunidad@atrioph.net` (L108, L194). WhatsApp de ventas +507 6918-8423 (`CLAUDE.md` L59).

## Remotion: 25 composiciones registradas (`grep -c "<Composition" site/src/remotion/Root.tsx`)

`HeroIntro` (+Square, Portrait45, Reel), `DashboardLive` (+Social, Compact), `AtrioChat` (+Social, Compact), `ProyectoLive` (+Social, Compact), `ResidentApp` (+Reel), `GaritaTablet` (+Social), `ApolloIntro`, `ApolloKinetic`, `SosReel`, `ComercialMaster`, `ComercialMaster45`, `ExplodedModules`, `RobotHello`, `CarouselSlide`. Código en `site/src/remotion/compositions/`. El símbolo "Prisma" está definido como 3 caras SVG animables por separado (`site/src/remotion/lib/brand.ts` L24-41).

## Branding (rutas)

- Logos/símbolo: `brand/atrio-prisma-color.svg`, `brand/atrio-prisma-blanco.svg`, `brand/atrio-appicon.svg`, `favicon.svg`, `icons.svg`. Mascota robot: `brand/atrio-robot-frontal.png`, `brand/atrio-robot-frontal-alpha.png`.
- OpenGraph: `og.jpg`. Dossier: `conocenos.pdf` (6 MB).
- Colores (`site/src/styles/index.css` L9-18; igual en `site/src/remotion/lib/brand.ts` L10-20): azul `#2C5BCB`, azul profundo `#1A3C86`, azul claro `#7B9BE8`, tinta `#0F1E3D`, fondo `#FBFCFE`, superficie `#FFFFFF`, borde `#EEF1F7`, texto 2 `#5A6680`, texto 3 `#8A93A8`. Radios 10/16 px (L26-27).
- Capturas útiles para el portafolio (en `img/`): `building-3d.jpg`, `persona-estresada.jpg`, `proj-cotizaciones.png`, `proj-ganadora.png`, `proj-grafica.png`. Las capturas de pantalla de la app no están en el repo: las pantallas (dashboard, chat, app de residente, tablet de garita, proyectos) están construidas como composiciones Remotion, así que pueden renderizarse a PNG/MP4 con `npx remotion render <Id>` desde `site/`.
- Edificio demo en los materiales: "PH Alta Vista" (marca blanca) (`CLAUDE.md` L54). Moneda dólar; tono sobrio, pilar "Transparencia" (L55, L60).

## Números

| Métrica | Valor | Comando |
|---|---|---|
| Rutas | 6 | `grep -c 'path=' site/src/App.tsx` (7 incl. comodín) |
| Composiciones Remotion | 25 | `grep -c "<Composition" site/src/remotion/Root.tsx` |
| Archivos en `site/src` | 73 | `find site/src -type f \| wc -l` |
| Commits | 49, del 2026-06-26 al 2026-08-10 | `git log --oneline \| wc -l`; `git log --format=%ad --date=short` |
