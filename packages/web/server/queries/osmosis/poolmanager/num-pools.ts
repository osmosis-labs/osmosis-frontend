import { apiClient } from "~/utils/api-client";

import { ChainInfos } from "../../../../config/generated/chain-infos";

export type NumPoolsResponse = {
  num_pools: string;
};

export async function queryNumPools(): Promise<NumPoolsResponse> {
  return await apiClient<NumPoolsResponse>(
    ChainInfos[0].rest + `osmosis/poolmanager/v1beta1/num_pools`
  );
}
