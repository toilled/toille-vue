build:
	bun run build

ci:
	bun install

dev:
	bun run dev

preview:
	$(MAKE) build
	bun run serve

lint:
	bunx eslint .
