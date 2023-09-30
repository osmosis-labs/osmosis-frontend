import { GetBridgeQuoteParams } from "~/integrations/bridges/base";
import { searchParamsToDict } from "~/utils/url";

import { SquidBridgeProvider } from "../../../integrations/bridges/squid";

/**
 * Provided the best quote for a given bridge transfer.
 */
export default async function bestQuote(req: Request) {
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
    const squidProvider = new SquidBridgeProvider(integratorId);

    return new Response(
      JSON.stringify({
        status: await squidProvider.getQuote(quoteParams),
      })
    );
  } catch (e) {
    const error = e as { status?: number };
    return new Response(
      error?.status === 404 ? "Not Found" : "Unexpected Error",
      {
        status: error?.status || 500,
      }
    );
  }
}

export const config = {
  runtime: "experimental-edge",
  regions: ["cdg1"], // Only execute this function in the Paris region
};
