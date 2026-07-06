import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const distDir = join(dir, '..', 'dist');
const serverDir = join(distDir, 'server');
const clientDir = join(distDir, 'client');
const wranglerPath = join(serverDir, 'wrangler.json');
const workerPath = join(distDir, '_worker.js');

// --- Patch wrangler.json ---
// Strip Workers-only fields; keep only Pages-compatible keys.
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
// Pages auto-discovers SSR function only via _worker.js or functions/.
const entryRel = './server/entry.mjs';
const reexport = `export { default as default } from ${JSON.stringify(entryRel)};\n`;

if (!existsSync(workerPath) || readFileSync(workerPath, 'utf-8') !== reexport) {
  writeFileSync(workerPath, reexport);
}

// --- Move client assets to root ---
// In _worker.js mode, env.ASSETS points to the output root (dist/),
// but Astro puts static assets in dist/client/. Move them up so
// env.ASSETS can serve them at their expected paths.
function copyRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

if (existsSync(clientDir)) {
  copyRecursive(clientDir, distDir);
}
