# React 19 safe browser smoke evidence

**Ready for review of the scoped migration; not release/deployment approval.**

Started clean at `275b255ad050b11ccbf799e60323d8c555baf265`, branch
`chore/react19-integration`, assigned worktree
`/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration`.
Read the full updated migration-status document first. The earlier
`f1aa45bbb4f04a93768a0d0129874f59b3749b7c` migration and both cleanup integrations
were retained, not reset/reverted. No other checkout/branch was modified.

## Dependency and execution boundary

Node 24.21.0; existing local React 19.3.0, Next 15.5.25,
`@playwright/test`/Playwright 1.63.0. Local package realpaths resolve inside this
worktree; root `node_modules` is a directory, not a symlink. Direct npm registry
metadata returned HTTP 200, confirmed selected published **stable** Playwright
1.63.0 (latest 1.63.0) and Next 15.5.25 (latest 16.4.0). Next's declared React
peer accepts `^19.0.0` and Playwright accepts `^1.51.1`; Playwright requires Node

> =20. No dependency versions, manifests, lockfile, vendor or production source
> were changed. No unavailable version or inferred peer range was fabricated.

The integration's already-built library workspaces, generated lists and existing
production Next build were reused; library builds/generation/full production
build were **not** repeated in this browser-only phase. The new isolated fixture
is built directly by Next before every final smoke run, with actual lint/types
checks enabled (no `ignoreBuildErrors`/`ignoreDuringBuilds`). No Turbo wrapper,
configuration or commands were used.

## Passing offline browser evidence

Reusable tests/config/server under `packages/e2e/safe-react19/`; see its README
for exact commands and safeguards. This is an isolated **test** Next app, not a
new production debug route. The Playwright config runs **only**
`components.spec.ts`, defaults to localhost 4179, rejects remote `BASE_URL`,
never reuses an existing listener, and launches/stops its own server. Browser
requests must be same-origin GET/HEAD; server additionally rejects `/api/`.
External requests fail instead of silently returning invented success. No
wallet providers, connectors, discovery, signing methods or transaction code
are instantiated in this fixture.

Final built-fixture suite passed twice: **12 tests, exit 0, 27.0s / 27.1s**, on
1280×900 desktop and 390×844 touch/reduced-motion Chromium viewports. Actual
Playwright-downloaded Chromium 153.0.8010.12 is worktree-local under `.yarn`, not
borrowed from the parent. Final runs had **no pageerror, console.error, HTTP or
request failures**, and no React/ref/hydration warnings. An exact TradingView
warning remained: `Chart.Model.StudyPropertiesOverrider:Study plot does not have
property 'visible'`; warning attachments retain it and the test allows only this
known vendor warning, plus the two known Lottie development warnings. Nothing
was suppressed on console/network error channels.

| Surface       | Actual assertion scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AutosizeInput | Actual controlled DOM input hydrates; width grows/shrinks with decimal edits; caret position and focus retained; decimal/autocomplete/autocorrect/spellcheck attributes retained. Real asynchronous local font loads while input is focused; measured width agrees with browser text measurement.                                                                                                                                                                                                                                                                                                                                          |
| ModalBase     | Real React Modal dialog focus, Escape request, retained portal during 150ms close, onAfterClose, portal removal and focus return. Visual IconButton is test-only native UI; production modal wrapper/runtime stays real.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Drawer        | Actual Headless UI 300ms transition settles, then real Focus Trap activates; Tab/Shift-Tab wrap, Escape does not deactivate (existing policy); close unmounts and returns focus.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Tippy         | Real patched runtime/useSingleton; object child ref; first/second content switches; removing second target hides its tooltip and first remains usable. Unit regressions also cover callback refs and all patched entry points.                                                                                                                                                                                                                                                                                                                                                                                                             |
| Stepper       | Real direct-Step indexing with non-Step indicator/navigation children; active/hidden slides, bounds-disabled navigation and indicator selection.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Stores        | Actual Zustand navbar subscription updates to 10 after the UI setter. No real adapter/connected account update is claimed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Visx/Spring   | Actual ResizeObserver/native SVG dimensions respond to viewport resize; animated path changes after data edit; real pointer movement creates bounded tooltip near right edge; depth bars and editable range submit a changed value. Desktop mouse drag and Chromium emulated 80px touch drag both exercised. Fixture reports preview separately and commits min on submit; production debounced/long-drag form integration is not proven.                                                                                                                                                                                                  |
| Lottie        | Actual DynamicLottieAnimation loads existing collect JSON and real v3 engine/SVG at 300×150; desktop hover starts, leave recreates stopped engine, hover restarts. Reduced-motion emulation keeps autoplay at frame zero. No OS/device or complete tutorial/rewards card accessibility approval.                                                                                                                                                                                                                                                                                                                                           |
| TradingView   | Actual AdvancedChart initialization; `TradingView.version()` reports `CL v27.006 (internal id c7d57a22 @ 2024-05-21T16:14:30.134Z)`; actual iframe/canvas loads in-memory bars, subscribes, unsubscribes/removes on unmount and initializes again; actual Next client navigation to/from the separate fixture away page also unsubscribes/removes and reinitializes it. Static unchanged vendor bundles `962.9f54d549868e21286372.js` and `lt-stickers-atlas.52ad6e6d7d7b134ab0ba.js` retain React 18.2.0 markers; no vendor edits. Initialized flag/datafeed and custom CSS URL are explicit fixture inputs, not live flags/API coverage. |

Module replacements are deliberately limited: translation/feature-flag hook
barrel and visual assets/button/loader barrels. Autosize, ModalBase, drawer,
Stepper/control-state, observer/store, Visx/Spring, Tippy and Lottie are real
imports from the migrated web workspace. Local fixture styles approximate layout;
production styles, icons, native keyboard and full forms are **not** asserted.

### Failures encountered, not retroactively called passing

- Initial fixture startup failed on unsupported `next.config.cjs`, external TS
  imports and sprite barrel loading. Corrected to supported Next config, external
  directory compilation and exact module replacements; no app code changed.
- Incorrect fixture Lottie DOM ref generated a pageerror, which failed the run.
  Fixed the test's observer ref on a surrounding real DOM node and observed actual
  engine-ready/frame subscriptions. Ref was never made valid via casts.
- Early tooltip/drag targets hit initialization/clip edges; tests now move into
  the series before the bounded right-edge tooltip assertion and hit the visible
  half of the range handle. Early 25px mobile gestures emitted no touchmove and
  submitted the unchanged value; the 80px CDP gesture emits actual touchmove.
  This was harness-input diagnosis, not evidence of a migration source defect.
- Early vendor mounting accidentally hovered Lottie and its production custom
  CSS requested external Google Fonts. Fixture CSS override is now explicit;
  no vendor file was edited and no external success blanket interception added.
- Auditing every warning exposed the custom **development** server's Next HMR
  `isrManifest`/`components` warning. Final harness builds/serves the fixture in
  production mode, without the HMR subsystem; it does not hide that warning.
- Early standalone/Next fixture lint configurations failed on page export
  conventions, workspace ownership and duplicate import-plugin identity. The
  fixture now has its own Next/TypeScript lint config with explicit workspace
  package ownership, internal `~/` namespace, conventional CommonJS config
  support and Next page/config exports. No root lint config/rules changed.
  Final fixture build and explicit scoped lint both pass without ignored errors.
- Extending TradingView coverage to actual Next client navigation produced one
  **FAIL exit 1** (11/12) on a blocked external `/analytics.js` request and its
  console/network errors. Read-only inspection of unchanged vendor
  `library.ed30e653462ab0610aff.js` found Google Analytics loaded when internal
  feature `14851` is enabled and `Math.random() <= 0.02`. **Vendor telemetry is
  nondeterministic** even with deterministic bars/flags. No random override,
  vendor edit, telemetry-success mock, console suppression or automatic retry
  was added. Two subsequent unchanged final navigation-inclusive runs passed
  12/12 at 27.0s/27.1s; those passes do not erase the sampled-telemetry failure or
  promise a permanently offline deterministic vendor. The strict suite will
  fail again if that request is sampled. Earlier toggle-only final runs also
  passed 12/12 at 26.6s/26.4s.

## Actual production-app diagnostic — limited and failing overall

Own `next start` servers used ephemeral loopback ports; no request to the remote
stage app was made. Unstubbed `/` returned **HTTP 200**, title **Trade on Osmosis
Zone**. One initial `domcontentloaded` wait timed out after 45s; subsequent
commit-based probes showed external Google Fonts stylesheet requests pending,
or failing with `net::ERR_INVALID_HANDLE`. In one unstubbed session the trading
UI eventually hydrated and exposed ATOM/OSMO and two `Connect wallet` buttons,
but quote validation errors remained. Another 45s session still had fonts pending
and no Connect button. **Unstubbed app boot is not a passing smoke check.**

The reusable production diagnostic explicitly stubs only the two Google Fonts
stylesheet requests with empty CSS (`--local-font-stub`), captures sanitized
counts/categories (never raw config/inputs/query strings), and returns nonzero
on outstanding errors. Actual reruns on localhost **52389** and **52933** produced the same results:

- `/`: HTTP 200, document readyState `complete`.
- Real disconnected WalletSelectModal opened from Connect wallet, rendered the
  wallet list, closed on Escape and returned focus to its opener. No wallet row,
  connection/approval/signature/transaction control was clicked.
- **0 pageerrors; 0 React/ref/hydration console errors** during this session.
- **34 console errors**: 20 `local.quoteRouter.routeTokenOutGivenIn`,
  10 `local.quoteRouter.routeTokenInGivenOut`, 3
  `local.portfolio.getPortfolioAssets`, 1 resource error. Earlier safe symptom
  inspection found quote `invalid_type` (expected string, received undefined)
  and `invalid integer`; this phase did not diagnose or fix their cause.
- Local `/_vercel/speed-insights/script.js`: **HTTP 404 / net::ERR_ABORTED**.
  Other external API/runtime health is not established by this diagnostic.
- Diagnostic **exit 1 / `ok:false`**, intentionally not reported as a clean-app
  pass. Browser and launched server stopped in `finally`; sanitized summary at
  `.yarn/react19-browser/production-summary.json` says `cleanedUp:true`.

Thus the real modal has useful non-signing browser evidence under an explicit
font-delivery stub, but production network/font/quote/portfolio behavior remains
unresolved. This does not remediate React-18-only MetaMask peers or validate
installed/mobile adapter connections, reconnection, signing, order placement,
approvals or on-chain correctness.

## Commands and follow-up checks actually run

All shell commands began with `cd` to the assigned absolute worktree. Here `R`
means `/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration`;
paths below are relative to that root unless prefixed with `R`.

| Command after `cd R &&`                                                                                                                                                                                                                                                                                                                                                                                            | Result                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PLAYWRIGHT_BROWSERS_PATH=R/.yarn/react19-browser/browsers node node_modules/playwright/cli.js install chromium`                                                                                                                                                                                                                                                                                                   | PASS; browser/FFmpeg/headless-shell downloads only inside assigned worktree.                                                                       |
| `PLAYWRIGHT_BROWSERS_PATH=R/.yarn/react19-browser/browsers node node_modules/@playwright/test/cli.js test --config=R/packages/e2e/safe-react19/playwright.config.ts`                                                                                                                                                                                                                                               | PASS twice, 12/12; 27.0s and 27.1s. Config directly builds fixture then serves own localhost Next; no Turbo.                                       |
| `PLAYWRIGHT_BROWSERS_PATH=R/.yarn/react19-browser/browsers node R/packages/e2e/safe-react19/production-probe.cjs --local-font-stub`                                                                                                                                                                                                                                                                                | **FAIL exit 1**, safe real-modal assertions hold but application/resource errors remain, as above.                                                 |
| `node node_modules/typescript/bin/tsc --noEmit -p R/packages/e2e/safe-react19/tsconfig.json`                                                                                                                                                                                                                                                                                                                       | PASS; checks new config/tests/fixture and imported real component types.                                                                           |
| `node .yarn-4.12.0.cjs workspace @osmosis-labs/web run typecheck`                                                                                                                                                                                                                                                                                                                                                  | PASS exit 0; app configuration excludes tests, unchanged signing-mock caveat remains.                                                              |
| `node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec jest --runInBand --runTestsByPath components/input/__tests__/autosize-input.test.tsx components/input/__tests__/autosize-input.ssr.test.tsx __tests__/overlay-compatibility.spec.js components/chart/__tests__/visx-compatibility.spec.tsx components/stepper/__tests__/stepper.spec.tsx components/animation/__tests__/dynamic-lottie-animation.spec.tsx` | PASS exit 0, **6 suites / 38 tests**, 3.25s, no late-console/network errors. Full 79/855 Jest result from integration is retained, not rerun here. |
| `node .yarn-4.12.0.cjs install --immutable`                                                                                                                                                                                                                                                                                                                                                                        | PASS exit 0, existing peer warnings retained, no manifest/lockfile changes.                                                                        |
| `node node_modules/eslint/bin/eslint.js --config R/packages/e2e/safe-react19/eslint.config.mjs packages/e2e/safe-react19`                                                                                                                                                                                                                                                                                          | PASS, no scoped errors/warnings.                                                                                                                   |
| `node node_modules/prettier/bin/prettier.cjs --check packages/e2e/safe-react19`                                                                                                                                                                                                                                                                                                                                    | PASS.                                                                                                                                              |
| `BASE_URL=https://stage.osmosis.zone node node_modules/@playwright/test/cli.js test --config=R/packages/e2e/safe-react19/playwright.config.ts --list`                                                                                                                                                                                                                                                              | Expected **exit 1**, `Safe smoke is LOCAL-only`; rejected before any browser/server/remote request.                                                |
| `git diff --check`; `git diff --quiet -- packages/web/public/tradingview package.json packages/web/package.json packages/e2e/package.json yarn.lock`                                                                                                                                                                                                                                                               | PASS; no production/vendor/manifest/lock changes.                                                                                                  |
| `lsof -nP -iTCP:4179 -sTCP:LISTEN`; same checks on `52389` and `52933`                                                                                                                                                                                                                                                                                                                                             | No remaining fixture or launched production listener. Earlier launched ephemeral production servers were also stopped by their probes.             |

No wholesale E2E, physical mobile OS keyboard, real wallet/adapter signing,
funds movement, swap/order submissions, approvals, deployment, Edge/API health
approval, push or PR. No wallet secrets/dotenv values were read/dumped. No hook
bypass, `--forceExit`, parent/shared module writes or manual error suppression.
Initial source/tests/docs commit: `e6a54b6987c17d58ee1c170d561dac0d358b84ee`.
Normal `git commit -m "test: add local-only React 19 browser migration smoke"`
hooks **passed**: Lerna/Nx ran four workspace pre-commit targets. Their existing
lint-staged globs matched no files in this new E2E-owned directory; this is **not**
hook-provided lint coverage. Explicit scoped ESLint/Prettier/TypeScript and fixture
Next lint/build checks above supply that coverage. Navigation/telemetry evidence
and final cleanup are committed separately with normal hooks; final report lists
both commits.
