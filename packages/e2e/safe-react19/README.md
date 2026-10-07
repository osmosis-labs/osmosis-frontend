# Local-only React 19 browser smoke

This directory is **not** the existing remote, fund-moving E2E suite. Run only
this config. It builds a separate Next fixture, starts its own loopback server,
uses no dotenv/wallet secrets, and imports the web workspace's actual migrated
components. Do not run `packages/e2e/playwright.config.ts` for migration smoke.

From the assigned integration worktree, after immutable install, library builds
and web generation (see `docs/react19-migration-status.md`):

```sh
cd /Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration && PLAYWRIGHT_BROWSERS_PATH=/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration/.yarn/react19-browser/browsers node node_modules/playwright/cli.js install chromium
cd /Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration && PLAYWRIGHT_BROWSERS_PATH=/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration/.yarn/react19-browser/browsers node node_modules/@playwright/test/cli.js test --config=/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration/packages/e2e/safe-react19/playwright.config.ts
cd /Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration && node node_modules/typescript/bin/tsc --noEmit -p /Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration/packages/e2e/safe-react19/tsconfig.json
cd /Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration && node node_modules/eslint/bin/eslint.js --config=/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration/packages/e2e/safe-react19/eslint.config.mjs packages/e2e/safe-react19
```

- Unset `BASE_URL`. The config rejects a remote override before launching anything.
  `REACT19_SMOKE_PORT` may select another unused local port (default **4179**).
  Existing listeners are not reused or killed. The server binds only
  `127.0.0.1`, checks Host, rejects non-GET/HEAD and `/api/` requests.
- Browser external/mutating requests, HTTP failures, request failures,
  `pageerror` and **every** `console.error` fail the tests. React/ref/hydration
  warnings fail too. No network-success blanket mocks or error-log suppression.
  All warnings are attached to ignored test artifacts. The two known Lottie
  development warnings and exact vendor study-property warning are reported
  separately, not claimed resolved. Final production-fixture runs only emitted
  the vendor warning.
- Module replacement is limited to translation/initialized-feature hooks and
  visual icon/button/loader barrels. The actual AutosizeInput, ModalBase,
  Drawer/Headless UI/Focus Trap, Stepper/control-state hooks, Visx/Spring charts,
  Tippy, DynamicLottieAnimation and Zustand navbar store run unchanged. The
  fixture's own styles/visual controls do **not** validate production styling.
- Fonts load asynchronously from a real local vendor WOFF2, while caret/focus
  remain under test. Touch dragging is Chromium CDP input with an 80px gesture
  (small gestures did not produce touchmove); no synthetic DOM mouse events.
  This is emulation, not an OS decimal-keyboard or physical mobile-device test.
- TradingView uses the **unchanged** app `AdvancedChart` wrapper, vendor v27
  script/bundles and isolated iframe, with an in-memory bar datafeed and initialized
  flag, including actual Next client navigation cleanup. A fixture-only `custom_css_url` avoids production Google Fonts. No RPC,
  real market data, broker/order API or vendor React modification.
- Unchanged v27 vendor code conditionally samples Google Analytics at 2%.
  A navigation run failed on that blocked external request; subsequent runs
  passed without source changes. Inputs are deterministic, **vendor telemetry is
  not**. The audit intentionally fails if it is sampled; there is no random
  override, vendor modification, telemetry-success mock or automatic retry.
- The offline suite does not import wallet providers/adapters. Store updates are
  real Zustand UI subscriptions, **not** wallet signing/connection validation.
- Build output, browsers and results stay under `.yarn/react19-browser`.
  Screenshots, videos and traces are off. Playwright stops its launched server;
  the separate production probe stops only its own server/browser in `finally`.

## Optional production diagnostic — not a clean-app assertion

After a direct production web build, `production-probe.cjs` starts that build on
its own ephemeral localhost port and captures sanitized counts/categories. It
opens only `Connect wallet`, presses Escape and checks focus return; **never
select an adapter**. Ordinary app read/quote/telemetry requests may occur. No
secrets, config objects, request query strings or raw error payloads are dumped.

```sh
cd /Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration && PLAYWRIGHT_BROWSERS_PATH=/Users/markobaricevic/code/cosmos/osmosis-frontend-react19-worktrees/integration/.yarn/react19-browser/browsers node packages/e2e/safe-react19/production-probe.cjs --local-font-stub
```

The optional flag replaces only Google Fonts stylesheet requests with explicit
empty CSS; **it does not validate production font delivery**. Without the flag,
font delivery blocked or delayed hydration in this environment. This diagnostic
exits **1**, not success, whenever application/network errors remain or the
modal could not be checked. See `docs/react19-browser-smoke.md` for actual results.
