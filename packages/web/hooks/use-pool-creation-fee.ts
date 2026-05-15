import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";

import { api } from "~/utils/trpc";

interface UsePoolCreationFeeResult {
  /** Display string ready for UI interpolation, e.g. "20 USDC". `null` while
   *  the query is loading or if the chain returns no fee. Callers should
   *  render a loading state when this is `null` rather than guessing the
   *  value, since the chain fee is governance-controlled and any hardcoded
   *  fallback risks misleading users when it changes. */
  display: string | null;
  isLoading: boolean;
}

/** Reads the on-chain pool creation fee from poolmanager params. Same fee
 *  applies to all pool types (Balancer, Stableswap, Concentrated). Uses the
 *  global tRPC client cacheTime (24h) since governance-controlled params
 *  rarely change. */
export function usePoolCreationFee(): UsePoolCreationFeeResult {
  const { data, isLoading } = api.local.pools.getPoolCreationFee.useQuery();

  if (!data || data.length === 0) {
    return { display: null, isLoading };
  }

  const parts = data.map((coin) => {
    if (!coin.coinDenom || coin.coinDecimals === undefined) {
      // Unresolvable asset: show raw amount + truncated denom so the user
      // sees something rather than a blank.
      const shortDenom =
        coin.coinMinimalDenom.length > 16
          ? coin.coinMinimalDenom.slice(0, 12) + "…"
          : coin.coinMinimalDenom;
      return `${coin.amount} ${shortDenom}`;
    }
    const pretty = new CoinPretty(
      {
        coinDenom: coin.coinDenom,
        coinMinimalDenom: coin.coinMinimalDenom,
        coinDecimals: coin.coinDecimals,
      },
      new Dec(new Int(coin.amount))
    );
    // trim(true) drops trailing zeros so "20.000000 USDC" becomes "20 USDC".
    return pretty.trim(true).toString();
  });

  return { display: parts.join(" + "), isLoading };
}
