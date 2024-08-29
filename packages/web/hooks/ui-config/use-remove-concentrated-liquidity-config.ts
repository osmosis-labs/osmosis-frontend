import { ChainGetter } from "@osmosis-labs/keplr-stores";
import type { UserPosition } from "@osmosis-labs/server";
import { ObservableRemoveConcentratedLiquidityConfig } from "@osmosis-labs/stores";
import { useEffect } from "react";
import { useCallback, useState } from "react";

import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export function useRemoveConcentratedLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  poolId: string,
  position: UserPosition
): {
  config: ObservableRemoveConcentratedLiquidityConfig;
  removeLiquidity: () => Promise<void>;
} {
  const { accountStore } = useStore();
  const { logEvent } = useAmplitudeAnalytics();
  const apiUtils = api.useUtils();

  const account = accountStore.getWallet(osmosisChainId);

  const [config] = useState(
    () =>
      new ObservableRemoveConcentratedLiquidityConfig(
        chainGetter,
        osmosisChainId,
        poolId,
        {
          baseAsset: position.currentCoins[0],
          quoteAsset: position.currentCoins[1],
          liquidity: position.liquidity,
        }
      )
  );

  useEffect(() => {
    config.setPosition({
      baseAsset: position.currentCoins[0],
      quoteAsset: position.currentCoins[1],
      liquidity: position.liquidity,
    });
  }, [config, position]);

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

          logEvent([
            EventName.ConcentratedLiquidity.removeLiquidityClicked,
            {
              liquidityUSD: Number(liquidity.toString()),
              poolId,
              positionId: position.id,
            },
          ]);

          account.osmosis
            .sendWithdrawConcentratedLiquidityPositionMsg(
              position.id,
              liquidity,
              undefined,
              (tx) => {
                if (tx.code) {
                  reject(tx.rawLog);
                } else {
                  logEvent([
                    EventName.ConcentratedLiquidity.removeLiquidityCompleted,
                    {
                      liquidityUSD: Number(liquidity.toString()),
                      poolId,
                      positionId: position.id,
                      percentage: config.percentage.toString(),
                    },
                  ]);

                  // refresh tick data
                  apiUtils.local.concentratedLiquidity.getLiquidityPerTickRange
                    .invalidate({ poolId })
                    .finally(() => resolve());
                }
              }
            )
            .catch(reject);
        } catch (e: any) {
          reject(e);
        }
      }),
    [
      config.effectiveLiquidity,
      config.percentage,
      account,
      logEvent,
      poolId,
      position.id,
      apiUtils,
    ]
  );

  return { config, removeLiquidity };
}
