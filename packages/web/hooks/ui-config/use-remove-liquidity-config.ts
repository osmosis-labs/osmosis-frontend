import {
  ChainGetter,
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import {
  ObservableRemoveLiquidityConfig,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { useCallback, useState } from "react";

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

  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address ?? "";

  const queryOsmosis = queriesStore.get(osmosisChainId).osmosis!;
  const [config] = useState(() => {
    const c = new ObservableRemoveLiquidityConfig(
      chainGetter,
      osmosisChainId,
      poolId,
      address,
      queriesStore,
      queryOsmosis.queryGammPoolShare,
      queryOsmosis.queryPools,
      initialPercent
    );
    c.setPercentage(initialPercent);
    return c;
  });
  config.setChain(osmosisChainId);
  config.setSender(address);
  config.setPoolId(poolId);
  config.setQueryPoolShare(queryOsmosis.queryGammPoolShare);

  const removeLiquidity = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        account?.osmosis
          .sendExitPoolMsg(
            config.poolId,
            config.poolShareWithPercentage.toDec().toString(),
            undefined,
            undefined,
            (tx) => {
              if (tx.code) reject();
              else resolve();
            }
          )
          .catch(reject);
      }),
    [account?.osmosis, config.poolId, config.poolShareWithPercentage]
  );

  return { config, removeLiquidity };
}
