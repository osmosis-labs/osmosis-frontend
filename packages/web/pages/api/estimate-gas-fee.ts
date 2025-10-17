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
    onlyDefaultFeeDenom?: boolean;
    gasMultiplier: number;
  };

  try {
    // Decode messages first
    const decodedMessages = messages.map((msg, i) => {
      try {
        return decodeAnyBase64(msg);
      } catch (error) {
        console.error(`Failed to decode message ${i}:`, error);
        throw error;
      }
    });

    // Apply temporary workaround for swap messages to prevent simulation failures
    // Instead of complex protobuf manipulation, we'll adjust the gas multiplier for swap transactions
    // to provide more tolerance during simulation
    // See: https://linear.app/osmosis/issue/FE-1170/investigate-500s-from-estimate-gas-fee

    const isSwapTransaction = decodedMessages.some((message) => {
      return (
        message.typeUrl &&
        (message.typeUrl.includes("MsgSwapExactAmount") ||
          message.typeUrl.includes("MsgSplitRouteSwapExactAmount"))
      );
    });

    // For swap transactions, use a more conservative gas multiplier
    const adjustedGasMultiplier = isSwapTransaction
      ? Math.max(gasMultiplier * 1.5, 2.0)
      : gasMultiplier;

    if (isSwapTransaction) {
      console.log(
        `Applying swap transaction workaround: increasing gas multiplier from ${gasMultiplier} to ${adjustedGasMultiplier}`
      );
    }

    const gasFee = await estimateGasFee({
      chainId,
      chainList: ChainList,
      bech32Address,
      body: {
        messages: decodedMessages,
        nonCriticalExtensionOptions:
          nonCriticalExtensionOptions?.map(decodeAnyBase64),
      },
      onlyDefaultFeeDenom,
      gasMultiplier: adjustedGasMultiplier,
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
      return res.status(500).json(error.data);
    }

    return res.status(500).json({ error: e instanceof Error ? e.message : e });
  }
}

// NOTE: `estimateGasFee` use of cosmjs-types makes it incompatible in edge runtime
// extend max duration to allow for more cache hits behind estimateGasFee
export const maxDuration = 300; // This function can run for a maximum of 300 seconds
