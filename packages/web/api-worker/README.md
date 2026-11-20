# API Worker

The Cloudflare frontend's own backend. The OpenNext pages Worker keeps pages and
`/_next/image` and forwards `/api/*` here over its `API` service binding
(`worker.ts`), so the traffic router only picks a frontend and never routes API
calls. API handlers live in `server/api-handlers`; `routes.ts` is the route table,
keyed by handler ID (exact paths, the tRPC prefixes, and the one `/api/pools/:id`
pattern), and `handlers.ts` maps each ID to a Fetch handler. TypeScript requires
an entry for every ID. There are no Next API wrappers.

| Branch   | Pages Worker                  | API Worker                        |
| -------- | ----------------------------- | --------------------------------- |
| `stage`  | `osmosis-frontend-stage`      | `osmosis-frontend-api-stage`      |
| `master` | `osmosis-frontend-production` | `osmosis-frontend-api-production` |

`.github/workflows/cf-deploy.yml` deploys both Workers on pushes to those branches,
API first. PR Previews use the deployed stage API Worker, so a PR's API changes
are not included in its Preview. Validate those locally before merging.

## Environment

Public, non-secret values are inlined at bundle time from
`dotenv -c production` (`.env`, `.env.production`, `.env.production.local`), the same
inputs as `cf:build`. `process.env.NODE_ENV` is always `"production"`. The allowlist
is `PUBLIC_ENV_KEYS` in `run-wrangler.mjs`.

Secrets are not written into `wrangler.jsonc` or the bundle. `nodejs_compat` on
compatibility date `2026-09-01` copies vars and secrets onto `process.env` before the
module body runs, so module-scope reads in `@osmosis-labs/server` see them. Set them
with `yarn wrangler secret put <NAME> -c api-worker/wrangler.jsonc` from `packages/web`
(or `api-worker/.dev.vars` for local development). A bare `wrangler secret put`
does not select this config and would write the pages Worker instead. Add
`--env production` when setting production secrets:

- `NUMIA_API_KEY`
- `COINGECKO_API_KEY`
- `SWAPPED_COM_SK`
- `SKIP_API_KEY`
- `SOLANA_RPC_URL`
- `GITHUB_API_TOKEN`
- `ASSET_LIST_COMMIT_HASH` when it is not set in the production env at bundle time
- `EVM_RPC_URL_<chainId>` for chains `1`, `10`, `56`, `137`, `250`, `314`, `1284`,
  `8453`, `42161`, `43114`, and `81457` (comma-separated URLs; omit a chain to use
  its public endpoint only)

## Request scope

On Workers a promise may only settle in the request that created it, so in-flight
work must never be shared through module state. `worker.ts` runs every request in
one request scope (`utils/request-scope.ts`, read by `getRequestScope` and
`getRequestScoped` in `@osmosis-labs/server`). The upstream cache
(`upstream-cache.ts`, allowlist in `upstream-cache-rules.ts`) keeps its per-request
state there: the hit/miss/bypass counters, the misses that concurrent callers in
the same request share, and the `waitUntil` that keeps cache writes alive. Every
response gets `Server-Timing: upstream;desc="hit=… miss=… bypass=…"`, zeros
included (a 404 or an edge-cache hit makes no upstream calls). Outside a scope the
wrapped `fetch` still reads warm entries but shares, writes and counts nothing.

## Bundle

Wrangler bundles `worker.ts` with the `~/*` paths from `api-worker/tsconfig.json`.
Aliases match `next.config.js`: the noop for `starknet` and the libsodium packages,
`bip39` → `bip39-light`, and `./libsodium` → the noop. That last specifier is the
relative import in `@cosmjs/crypto/build/index.js`; nothing else in `node_modules`
uses it, and Wrangler's alias matches the import specifier exactly. The API graph
does not import `config/wagmi-connectors` or `config/wallet-installers`, so those
server stand-ins are not applied. `isows` and `uncrypto` resolve their `workerd`
export because Wrangler bundles with that condition.

Generate lists before bundling (`yarn generate:lists` with the production env). The
workspace packages must already be built (`yarn build:packages`).

## Scripts

From `packages/web`:

```bash
yarn cf:api:dry-run   # bundle only, writes .wrangler/api
yarn cf:api:dev       # local Worker on port 8787, using the development env
yarn cf:api:start     # local Worker on port 8787, using the production env
yarn cf:api:deploy    # deploys osmosis-frontend-api-stage
```

The default config targets stage. Add `--env production` to deploy the production
API Worker. There is no public URL: `workers_dev` and preview URLs are
off, and the pages Worker reaches this one over the `API` service binding. Deploy
this Worker before the pages Worker: until it exists, that binding has nothing to
call and Cloudflare `/api/*` fails.

`yarn dev` and `yarn start` run this local Worker alongside Next, which forwards
`/api/*` to port 8787. Set local runtime secrets in `api-worker/.dev.vars`; public
values use development dotenv files for `dev` and production dotenv files for
`start`, matching Next.

Smoke-test with `yarn cf:api:dev` or
`wrangler dev --remote -c api-worker/wrangler.jsonc`, not a workers.dev hostname.

The `app-only` upstream exception (`sqsprod.osmosis.zone`, `rpc.app.osmosis.zone`,
`lcd.app.osmosis.zone`) must cover this Worker as well as the pages Worker. Outside
that exception those hosts answer `403` with `x-blocked-by: app-only`.
