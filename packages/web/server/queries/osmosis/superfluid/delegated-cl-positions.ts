import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

import { ConcentratedPoolAccountPositionRecord } from "./types";

export interface AccountDelegatedClPositionsResponse {
  cl_pool_user_position_records: ConcentratedPoolAccountPositionRecord[];
}

export function queryDelegatedClPositions({
  bech32Address,
}: {
  bech32Address: string;
}): Promise<AccountDelegatedClPositionsResponse> {
  const url = new URL(
    `/osmosis/superfluid/v1beta1/account_delegated_cl_positions/${bech32Address}`,
    ChainList[0].apis.rest[0].address
  );
  return apiClient<AccountDelegatedClPositionsResponse>(url.toString());
}
