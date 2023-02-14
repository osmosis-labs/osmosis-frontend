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

### Frontier

Frontier mode is managed by the `NEXT_PUBLIC_IS_FRONTIER=true` env var, deployed from `master` branch.

## Environment Variables

By default, configuration is hardcoded and determined by the NEXT_PUBLIC_IS_TESTNET env var for developer convenience and simplicity. Please directly change those values should the config be changed from here on. For temporary overrides, consult the .env file. To use the testnet version of the frontend use the :testnet versions of the build and dev commands from the root package manifest file.

## Debug

### React Renders

Find what's causing extraneous renders in React.

We have a dev dependency called ["what's changed"](https://github.com/simbathesailor/use-what-changed) that will provide visibility into the changes in the deps array.

Simply import (ignore the eslint dev dep error):

```typescript
import { useWhatChanged } from "@simbathesailor/use-what-changed";
```

Then, adjacent to the hook in question, use the debug hook. Copy and paste the deps array (or extract into a variable), then add a comma separated list:

```typescript
useWhatChanged(
  [api, sourceChain, destChain, tokenMinDenom, currency],
  "api, sourceChain, destChain, tokenMinDenom, currency"
);
```

The old and new values will be rendered as a table in the console, with a clear indicator of changed values. Further, it collates the values into an object you can easily use as a temp var in the console. This is helpful for optimizing useMemo, useCallback, useEffect, and even component props.
