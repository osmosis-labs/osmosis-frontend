// "/osmosis/concentratedliquidity/v1beta1"/positions/${bech32Address}?pagination.limit=10000

import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

interface PositionAsset {
  amount: string;
  denom: string;
}

export interface LiquidityPosition {
  position: {
    position_id: string;
    address: string;
    join_time: string;
    liquidity: string;
    lower_tick: string;
    pool_id: string;
    upper_tick: string;
  };
  asset0: PositionAsset;
  asset1: PositionAsset;
  claimable_spread_rewards: {
    denom: string;
    amount: string;
  }[];
  claimable_incentives: {
    denom: string;
    amount: string;
  }[];
  forfeited_incentives: {
    denom: string;
    amount: string;
  }[];
}

interface AddressPositionsResponse {
  positions: LiquidityPosition[];
}

export function queryAddressCLPositions({
  bech32Address,
}: {
  bech32Address: string;
}): Promise<AddressPositionsResponse> {
  const url = new URL(
    `/osmosis/concentratedliquidity/v1beta1/positions/${bech32Address}`,
    ChainList[0].apis.rest[0].address
  );

  url.searchParams.append("pagination.limit", "10000");

  return apiClient<AddressPositionsResponse>(url.toString());
}
