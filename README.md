# Osmosis Frontend 👩‍🔬⚗️🧪

![osmosis-banner-1200w](https://user-images.githubusercontent.com/4606373/167008669-fb3cafa8-e66e-4cdf-8599-3308039cc58c.png)

## Development 💻

Our [frontend](https://app.osmosis.zone) is built with the following tools:

- [TypeScript](https://www.typescriptlang.org/): type checking
- [React](https://reactjs.org/): ui
- [Tailwind CSS](https://tailwindcss.com/): styling, theming
- [Next.js](https://nextjs.org/): scaffolding/SSR/CDN/SEO
  - We deploy on [Vercel](https://vercel.com/solutions/nextjs?utm_source=next-site&utm_medium=banner&utm_campaign=next-website) for optimization (CDN, regions)
- [lerna](https://lerna.js.org/): code organization; mono-repo management and libs release

## Deployment 🚀

Start web server

```bash
yarn && yarn build && yarn start
```

### Contributing 👨‍💻

We welcome and encourage contributions! We recommend looking for [issues labeled with "good-first-issue"](https://github.com/osmosis-labs/osmosis-frontend/contribute).

Make sure [node](https://nodejs.org/en/) >= 16 and [yarn](https://yarnpkg.com/getting-started/install) is installed.

1. Install deps

```bash
yarn
```

2. Build app

```bash
yarn build
```

3.  Run local server at [`localhost:3000`](localhost:3000)

```bash
yarn dev
```

## Frontier 🤠

To reduce duplicated effort, `master` branch is used to deploy the frontier app as well. The frontier deployment has `NEXT_PUBLIC_IS_FRONTIER` env var set to `true`. If making
updates to frontier, please target the master branch. Frontier assets are configured in `packages/web/config/ibc-assets.ts`.

### Develop

To develop with frontier configuration, use:

```bash
yarn build:frontier && yarn dev:frontier
```

### Deploy

To deploy frontier (the env var will be set for you):

```bash
yarn build:frontier && yarn start:frontier
```

Otherwise the non-frontier commands can be used with the env var set to true.

### Testnet

Testnet version of the frontend uses `NEXT_PUBLIC_IS_TESTNET=true`.

Dev:

```bash
yarn build:testnet && yarn dev:testnet
```

Deploy:

```bash
yarn build:testnet && yarn start:testnet
```

## Releases

Release tags are for the published [npm packages](https://www.npmjs.com/org/osmosis-labs), which are every package except for the web package. Updates to the app are released incrementally way via deployments from master branch.
