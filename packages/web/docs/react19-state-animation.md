# React 19: MobX and Lottie dependency migration

Base: local stage `194460081a07a2c4b53e79f39a970c0c30ad989b`.

## Dependency selection

Registry metadata and published package sources/types were inspected:

- `mobx-react-lite@4.1.1`: stable React peers `^16.8.0 || ^17 || ^18 || ^19`,
  MobX peer `^6.9.0`. The current latest major, `5.1.0`, requires MobX 7 and
  was deliberately not selected. The existing observer/context usage and
  `_app.tsx`'s `enableStaticRendering` need no API changes. Version 4 uses
  `useSyncExternalStore` and disposes committed reactions on unsubscribe.
- `lottie-react@3.1.2`: latest stable; React/React DOM peers
  `^18.2.0 || ^19.0.0`. Its engine dependency resolves to `lottie-web@5.13.0`.
  The published component is a named `Lottie` export and takes `src`, not
  `animationData`. No peer overrides or local player replacement are needed.
- The previous locked MobX `6.3.12` does not satisfy the new binding's peer.
  The lockfile deduplicates existing MobX 6 ranges to stable `6.16.1`, keeping
  workspace stores and web on one version. Manifest ranges remain unchanged
  to preserve workspace dependency alignment. **Preserve this lock update**:
  restoring the old MobX resolution is not compatible with the new binding.

Metadata commands: `npm view mobx-react-lite dist-tags peerDependencies --json`,
`npm view mobx-react-lite@4 version peerDependencies dependencies --json`,
`npm view lottie-react dist-tags peerDependencies dependencies --json`.
Published tarballs from `registry.npmjs.org` were inspected directly.

## Consumer changes

Only `components/animation/dynamic-lottie-animation.tsx` changes:

- Keep the library client-only (`next/dynamic`, `ssr: false`).
- Use the named component and `src`; unwrap JSON import namespaces.
- Explicitly retain the previous autoplay/loop defaults (`true`), since v3
  defaults both to `false`.
- Do not mount a player without valid JSON. Ignore late loads after a key
  change/unmount, while retaining the global-key cache and DOM prop forwarding.

Upstream v3 treats autoplay as load-time configuration: rewards-card hover
changes recreate the animation (and restart it), rather than resuming its
previous frame. Regression tests verify the old instance is destroyed and the
new playback configuration is correct. V3 also suppresses initial autoplay for
reduced-motion preferences; this behavior is preserved and tested.

## Validation

All commands ran in this branch's worktree with its own `node_modules`.
No parent modules, React manifest upgrades, Turbo, fetch, rebase, or pushes.

Passed:

- Yarn 4.12.0 install and subsequent `install --immutable --mode=skip-build`.
  Lockfile regeneration succeeded. Dependency build scripts were skipped.
- `yarn lint:workspace` (Sherif).
- Scoped ESLint, Prettier, and `git diff --check`.
- Focused strict TypeScript check of the wrapper and both regression suites:
  `tsc --noEmit --skipLibCheck --strict --jsx react-jsx --esModuleInterop
--moduleResolution node --module esnext --target es2022 --types jest,node`
  with the three changed TS/TSX paths as inputs.
- `node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec jest
--config jest.state-animation.config.js --runInBand`: 2 suites, 8 tests,
  on installed React 18.3.1. Covers context-backed observable updates under
  StrictMode, committed subscription disposal, SSR static rendering/client
  recovery, Lottie loading/caching/options, hover reload cleanup, stale imports,
  SSR suppression, and reduced motion. Lottie tests use the real v3 component
  with a mocked drawing engine and a lazy-loader stand-in for Next dynamic.
- The same 8 tests passed on React/React DOM 19.3.0, installed in an ignored,
  independent `.yarn/react19-runtime` Yarn project with its own `node_modules`.
  A temporary Jest config mapped React/React DOM imports to that project;
  the branch's React 18 manifests and lock resolutions were not changed.
- An additional temporary JSDOM smoke check used the **real lottie-web engine**
  and checked-in tutorial `step1.json`: SVG/layers rendered and unmount removed
  SVG on both React 18.3.1 and 19.3.0. Canvas initialization was stubbed because
  JSDOM has no canvas drawing backend; the animation used the real SVG renderer.

Blocked/not validated:

- Standard app Jest setup fails before tests: `Cannot find module
'@osmosis-labs/server' from '__tests__/msw.ts'`. The focused config retains
  Next/SWC and the existing DOM environment, but excludes unrelated MSW/tRPC
  setup and unbuilt workspace package dependencies.
- Full `yarn workspace @osmosis-labs/web typecheck` fails with missing built
  workspace declarations, e.g. `TS2307: Cannot find module
'@osmosis-labs/server'`, and missing `~/config/generated/chain-list` /
  `asset-lists`, plus downstream errors. No workspace builds/list generation
  were performed. This is not a passing app-wide typecheck.
- Existing installation warnings remain: React peers from autosize/other
  packages, TypeScript ESLint peer ranges, and missing `prop-types` for
  `focus-trap-react`. Installation itself was **not** blocked.
- No production build, full app suite, browser layout/visual review, or
  wallet/store integration test. React 18 StrictMode abandons an extra render
  whose MobX reaction is collected asynchronously; the exact zero-subscription
  assertion intentionally tests a committed non-StrictMode render, while
  observable reactivity is exercised under StrictMode.

Integration should rerun the focused suites with the final React version,
then generate lists/build workspace packages and run full app validation.
Visually check rewards-card and tutorial sizing (v3 adds display CSS), hover
restart behavior, and reduced-motion preferences. This is scoped dependency
validation, not completion of the entire React 19 migration.
