export const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

export const OSMOSIS_RPC_OVERWRITE =
  process.env.NEXT_PUBLIC_OSMOSIS_RPC_OVERWRITE;
export const OSMOSIS_REST_OVERWRITE =
  process.env.NEXT_PUBLIC_OSMOSIS_REST_OVERWRITE;
export const OSMOSIS_CHAIN_ID_OVERWRITE =
  process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE;
export const OSMOSIS_CHAIN_NAME_OVERWRITE =
  process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_NAME_OVERWRITE;

export const WALLETCONNECT_PROJECT_KEY =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_KEY;
export const WALLETCONNECT_RELAY_URL =
  process.env.NEXT_PUBLIC_WALLETCONNECT_RELAY_URL;

export const HISTORICAL_DATA_URL = process.env.NEXT_PUBLIC_HISTORICAL_DATA_URL;

/**
 * Solana RPC for reads the browser makes (SPL balances, and watching a
 * submitted transaction). Browser-visible by nature, so it must be a key
 * the provider restricts to this app's domain, never an unrestricted or
 * server-side key. Without it, reads fall back to public endpoints, which
 * Solana documents as rate-limited and unsuitable for production.
 */
export const SOLANA_RPC_OVERWRITE = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

export const TWITTER_PUBLIC_URL = "https://x.com";
export const COINGECKO_PUBLIC_URL = "https://www.coingecko.com";

export const ASSET_LIST_COMMIT_HASH = process.env.ASSET_LIST_COMMIT_HASH;
export const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

export const SPEND_LIMIT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SPEND_LIMIT_CONTRACT_ADDRESS;
