import { getAssetFromAssetList } from "@osmosis-labs/utils";

import { AssetLists } from "~/config/generated/asset-lists";

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
 * Every quote in the lists below must be a USD-pegged, non-rebasing
 * stablecoin. Limit order pricing treats 1 quote as $1 (`usePlaceLimit`),
 * guarded only by a peg check. Any other quote first needs prices in quote
 * units.
 */
export const UI_DEFAULT_QUOTES: string[] = [USDC_BASE_DENOM, USDT_BASE_DENOM];

/**
 * Quotes a user may receive when selling. Sell mode is deliberately limited
 * to the canonical stables, but Noble USDC stays selectable (not default)
 * while pairs that only have a Noble-quoted orderbook remain: dropping it
 * here would make limit sells on those pairs impossible while limit buys
 * still work. Keeps default ordering (UI_DEFAULT_QUOTES) separate from the
 * Sell allowlist.
 */
export const SELL_QUOTES: string[] = [
  ...UI_DEFAULT_QUOTES,
  USDC_NOBLE_BASE_DENOM,
];

/**
 * Quotes selectable in Buy and Limit mode: the two canonical stables and the
 * constituents that redeem 1:1 into them through their transmuter pools.
 * Constituent sets read from the pool contracts (allUSDC
 * osmo147h5x9p...hr75m0, allUSDT osmo1em6xs47...avdxek), not inferred from
 * variant grouping. Other variants are not quotes, except where noted.
 */
export const VALID_QUOTES: string[] = [
  ...UI_DEFAULT_QUOTES,
  // allUSDC constituents
  // "USDC.noble"
  USDC_NOBLE_BASE_DENOM,
  // "USDC.eth.axl"
  "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
  // "USDC.inj"
  "ibc/794C7D7F3B857713878A3A1927251FA6AC1EEE520424C1F6FAFE9BA26D476138",
  // allUSDT constituents
  // "USDT.eth.axl"
  "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
  // "USDT.eth.inj"
  "ibc/2AD3C64D19ADFBB522CD738B58F421102143F827C1CAFF574A8BF0B81017D53D",
  // "USDT.eth.atom"
  "ibc/7BC2F718C47C0749791F2612A914C8C39D1A4F533A27AF7285D924D4B617DDA6",
  // Kept as a quote in its own right; not an alloy constituent.
  // "USDT.kava"
  "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
];

/**
 * Resolves the trade tool's `quote` query param (a symbol or a minimal denom)
 * to a minimal denom, or undefined when it is not a quote the tab offers.
 * The URL can name any asset, so every consumer of the param must go through
 * this rather than trusting it: the quote pickers only list allowlisted
 * quotes, and order pricing assumes a USD-pegged quote.
 */
export function getAllowedQuoteDenom(
  quote: string,
  tab: string | null
): string | undefined {
  const denom = getAssetFromAssetList({
    assetLists: AssetLists,
    coinMinimalDenom: quote,
    symbol: quote,
  })?.coinMinimalDenom;
  if (!denom) return undefined;
  const allowed = tab === "sell" ? SELL_QUOTES : VALID_QUOTES;
  return allowed.includes(denom) ? denom : undefined;
}

/**
 * nuqs options for the trade tool's `from` and `quote` query params. Several
 * components read these params with different defaults (e.g. the previous
 * trade's quote vs allUSDC), so a value must stay in the URL even when it
 * equals one hook's default: clearing it makes the other hooks fall back to
 * their own default, which silently swaps the selected asset.
 */
export const TRADE_PAIR_QUERY_OPTIONS = { clearOnDefault: false } as const;

/**
 * Runs an effect's correction to the trade tool's query params (e.g. swapping
 * a quote the pair has no orderbook for) on the next task, and returns the
 * effect cleanup.
 *
 * Several mounted tools read these params through separate nuqs hooks. When a
 * click updates a param and an effect corrects it in the same React batch,
 * nuqs' cross-hook sync keeps replaying the clicked value, the hooks flip
 * between the two values on every render and the page freezes. Deferring the
 * correction lets the click's update commit first, so the hooks converge.
 */
export function deferQueryCorrection(correct: () => void) {
  const timeout = setTimeout(correct);
  return () => clearTimeout(timeout);
}
