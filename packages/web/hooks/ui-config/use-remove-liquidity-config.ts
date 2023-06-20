import { useState, useCallback } from "react";
import {
  ChainGetter,
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import {
  OsmosisQueries,
  ObservableRemoveLiquidityConfig,
} from "@osmosis-labs/stores";
import { useStore } from "../../stores";

/** Maintains a single instance of `ObservableRemoveLiquidityConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `poolId`, `bech32Address`, and `queryOsmosis.queryGammPoolShare` on render.
 *  `percentage` default: `"50"`.
 */
export function useRemoveLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  poolId: string,
  queriesStore: IQueriesStore<CosmosQueries & CosmwasmQueries & OsmosisQueries>,
  initialPercent = "50"
): {
  config: ObservableRemoveLiquidityConfig;
  removeLiquidity: () => Promise<void>;
} {
  const { accountStore } = useStore();

  const account = accountStore.getAccount(osmosisChainId);
  const { bech32Address } = account;

  const queryOsmosis = queriesStore.get(osmosisChainId).osmosis!;
  const [config] = useState(() => {
    const c = new ObservableRemoveLiquidityConfig(
      chainGetter,
      osmosisChainId,
      poolId,
      bech32Address,
      queriesStore,
      queryOsmosis.queryGammPoolShare,
      queryOsmosis.queryGammPools,
      initialPercent
    );
    c.setPercentage(initialPercent);
    return c;
  });
  config.setChain(osmosisChainId);
  config.setSender(bech32Address);
  config.setPoolId(poolId);
  config.setQueryPoolShare(queryOsmosis.queryGammPoolShare);

  const removeLiquidity = useCallback(() => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await account.osmosis.sendExitPoolMsg(
          config.poolId,
          config.poolShareWithPercentage.toDec().toString(),
          undefined,
          undefined,
          resolve
        );
      } catch (e) {
        console.error(e);
        reject();
      }
    });
  }, []);

  return { config, removeLiquidity };
}
