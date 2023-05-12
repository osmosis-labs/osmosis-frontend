import { Dec } from "@keplr-wallet/unit";
import {
  ObservableQueryPool,
  ObservableTradeTokenInConfig,
} from "@osmosis-labs/stores";
import { useEffect, useState } from "react";

import { useStore } from "~/stores";

import { useFreshSwapData } from "./use-fresh-swap-data";

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
  const account = accountStore.getAccount(osmosisChainId);

  const bech32Address = account.bech32Address;

  const [config] = useState(
    () =>
      new ObservableTradeTokenInConfig(
        chainStore,
        queriesStore,
        priceStore,
        osmosisChainId,
        bech32Address,
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
        }
      )
  );
  // updates UI config on render to reflect latest values
  config.setChain(osmosisChainId);
  config.setSender(bech32Address);
  config.setPools(pools);
  useEffect(() => {
    config.setIncentivizedPoolIds(
      queriesOsmosis.queryIncentivizedPools.incentivizedPools
    );
  }, [config, queriesOsmosis.queryIncentivizedPools.incentivizedPools]);

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

      ////////
      // Prepare swap data

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

      const tokenIn = {
        currency: config.sendCurrency,
        amount: config.amount,
      };

      const tokenOutMinAmount = config
        .outAmountLessSlippage(maxSlippage)
        .toCoin().amount;

      ////////
      // Send messages to account

      if (routes.length === 1) {
        const { pools } = routes[0];
        account.osmosis
          .sendSwapExactAmountInMsg(
            pools,
            tokenIn,
            tokenOutMinAmount,
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
        account.osmosis
          .sendSplitRouteSwapExactAmountInMsg(
            routes,
            tokenIn,
            tokenOutMinAmount,
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
