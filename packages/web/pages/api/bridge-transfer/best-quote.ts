import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { NextApiRequest, NextApiResponse } from "next";

import { IS_TESTNET } from "~/config";
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
  bestQuote: BridgeQuote & {
    provider: {
      id: string;
      logoUrl: string;
    };
  };
};

/**
 * Provide the best quote for a given bridge transfer.
 */
export default async function bestQuote(
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
    const bridgeManager = new BridgeManager(
      process.env.SQUID_INTEGRATOR_ID!,
      IS_TESTNET ? "testnet" : "mainnet",
      lruCache
    );

    const quotes = await Promise.allSettled(
      Object.values(bridgeManager.bridges).map((bridgeProvider) =>
        bridgeProvider.getQuote(quoteParams).then((quote) => ({
          providerId: bridgeProvider.providerName,
          logoUrl: bridgeProvider.logoUrl,
          quote,
        }))
      )
    );

    if (quotes[0].status === "fulfilled") {
      const { quote, logoUrl, providerId } = quotes[0].value;
      res.status(200).json({
        bestQuote: {
          provider: {
            id: providerId,
            logoUrl,
          },
          ...quote,
        },
      } as BestQuoteResponse);
    }
  } catch (e) {
    const error = e as BridgeQuoteError | unknown;
    console.error(e);

    if (error instanceof BridgeQuoteError) {
      return res.status(500).json({
        errors: error.errors,
      });
    }

    res.status(500).json({
      error: "Unexpected Error",
    });
  }
}
