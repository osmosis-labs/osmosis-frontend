import { AppCurrency } from "@keplr-wallet/types";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { ObservableTradeTokenInConfig } from "@osmosis-labs/stores";
import { useCallback, useEffect, useState } from "react";

import { AssetLists } from "~/config/generated/asset-lists";
import { useStore } from "~/stores";
import { BestSplitTokenInQuote } from "~/utils/routing/best-route-router";
import { api } from "~/utils/trpc";

/** Use all IBC denoms from config. */
const allTradeableDenoms = AssetLists.flatMap(({ assets }) => assets).map(
  (asset) => asset.base
);

/** Maintains a single instance of `ObservableTradeTokenInConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `bech32Address`, `pools` on render.
 *  `percentage` default: `"50"`.
 */
export function useTradeTokenInConfig(
  osmosisChainId: string,
  tokenDenoms?: string[],
  defaultSendToken?: AppCurrency,
  defaultOutToken?: AppCurrency
): {
  tradeTokenInConfig: ObservableTradeTokenInConfig<BestSplitTokenInQuote>;
  tradeTokenIn: (
    slippage: Dec
  ) => Promise<"multiroute" | "multihop" | "exact-in">;
} {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const account = accountStore.getWallet(osmosisChainId);

  const address = account?.address ?? "";

  const { data } = api.edge.assets.getAssets.useQuery();

  console.log({ data });

  const [config] = useState(
    () =>
      new ObservableTradeTokenInConfig<BestSplitTokenInQuote>(
        chainStore,
        queriesStore,
        priceStore,
        osmosisChainId,
        address,
        undefined,
        {
          send: defaultSendToken ?? {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          out: defaultOutToken ?? {
            coinDenom: "OSMO",
            coinMinimalDenom: "uosmo",
            coinDecimals: 6,
          },
        }
      )
  );
  // updates UI config on render to reflect latest values
  config.setChain(osmosisChainId);
  config.setSender(address);
  if (tokenDenoms) config.setSendableDenoms(tokenDenoms);

  // TODO: move async router call to trpc usequery hook
  // * onSuccess callback can be used to set quote in config and log result
  // * Dec and Int types should be serialized via superjson
  // * Log quote load times both from

  const { data: userQuote, isFetching: isFetchingUserQuote } =
    api.edge.quoteRouter.routeTokenOutGivenIn.useQuery(
      {
        tokenInAmount: config.getAmountPrimitive().amount,
        tokenInDenom: config.sendCurrency.coinMinimalDenom,
        tokenOutDenom: config.outCurrency.coinMinimalDenom,
      },
      {
        enabled: !config.isEmptyInput,
      }
    );
  const { data: spotPriceQuote, isFetching: isFetchingSpotPriceQuote } =
    api.edge.quoteRouter.routeTokenOutGivenIn.useQuery({
      tokenInAmount: DecUtils.getTenExponentNInPrecisionRange(
        config.sendCurrency.coinDecimals
      )
        .truncate()
        .toString(),
      tokenInDenom: config.sendCurrency.coinMinimalDenom,
      tokenOutDenom: config.outCurrency.coinMinimalDenom,
    });

  if (isFetchingUserQuote || isFetchingSpotPriceQuote)
    config.setQuoteIsLoading(true);
  else if (userQuote) config.setQuote(userQuote);

  if (spotPriceQuote) config.setSpotPriceQuote(spotPriceQuote);

  useEffect(() => {
    if (!tokenDenoms) config.setSendableDenoms(allTradeableDenoms);
  }, [config, tokenDenoms]);

  /** User trade token in from config values. */
  const tradeTokenIn = useCallback(
    (maxSlippage: Dec) =>
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
      }),
    [config, account?.osmosis]
  );

  return { tradeTokenInConfig: config, tradeTokenIn };
}
