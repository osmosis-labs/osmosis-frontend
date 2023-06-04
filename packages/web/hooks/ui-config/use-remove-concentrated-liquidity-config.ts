import {
  ChainGetter,
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import {
  ObservableRemoveConcentratedLiquidityConfig,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { useCallback, useState } from "react";

import { useStore } from "~/stores";

export function useRemoveConcentratedLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  poolId: string,
  queriesStore: IQueriesStore<CosmosQueries & CosmwasmQueries & OsmosisQueries>,
  initialPercentage = 1
): {
  config: ObservableRemoveConcentratedLiquidityConfig;
  removeLiquidity: () => Promise<void>;
} {
  const { accountStore, derivedDataStore } = useStore();

  const account = accountStore.getAccount(osmosisChainId);
  const { bech32Address } = account;

  const { poolDetail } = derivedDataStore.getForPool(poolId);
  const pool = poolDetail!.pool!.pool as ConcentratedLiquidityPool;

  const [config] = useState(
    () =>
      new ObservableRemoveConcentratedLiquidityConfig(
        chainGetter,
        osmosisChainId,
        bech32Address,
        queriesStore,
        queriesStore.get(osmosisChainId).queryBalances,
        pool,
        initialPercentage
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
