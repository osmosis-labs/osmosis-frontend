import { NextApiRequest, NextApiResponse } from "next";

import { ChainInfos } from "~/config";

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
    restEndpoint: string;
  };

  const isEndpointInChainConfig = ChainInfos.some(({ apis }) =>
    apis?.rest?.some(({ address }) => address.startsWith(body.restEndpoint))
  );

  if (!isEndpointInChainConfig) {
    res.status(400).json({ error: "Invalid rest endpoint" });
    return;
  }

  if (!body.tx_bytes || typeof body.tx_bytes !== "string") {
    res.status(400).json({ error: "Invalid tx_bytes" });
    return;
  }

  try {
    const response = await fetch(
      `${body.restEndpoint}/cosmos/tx/v1beta1/simulate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_bytes: body.tx_bytes,
        }),
      }
    );

    if (!response.ok) {
      const result = await response.json();

      if (result.message && result.code) {
        throw new SimulateTxError(result.message, result.code);
      }

      throw new Error("Response is not ok");
    }

    const result: {
      gas_info: {
        gas_used: string;
      };
    } = await response.json();

    res.status(200).json(result);
  } catch (e) {
    if (e instanceof SimulateTxError) {
      res.status(400).json({
        code: e.code,
        message: e.message,
      });
      return;
    }

    res.status(500).json({
      message: "An unexpected error occurred. Please try again.",
    });
  }
}
