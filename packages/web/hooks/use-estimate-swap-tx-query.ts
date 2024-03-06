import { EncodeObject } from "@cosmjs/proto-signing";
import { SignOptions } from "@cosmos-kit/core";
import { Dec, PricePretty } from "@keplr-wallet/unit";
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
import { isEqual } from "lodash";
import { useEffect, useRef, useState } from "react";
import { type Optional } from "utility-types";

import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

// Define a constant for the minimum token output amount, which could be made configurable
const TOKEN_OUT_MIN_AMOUNT = "20000"; // TODO: Consider making this value configurable
const TTL = 50 * 1000;

// Define a type for the Osmosis account store, combining multiple account types
export type OsmoAccountStore = AccountStore<
  [OsmosisAccount, CosmosAccount, CosmwasmAccount]
>;

interface EstimateSwapTxData {
  accountStore: OsmoAccountStore;
  wallet: AccountStoreWallet;
  messages: readonly EncodeObject[];
  fee: Optional<TxFee, "gas">;
  memo: string;
  signOptions?: SignOptions;
}

/**
 * createEstimateSwapTxMessage constructs the data necessary for estimating the fees associated with a swap transaction
 *
 * @param {Object} params - An object containing all necessary data for the transaction.
 * @param {Array} params.routes - The swap routes, detailing each pool involved and the token amounts.
 * @param {Object} params.tokenIn - Input currency and amount.
 * @param {ChainStore} params.chainStore - Provides access to chain-specific data, essential for transaction construction.
 * @param {OsmoAccountStore} params.accountStore - Manages interactions with blockchain accounts.
 * @returns {Promise} A msg object for the teransaction we want to simulate.
 */
export function createEstimateSwapTxMessage({
  routes,
  tokenIn,
  osmosisChainId,
  accountStore,
  run,
}: {
  routes: {
    pools: {
      id: string;
      tokenOutDenom: string;
    }[];
    tokenInAmount: string;
  }[];
  tokenIn: {
    currency: Currency;
    amount: string;
  };
  osmosisChainId: string;
  accountStore: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
  run: boolean; // <== keep this
}): EncodeObject | undefined {
  if (!run) return;
  // Validate and extract necessary data from the chainStore and accountStore
  const wallet = accountStore.getWallet(osmosisChainId);
  if (!wallet) return; // throw new Error(`No wallet found for chain ID: ${chainId}`);
  if (routes.length === 0) return; // throw new Error("No routes provided for transaction.");

  // Construct the transaction message based on the provided routes
  return routes.length === 1
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
}

/**
 * useEstimateSwapTxFeesMutation initializes and manages a mutation for estimating swap transaction fees.
 * It encapsulates the logic for creating transaction data, invoking the fee estimation process.
 * TODO: handle potential errors.
 * @returns {Object} React Query mutation object.
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
  const [message, setMessage] = useState<EncodeObject | undefined>();
  const query = useQuery({
    queryKey: ["simulate-swap-tx", message?.typeUrl, message?.value],
    queryFn: async ({ wallet, messages, fee, memo }: EstimateSwapTxData) => {
      const [{ amount }, osmoAssetWithPrice] = await Promise.all([
        accountStore.estimateFee(wallet, messages, fee, memo, {
          ...wallet.walletInfo?.signOptions,
          preferNoSetFee: true, // this will automatically calculate the amount as well.
        }),
        apiUtils.edge.assets.getMarketAsset.fetch({
          findMinDenomOrSymbol: "OSMO",
        }),
      ]);
      const coin = amount[0];
      if (!coin || !osmoAssetWithPrice?.currentPrice) return; // TODO: Handle this case

      const usdValue = new Dec(coin.amount).mul(
        osmoAssetWithPrice.currentPrice.toDec()
      );
      const gasUsdValueToPay = new PricePretty(DEFAULT_VS_CURRENCY, usdValue);

      return { gasUsdValueToPay }; // subtract this value from the token following the following formula:
      // max = (totalInAmountUSDValue - gasUsdValueToPay) / inAmountTokenUSDValue
      // half = max/2  <-- OK.
      // where is totalInAmountUSDValue and inAmountTokenUSDValue come from?

      // We alread have the totalInAmountToken which is the number we display in 'available' <-- not seeing that variable when I search vscode.
      // totalInAmountToken = swapState.inAmountInput?.balance in swap-tool
      // we have to compute the price of that with maybe `useCoinFiatValue`
      // inAmountTokenUSDValue is useCoinPrice(inAmountCurrency)
    },
    staleTime: 3_000, // 3 seconds
    cacheTime: 3_000, // 3 seconds
    enabled: !!message,
  });

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
      setMessage(msg);
      prevSwapMsg.current = msg;
    }
  }, [accountStore, chainStore.osmosis.chainId, routes, run, tokenIn]);

  return query;
}
