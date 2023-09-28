export * from "./filtered-pools";

export const IMPERATOR_TIMESERIES_DEFAULT_BASEURL =
  process.env.NEXT_PUBLIC_TIMESERIES_DATA_URL ||
  "https://api-osmosis.imperator.co";
export const IMPERATOR_INDEXER_DEFAULT_BASEURL =
  process.env.NEXT_PUBLIC_INDEXER_DATA_URL ||
  "https://api-osmosis-chain.imperator.co";
