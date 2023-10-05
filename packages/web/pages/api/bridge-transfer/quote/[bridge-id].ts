import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  BridgeQuote,
  BridgeQuoteError,
  GetBridgeQuoteParams,
} from "~/integrations/bridges/base";
import { BridgeIdToBridgeProvider } from "~/integrations/bridges/utils";
import { searchParamsToDict } from "~/utils/url";

const lruCache = new LRUCache<string, CacheEntry>({
  max: 500,
});

export type BestQuoteResponse = {
  bestQuote: BridgeQuote & {
    providerId: string;
  };
};

/**
 * Provide the best quote for a given bridge transfer.
 */
export default async function bestQuote(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const quoteParams = searchParamsToDict<GetBridgeQuoteParams>(
    url.searchParams
  );
  const bridgeProviderId = url.pathname.split("/").slice(-1)[0];

  try {
    const BridgeClass =
      BridgeIdToBridgeProvider[
        bridgeProviderId as keyof typeof BridgeIdToBridgeProvider
      ];

    if (!BridgeClass) {
      return new Response("Invalid bridge provider id", { status: 400 });
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
      return new Response("Invalid bridge provider id", { status: 400 });
    }

    const quote = await bridgeProvider.getQuote(quoteParams);

    return new Response(
      JSON.stringify({
        bestQuote: {
          providerId: bridgeProvider.providerName,
          ...quote,
        },
      } as BestQuoteResponse)
    );
  } catch (e) {
    const error = e as BridgeQuoteError | unknown;

    if (error instanceof BridgeQuoteError) {
      return new Response(
        JSON.stringify({
          errors: error.errors,
        }),
        {
          status: 500,
        }
      );
    }

    return new Response("Unexpected Error", {
      status: 500,
    });
  }
}

export const config = {
  runtime: "experimental-edge",
  regions: ["cdg1"], // Only execute this function in the Paris region
};
