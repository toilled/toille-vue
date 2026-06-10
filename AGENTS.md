## Checklist

Before marking any task complete, run:

- `npm run typecheck` — TypeScript check via vue-tsc
- `npm test` — Vitest unit tests
- `npm run lint` — ESLint
- `npx fallow --format json --quiet 2>/dev/null || true` — Fallow codebase analysis
