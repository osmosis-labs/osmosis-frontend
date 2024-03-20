import {
  createTRPCRouter,
  publicProcedure,
  timeout,
} from "@osmosis-labs/server";
import { TRPCError } from "@trpc/server";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { z } from "zod";

import { IS_TESTNET } from "~/config/env";
import {
  AvailableBridges,
  BridgeManager,
} from "~/integrations/bridges/bridge-manager";
import { BridgeQuoteError } from "~/integrations/bridges/errors";
import {
  type BridgeQuote,
  getBridgeQuoteSchema,
} from "~/integrations/bridges/types";
import { Errors } from "~/server/api/errors";
import { ErrorTypes } from "~/utils/error-types";

const lruCache = new LRUCache<string, CacheEntry>({
  max: 500,
});

export const bridgeTransferRouter = createTRPCRouter({
  /**
   * Provide the quotes for a given bridge transfer. Elements are descending by total fiat value.
   * The first element is the best quote.
   */
  getQuotes: publicProcedure
    .input(getBridgeQuoteSchema)
    .query(async ({ input }) => {
      try {
        const bridgeManager = new BridgeManager(
          process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
          IS_TESTNET ? "testnet" : "mainnet",
          lruCache
        );

        interface BridgeQuoteInPromise {
          providerId: AvailableBridges;
          logoUrl: string;
          quote: BridgeQuote;
        }

        const bridges = Object.values(bridgeManager.bridges);
        const quotes = await Promise.allSettled(
          bridges.map(async (bridgeProvider) => {
            const quoteFn: () => Promise<BridgeQuoteInPromise> = () =>
              bridgeProvider.getQuote(input).then(
                (quote): BridgeQuoteInPromise => ({
                  providerId: bridgeProvider.providerName,
                  logoUrl: bridgeProvider.logoUrl,
                  quote,
                })
              );

            /** If the bridge takes longer than 10 seconds to respond, we should timeout that quote. */
            const twentySecondsInMs = 20 * 1000;
            return await timeout(quoteFn, twentySecondsInMs)();
          })
        );

        const successfulQuotes = quotes
          .filter(
            (
              quote,
              index
            ): quote is PromiseFulfilledResult<BridgeQuoteInPromise> => {
              if (quote.status === "rejected") {
                console.error(
                  `Quote for ${bridges[index].providerName} failed. Reason: `,
                  quote.reason
                );
                return false;
              }

              // If the quote is missing any of the required fields, we should ignore it.
              if (
                quote.value.quote.expectedOutput.fiatValue?.amount === undefined
              ) {
                return false;
              }

              return true;
            }
          )
          .sort((a, b) => {
            if (!a.value.quote.expectedOutput.fiatValue?.amount) {
              return 1;
            }

            if (!b.value.quote.expectedOutput?.fiatValue?.amount) {
              return 0;
            }

            const aTotalFiat = Number(
              a.value.quote.expectedOutput.fiatValue?.amount ?? 0
            );
            const bTotalFiat = Number(
              b.value.quote.expectedOutput.fiatValue?.amount ?? 0
            );

            /**
             * Move the quote with the highest total fiat value to the top of the list.
             */
            if (aTotalFiat < bTotalFiat) {
              return 1;
            }

            return -1;
          });

        if (!successfulQuotes.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No successful quotes found",
            cause: new Errors([
              {
                errorType: ErrorTypes.NoQuotesError,
                message: "No successful quotes found",
              },
            ]),
          });
        }

        return {
          quotes: successfulQuotes.map(
            ({ value: { quote, providerId, logoUrl } }) => ({
              provider: {
                id: providerId,
                logoUrl,
              },
              ...quote,
            })
          ),
        };
      } catch (e) {
        const error = e as BridgeQuoteError | Error | TRPCError | unknown;
        console.error(e);

        if (error instanceof BridgeQuoteError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Bridge quote error",
            cause: error.errors,
          });
        }

        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected Error",
            cause: [
              {
                error: ErrorTypes.UnexpectedError,
                message: error?.message ?? "Unexpected Error",
              },
            ],
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected Error",
          cause: [{ errorType: ErrorTypes.UnexpectedError }],
        });
      }
    }),

  /**
   * Provide the quote for a given bridge transfer.
   */
  getQuoteByBridge: publicProcedure
    .input(getBridgeQuoteSchema.extend({ bridge: z.string() }))
    .query(async ({ input }) => {
      try {
        const bridgeManager = new BridgeManager(
          process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
          IS_TESTNET ? "testnet" : "mainnet",
          lruCache
        );

        const bridgeProvider =
          bridgeManager.bridges[
            input.bridge as keyof typeof bridgeManager.bridges
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

        if (quote.expectedOutput.fiatValue?.amount === undefined) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid quote",
          });
        }

        return {
          quote: {
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
            cause: error.errors,
          });
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected Error",
            cause: new Errors([
              {
                errorType: ErrorTypes.UnexpectedError,
                message: error?.message ?? "Unexpected Error",
              },
            ]),
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected Error",
          cause: [{ errorType: ErrorTypes.UnexpectedError }],
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
        const bridgeManager = new BridgeManager(
          process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
          IS_TESTNET ? "testnet" : "mainnet",
          lruCache
        );

        const bridgeProvider =
          bridgeManager.bridges[
            input.bridge as keyof typeof bridgeManager.bridges
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
                errorType: ErrorTypes.UnexpectedError,
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
              errorType: ErrorTypes.UnexpectedError,
              message: "Unexpected Error",
            },
          ]),
        });
      }
    }),
});
