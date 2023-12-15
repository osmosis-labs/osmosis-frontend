import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { NextApiRequest, NextApiResponse } from "next";

import { IS_TESTNET } from "~/config/env";
import { BridgeManager } from "~/integrations/bridges/bridge-manager";
import { BridgeQuoteError } from "~/integrations/bridges/errors";
import {
  BridgeQuote,
  GetBridgeQuoteParams,
} from "~/integrations/bridges/types";
import timeout from "~/utils/async";
import { ErrorTypes } from "~/utils/error-types";
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
 * Provide the quote for a given bridge transfer.
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

  console.log("quoteByBridge: ", req.url);

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

    console.log("bridgeManager: ", bridgeManager);

    const bridgeProvider =
      bridgeManager.bridges[
        bridgeProviderId as keyof typeof bridgeManager.bridges
      ];

    console.log("bridgeProvider: ", bridgeProvider);

    if (!bridgeProvider) {
      return res.status(400).json({ error: "Invalid bridge provider id" });
    }

    const quoteFn = () => bridgeProvider.getQuote(quoteParams);

    /** If the bridge takes longer than 10 seconds to respond, we should timeout that quote. */
    const tenSecondsInMs = 10 * 1000;
    const quote = await timeout(quoteFn, tenSecondsInMs)();

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

    return res.status(500).json({
      errors: [{ errorType: ErrorTypes.UnexpectedError }],
    });
  }
}
