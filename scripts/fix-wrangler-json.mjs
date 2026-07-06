import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const distDir = join(dir, '..', 'dist');
const serverDir = join(distDir, 'server');
const wranglerPath = join(serverDir, 'wrangler.json');

// Read the generated config
const config = JSON.parse(readFileSync(wranglerPath, 'utf-8'));

// Remove auto-injected session KV binding
delete config.kv_namespaces;

// Keep only fields compatible with Cloudflare Pages.
// Both "main" and "pages_build_output_dir" are needed:
// "main" tells Pages where the SSR function entry point is,
// "pages_build_output_dir" identifies this as a Pages project.
const pagesAllowed = new Set([
  'name',
  'main',
  'pages_build_output_dir',
  'compatibility_date',
  'compatibility_flags',
  'vars',
  'd1_databases',
]);

for (const key of Object.keys(config)) {
  if (!pagesAllowed.has(key)) {
    delete config[key];
  }
}

writeFileSync(wranglerPath, JSON.stringify(config));

// Cloudflare Pages auto-discovers functions only at dist/_worker.js
// or dist/functions/. Since the adapter puts the SSR entry at
// dist/server/entry.mjs, create a redirect at dist/_worker.js
// that re-exports the SSR entry.
const entryPath = join(serverDir, 'entry.mjs');
const workerPath = join(distDir, '_worker.js');

if (!existsSync(workerPath)) {
  // Detect the runtime entry from the generated code
  const entry = readFileSync(entryPath, 'utf-8');

  // Build redirect: re-export the default export from the real entry
  const redirect = [
    `export { default as default } from "./server/entry.mjs";`,
  ].join('\n');

  writeFileSync(workerPath, redirect);
}
