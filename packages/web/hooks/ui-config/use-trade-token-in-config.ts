import { AppCurrency } from "@keplr-wallet/types";
import { Dec } from "@keplr-wallet/unit";
import {
  makeIBCMinimalDenom,
  ObservableTradeTokenInConfig,
} from "@osmosis-labs/stores";
import { useEffect, useState } from "react";

import { ChainList } from "~/config";
import IBCAssetInfos from "~/config/ibc-assets";
import { OsmosisSidecarRemoteRouter } from "~/integrations/sidecar/router";
import { TfmRemoteRouter } from "~/integrations/tfm/router";
import { useStore } from "~/stores";
import { BestRouteTokenInRouter } from "~/utils/best-route-router";

import { useAmplitudeAnalytics } from "../use-amplitude-analytics";

/** Use all IBC denoms from config. */
const ibcDenoms = IBCAssetInfos.map(({ sourceChannelId, coinMinimalDenom }) =>
  makeIBCMinimalDenom(sourceChannelId, coinMinimalDenom)
);
const nativeDenoms = ChainList[0].keplrChain.currencies.map(
  (c) => c.coinMinimalDenom
);
const allTradeableDenoms = nativeDenoms.concat(ibcDenoms);

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
  tradeTokenInConfig: ObservableTradeTokenInConfig;
  tradeTokenIn: (
    slippage: Dec
  ) => Promise<"multiroute" | "multihop" | "exact-in">;
} {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const { logEvent } = useAmplitudeAnalytics();

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
        },
        new BestRouteTokenInRouter(
          [
            {
              name: "tfm",
              router: new TfmRemoteRouter(
                osmosisChainId,
                process.env.NEXT_PUBLIC_TFM_API_BASE_URL ??
                  "https://api.tfm.com"
              ),
            },
            {
              name: "sidecar",
              router: new OsmosisSidecarRemoteRouter(
                process.env.NEXT_PUBLIC_SIDECAR_BASE_URL ??
                  "http://157.230.101.80:9092"
              ),
            },
          ],
          undefined,
          (bestRouterName, bestRouteInMs) => {
            // TODO: send metrics of what route was used
            bestRouterName;
            bestRouteInMs;

            console.info(
              "Best route found",
              bestRouterName,
              bestRouteInMs.toFixed(2),
              "ms"
            );
            logEvent;
          }
        ),
        100
      )
  );
  // updates UI config on render to reflect latest values
  config.setChain(osmosisChainId);
  config.setSender(address);
  if (tokenDenoms) config.setSendableDenoms(tokenDenoms);
  else config.setSendableDenoms(allTradeableDenoms);

  // react dev tools will unmount the component so only dispose if
  // in production environment, where the component will only unmount once
  useEffect(
    () => () => {
      if (process.env.NODE_ENV === "production") {
        config.dispose();
      }
    },
    [config]
  );

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
    });

  return { tradeTokenInConfig: config, tradeTokenIn };
}
