import { transactionScan } from "@osmosis-labs/server";

export default async function transactionScanHandler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const body = await req.json();

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
    const response = await transactionScan({
      chain: "osmosis",
      tx_bytes: body.tx_bytes,
      options: ["validation", "simulation"],
      metadata: {
        type: "in_app",
      },
    });

    if (!response.ok) {
      throw new Error("Response is empty");
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
        message: "An unexpected error occurred. Please try again. ",
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
