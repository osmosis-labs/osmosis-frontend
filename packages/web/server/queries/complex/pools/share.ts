import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { estimateExitSwap } from "@osmosis-labs/math";

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
  } catch (e) {
    console.error(`Error in getGammShareUnderlyingCoins.`, {
      poolId,
      coin: { denom, amount },
    });
    throw e;
  }
}
