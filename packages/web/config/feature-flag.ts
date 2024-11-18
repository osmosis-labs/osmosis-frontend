import { IS_TESTNET } from "./env";

/** Blacklists pools out at the query level. Marks them as non existant. */
export const BlacklistedPoolIds: string[] = ["895"];

/** Cosmwasm Code Ids confirmed to be transmuter pools in current env. */
export const TransmuterPoolCodeIds = IS_TESTNET ? ["3084"] : ["148"];

export const RecommendedSwapDenoms = [
  "OSMO",
  "USDC",
  "USDT",
  "BTC",
  "ETH",
  "ATOM",
  "TIA",
];
