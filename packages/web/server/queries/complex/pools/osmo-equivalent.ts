import { Dec } from "@keplr-wallet/unit";
import { getChainStakeTokenSourceDenom } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";
import { getAsset } from "~/server/queries/complex/assets";
import { getSuperfluidParams } from "~/server/queries/complex/osmosis";
import { getPool } from "~/server/queries/complex/pools";
import {
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "~/server/queries/osmosis";

export async function estimatePoolAPROsmoEquivalentMultiplier({
  poolId,
}: {
  poolId: string;
}) {
  const pool = await getPool({ poolId });
  const osmoStakeTokenSourceDenom = getChainStakeTokenSourceDenom({
    chainId: ChainList[0].chain_id,
    chainList: ChainList,
  });

  if (!osmoStakeTokenSourceDenom) {
    console.info(`Stake token source denom not found`);
    return new Dec(0);
  }

  const osmoCurrency = await getAsset({
    anyDenom: osmoStakeTokenSourceDenom,
  });

  if (!osmoCurrency) {
    console.info(`Asset currency not found`);
    return new Dec(0);
  }

  const hasStakeCurrency = !!pool?.reserveCoins.some(
    (coin) => coin.currency.coinMinimalDenom === osmoCurrency.coinMinimalDenom
  );

  // If the pool doesn't have the stake currency, the multiplier is 0.
  if (!pool || !hasStakeCurrency) return new Dec(0);

  const { minimumRiskFactor } = await getSuperfluidParams();

  // weighted pool, so calculate the multiplier based on the ratio of OSMO in the pool
  if (pool.type === "weighted") {
    const weightedPool = pool.raw as WeightedPoolRawResponse;

    const totalWeight = new Dec(weightedPool.total_weight);

    const stakeAsset = weightedPool.pool_assets.find(
      (asset) => asset.token.denom === osmoCurrency.coinMinimalDenom
    );
    if (!stakeAsset) return new Dec(0);

    const ratio = new Dec(stakeAsset.weight).quo(totalWeight);
    return ratio.mul(new Dec(1).sub(minimumRiskFactor));
  } else if (pool.type === "stable") {
    const stablePool = pool.raw as StablePoolRawResponse;

    const stablePoolAssets = stablePool.pool_liquidity.map((asset, index) => {
      return {
        ...asset,
        scalingFactor: stablePool.scaling_factors[index],
      };
    });

    const stakeAsset = stablePoolAssets.find(
      ({ denom }) => denom === osmoCurrency.coinMinimalDenom
    );
    const otherScalingFactors = stablePoolAssets
      .filter(({ denom }) => denom !== osmoCurrency.coinMinimalDenom)
      .map(({ scalingFactor }) => new Dec(scalingFactor))
      .reduce((acc, cur) => acc.add(cur), new Dec(0));
    if (!stakeAsset) return new Dec(0);

    const ratio = new Dec(stakeAsset.scalingFactor).quo(otherScalingFactors);
    return new Dec(0.5).mul(ratio.mul(new Dec(1).sub(minimumRiskFactor)));
  } else if (pool.type === "concentrated") {
    // concentrated pool, where we know weight is 1:1
    return new Dec(0.5).mul(new Dec(1).sub(minimumRiskFactor));
  }
  return new Dec(0);
}
