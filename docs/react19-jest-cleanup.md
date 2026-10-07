# Jest lifecycle repair on stage (React 18)

Branch: `fix/jest-cosmos-kit-lifecycle`, based on current stage
`812d1275729db20b4581cf5efc56e275ca3d5003` (four commits newer than the
original migration base). This PR extracts only lifecycle commit
`4610fefecfbd0bf1710c71e29de5d18308a0a8cc` with `git cherry-pick -x`, plus
this evidence correction. The filename is historical: **this PR does not
include the React 19 migration**.

Validation used Node **24.21.0**, checked-in Yarn **4.12.0**, and independent,
directory-valued root/web `node_modules` in
`/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/stack-jest`.
Installed versions resolved from the web workspace:

- `react` / `react-dom`: **18.3.1** / **18.3.1**
- `@types/react` / `@types/react-dom`: **18.3.31** / **18.3.7**

Root/web manifests, React ranges/resolutions, and `yarn.lock` remain identical
to stage. No production source, dependency upgrades, or Turbo changes are included.

## Cause and scoped fix

The generated chain list includes the retired **dungeon1** chain, but its asset
list is absent. `RootStore` constructs `AccountStore`, whose Cosmos Kit
`WalletManager` constructs `WalletRepo`. `@cosmos-kit/core@2.18.1`'s
`cjs/repository.js` starts `ChainRegistryFetcher.fetchUrls()` in the constructor.
That promise is neither exposed nor cancelled by `onUnmounted()` (which only
removes wallet event listeners). The fetcher uses **cross-fetch/node-fetch**, not
just the global fetch. Closing MSW/JSDOM before it finishes can leave a GitHub
fetch that fails with `read EINVAL` and warns after Jest teardown.

The original investigation reproduced this leak on **unmodified React 18 stage
`194460081a07a2c4b53e79f39a970c0c30ad989b`**: 68 suites / 794 tests passed,
but Jest exited 1 with late dungeon1 fetch/log failures. That is historical
baseline evidence, **not a rerun on the current stage base**. Historical React 19
integration results are not validation for this extracted PR.

Only test infrastructure changes:

- MSW provides a minimal, schema-tagged native DGN fixture for the **exact**
  dungeon1 asset-list URL. Other URLs are not intercepted generically; unhandled
  requests now error rather than warn/bypass.
- A test-only subclass delegates to the **real** registry fetcher and tracks its
  real promises. Teardown unmounts RTL, cancels/clears provider queries, removes
  test wallet listeners/session timers, then awaits registry work **before**
  resetting handlers/closing MSW. Rejections fail teardown even when caught by
  dependency code; waiting is bounded by a real, cleared 5-second Node timer.
- The account-wait helper uses MobX `when`'s own timeout/reaction disposal instead
  of leaking its old 10-second timeout and cancellation rejection. Missing test
  accounts throw explicitly.
- Eight regressions verify exact mocked network routing, delayed response/state
  settlement before teardown, caught-fetch failure propagation, query abort/cache
  clearing, wallet listener/session-timer removal, and successful/timed-out/missing
  account waits. Wallet connections in the regression use only `TestWallet` and
  the provider mock; no real connection, signing or broadcasting occurs.

All original assertions are retained. No `--forceExit`, console suppression,
ignored network failures, or generic success-response interceptors were used.

## Current validation commands and results

Every command below ran after:

```sh
cd /Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/stack-jest
```

Installation and builds (no Turbo):

```sh
node .yarn-4.12.0.cjs install --immutable
for name in proto-codecs unit math types utils server tx bridge keplr-stores keplr-hooks stores trpc; do
  node .yarn-4.12.0.cjs workspace "@osmosis-labs/$name" run build
done
node .yarn-4.12.0.cjs workspace @osmosis-labs/web run generate
```

**All exit 0**. Installation executed normal lifecycle scripts, including root
`postinstall` workspace lint. Existing peer warnings remain (React, TypeScript,
and missing `prop-types`). Generation retained missing-currency warnings and
successfully wrote the lists, Cosmos Kit wallet list, and sprite IDs.

| Exact command                                                                                                                | Current result                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node .yarn-4.12.0.cjs workspace @osmosis-labs/web run typecheck`                                                            | **Exit 0**; explicit `tsc --noEmit -p tsconfig.typecheck.json` (current config includes tests). No pre-existing typecheck failures observed on this base. |
| `node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec jest --runInBand --runTestsByPath __tests__/test-lifecycle.spec.tsx` | **Exit 0**, 1 suite / 8 tests; 3.703s.                                                                                                                    |
| `node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec jest --runInBand` (first run)                                        | **Exit 0**, 79 suites / 923 tests; 143.786s.                                                                                                              |
| Same full Jest command (second run)                                                                                          | **Exit 0**, 79 suites / 923 tests; 142.101s.                                                                                                              |
| `node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec jest --runInBand --detectOpenHandles`                                | **Exit 0**, 79 suites / 923 tests; 167.821s; no open handles reported.                                                                                    |
| `node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec lint-staged --diff=812d1275729db20b4581cf5efc56e275ca3d5003..HEAD`   | **Exit 0**, normal web Prettier and `next lint` tasks checked all five changed test files.                                                                |

Direct checks from the worktree root:

```sh
node .yarn-4.12.0.cjs exec eslint packages/web/__tests__/setup-tests.ts packages/web/__tests__/msw.ts packages/web/__tests__/test-utils.tsx packages/web/__tests__/test-lifecycle.ts packages/web/__tests__/test-lifecycle.spec.tsx
node .yarn-4.12.0.cjs exec prettier --check packages/web/__tests__/setup-tests.ts packages/web/__tests__/msw.ts packages/web/__tests__/test-utils.tsx packages/web/__tests__/test-lifecycle.ts packages/web/__tests__/test-lifecycle.spec.tsx docs/react19-jest-cleanup.md
git diff --check
```

**All exit 0**, no ESLint errors/warnings. The evidence correction was committed
with normal root `pre-commit` / Lerna package hooks enabled (no bypass).

Logs remain locally ignored under `.validation-logs/`; library/generated outputs
remain ignored. The final diff against the stage base contains only this document
and the five lifecycle test/helper/setup files, with no manifest or lockfile diff.

## Limitations

The current unmodified stage baseline was not rerun; the leak explanation above
retains clearly labelled historical React 18 baseline evidence. These new passing
results validate this fix on the actual current-stage React 18 runtime, not React 19.

No Next production build, E2E suite, real wallet connection/signature/transaction,
financial flow, deployment, or secret inspection was run. This proves unit suite
lifecycle stability, not wallet signing compatibility or release readiness.
