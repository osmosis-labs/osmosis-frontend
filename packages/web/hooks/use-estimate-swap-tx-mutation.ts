import { EncodeObject } from "@cosmjs/proto-signing";
import { SignOptions } from "@cosmos-kit/core";
import { CosmosAccount } from "@osmosis-labs/keplr-stores";
import {
  AccountStore,
  AccountStoreWallet,
  ChainStore,
  CosmwasmAccount,
  OsmosisAccount,
  TxFee,
} from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import { useMutation } from "@tanstack/react-query";
import { isEqual } from "lodash";
import { useEffect, useRef } from "react";
import { type Optional } from "utility-types";

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
export function createEstimateSwapTxMessage(
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
  chainStore: ChainStore,
  accountStore: OsmoAccountStore,
  run: boolean
): EncodeObject | undefined {
  if (!run) return;
  // Validate and extract necessary data from the chainStore and accountStore
  const chainId = chainStore.osmosis.chainId;
  if (!chainId) return; // throw new Error("Chain ID is undefined.");
  const wallet = accountStore.getWallet(chainId);
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
export function useEstimateSwapTxFeesMutation(
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
  chainStore: ChainStore,
  accountStore: OsmoAccountStore,
  run: boolean
) {
  const timeoutRef = useRef<number>();
  const prevSwapMsg = useRef<EncodeObject | undefined>(); // Initialize the mutation for estimating transaction fees
  const mutation = useMutation(
    ({
      accountStore,
      wallet,
      messages,
      fee,
      memo,
      signOptions,
    }: EstimateSwapTxData) =>
      accountStore.estimateFee(wallet, messages, fee, memo, signOptions)
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
    if (
      !isEqual(msg, prevSwapMsg.current) ||
      (timeoutRef.current && Date.now() > timeoutRef.current)
    ) {
      prevSwapMsg.current = msg;
      mutation
        .mutateAsync({
          accountStore,
          wallet,
          fee: { amount: [] },
          memo: "estimate-fee",
          signOptions: wallet.walletInfo?.signOptions,
          messages: [msg],
        })
        .then((value) => {
          timeoutRef.current = Date.now() + TTL;
          return value;
        });
    }
  }, [
    accountStore,
    chainStore.osmosis.chainId,
    mutation,
    routes,
    run,
    tokenIn,
  ]);

  return mutation;
}
