import { Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import {
  captureErrorAndReturn,
  createTRPCRouter,
  DEFAULT_VS_CURRENCY,
  getAssetPrice,
  publicProcedure,
  timeout,
} from "@osmosis-labs/server";
import { TRPCError } from "@trpc/server";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { z } from "zod";

import { IS_TESTNET } from "~/config/env";
import {
  BridgeCoin,
  BridgeError,
  BridgeProviders,
  BridgeQuoteError,
  Errors,
  getBridgeQuoteSchema,
} from "~/integrations/bridges";

const lruCache = new LRUCache<string, CacheEntry>({
  max: 500,
});

export const bridgeTransferRouter = createTRPCRouter({
  /**
   * Provide the quote for a given bridge transfer.
   */
  getQuoteByBridge: publicProcedure
    .input(getBridgeQuoteSchema.extend({ bridge: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const bridgeProviders = new BridgeProviders(
          process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
          IS_TESTNET ? "testnet" : "mainnet",
          lruCache
        );

        const bridgeProvider =
          bridgeProviders.bridges[
            input.bridge as keyof typeof bridgeProviders.bridges
          ];

        if (!bridgeProvider) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid bridge provider id",
          });
        }

        const quoteFn = () => bridgeProvider.getQuote(input);

        /** If the bridge takes longer than 10 seconds to respond, we should timeout that quote. */
        const twentySecondsInMs = 10 * 1000;
        const quote = await timeout(quoteFn, twentySecondsInMs)();

        // Get fiat value of:
        // 1. Expected output
        // 2. Transfer fee
        // 3. Estimated gas fee
        //
        // Getting the fiat value from quotes here
        // results in more accurate fiat prices
        // and fair competition amongst bridge providers.
        const [toAssetPrice, feeAssetPrice, gasFeeAssetPrice] =
          await Promise.all([
            getAssetPrice({
              ...ctx,
              asset: {
                coinDenom: input.toAsset.denom,
                coinMinimalDenom: input.toAsset.denom,
                sourceDenom: input.toAsset.sourceDenom,
              },
            }),
            getAssetPrice({
              ...ctx,
              asset: {
                coinDenom: quote.transferFee.denom,
                coinMinimalDenom: quote.transferFee.denom,
                sourceDenom: quote.transferFee.sourceDenom,
              },
            }).catch((e) => captureErrorAndReturn(e, undefined)),
            quote.estimatedGasFee
              ? getAssetPrice({
                  ...ctx,
                  asset: {
                    coinDenom: quote.estimatedGasFee.denom,
                    coinMinimalDenom: quote.estimatedGasFee.denom,
                    sourceDenom: quote.estimatedGasFee.sourceDenom,
                  },
                }).catch((e) => captureErrorAndReturn(e, undefined))
              : Promise.resolve(undefined),
          ]);

        if (!toAssetPrice) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid quote",
          });
        }

        /** Include decimals with decimal-included price. */
        // TODO: can move somewhere else
        const priceFromBridgeCoin = (coin: BridgeCoin, price: Dec) => {
          return new PricePretty(
            DEFAULT_VS_CURRENCY,
            new Dec(coin.amount)
              .quo(DecUtils.getTenExponentN(coin.decimals))
              .mul(price)
          );
        };

        return {
          quote: {
            provider: {
              id: bridgeProvider.providerName,
              logoUrl: bridgeProvider.logoUrl,
            },
            ...quote,
            input: {
              ...quote.input,
              fiatValue: priceFromBridgeCoin(quote.input, toAssetPrice),
            },
            expectedOutput: {
              ...quote.expectedOutput,
              fiatValue: priceFromBridgeCoin(
                quote.expectedOutput,
                // output is same token as input
                toAssetPrice
              ),
            },
            transferFee: {
              ...quote.transferFee,
              fiatValue: feeAssetPrice
                ? priceFromBridgeCoin(quote.transferFee, feeAssetPrice)
                : undefined,
            },
            estimatedGasFee: quote.estimatedGasFee
              ? {
                  ...quote.estimatedGasFee,
                  fiatValue:
                    gasFeeAssetPrice && quote.estimatedGasFee
                      ? priceFromBridgeCoin(
                          quote.estimatedGasFee,
                          gasFeeAssetPrice
                        )
                      : undefined,
                }
              : undefined,
          },
        };
      } catch (e) {
        const error = e as BridgeQuoteError | Error | unknown;
        console.error(e);

        if (error instanceof BridgeQuoteError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Bridge quote error",
            cause: error.errors,
          });
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected Error",
            cause: new Errors([
              {
                errorType: BridgeError.UnexpectedError,
                message: error?.message ?? "Unexpected Error",
              },
            ]),
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected Error",
          cause: [{ errorType: BridgeError.UnexpectedError }],
        });
      }
    }),

  /**
   * Provide the transfer request for a given bridge transfer.
   */
  getTransactionRequestByBridge: publicProcedure
    .input(getBridgeQuoteSchema.extend({ bridge: z.string() }))
    .query(async ({ input }) => {
      try {
        const bridgeProviders = new BridgeProviders(
          process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
          IS_TESTNET ? "testnet" : "mainnet",
          lruCache
        );

        const bridgeProvider =
          bridgeProviders.bridges[
            input.bridge as keyof typeof bridgeProviders.bridges
          ];

        if (!bridgeProvider) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid bridge provider id",
          });
        }

        const quote = await bridgeProvider.getTransactionData(input);

        return {
          transactionRequest: {
            provider: {
              id: bridgeProvider.providerName,
              logoUrl: bridgeProvider.logoUrl,
            },
            ...quote,
          },
        };
      } catch (e) {
        const error = e as BridgeQuoteError | Error | unknown;
        console.error(e);

        if (error instanceof BridgeQuoteError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Bridge quote error",
            cause: new Errors(error.errors),
          });
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected Error",
            cause: new Errors([
              {
                errorType: BridgeError.UnexpectedError,
                message: error?.message ?? "Unexpected Error",
              },
            ]),
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected Error",
          cause: new Errors([
            {
              errorType: BridgeError.UnexpectedError,
              message: "Unexpected Error",
            },
          ]),
        });
      }
    }),
});
