export * from "./active-gauges";
export * from "./base";
export * from "./coingecko-market-charts";
export * from "./concentrated-liquidity";
export * from "./ibc";
export * from "./numia";
export * from "./pool-fees";
export * from "./pool-rewards";
export * from "./pools";
export * from "./store";
export * from "./token-data";
export * from "./token-historical-chart";
export * from "./token-pair-historical-chart";

export const IMPERATOR_TIMESERIES_DEFAULT_BASEURL =
  "https://api-osmosis.imperator.co";
export const IMPERATOR_INDEXER_DEFAULT_BASEURL =
  "https://api-osmosis-chain.imperator.co";

/**
 * This domain has a whitelist, so in local development an auth token is required
 */
export const COINGECKO_API_DEFAULT_BASEURL =
  (process.env.NEXT_PUBLIC_COINGECKO_URL ?? "https://coingecko.osmosis.zone") +
  "/api";

export const NUMIA_INDEXER_BASEURL = "https://public-osmosis-api.numia.xyz";
