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
Next.js comes with built-in support for environment variables, which allows you to do the following:

Use .env.local to load environment variables
Expose environment variables to the browser by prefixing with NEXT_PUBLIC_

As of now we only use .env to load default public environment variables. More information about how this works [here](https://nextjs.org/docs/basic-features/environment-variables). 