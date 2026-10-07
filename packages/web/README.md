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

### Cloudflare staging

Use Node 24 and install the locked dependencies with `yarn install --immutable`.
Use a Workers Paid account: the Worker exceeds the Free plan's 3 MiB compressed
limit (the migration validation measured about 7.1 MiB, below the paid 10 MiB limit).
Enable R2 on the same account. The following commands work from the repository
root or this package:

```bash
yarn cf:build
yarn cf:dry-run
yarn cf:preview
```

`cf:preview` populates the local R2 cache before starting the Worker. Asset detail
pages revalidate after two hours and `/apps` after one day. R2 stores generated
pages; the Durable Object queue coordinates background regeneration.

For the first remote deployment, authenticate Wrangler with `yarn workspace
@osmosis-labs/web exec wrangler login`, or set `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` in CI. Enable R2 on that account, then create the staging
cache bucket once:

```bash
yarn cf:cache:create
```

Configure public `NEXT_PUBLIC_*` values in the build environment or the ignored
`packages/web/.env.production.local` file before building. In particular, use the
staging LaunchDarkly client-side ID and WalletConnect project key (allow the
staging origin in their settings). Set the desired sidecar, historical-data, and
chain endpoints; `packages/web/.env` documents the defaults. Dashboard-only
changes to public variables do not update the browser bundle: rebuild to change
them. Supply build-time API credentials if your data-generation configuration
requires them; never commit credentials.

**A staging frontend still uses mainnet by default.** Use coordinated testnet
settings if that is intended; otherwise use test wallets and do not broadcast
real transactions unless explicitly intended.

Set runtime variables and secrets on the `osmosis-frontend-stage` Worker in
Cloudflare, using the dashboard or Wrangler. For a first deployment, deploy to
create the Worker, then configure credentials before testing the associated
features. Only enable providers whose staging credentials are configured, such
as `SKIP_API_KEY`, `SOLANA_RPC_URL`, and `SWAPPED_COM_SK`. Optional data-provider
credentials include `COINGECKO_API_KEY` and `NUMIA_API_KEY`. For example, after the
Worker exists (Wrangler prompts for the secret value):

```bash
yarn workspace @osmosis-labs/web exec wrangler secret put SOLANA_RPC_URL
```

For Solana testing, configure `NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID` at build
time and enable `solana-skip-routes` in that LaunchDarkly environment. Deployed
builds intentionally return 404 from `/api/solana-rpc` without the flag enabled.

Deploy to the dedicated staging Worker, not a production route:

```bash
yarn cf:deploy
```

This rebuilds the app, populates the remote R2 cache, and deploys the staging
Worker with its Durable Object migration. `--keep-vars` preserves dashboard
variables. The Worker self-reference and R2 bucket in `wrangler.jsonc` both point
to staging resources. Keep production DNS/routes unchanged and use the staging
Worker's `workers.dev` URL (or a separate staging hostname).

After deployment, monitor the Worker while testing:

```bash
yarn workspace @osmosis-labs/web exec wrangler tail
```

Check `/`, `/apps`, `/assets`, an asset detail page, `/api/pools/1`, token images,
wallet connection, and quotes. A GET to `/api/solana-rpc` should return 405; test
allowed same-origin POSTs and blocked foreign-origin POSTs when the Solana flag
is enabled. Verify ISR cache reads and background regeneration in the deployed
Worker, not just local preview. Watch exceptions, 5xx rates, latency, and CPU-limit
errors. Local validation does not verify account permissions, live credentials,
remote startup/CPU limits, or provider origin restrictions.

For subsequent deployments, record the current staging deployment version first.
If smoke tests fail, roll back that Worker to the prior version in Cloudflare's
Deployments dashboard (or with `wrangler rollback`). Rollback does not restore R2
contents or Durable Object state; do not delete those resources as a rollback
step. On a first deployment, stop testing or remove its staging route if needed;
production remains untouched.

`public/_headers` gives versioned Next assets a one-year immutable browser cache
and the favicon a ten-day cache. Files with stable names, including token images,
keep the default revalidation policy.

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
