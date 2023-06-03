import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body as {
    tx_bytes: string;
    mode: string;
    restEndpoint: string;
  };

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

    const result: {
      tx_response: {
        height: string;
        txhash: string;
        codespace: string;
        code: number;
        data: string;
        raw_log: string;
        logs: unknown[];
        info: string;
        gas_wanted: string;
        gas_used: string;
        tx: unknown;
        timestamp: string;
        events: unknown[];
      };
    } = await response.json();

    res.status(200).json(result);
  } catch (e) {
    const error = e as { message?: string };
    res.status(500).json({
      error:
        error?.message ?? "An unexpected error occurred. Please try again.",
    });
  }
}
