import type { AssetVariant } from "@osmosis-labs/server";
import { getSwapMessages, type QuoteOutGivenIn } from "@osmosis-labs/tx";
import { Dec } from "@osmosis-labs/unit";
import { useCallback, useMemo } from "react";

import { EventName } from "~/config";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { useCoinFiatValue } from "./queries/assets/use-coin-fiat-value";
import { useAmplitudeAnalytics } from "./use-amplitude-analytics";

/**
 * Hook to convert a variant asset to its canonical form.
 *
 * Takes either an AssetVariant object directly or a coin minimal denom string.
 * If a string is provided, the variant will be looked up from the user's portfolio assets.
 *
 * NOTE: wrap with observer to so account store can be accessed.
 */
export function useConvertVariant(
  givenVariantOrCoinMinimalDenom?: AssetVariant | string,
  enabled = true
) {
  const { accountStore } = useStore();
  const { logEvent } = useAmplitudeAnalytics();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const transactionIdentifier = "convertVariant";

  // If the variant is not provided, we will fetch from user's list of variants
  const {
    data: portfolioAssetsData,
    isError: isPortfolioAssetsError,
    isLoading: isPortfolioAssetsLoading,
  } = api.local.portfolio.getPortfolioAssets.useQuery(
    {
      address: account?.address ?? "",
    },
    {
      enabled:
        enabled &&
        !!account?.address &&
        typeof givenVariantOrCoinMinimalDenom === "string" &&
        Boolean(givenVariantOrCoinMinimalDenom),
    }
  );

  const variant = useMemo(() => {
    if (typeof givenVariantOrCoinMinimalDenom !== "string")
      return givenVariantOrCoinMinimalDenom;

    return portfolioAssetsData?.assetVariants.find(
      (variant) =>
        variant.amount.currency.coinMinimalDenom ===
        givenVariantOrCoinMinimalDenom
    );
  }, [givenVariantOrCoinMinimalDenom, portfolioAssetsData]);

  const variantTransactionIdentifier = `${transactionIdentifier}-${variant?.amount.currency.coinMinimalDenom}`;

  const {
    data: quote,
    isError: isQuoteError,
    isLoading: isQuoteLoading,
  } = api.local.quoteRouter.routeTokenOutGivenIn.useQuery(
    {
      tokenInDenom: variant?.amount.currency.coinMinimalDenom ?? "",
      tokenInAmount: variant?.amount.toCoin().amount ?? "",
      tokenOutDenom: variant?.canonicalAsset?.coinMinimalDenom ?? "",
    },
    {
      enabled:
        enabled &&
        variant &&
        !!variant.amount.currency.coinMinimalDenom &&
        !!variant.canonicalAsset?.coinMinimalDenom,
    }
  );

  /** Resolves when conversion is successfully committed on chain (not just broadcasted). Rejects with an error message if something goes wrong. */
  const onConvert = useCallback(
    () =>
      new Promise<void>(async (resolve, reject) => {
        if (!variant) {
          console.error(
            "Cannot convert variant, no variant for given minimal denom"
          );
          return reject("No variant for given minimal denom");
        }

        if (!account?.address) {
          console.error("Cannot convert variant, no account address");
          return reject("No account address");
        }
        if (!quote) {
          console.error("Cannot convert variant, no quote");
          return reject("No quote");
        }

        const messages = await getConvertVariantMessages(
          variant,
          quote,
          account.address
        ).catch((e) => (e instanceof Error ? e.message : "Unknown error"));
        if (!messages || typeof messages === "string") {
          console.error(
            "Cannot convert variant, problem getting messages for transaction",
            messages
          );
          return reject(messages);
        }

        accountStore
          .signAndBroadcast(
            accountStore.osmosisChainId,
            variantTransactionIdentifier,
            messages,
            undefined,
            undefined,
            undefined,
            {
              onFulfill: (tx) => {
                if (tx.code) return reject(tx.code);
                logEvent([
                  EventName.ConvertVariants.completeFlow,
                  {
                    fromToken: variant.amount.currency.coinDenom,
                    toToken: variant.canonicalAsset.coinDenom,
                    valueUsd: Number(variant.fiatValue.toDec().toString()),
                  },
                ]);
                resolve();
              },
              onBroadcastFailed: reject,
            }
          )
          .catch((e) => {
            console.error("Error broadcasting convert variant tx", e);
            reject(e);
          });
      }),
    [
      variant,
      account?.address,
      quote,
      accountStore,
      variantTransactionIdentifier,
      logEvent,
    ]
  );

  const { fiatValue: feeFiatValue } = useCoinFiatValue(quote?.feeAmount);

  // Check for large difference in amount of in v out
  const isLargeAmountDiff = useMemo(() => {
    const inAmount = variant?.amount.toDec();
    const outAmount = quote?.amount.toDec();
    return checkLargeAmountDiff(inAmount, outAmount);
  }, [variant, quote?.amount]);

  return {
    onConvert,
    quote,
    convertFee: feeFiatValue,
    variant,
    isLoading: isQuoteLoading || isPortfolioAssetsLoading,
    isError: isLargeAmountDiff || isQuoteError || isPortfolioAssetsError,
    /** Is any conversion in progress. */
    isConvertingVariant: Boolean(
      account?.txTypeInProgress.startsWith(transactionIdentifier)
    ),
    /** Is this specific variant conversion in progress. */
    isConvertingThisVariant:
      account?.txTypeInProgress === variantTransactionIdentifier,
  };
}

/**
 * Converts a variant asset to its canonical form by creating a swap message.
 *
 * @param variant - The asset variant to convert, containing source and destination asset details
 * @param quote - The swap quote containing route and pricing information
 * @param amount - The amount of the source asset to convert
 * @param address - The user's Osmosis address
 * @returns Promise resolving to swap messages, or undefined if conversion not possible
 * @throws Error if token denoms are missing or no quote is found
 */
export async function getConvertVariantMessages(
  variant: AssetVariant,
  quote: QuoteOutGivenIn,
  address: string
) {
  const tokenInDenom = variant.amount.currency.coinMinimalDenom;
  const tokenOutDenom = variant.canonicalAsset?.coinMinimalDenom;
  const amount = variant.amount.toCoin().amount;

  if (!tokenInDenom || !tokenOutDenom) {
    throw new Error("Missing token denoms");
  }
  if (!quote) {
    throw new Error("No quote found");
  }

  // if it's an alloy, or CW pool, let's assume it's a 1:1 swap
  // so, let's remove slippage to convert more of the asset
  const isAlloyPoolSwap =
    quote.split.length === 1 &&
    quote.split[0].pools.length === 0 &&
    quote.split[0].pools[0].type.startsWith("cosmwasm");

  return await getSwapMessages({
    coinAmount: amount,
    maxSlippage: isAlloyPoolSwap ? "0" : "0.05",
    quote,
    tokenInCoinMinimalDenom: tokenInDenom,
    tokenOutCoinMinimalDenom: tokenOutDenom,
    tokenOutCoinDecimals: variant.canonicalAsset?.coinDecimals ?? 0,
    tokenInCoinDecimals: variant.amount.currency?.coinDecimals ?? 0,
    userOsmoAddress: address,
  });
}

/**
 * Checks if there is a large difference between input and output amounts
 * Returns true if output amount is less than 95% of input amount
 */
export function checkLargeAmountDiff(inAmount?: Dec, outAmount?: Dec): boolean {
  if (!inAmount || !outAmount || inAmount.isZero()) return false;
  // Out amount should be 95% or more of the input amount
  return outAmount.quo(inAmount).lt(new Dec("0.95"));
}
