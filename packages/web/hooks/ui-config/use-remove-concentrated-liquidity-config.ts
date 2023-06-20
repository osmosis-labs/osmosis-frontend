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

  const account = accountStore.getWallet(osmosisChainId);

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

          account?.osmosis
            .sendWithdrawConcentratedLiquidityPositionMsg(
              positionId,
              liquidity,
              undefined,
              (tx) => {
                if (tx.code) {
                  reject(tx.rawLog);
                } else {
                  queriesStore
                    .get(osmosisChainId)
                    .osmosis!.queryLiquiditiesPerTickRange.getForPoolId(poolId)
                    .waitFreshResponse();
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
      queriesStore,
      poolId,
      account?.osmosis,
      osmosisChainId,
      positionId,
      config.effectiveLiquidity,
    ]
  );

  return { config, removeLiquidity };
}
