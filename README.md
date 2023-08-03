# Osmosis Frontend 👩‍🔬⚗️🧪

![osmosis-banner-1200w](https://user-images.githubusercontent.com/4606373/167008669-fb3cafa8-e66e-4cdf-8599-3308039cc58c.png)

## Overview 💻

Our [frontend](https://app.osmosis.zone) is built with the following tools:

- [TypeScript](https://www.typescriptlang.org/): type checking
- [React](https://reactjs.org/): ui
- [Tailwind CSS](https://tailwindcss.com/): styling, theming
- [Next.js](https://nextjs.org/): scaffolding/SSR/CDN/SEO
  - We deploy on [Vercel](https://vercel.com/solutions/nextjs?utm_source=next-site&utm_medium=banner&utm_campaign=next-website) for optimizations out of the box, behind [CloudFlare](https://www.cloudflare.com/)
- [Turbo Repo](https://turbo.build/repo): mono repo management with package script execution, with heavy emphasis on build caching (including shared remote caching in Vercel)
- [Lerna](https://lerna.js.org/): libs release

## Deployment 🚀

Install deps:

```bash
yarn
```

Start web server

```bash
yarn start
```

## Contributing 👨‍💻

We welcome and encourage contributions! We recommend looking for [issues labeled with "good-first-issue"](https://github.com/osmosis-labs/osmosis-frontend/contribute).

Make sure [node](https://nodejs.org/en/) >= 16 and [yarn](https://yarnpkg.com/getting-started/install) is installed.

1. Install deps

```bash
yarn
```

**First time setup** If you're on the Osmosis foundation team and have a Vercel account set up, optionally sign into turbo repo using your Vercel account, and link the repo. This could give you instant builds by sharing the remote cache on our Vercel project:

```bash
npx turbo login
...login via browser...
npx turbo link
...press y (yes) and choose "OsmoLabs" as the Vercel build scope...
```

2.  Run local server at [`localhost:3000`](localhost:3000)

```bash
yarn dev
```

## Testnet

To develop on the canonical public testnet, run:

```bash
yarn build:testnet && yarn start:testnet
```

To develop against a local testnet, such as [localosmosis](https://github.com/osmosis-labs/osmosis/blob/1eb6506297c88dd3acc7d9c0a5f7c4e34ecd1b4e/tests/localosmosis/README.md), modify the .env file:

```bash
# Osmosis Chain Configuration Overwrite
NEXT_PUBLIC_IS_TESTNET=true
NEXT_PUBLIC_OSMOSIS_RPC_OVERWRITE=http://localhost:26657/
NEXT_PUBLIC_OSMOSIS_REST_OVERWRITE=http://localhost:1317/
NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE=localosmosis
# NEXT_PUBLIC_OSMOSIS_EXPLORER_URL_OVERWRITE=https://testnet.mintscan.io/osmosis-testnet/txs/{txHash}
# NEXT_PUBLIC_OSMOSIS_CHAIN_NAME_OVERWRITE=Osmosis (Testnet v13.X latest)
```

You may need go to the config folder to update the ibc-assets list and currencies in the osmosis chain info to view currencies on your testnet.

### Testnet

Testnet version of the frontend uses `NEXT_PUBLIC_IS_TESTNET=true`. By default, it points to the canonical testnet, but packages/web/.env can be changed to point to [localosmosis](https://github.com/osmosis-labs/osmosis/tree/main/tests/localosmosis).

Dev:

```bash
yarn build:testnet && yarn dev:testnet
```

Deploy:

```bash
yarn build:testnet && yarn start:testnet
```

Note: our currency registrar checks IBC hashes to see if they can be found via the denom_trace query in the IBC module on chain. If it's not found, it won't add it to the chain's list of currencies. Make sure IBC assets on testnet can be found in the testnet's IBC module state for test IBC assets to be visible. Otherwise, test assets (i.e. made via tokenfactory) can be added as native assets to the Osmosis chain, simply by defining it's base denom in the Osmosis chain info for testnet.

## Releases

Release tags are for the published [npm packages](https://www.npmjs.com/org/osmosis-labs), which are every package except for the web package. Updates to the app are released incrementally way via deployments from master branch.

To start the release process:

```bash
yarn build:libs && npx lerna publish
```

## Translations 🌎🗺

[![translation badge](https://inlang.com/badge?url=github.com/osmosis-labs/osmosis-frontend)](https://inlang.com/editor/github.com/osmosis-labs/osmosis-frontend?ref=badge)

To add translations, you can manually edit the JSON translation files in `packages/web/translations`, use the [inlang](https://inlang.com/) online editor, or run `yarn machine-translate` to add missing translations using AI from Inlang.

## Asset Listings

Please see the asset [listing requirements](https://github.com/osmosis-labs/assetlists/blob/main/LISTING.md) to display assets on Osmosis Zone web app.
