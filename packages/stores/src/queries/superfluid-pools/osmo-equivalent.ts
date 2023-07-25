import { ChainGetter } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { computedFn } from "mobx-utils";

import { ObservableQueryPoolGetter } from "../pools";
import { ObservableQuerySuperfluidAssetMultiplier } from "../superfluid-pools/asset-multiplier";
import { ObservableQuerySuperfluidParams } from "../superfluid-pools/params";

export class ObservableQuerySuperfluidOsmoEquivalent {
  constructor(
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly _querySuperfluidParams: ObservableQuerySuperfluidParams,
    protected readonly _querySuperfluidAssetMultiplier: ObservableQuerySuperfluidAssetMultiplier,
    protected readonly _queryPools: ObservableQueryPoolGetter
  ) {}

  readonly calculateOsmoEquivalent = computedFn(
    (coinPretty: CoinPretty): CoinPretty => {
      const multiplier = this.calculateOsmoEquivalentMultiplier(
        coinPretty.currency
      );

      const stakeCurrency = this.chainGetter.getChain(
        this.chainId
      ).stakeCurrency;

      return new CoinPretty(
        stakeCurrency,
        coinPretty
          .mul(multiplier)
          .mul(DecUtils.getTenExponentN(stakeCurrency.coinDecimals))
      );
    }
  );

  readonly calculateOsmoEquivalentMultiplier = computedFn(
    (currency: AppCurrency): Dec => {
      const minimumRiskFactor = this._querySuperfluidParams.minimumRiskFactor;
      const assetMultiplier = this._querySuperfluidAssetMultiplier.getDenom(
        currency.coinMinimalDenom
      ).multiplier;

      const osmoCurrency = this.chainGetter.getChain(
        this.chainId
      ).stakeCurrency;

      const multipication = DecUtils.getTenExponentN(
        currency.coinDecimals - osmoCurrency.coinDecimals
      );

      return assetMultiplier
        .mul(new Dec(1).sub(minimumRiskFactor))
        .mul(multipication);
    }
  );

  /**
   * Estimate the multiplication value to compute the superfluid's APR. We assume that arbitrage trading is going well, not the exact value on the current chain, and estimate only by looking at the pool weight.
   */
  readonly estimatePoolAPROsmoEquivalentMultiplier = computedFn(
    (poolId: string): Dec => {
      const pool = this._queryPools.getPool(poolId);

      const osmoCurrency = this.chainGetter.getChain(
        this.chainId
      ).stakeCurrency;

      const hasStakeCurrency = !!pool?.poolAssetDenoms.includes(
        osmoCurrency.coinMinimalDenom
      );

      // If the pool doesn't have the stake currency, the multiplier is 0.
      if (!pool || !hasStakeCurrency) return new Dec(0);

      const minimumRiskFactor = this._querySuperfluidParams.minimumRiskFactor;

      // weighted pool, so calculate the multiplier based on the ratio of OSMO in the pool
      if (pool.weightedPoolInfo?.totalWeight.toDec().gt(new Dec(0))) {
        const stakeAsset = pool.weightedPoolInfo.assets.find(
          (asset) => asset.denom === osmoCurrency.coinMinimalDenom
        );
        if (!stakeAsset) return new Dec(0);

        const ratio = stakeAsset.weight.quo(pool.weightedPoolInfo.totalWeight);
        return ratio.toDec().mul(new Dec(1).sub(minimumRiskFactor));
      } else if (pool.stableSwapInfo) {
        const stakeAsset = pool.stableSwapInfo.assets.find(
          ({ denom }) => denom === osmoCurrency.coinMinimalDenom
        );
        const otherScalingFactors = pool.stableSwapInfo.assets
          .filter(({ denom }) => denom !== osmoCurrency.coinMinimalDenom)
          .map(({ scalingFactor }) => new Dec(scalingFactor))
          .reduce((acc, cur) => acc.add(cur), new Dec(0));
        if (!stakeAsset) return new Dec(0);

        const ratio = new Dec(stakeAsset.scalingFactor).quo(
          otherScalingFactors
        );
        return ratio.mul(new Dec(1).sub(minimumRiskFactor));
      } else if (pool.concentratedLiquidityPoolInfo) {
        // concentrated pool, where we know weight is 1:1

        return new Dec(0.5).mul(new Dec(1).sub(minimumRiskFactor));
      }
      return new Dec(0);
    }
  );
}
