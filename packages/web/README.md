# @osmosis-labs/web (unpublished)

This package contains the Next.js web server and all UI code for the frontend.

Commands can be run from root of repo or package:

### Develop

Watch server:

```
yarn build && yarn dev
```

### Test

```
yarn test && yarn dev
```

### Lint/format

```
yarn lint:fix
```

### Deploy

```
yarn build && yarn start
```

### Analyze

View the size of the various webpack bundles on both the server and the client.

At the root of the repo or package:

```bash
yarn analyze
```

On completion, two local html files containing visual bundle trees for client and server code will appear in your default browser.

## Environment Variables

By default, configuration is hardcoded and determined by the NEXT_PUBLIC_IS_TESTNET env var for developer convenience and simplicity. Please directly change those values should the config be changed from here on. For temporary overrides, consult the .env file. To use the testnet version of the frontend use the :testnet versions of the build and dev commands from the root package manifest file.

## Debug

### React Renders

Find what's causing extraneous renders in React by dropping in debugger versions of the React hooks. ([Article](https://reactjsexample.com/react-hooks-that-are-useful-for-debugging-dependency-changes-between-renders/)) ([Docs](https://github.com/kyleshevlin/use-debugger-hooks))

Simply import (ignore the eslint dev dep error):

```typescript
// eslint-disable-next-line
import { useEffectDebugger } from "use-debugger-hooks";
```

Then, adjacent in place of the hook in question, use the debug hook. Example for `useEffect`:

```typescript
useEffectDebugger(() => {
  someEffectWithDeps(dep1, dep2, dep3);
}, [dep1, dep2, dep3]);
JavaScript;
```

It returns `unknown` types, so you may need to type cast to resolve TS errors.
