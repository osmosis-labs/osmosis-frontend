import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import {
  ObservableRemoveConcentratedLiquidityConfig,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { useCallback, useState } from "react";

import { useStore } from "~/stores";

export function useRemoveConcentratedLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>,
  poolId: string,
  positionId: string
): {
  config: ObservableRemoveConcentratedLiquidityConfig;
  removeLiquidity: () => Promise<void>;
} {
  const { accountStore } = useStore();

  const account = accountStore.getAccount(osmosisChainId);

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
                  resolve();
                }
              }
            )
            .catch(reject);
        } catch (e: any) {
          reject(e);
        }
      }),
    [account.osmosis, positionId, config.effectiveLiquidity]
  );

  return { config, removeLiquidity };
}
