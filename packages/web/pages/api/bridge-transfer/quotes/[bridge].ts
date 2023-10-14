import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { NextApiRequest, NextApiResponse } from "next";

import { IS_TESTNET } from "~/config";
import { BridgeManager } from "~/integrations/bridges/bridge-manager";
import { BridgeQuoteError } from "~/integrations/bridges/errors";
import {
  BridgeQuote,
  GetBridgeQuoteParams,
} from "~/integrations/bridges/types";
import { parseObjectValues } from "~/utils/object";

const lruCache = new LRUCache<string, CacheEntry>({
  max: 500,
});

export type QuoteByBridgeResponse = {
  quote: BridgeQuote & {
    provider: {
      id: string;
      logoUrl: string;
    };
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
    const bridgeManager = new BridgeManager(
      process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
      IS_TESTNET ? "testnet" : "mainnet",
      lruCache
    );

    const bridgeProvider =
      bridgeManager.bridges[
        bridgeProviderId as keyof typeof bridgeManager.bridges
      ];

    if (!bridgeProvider) {
      return res.status(400).json({ error: "Invalid bridge provider id" });
    }

    const quote = await bridgeProvider.getQuote(quoteParams);

    return res.status(200).json({
      quote: {
        provider: {
          id: bridgeProvider.providerName,
          logoUrl: bridgeProvider.logoUrl,
        },
        ...quote,
      },
    } as QuoteByBridgeResponse);
  } catch (e) {
    const error = e as BridgeQuoteError | unknown;
    console.error(e);

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
