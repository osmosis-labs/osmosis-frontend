import { Dec } from "@keplr-wallet/unit";
import { OptimizedRoutes } from "@osmosis-labs/pools";
import {
  ObservableQueryPool,
  ObservableTradeTokenInConfig,
} from "@osmosis-labs/stores";
import { useEffect, useState } from "react";

import { useFreshSwapData } from "~/hooks/ui-config/use-fresh-swap-data";
import { useStore } from "~/stores";
import { BackgroundRoutes } from "~/utils/background-routes";

/** Maintains a single instance of `ObservableTradeTokenInConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `bech32Address`, `pools` on render.
 *  `percentage` default: `"50"`.
 */
export function useTradeTokenInConfig(
  osmosisChainId: string,
  pools: ObservableQueryPool[]
): {
  tradeTokenInConfig: ObservableTradeTokenInConfig;
  tradeTokenIn: (
    slippage: Dec
  ) => Promise<"multiroute" | "multihop" | "exact-in">;
} {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const queriesOsmosis = queriesStore.get(osmosisChainId).osmosis!;
  const account = accountStore.getWallet(osmosisChainId);

  const address = account?.address ?? "";

  const [config] = useState(
    () =>
      new ObservableTradeTokenInConfig(
        chainStore,
        queriesStore,
        priceStore,
        osmosisChainId,
        address,
        undefined,
        pools,
        {
          send: {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          out: {
            coinDenom: "OSMO",
            coinMinimalDenom: "uosmo",
            coinDecimals: 6,
          },
        },
        typeof window !== "undefined" && Boolean(window.Worker)
          ? BackgroundRoutes
          : OptimizedRoutes
      )
  );
  // updates UI config on render to reflect latest values
  config.setChain(osmosisChainId);
  config.setSender(address);
  config.setPools(pools);
  useEffect(() => {
    config.setIncentivizedPoolIds(
      queriesOsmosis.queryIncentivizedPools.incentivizedPools
    );
  }, [config, queriesOsmosis.queryIncentivizedPools.incentivizedPools]);
  useEffect(() => () => config.dispose(), [config]);

  useFreshSwapData(config);

  /** User trade token in from config values. */
  const tradeTokenIn = (maxSlippage: Dec) =>
    new Promise<"multiroute" | "multihop" | "exact-in">((resolve, reject) => {
      if (!config.optimizedRoutes) {
        return reject(
          "User input should be disabled if no route is found or is being generated"
        );
      }

      if (config.isEmptyInput) return reject("No input");

      /**
       * Prepare swap data
       */

      type Pool = {
        id: string;
        tokenOutDenom: string;
      };
      type Route = {
        pools: Pool[];
        tokenInAmount: string;
      };

      const routes: Route[] = [];

      for (const route of config.optimizedRoutes) {
        const pools: Pool[] = [];

        for (let i = 0; i < route.pools.length; i++) {
          const pool = route.pools[i];

          pools.push({
            id: pool.id,
            tokenOutDenom: route.tokenOutDenoms[i],
          });
        }

        routes.push({
          pools: pools,
          tokenInAmount: route.initialAmount.toString(),
        });
      }

      /** In amount converted to integer (remove decimals) */
      const tokenIn = {
        currency: config.sendCurrency,
        amount: config.getAmountPrimitive().amount,
      };

      const tokenOutMinAmount = config
        .outAmountLessSlippage(maxSlippage)
        .toCoin().amount;

      /**
       * Send messages to account
       */
      if (routes.length === 1) {
        const { pools } = routes[0];
        account?.osmosis
          .sendSwapExactAmountInMsg(
            pools,
            tokenIn,
            tokenOutMinAmount,
            config.expectedSwapResult?.numTicksCrossed,
            undefined,
            undefined,
            undefined,
            () => {
              config.reset();

              resolve(pools.length === 1 ? "exact-in" : "multihop");
            }
          )
          .catch((reason) => {
            config.reset();
            reject(reason);
          });
        return pools.length === 1 ? "exact-in" : "multihop";
      } else if (routes.length > 1) {
        account?.osmosis
          .sendSplitRouteSwapExactAmountInMsg(
            routes,
            tokenIn,
            tokenOutMinAmount,
            config.expectedSwapResult?.numTicksCrossed,
            undefined,
            undefined,
            undefined,
            () => {
              config.reset();

              resolve("multiroute");
            }
          )
          .catch((reason) => {
            config.reset();
            reject(reason);
          });
      } else {
        reject("No routes given");
      }
    });

  return { tradeTokenInConfig: config, tradeTokenIn };
}
