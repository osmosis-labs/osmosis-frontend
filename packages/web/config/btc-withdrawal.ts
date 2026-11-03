import { getAllBtcMinimalDenom } from "@osmosis-labs/utils";

/** allBTC (mainnet). Matched by denom, never by symbol. */
export const ALL_BTC_MINIMAL_DENOM = (
  getAllBtcMinimalDenom({ env: "mainnet" }) ?? ""
).toLowerCase();

/**
 * Destinations offered for allBTC withdrawals: chain id -> the single token
 * the withdrawal is locked to (lowercase address). Ethereum is listed first
 * and is the default.
 */
export const ALL_BTC_WITHDRAWAL_DESTINATIONS: Record<number, string> = {
  // Ethereum: WBTC
  1: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  // Base: cbBTC
  8453: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
};

/** Whether the withdrawn Osmosis asset is allBTC itself (not a variant). */
export const isAllBtcDenom = (coinMinimalDenom: string | undefined) =>
  ALL_BTC_MINIMAL_DENOM !== "" &&
  coinMinimalDenom?.toLowerCase() === ALL_BTC_MINIMAL_DENOM;

/** Whether a destination chain/token is an allowed allBTC withdrawal target. */
export const isAllowedAllBtcWithdrawalDestination = (
  chainId: string | number,
  address: string
) =>
  ALL_BTC_WITHDRAWAL_DESTINATIONS[Number(chainId)]?.toLowerCase() ===
  address.toLowerCase();
