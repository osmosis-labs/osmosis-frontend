# React 19 Jest lifecycle repair

Branch: `fix/react19-test-cleanup`, starting at `f1aa45bbb4f04a93768a0d0129874f59b3749b7c`.
Node **24.21.0**, checked-in Yarn **4.12.0**. Independent, directory-valued
`node_modules` in both assigned worktrees; no shared module writes or Turbo.

## Cause and scoped fix

The generated chain list includes the retired **dungeon1** chain, but its asset
list is absent. `RootStore` constructs `AccountStore`, whose Cosmos Kit
`WalletManager` constructs `WalletRepo`. `@cosmos-kit/core@2.18.1`'s
`cjs/repository.js` starts `ChainRegistryFetcher.fetchUrls()` in the constructor.
That promise is neither exposed nor cancelled by `onUnmounted()` (which only
removes wallet event listeners). The fetcher uses **cross-fetch/node-fetch**, not
just the global fetch. Closing MSW/JSDOM before it finishes leaves a GitHub fetch
that fails with `read EINVAL` and warns after Jest teardown.

This is **reproduced baseline behavior, not introduced by React 19**:

| Unmodified checkout                                                 | Full Jest result                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Integrated migration, `f1aa45bbb`                                   | 77 suites / 841 tests pass; **exit 1**, late dungeon1 fetch/log failures |
| Detached original stage, `194460081a07a2c4b53e79f39a970c0c30ad989b` | 68 suites / 794 tests pass; **exit 1**, same late fetch/log failures     |

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
  account waits. No signing or broadcasting occurs in the new tests.

No production code, root/web manifests, lockfile, React peers, or unrelated
branches/checkouts were changed. All original assertions are retained.

## Commands and results

Commands were run after `cd` to these absolute worktree roots:

- Fix: `/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/test-cleanup`
- Baseline: `/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/stage-baseline`

Both worktrees independently ran:

```sh
node .yarn-4.12.0.cjs install --immutable
for name in proto-codecs unit math types utils server tx bridge keplr-stores keplr-hooks stores trpc; do
  node .yarn-4.12.0.cjs workspace "@osmosis-labs/$name" run build
done
node .yarn-4.12.0.cjs workspace @osmosis-labs/web run generate
node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec jest --runInBand
```

Immutable install, all 12 direct library builds, and generation **pass** in both.
Generation retains missing-currency warnings. The unmodified Jest failures are
listed above. Baseline tracked source remains clean and no baseline commit was
created. Registry metadata GETs independently confirmed installed stable versions
`@cosmos-kit/core@2.18.1`, `@chain-registry/client@1.53.345`, and `msw@2.15.0`
(MSW TypeScript peer `>=4.8.x`; registry client depends on cross-fetch `^3.1.5`;
Cosmos Kit/core and registry/client publish no peer dependencies). Current registry
latest tags are respectively `2.18.1`, `2.0.281`, and `3.0.2`; this repair keeps the
installed stable APIs rather than upgrading unrelated packages.
Published/local implementations were inspected; no dependency changes are needed.

After the fix, from the fix worktree:

| Exact command                                                                                                                                                                                                                         | Result                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec jest --runInBand --runTestsByPath __tests__/test-lifecycle.spec.tsx`                                                                                                          | **PASS exit 0**, 8 regressions, no console errors            |
| `node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec jest --runInBand` (twice with regressions)                                                                                                                                    | **PASS exit 0**, 78 suites / 849 tests, 61.812s and 61.140s  |
| `node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec jest --runInBand --detectOpenHandles`                                                                                                                                         | **PASS exit 0**, 78 / 849, 81.960s; no open handles reported |
| `node .yarn-4.12.0.cjs workspace @osmosis-labs/web run typecheck`                                                                                                                                                                     | **PASS exit 0** (application config excludes tests)          |
| `node .yarn-4.12.0.cjs install --immutable` (final)                                                                                                                                                                                   | **PASS**; unchanged peer warnings                            |
| `node .yarn-4.12.0.cjs exec eslint packages/web/__tests__/setup-tests.ts packages/web/__tests__/msw.ts packages/web/__tests__/test-utils.tsx packages/web/__tests__/test-lifecycle.ts packages/web/__tests__/test-lifecycle.spec.tsx` | **PASS**, 0 errors/warnings                                  |
| `node .yarn-4.12.0.cjs exec prettier --check` with the same five paths                                                                                                                                                                | **PASS**                                                     |
| `git diff --check`                                                                                                                                                                                                                    | **PASS**                                                     |

Validation logs/configs and generated/library artifacts remain ignored under
`.yarn/jest-cleanup-validation/`, workspace build directories and generated config.
No `--forceExit`, console suppression, ignored network failures, or generic
success-response interceptors were used. Normal `git commit` hooks **passed**, without bypass: root `pre-commit` ran Lerna's
four configured package targets, including web lint-staged's Prettier and
`next lint` checks for all five scoped test files.

## Remaining limitations

A separate, test-inclusive diagnostic check
`node .yarn-4.12.0.cjs exec tsc --noEmit -p .yarn/jest-cleanup-validation/tsconfig-tests.json`
**exits 2 in both worktrees**, solely at the unchanged `__tests__/test-wallet.ts`
lines 184 and 221: the provider mock returns `Long` where the current Cosmos Kit /
CosmJS `signDirect` interface expects `bigint`. The local config extends web's
normal tsconfig, disables incremental output, includes the scoped tests/helpers
plus `window.d.ts`/`next-env.d.ts`, and excludes no imported dependencies. This
pre-existing signing-mock incompatibility is outside lifecycle ownership, not a
passing test typecheck. No diagnostics originate in the changed files.

No Next build was rerun for this test-only correction. No E2E suite, browser
wallet/signing flow, deployment, or real transaction was run. This proves unit
suite lifecycle stability, not wallet signing compatibility or release readiness.
React transitive peer remediation remains owned by the separate peer agent.
