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
