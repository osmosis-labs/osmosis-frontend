import { apiClient } from "~/utils/api-client";

export type QueryStatusResponse = {
  jsonrpc: "2.0";
  id: number;
  result: {
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
};

export async function queryRPCStatus({
  restUrl,
}: {
  restUrl: string;
}): Promise<QueryStatusResponse> {
  return apiClient<QueryStatusResponse>(restUrl + "/status");
}
