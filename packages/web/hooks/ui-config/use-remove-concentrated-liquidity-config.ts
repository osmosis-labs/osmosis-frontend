import { ChainGetter } from "@keplr-wallet/stores";
import { ObservableRemoveConcentratedLiquidityConfig } from "@osmosis-labs/stores";
import { useCallback, useState } from "react";

import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { useStore } from "~/stores";

export function useRemoveConcentratedLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  poolId: string,
  positionId: string
): {
  config: ObservableRemoveConcentratedLiquidityConfig;
  removeLiquidity: () => Promise<void>;
} {
  const { accountStore, queriesStore } = useStore();
  const { logEvent } = useAmplitudeAnalytics();

  const account = accountStore.getWallet(osmosisChainId);
  const osmosisQueries = queriesStore.get(osmosisChainId).osmosis!;

  const [config] = useState(
    () =>
      new ObservableRemoveConcentratedLiquidityConfig(
        chainGetter,
        osmosisChainId,
        queriesStore,
        poolId,
        positionId
      )
  );

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
              positionId,
            },
          ]);

          account.osmosis
            .sendWithdrawConcentratedLiquidityPositionMsg(
              positionId,
              liquidity,
              undefined,
              (tx) => {
                if (tx.code) {
                  reject(tx.rawLog);
                } else {
                  // get latest liquidity depths for charts
                  osmosisQueries.queryLiquiditiesPerTickRange
                    .getForPoolId(poolId)
                    .waitFreshResponse();
                  // get latest price, if position removed
                  osmosisQueries.queryPools
                    .getPool(poolId)
                    ?.waitFreshResponse();

                  logEvent([
                    EventName.ConcentratedLiquidity.removeLiquidityCompleted,
                    {
                      liquidityUSD: Number(liquidity.toString()),
                      poolId,
                      positionId,
                      percentage: config.percentage.toString(),
                    },
                  ]);

                  resolve();
                }
              }
            )
            .catch(reject);
        } catch (e: any) {
          reject(e);
        }
      }),
    [
      osmosisQueries,
      poolId,
      account,
      positionId,
      config.effectiveLiquidity,
      config.percentage,
      logEvent,
    ]
  );

  return { config, removeLiquidity };
}
