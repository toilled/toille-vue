## CI vs Local Environment Notes

Key differences that affect CI behavior:

- **`functions/ssr-app.js`** exists locally (~776KB build artifact) but NOT in CI's fresh checkout. Any import of it (e.g. in `functions/[[path]].ts`) triggers a fallow `unresolved-import` issue in CI but not locally. Use `// fallow-ignore-next-line unresolved-import` directly above the import line to suppress.
- **`fallow-ignore-next-line`** targets only the immediately following line. Place it directly above the line to suppress, not higher up.
- **Fallow CI action** installs the latest version from npm (not the project-local one). The cache key is based on `package.json` hash only — `.fallowrc.json` changes do not invalidate the cache.
- **Playwright** is not installed in the `a11y.yml` CI workflow by default — use `npx playwright install --with-deps chromium` in the workflow.
- **`DemoMode.spec.ts`** mock factory: do not use `ref()` in mock factories due to vitest hoisting — use plain objects `{ value: false }` instead.

## Checklist

Before marking any task complete, run:

- `npm run typecheck` — TypeScript check via vue-tsc
- `npm test` — Vitest unit tests
- `npx vitest run src/integrations/` — Integration tests (API handlers, component + service chains, SSR rendering)
- `npm run test:a11y` — Vitest accessibility tests (axe-core + Vue Test Utils)
- `npm run test:e2e` — Playwright E2E tests (requires chromium dependencies)
- `npm run format` — Prettier format check
- `npm run lint` — ESLint
- `npx fallow dead-code --quiet` — Fallow dead-code analysis (unused exports, files, types, dependencies)
- `npx fallow dupes --quiet` — Fallow code duplication check
- `npx fallow health --quiet` — Fallow code health (complexity, maintainability, hotspots)
