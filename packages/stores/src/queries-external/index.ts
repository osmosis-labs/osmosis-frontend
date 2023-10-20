export * from "./active-gauges";
export * from "./base";
export * from "./concentrated-liquidity";
export * from "./ibc";
export * from "./pool-fees";
export * from "./pool-rewards";
export * from "./pools";
export * from "./store";
export * from "./token-data";
export * from "./token-historical-chart";
export * from "./token-pair-historical-chart";

export const IMPERATOR_TIMESERIES_DEFAULT_BASEURL =
  // "https://proxyapi.osmosis-labs.workers.dev";
  `${
    typeof window !== "undefined" ? window.origin : "https://app.osmosis.zone"
  }/api/timeseries`;
// "https://proxy-api.osmosis.zone/";
// "https://proxy-api.dev-osmosis.zone/";

export const IMPERATOR_INDEXER_DEFAULT_BASEURL =
  // "https://proxy-indexer.osmosis.zone";
  `${
    typeof window !== "undefined" ? window.origin : "https://app.osmosis.zone"
  }/api/indexer`;
// "https://proxy-indexer.osmosis.zone/";
// "https://proxy-indexer.dev-osmosis.zone/";
