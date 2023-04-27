import {
  ChainGetter,
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import {
  ObservableAddConcentratedLiquidityConfig,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { useCallback, useState } from "react";

import { useStore } from "~/stores";

/** Maintains a single instance of `ObservableAddConcentratedLiquidityConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `poolId`, `bech32Address` on render.
 */
export function useAddConcentratedLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  poolId: string,
  queriesStore: IQueriesStore<CosmosQueries & CosmwasmQueries & OsmosisQueries>
): {
  config: ObservableAddConcentratedLiquidityConfig;
  addLiquidity: () => Promise<void>;
} {
  const { accountStore, derivedDataStore } = useStore();

  const account = accountStore.getAccount(osmosisChainId);
  const { bech32Address } = account;

  const { poolDetail } = derivedDataStore.getForPool(poolId);
  const pool = poolDetail!.pool!.pool as ConcentratedLiquidityPool;

  const [config] = useState(
    () =>
      new ObservableAddConcentratedLiquidityConfig(
        chainGetter,
        osmosisChainId,
        poolId,
        bech32Address,
        queriesStore,
        queriesStore.get(osmosisChainId).queryBalances,
        pool
      )
  );

  const addLiquidity = useCallback(async () => {
    return new Promise<void>(async (resolve, reject) => {
      console.log(resolve, reject);
      // try {
      //   if (config.isSingleAmountIn && config.singleAmountInConfig) {
      //     await account.osmosis.sendJoinSwapExternAmountInMsg(
      //       config.poolId,
      //       {
      //         currency: config.singleAmountInConfig.sendCurrency,
      //         amount: config.singleAmountInConfig.amount,
      //       },
      //       undefined,
      //       undefined,
      //       resolve
      //     );
      //   } else if (config.shareOutAmount) {
      //     await account.osmosis.sendJoinPoolMsg(
      //       config.poolId,
      //       config.shareOutAmount.toDec().toString(),
      //       undefined,
      //       undefined,
      //       resolve
      //     );
      //   }
      // } catch (e: any) {
      //   console.error(e);
      //   reject(e.message);
      // }
    });
  }, [account.osmosis, config.sender, config.poolId]);

  return { config, addLiquidity };
}
