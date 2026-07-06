import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const wranglerPath = join(dir, '..', 'dist', 'server', 'wrangler.json');

const config = JSON.parse(readFileSync(wranglerPath, 'utf-8'));

delete config.kv_namespaces;
delete config.assets;
delete config.images;
delete config.definedEnvironments;
delete config.exports;
delete config.ai_search_namespaces;
delete config.ai_search;
delete config.agent_memory;
delete config.secrets_store_secrets;
delete config.artifacts;
delete config.unsafe_hello_world;
delete config.flagship;
delete config.worker_loaders;
delete config.ratelimits;
delete config.vpc_services;
delete config.vpc_networks;
delete config.python_modules;
delete config.previews;
delete config.cloudchamber;

writeFileSync(wranglerPath, JSON.stringify(config));
