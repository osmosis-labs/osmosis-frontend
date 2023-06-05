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
      try {
        const quoteCoin = {
          currency: config.quoteDepositAmountIn.sendCurrency,
          amount: config.quoteDepositAmountIn.amount,
        };
        const baseCoin = {
          currency: config.baseDepositAmountIn.sendCurrency,
          amount: config.baseDepositAmountIn.amount,
        };
        let quoteDepositValue = undefined;
        let baseDepositValue = undefined;
        if (config.baseDepositOnly) {
          baseDepositValue = baseCoin;
        } else if (config.quoteDepositOnly) {
          quoteDepositValue = quoteCoin;
        } else {
          quoteDepositValue = quoteCoin;
          baseDepositValue = baseCoin;
        }

        await account.osmosis.sendCreateConcentratedLiquidityPositionMsg(
          config.poolId,
          config.tickRange[0],
          config.tickRange[1],
          baseDepositValue,
          quoteDepositValue,
          undefined,
          (tx) => {
            if (tx.code) reject();
            resolve();
          }
        );
      } catch (e: any) {
        console.error(e);
        reject(e.message);
      }
    });
  }, [
    account.osmosis,
    config.baseDepositAmountIn.sendCurrency,
    config.baseDepositAmountIn.amount,
    config.quoteDepositAmountIn.sendCurrency,
    config.quoteDepositAmountIn.amount,
    config.baseDepositOnly,
    config.quoteDepositOnly,
    config.tickRange,
    config.poolId,
  ]);

  return { config, addLiquidity };
}
