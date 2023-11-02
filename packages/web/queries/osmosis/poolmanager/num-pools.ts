import { apiClient } from "~/utils/api-client";

import { ChainList } from "../../../config/generated/chain-list";

export type NumPoolsResponse = {
  num_pools: string;
};

export async function queryNumPools(): Promise<NumPoolsResponse> {
  return await apiClient<NumPoolsResponse>(
    ChainList[0].apis.rest[0].address + `/osmosis/poolmanager/v1beta1/num_pools`
  );
}
