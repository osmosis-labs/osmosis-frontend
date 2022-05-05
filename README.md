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

Currently, the frontier frontend is built and deployed from the [`frontier`](https://github.com/osmosis-labs/osmosis-frontend/tree/frontier) branch. If your issue or PR is related to frontier, please prefix with "frontier."
