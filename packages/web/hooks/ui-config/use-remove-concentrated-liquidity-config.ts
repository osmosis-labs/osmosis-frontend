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

  const removeLiquidity = useCallback(async () => {
    return new Promise<void>(async (_, reject) => {
      try {
      } catch (e: any) {
        console.error(e);
        reject(e.message);
      }
    });
  }, [account.osmosis]);

  return { config, removeLiquidity };
}
