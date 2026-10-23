import {
  decodeAnyBase64,
  estimateGasFee,
  InsufficientFeeError,
  SimulateNotAvailableError,
} from "@osmosis-labs/tx";
import { ApiClientError } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";
import { readJsonBody } from "~/server/api-handlers/request-body";

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
export async function estimateGasFeeHandler(req: Request) {
  // requiring a post since body content is sent from client
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const parsed = await readJsonBody<{
    chainId: string;
    messages: { typeUrl: string; value: string }[];
    nonCriticalExtensionOptions?: { typeUrl: string; value: string }[];
    bech32Address: string;
    onlyDefaultFeeDenom?: boolean;
    gasMultiplier: number;
    fallbackGasLimit?: number;
  }>(req);
  if ("errorResponse" in parsed) return parsed.errorResponse;

  const {
    chainId,
    messages,
    nonCriticalExtensionOptions,
    bech32Address,
    onlyDefaultFeeDenom,
    gasMultiplier,
    fallbackGasLimit,
  } = parsed.body;

  try {
    const decodedMessages = messages.map(decodeAnyBase64);

    // Swap simulations under-estimate often enough to fail on chain, so give
    // them extra head-room. See FE-1170.
    const isSwapTransaction = decodedMessages.some(
      ({ typeUrl }) =>
        typeUrl?.includes("MsgSwapExactAmount") ||
        typeUrl?.includes("MsgSplitRouteSwapExactAmount")
    );
    const adjustedGasMultiplier = isSwapTransaction
      ? Math.max(gasMultiplier * 1.5, 2.0)
      : gasMultiplier;

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
      fallbackGasLimit,
    });
    return Response.json(gasFee);
  } catch (e) {
    // Insufficient fee balance is the user's account state, not a server
    // fault; the client reads `message` from these 400s.
    if (
      e instanceof SimulateNotAvailableError ||
      e instanceof InsufficientFeeError
    ) {
      return Response.json({ message: e.message }, { status: 400 });
    }

    // Forward the node's error body so the client can read its code.
    if (e instanceof ApiClientError && e.data?.code) {
      return Response.json(e.data, { status: 500 });
    }

    return Response.json(
      { error: e instanceof Error ? e.message : e },
      { status: 500 }
    );
  }
}
