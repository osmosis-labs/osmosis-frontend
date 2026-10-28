# @osmosis-labs/web (unpublished)

This package contains the Next.js web server and all UI code for the frontend.

Commands can be run from root of repo or package:

### Develop

Watch server:

```
yarn build && yarn dev
```

### Test

```
yarn test && yarn dev
```

- for React components we mainly use React Testing library
- we use v12 for compatibility with React 17
- docs ([Docs](https://testing-library.com/docs/react-testing-library/intro/))

### Lint/format

```
yarn lint:fix
```

### Deploy

```
yarn build && yarn start
```

### Cloudflare production candidate (`master-cf`)

`master-cf` includes the deployed `stage-cf` release with production Cloudflare
configuration. Next.js and its bundle analyzer are on 15.5.28 to satisfy OpenNext's
>=15.5.28 peer requirement.

`cf:build` loads `.env.production.local`, `.env.local`, `.env.production` and `.env`
(shell variables take precedence) for the whole build, so `yarn generate:lists`
sees the same values as `next build`. The RPC/REST overwrites reach the app only
through the generated chain list.

`cf:build` passes `--dangerouslyUseUnsupportedNextVersion`: OpenNext refuses Next.js
majors more than two years past release, which Next 15 reached on 2026-10-21.
`yarn cf:build:profile` builds with Next.js server minification off, so Cloudflare
CPU and heap profiles show readable function names.

Vercel Speed Insights is removed from this Cloudflare branch.

Deployment resources are separate from staging:

| Resource                  | Production candidate                      | Staging (on `stage-cf`)           |
| ------------------------- | ----------------------------------------- | --------------------------------- |
| Worker and self-reference | `osmosis-frontend-production`             | `osmosis-frontend-stage`          |
| R2 incremental cache      | `osmosis-frontend-production-cache`       | `osmosis-frontend-stage-cache`    |
| Revalidation queue        | `DOQueueHandler` in the production Worker | Separate staging Worker namespace |

The initial deployment uses only the Worker's `workers.dev` hostname. The config
contains no production custom domain or route. Deploying this branch does not
move `app.osmosis.zone` away from Vercel.

Use Node 24, a Workers Paid account, and R2 on the same Cloudflare account.
From the repository root:

```bash
corepack yarn install --immutable
yarn cf:build
yarn cf:dry-run
```

Before the first remote deployment, authenticate Wrangler or configure
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and create the cache bucket once:

```bash
yarn cf:cache:create
```

Set production `NEXT_PUBLIC_*` values in the build environment (or the ignored
`packages/web/.env.production.local`) before building. Match Vercel production's
LaunchDarkly, WalletConnect, chain and data-provider configuration. Rebuild after
changing public values; dashboard runtime variables cannot change the browser
bundle. Pin `ASSET_LIST_COMMIT_HASH` and `NEXT_PUBLIC_FE_CONTENT_COMMIT_HASH`
to the same generated-data inputs as the Vercel release when comparing providers.
Allow the candidate hostname in relevant provider origin settings.

Configure runtime variables and secrets on `osmosis-frontend-production`,
including the configured providers' `SKIP_API_KEY`, `SOLANA_RPC_URL`,
`SWAPPED_COM_SK`, `COINGECKO_API_KEY` and `NUMIA_API_KEY` as needed. Secrets belong
in Cloudflare, not the repository. Existing stage secrets are not inherited.
`cf:deploy` preserves dashboard variables using `--keep-vars`.

```bash
yarn cf:deploy
```

This rebuilds, populates the production R2 cache and deploys the Worker with its
Durable Object migration. For [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), connect a separate
Worker to this repository with production branch `master-cf`, repository root
`/`, build command `yarn cf:build`, and deploy command
`yarn workspace @osmosis-labs/web exec opennextjs-cloudflare deploy -- --keep-vars`.
Disable non-production branch builds for this production Worker. Supply Node 24
and production build variables in its build settings.

Verify `/`, `/apps`, `/assets`, an asset detail page, `/api/pools/1`, images,
wallet connection and quotes on the candidate hostname. Check same-origin API
POSTs, unit-value serialization, ISR cache reads and background regeneration.
Use `yarn cf:preview` for local Workers preview and
`yarn workspace @osmosis-labs/web exec wrangler tail` for deployed logs.

Before introducing production traffic, validate a separate routing Worker on
`stage.osmosis.zone`. Production routing should start with 100% Vercel, then use
sticky browser cohorts for 1%, 5%, 25%, 50% and 100% Cloudflare. Route pages,
`/_next/*`, images and `/api/*` consistently; initially bypass the router cache.
The force-Vercel switch must override existing cohort cookies. Test rollback
from an already-open Cloudflare page and ensure its referenced assets remain
available. Do not replay failed mutation requests against the other provider.
Compare errors, API failures, chunk errors, latency and wallet/transaction flows
by provider before raising traffic. Keep Vercel running through the soak period.

`worker.ts` wraps OpenNext's Worker with the shared cache Vercel's CDN provided, per
Cloudflare location (`x-edge-cache: HIT|MISS` shows the result):

- GET `/api/*` responses that send `Cache-Control: s-maxage` (`/api/pools`,
  `/api/active-gauges`, public `edge-trpc-assets` queries) are kept for that long.
- `/_next/image` results are kept for seven days (browsers: one day), keyed by the
  formats the browser accepts. The `IMAGES` binding (Cloudflare Images) does the
  resizing; without it OpenNext serves originals. Cloudflare bills unique
  transformations per month beyond the free 5,000, and the Images product must be
  enabled on the account.

Record the release commit and deployed Worker version for each candidate. Worker
rollback does not revert R2 or Durable Object state.

### Traffic router (`router/`)

`osmosis-frontend-router` splits `app.osmosis.zone` between Vercel and the
`osmosis-frontend-production` Worker without changing the URL. Vercel traffic is a
plain `fetch` to the zone's origin; Cloudflare traffic goes over a service binding.
Every response carries `x-osmosis-backend: cf|vercel`.

- A browser's bucket (0-9999) comes from the `osmo_bucket` cookie, or a hash of IP
  and user agent until a page load sets it. Buckets below `CF_PERCENT`% go to
  Cloudflare, so ramping up or down only moves browsers at the margin.
- Crawlers stay on Vercel. `?osmo_backend=cf|vercel` pins a session for QA (even at
  0%); `?osmo_backend=auto` clears it.
- A 404 for `/_next/static/*` is retried on the other platform, for pages loaded
  before a ramp change. Nothing else is ever retried across platforms.

`CF_PERCENT` lives in `router/wrangler.jsonc`, and a deploy resets dashboard edits:
in an emergency set it to `0` in the dashboard, then commit the same value.

```bash
yarn cf:router:dev     # router + production Worker locally; add
                       # --var VERCEL_ORIGIN:https://app.osmosis.zone
yarn cf:router:deploy  # deploys the router only; attaching it to a route is separate
```

`VERCEL_ORIGIN` sends Vercel traffic to another host, for testing the router on a
hostname other than `app.osmosis.zone`; leave it unset on the production route. The
upstream exception for `sqsprod`/`rpc.app`/`lcd.app` must allow the `osmosis.zone`
zone before the production Worker serves traffic through the router.

### Analyze

View the size of the various webpack bundles on both the server and the client.

At the root of the repo or package:

```bash
yarn analyze
```

On completion, two local html files containing visual bundle trees for client and server code will appear in your default browser.

## Environment Variables

By default, configuration is hardcoded and determined by the NEXT_PUBLIC_IS_TESTNET env var for developer convenience and simplicity. Please directly change those values should the config be changed from here on. For temporary overrides, consult the .env file. To use the testnet version of the frontend use the :testnet versions of the build and dev commands from the root package manifest file.

## Adding a Wallet

To add a new wallet, you must follow the steps below:

1. Check if the wallet is available on [cosmos-kit](https://github.com/cosmology-tech/cosmos-kit/tree/main/wallets).
2. If it is, add the package to the `@osmosis-labs/web` by running `yarn workspace @osmosis-labs/web add <wallet-package-name>`.
3. Go to [packages/web/config/generate-cosmos-kit-wallet-list.ts](https://github.com/osmosis-labs/osmosis-frontend/blob/stage/packages/web/config/generate-cosmos-kit-wallet-list.ts) and add the wallet to the `CosmosKitWalletList` list.
4. Go to the [packages/web/config/wallet-registry.ts](https://github.com/osmosis-labs/osmosis-frontend/blob/stage/packages/web/config/wallet-registry.ts) and add the wallet to the `WalletRegistry` array.
5. Add the necessary options as needed for the wallet. Please take a look at the [`RegistryWallet` interface](#registry-wallet-options).
6. Test the wallet by running local app. Refer to the [Develop section](#develop) above.
7. Create a PR and get it reviewed.

#### Registry Wallet Options

| Property                        | Type                                                                    | Description                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| logo                            | string                                                                  | The logo of the wallet.                                                                                              |
| lazyInstall                     | () => any                                                               | A function that lazily installs the wallet.                                                                          |
| stakeUrl                        | string (optional)                                                       | The URL for staking.                                                                                                 |
| governanceUrl                   | string (optional)                                                       | The URL for governance.                                                                                              |
| windowPropertyName              | string (optional)                                                       | Used to determine if the wallet is installed.                                                                        |
| supportsChain                   | (chainId: string) => Promise<boolean> (optional)                        | A method that checks if a chain is available for a given wallet.                                                     |
| matchError                      | (error: string) => WalletConnectionInProgressError \| string (optional) | A method that evaluates the provided error message to ascertain the specific connection-related error from a wallet. |
| features                        | Array<"notifications">                                                  | An array of features supported by the wallet.                                                                        |
| signOptions                     | Object (optional)                                                       | An object containing sign options.                                                                                   |
| signOptions.preferNoSetFee      | boolean (optional)                                                      | Preference for not setting a fee.                                                                                    |
| signOptions.preferNoSetMemo     | boolean (optional)                                                      | Preference for not setting a memo.                                                                                   |
| signOptions.disableBalanceCheck | boolean (optional)                                                      | Option to disable balance check.                                                                                     |

## Debug

### React Renders

Find what's causing extraneous renders in React by dropping in debugger versions of the React hooks. ([Article](https://reactjsexample.com/react-hooks-that-are-useful-for-debugging-dependency-changes-between-renders/)) ([Docs](https://github.com/kyleshevlin/use-debugger-hooks))

Simply import (ignore the eslint dev dep error):

```typescript
// eslint-disable-next-line
import { useEffectDebugger } from "use-debugger-hooks";
```

Then, adjacent in place of the hook in question, use the debug hook. Example for `useEffect`:

```typescript
useEffectDebugger(() => {
  someEffectWithDeps(dep1, dep2, dep3);
}, [dep1, dep2, dep3]);
JavaScript;
```

It returns `unknown` types, so you may need to type cast to resolve TS errors.
