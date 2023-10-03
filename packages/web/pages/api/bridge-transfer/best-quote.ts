import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  BridgeQuote,
  BridgeQuoteError,
  GetBridgeQuoteParams,
} from "~/integrations/bridges/base";
import { searchParamsToDict } from "~/utils/url";

import { SquidBridgeProvider } from "../../../integrations/bridges/squid";

const lruCache = new LRUCache<string, CacheEntry>({
  max: 500,
});

export type BestQuoteResponse = {
  bestQuote: BridgeQuote & {
    providerId: string;
  };
};

/**
 * Provided the best quote for a given bridge transfer.
 */
export default async function bestQuote(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const quoteParams = searchParamsToDict<GetBridgeQuoteParams>(
    url.searchParams
  );
  const integratorId = process.env.SQUID_INTEGRATOR_ID;

  if (!integratorId) {
    return new Response("SQUID_INTEGRATOR_ID is not set", {
      status: 500,
    });
  }

  try {
    const squidProvider = new SquidBridgeProvider(
      integratorId,
      undefined,
      lruCache
    );

    const quote = await squidProvider.getQuote(quoteParams);

    return new Response(
      JSON.stringify({
        bestQuote: {
          providerId: squidProvider.providerName,
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
