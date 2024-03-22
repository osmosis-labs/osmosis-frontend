import { ChainList } from "~/config/generated/chain-list";

export default async function broadcastTransactionHandler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const body = await req.json();
  const isEndpointInChainConfig = ChainList.some(({ apis }) =>
    apis?.rest?.some(({ address }) => address.startsWith(body.restEndpoint))
  );

  if (!isEndpointInChainConfig) {
    return new Response(JSON.stringify({ error: "Invalid rest endpoint" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (
    !body.tx_bytes ||
    !body.mode ||
    typeof body.tx_bytes !== "string" ||
    typeof body.mode !== "string"
  ) {
    return new Response(JSON.stringify({ error: "Invalid tx_bytes or mode" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const response = await fetch(`${body.restEndpoint}/cosmos/tx/v1beta1/txs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_bytes: body.tx_bytes,
        mode: body.mode,
      }),
    });

    if (!response.ok) {
      throw new Error("Response is not ok");
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        message: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export const config = {
  runtime: "edge",
  regions: ["cdg1"], // Only execute this function in the Paris region
};
