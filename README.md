# Osmosis Frontend 👩‍🔬⚗️🧪

![osmosis-banner-1200w](https://user-images.githubusercontent.com/4606373/167008669-fb3cafa8-e66e-4cdf-8599-3308039cc58c.png)

> Note: this codebase is currently undergoing a refactor from Keplr's architecture to a tRPC stack to improve performance, maintainability, and development speed. We appreciate your patience as we work through these changes.

## Overview 💻

Our [frontend](https://app.osmosis.zone) is built with the following tools:

- [TypeScript](https://www.typescriptlang.org/): type checking
- [React](https://reactjs.org/): ui
- [Tailwind CSS](https://tailwindcss.com/): styling, theming
- [Next.js](https://nextjs.org/): scaffolding/SSR/CDN/SEO
  - We deploy on [Vercel](https://vercel.com/solutions/nextjs?utm_source=next-site&utm_medium=banner&utm_campaign=next-website) for optimizations out of the box, behind [CloudFlare](https://www.cloudflare.com/)
- [Turbo Repo](https://turbo.build/repo): mono repo management with package script execution, with heavy emphasis on build caching (including shared remote caching in Vercel)
- [Lerna](https://lerna.js.org/): libs release

## Contributing 👨‍💻

We welcome and encourage contributions! We recommend looking for [issues labeled with "good-first-issue"](https://github.com/osmosis-labs/osmosis-frontend/contribute).

### Prerequisites

Use [Node.js](https://nodejs.org/en/) **24.x** (the exact version is pinned in `.nvmrc`) and the repository-pinned [Yarn](https://yarnpkg.com/getting-started/install) version in `package.json`.

With [nvm](https://github.com/nvm-sh/nvm) and Corepack, run from the repository root:

```bash
nvm install
nvm use
corepack enable
```

### Local development

Run all commands from the repository root.

1. Install dependencies without changing the lockfile:

   ```bash
   yarn install --immutable
   ```

2. Run an initial build to generate configuration and workspace package artifacts:

   ```bash
   yarn build
   ```

3. Start the development server at [localhost:3000](http://localhost:3000):

   ```bash
   yarn dev
   ```

### Optional: shared build cache

If you're on the Osmosis foundation team and have access to the Vercel project, authenticate and link the repository to share cached builds:

```bash
npx turbo login
npx turbo link
```

Follow the browser login prompts and select "OsmoLabs" as the Vercel build scope. This is optional; local development works without it.

## Deployment 🚀

After completing the prerequisites and dependency installation above, build and start the production server:

```bash
yarn build && yarn start
```

## Testnet

The testnet scripts set `NEXT_PUBLIC_IS_TESTNET=true` and use the canonical public testnet by default. Complete the prerequisites and dependency installation above first.

For local development:

```bash
yarn build:testnet && yarn dev:testnet
```

For a production build:

```bash
yarn build:testnet && yarn start:testnet
```

### Local testnet

To connect to a local testnet such as [localosmosis](https://github.com/osmosis-labs/osmosis/tree/main/tests/localosmosis), add these overrides to `packages/web/.env.local` rather than editing the committed `.env` file:

```dotenv
NEXT_PUBLIC_IS_TESTNET=true
NEXT_PUBLIC_OSMOSIS_RPC_OVERWRITE=http://localhost:26657/
NEXT_PUBLIC_OSMOSIS_REST_OVERWRITE=http://localhost:1317/
NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE=localosmosis
NEXT_PUBLIC_OSMOSIS_CHAIN_NAME_OVERWRITE=Local Osmosis
```

Replace `localosmosis` with your local node's chain ID. Rebuild with `yarn build:testnet` after changing the configuration, then run `yarn dev:testnet` or `yarn start:testnet`.

You may also need to update the asset and chain configuration under `packages/web/config` to display your local test assets. The currency registrar only adds IBC assets whose hashes resolve through the chain's `denom_trace` query. Ensure their denom traces exist on your testnet; native assets, including tokenfactory assets, can instead be defined by their base denom in the testnet chain's currencies.

## Releases

> Note: releases are suspended until the refactor is complete. Please avoid importing packages from this repo until further notice.

Release tags are for the published [npm packages](https://www.npmjs.com/org/osmosis-labs), which are every package except for the web package. Updates to the app are released incrementally way via deployments from master branch.

To start the release process:

```bash
yarn build:libs && npx lerna publish
```

## Translations 🌎🗺

[![translation badge](https://inlang.com/badge?url=github.com/osmosis-labs/osmosis-frontend)](https://inlang.com/editor/github.com/osmosis-labs/osmosis-frontend?ref=badge)

To add translations, you can manually edit the JSON translation files in `packages/web/translations`, use the [inlang](https://inlang.com/) online editor, or run `yarn machine-translate` to add missing translations using AI from Inlang.

Note: we have tests in web package that ensure all localization files contain the same keys and that they're (best effort) all found within the TSX source files. These help keep our localizations up to date. To clean up localizations, check out the scripts in the web/localizations folder. They must be run using `node` within the localization folder.

## Asset Listings

Please see the asset [listing requirements](https://github.com/osmosis-labs/assetlists/blob/main/LISTING.md) to display assets on Osmosis Zone web app.

### Showing Preview Assets

To view preview assets for testing, append the following query parameter to the Osmosis URL:

```
?show_preview_assets=true
```

They'll be enabled for the tab's session. If you'd like to disable it, either open a new tab without the query parameter or append `?show_preview_assets=false`.
