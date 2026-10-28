/**
 * Runs wrangler for the API Worker with Next's production public env inlined.
 *
 * `dotenv -c production` (see package.json) loads `.env.production` and
 * `.env.production.local` into this process first. Public, non-secret values are
 * passed as esbuild `define`s, which is what `next build` does for `NEXT_PUBLIC_*`.
 * Secrets stay as runtime `process.env` reads. With compatibility date 2026-09-01,
 * `nodejs_compat` populates `process.env` from vars and secrets before the module
 * body runs, so module-scope reads in `@osmosis-labs/server` see them.
 *
 * Never put secret values in wrangler.jsonc or in this define list.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

/** Non-secret values Next would inline. Absent ones stay runtime reads. */
const PUBLIC_ENV_KEYS = [
  "ASSET_LIST_COMMIT_HASH",
  "NEXT_PUBLIC_EXCLUDED_EXTERNAL_BOOSTS_POOL_IDS",
  "NEXT_PUBLIC_FE_CONTENT_COMMIT_HASH",
  "NEXT_PUBLIC_HISTORICAL_DATA_URL",
  "NEXT_PUBLIC_IS_TESTNET",
  "NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID",
  "NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE",
  "NEXT_PUBLIC_OSMOSIS_CHAIN_NAME_OVERWRITE",
  "NEXT_PUBLIC_OSMOSIS_REST_OVERWRITE",
  "NEXT_PUBLIC_OSMOSIS_RPC_OVERWRITE",
  "NEXT_PUBLIC_SIDECAR_BASE_URL",
  "NEXT_PUBLIC_SPEND_LIMIT_CONTRACT_ADDRESS",
  "NEXT_PUBLIC_SQUID_INTEGRATOR_ID",
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_KEY",
  "NEXT_PUBLIC_WALLETCONNECT_RELAY_URL",
];

/** esbuild define entries. Values are JS expressions (`JSON.stringify` adds quotes). */
function publicDefines() {
  const defines = [`process.env.NODE_ENV:${JSON.stringify("production")}`];
  for (const key of PUBLIC_ENV_KEYS) {
    const value = process.env[key];
    if (value === undefined) continue;
    defines.push(`process.env.${key}:${JSON.stringify(value)}`);
  }
  return defines;
}

function wranglerBin() {
  return path.join(
    path.dirname(require.resolve("wrangler/package.json")),
    "bin/wrangler.js"
  );
}

/** Esbuild resolves a relative `--outdir` from the Worker directory, not the package root. */
function absolutizeOutdir(args) {
  const next = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--outdir" && args[i + 1]) {
      next.push(arg, path.resolve(args[i + 1]));
      i++;
      continue;
    }
    next.push(arg);
  }
  return next;
}

const [subcommand, ...rest] = process.argv.slice(2);
if (!subcommand) {
  console.error(
    "usage: node api-worker/run-wrangler.mjs <wrangler subcommand> [args]"
  );
  process.exit(1);
}

const child = spawn(
  process.execPath,
  [
    wranglerBin(),
    subcommand,
    "-c",
    "api-worker/wrangler.jsonc",
    ...publicDefines().flatMap((entry) => ["--define", entry]),
    ...absolutizeOutdir(rest),
  ],
  { stdio: "inherit" }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
