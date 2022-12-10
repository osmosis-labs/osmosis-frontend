import { Dec } from "@keplr-wallet/unit";

// Section: OSMO Multihop discount

/**
 * Can provide a swap fee discount if true. Introduced in Osmosis v13.
 *
 * Osmosis addition: https://github.com/osmosis-labs/osmosis/pull/2454
 * Invariants should match: `isOsmoRoutedMultihop` https://github.com/osmosis-labs/osmosis/blob/main/x/gamm/keeper/multihop.go#L266 */
export function isOsmoRoutedMultihop(
  pools: {
    id: string;
    isIncentivized: boolean;
  }[],
  firstPoolOutDenom: string,
  stakeCurrencyMinDenom: string
): boolean {
  if (pools.length !== 2) {
    return false;
  }
  if (firstPoolOutDenom !== stakeCurrencyMinDenom) {
    return false;
  }
  const firstPool = pools[0];
  const secondPool = pools[1];
  if (firstPool.id === secondPool.id) {
    return false;
  }

  if (!firstPool.isIncentivized || !secondPool.isIncentivized) {
    return false;
  }

  return true;
}

/**
 * Get's the special swap fee discount for routing through 2 OSMO pools as defined in `isOsmoRoutedMultihop`.
 *
 * Should match: https://github.com/osmosis-labs/osmosis/blob/d868b873fe55942d50f1e6e74900cf8bf1f90f25/x/gamm/keeper/multihop.go#L288-L305
 *
 * Formula is:
 *
 * swapFeeSum = swapFee1 + swapFee2 + ... + swapFeeN
 * maxSwapFee = max(swapFee1, swapFee2, swapFeeSum / n)
 */
export function getOsmoRoutedMultihopTotalSwapFee(pools: { swapFee: Dec }[]): {
  swapFeeSum: Dec;
  maxSwapFee: Dec;
} {
  let swapFeeSum = new Dec(0);
  let maxSwapFee = new Dec(0);

  pools.forEach((pool) => {
    swapFeeSum = swapFeeSum.add(pool.swapFee);

    if (pool.swapFee.gt(maxSwapFee)) {
      maxSwapFee = pool.swapFee;
    }
  });

  const averageSwapFee = swapFeeSum.quo(new Dec(pools.length));

  if (averageSwapFee.gt(maxSwapFee)) {
    maxSwapFee = averageSwapFee;
  }

  return { swapFeeSum, maxSwapFee };
}
