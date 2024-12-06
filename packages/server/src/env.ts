// Osmosis node
export const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";
export const SPEND_LIMIT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SPEND_LIMIT_CONTRACT_ADDRESS;

// twitter
export const TWITTER_API_URL = process.env.TWITTER_API_URL;
export const TWITTER_API_ACCESS_TOKEN = process.env.TWITTER_API_ACCESS_TOKEN;

// github
export const GITHUB_URL = process.env.GITHUB_URL;
export const FE_CONTENT_COMMIT_HASH =
  process.env.NEXT_PUBLIC_FE_CONTENT_COMMIT_HASH;
export const CMS_REPOSITORY_PATH = process.env.CMS_REPOSITORY_PATH;
export const GITHUB_RAW_DEFAULT_BASEURL = "https://raw.githubusercontent.com";
export const ASSET_LIST_COMMIT_HASH = process.env.ASSET_LIST_COMMIT_HASH;

// data services
export const HISTORICAL_DATA_URL =
  process.env.NEXT_PUBLIC_HISTORICAL_DATA_URL ??
  "https://data.stage.osmosis.zone";
export const NUMIA_API_KEY = process.env.NUMIA_API_KEY;

// sqs
export const SIDECAR_BASE_URL =
  process.env.NEXT_PUBLIC_SIDECAR_BASE_URL ?? "https://sqs.osmosis.zone/";

export const KEYBASE_BASE_URL = "https://keybase.io/";
export const KV_STORE_REST_API_URL = process.env.KV_STORE_REST_API_URL;
export const KV_STORE_REST_API_TOKEN = process.env.KV_STORE_REST_API_TOKEN;

// flags
export const EXCLUDED_EXTERNAL_BOOSTS_POOL_IDS =
  process.env.NEXT_PUBLIC_EXCLUDED_EXTERNAL_BOOSTS_POOL_IDS;
