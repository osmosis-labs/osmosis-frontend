import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { NextApiRequest, NextApiResponse } from "next";

import { IS_TESTNET } from "~/config";
import type { AvailableBridges } from "~/integrations/bridges/bridge-manager";
import { BridgeManager } from "~/integrations/bridges/bridge-manager";
import {
  BridgeQuote,
  BridgeQuoteError,
  GetBridgeQuoteParams,
} from "~/integrations/bridges/types";
import { parseObjectValues } from "~/utils/object";

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

  const { bridge: bridgeProviderId, ...quoteStringParams } = req.query as {
    fromAddress: string;
    fromAmount: string;
    fromAsset: string;
    fromChain: string;
    toAddress: string;
    toAsset: string;
    toChain: string;
    bridge: string;
  };

  const quoteParams =
    parseObjectValues<GetBridgeQuoteParams>(quoteStringParams);

  try {
    const bridgeManager = new BridgeManager(
      process.env.SQUID_INTEGRATOR_ID!,
      IS_TESTNET ? "testnet" : "mainnet",
      lruCache
    );

    const bridges = Object.values(bridgeManager.bridges);
    const quotes = await Promise.allSettled(
      bridges.map((bridgeProvider) =>
        bridgeProvider.getQuote(quoteParams).then(
          (quote): BridgeQuoteInPromise => ({
            providerId: bridgeProvider.providerName,
            logoUrl: bridgeProvider.logoUrl,
            quote,
          })
        )
      )
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

        return 0;
      });

    if (!successfulQuotes.length) {
      return res.status(500).json({
        errors: [
          {
            error: "Unexpected Error",
            message: "No successful quotes found",
          },
        ],
      });
    }

    res.status(200).json({
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
    const error = e as BridgeQuoteError | unknown;
    console.error(e);

    if (error instanceof BridgeQuoteError) {
      return res.status(500).json({
        errors: error.errors,
      });
    }

    res.status(500).json({
      errors: [
        {
          error: "Unexpected Error",
          message: "Unexpected Error",
        },
      ],
    });
  }
}
