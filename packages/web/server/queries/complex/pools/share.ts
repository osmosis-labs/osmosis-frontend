import { CoinPretty, Dec, Int, RatePretty } from "@keplr-wallet/unit";
import { estimateExitSwap } from "@osmosis-labs/math";
import { Currency } from "@osmosis-labs/types";

import { StablePoolRawResponse, WeightedPoolRawResponse } from "../../osmosis";
import { getLockableDurations } from "../pools/incentives";
import { getPool } from ".";

/** Calculates underlying coins from given GAMM shares (without decimals).
 *  Returns an empty array if there is an issue calculating the underlying amounts,
 *  such as if the share amount is too small for token precision.
 *  @throws if given pool shares are invalid or pool not found. */
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

  try {
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
  } catch {
    // not enough token precision for given share amount
    return [];
  }
}

/** Gets info for a share pool.
 *  A share pool is a pool that issues liquidity ownership a share token (gamm/pool/{poolId}) and is either stable or weighted.
 *  It is considered a legacy type of pool.
 *  @throws if pool is not share pool (stable or weighted). */
export async function getSharePool(poolId: string) {
  const [pool, lockableDurations] = await Promise.all([
    getPool({ poolId }),
    getLockableDurations(),
  ]);

  const basePool = {
    ...pool,
    // narrow the type
    type: pool.type as "weighted" | "stable",
    raw: pool.raw as Omit<
      WeightedPoolRawResponse | StablePoolRawResponse,
      "@type"
    >,
    currency: makeGammShareCurrency(poolId),
    lockableDurations,
  };

  if (pool.type === "weighted") {
    const poolRaw = pool.raw as WeightedPoolRawResponse;
    const totalWeight = new Dec(poolRaw.total_weight);

    return {
      ...basePool,
      weights: poolRaw.pool_assets.map(({ token: { denom }, weight }) => ({
        denom,
        weight: new Dec(weight).truncate(),
        weightFraction: new RatePretty(new Dec(weight).quo(totalWeight)),
      })),
      totalWeight: totalWeight.truncate(),
    };
  }

  if (pool.type === "stable") {
    const poolRaw = pool.raw as StablePoolRawResponse;
    const totalWeight = new Dec(poolRaw.pool_liquidity.length);

    return {
      ...basePool,
      weights: poolRaw.pool_liquidity.map(({ denom }) => ({
        denom,
        weight: new Int(1),
        weightFraction: new RatePretty(new Dec(1).quo(totalWeight)),
      })),
      totalWeight: totalWeight.truncate(),
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

export function makeGammShareCurrency(poolId: string): Currency {
  return {
    coinMinimalDenom: `gamm/pool/${poolId}`,
    coinDenom: `GAMM/${poolId}`,
    coinDecimals: 18,
  };
}

/** Extracts pool ID from a share denom. */
export function getShareDenomPoolId(shareDenom: string) {
  return shareDenom.split("/")[2];
}
