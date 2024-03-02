import { CoinPretty, Dec, Int, RatePretty } from "@keplr-wallet/unit";
import { estimateExitSwap } from "@osmosis-labs/math";
import { Currency } from "@osmosis-labs/types";

import { StablePoolRawResponse, WeightedPoolRawResponse } from "../../osmosis";
import { getPool } from ".";

/** Calculates underlying coins from given GAMM shares (without decimals). */
export async function getGammShareUnderlyingCoins({
  denom,
  amount,
}: {
  denom: string;
  amount: string;
}): Promise<CoinPretty[]> {
  const poolId = denom.split("/")[2];
  const pool = await getPool({ poolId });
  if (pool.type !== "weighted" && pool.type !== "stable") {
    throw new Error("Shares are for unexpected pool type");
  }
  const poolRaw = pool.raw as StablePoolRawResponse | WeightedPoolRawResponse;

  return estimateExitSwap(
    {
      totalShare: new Int(poolRaw.total_shares.amount),
      poolAssets: pool.reserveCoins.map((coin) => ({
        denom: coin.currency.coinMinimalDenom,
        amount: new Int(coin.toCoin().amount),
      })),
      exitFee: new Dec(poolRaw.pool_params.exit_fee),
    },
    (coin) => {
      const currency = pool.reserveCoins.find(
        (c) => c.currency.coinMinimalDenom === coin.denom
      );
      if (!currency) throw new Error("Reserve coin not in pool assets");
      return new CoinPretty(currency.currency, coin.amount);
    },
    amount,
    0
  ).tokenOuts;
}

/** Gets info for a share pool.
 *  @throws if pool is not share pool (stable or weighted). */
export async function getSharePool(poolId: string) {
  const pool = await getPool({ poolId });

  if (pool.type === "weighted") {
    const poolRaw = pool.raw as WeightedPoolRawResponse;
    const totalWeight = new Dec(poolRaw.total_weight);

    return {
      weights: poolRaw.pool_assets.map(({ token: { denom }, weight }) => ({
        denom,
        weight: new RatePretty(new Dec(weight).quoTruncate(totalWeight)),
      })),
    };
  }

  if (pool.type === "stable") {
    const poolRaw = pool.raw as StablePoolRawResponse;
    const shareDenom = poolRaw.total_shares.denom;
    const totalWeight = new Dec(
      (pool.raw as StablePoolRawResponse).total_shares.amount
    );

    return {
      weights: poolRaw.scaling_factors.map((scalingFactor) => ({
        denom: shareDenom,
        weight: new RatePretty(new Dec(scalingFactor).quoTruncate(totalWeight)),
      })),
    };
  }

  throw new Error("Pool is not a share pool");
}

/** Makes a share coin given raw share pool shares. */
export function makeShareCoin(rawShares: {
  denom: string;
  amount: string;
}): CoinPretty {
  return new CoinPretty(
    makeGammShareCurrency(rawShares.denom.replace("gamm/pool", "")),
    rawShares.amount
  );
}

function makeGammShareCurrency(poolId: string): Currency {
  return {
    coinMinimalDenom: `gamm/pool/${poolId}`,
    coinDenom: `GAMM/${poolId}`,
    coinDecimals: 18,
  };
}
