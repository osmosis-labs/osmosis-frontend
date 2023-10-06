import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { NextApiRequest, NextApiResponse } from "next";

import {
  BridgeQuote,
  BridgeQuoteError,
  GetBridgeQuoteParams,
} from "~/integrations/bridges/types";
import { BridgeIdToBridgeProvider } from "~/integrations/bridges/utils";
import { parseObjectValues } from "~/utils/object";

const lruCache = new LRUCache<string, CacheEntry>({
  max: 500,
});

export type QuoteByBridgeResponse = {
  quote: BridgeQuote & {
    providerId: string;
  };
};

/**
 * Provide the best quote for a given bridge transfer.
 */
export default async function quoteByBridge(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.url) {
    return res.status(400).json({
      error: "Invalid request",
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
    const BridgeClass =
      BridgeIdToBridgeProvider[
        bridgeProviderId as keyof typeof BridgeIdToBridgeProvider
      ];

    if (!BridgeClass) {
      return res.status(400).json({ error: "Invalid bridge provider id" });
    }

    let bridgeProvider;
    if (BridgeClass.providerName === "Squid") {
      bridgeProvider = new BridgeClass(
        process.env.SQUID_INTEGRATOR_ID!,
        undefined,
        lruCache
      );
    }

    if (BridgeClass.providerName === "Axelar") {
      bridgeProvider = new BridgeClass(lruCache);
    }

    if (!bridgeProvider) {
      return res.status(400).json({ error: "Invalid bridge provider id" });
    }

    const quote = await bridgeProvider.getQuote(quoteParams);

    return res.status(200).json({
      quote: {
        providerId: bridgeProvider.providerName,
        ...quote,
      },
    } as QuoteByBridgeResponse);
  } catch (e) {
    const error = e as BridgeQuoteError | unknown;

    if (error instanceof BridgeQuoteError) {
      return res.status(500).json({
        errors: error.errors,
      });
    }

    return res.status(500).json({
      error: "Unexpected Error",
    });
  }
}
