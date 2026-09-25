export const ATOM_BASE_DENOM =
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
export const USDC_BASE_DENOM =
  "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC";
/** USDC via Noble. Retained as a selectable quote while users still hold it. */
export const USDC_NOBLE_BASE_DENOM =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
export const USDT_BASE_DENOM =
  "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT";

/**
 * nuqs options for the trade tool's `from` and `quote` query params. Several
 * components read these params with different defaults (e.g. the previous
 * trade's quote vs allUSDC), so a value must stay in the URL even when it
 * equals one hook's default: clearing it makes the other hooks fall back to
 * their own default, which silently swaps the selected asset.
 */
export const TRADE_PAIR_QUERY_OPTIONS = { clearOnDefault: false } as const;
