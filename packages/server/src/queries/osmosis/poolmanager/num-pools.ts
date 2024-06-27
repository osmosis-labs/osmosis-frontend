import { createNodeQuery } from "../../create-node-query";

export type NumPoolsResponse = {
  num_pools: string;
};

export const queryNumPools = createNodeQuery<NumPoolsResponse>({
  path: "/osmosis/poolmanager/v1beta1/num_pools",
});
