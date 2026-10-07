# Autosize input / React 19 migration

Registry metadata (`https://registry.npmjs.org/react-input-autosize/latest`)
still identifies **3.0.0** as latest, with React peers `^16.3.0 || ^17.0.0`.
Rather than widen peers, all three consumers now use the local controlled
`AutosizeInput`, and both the dependency and its DefinitelyTyped package are
removed. Core React/type versions are unchanged on this branch.

## Behavior

- `className` and `style` still belong to the wrapper; `inputClassName` and
  `inputStyle` belong to the native input. Existing consumer CSS is unchanged.
- Width remains content-box, with two pixels for the caret, minimum width
  (default 1), optional extra width, and the former number-stepper allowance.
  Empty inputs measure their placeholder; nonempty inputs can shrink, unless
  `placeholderIsMinWidth` is requested. `onAutosize` only reports width changes.
- Ref callbacks receive the native element and `null` on detachment; mutable
  object refs are supported too. No value parsing, focus changes, selection
  changes, or remounts are performed by measurement.
- Hidden, accessibility-excluded sizers preserve whitespace and copy computed
  typography on each measurement. Window resizing, input resize/visibility
  changes, and font readiness/loading completion trigger remeasurement.
  Listeners/observers are removed and deferred font callbacks become inert on
  unmount. SSR starts deterministically at `minWidth` without accessing the DOM.
- The percentage limit-price field retains its state-setter ref, decimal mode,
  `extraWidth={0}`, placeholder, and existing percentage handling. Review-order
  slippage retains its 30px minimum, placeholder percent sign, classes and
  event handlers. Neither consumer used `onAutosize` or `inputStyle` at stage.
- `InputBox` autosize now forwards its placeholder, disabled, type, decimal
  mode, autocomplete and label ID, just like its native-input branch. It also
  clears the focused border on blur/wheel blur. These are regression-tested
  fixes to omissions in the former autosize branch. Undefined initial values
  normalize to an empty string, keeping the new input controlled.

## Validation on this branch

- Worktree-local `node .yarn-4.12.0.cjs install --mode=skip-build` succeeded.
  The generated lockfile only removes autosize-related entries; a subsequent
  `install --immutable --mode=skip-build` passed.
- 11 targeted tests across two suites passed with **React/React DOM 18.3.1**
  and independently with registry stable **19.3.0**. React 19 and its types
  (**19.3.0**) were installed only into an ignored, isolated validation directory;
  Jest mapped React imports there, without changing workspace dependencies.
- Focused TypeScript checks of the local component, `InputBox`, and their tests
  passed with both React 18 and React 19 types. Targeted ESLint, Prettier, and
  `git diff --check` passed.
- Tests mock jsdom text measurement. They exercise placeholders/minimum widths,
  stepper allowance, typography copying, raw decimals, caret/focus preservation,
  callback/object refs, the selector's state-setter ref, StrictMode cleanup,
  font readiness, font/resize events, unmount safety, `InputBox` and node SSR.

The standard web Jest configuration was attempted from `packages/web` but fails
before running tests: `Cannot find module '@osmosis-labs/server' from
'__tests__/msw.ts'`. A full web typecheck was also attempted and is blocked by
missing workspace build outputs (`@osmosis-labs/server`, `unit`, `stores`, etc.)
and generated `~/config/generated/asset-lists` / `chain-list`, with cascading
unrelated errors. No unrelated dependencies were upgraded. Installation itself
is not blocked; existing warnings remain for React peers (e.g. mobx-react-lite),
TypeScript ranges, ignored workspace resolutions, and focus-trap-react's missing
prop-types peer. Build scripts were deliberately skipped during installation.

### Reproduce the isolated React 18 regression tests

From the repository root, after the worktree-local install:

```sh
node node_modules/jest/bin/jest.js --runInBand --config '{
  "rootDir": "./packages/web",
  "testEnvironment": "jsdom",
  "testMatch": ["**/components/input/__tests__/autosize-input*.test.tsx"],
  "setupFilesAfterEnv": ["@testing-library/jest-dom"],
  "moduleNameMapper": {"^~/(.*)$": "<rootDir>/$1"},
  "transform": {"^.+\\.tsx?$": ["ts-jest", {
    "tsconfig": {"jsx": "react-jsx", "esModuleInterop": true,
      "target": "ES2020", "module": "commonjs", "isolatedModules": true},
    "diagnostics": false
  }]}
}'
```

This bypasses unrelated global API/MSW setup, not the component under test.
Runtime tests do not replace typechecking. Full application build/typecheck,
SSR hydration, browser font/layout, and mobile-keyboard smoke tests remain
integration checks after workspace build/generated outputs and the overall
React 19 migration are available. In particular, verify limit-price mode
switching, slippage editing, and the one-click trading spend-limit field on a
real browser; jsdom cannot validate pixel layout or mobile keyboards.
