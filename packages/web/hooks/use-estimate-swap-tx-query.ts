import { EncodeObject } from "@cosmjs/proto-signing";
import { Int, IntPretty, PricePretty } from "@keplr-wallet/unit";
import {
  AccountStore,
  AccountStoreWallet,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
  TxFee,
} from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import { useQuery } from "@tanstack/react-query";
import isEqual from "lodash-es/isEqual";
import { useEffect, useRef, useState } from "react";
import { type Optional } from "utility-types";

import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

// Define a constant for the minimum token output amount, which could be made configurable
const TOKEN_OUT_MIN_AMOUNT = "20000"; // TODO: Consider making this value configurable

// Define a type for the Osmosis account store, combining multiple account types
export type OsmoAccountStore = AccountStore<
  [OsmosisAccount, CosmosAccount, CosmwasmAccount]
>;

interface EstimateSwapTxData {
  wallet: AccountStoreWallet;
  messages: readonly EncodeObject[];
  fee: Optional<TxFee, "gas">;
  memo: string;
  inToken: string;
}

/**
 * useEstimateSwapTxFeesQuery initializes and manages a query for estimating swap transaction fees.
 * It encapsulates the logic for creating transaction data and invoking the fee estimation process.
 * TODO: handle potential errors.
 * @param routes - The swap routes, each containing an array of pools and the token input amount.
 * @param tokenIn - The input token, specifying the currency and amount.
 * @param run - Flag indicating whether to run the query or not.
 * @returns {Object} React Query query object.
 */
export function useEstimateSwapTxFeesQuery(
  routes: {
    pools: {
      id: string;
      tokenOutDenom: string;
    }[];
    tokenInAmount: string;
  }[],
  tokenIn: {
    currency: Currency;
    amount: string;
  },
  run: boolean
) {
  const { accountStore, chainStore } = useStore();
  const apiUtils = api.useUtils();

  const prevSwapMsg = useRef<EncodeObject | undefined>(); // Initialize the mutation for estimating transaction fees
  const [estimateFeeData, setEstimateFeeData] = useState<
    EstimateSwapTxData | undefined
  >();

  const query = useQuery(
    ["simulate-swap-tx", estimateFeeData?.messages[0]?.typeUrl || ""],
    async () => {
      const { wallet, messages, fee, memo, inToken } = estimateFeeData!;
      const [{ amount, gas }, inTokenAssetWithPrice] = await Promise.all([
        accountStore.estimateFee(wallet, messages, fee, memo, {
          ...wallet.walletInfo?.signOptions,
          preferNoSetFee: true, // this will automatically calculate the amount as well.
        }),
        apiUtils.edge.assets.getMarketAsset.fetch({
          findMinDenomOrSymbol: inToken,
        }),
      ]);

      const coinAmount = amount[0]?.amount;
      if (!coinAmount || !inTokenAssetWithPrice?.currentPrice) return; // TODO: Handle this case

      debugger;
      const gasInTokenAmount = new IntPretty(
        new Int(coinAmount)
      ).moveDecimalPointLeft(inTokenAssetWithPrice.coinDecimals);
      const priceInUsd =
        inTokenAssetWithPrice.currentPrice.mul(gasInTokenAmount);

      const gasUsdValueToPay = new PricePretty(DEFAULT_VS_CURRENCY, priceInUsd);
      return { gasUsdValueToPay, gasInTokenAmount, gas }; // subtract this value from the token following the following formula:
      // max = (totalInAmountUSDValue - gasUsdValueToPay) / inAmountTokenUSDValue

      // We alread have the totalInAmountToken which is the number we display in 'available'
      // totalInAmountToken = swapState.inAmountInput?.balance in swap-tool
      // we have to compute the price of that with maybe `useCoinFiatValue`
      // inAmountTokenUSDValue is useCoinPrice(inAmountCurrency)
    },
    {
      staleTime: 3_000, // 3 seconds
      cacheTime: 3_000, // 3 seconds
      enabled: !!estimateFeeData?.messages?.[0],
    }
  );

  useEffect(() => {
    if (!run) return;
    // Validate and extract necessary data from the chainStore and accountStore
    const chainId = chainStore.osmosis.chainId;
    if (!chainId) return;
    const wallet = accountStore.getWallet(chainId);
    if (!wallet) return;
    if (routes.length === 0) return;

    // Construct the transaction message based on the provided routes
    const msg =
      routes.length === 1
        ? wallet.osmosis.makeSwapExactAmountIn({
            pools: routes[0].pools,
            tokenIn,
            tokenOutMinAmount: TOKEN_OUT_MIN_AMOUNT,
          })
        : wallet.osmosis.makeSplitRoutesSwapExactAmountIn({
            routes,
            tokenIn,
            tokenOutMinAmount: TOKEN_OUT_MIN_AMOUNT,
          });

    // avoid repetition by checking equality between the current message and the previous one
    if (!isEqual(msg, prevSwapMsg.current)) {
      setEstimateFeeData({
        wallet,
        fee: { amount: [] },
        memo: "estimate-fee",
        messages: [msg],
        // todo @JoseRFelix should that be tokenIn.currency as unknown as string?
        inToken: "OSMO",
      });
      prevSwapMsg.current = msg;
    }
  }, [accountStore, chainStore.osmosis.chainId, routes, run, tokenIn]);

  return query;
}
