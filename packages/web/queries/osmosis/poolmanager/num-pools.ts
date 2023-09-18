import { ChainInfos } from "~/config";
import { queryNode } from "~/queries/utils";

export type NumPoolsResponse = {
  num_pools: string;
};

export async function queryNumPools(): Promise<NumPoolsResponse> {
  return await queryNode(
    ChainInfos[0].rest,
    `osmosis/poolmanager/v1beta1/num_pools`
  );
}
