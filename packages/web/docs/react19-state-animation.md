# State and animation bindings: React 18 preparation

PR2 is stacked on PR1 `acf60799cf3f58b25bf35757fa352502eed774ab`
(`fix/jest-cosmos-kit-lifecycle`), itself based on stage
`812d1275729db20b4581cf5efc56e275ca3d5003`. Review PR2 against PR1,
not against stage. This is preparation for React 19, **not a runtime migration**.
Root/web React, React DOM and type ranges remain the stage React 18 ranges.

## Dependency and consumer scope

Extracted source/tests/manifest intent from
`69538bed451a896e5d8acfa4641ede2d65b5ace0`; its historical lockfile and
validation claims were not copied. Current registry version metadata and installed
packages confirm:

- `mobx-react-lite@4.1.1` peers on React 16.8/17/18/19 and MobX `^6.9.0`.
  Existing observer/context and `enableStaticRendering` APIs are unchanged.
- `lottie-react@3.1.2` peers on React/React DOM `^18.2.0 || ^19.0.0` and uses
  `lottie-web@5.13.0`. Use named `Lottie` and `src`, not default/`animationData`.
- Ordinary Yarn install regenerated this branch's lockfile. `dedupe mobx` alone
  retained 6.3.12 (insufficient); `up -R mobx` selected 6.16.1 within existing
  workspace-aligned ranges. No MobX manifest bump or unrelated upgrade.
- Spring remains 9.7.5 with peers for React 16.8/17/18, **not React 19**. Charts,
  overlays, inputs, Markdown, Next and runtime/types are outside this PR.

The client-only dynamic wrapper unwraps JSON imports, waits for valid data,
ignores stale imports after a key change/unmount, forwards DOM props and preserves
the global-key cache. Explicit autoplay/loop defaults retain the old `true`
behavior. V3 reloads/restarts on hover autoplay changes rather than resuming the
previous frame; reduced-motion autoplay behavior is preserved.

## Current extracted-branch validation

Commands use `node .yarn-4.12.0.cjs` from this assigned worktree, with independent
local node_modules, Node 24.21.0 and Yarn 4.12.0. No Turbo, hook bypass, force exit,
console suppression, real wallet action, transaction, deployment or GitHub change.

- `install`, `dedupe mobx`, `up -R mobx`, `install --immutable`: exit 0;
  normal lifecycle scripts enabled. Existing peer warnings remain.
- `workspace @osmosis-labs/web exec jest --config jest.state-animation.config.js
--runInBand`: exit 0, 2 suites / 8 tests, React 18.3.1, 0.867s.
- `exec tsc --noEmit --skipLibCheck --strict --jsx react-jsx --esModuleInterop
--moduleResolution node --module esnext --target es2022 --types jest,node`
  with wrapper and both new state/animation test files: exit 0.
- Scoped ESLint and Prettier: exit 0; `git diff --check`: exit 0.

Tests exercise context observables under StrictMode, committed subscription
cleanup and static SSR/client recovery. React 18 StrictMode can abandon a render
whose MobX reaction is finalized asynchronously; immediate zero-subscription
assertions intentionally cover a committed non-StrictMode render. Lottie tests
use the real v3 component with a mocked drawing engine and lazy stand-in for Next
dynamic: options/DOM forwarding, cache, hover cleanup, pending/stale imports,
SSR and reduced motion. This is not visual/browser playback validation.

Application-level validation for the final combined PR2 is recorded in
`docs/react19-peer-cleanup.md`. Historical integrated or isolated React 19 runs
are not evidence for this branch. No claim that the full React 19 migration or
wallet/browser compatibility is validated. Visual sizing, hover restart and
reduced-motion checks remain follow-up work.
