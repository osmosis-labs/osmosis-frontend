import { ChainGetter } from "@keplr-wallet/stores";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { ObservableAddConcentratedLiquidityConfig } from "@osmosis-labs/stores";
import { when } from "mobx";
import { useCallback, useState } from "react";

import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
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
  const { accountStore, queriesStore, priceStore } = useStore();
  const osmosisQueries = queriesStore.get(osmosisChainId).osmosis!;
  const { logEvent } = useAmplitudeAnalytics();

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
        queriesStore.get(osmosisChainId).queryBalances,
        priceStore
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

        await when(() => Boolean(priceStore.response));
        const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;
        const value0 = baseDepositValue
          ? priceStore.calculatePrice(
              new CoinPretty(
                config.baseDepositAmountIn.sendCurrency,
                baseDepositValue.amount
              )
            )
          : new PricePretty(fiat, 0);
        const value1 = quoteDepositValue
          ? priceStore.calculatePrice(
              new CoinPretty(
                config.quoteDepositAmountIn.sendCurrency,
                quoteDepositValue.amount
              )
            )
          : new PricePretty(fiat, 0);
        const totalValue = Number(
          value0?.toDec().add(value1?.toDec() ?? new Dec(0)) ?? 0
        );
        const baseEvent = {
          isSingleAsset:
            !Boolean(baseDepositValue) || !Boolean(quoteDepositValue),
          liquidityUSD: totalValue,
          volatilityType: config.currentStrategy ?? "",
          poolId,
          rangeHigh: Number(config.rangeWithCurrencyDecimals[1].toString()),
          rangeLow: Number(config.rangeWithCurrencyDecimals[0].toString()),
        };
        logEvent([
          EventName.ConcentratedLiquidity.addLiquidityStarted,
          baseEvent,
        ]);

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

              logEvent([
                EventName.ConcentratedLiquidity.addLiquidityCompleted,
                baseEvent,
              ]);
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
    priceStore,
    osmosisQueries.queryLiquiditiesPerTickRange,
    config.baseDepositAmountIn.sendCurrency,
    config.baseDepositAmountIn.amount,
    config.quoteDepositAmountIn.sendCurrency,
    config.quoteDepositAmountIn.amount,
    config.baseDepositOnly,
    config.quoteDepositOnly,
    config.tickRange,
    config.currentStrategy,
    config.rangeWithCurrencyDecimals,
    config.poolId,
    logEvent,
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

        await when(() => Boolean(priceStore.response));
        const value0 = priceStore.calculatePrice(
          new CoinPretty(config.baseDepositAmountIn.sendCurrency, amount0)
        );
        const value1 = priceStore.calculatePrice(
          new CoinPretty(config.quoteDepositAmountIn.sendCurrency, amount1)
        );
        const totalValue = Number(
          value0?.toDec().add(value1?.toDec() ?? new Dec(0)) ?? 0
        );
        const baseEvent = {
          isSingleAsset: amount0 === "0" || amount1 === "0",
          liquidityUSD: totalValue,
          positionId: positionId,
          volatilityType: config.currentStrategy ?? "",
          poolId,
          rangeHigh: Number(config.rangeWithCurrencyDecimals[1].toString()),
          rangeLow: Number(config.rangeWithCurrencyDecimals[0].toString()),
        };
        logEvent([
          EventName.ConcentratedLiquidity.addMoreLiquidityStarted,
          baseEvent,
        ]);

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

                logEvent([
                  EventName.ConcentratedLiquidity.addMoreLiquidityCompleted,
                  baseEvent,
                ]);

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
      config.currentStrategy,
      config.rangeWithCurrencyDecimals,
      account?.osmosis,
      priceStore,
      logEvent,
    ]
  );

  return { config, addLiquidity, increaseLiquidity };
}
