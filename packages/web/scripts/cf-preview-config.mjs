/**
 * Points the stage Wrangler configs at one PR's preview Worker pair, for
 * `.github/workflows/cf-preview.yml`.
 *
 *   node scripts/cf-preview-config.mjs --pr 123            # rewrite both configs
 *   node scripts/cf-preview-config.mjs --pr 123 --names    # print names only
 *
 * The rewrite replaces `wrangler.jsonc` and `api-worker/wrangler.jsonc` in place
 * (as plain JSON, comments dropped) so the unchanged `cf:deploy` and
 * `cf:api:deploy` scripts deploy the preview pair. It refuses to run outside CI
 * because it edits tracked files.
 *
 * Preview pair for PR <n>:
 * - osmosis-frontend-api-pr-<n>: the API Worker, reachable only via the binding.
 * - osmosis-frontend-pr-<n>: the pages Worker on workers.dev, `API` bound to the above.
 * Both share the `osmosis-frontend-preview-cache` R2 bucket. OpenNext keys
 * cache entries by build id, so previews don't read each other's pages.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const PAGES_CONFIG = path.join(webRoot, "wrangler.jsonc");
const API_CONFIG = path.join(webRoot, "api-worker/wrangler.jsonc");

/** The configs this script expects to start from. Anything else is a mistake. */
const SOURCE_PAGES_NAME = "osmosis-frontend-stage";
const SOURCE_API_NAME = "osmosis-frontend-api-stage";
const PREVIEW_CACHE_BUCKET = "osmosis-frontend-preview-cache";
/** Workers names are capped at 63 characters. */
const MAX_WORKER_NAME = 63;

function fail(message) {
  console.error(`cf-preview-config: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  let pr;
  let namesOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--pr") {
      pr = argv[i + 1];
      i++;
    } else if (arg === "--names") {
      namesOnly = true;
    } else {
      fail(`unknown argument ${arg}`);
    }
  }
  if (!pr || !/^[1-9]\d{0,8}$/.test(pr)) {
    fail(`--pr must be a positive integer, got ${JSON.stringify(pr)}`);
  }
  return { pr, namesOnly };
}

function previewNames(pr) {
  const names = {
    pagesWorker: `osmosis-frontend-pr-${pr}`,
    apiWorker: `osmosis-frontend-api-pr-${pr}`,
    cacheBucket: PREVIEW_CACHE_BUCKET,
  };
  for (const name of [names.pagesWorker, names.apiWorker]) {
    if (name.length > MAX_WORKER_NAME) fail(`${name} is too long`);
  }
  return names;
}

async function readRawConfig(configPath) {
  // Imported lazily so `--names` works without installed dependencies.
  const { experimental_readRawConfig } = await import("wrangler");
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

function previewPagesConfig(config, names) {
  expectName(config, SOURCE_PAGES_NAME, PAGES_CONFIG);
  config.name = names.pagesWorker;
  rebindService(config, "WORKER_SELF_REFERENCE", names.pagesWorker);
  rebindService(config, "API", names.apiWorker);

  const buckets = config.r2_buckets ?? [];
  if (buckets.length !== 1) {
    fail(`expected one R2 bucket in the pages config, got ${buckets.length}`);
  }
  buckets[0].bucket_name = names.cacheBucket;

  // The preview is reached at its workers.dev URL.
  config.workers_dev = true;
  config.preview_urls = false;
  return config;
}

function previewApiConfig(config, names) {
  expectName(config, SOURCE_API_NAME, API_CONFIG);
  config.name = names.apiWorker;
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
    `cf-preview-config: rewrote ${path.relative(webRoot, configPath)} as ${config.name}`
  );
}

function writeGithubOutput(names) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  fs.appendFileSync(
    outputPath,
    `pages_worker=${names.pagesWorker}\napi_worker=${names.apiWorker}\n`
  );
}

const { pr, namesOnly } = parseArgs(process.argv.slice(2));
const names = previewNames(pr);

if (namesOnly) {
  console.log(JSON.stringify(names));
  writeGithubOutput(names);
  process.exit(0);
}

if (process.env.CI !== "true") {
  fail("rewrites tracked wrangler configs; run it in CI only (CI=true)");
}

const pagesConfig = previewPagesConfig(
  await readRawConfig(PAGES_CONFIG),
  names
);
const apiConfig = previewApiConfig(await readRawConfig(API_CONFIG), names);
writeConfig(PAGES_CONFIG, pagesConfig);
writeConfig(API_CONFIG, apiConfig);
writeGithubOutput(names);
