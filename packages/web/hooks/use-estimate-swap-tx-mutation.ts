import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { CosmosAccount } from "@osmosis-labs/keplr-stores";
import {
  AccountStore,
  ChainStore,
  CosmwasmAccount,
  OsmosisAccount,
} from "@osmosis-labs/stores";
import { Currency } from "@osmosis-labs/types";
import { useMutation } from "@tanstack/react-query";

// Define a constant for the minimum token output amount, which could be made configurable
const TOKEN_OUT_MIN_AMOUNT = "20000"; // TODO: Consider making this value configurable

// Define a type for the Osmosis account store, combining multiple account types
export type OsmoAccountStore = AccountStore<
  [OsmosisAccount, CosmosAccount, CosmwasmAccount]
>;

/**
 * Function to create the necessary data for estimating transaction fees.
 *
 * This function takes a single parameter object containing all necessary data for the transaction,
 * constructs the transaction message, and then estimates the transaction fee using the account store.
 *
 * @param {Object} data - The complete data object required for estimating transaction fees.
 * @param {Object[]} data.routes - Array of swap routes, each including pools and tokenInAmount.
 * @param {Object} data.tokenIn - The token to be swapped, specified by currency and amount.
 * @param {Object} data.input - Details about the transaction input, including the amount and balance.
 * @param {ChainStore} data.chainStore - The ChainStore instance used for accessing chain-related data.
 * @param {OsmoAccountStore} data.accountStore - The AccountStore instance for account-related operations.
 * @returns {Promise} A promise that resolves to the estimated fee for the transaction.
 * @throws {Error} Throws an error if the chain ID is undefined, no wallet is found, or if input validation fails.
 */
export function createEstimateTx({
  routes,
  tokenIn,
  input,
  chainStore,
  accountStore,
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
  input: {
    amount: CoinPretty | undefined;
    balance: CoinPretty | undefined;
  };
  chainStore: ChainStore;
  accountStore: OsmoAccountStore;
}) {
  // Validate and extract necessary data from the chainStore and accountStore
  const chainId = chainStore.osmosis.chainId;
  if (!chainId) throw new Error("Chain ID is undefined.");
  const wallet = accountStore.getWallet(chainId);
  if (!wallet) throw new Error(`No wallet found for chain ID: ${chainId}`);
  if (routes.length === 0)
    throw new Error("No routes provided for transaction.");

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

  // Validate the input amount
  const amount = input.amount?.toDec();
  if (!amount || amount.lt(new Dec(0))) throw new Error("Invalid input amount");

  // Estimate and return the transaction fee
  return accountStore.estimateFee(
    wallet,
    [msg],
    { amount: [] },
    "estimate-fee",
    wallet.walletInfo?.signOptions
  );
}

/**
 * Custom React hook to estimate transaction fees using `@tanstack/react-query`.
 *
 * This hook initializes a mutation using react-query to estimate transaction fees based on provided transaction data.
 * It encapsulates the process of creating transaction data, submitting it for fee estimation, and handling errors.
 *
 * @returns {MutationResult} A mutation object from react-query that allows triggering the fee estimation process.
 */
export function useEstimateSwapTxFeesMutation() {
  // Initialize the mutation for estimating transaction fees
  return useMutation(
    (data: Parameters<typeof createEstimateTx>[0]) => createEstimateTx(data),
    {
      onError: (error: Error) => {
        // Log errors encountered during the fee estimation process
        console.error("Error estimating fee:", error.message);
      },
    }
  );
}
