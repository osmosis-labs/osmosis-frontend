import { parseObjectValues } from "@osmosis-labs/utils";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { NextApiRequest, NextApiResponse } from "next";

import { IS_TESTNET } from "~/config";
import type { AvailableBridges } from "~/integrations/bridges/bridge-manager";
import { BridgeManager } from "~/integrations/bridges/bridge-manager";
import { BridgeQuoteError } from "~/integrations/bridges/errors";
import {
  BridgeQuote,
  GetBridgeQuoteParams,
} from "~/integrations/bridges/types";
import timeout from "~/utils/async";
import { ErrorTypes } from "~/utils/error-types";

const lruCache = new LRUCache<string, CacheEntry>({
  max: 500,
});

export type BestQuoteResponse = {
  quotes: (BridgeQuote & {
    provider: {
      id: AvailableBridges;
      logoUrl: string;
    };
  })[];
};

interface BridgeQuoteInPromise {
  providerId: string;
  logoUrl: string;
  quote: BridgeQuote;
}

/**
 * Provide the quotes for a given bridge transfer. Elements are descending by total fiat value.
 * The first element is the best quote.
 */
export default async function bridgeQuotes(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.url) {
    return res.status(400).json({
      errors: [
        {
          error: "Invalid request",
          message: "Invalid request",
        },
      ],
    });
  }

  const quoteStringParams = req.query as {
    fromAddress: string;
    fromAmount: string;
    fromAsset: string;
    fromChain: string;
    toAddress: string;
    toAsset: string;
    toChain: string;
  };

  const quoteParams =
    parseObjectValues<GetBridgeQuoteParams>(quoteStringParams);

  try {
    const bridgeManager = new BridgeManager(
      process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
      IS_TESTNET ? "testnet" : "mainnet",
      lruCache
    );

    const bridges = Object.values(bridgeManager.bridges);
    const quotes = await Promise.allSettled(
      bridges.map(async (bridgeProvider) => {
        const quoteFn: () => Promise<BridgeQuoteInPromise> = () =>
          bridgeProvider.getQuote(quoteParams).then(
            (quote): BridgeQuoteInPromise => ({
              providerId: bridgeProvider.providerName,
              logoUrl: bridgeProvider.logoUrl,
              quote,
            })
          );

        /** If the bridge takes longer than 10 seconds to respond, we should timeout that quote. */
        const tenSecondsInMs = 10 * 1000;
        return await timeout(quoteFn, tenSecondsInMs)();
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

          return true;
        }
      )
      .sort((a, b) => {
        if (
          !a.value.quote.transferFee.fiatValue?.amount &&
          !a.value.quote.estimatedGasFee?.fiatValue?.amount
        ) {
          return 1;
        }

        if (
          !b.value.quote.transferFee.fiatValue?.amount &&
          !b.value.quote.estimatedGasFee?.fiatValue?.amount
        ) {
          return 0;
        }

        const aTotalFiat =
          Number(a.value.quote.transferFee.fiatValue?.amount ?? 0) +
          Number(a.value.quote.estimatedGasFee?.fiatValue?.amount ?? 0);
        const bTotalFiat =
          Number(b.value.quote.transferFee.fiatValue?.amount ?? 0) +
          Number(b.value.quote.estimatedGasFee?.fiatValue?.amount ?? 0);

        /**
         * Move the quote with the lowest total fiat value to the top of the list.
         */
        if (aTotalFiat > bTotalFiat) {
          return 1;
        }

        return -1;
      });

    if (!successfulQuotes.length) {
      return res.status(400).json({
        errors: [
          {
            error: ErrorTypes.NoQuotesError,
            message: "No successful quotes found",
          },
        ],
      });
    }

    return res.status(200).json({
      quotes: successfulQuotes.map(
        ({ value: { quote, providerId, logoUrl } }) => ({
          provider: {
            id: providerId,
            logoUrl,
          },
          ...quote,
        })
      ),
    } as BestQuoteResponse);
  } catch (e) {
    const error = e as BridgeQuoteError | Error | unknown;
    console.error(e);

    if (error instanceof BridgeQuoteError) {
      return res.status(500).json({
        errors: error.errors,
      });
    }

    if (error instanceof Error) {
      return res.status(500).json({
        errors: [
          {
            error: ErrorTypes.UnexpectedError,
            message: error?.message ?? "Unexpected Error",
          },
        ],
      });
    }

    res.status(500).json({
      errors: [
        {
          error: ErrorTypes.UnexpectedError,
          message: "Unexpected Error",
        },
      ],
    });
  }
}
