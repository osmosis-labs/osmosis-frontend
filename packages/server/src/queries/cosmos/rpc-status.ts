import { apiClient } from "@osmosis-labs/utils";

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

export async function queryRPCStatus({
  restUrl,
}: {
  restUrl: string;
}): Promise<QueryStatusResponse> {
  const data = await apiClient<QueryStatusResponse | Status>(
    restUrl + "/status"
  );

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
