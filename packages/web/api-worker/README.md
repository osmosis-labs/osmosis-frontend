# API Worker

The Cloudflare frontend's own backend. The OpenNext pages Worker keeps pages and
`/_next/image` and forwards `/api/*` here over its `API` service binding
(`worker.ts`), so the traffic router only picks a frontend and never routes API
calls. Vercel stays a monolith: `pages/api/*` and `middleware.ts` still build and
serve there.

| Branch      | Pages Worker                  | API Worker                        |
| ----------- | ----------------------------- | --------------------------------- |
| `stage-cf`  | `osmosis-frontend-stage`      | `osmosis-frontend-api-stage`      |
| `master-cf` | `osmosis-frontend-production` | `osmosis-frontend-api-production` |

The route table is `routes.ts`. It must list every file under `pages/api`; the Jest
drift test fails when one is missing. Handlers live in `server/api-handlers` and are
the same functions the Next wrappers call.

## Environment

Public, non-secret values are inlined at bundle time from
`dotenv -c production` (`.env`, `.env.production`, `.env.production.local`), the same
inputs as `cf:build`. `process.env.NODE_ENV` is always `"production"`. The allowlist
is `PUBLIC_ENV_KEYS` in `run-wrangler.mjs`.

Secrets are not written into `wrangler.jsonc` or the bundle. `nodejs_compat` on
compatibility date `2026-09-01` copies vars and secrets onto `process.env` before the
module body runs, so module-scope reads in `@osmosis-labs/server` see them. Set them
with `wrangler secret put` (or `.dev.vars` for `cf:api:dev`):

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
yarn cf:api:dev       # local Worker
yarn cf:api:deploy    # wrangler deploy --keep-vars; do not run this by hand
```

Deploy this Worker before the pages Worker: until it exists, the `API` binding has
nothing to call and Cloudflare `/api/*` fails.

The `app-only` upstream exception (`sqsprod.osmosis.zone`, `rpc.app.osmosis.zone`,
`lcd.app.osmosis.zone`) must cover this Worker as well as the pages Worker. Outside
that exception those hosts answer `403` with `x-blocked-by: app-only`.
