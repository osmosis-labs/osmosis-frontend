import { createNodeQuery } from "../../../queries/base-utils";

export type NumPoolsResponse = {
  num_pools: string;
};

export const queryNumPools = createNodeQuery<NumPoolsResponse>({
  path: "/osmosis/poolmanager/v1beta1/num_pools",
});
