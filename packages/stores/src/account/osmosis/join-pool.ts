import * as OsmosisMath from "@osmosis-labs/math";
import { CoinPretty, Dec, DecUtils, Int } from "@osmosis-labs/unit";

import type { AddLiquidityPoolData } from "../../ui-config/manage-liquidity/add-liquidity";

/** Share pool state needed to build join msgs, as already held by the add liquidity config. */
export type JoinPoolData = Pick<
  AddLiquidityPoolData,
  "id" | "totalShare" | "assets" | "totalWeight" | "swapFee"
>;

/** @throws If the given pool data is not for the pool being joined. */
export function assertJoinPoolData(poolId: string, pool: JoinPoolData) {
  if (pool.id !== poolId) {
    throw new Error(
      `Join pool data is for pool #${pool.id}, but joining pool #${poolId}`
    );
  }
}

function rawAmount(coin: CoinPretty): Int {
  return new Int(coin.toCoin().amount);
}

/** Max token amounts (base units) to send for a join pool msg, given the slippage as a percentage.
 *  Empty if slippage is zero. */
export function getJoinPoolTokenInMaxs(
  pool: JoinPoolData,
  shareOutAmount: string,
  maxSlippage: string,
  shareCoinDecimals: number
): { denom: string; amount: string }[] {
  const maxSlippageDec = new Dec(maxSlippage).quo(
    DecUtils.getTenExponentNInPrecisionRange(2)
  );

  const estimated = OsmosisMath.estimateJoinSwap(
    { totalShare: rawAmount(pool.totalShare) },
    pool.assets.map(({ amount }) => ({
      denom: amount.currency.coinMinimalDenom,
      amount: rawAmount(amount),
    })),
    (coin) => {
      const asset = pool.assets.find(
        ({ amount }) => amount.currency.coinMinimalDenom === coin.denom
      );
      if (!asset) throw new Error(`Pool doesn't have the asset ${coin.denom}`);

      return new CoinPretty(asset.amount.currency, coin.amount);
    },
    shareOutAmount,
    shareCoinDecimals
  );

  if (maxSlippageDec.equals(new Dec(0))) return [];

  return estimated.tokenIns.map((tokenIn) => {
    const dec = tokenIn.toDec();
    const amount = dec
      .mul(
        DecUtils.getTenExponentNInPrecisionRange(tokenIn.currency.coinDecimals)
      )
      .mul(new Dec(1).add(maxSlippageDec))
      .truncate();

    return {
      denom: tokenIn.currency.coinMinimalDenom,
      amount: amount.toString(),
    };
  });
}

/** Minimum shares out (base units) for a single asset join msg, given the slippage as a percentage.
 *  @throws If the pool is not weighted or the asset is not in the pool. */
export function getJoinSwapShareOutMinAmount(
  pool: JoinPoolData,
  tokenIn: {
    currency: { coinDecimals: number; coinMinimalDenom: string };
    amount: string;
  },
  maxSlippage: string,
  shareCoinDecimals: number
): Int {
  const { totalWeight } = pool;
  if (!totalWeight) {
    throw new Error("Must be weighted pool");
  }

  const poolAsset = pool.assets.find(
    ({ amount }) =>
      amount.currency.coinMinimalDenom === tokenIn.currency.coinMinimalDenom
  );
  if (!poolAsset) {
    throw new Error(
      `Pool doesn't have the pool asset for ${tokenIn.currency.coinMinimalDenom}`
    );
  }
  if (!poolAsset.weight) {
    throw new Error("Pool asset not weighted");
  }

  const estimated = OsmosisMath.estimateJoinSwapExternAmountIn(
    {
      amount: rawAmount(poolAsset.amount),
      weight: poolAsset.weight,
    },
    {
      totalShare: rawAmount(pool.totalShare),
      totalWeight,
      swapFee: pool.swapFee,
    },
    tokenIn,
    shareCoinDecimals
  );

  const outRatio = new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100)));
  return estimated.shareOutAmountRaw.toDec().mul(outRatio).truncate();
}
