export const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

export const OSMOSIS_RPC_OVERWRITE =
  process.env.NEXT_PUBLIC_OSMOSIS_RPC_OVERWRITE;
export const OSMOSIS_REST_OVERWRITE =
  process.env.NEXT_PUBLIC_OSMOSIS_REST_OVERWRITE;
export const OSMOSIS_EXPLORER_URL_OVERWRITE =
  process.env.NEXT_PUBLIC_OSMOSIS_EXPLORER_URL_OVERWRITE;
export const OSMOSIS_CHAIN_ID_OVERWRITE =
  process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE;
export const OSMOSIS_CHAIN_NAME_OVERWRITE =
  process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_NAME_OVERWRITE;

export const WALLETCONNECT_PROJECT_KEY =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_KEY;
export const WALLETCONNECT_RELAY_URL =
  process.env.NEXT_PUBLIC_WALLETCONNECT_RELAY_URL;

export const TIMESERIES_DATA_URL = process.env.NEXT_PUBLIC_TIMESERIES_DATA_URL;
export const INDEXER_DATA_URL = process.env.NEXT_PUBLIC_INDEXER_DATA_URL;

export const GITHUB_URL = process.env.GITHUB_URL;
export const CMS_REPOSITORY_PATH = process.env.CMS_REPOSITORY_PATH;

export const TWITTER_API_URL = process.env.TWITTER_API_URL;
export const TWITTER_API_ACCESS_TOKEN = process.env.TWITTER_API_ACCESS_TOKEN;

export const TWITTER_PUBLIC_URL = "https://x.com";

export const COINGECKO_PUBLIC_URL = "https://www.coingecko.com";

export const ASSET_LIST_COMMIT_HASH = process.env.ASSET_LIST_COMMIT_HASH;
export const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

// Flag to override feature flags and enable them
export const ENABLE_FEATURES = true;

export const URBIT_DEPLOYMENT =
  process.env.NEXT_PUBLIC_URBIT_DEPLOYMENT === "true";
