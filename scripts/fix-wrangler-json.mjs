import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const distDir = join(dir, '..', 'dist');
const serverDir = join(distDir, 'server');
const wranglerPath = join(serverDir, 'wrangler.json');
const workerPath = join(distDir, '_worker.js');

// --- Patch wrangler.json ---
// Pages rejects "main" in the config, so strip it.
// Keep only Pages-compatible fields.
const config = JSON.parse(readFileSync(wranglerPath, 'utf-8'));

delete config.kv_namespaces;
delete config.main;

const pagesAllowed = new Set([
  'name',
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

// --- Create _worker.js entry point ---
// Cloudflare Pages auto-discovers functions only at the root output
// directory via _worker.js or functions/ subdirectory.
// Since the adapter puts the SSR entry at server/entry.mjs,
// create a _worker.js that re-exports it.
const entryRel = './server/entry.mjs';
const reexport = `export { default as default } from ${JSON.stringify(entryRel)};\n`;

if (!existsSync(workerPath) || readFileSync(workerPath, 'utf-8') !== reexport) {
  writeFileSync(workerPath, reexport);
}
