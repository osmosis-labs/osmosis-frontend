export * from "./active-gauges";
export * from "./base";
export * from "./concentrated-liquidity";
export * from "./ibc";
export * from "./numia";
export * from "./pool-fees";
export * from "./pool-rewards";
export * from "./pools";
export * from "./store";
export * from "./token-data";
export * from "./token-historical-chart";

export const IMPERATOR_TIMESERIES_DEFAULT_BASEURL =
  "https://data-proxy-numia-stage.osmosis-labs.workers.dev";
export const IMPERATOR_INDEXER_DEFAULT_BASEURL =
  "https://data-proxy-numia-stage.osmosis-labs.workers.dev";

/**
 * This domain has a whitelist, so in local development an auth token is required
 */
export const COINGECKO_API_DEFAULT_BASEURL =
  "https://coingecko.osmosis.zone/api";

export const NUMIA_INDEXER_BASEURL = "https://data-proxy-numia-stage.osmosis-labs.workers.dev";
