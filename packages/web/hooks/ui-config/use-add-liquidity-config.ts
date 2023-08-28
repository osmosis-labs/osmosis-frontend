import {
  ChainGetter,
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import {
  ObservableAddLiquidityConfig,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { useCallback, useState } from "react";

import { useStore } from "~/stores";

/** Maintains a single instance of `ObservableAddLiquidityConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `poolId`, `bech32Address`, and `queryOsmosis.queryGammPoolShare` on render.
 */
export function useAddLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  poolId: string,
  queriesStore: IQueriesStore<CosmosQueries & CosmwasmQueries & OsmosisQueries>
): {
  config: ObservableAddLiquidityConfig;
  addLiquidity: () => Promise<void>;
} {
  const { accountStore } = useStore();

  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address ?? "";

  const queryOsmosis = queriesStore.get(osmosisChainId).osmosis!;
  const [config] = useState(
    () =>
      new ObservableAddLiquidityConfig(
        chainGetter,
        osmosisChainId,
        poolId,
        address,
        queriesStore,
        queryOsmosis.queryGammPoolShare,
        queryOsmosis.queryPools,
        queriesStore.get(osmosisChainId).queryBalances
      )
  );
  config.setChain(osmosisChainId);
  config.setSender(address);
  config.setPoolId(poolId);
  config.setQueryPoolShare(queryOsmosis.queryGammPoolShare);

  const addLiquidity = useCallback(async () => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (config.isSingleAmountIn && config.singleAmountInConfig) {
          await account?.osmosis.sendJoinSwapExternAmountInMsg(
            config.poolId,
            {
              currency: config.singleAmountInConfig.sendCurrency,
              amount: config.singleAmountInConfig.amount,
            },
            undefined,
            undefined,
            resolve
          );
        } else if (config.shareOutAmount) {
          await account?.osmosis.sendJoinPoolMsg(
            config.poolId,
            config.shareOutAmount.toDec().toString(),
            undefined,
            undefined,
            resolve
          );
        }
      } catch (e: any) {
        console.error(e);
        reject(e.message);
      }
    });
  }, [
    account?.osmosis,
    config.isSingleAmountIn,
    config.singleAmountInConfig,
    config.sender,
    config.poolId,
    config.singleAmountInConfig?.sendCurrency,
    config.singleAmountInConfig?.amount,
    config.shareOutAmount,
  ]);

  return { config, addLiquidity };
}
