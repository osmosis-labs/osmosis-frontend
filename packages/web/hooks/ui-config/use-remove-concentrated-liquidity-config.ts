import { ChainGetter } from "@keplr-wallet/stores";
import { ObservableRemoveConcentratedLiquidityConfig } from "@osmosis-labs/stores";
import { useCallback, useState } from "react";

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

  const account = accountStore.getAccount(osmosisChainId);
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

          account.osmosis
            .sendWithdrawConcentratedLiquidityPositionMsg(
              positionId,
              liquidity,
              undefined,
              (tx) => {
                if (tx.code) {
                  reject(tx.log);
                } else {
                  // get latest liquidity depths for charts
                  osmosisQueries.queryLiquiditiesPerTickRange
                    .getForPoolId(poolId)
                    .waitFreshResponse();
                  // get latest price, if position removed
                  osmosisQueries.queryPools
                    .getPool(poolId)
                    ?.waitFreshResponse();
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
      account.osmosis,
      positionId,
      config.effectiveLiquidity,
    ]
  );

  return { config, removeLiquidity };
}
