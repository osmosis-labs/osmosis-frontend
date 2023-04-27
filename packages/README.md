@osmosis-labs/math - AMM/pool calculations and math utils

@osmosis-labs/pools - contains pool data structure and routing logic

@osmosis-labs/stores - contains Mobx stores for accounts and queries, price data, historical data (imperator), common UI config (creating pool, swapping, managing liquidity) and the GAMM currency registrar

@osmosis-labs/osmojs - Contains libraries for interacting with the Osmosis chain

@osmosis-labs/web - largest package, not published to NPM. Organized into folders:

- Components - React components ranging from most reusable (UI components like inputs and buttons) to somewhat reusable (the assets table). React components should be conservatively added here.
- Config - chain and asset configs
- Hooks - like components folder but for stateful React hooks. Only add hooks you know would be reusable.
- Modals - base modal logic, as well as all modals seen in app.
- Pages - this folder and its substructure is parsed by Next.js to determine the entry point and routes for each page in the app. Some pages, like the pool detail page, are large with the goal of reducing number of dangling components in repo.
- Public - also known as assets, stores images, icons, etc.
- Stores - contains root Mobx store (held in React context) and other sub-stores.
  The root store contains shared state for the inter-chain accounts, the inter-chain store, the inter-chain queries (and osmosis queries), price queries, IBC transfer history, user IBC asset balances, currency registrars, and has dep-injected the connection to Keplr in the browser window
- Styles - contains the one, small global CSS file since we use Tailwind
  headless UI - since we use Tailwind, headless UI helps us create fully accessible UI features with custom styling, saving us time
