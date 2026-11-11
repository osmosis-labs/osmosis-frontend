/**
 * Points the committed (stage) Wrangler configs at the production Workers, for
 * master deploys in `.github/workflows/cf-deploy.yml`.
 *
 *   node scripts/cf-production-config.mjs
 *
 * Rewrites `wrangler.jsonc` and `api-worker/wrangler.jsonc` in place (as plain
 * JSON, comments dropped) so the unchanged `cf:deploy` and `cf:api:deploy`
 * scripts deploy production. It refuses to run outside CI because it edits
 * tracked files, and refuses unless both configs still carry the stage names.
 *
 * Production pair:
 * - osmosis-frontend-api-production: the API Worker, reachable only via the binding.
 * - osmosis-frontend-production: the pages Worker. The traffic router reaches it
 *   over a service binding; workers.dev stays on for direct checks, as before.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { experimental_readRawConfig } from "wrangler";

const webRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const PAGES_CONFIG = path.join(webRoot, "wrangler.jsonc");
const API_CONFIG = path.join(webRoot, "api-worker/wrangler.jsonc");

const STAGE = {
  pagesWorker: "osmosis-frontend-stage",
  apiWorker: "osmosis-frontend-api-stage",
};
const PRODUCTION = {
  pagesWorker: "osmosis-frontend-production",
  apiWorker: "osmosis-frontend-api-production",
  cacheBucket: "osmosis-frontend-production-cache",
};

function fail(message) {
  console.error(`cf-production-config: ${message}`);
  process.exit(1);
}

function readRawConfig(configPath) {
  const { rawConfig } = experimental_readRawConfig({ config: configPath });
  if (!rawConfig || typeof rawConfig !== "object") {
    fail(`could not read ${configPath}`);
  }
  return structuredClone(rawConfig);
}

function expectName(config, expected, configPath) {
  if (config.name !== expected) {
    fail(
      `${configPath} names ${config.name}, expected ${expected}; refusing to rewrite`
    );
  }
  if (config.env) fail(`${configPath} has wrangler environments; not handled`);
}

/** Replaces the service name of one existing binding; fails if it is missing. */
function rebindService(config, binding, service) {
  const entry = config.services?.find((s) => s.binding === binding);
  if (!entry) fail(`pages config has no \`${binding}\` service binding`);
  entry.service = service;
}

function productionPagesConfig(config) {
  expectName(config, STAGE.pagesWorker, PAGES_CONFIG);
  config.name = PRODUCTION.pagesWorker;
  rebindService(config, "WORKER_SELF_REFERENCE", PRODUCTION.pagesWorker);
  rebindService(config, "API", PRODUCTION.apiWorker);

  const buckets = config.r2_buckets ?? [];
  if (buckets.length !== 1) {
    fail(`expected one R2 bucket in the pages config, got ${buckets.length}`);
  }
  buckets[0].bucket_name = PRODUCTION.cacheBucket;

  config.workers_dev = true;
  return config;
}

function productionApiConfig(config) {
  expectName(config, STAGE.apiWorker, API_CONFIG);
  config.name = PRODUCTION.apiWorker;
  // Reached only through the pages Worker's `API` binding, as on stage.
  config.workers_dev = false;
  config.preview_urls = false;
  return config;
}

function writeConfig(configPath, config) {
  // Relative paths in the config (main, assets, alias, $schema) resolve from
  // the file's directory, so it has to stay at the same path.
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(
    `cf-production-config: rewrote ${path.relative(webRoot, configPath)} as ${config.name}`
  );
}

if (process.argv.length > 2) fail("takes no arguments");
if (process.env.CI !== "true") {
  fail("rewrites tracked wrangler configs; run it in CI only (CI=true)");
}

// Validate both before writing either, so a failure leaves no half-rewritten pair.
const pagesConfig = productionPagesConfig(readRawConfig(PAGES_CONFIG));
const apiConfig = productionApiConfig(readRawConfig(API_CONFIG));
writeConfig(PAGES_CONFIG, pagesConfig);
writeConfig(API_CONFIG, apiConfig);
