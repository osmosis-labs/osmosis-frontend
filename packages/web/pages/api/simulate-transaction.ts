import { ChainList } from "~/config/generated/chain-list";

class SimulateTxError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

/**
 * Broadcasts a transaction to the chain.
 *
 * We require this endpoint since many nodes do not have CORS enabled. Without CORS,
 * a node is unable to interact directly with browsers unless it's updated to incorporate
 * the CORS headers. Therefore, by having this endpoint, we can ensure that
 * users can still broadcast their transactions to the network, particularly on counterparty chains
 * when depositing.
 */
export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  const body = (await req.json()) as {
    tx_bytes: string;
    restEndpoint: string;
  };

  const restEndpoint = body.restEndpoint;
  const isEndpointInChainConfig = ChainList.some(({ apis }) =>
    apis?.rest?.some(({ address }) => address.startsWith(restEndpoint))
  );

  if (!isEndpointInChainConfig) {
    return new Response(JSON.stringify({ error: "Invalid rest endpoint" }), {
      status: 400,
    });
  }

  if (!body.tx_bytes || typeof body.tx_bytes !== "string") {
    return new Response(JSON.stringify({ error: "Invalid tx_bytes" }), {
      status: 400,
    });
  }

  try {
    const response = await fetch(`${restEndpoint}/cosmos/tx/v1beta1/simulate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_bytes: body.tx_bytes,
      }),
    });

    if (!response.ok) {
      const result = await response.json();

      if (result.message && result.code) {
        throw new SimulateTxError(result.message, result.code);
      }

      throw new Error("Response is not ok");
    }

    const result = await response.json();

    return new Response(JSON.stringify(result));
  } catch (e) {
    if (e instanceof SimulateTxError) {
      return new Response(
        JSON.stringify({
          code: e.code,
          message: e.message,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "An unexpected error occurred. Please try again.",
      }),
      { status: 500 }
    );
  }
}

export const config = {
  runtime: "edge",
};
