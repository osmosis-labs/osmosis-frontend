// "/osmosis/concentratedliquidity/v1beta1"/positions/${bech32Address}?pagination.limit=10000

import { createNodeQuery } from "../../../queries/base-utils";

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

export const queryAccountPositions = createNodeQuery<
  AddressPositionsResponse,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/osmosis/concentratedliquidity/v1beta1/positions/${bech32Address}?pagination.limit=10000`,
});
