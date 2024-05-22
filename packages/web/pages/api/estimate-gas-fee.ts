import { estimateGasFee, SimulateNotAvailableError } from "@osmosis-labs/tx";
import { Buffer } from "buffer/";
import { NextApiRequest, NextApiResponse } from "next";

import { ChainList } from "~/config/generated/chain-list";

/**
 * Estimate gas for a transaction by sending a simulation POST request to the chain.
 *
 * We require this endpoint since many nodes do not have CORS enabled. Without CORS,
 * a node is unable to interact directly with browsers unless it's updated to incorporate
 * the CORS headers. Therefore, by having this endpoint, we can ensure that
 * users can still broadcast their transactions to the network, particularly on counterparty chains
 * when depositing.
 *
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // requiring a post since body content is sent from client
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    chainId,
    protobufAnysBase64,
    bech32Address,
    excludedFeeMinimalDenoms,
  } = req.body as {
    chainId: string;
    protobufAnysBase64: { typeUrl: string; value: string }[];
    bech32Address: string;
    excludedFeeMinimalDenoms?: string[];
  };

  try {
    const gasFee = await estimateGasFee({
      chainId,
      chainList: ChainList,
      bech32Address,
      encodedMessages: protobufAnysBase64.map(({ typeUrl, value }) => ({
        typeUrl,
        value: Buffer.from(value, "base64"),
      })),
      excludedFeeDenoms: excludedFeeMinimalDenoms,
    });
    return res.status(200).json(gasFee);
  } catch (e) {
    if (e instanceof SimulateNotAvailableError) {
      return res.status(400).json({ message: e.message });
    }

    return res.status(500).json({ error: e instanceof Error ? e.message : e });
  }
}

// NOTE: `estimateGasFee` use of cosmjs-types makes it incompatible in edge runtime
