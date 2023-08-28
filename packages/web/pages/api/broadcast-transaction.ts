import { NextApiRequest, NextApiResponse } from "next";

import { ChainInfos } from "~/config";

/**
 * Broadcasts a transaction to the chain.
 *
 * We require this endpoint since many nodes do not have CORS enabled. Without CORS,
 * a node is unable to interact directly with browsers unless it's updated to incorporate
 * the CORS headers. Therefore, by having this endpoint, we can ensure that
 * users can still broadcast their transactions to the network.
 */
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

  const isEndpointInChainConfig = ChainInfos.some(({ apis }) =>
    apis?.rest?.some(({ address }) => address.startsWith(body.restEndpoint))
  );

  if (!isEndpointInChainConfig) {
    res.status(400).json({ error: "Invalid rest endpoint" });
    return;
  }

  if (
    !body.tx_bytes ||
    !body.mode ||
    typeof body.tx_bytes !== "string" ||
    typeof body.mode !== "string"
  ) {
    res.status(400).json({ error: "Invalid tx_bytes or mode" });
    return;
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
    res.status(500).json({
      message: "An unexpected error occurred. Please try again.",
    });
  }
}
