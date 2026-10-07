# React 19 integration status

**Ready for code review; not release-validated.** Installation, explicit application
typechecking and Next compilation pass. The full Jest command still exits 1,
despite all assertions passing, and browser/E2E verification remains outstanding.

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

## Integration checks actually run

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

## Outstanding checks and caveats

1. **Full Jest is not green.** Two complete runs reproduced exit 1 with
   `Cannot log after tests are done`: Cosmos Kit's asynchronous fetch of
   `https://raw.githubusercontent.com/cosmos/chain-registry/master/dungeon1/assetlist.json`
   fails with `read EINVAL`, then warns after teardown. First run (before Markdown
   tests): 76 suites / 838 assertions passed. Final run: 77 / 841 passed. The
   fetching code/dependency is unchanged by this migration, but a clean-stage
   reproduction was not performed; this is an external/test-teardown failure,
   not a proven baseline pass. Do not suppress the warnings to declare success.
2. Yarn still reports React peer mismatches for nested
   `use-sync-external-store@1.2.0` (wagmi) and `1.2.2` (zustand), plus the existing
   TypeScript 5.9.3 versus ESLint dependency `>=5.7.2 <5.8.0` mismatch and ignored
   workspace-local resolutions. They do not block installation. No transitive
   peer ranges were silently widened; wallet/store runtime coverage is needed.
3. Next compilation warns about Node APIs in Edge-runtime dependency imports
   (including dataloader) and static generation reports MobX computedFn warnings.
   Build success does not verify deployed API/Edge behavior or external services.
4. Browser/E2E checks **not run**: chart sizing/animation/drag/tooltip flipping;
   drawer transition/focus cycling and Escape policy; modal delayed-close/focus
   return; singleton tooltips; autosize font/layout/hydration and mobile decimal
   keyboards; limit-price/slippage/spend-limit editing; rewards/tutorial Lottie
   hover restarts/sizing/reduced motion; wallet connect/store updates.
5. All source/manifest/lockfile changes are committed on the integration branch.
   Reviewable does not mean safe to release: resolve the Jest teardown failure,
   review remaining peers, and complete browser/production smoke checks first.
