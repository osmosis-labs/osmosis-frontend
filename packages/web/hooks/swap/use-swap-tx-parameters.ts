import { EncodeObject } from "@cosmjs/proto-signing";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import {
  makeSplitRoutesSwapExactAmountInMsg,
  makeSwapExactAmountInMsg,
} from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import { useCallback, useMemo } from "react";

import { useSwapAssets } from "~/hooks/swap/use-swap-assets";
import { useQueryRouterBestQuote } from "~/hooks/swap/use-swap-query-router-best-quote";
import { useStore } from "~/stores";

type Quote = ReturnType<typeof useQueryRouterBestQuote>["data"];
type TSwapAsset = ReturnType<typeof useSwapAssets>;

export type Pool = {
  id: string;
  tokenOutDenom: string;
};
export type Route = {
  pools: Pool[];
  tokenInAmount: string;
};

export const useSwapTxParameters = (
  quote: Quote,
  swapAssets: TSwapAsset,
  enable: boolean,
  address?: string,
  amount?: CoinPretty
) => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const getSwapTxParameters = useCallback(
    ({
      coinAmount,
      maxSlippage,
    }: {
      coinAmount: CoinPretty | undefined;
      maxSlippage: Dec;
    }) => {
      if (!quote) {
        throw new Error(
          "User input should be disabled if no route is found or is being generated"
        );
      }

      if (!coinAmount) throw new Error("No input");
      if (!address) throw new Error("No account");
      if (!swapAssets.fromAsset) throw new Error("No from asset");
      if (!swapAssets.toAsset) throw new Error("No to asset");

      /**
       * Prepare swap data
       */
      const routes: Route[] = [];

      for (const route of quote.split) {
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
        currency: swapAssets.fromAsset as Currency,
        amount: coinAmount.toCoin().amount,
      };

      /** Out amount with slippage included */
      const tokenOutMinAmount = quote.amount
        .toDec()
        .mul(
          DecUtils.getTenExponentNInPrecisionRange(
            swapAssets.toAsset.coinDecimals
          )
        )
        .mul(new Dec(1).sub(maxSlippage))
        .truncate()
        .toString();

      return {
        routes,
        tokenIn,
        tokenOutMinAmount,
      };
    },
    [quote, address, swapAssets]
  );

  const swapTxParameters = useMemo(() => {
    if (!address) return;
    if (!enable) return;
    let txParams: ReturnType<typeof getSwapTxParameters>;

    try {
      txParams = getSwapTxParameters({
        // TODO: @Amosel check the right value here...
        coinAmount: amount,
        maxSlippage: new Dec(0.95),
      });
    } catch {
      return;
    }

    const { routes, tokenIn, tokenOutMinAmount } = txParams;

    const { pools } = routes[0];

    if (routes.length < 1) {
      throw new Error("Routes are empty");
    }

    /**
     * Do not send transaction if there is an error since it will fail anyway.
     */
    const messages: EncodeObject[] = [
      routes.length === 1
        ? makeSwapExactAmountInMsg({
            pools,
            tokenIn,
            tokenOutMinAmount,
            userOsmoAddress: address,
          })
        : makeSplitRoutesSwapExactAmountInMsg({
            routes,
            tokenIn,
            tokenOutMinAmount,
            userOsmoAddress: address,
          }),
    ];

    return { messages, routes, tokenIn, tokenOutMinAmount };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSwapTxParameters, quote, amount, account, swapAssets]);

  return swapTxParameters;
};
