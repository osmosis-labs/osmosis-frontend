export * from "./active-gauges";
export * from "./base";
export * from "./concentrated-liquidity";
export * from "./ibc";
export * from "./numia";
export * from "./pool-rewards";
export * from "./pools";
export * from "./store";
export * from "./token-historical-chart";

// Fallbacks only: every deployed environment injects the live data proxy via
// NEXT_PUBLIC_HISTORICAL_DATA_URL (currently data.app.osmosis.zone, fronting
// Numia). The retired api-osmosis[-chain].imperator.co hosts no longer
// resolve, so the fallbacks point at the proxy too.
export const IMPERATOR_TIMESERIES_DEFAULT_BASEURL =
  "https://data.app.osmosis.zone";
export const IMPERATOR_INDEXER_DEFAULT_BASEURL =
  "https://data.app.osmosis.zone";

/**
 * This domain has a whitelist, so in local development an auth token is required
 */
export const COINGECKO_API_DEFAULT_BASEURL =
  "https://coingecko.osmosis.zone/api";

export const NUMIA_INDEXER_BASEURL = "https://public-osmosis-api.numia.dev";
