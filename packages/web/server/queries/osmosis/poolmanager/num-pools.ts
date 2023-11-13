import { ChainList } from "~/config/generated/chain-list";
import { apiClient } from "~/utils/api-client";

export type NumPoolsResponse = {
  num_pools: string;
};

export async function queryNumPools(): Promise<NumPoolsResponse> {
  const url = new URL(
    "/osmosis/poolmanager/v1beta1/num_pools",
    ChainList[0].apis.rest[0].address
  );
  return await apiClient<NumPoolsResponse>(url.toString());
}
