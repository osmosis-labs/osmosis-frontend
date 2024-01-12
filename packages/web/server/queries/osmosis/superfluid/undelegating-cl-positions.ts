import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

import { ConcentratedPoolAccountPositionRecord } from "./types";

interface SyntheticLock {
  duration: string;
  end_time: string;
  synth_denom: string;
  underlying_lock_id: string;
}

type AccountUndelegatingClPositionsResponse = {
  cl_pool_user_position_records: (ConcentratedPoolAccountPositionRecord & {
    synthetic_lock: SyntheticLock;
  })[];
};

export function queryUndelegatingClPositions({
  bech32Address,
}: {
  bech32Address: string;
}): Promise<AccountUndelegatingClPositionsResponse> {
  const url = new URL(
    `/osmosis/superfluid/v1beta1/account_undelegating_cl_positions/${bech32Address}`,
    ChainList[0].apis.rest[0].address
  );
  return apiClient<AccountUndelegatingClPositionsResponse>(url.toString());
}
