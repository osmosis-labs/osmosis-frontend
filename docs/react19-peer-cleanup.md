# React 19 peer cleanup

**Shim version mismatches fixed; not all wallet adapter peers are compatible.**
Base: `f1aa45bbb4f04a93768a0d0129874f59b3749b7c`.
Branch: `fix/react19-peer-cleanup`.
Worktree: `/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/peer-cleanup`.
React/runtime/types remain 19.3.0 and Next remains 15.5.25.

## Selections and evidence

Registry metadata was fetched directly from `https://registry.npmjs.org/<package>`
and version endpoints, not inferred from a latest tag. Only stable versions were
considered. Ignored metadata/source archives and validation logs are under this
worktree's `.yarn/react19-peer-validation/`. Node is 24.21.0; Yarn is checked-in
4.12.0. All modules were installed locally, without symlinks/shared-module writes.

| Chain                                                         | Before                       | After                             |
| ------------------------------------------------------------- | ---------------------------- | --------------------------------- |
| web → zustand (`^4.5.5`) → shim                               | 4.5.5 → exact 1.2.2          | 4.5.7 → `^1.2.2`, resolving 1.7.0 |
| web → wagmi → shim                                            | 2.12.17 → exact 1.2.0        | same wagmi → real 1.7.0           |
| wagmi → @wagmi/core → zustand → shim                          | 2.13.8 → 4.4.1 → exact 1.2.0 | same parents → real 1.7.0         |
| wagmi → connectors → WalletConnect modal-core → valtio → shim | valtio 1.11.2 → exact 1.2.0  | same parents → real 1.7.0         |
| MobX React Lite / Headless UI / React Aria → shim             | 1.7.0                        | unchanged                         |

1. **Supported patch first:** `yarn up -R zustand` selects stable 4.5.7 inside
   the existing `^4.5.5` manifest range (latest 4.x; latest overall is 5.0.15).
   4.5.6 first unpins the shim; 4.5.7 retains that range. Published `index.js`
   and `middleware.js` for 4.5.5 and installed 4.5.7 are byte-identical. The web
   manifest range, selectors, persist configuration and application stores stay
   unchanged. No Zustand 5 migration.
2. **Parent-update alternative evaluated:** stable wagmi 2.12 patches and 2.13
   minors retain exact shim 1.2.0. The first later stable release changing that
   pin is 2.14.7 (shim 1.4.0), also moving core from 2.13.8 to 2.16.3 and
   connectors from 5.1.15 to 5.7.3. Current latest matching `^2.12.17` is 2.19.5;
   latest overall is 3.7.7. Neither broad wallet-stack refresh is necessary for
   this shim fix. Valtio's latest compatible 1.x, 1.13.2, still pins shim 1.2.0.
3. **Three explicit exact-parent resolutions:** root `package.json` selects
   `use-sync-external-store@1.7.0` only for `wagmi@npm:2.12.17`,
   `zustand@npm:4.4.1`, and `valtio@npm:1.11.2`. These intentionally override
   upstream exact shim pins; they are not upstream-supported parent releases.
   This is a real published same-major shim update, not a peer-range patch or
   blanket resolution. Every other shim descriptor remains normally resolved.
   When these parent versions change, re-evaluate/remove the scoped selections.
4. Stable shim **1.7.0** explicitly peers on React
   `^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`. Old 1.2.0/1.2.2 omit React 19.
   Published implementations preserve the `shim`, `shim/with-selector`, and
   `shim/with-selector.js` entries, the five-argument selector hook and native
   React `useSyncExternalStore` delegation. The selector implementation still
   memoizes selection/equality and separates server/client snapshots; 1.7.0
   additionally updates the cached snapshot when equality bails out. Tests below
   exercise actual installed implementations, not a mocked shim.
5. No `@types/use-sync-external-store` dependency exists in this lockfile, nor is
   it required by these parents' published declarations. Registry latest stable
   is 1.7.0; no speculative direct types dependency was added. React and React DOM
   types remain aligned at 19.3.0.

`yarn why -R use-sync-external-store` confirms only 1.7.0 remains (with separate
Yarn peer contexts). Node `createRequire(require.resolve(parent))` audits from
wagmi, direct zustand, core's nested zustand, modal-core's valtio and
mobx-react-lite each resolved shim 1.7.0, React 19.3.0 and a callable selector
export. **`yarn explain peer-requirements p9c5ea4` now passes**, including the
actual wagmi and zustand descendants; the immutable install no longer emits the
React version-range YN0060.

## Remaining React-related peer evidence (not fixed)

These are present in the complete `yarn explain peer-requirements` output even
though the direct web React request is satisfied. Do not interpret the missing
peers as proof of supported wallet behavior on React 19.

| Hash                   | Residual request                                                                                                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pb6aed0` (✘)          | @wagmi/connectors 5.1.15 does not provide React to @metamask/sdk 0.28.4, its install-modal-web 0.28.1, and react-native-webview 11.26.1. SDK and modal **declare `^18.2.0`**, excluding React 19; webview declares `*`.      |
| `pcdf427` (✓ optional) | The same connector does not provide React DOM to SDK/modal; both optional peers **declare `^18.2.0`**, excluding React DOM 19. This is a compatibility caveat even though Yarn marks the missing optional request satisfied. |
| `p45a862` (✘)          | MetaMask SDK does not provide `react-native` (`*`) to install-modal-web and react-native-webview. Not an instruction to add React Native to the browser app.                                                                 |
| `p107690` (✘)          | @wagmi/core 2.13.8 does not provide React to nested zustand 4.4.1 (`>=16.8`) / shim 1.7.0 (includes 19). Core consumes vanilla Zustand; missing declaration remains.                                                         |
| `p753f8b` (✘)          | @walletconnect/modal-core 2.7.0 does not provide React to valtio 1.11.2 (`>=16.8`) / shim 1.7.0 (includes 19). Its missing declaration remains.                                                                              |
| `p492baa` (✘)          | @visx/annotation 4.0.0 does not provide React DOM to react-use-measure 2.1.1 (`>=16.13`, includes 19). Not a version mismatch.                                                                                               |

Missing optional `@types/react` / `@types/react-dom` forwarding requests are also
listed as ✓, not failing type-range requirements. No failing React type-range
request was found. Full raw peer output is preserved in `peers-final.log`.

Metadata checks found no later stable MetaMask SDK/modal release with an explicit
React-19-accepting peer range. Latest SDK 0.34.0 and modal 0.32.1 **omit** those
peers; absence alone is not verified compatibility. The latest patch within
SDK `~0.28.4` / modal `~0.28.1` / connectors `~5.1.15` is the already installed
version. A larger adapter migration/API/browser audit is separate work; no
MetaMask/WalletConnect/CosmosKit adapter, wallet config or injected provider
behavior was changed here. Real MetaMask modal/connect flows remain unvalidated.

The unrelated TypeScript 5.9.3 / ESLint `>=5.7.2 <5.8.0` YN0060 (`pbefd5b`),
ignored workspace-local resolutions (YN0057), and existing non-React missing
CosmosKit/other peers remain. They are deliberately outside this patch.

## Regression coverage and commands actually run

Commands below use `node .yarn-4.12.0.cjs` from the absolute worktree above.
No Turbo invocation, e2e suite, real wallet, signing/approval, transaction,
swap/order submission, deployment, or secret/dotenv-value dump was performed.
No console/network failure was hidden; no force-exit flag was used.

New `packages/web/stores/__tests__/react19-external-stores.spec.tsx` has six
regressions: StrictMode subscription replay/unsubscription and shallow-selector
bailouts; persisted Zustand SSR/client hydration with zero recoverable errors;
actual navbar-store hydration/update; wagmi account hydration, selector bailout
and unsubscribe with no adapters/discovery/reconnect/RPC; WalletConnect's Valtio
subscription updates/unmount; and React Query cache updates beside Zustand with
observer cleanup. Wagmi uses inert storage and a transport that **throws on any
RPC**; it changes only in-memory statuses, never calls a connector action.

`packages/web/jest.react19-peers.config.js` is a separate offline focused config,
not a replacement for the normal Jest configuration. It imports no global
MSW/tRPC/provider lifecycle and preserves the existing store/MobX suites. Normal
Jest was also run below. **No test-agent-owned setup/MSW file was modified.**

| Exact command (after Yarn prefix)                                                                                                                                                                                                                                                                                                                                    | Result                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `install --immutable` (baseline)                                                                                                                                                                                                                                                                                                                                     | PASS with old React YN0060                                                                                                                                       |
| `up -R zustand` (after adding exact-parent resolutions)                                                                                                                                                                                                                                                                                                              | PASS; only direct zustand and shim lock selections changed                                                                                                       |
| `install --immutable` (final)                                                                                                                                                                                                                                                                                                                                        | PASS, no React version-range YN0060; residual warnings above                                                                                                     |
| `explain peer-requirements p9c5ea4` / `explain peer-requirements` / `why -R use-sync-external-store`                                                                                                                                                                                                                                                                 | Audited baseline and final graphs as above                                                                                                                       |
| `workspace @osmosis-labs/<name> run build` for proto-codecs, unit, math, types, utils, server, tx, bridge, keplr-stores, keplr-hooks, stores, trpc, in that order                                                                                                                                                                                                    | PASS all 12, direct library commands                                                                                                                             |
| `workspace @osmosis-labs/web run generate`                                                                                                                                                                                                                                                                                                                           | PASS; registry missing-currency warnings remain                                                                                                                  |
| `workspace @osmosis-labs/web run typecheck`                                                                                                                                                                                                                                                                                                                          | PASS explicit application typecheck (not inferred from Next)                                                                                                     |
| `workspace @osmosis-labs/web exec jest --config jest.react19-peers.config.js --runInBand`                                                                                                                                                                                                                                                                            | PASS, 5 suites / 44 tests, exit 0, repeated after final formatting                                                                                               |
| `workspace @osmosis-labs/web exec jest --runInBand --runTestsByPath stores/__tests__/nav-bar-store.spec.ts stores/__tests__/profile-store.spec.ts stores/__tests__/user-settings-store.spec.ts stores/__tests__/react19-external-stores.spec.tsx`                                                                                                                    | PASS normal config, 4 suites / 41 tests, exit 0                                                                                                                  |
| `workspace @osmosis-labs/web exec jest --runInBand --runTestsByPath hooks/__tests__/use-phantom-wallet.spec.ts hooks/__tests__/use-wallet-select.spec.ts modals/wallet-select/__tests__/wallet-select.spec.ts components/bridge/__tests__/source-wallet.spec.ts stores/__tests__/user-settings-integration.spec.ts hooks/__tests__/use-swap-wallet-loading.spec.tsx` | PASS normal config, 6 suites / 34 tests, exit 0; inspected first, fake providers/pure state/mocked operations only                                               |
| `exec tsc --noEmit -p .yarn/react19-peer-validation/tsconfig.tests.json`                                                                                                                                                                                                                                                                                             | PASS new test separately typechecked (app typecheck excludes tests)                                                                                              |
| `workspace @osmosis-labs/web exec next build`                                                                                                                                                                                                                                                                                                                        | PASS compilation, 62 static pages and traces; existing Edge Node-API/computedFn warnings remain. Next skips type/lint validation; web postbuild sitemap not run. |
| `exec eslint packages/web/jest.react19-peers.config.js packages/web/stores/__tests__/react19-external-stores.spec.tsx`                                                                                                                                                                                                                                               | PASS, 0 errors/warnings                                                                                                                                          |
| `exec prettier --check package.json packages/web/jest.react19-peers.config.js packages/web/stores/__tests__/react19-external-stores.spec.tsx docs/react19-peer-cleanup.md` / `git diff --check`                                                                                                                                                                      | PASS                                                                                                                                                             |

The ignored test-typecheck config is reproducible as:

```json
{
  "extends": "../../packages/web/tsconfig.json",
  "compilerOptions": { "incremental": false },
  "include": [
    "../../packages/web/stores/__tests__/react19-external-stores.spec.tsx"
  ],
  "exclude": []
}
```

The first focused test attempt failed **two fixture failures**, not a passing
check: spying on a bound Zustand hook did not spy on the captured vanilla store,
and `ssr: true` plus `storage: null` left wagmi's persist object absent. Tests now
observe the actual vanilla subscription and use inert persist-enabled storage;
no production lifecycle code was changed to accommodate the fixture.

Full Jest was **not rerun** by this peer task; the integration's late CosmosKit
fetch/log failure remains the separate lifecycle agent's responsibility. No full
suite success or production/browser wallet readiness is claimed. No production
server was launched. Commits use normal hooks, without disabling hooks or flags.
