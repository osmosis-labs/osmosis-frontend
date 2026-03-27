import { apiClient, createMultiEndpointClient } from "@osmosis-labs/utils";

export type Status = {
  node_info: {
    protocol_version: {
      p2p: string;
      block: string;
      app: string;
    };
    id: string;
    listen_addr: string;
    network: string;
    version: string;
    channels: string;
    moniker: string;
    other: {
      tx_index: "on" | "off";
      rpc_address: string;
    };
  };
  sync_info: {
    latest_block_hash: string;
    latest_app_hash: string;
    latest_block_height: string;
    latest_block_time: string;
    earliest_block_hash: string;
    earliest_app_hash: string;
    earliest_block_height: string;
    earliest_block_time: string;
    catching_up: boolean;
  };
  validator_info: {
    address: string;
    pub_key: {
      type: string;
      value: string;
    };
    voting_power: string;
  };
};

export type QueryStatusResponse = {
  jsonrpc: "2.0";
  id: number;
  result: Status;
};

/**
 * Query RPC status from a chain node.
 *
 * Supports both single endpoint (legacy) and multiple endpoints with hedged fallback.
 * When multiple RPC URLs are provided, requests are staggered across endpoints and
 * the first successful response wins.
 *
 * @param params - Either { restUrl: string } for single endpoint or { rpcUrls: string[] } for multi-endpoint
 * @returns The RPC status response
 *
 * @example
 * // Single endpoint (legacy, backward compatible)
 * const status = await queryRPCStatus({ restUrl: "https://rpc.osmosis.zone" });
 *
 * // Multiple endpoints with automatic fallback
 * const status = await queryRPCStatus({
 *   rpcUrls: [
 *     "https://rpc.osmosis.zone",
 *     "https://osmosis-rpc.polkachu.com",
 *     "https://rpc-osmosis.blockapsis.com"
 *   ]
 * });
 */
export async function queryRPCStatus(
  params:
    | { restUrl: string }
    | {
        rpcUrls: string[];
        /** Per-attempt timeout in ms (default 3000). */
        timeout?: number;
        /** Stagger delay between hedged requests in ms (default 1000). */
        hedgeDelay?: number;
        /** Total wall-clock budget in ms across all endpoints (default 8000). */
        maxTotalTime?: number;
      }
): Promise<QueryStatusResponse> {
  let data: QueryStatusResponse | Status;

  if ("rpcUrls" in params) {
    const {
      rpcUrls,
      timeout = 3000,
      hedgeDelay = 1000,
      maxTotalTime = 8000,
    } = params;

    if (!rpcUrls || rpcUrls.length === 0) {
      throw new Error("At least one RPC URL must be provided");
    }

    const client = createMultiEndpointClient(
      rpcUrls.map((url) => ({ address: url })),
      { timeout, hedgeDelay, maxTotalTime }
    );

    data = await client.fetch<QueryStatusResponse | Status>("/status");
  } else {
    const { restUrl } = params;
    data = await apiClient<QueryStatusResponse | Status>(restUrl + "/status");
  }

  if ("jsonrpc" in data) {
    return data as QueryStatusResponse;
  } else {
    return {
      jsonrpc: "2.0",
      id: 1,
      result: data as Status,
    };
  }
}
