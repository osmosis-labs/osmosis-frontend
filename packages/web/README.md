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

- for React components we mainly use React Testing library
- we use v12 for compatibility with React 17
- docs ([Docs](https://testing-library.com/docs/react-testing-library/intro/))

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

## Adding a Wallet

To add a new wallet, you must follow the steps below:

1. Check if the wallet is available on [cosmos-kit](https://github.com/cosmology-tech/cosmos-kit/tree/main/wallets).
2. If it is, add the package to the `@osmosis-labs/web` by running `yarn workspace @osmosis-labs/web add <wallet-package-name>`.
3. Go to [packages/web/config/generate-cosmos-kit-wallet-list.ts](https://github.com/osmosis-labs/osmosis-frontend/blob/stage/packages/web/config/generate-cosmos-kit-wallet-list.ts) and add the wallet to the `CosmosKitWalletList` list.
4. Go to the [packages/web/config/wallet-registry.ts](https://github.com/osmosis-labs/osmosis-frontend/blob/stage/packages/web/config/wallet-registry.ts) and add the wallet to the `WalletRegistry` array.
5. Add the necessary options as needed for the wallet. Please take a look at the [`RegistryWallet` interface](#registry-wallet-options).
6. Test the wallet by running local app. Refer to the [Develop section](#develop) above.
7. Create a PR and get it reviewed.

#### Registry Wallet Options

| Property                        | Type                                                                    | Description                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| logo                            | string                                                                  | The logo of the wallet.                                                                                              |
| lazyInstall                     | () => any                                                               | A function that lazily installs the wallet.                                                                          |
| stakeUrl                        | string (optional)                                                       | The URL for staking.                                                                                                 |
| governanceUrl                   | string (optional)                                                       | The URL for governance.                                                                                              |
| windowPropertyName              | string (optional)                                                       | Used to determine if the wallet is installed.                                                                        |
| supportsChain                   | (chainId: string) => Promise<boolean> (optional)                        | A method that checks if a chain is available for a given wallet.                                                     |
| matchError                      | (error: string) => WalletConnectionInProgressError \| string (optional) | A method that evaluates the provided error message to ascertain the specific connection-related error from a wallet. |
| features                        | Array<"notifications">                                                  | An array of features supported by the wallet.                                                                        |
| signOptions                     | Object (optional)                                                       | An object containing sign options.                                                                                   |
| signOptions.preferNoSetFee      | boolean (optional)                                                      | Preference for not setting a fee.                                                                                    |
| signOptions.preferNoSetMemo     | boolean (optional)                                                      | Preference for not setting a memo.                                                                                   |
| signOptions.disableBalanceCheck | boolean (optional)                                                      | Option to disable balance check.                                                                                     |

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
