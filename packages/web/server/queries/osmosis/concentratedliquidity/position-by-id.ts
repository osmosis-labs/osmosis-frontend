// "/osmosis/concentratedliquidity/v1beta1"/positions/${bech32Address}?pagination.limit=10000

import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";
import { LiquidityPosition } from "~/server/queries/osmosis/concentratedliquidity/positions-by-address";

export function queryCLPosition({ id }: { id: string }): Promise<{
  position: LiquidityPosition;
}> {
  const url = new URL(
    `/osmosis/concentratedliquidity/v1beta1/position_by_id?position_id=${id}`,
    ChainList[0].apis.rest[0].address
  );

  return apiClient<{
    position: LiquidityPosition;
  }>(url.toString());
}
