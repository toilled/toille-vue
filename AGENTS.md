## Checklist

Before marking any task complete, run:

- `npm run typecheck` — TypeScript check via vue-tsc
- `npm test` — Vitest unit tests
- `npm run lint` — ESLint
- `npx fallow dead-code --quiet` — Fallow dead-code analysis (unused exports, files, types, dependencies)
- `npx fallow dupes --quiet` — Fallow code duplication check
- `npx fallow health --quiet` — Fallow code health (complexity, maintainability, hotspots)
