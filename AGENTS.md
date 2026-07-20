## Checklist

Before marking any task complete, run:

- `npm run typecheck` — TypeScript check via vue-tsc
- `npm test` — Vitest unit tests
- `npx vitest run src/integrations/` — Integration tests (API handlers, component + service chains, SSR rendering)
- `npm run test:e2e` — Playwright E2E tests (requires chromium dependencies)
- `npm run format` — Prettier format check
- `npm run lint` — ESLint
- `npx fallow dead-code --quiet` — Fallow dead-code analysis (unused exports, files, types, dependencies)
- `npx fallow dupes --quiet` — Fallow code duplication check
- `npx fallow health --quiet` — Fallow code health (complexity, maintainability, hotspots)
