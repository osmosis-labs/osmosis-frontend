# React 19: Visx and Spring dependency branch

## Dependency decision

Registry metadata (`npm view <package> version peerDependencies dependencies --json`)
confirmed stable `latest` releases for all five direct Visx dependencies at
**4.0.0**, and `@react-spring/web` at **10.1.2**. The web manifest uses matching
major ranges; the regenerated Yarn lockfile pins these exact releases.

- Visx 4's React-facing packages explicitly accept React 18 and 19 (including
  React/types/React DOM peers where used). `curve` and `scale` are non-React
  utilities and depend on `@visx/vendor@4.0.0`.
- Both `@visx/xychart@4.0.0` and `@visx/react-spring@4.0.0` accept Spring
  `^9.7.5 || ^10.0.0`. Spring 10.1.2 explicitly accepts React and React DOM 19,
  as well as 18; the old Spring 9 peer coupling is therefore removed.
- Published `@visx/bounds@4.0.0` uses `createRef`/`nodeRef.current` without a
  `findDOMNode` fallback. `@visx/tooltip@4.0.0` passes `nodeRef` to its
  `forwardRef` tooltip DOM node. No peer overrides or Yarn patches are needed.
- Published animated paths still use `useSpring`, `animated.path`, and path
  interpolation. Existing area/line/grid/axis and annotation APIs remain valid.

## Required source adjustment

Visx 4 `ParentSize` adds an absolutely positioned measurement div with inline
`overflow: hidden`. Compact historical charts previously targeted a direct SVG
child, so labels would now be clipped. The compact classes target the new wrapper
and its SVG; `!overflow-visible` overrides the wrapper's inline style. Full charts
retain their existing clipping. Tailwind compilation confirmed both selectors,
including the required `!important` declaration.

Visx 4 also uses the native `ResizeObserver` instead of shipping the old automatic
polyfill. Modern browsers support it; an older-browser integration must supply
`resizeObserverPolyfill`. Tests explicitly provide their own observer because
jsdom has no layout implementation.

## Checks performed

All modules were installed in this branch's own worktree. No parent modules,
Turbo invocations, core React/types changes, or hook bypasses were used.

- **PASS:** Yarn 4.12.0 `install --mode=skip-build`, followed by
  `install --immutable --mode=skip-build`; a valid `yarn.lock` is included.
  Dependency build scripts were intentionally not run by these commands.
- **PASS:** `@osmosis-labs/unit` build (`tsc`), required for importing the charts.
- **PASS:** Five focused jsdom runtime tests on **React/React DOM 18.3.1** and
  again on an isolated **React/React DOM 19.3.0** installation. Tests exercise real
  Visx/Spring in StrictMode: changing animated area and line data without
  remounting, compact-wrapper selectors, bounded tooltip measurement/flipping,
  and depth bars with editable range-annotation move/submit callbacks. Only
  unrelated app/store/formatter dependencies and browser layout are stubbed.
- **PASS:** Targeted ESLint and Prettier checks; Tailwind selector compilation.
- **BLOCKED:** Standard web Jest setup fails before running tests with
  `Cannot find module '@osmosis-labs/server' from '__tests__/msw.ts'` (unbuilt
  workspace output). The dedicated chart config skips app MSW/tRPC setup.
- **FAILED / incomplete app validation:** Web `tsc --noEmit -p
tsconfig.typecheck.json` reports missing workspace build outputs and generated
  config modules, plus cascading app diagnostics (1023 diagnostics in this
  unbuilt worktree). No diagnostics named either migrated chart or its new test.
  This is **not** a passing app typecheck or full migration validation.
- **NOT RUN:** Full Next build, browser/E2E rendering, complete app tests, or
  React 19 typechecking. Integration must run these after merging the other
  dependency branches and generating/building workspace prerequisites.

Installation had no missing-release blocker with the existing lockfile. Existing
warnings remain: ignored workspace resolutions, React/MobX and TypeScript peer
mismatches, and missing `prop-types` for `focus-trap-react`. None were concealed by
upgrading unrelated dependencies.

## Reproduce focused checks

From the branch/worktree root:

```sh
node .yarn-4.12.0.cjs install --immutable --mode=skip-build
node .yarn-4.12.0.cjs workspace @osmosis-labs/unit run build
node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec jest \
  --config jest.charts.config.js --runInBand
node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec eslint \
  components/chart/price-historical.tsx \
  components/chart/__tests__/visx-compatibility.spec.tsx
```

For a React 19 runtime check without changing the branch's React 18 manifest,
create a temporary `.charts-validation/react19/package.json` with a private
package, `packageManager: "yarn@4.12.0"`, and exact `react`/`react-dom` dependencies
at `19.3.0`. Create an empty lockfile in that directory so it is a separate Yarn
project, then run:

```sh
node .yarn-4.12.0.cjs --cwd .charts-validation/react19 install --mode=skip-build
```

Create `.charts-validation/jest-react19.config.cjs`:

```js
const path = require("path");
module.exports = async () => {
  const config = await require("../packages/web/jest.charts.config.js")();
  return {
    ...config,
    moduleNameMapper: {
      "^react$": path.resolve(__dirname, "react19/node_modules/react"),
      "^react/(.*)$": path.resolve(__dirname, "react19/node_modules/react/$1"),
      "^react-dom$": path.resolve(__dirname, "react19/node_modules/react-dom"),
      "^react-dom/(.*)$": path.resolve(
        __dirname,
        "react19/node_modules/react-dom/$1"
      ),
      ...config.moduleNameMapper,
    },
  };
};
```

Run the same tests with this config, then delete the temporary validation folder:

```sh
node .yarn-4.12.0.cjs workspace @osmosis-labs/web exec jest \
  --config ../../.charts-validation/jest-react19.config.cjs --runInBand
rm -rf .charts-validation
```

The temporary fixture is not included in the branch. React 19 runtime mapping
must cover both React and React DOM (including subpaths) to avoid mixed React
instances. It does not replace the required integrated React 19 build/typecheck.
