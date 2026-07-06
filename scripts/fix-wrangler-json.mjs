import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const wranglerPath = join(dir, '..', 'dist', 'server', 'wrangler.json');

const config = JSON.parse(readFileSync(wranglerPath, 'utf-8'));

// Remove auto-injected session KV binding
delete config.kv_namespaces;

// Keep only fields compatible with Cloudflare Pages
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
