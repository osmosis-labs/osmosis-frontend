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
 * Supports both single endpoint (legacy) and multiple endpoints with automatic fallback.
 * When multiple RPC URLs are provided, will try each endpoint with retry logic before failing.
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
  params: { restUrl: string } | { rpcUrls: string[] }
): Promise<QueryStatusResponse> {
  let data: QueryStatusResponse | Status;

  // Check if using new multi-endpoint API
  if ("rpcUrls" in params) {
    const { rpcUrls } = params;

    if (!rpcUrls || rpcUrls.length === 0) {
      throw new Error("At least one RPC URL must be provided");
    }

    // Use multi-endpoint client for automatic retry and fallback
    const client = createMultiEndpointClient(
      rpcUrls.map((url) => ({ address: url })),
      {
        maxRetries: 3,
        timeout: 5000,
      }
    );

    data = await client.fetch<QueryStatusResponse | Status>("/status");
  } else {
    // Legacy single endpoint - backward compatible
    const { restUrl } = params;
    data = await apiClient<QueryStatusResponse | Status>(restUrl + "/status");
  }

  // some chains return a nonstandard response that does not include the jsonrpc field
  // but rather just the status object
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
