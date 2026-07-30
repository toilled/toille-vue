# Convert toille-vue from Vue 3 to Svelte 5

## Overview

Convert the portfolio/interactive 3D experience project **toille-vue** (Vue 3 + TypeScript + Vite + Cloudflare Pages SSR/SSG) to **Svelte 5** (using SvelteKit + TypeScript + Cloudflare Pages adapter). The goal is to eliminate the virtual DOM overhead for improved runtime performance while preserving **100% of functionality, behavior, accessibility, SSR/SSG output, i18n, game logic, and all interactive features**.

## Project Scope

- **64 `.vue` components** → `.svelte` files
- **6 routes** (SPA-style) → SvelteKit file-based routing
- **2 Pinia stores** → Svelte 5 `$state` runes or writable stores
- **12 composables** → Svelte logic (same JS/TS, adapted for Svelte reactivity)
- **26 utility/game TypeScript files** → mostly unchanged (no Vue dependency)
- **vue-i18n** (13 locales) → `svelte-i18n` or custom lightweight solution
- **@unhead/vue** → `@sveltejs/kit` built-in `+page.svelte` `<svelte:head>` or `@unhead/svelte`
- **SSR entry** → SvelteKit server-side rendering (built-in)
- **SSG generation** → SvelteKit `prerender` option + `adapter-static` or custom post-build script
- **Cloudflare Pages function** → SvelteKit `@sveltejs/adapter-cloudflare`
- **Vite config** → SvelteKit project uses `@sveltejs/vite-plugin-svelte` instead of `@vitejs/plugin-vue`
- **Testing** → `@testing-library/svelte` + `vitest` + `playwright`

## Conversion Map: Vue → Svelte 5

| Vue Feature | Svelte 5 Equivalent |
|---|---|
| `ref()` / `reactive()` | `$state()` rune |
| `computed()` | `$derived()` rune |
| `watch()` / `watchEffect()` | `$effect()` rune |
| `onMounted` / `onUnmounted` | `onMount` / `onDestroy` |
| `provide` / `inject` | `setContext` / `getContext` |
| `defineProps` / `defineEmits` | `let { prop } = $props()` / `let { onEvent } = $props()` (callback props) |
| `defineAsyncComponent` | Dynamic `import()` with `{#await}` block |
| `<Transition>` / `<TransitionGroup>` | Svelte `transition:`, `in:`, `out:` directives |
| `v-if` / `v-if-else` / `v-else` / `v-show` | `{#if}` / `{:else if}` / `{:else}` blocks |
| `v-for` | `{#each}` block |
| `v-bind` / `:` | `{prop}` |
| `@click` / `@keydown` etc. | `on:click` / `on:keydown` |
| `.sync` / `v-model` | `bind:prop` |
| `<slot>` / named slots | `<slot>` / `{@render children()}` with snippet props |
| `<Teleport to="...">` | `<svelte:body>` / `<svelte:window>` or manual portal |
| `<KeepAlive>` | Manual state preservation or SvelteKit `{#key}` blocks |
| `defineExpose` | Expose via `export` or callback props |
| `useSlots` / `useAttrs` | `$$slots` / `$$restProps` or `$props()` |
| Pinia `defineStore` | Svelte writable store `writable()` or `$state` in a `.svelte.ts` module |
| `vue-router` (createRouter, router.push, router-view) | SvelteKit `+page.svelte`, `goto()`, `$page` store |
| `vue-i18n` | `svelte-i18n` or manual `$state` store with JSON locale files |
| `@unhead/vue` | `<svelte:head>` in SvelteKit layouts/pages |
| `@vue/server-renderer` (renderToString) | SvelteKit server-side rendering (automatic) |
| `unplugin-auto-import` | Not needed — Svelte 5 exposes nothing globally; import explicitly |
| `unplugin-vue-components` | Not needed — SvelteKit auto-imports from `$lib/components/` |
| `vue-tsc` | `svelte-check` (type-checking CLI) |
| `@vue/test-utils` | `@testing-library/svelte` |
| Vue scoped styles (`<style scoped>`) | Svelte scoped styles (automatic by default) |
| Vue global styles (no scoped) | `<style>` in `+layout.svelte` or global CSS files |
| `ErrorBoundary.vue` | SvelteKit `+error.svelte` or `{#error}` boundary |

## Step-by-Step Instructions

### Phase 1: Scaffold SvelteKit project
1. Create new SvelteKit project with `npx sv create toille-svelte --template minimal --types ts`
2. Install `@sveltejs/adapter-cloudflare`, `svelte-check`, `@testing-library/svelte`, `vitest`, `playwright`
3. Set up `svelte.config.js` with Cloudflare adapter, `kit.outDir`, `kit.files`
4. Configure `vite.config.ts` with `@sveltejs/vite-plugin-svelte`, port 3000, manual chunks for three.js
5. Copy over `tsconfig.json`, `.prettierrc`, `eslint.config.js`, `.env.example`, `.gitignore`, `.fallowrc.json`
6. Copy over all non-Vue files verbatim: game engine (`src/game/`), utils (`src/utils/`), locales (`src/locales/`), configs (`src/configs/`), interfaces (`src/interfaces/`), CSS assets (`src/assets/`), public assets (`public/`), schema.sql

### Phase 2: Routing (SvelteKit file-based)
- `src/routes/+layout.svelte` — Root layout; render header/footer/terminal/desktop/city (replaces App.vue)
- `src/routes/+page.svelte` — Home page (SinglePageContent)
- `src/routes/checker/+page.svelte` — Checker game
- `src/routes/noughts-and-crosses/+page.svelte` — Tic-tac-toe
- `src/routes/quiz/+page.svelte` — Quiz
- `src/routes/playground/+page.svelte` — Code playground
- `src/routes/[...path]/+page.svelte` — Catch-all dynamic page (PageContent)
- `src/routes/+error.svelte` — Error boundary (replaces ErrorBoundary.vue)
- `src/routes/+page.server.ts` — SSR data loading if needed

Implement swipe/keyboard navigation (currently in App.vue) in `+layout.svelte`.

### Phase 3: State management
- Convert `src/stores/gameStore.ts` to `src/lib/stores/gameStore.svelte.ts`:

```ts
// gameStore.svelte.ts
let gameMode = $state(false);
let cityFallback = $state(false);
let isClient = $state(false);
export function getGameStore() {
  return { get gameMode() { return gameMode }, set gameMode(v) { gameMode = v }, ... };
}
```

- Convert `src/stores/uiStore.ts` similarly
- Convert `src/composables/useWindowManager.ts` → `src/lib/stores/windowStore.ts`

### Phase 4: Component conversion (64 files)
Convert each `.vue` file to `.svelte` following the mapping table above.
- Move to `src/lib/components/` (or co-locate with routes)
- `template` → Svelte template syntax
- `<script setup>` → `<script>` with `$state`, `$derived`, `$effect`, `$props()`
- `<style scoped>` → `<style>` (scoped by default in Svelte)
- `<Transition name="fade">` → `transition:fade`
- Async components → `{#await import('./Component.svelte') then { default: C }} <C /> {/await}`
- `inject/provide` → `setContext/getContext`
- `useI18n()` → import from `$lib/i18n.ts`
- `useRouter()`/`useRoute()` → `import { page } from '$app/stores'`, `import { goto } from '$app/navigation'`
- `onMounted` → `onMount` (import from `svelte`)

### Phase 5: i18n
- Replace `vue-i18n` with a Svelte store wrapping locale JSON imports
- `src/lib/i18n.ts`: export a `locale` store (writable), `setLocale()`, `t(key)` function using same JSON files
- Replace `useI18n()` calls with `$t = t()` from the i18n module
- Locale detection, localStorage persistence: same logic, adapted to Svelte context
- Lazy-loading: dynamic `import()` with `$effect` on locale change

### Phase 6: SSR & SSG
- SvelteKit handles SSR automatically via Cloudflare adapter
- For SSG: enable `prerender` in `+page.server.ts` or `+layout.server.ts`, configure `trailingSlash`
- The existing `scripts/generate.mjs` can be replaced by SvelteKit's built-in prerender + `adapter-cloudflare` generating static files
- Copy the Cloudflare `functions/[[path]].ts` logic into SvelteKit's `handle` hook or use `adapter-cloudflare` which handles the request pipeline

### Phase 7: Cloudflare-specific setup
- `wrangler.toml` — reuse as-is
- `schema.sql` — no changes
- `functions/api/scores.ts` — convert to SvelteKit `src/routes/api/scores/+server.ts` (or keep as-is in `functions/` directory; Cloudflare Functions can coexist with SvelteKit)
- `index.html` entry — SvelteKit generates its own; copy only the skip-link and meta tags into `app.html` template

## Testing & Verification Checklist

After conversion, run every check below. **All must pass** with no regressions.

### 1. Type Check
- `npx svelte-check` — Full project type-check (replaces `vue-tsc`)
- Expected: Zero type errors

### 2. Lint & Format (replace Vue-specific rules)
- `npm run lint` — ESLint with `eslint-plugin-svelte`
- `npm run format` — Prettier (same `.prettierrc`)
- Expected: Zero errors, zero warnings

### 3. Unit Tests (convert + verify)
- Rewrite all 44 component test files (`src/components/tests/*.spec.ts`) from `@vue/test-utils` to `@testing-library/svelte`:
  - `mount(Component)` → `render(Component)`
  - `wrapper.find()` → `screen.getByRole()` / `screen.getByText()`
  - `wrapper.vm` → component props/state assertions
  - `wrapper.emitted()` → mock callback props and assert they were called
- Rewrite composable tests: composables are now plain functions with `$state` → test them as standard TS/JS
- Utility and game tests: should work as-is (no Vue dependency)
- Test setup files (`setupThree.ts`, `setupHead.ts`, `setupI18n.ts`): adapt for Svelte testing environment
- `vitest.config.ts`: configure `environment: 'jsdom'`, setup files
- Run: `npx vitest run`
- Expected: All ~44+ tests pass

### 4. Accessibility Tests
- Rewrite all 6 a11y component tests (`src/components/tests/a11y/*.spec.ts`) for Svelte
- Use `@testing-library/svelte` + `vitest-axe`
- Run Playwright a11y test (`e2e/a11y.spec.ts`):
  - Update page selectors for Svelte rendering
  - `npx playwright test e2e/a11y.spec.ts`
- Run: `npm run test:a11y`
- Expected: Zero accessibility violations

### 5. Integration Tests
- Rewrite 3 integration tests (`src/integrations/*.integration.spec.ts`) for SvelteKit API routes & SSR
- `scores-api`: test `fetch('/api/scores')` against SvelteKit server endpoints
- `ssr-rendering`: test that SvelteKit renders pages with correct HTML, title, lang
- Run: `npx vitest run src/integrations/`
- Expected: All pass

### 6. E2E Tests
- Update 3 Playwright E2E tests (`e2e/desktop-mode.spec.ts`, `e2e/homepage.spec.ts`, `e2e/a11y.spec.ts`)
- Adjust selectors for Svelte-rendered DOM (Svelte may generate different attribute patterns)
- Run: `npx playwright test`
- Expected: All E2E tests pass on chromium

### 7. SSR Verification
- Build: `npm run build` (should produce `functions/ssr-app.js` equivalent via SvelteKit + Cloudflare adapter)
- Verify SSR output for every route:
  - Fetch each route and confirm HTML contains rendered content (not empty shell)
  - Confirm `<title>` tags are set correctly
  - Confirm `lang` attribute is set per locale
  - Confirm status codes: 200 for known pages, 404 for unknown
- Verify hydration works: load SSR page, confirm JS boots and interactivity works (click handlers, transitions, etc.)
- Run: Compare SSR output side-by-side with current Vue SSR output — must be semantically identical

### 8. SSG Verification
- Run the build/prerender step
- Verify all 13 locales × N routes generate static HTML files
- Verify each file contains correct title, lang, and rendered content
- Compare output count with current: `locales.length * pages.length`

### 9. Visual & Functional Equivalence (Manual + Screenshot)
- Compare **every page/component visually** between Vue and Svelte versions side-by-side in browser:
  - Home page (scroll all sections)
  - Checker game (play through)
  - Noughts & Crosses (play against AI)
  - Quiz (answer questions)
  - Code Playground (edit and run code)
  - Dynamic content pages (About, Interests, Hidden)
  - 404 page
  - Desktop mode (open windows, move, resize, file explorer)
  - Terminal overlay (test 10+ commands)
  - 3D Cyberpunk City (exploration mode, driving mode, demo mode)
  - All overlays: checker popup, activity popup, joke popup
  - i18n language switching (all 13 locales)
  - Mobile responsive layout (320px, 768px, 1024px widths)
  - Keyboard navigation (arrows, escape)
  - Touch/swipe navigation
  - Clan War mode, multiplayer (MQTT)
  - Accessibility: tab through full page, skip-link, ARIA labels, contrast
- Use Playwright screenshot comparison: capture screenshots for each route/locale/resolution pair and diff
- Expected: No visual regressions; all interactive features work identically

### 10. Performance Inspection
- Compare Lighthouse scores (Vue vs Svelte): Performance, Accessibility, Best Practices, SEO
- Compare bundle sizes (client JS gzipped): `npx vite build` stats
- Compare First Contentful Paint / Time to Interactive in devtools
- Compare memory usage during 3D city operation (Chrome devtools memory tab)
- Expected: Svelte version has smaller bundle size, faster TTI, reduced memory footprint

### 11. Fallow Analysis
- Run: `npx fallow dead-code --quiet` — no new dead code
- Run: `npx fallow dupes --quiet` — no new duplication
- Run: `npx fallow health --quiet` — health score maintained or improved

### 12. CI Workflow Migration
- Update 6 GitHub Actions workflows to use Svelte tooling:
  - `test.yml`: `npm run build` + `npm test` (vitest)
  - `integration.yml`: `npx vitest run src/integrations/`
  - `a11y.yml`: `npm run test:a11y`
  - `lint.yml`: `eslint .` + `prettier --check`
  - `typecheck.yml`: `npx svelte-check`
  - `fallow.yml`: unchanged

### 13. Production Build
- Full build + SSG: `npm run build`
- Deploy to Cloudflare Pages preview environment
- Verify all routes work in production
- Verify API endpoint (`/api/scores`) works with D1 database
- Verify multiplayer (MQTT) still connects

## Files That Do NOT Need Changes

These files have zero Vue dependency and can be copied verbatim:
- All `src/game/` files (city engine, traffic, gang wars, etc.)
- Most `src/utils/` files (except any that import Vue APIs)
- All `src/locales/*.json`
- `src/configs/pages.json`, `src/configs/titles.json`
- `src/interfaces/Page.ts`
- `src/assets/*.css`
- `public/*`
- `schema.sql`
- `wrangler.toml`
- All `.github/workflows/*.yml` (only tool names change)
- `.env.example`
- `Makefile` (adjust commands only)

## Critical Architectural Notes

1. **No virtual DOM**: Svelte 5 compiles away the VDOM entirely. Components that rely on Vue's reactivity system (e.g., deep watchers, `nextTick`, lifecycle hooks) must be converted to use `$state`, `$derived`, `$effect`. Pure game/utility logic is unaffected.

2. **SvelteKit replaces vue-router + SSR**: The `entry-server.ts` and `entry-client.ts` patterns are gone. SvelteKit handles server/client duality internally. The Cloudflare `functions/[[path]].ts` becomes SvelteKit's `adapter-cloudflare` output.

3. **Svelte 5 runes are opt-in per file**: Not all `.svelte` files need runes if they don't use reactive state. Plain JS/TS files cannot use `$state` — keep state management in `.svelte.ts` files.

4. **Transition animations**: Vue `<Transition name="cyberpunk-glitch">` with CSS keyframes can be replicated with Svelte's `transition:` directive using the same CSS. For complex glitch effects, use Svelte's `crossfade` or custom transition functions.

5. **provide/inject pattern**: The `activeSection` and `navigateToSection` provides in App.vue must be converted to Svelte's `setContext('activeSection', ...)` in the root layout.

6. **ErrorBoundary**: Vue's `<ErrorBoundary>` with slots and `onErrorCaptured` maps to SvelteKit's `+error.svelte` for page-level errors, plus manual `{#try}` `{:catch}` blocks for component-level error boundaries.

7. **defineAsyncComponent with SSR check**: `if (import.meta.env.SSR) return { render: () => null }` must be replaced with SvelteKit's `browser` const from `$app/environment` and conditional imports.

## Final verification command sequence

```bash
npm run build          # production build (client + server/SSR + SSG/prerender)
npx svelte-check       # type checking
npm run lint           # eslint
npm run format         # prettier
npm test               # all vitest tests (unit + a11y + integration)
npx playwright test    # E2E tests
npx fallow dead-code --quiet
npx fallow dupes --quiet
npx fallow health --quiet
# Manual: visual comparison, Lighthouse audit, bundle size comparison, memory profiling
```

Do not consider the conversion complete until **all** checks above pass with no regressions and the Svelte version is functionally identical to the Vue version across every route, component, interaction, locale, and screen size.
