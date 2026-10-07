# Overlay dependency compatibility

## Scope and version selection

Registry `npm view <package> version peerDependencies` on 2026-07-20 returned:

- `react-modal@3.16.3`: React/React DOM peers include `^18 || ^19`.
- `focus-trap-react@12.0.3`: React/React DOM and their types explicitly support
  `^18.0.0 || ^19.0.0`. Its implementation selects `child.props.ref` on React 19
  and `child.ref` on earlier React versions. It also removes the old `prop-types`
  peer requirement. The lockfile includes its new focus-trap/tabbable dependencies.
- `@tippyjs/react@4.2.6`: still the latest stable release. Its `>=16.8` peers are
  permissive, but both cloning layers read `children.ref` at runtime.

The checked-in Yarn patch changes only those two ref reads in each standard and
headless ESM/UMD bundle (including minified UMD). React 19 reads `props.ref`;
React 18 reads `element.ref`, avoiding React 18's inverse special-prop warning.
It retains object refs and the existing callback node/null contract, without
suppressing warnings or altering Tippy's lifecycle, portal or singleton code.
The manifest pins the patched upstream version; peer ranges are not rewritten.
The patch must remain checked in despite the repository's `.yarn` ignore rule.

Actual stage consumers inspected:

- `components/drawers/drawer.tsx`: activation after animation, outside clicks
  allowed, Escape deliberately does not deactivate the trap.
- `components/tooltip/tooltip.tsx`: standard Tippy around a DOM trigger.
- `components/tooltip/info.tsx`: `next/dynamic` with `ssr: false` remains unchanged.
- `components/swap-tool/split-route.tsx`: standard `useSingleton` source/targets.
- `modals/base.tsx`: react-modal, Escape/request-close, focus return and 150 ms
  close timeout. No consumer source changes were necessary.

## Checks actually run

All installation and validation used this worktree's own modules, never the
parent's modules. Core React/type manifests and resolutions are unchanged.

- Local Yarn 4.12.0 install and subsequent
  `install --immutable --mode=skip-build`: **passed**; valid scoped lockfile update.
  Lifecycle/build scripts were intentionally skipped, not reported as passing.
- `overlay-compatibility.spec.js`: **15 passed on React 18.3.1** using the installed
  worktree dependencies, and **15 passed on isolated React/React DOM 19.3.0**.
  Coverage includes standard/headless normal/minified UMD ref forwarding and
  clearing, no ref-access warnings, DOM-free SSR, singleton content/target cleanup,
  focus cycling/return and drawer Escape policy, modal aria hiding, Escape and
  delayed close/focus return.
- Additional temporary Babel-transformed copies of the same suite included both
  ESM entrypoints: **21 passed on each React version**. These were supplementary
  dependency checks, not a Next production build.
- Negative control with unpatched Tippy on React 19: **failed** with
  `Accessing element.ref was removed in React 19`, demonstrating regression
  coverage. The patched copy was restored and the suite passed again.
- Targeted ESLint, Prettier, workspace dependency lint and `git diff --check`:
  **passed**.
- Normal web Jest configuration: **blocked before executing tests**, with
  `Cannot find module '@osmosis-labs/server' from '__tests__/msw.ts'` through the
  global setup. The clean worktree lacks built workspace artifacts.
- Web typecheck: **failed**, starting with TS2307 missing `@osmosis-labs/server`,
  `@osmosis-labs/utils`, `@osmosis-labs/tx`, etc.; also missing generated asset/
  chain lists and cascading router-type errors. This is not a full-app typecheck
  pass. No unrelated dependencies/configuration were changed to conceal it.
- Full app build, browser/e2e checks and combined React 19 migration: **not run**.

The original stage installation itself succeeded; there was no unrelated registry
version failure here. Existing Yarn warnings remain: React 18.3.1 conflicts with
MobX/other peers, TypeScript 5.9.3 conflicts with an eslint-config-next dependency's
`>=5.7.2 <5.8.0` range, and workspace-local resolutions are ignored.

## Reproducing the focused checks

Run from the assigned worktree root after the Yarn install:

```sh
node node_modules/jest/bin/jest.js --runInBand \
  --config '{"rootDir":"packages/web","testEnvironment":"jsdom","setupFilesAfterEnv":["@testing-library/jest-dom"],"transform":{}}' \
  --runTestsByPath packages/web/__tests__/overlay-compatibility.spec.js
```

The focused config deliberately excludes the app's unrelated MSW/workspace setup.
For React 19, create a disposable **local** dependency sandbox, leaving workspace
React resolutions intact:

```sh
mkdir -p .overlay-validation/react19
printf '{"name":"overlay-react19-validation","private":true}\n' > .overlay-validation/react19/package.json
npm install --prefix "$PWD/.overlay-validation/react19" --workspaces=false \
  --ignore-scripts --no-audit --no-fund \
  react@19.3.0 react-dom@19.3.0 @tippyjs/react@4.2.6 \
  focus-trap-react@12.0.3 react-modal@3.16.3 \
  @testing-library/react@16.3.3 @testing-library/jest-dom@6.9.1 \
  jest@30.5.2 jest-environment-jsdom@30.5.2
cp packages/web/__tests__/overlay-compatibility.spec.js .overlay-validation/react19/
# Copy the actual Yarn-patched bundles, not an unpatched npm Tippy installation.
cp node_modules/@tippyjs/react/dist/*.js .overlay-validation/react19/node_modules/@tippyjs/react/dist/
cp node_modules/@tippyjs/react/headless/dist/*.js .overlay-validation/react19/node_modules/@tippyjs/react/headless/dist/
node .overlay-validation/react19/node_modules/jest/bin/jest.js --runInBand \
  --config '{"rootDir":".overlay-validation/react19","testEnvironment":"jsdom","setupFilesAfterEnv":["@testing-library/jest-dom"],"transform":{}}' \
  --runTestsByPath .overlay-validation/react19/overlay-compatibility.spec.js
rm -rf .overlay-validation
```

After integrating the dependency branches and React 19 core changes, regenerate
application config/build workspace packages, run normal web tests/typecheck/build,
and manually verify drawer activation after transitions, modal focus return,
InfoTooltip client-only rendering and split-route singleton tooltips in a browser.
