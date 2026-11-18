import type { UserPosition } from "@osmosis-labs/server";
import { prepareWithdrawConcentratedLiquidityPositionMsg } from "@osmosis-labs/tx";
import type { CoinPretty, Dec } from "@osmosis-labs/unit";
import { useCallback, useMemo, useState } from "react";

import { api } from "~/utils/trpc";

import { useWallet } from "../use-wallet";
import {
  getEffectiveLiquidity,
  getEffectiveLiquidityAmounts,
  getRemoveConcentratedLiquidityError,
} from "./remove-concentrated-liquidity";

export type RemoveConcentratedLiquidityConfig = {
  /** Fraction (0 to 1) of the position's liquidity to remove. */
  readonly percentage: number;
  readonly effectiveLiquidity: Dec | undefined;
  readonly effectiveLiquidityAmounts:
    { base: CoinPretty; quote: CoinPretty } | undefined;
  readonly error: Error | undefined;
  setPercentage: (percentage: number) => void;
};

export function useRemoveConcentratedLiquidityConfig(
  osmosisChainId: string,
  poolId: string,
  position: UserPosition
): {
  config: RemoveConcentratedLiquidityConfig;
  removeLiquidity: () => Promise<void>;
} {
  const apiUtils = api.useUtils();

  const {
    wallet: account,
    signAndBroadcast,
    transactionContext,
  } = useWallet(osmosisChainId);

  const [percentage, setPercentage] = useState(1);

  const { liquidity, currentCoins } = position;
  const [baseAsset, quoteAsset] = currentCoins;
  const config = useMemo<RemoveConcentratedLiquidityConfig>(() => {
    const pos = { baseAsset, quoteAsset, liquidity };
    return {
      percentage,
      effectiveLiquidity: getEffectiveLiquidity(pos, percentage),
      effectiveLiquidityAmounts: getEffectiveLiquidityAmounts(pos, percentage),
      error: getRemoveConcentratedLiquidityError(percentage),
      setPercentage,
    };
  }, [baseAsset, quoteAsset, liquidity, percentage]);

  const removeLiquidity = useCallback(
    () =>
      new Promise<void>(async (resolve, reject) => {
        try {
          const liquidity = config.effectiveLiquidity;
          if (!liquidity) {
            return Promise.reject("Invalid liquidity");
          }
          if (!account) {
            return Promise.reject("No account");
          }

          prepareWithdrawConcentratedLiquidityPositionMsg(
            transactionContext,
            position.id,
            liquidity,
            undefined,
            (tx) => {
              if (tx.code) {
                reject(tx.rawLog);
              } else {
                // refresh tick data
                apiUtils.local.concentratedLiquidity.getLiquidityPerTickRange
                  .invalidate({ poolId })
                  .finally(() => resolve());
              }
            }
          )
            .then((prepared) => signAndBroadcast(...prepared))
            .catch(reject);
        } catch (e: any) {
          reject(e);
        }
      }),
    [
      config.effectiveLiquidity,
      account,
      transactionContext,
      position.id,
      apiUtils,
      poolId,
      signAndBroadcast,
    ]
  );

  return { config, removeLiquidity };
}
