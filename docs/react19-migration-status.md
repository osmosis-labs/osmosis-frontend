# React 19 integration status

**Ready for scoped migration review; not release-validated.** Safe localhost
browser/component evidence is recorded below; the real app diagnostic still
fails on font/API/resource behavior. Combined
immutable installation, all library builds, generation, explicit application
typechecking, full Jest twice, focused suites, Next compilation and sitemap
postbuild pass. Wallet adapter peers, signing-mock types and browser behavior
remain caveats; unit/build success is not release approval.

Base: local stage `194460081a07a2c4b53e79f39a970c0c30ad989b`.
Integration: `chore/react19-integration`. No fetch, rebase, push, parent-checkout
changes, or individual-agent branch/worktree modifications were performed.

## Integrated groups

Each scoped group remains a separate cherry-picked commit. All five agent
worktrees were clean when inspected. Shared manifests were reconciled semantically;
Yarn regenerated and validated the combined lockfile instead of inventing entries.

| Branch (`chore/react19-…`) | Original commit | Integration commit |
| -------------------------- | --------------- | ------------------ |
| state-animation            | `659f3d1f2`     | `69538bed4`        |
| charts                     | `80fc6cc53`     | `94377ae09`        |
| overlays                   | `da1bba5ca`     | `6db352412`        |
| inputs                     | `7ce2fcf27`     | `9e56d818a`        |
| core                       | `ca30d3daa`     | `341c6ad52`        |

Integration correction: `afd874931` migrates the single Markdown wrapper to
`react-markdown@10.1.0`, uses its public types, configures its ESM pipeline for Jest,
and adds three rendering/security/SSR regressions. This addresses an actual React
19 type failure, not an unrelated dependency upgrade: before this correction,
`typecheck` exited 2 with TS2503 at `react-markdown/lib/complex-types.ts:25,26`
and TS2344 at line 27. Those diagnostics are now resolved.

## Dependency choices

Registry version/latest metadata and peers were independently rechecked during
integration. No peer ranges were widened.

- React, React DOM, `@types/react`, `@types/react-dom`: exact **19.3.0** in both
  root resolutions and web declarations. React DOM/types require matching 19.3
  peers. Next remains **15.5.25**, whose peers explicitly accept React 19.
- MobX React Lite **4.1.1**, MobX locked/deduplicated at **6.16.1**. Lite 4 supports
  React 18/19 and requires MobX `^6.9.0`; Lite 5 would require unrelated MobX 7.
  Existing workspace-aligned MobX manifest ranges are unchanged.
- Lottie React **3.1.2**: explicit React 18/19 peers; named `Lottie`/`src` API.
  Client-only loading and autoplay/loop defaults are preserved; stale loads are
  ignored. Hover autoplay changes recreate/restart the engine in v3.
- All five direct Visx packages **4.0.0**, Spring **10.1.2**: explicit React 18/19
  support and compatible Spring peers. Visx bounds uses DOM refs, not findDOMNode.
  Compact chart CSS targets the new measurement wrapper. Native ResizeObserver
  is required (older browsers need a polyfill).
- React Modal **3.16.3**, Focus Trap React **12.0.3**: explicit React 19 peers.
  Tippy remains **4.2.6** (latest) with a tracked Yarn patch: both cloning layers
  select `props.ref` on React 19 and `element.ref` on React 18, covering standard
  and headless ESM/UMD/minified bundles. Keep the patch tracked despite `.yarn`
  being ignored. Existing callback node/null semantics are retained; this does
  not add support for React 19 callback-ref cleanup return functions.
- Abandoned React Input Autosize **3.0.0** only supports React 16/17. It and its
  types are removed; all three consumers use the local controlled input. Review
  confirmed stable native refs, layout measurement, placeholder/minimum sizing,
  untouched caret/value, font/resize cleanup, SSR and decimal attributes.
- React Markdown **10.1.0**: latest stable, React/types peers `>=18`, published
  React 19 JSX-runtime implementation and scoped imported JSX declarations.
  Paragraph/link styling, HTML escaping and unsafe-URL filtering remain tested.

## Initial integration checks (through `f1aa45bbb`)

Historical results below are retained for provenance. The follow-up results in
the next section supersede the Jest failure, shim mismatch and unrun postbuild.

Node **24.21.0**, checked-in **Yarn 4.12.0**, independent worktree-local
`node_modules` (not a symlink). Commands below run from this worktree's root.

| Check                                                                         | Result                                                                                    |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `node .yarn-4.12.0.cjs install`                                               | PASS, including dependency/root lifecycle scripts                                         |
| `node .yarn-4.12.0.cjs install --immutable` after final dependency changes    | PASS; no installation or lockfile blocker                                                 |
| Direct `workspace <name> run build` in dependency order                       | PASS, all 12 library workspaces; no Turbo                                                 |
| `workspace @osmosis-labs/web run generate`                                    | PASS, with missing-currency warnings for registry chains                                  |
| `workspace @osmosis-labs/web run typecheck`                                   | PASS after Markdown correction; not inferred from Next build                              |
| Chart focused Jest config                                                     | PASS: 5 tests on integrated React 19                                                      |
| State/animation focused Jest config                                           | PASS: 8 tests on integrated React 19                                                      |
| Overlay isolated Jest config                                                  | PASS: 15 tests on integrated React 19                                                     |
| Autosize isolated Jest config                                                 | PASS: 11 tests on integrated React 19                                                     |
| Standard Jest: Stepper, memo refs, Markdown                                   | PASS: 3 suites / 8 tests, exit 0                                                          |
| Markdown suite with isolated local React/React DOM 18.3.1 mappings            | PASS: 3 tests; integration runtime/lockfile remains React 19                              |
| `workspace @osmosis-labs/web exec jest --runInBand`                           | **FAIL exit 1**: 77 suites / 841 assertions passed; late fetch/log errors below           |
| `workspace @osmosis-labs/web exec next build` after library builds/generation | PASS: compilation, page data, 62 static pages and traces; Next skips type/lint validation |
| Scoped ESLint / Prettier / `git diff --check`                                 | PASS; ESLint has 0 errors, 9 existing render-ref warnings                                 |
| `node .yarn-4.12.0.cjs run lint:workspace`                                    | PASS                                                                                      |
| Normal commit hooks                                                           | PASS where installed; never disabled/bypassed                                             |

Direct library build order: proto-codecs, unit, math, types, utils, server, tx,
bridge, keplr-stores, keplr-hooks, stores, trpc (all `@osmosis-labs/…`).
The Next command deliberately avoids the web script's Turbo wrapper after those
prerequisites. The web `postbuild` sitemap command was not run.
Group documents retain their standalone React 18/19 reproduction details;
integration reran the actual final React 19 dependency graph, not sandboxed 19
imports for those groups. Ignored local validation logs are under
`.yarn/react19-validation/`.

## Release-fix integration and independent revalidation

Phase start: `f1aa45bbb4f04a93768a0d0129874f59b3749b7c` on
`chore/react19-integration`; original stage base remains
`194460081a07a2c4b53e79f39a970c0c30ad989b`.
Assigned worktree:
`/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration`.
Both source branches/worktrees were inspected read-only and clean. Both reports
contained actual committed changes; neither was assumed successful from its
summary alone. Cherry-picks used `-x`, preserving original commit provenance:

| Source branch              | Original commit                            | Integration commit |
| -------------------------- | ------------------------------------------ | ------------------ |
| `fix/react19-test-cleanup` | `caed4a5fcfb7f7a053f8bbf3789075f11429518a` | `4610fefec`        |
| `fix/react19-peer-cleanup` | `47fcfc00fd644b7511b72d689d92d242bdfac6be` | `6fcbfb7a2`        |

No conflicts occurred. The committed Yarn-generated lockfile applied cleanly;
combined immutable installs verified it without regeneration or handwritten
records. React/runtime/types remain **19.3.0**, Next **15.5.25**. Direct Zustand
now resolves **4.5.7** inside its existing `^4.5.5` range. The three exact-parent
shim resolutions and their reassessment requirement are described in
[peer cleanup](react19-peer-cleanup.md).

### Patch/API review and corrective work

- Test infrastructure supplies only the exact dungeon1 asset-list fixture, not
  wildcard network success. MSW now errors on unhandled requests. The registry
  subclass calls the real `fetchUrls()` and returns its original promise;
  rejection observation fails teardown even when upstream catches the error.
  Provider query cancellation, wallet listener/session timer cleanup and bounded
  settlement happen before handlers reset/server close. No production fetcher,
  error logger or wallet implementation changed. The delayed-fetch and rejection
  regressions pass on this combined graph.
- Installed Cosmos Kit `repository.js` independently confirms the detached
  constructor fetch; `manager.onUnmounted()` removes listeners but does not own
  that fetch. Installed registry fetcher delegates to cross-fetch, parses/updates
  data, and aggregates fetches with `Promise.all`. The lifecycle agent's detached
  clean-stage reproduction is documented in
  [Jest cleanup](react19-jest-cleanup.md); **this phase did not rerun that baseline**.
  The offline fixture does not establish that dungeon1 works in production.
- Direct GETs to npm registry metadata independently verified all selected stable
  versions: shim 1.7.0, Zustand 4.5.7/4.4.1, wagmi 2.12.17, Valtio 1.11.2,
  Cosmos Kit core 2.18.1, registry client 1.53.345, MSW 2.15.0, and the installed
  MetaMask SDK/modal 0.28.4/0.28.1. Shim peers explicitly accept React 19;
  MetaMask SDK/modal peers remain `^18.2.0`. Installed selector implementation
  retains the five-argument API, server snapshots/equality memoization and native
  React delegation. Issuer-specific realpath audits from wagmi, direct/nested
  Zustand, Valtio and MobX resolve **shim 1.7.0 / React 19.3.0**, with callable
  selector exports, entirely inside this worktree.
- Integration correction **`beb19b916`** fixes the new offline wagmi test's type
  incompatibility when the app's global `Register` augmentation is included.
  Its standalone test typecheck had passed, but the combined test-inclusive check
  initially failed at `WagmiProvider`: a single-chain/custom-transport config does
  not match the registered 18-chain/fallback-HTTP config. The test now imports
  only pure shared chain data (not the app's live wallet config), uses inert
  storage/no connectors/no discovery/no reconnect, and matches the registered
  transport shape. Installed viem's `onFetchRequest` is awaited **before fetch**;
  its test callback throws on any attempted request, with retries disabled.
  The zero-request assertion is retained. No type casts or diagnostic suppression
  were added. One intermediate fixture attempt used unavailable `fetchFn`; its
  typecheck failed and it was replaced using the inspected installed API.

### Commands actually rerun on the combined graph

Node **24.21.0**, checked-in Yarn **4.12.0**; `node_modules` is a local directory,
not a shared/symlinked installation. Every shell command began with `cd` to the
assigned absolute worktree. In this table, `Y` means
`node /Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration/.yarn-4.12.0.cjs`.
Logs/configs remain ignored and local under `.yarn/react19-revalidation/`.

| Exact command after `Y`                                                                                                                                                        | Actual result                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `install --immutable` (combined and final)                                                                                                                                     | **PASS exit 0**; lifecycle scripts enabled (`config get enableScripts` → true). Cached dependency lifecycle work was not forcibly rebuilt.                                        |
| `run postinstall`                                                                                                                                                              | **PASS exit 0**, explicitly reran root workspace validation; no script bypass.                                                                                                    |
| `explain peer-requirements p9c5ea4`                                                                                                                                            | **PASS**, web React 19.3.0 satisfies all requests; no React version-range YN0060 on install. Full peer output separately audited, caveats below.                                  |
| `workspace @osmosis-labs/<name> run build`                                                                                                                                     | **PASS exit 0**, all 12 in order: proto-codecs, unit, math, types, utils, server, tx, bridge, keplr-stores, keplr-hooks, stores, trpc.                                            |
| `workspace @osmosis-labs/web run generate`                                                                                                                                     | **PASS exit 0**; existing missing-currency registry warnings retained.                                                                                                            |
| `workspace @osmosis-labs/web run typecheck`                                                                                                                                    | **PASS exit 0**, also after fixture correction; app config excludes tests.                                                                                                        |
| `workspace @osmosis-labs/web exec jest --runInBand` (twice after final fixture correction)                                                                                     | **PASS exit 0** both: **79 suites / 855 tests**, 47.745s and 60.661s. Two earlier combined runs also passed (62.289s/60.979s). No late console/network errors or exit workaround. |
| `workspace @osmosis-labs/web exec jest --runInBand --detectOpenHandles`                                                                                                        | **PASS exit 0**, 79 / 855, 79.6s; no open handles reported.                                                                                                                       |
| `workspace @osmosis-labs/web exec jest --config jest.charts.config.js --runInBand`                                                                                             | **PASS**, 1 suite / 5 tests.                                                                                                                                                      |
| `workspace @osmosis-labs/web exec jest --config jest.state-animation.config.js --runInBand`                                                                                    | **PASS**, 2 suites / 8 tests.                                                                                                                                                     |
| `workspace @osmosis-labs/web exec jest --config jest.react19-peers.config.js --runInBand`                                                                                      | **PASS**, 5 suites / 44 tests, repeated after final fixture correction; requires utils build.                                                                                     |
| `workspace @osmosis-labs/web exec jest --runInBand --runTestsByPath __tests__/overlay-compatibility.spec.js __tests__/test-lifecycle.spec.tsx`                                 | **PASS**, 2 suites / 23 tests (15 overlays + 8 lifecycle).                                                                                                                        |
| `workspace @osmosis-labs/web exec jest --runInBand --runTestsByPath components/input/__tests__/autosize-input.test.tsx components/input/__tests__/autosize-input.ssr.test.tsx` | **PASS**, 2 suites / 11 tests.                                                                                                                                                    |
| `workspace @osmosis-labs/web exec next build`                                                                                                                                  | **PASS exit 0**, compilation, 62 static pages and traces; Next explicitly skips type/lint checks. Existing computedFn warnings emitted.                                           |
| `workspace @osmosis-labs/web run postbuild`                                                                                                                                    | **PASS exit 0**, next-sitemap generated one index/one sitemap and robots output; generated files ignored, no deployment.                                                          |
| `exec tsc --noEmit -p .yarn/react19-revalidation/tsconfig-peers.json`                                                                                                          | **PASS exit 0**, standalone new peer test typecheck.                                                                                                                              |
| `exec tsc --noEmit -p .yarn/react19-revalidation/tsconfig-tests.json`                                                                                                          | **FAIL exit 2**, only unchanged `__tests__/test-wallet.ts:184,221` Long/bigint errors remain after fixture correction. Not presented as passing.                                  |
| `exec eslint` across the five lifecycle test files, peer regression and peer config; `exec prettier --check` across those paths and root manifest                              | **PASS**, zero scoped lint errors/warnings; formatting passes.                                                                                                                    |
| `git diff --check`; normal correction commit hooks                                                                                                                             | **PASS**; Lerna/Nx ran four pre-commit targets, including web Prettier and Next lint. No hook bypass.                                                                             |

Build prerequisites and direct Next build plus explicit postbuild reproduce the
web wrapper's steps **without invoking its Turbo wrapper**. The wrapper command
itself was not tested; no Turbo commands/config changes were made. Next build
preceded the final test-only fixture adjustment; production source/dependency
inputs did not change afterward. This incremental build did not re-emit the
initial integration's Edge Node-API warnings; that earlier concern is not thereby
resolved.

The test-inclusive config extends web's tsconfig, sets `incremental: false`,
includes all five lifecycle files plus the peer regression, `window.d.ts` and
`next-env.d.ts`, and sets `exclude: []`. Imported application modules expose the
wagmi registration; imported signing mocks expose the known Long/bigint issue.
The separate peer config includes only that regression. No secrets/dotenv values
were read or dumped.

## Safe browser follow-up

The assigned worktree started clean at `275b255ad`. Added a reusable LOCAL-only
Playwright config and separately built Next test fixture, with no production debug
route, production source/vendor edits, or dependency/lockfile changes.
[Browser evidence](react19-browser-smoke.md) records exact commands, failed
attempts, mocks, remaining warnings and cleanup; the fixture README explains its
execution boundary.

- **PASS:** final production-fixture browser suite twice, **12 tests / exit 0**,
  27.0s/27.1s; desktop and touch/reduced-motion viewports. Real autosize/font/caret
  measurement, ModalBase delayed Escape/focus return, drawer transition/focus
  cycling, patched Tippy singleton, Stepper, Zustand UI updates, Visx/Spring
  resize/tooltip/drag, Lottie hover/reduced motion, and unchanged vendor TradingView
  v27.006 iframe initialization/unmount/remount and actual Next client navigation
  cleanup with offline datafeed.
- **PASS:** fixture/test TypeScript, explicit web typecheck, focused **6 Jest
  suites / 38 tests**, final immutable install, scoped ESLint/Prettier and diff
  checks. Final fixture browser runs have no pageerror/console.error/network/HTTP
  failures or React/ref/hydration warnings. Exact vendor study-property warning
  remains and is recorded rather than claimed resolved. A navigation-inclusive
  run failed on the vendor's sampled Google Analytics request (2% conditional in
  unchanged vendor code); later unchanged runs passed, but that telemetry remains
  nondeterministic and strictly fails the suite when attempted. No telemetry mock,
  random override, vendor edit or error suppression was added.
- **LIMITED real-app evidence:** with only Google Fonts stylesheets explicitly
  stubbed, the real disconnected wallet-selection modal opens, closes on Escape
  and returns focus. No adapter selected. Zero React/ref/hydration errors in that
  session does not imply general wallet/runtime compatibility.
- **FAIL, not a clean-app pass:** production diagnostic returns **exit 1** with
  34 quote/portfolio/resource console errors and local Speed Insights 404/aborted
  request. Unstubbed app font requests hang/fail inconsistently in this environment;
  production font/API/Edge/network behavior is not release-validated.
- All launched fixture/production servers and browsers were cleaned up; final
  listener checks are empty. No stage/parent/shared modules, wallet secrets,
  signatures, approvals, transactions, push, PR or deployment were involved.

## Outstanding checks and caveats

1. **Browser coverage is constrained, not release approval.** Core migrated
   components now have safe local browser evidence, with explicitly mocked
   translation/flags/visual barrels and in-memory TradingView datafeed. Actual
   limit-price/slippage/spend-limit forms, complete tutorials/rewards card UX,
   production CSS/font delivery, physical mobile keyboards/devices, real flags,
   datafeeds and production APIs remain untested or blocked. The real app probe
   fails overall despite limited wallet-modal UI success. Do not run the unsafe
   wholesale E2E suite or perform real wallet signatures, approvals, swaps/orders
   or transfers as part of this validation.
2. **Wallet adapter peers are not fully remediated.** Audited residual requests:
   `pb6aed0` connectors → MetaMask SDK/modal/react-native-webview missing React;
   SDK/modal explicitly require React `^18.2.0`. `pcdf427` is optional missing
   React DOM, still `^18.2.0`; `p45a862` missing React Native is not an instruction
   to add it to this app. `p107690` core → nested Zustand, `p753f8b`
   WalletConnect modal-core → Valtio, and `p492baa` Visx annotation → measure
   lack forwarding despite accepting React 19 versions. Offline subscriptions
   do not validate real adapter/modal/connect behavior. Three upstream exact-pin
   shim overrides are intentional exceptions; reassess when parent versions move.
3. **Test-inclusive TypeScript is blocked** by the unchanged mock signing API's
   Long/bigint incompatibility. Explicit app typecheck and Jest are green, but
   neither proves wallet signing compatibility. The lifecycle agent reproduced
   these diagnostics on original stage; this phase independently confirmed them
   on the final combined graph. No signing was exercised to validate production.
4. Existing TypeScript 5.9.3 versus ESLint `>=5.7.2 <5.8.0` YN0060 (`pbefd5b`),
   ignored workspace-local resolutions and other non-React missing peers remain.
   Next computedFn warnings remain; earlier Edge Node-API import warnings require
   runtime checks. Build success does not verify deployed API/Edge/external services.
5. Integration is ready for **scoped review with safe browser evidence**, not
   release/deployment. Scoped migration and browser source/tests/docs are committed.
   Parent checkout, stage/stage-cf, unrelated upgrade branch and source worktrees
   were not changed; no push/PR/merge into stage/deployment occurred. Browser-phase
   servers were launched only locally and were all cleaned up before handoff.
