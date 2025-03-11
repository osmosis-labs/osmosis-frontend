import { getSwapMessages, QuoteDirection } from "@osmosis-labs/tx";
import { MinimalAsset } from "@osmosis-labs/types";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";
import { useMemo } from "react";
import useAsync from "react-use/lib/useAsync";

import { useDeepMemo } from "~/hooks/use-deep-memo";
import { useWallets } from "~/hooks/use-wallets";
import { api, RouterInputs } from "~/utils/trpc";

const DefaultSlippage = "0.1";

/** Iterates over available and identical routers and sends input to each one individually.
 *  Results are reduced to best result by out amount.
 *  Also returns the number of routers that have fetched and errored. */
export function useQueryRouterBestQuote(
  input: Omit<
    RouterInputs["local"]["quoteRouter"]["routeTokenOutGivenIn"],
    "preferredRouter" | "tokenInDenom" | "tokenOutDenom" | "maxSlippage"
  > & {
    tokenIn:
      | (MinimalAsset &
          Partial<{
            amount: CoinPretty;
            usdValue: PricePretty;
          }>)
      | undefined;
    tokenOut:
      | (MinimalAsset &
          Partial<{
            amount: CoinPretty;
            usdValue: PricePretty;
          }>)
      | undefined;
    maxSlippage: Dec | undefined;
  },
  enabled: boolean,
  quoteType: QuoteDirection = "out-given-in"
) {
  const { currentWallet } = useWallets();

  // Memoize query options to prevent unnecessary re-renders
  const queryOptions = useMemo(
    () => ({
      // Disable retries, as useQueries
      // will block successfull quotes from being returned
      // if failed quotes are being returned
      // until retry starts returning false.
      // This causes slow UX even though there's a
      // quote that the user can use.
      retry: false,

      // prevent batching so that fast routers can
      // return requests faster than the slowest router
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }),
    []
  );

  // Memoize in-given-out query parameters
  const inGivenOutParams = useMemo(
    () => ({
      tokenOutAmount: input.tokenInAmount ?? "",
      tokenOutDenom: input.tokenOut?.coinMinimalDenom ?? "",
      tokenInDenom: input.tokenIn?.coinMinimalDenom ?? "",
      forcePoolId: input.forcePoolId,
    }),
    [
      input.tokenInAmount,
      input.tokenOut?.coinMinimalDenom,
      input.tokenIn?.coinMinimalDenom,
      input.forcePoolId,
    ]
  );

  // Memoize in-given-out query options
  const inGivenOutOptions = useMemo(
    () => ({
      ...queryOptions,
      enabled: enabled && quoteType === "in-given-out",

      // Longer refetch and cache times due to query inefficiencies. Can be removed once that is fixed.
      staleTime: 10_000,
      cacheTime: 10_000,
      refetchInterval: 10_000,
    }),
    [queryOptions, enabled, quoteType]
  );

  const inGivenOutQuote = api.local.quoteRouter.routeTokenInGivenOut.useQuery(
    inGivenOutParams,
    inGivenOutOptions
  );

  // Memoize out-given-in query parameters
  const outGivenInParams = useMemo(
    () => ({
      tokenInAmount: input.tokenInAmount,
      tokenInDenom: input.tokenIn?.coinMinimalDenom ?? "",
      tokenOutDenom: input.tokenOut?.coinMinimalDenom ?? "",
      forcePoolId: input.forcePoolId,
    }),
    [
      input.tokenInAmount,
      input.tokenIn?.coinMinimalDenom,
      input.tokenOut?.coinMinimalDenom,
      input.forcePoolId,
    ]
  );

  // Memoize out-given-in query options
  const outGivenInOptions = useMemo(
    () => ({
      ...queryOptions,
      enabled: enabled && quoteType === "out-given-in",
    }),
    [queryOptions, enabled, quoteType]
  );

  const outGivenInQuote = api.local.quoteRouter.routeTokenOutGivenIn.useQuery(
    outGivenInParams,
    outGivenInOptions
  );

  // Select the appropriate quote based on quote type
  const {
    data: quote,
    isSuccess,
    isError,
    error,
  } = useDeepMemo(() => {
    return quoteType === "out-given-in" ? outGivenInQuote : inGivenOutQuote;
  }, [quoteType, outGivenInQuote, inGivenOutQuote]);

  // Process the accepted quote
  const acceptedQuote = useDeepMemo(() => {
    if (
      !quote ||
      !input.tokenIn ||
      !input.tokenOut ||
      quote.amount.toDec().isZero()
    )
      return;
    return {
      ...quote,
      amountIn:
        quoteType === "out-given-in"
          ? new CoinPretty(input.tokenIn, input.tokenInAmount)
          : quote.amount,
      amountOut:
        quoteType === "out-given-in"
          ? quote.amount
          : new CoinPretty(input.tokenOut, input.tokenInAmount),
    };
  }, [quote, quoteType, input.tokenInAmount, input.tokenIn, input.tokenOut]);

  // Memoize the async parameters to prevent unnecessary recalculations
  const asyncParams = useMemo(
    () => ({
      tokenOutCoinDecimals: input.tokenOut?.coinDecimals,
      tokenInCoinMinimalDenom: input.tokenIn?.coinMinimalDenom,
      tokenInCoinDecimals: input.tokenIn?.coinDecimals,
      tokenOutCoinMinimalDenom: input.tokenOut?.coinMinimalDenom,
      address: currentWallet?.address,
      quote,
      maxSlippage: input.maxSlippage?.toString() ?? DefaultSlippage,
      coinAmount: input.tokenInAmount,
      quoteType,
    }),
    [
      input.tokenOut?.coinDecimals,
      input.tokenIn?.coinMinimalDenom,
      input.tokenIn?.coinDecimals,
      input.tokenOut?.coinMinimalDenom,
      currentWallet?.address,
      quote,
      input.maxSlippage,
      input.tokenInAmount,
      quoteType,
    ]
  );

  // Get swap messages
  const { value: messages } = useAsync(async () => {
    const {
      tokenOutCoinDecimals,
      tokenInCoinMinimalDenom,
      tokenInCoinDecimals,
      tokenOutCoinMinimalDenom,
      address,
      quote,
      maxSlippage,
      coinAmount,
      quoteType,
    } = asyncParams;

    if (
      !quote ||
      typeof tokenOutCoinDecimals === "undefined" ||
      !tokenInCoinMinimalDenom ||
      !tokenOutCoinMinimalDenom ||
      typeof tokenInCoinDecimals === "undefined" ||
      !address
    )
      return undefined;

    const messages = await getSwapMessages({
      quote,
      tokenOutCoinMinimalDenom,
      tokenInCoinDecimals: tokenInCoinDecimals!,
      tokenOutCoinDecimals: tokenOutCoinDecimals!,
      tokenInCoinMinimalDenom,
      maxSlippage,
      coinAmount,
      userOsmoAddress: address,
      quoteType,
    });

    return messages;
  }, [asyncParams]);

  // Combine quote data with messages
  const quoteData = useDeepMemo(
    () => (acceptedQuote ? { ...acceptedQuote, messages } : undefined),
    [acceptedQuote, messages]
  );

  // Return the final result
  return useMemo(
    () => ({
      data: quoteData,
      isLoading: !isSuccess,
      errorMsg: error?.message,
      numSucceeded: isSuccess ? 1 : 0,
      numError: isError ? 1 : 0,
    }),
    [quoteData, isSuccess, error?.message, isError]
  );
}
