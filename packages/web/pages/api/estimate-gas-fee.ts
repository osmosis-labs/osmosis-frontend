import {
  decodeAnyBase64,
  estimateGasFee,
  SimulateNotAvailableError,
} from "@osmosis-labs/tx";
import { ApiClientError } from "@osmosis-labs/utils";
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
    messages,
    nonCriticalExtensionOptions,
    bech32Address,
    onlyDefaultFeeDenom,
    gasMultiplier,
  } = req.body as {
    chainId: string;
    messages: { typeUrl: string; value: string }[];
    nonCriticalExtensionOptions?: { typeUrl: string; value: string }[];
    bech32Address: string;
    excludedFeeMinimalDenoms?: string[];
    onlyDefaultFeeDenom?: boolean;
    gasMultiplier: number;
  };

  try {
    const gasFee = await estimateGasFee({
      chainId,
      chainList: ChainList,
      bech32Address,
      body: {
        messages: messages.map(decodeAnyBase64),
        nonCriticalExtensionOptions:
          nonCriticalExtensionOptions?.map(decodeAnyBase64),
      },
      onlyDefaultFeeDenom,
      gasMultiplier,
    });
    return res.status(200).json(gasFee);
  } catch (e) {
    const error = e as Error | SimulateNotAvailableError | ApiClientError;
    if (error instanceof SimulateNotAvailableError) {
      return res.status(400).json({ message: error.message });
    }

    /**
     * It's a cosmos node error. Forward data as 200 to the client.
     */
    if (error instanceof ApiClientError && error.data?.code) {
      console.log("errorr!", error);
      return res.status(500).json(error.data);
    }

    return res.status(500).json({ error: e instanceof Error ? e.message : e });
  }
}

// NOTE: `estimateGasFee` use of cosmjs-types makes it incompatible in edge runtime
// extend max duration to allow for more cache hits behind estimateGasFee
export const maxDuration = 300; // This function can run for a maximum of 300 seconds
