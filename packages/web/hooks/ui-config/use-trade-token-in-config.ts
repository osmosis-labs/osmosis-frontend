import { Currency } from "@keplr-wallet/types";
import {
  ObservableQueryPool,
  ObservableTradeTokenInConfig,
} from "@osmosis-labs/stores";
import { useCallback, useEffect, useState } from "react";

import { useStore } from "~/stores";

/** Maintains a single instance of `ObservableTradeTokenInConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `bech32Address`, `pools` on render.
 *  `percentage` default: `"50"`.
 * `requeryIntervalMs` specifies how often to refetch pool data based on current tokens.
 */
export function useTradeTokenInConfig(
  osmosisChainId: string,
  pools: ObservableQueryPool[],
  requeryIntervalMs = 8000
): {
  tradeTokenInConfig: ObservableTradeTokenInConfig;
  tradeTokenIn: (slippage: string) => Promise<"multihop" | "exact-in">;
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

  // refresh relevant pool data every `requeryIntervalMs` period
  useEffect(() => {
    const interval = setInterval(() => {
      const poolIds =
        config.optimizedRoutes
          ?.flatMap(({ pools }) => pools)
          .map((pool) => pool.id) ?? [];

      poolIds.forEach((poolId) => {
        queriesStore
          .get(osmosisChainId)
          .osmosis!.queryGammPools.getPool(poolId)
          ?.fetch();
      });
    }, requeryIntervalMs);
    return () => clearInterval(interval);
  }, [config.optimizedRoutes, osmosisChainId, queriesStore, requeryIntervalMs]);

  /** User trade token in from config values. */
  const tradeTokenIn = useCallback(
    async (maxSlippage: string): Promise<"multihop" | "exact-in"> => {
      if (!config.optimizedRoutes) {
        return Promise.reject(
          "User input should be disabled if no route is found or is being generated"
        );
      }

      const routePools: {
        poolId: string;
        tokenOutCurrency: Currency;
      }[] = [];

      // TODO: use new split route message if routes.length > 1
      for (let i = 0; i < config.optimizedRoutes[0].pools.length; i++) {
        const pool = config.optimizedRoutes[0].pools[i];
        const tokenOutCurrency = chainStore.osmosis.currencies.find(
          (cur) =>
            cur.coinMinimalDenom ===
            config.optimizedRoutes?.[0]?.tokenOutDenoms[i]
        );

        if (!tokenOutCurrency) {
          return Promise.reject();
        }

        routePools.push({
          poolId: pool.id,
          tokenOutCurrency,
        });
      }

      const tokenInCurrency = chainStore.osmosis.currencies.find(
        (cur) =>
          cur.coinMinimalDenom === config.optimizedRoutes?.[0]?.tokenInDenom
      );

      if (!tokenInCurrency) {
        return Promise.reject();
      }

      const tokenIn = {
        currency: tokenInCurrency,
        amount: config.amount,
      };

      const resetConfigUserInput = () => {
        config.setAmount("");
        config.setFraction(undefined);
      };

      if (routePools.length === 1) {
        await account.osmosis.sendSwapExactAmountInMsg(
          routePools[0].poolId,
          tokenIn,
          routePools[0].tokenOutCurrency,
          maxSlippage,
          "",
          {
            amount: [
              {
                denom: chainStore.osmosis.stakeCurrency.coinMinimalDenom,
                amount: "0",
              },
            ],
          },
          undefined,
          () => {
            resetConfigUserInput();
            return "exact-in";
          }
        );
      } else {
        await account.osmosis.sendMultihopSwapExactAmountInMsg(
          routePools,
          tokenIn,
          maxSlippage,
          "",
          {
            amount: [
              {
                denom: chainStore.osmosis.stakeCurrency.coinMinimalDenom,
                amount: "0",
              },
            ],
          },
          undefined,
          () => {
            resetConfigUserInput();
            return "multihop";
          }
        );
      }

      return Promise.reject();
    },
    [account.osmosis, chainStore.osmosis, config]
  );

  return { tradeTokenInConfig: config, tradeTokenIn };
}
