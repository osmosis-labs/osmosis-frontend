import { ChainGetter } from "@keplr-wallet/stores";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { ObservableAddConcentratedLiquidityConfig } from "@osmosis-labs/stores";
import { useCallback, useState } from "react";

import { useStore } from "~/stores";

/** Maintains a single instance of `ObservableAddConcentratedLiquidityConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `poolId`, `bech32Address` on render.
 *
 *  Provides memoized callbacks for sending common messages associated with adding concentrated liquidity.
 */
export function useAddConcentratedLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  poolId: string
): {
  config: ObservableAddConcentratedLiquidityConfig;
  addLiquidity: () => Promise<void>;
  increaseLiquidity: (positionId: string) => Promise<void>;
} {
  const { accountStore, queriesStore } = useStore();
  const osmosisQueries = queriesStore.get(osmosisChainId).osmosis!;

  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address ?? "";

  const queryPool = osmosisQueries.queryPools.getPool(poolId);

  const [config] = useState(
    () =>
      new ObservableAddConcentratedLiquidityConfig(
        chainGetter,
        osmosisChainId,
        poolId,
        address,
        queriesStore,
        queriesStore.get(osmosisChainId).queryBalances
      )
  );

  if (queryPool && queryPool.pool instanceof ConcentratedLiquidityPool)
    config.setPool(queryPool.pool);

  const addLiquidity = useCallback(() => {
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

        await account?.osmosis.sendCreateConcentratedLiquidityPositionMsg(
          config.poolId,
          config.tickRange[0],
          config.tickRange[1],
          baseDepositValue,
          quoteDepositValue,
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else {
              osmosisQueries.queryLiquiditiesPerTickRange
                .getForPoolId(poolId)
                .waitFreshResponse()
                .then(() => resolve());
            }
          }
        );
      } catch (e: any) {
        console.error(e);
        reject(e.message);
      }
    });
  }, [
    poolId,
    account?.osmosis,
    osmosisQueries.queryLiquiditiesPerTickRange,
    config.baseDepositAmountIn.sendCurrency,
    config.baseDepositAmountIn.amount,
    config.quoteDepositAmountIn.sendCurrency,
    config.quoteDepositAmountIn.amount,
    config.baseDepositOnly,
    config.quoteDepositOnly,
    config.tickRange,
    config.poolId,
  ]);

  const increaseLiquidity = useCallback(
    (positionId: string) =>
      new Promise<void>(async (resolve, reject) => {
        const amount0 = config.quoteDepositOnly
          ? "0"
          : config.baseDepositAmountIn.getAmountPrimitive().amount;
        const amount1 = config.baseDepositOnly
          ? "0"
          : config.quoteDepositAmountIn.getAmountPrimitive().amount;

        try {
          await account?.osmosis.sendAddToConcentratedLiquidityPositionMsg(
            positionId,
            amount0,
            amount1,
            undefined,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else {
                osmosisQueries.queryLiquiditiesPerTickRange
                  .getForPoolId(poolId)
                  .waitFreshResponse();
                resolve();
              }
            }
          );
        } catch (e: any) {
          console.error(e);
          reject(e.message);
        }
      }),
    [
      poolId,
      osmosisQueries.queryLiquiditiesPerTickRange,
      config.baseDepositAmountIn,
      config.quoteDepositAmountIn,
      config.baseDepositOnly,
      config.quoteDepositOnly,
      account?.osmosis,
    ]
  );

  return { config, addLiquidity, increaseLiquidity };
}
