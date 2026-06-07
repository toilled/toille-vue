# toille-vue

A personal portfolio and experimental sandbox built with Astro + Vue islands.

## Architecture

Migrated from a Vue 3 SPA (Vite + SSR) to **Astro with islands architecture**:

- **Static HTML** — Portfolio content rendered at build time, zero JavaScript overhead
- **Vue islands** — Interactive components (3D city, games) hydrate independently via `client:load`, `client:visible`, `client:idle`
- **3D Cyberpunk City** — `client:visible` island, loads only when scrolled into view
- **Game pages** — `/checker`, `/noughts-and-crosses`, `/ask`, `/quiz` — standalone Astro pages with Vue islands

## Setup

```bash
npm install
npm run dev     # Dev server
npm run build   # Static build to dist/
npm test        # Unit tests
```

## Project Structure

- `src/pages/*.astro` — Astro pages (file-based routing)
- `src/layouts/BaseLayout.astro` — HTML shell with is:global styles
- `src/components/*.vue` — Vue components used as islands
- `src/components/AppShell.vue` — Header/menu/modals island (client:idle)
- `src/game/` — Three.js 3D game engine
- `src/utils/` — Shared utilities (audio, city background, etc.)
- `src/configs/` — Page and title configuration
