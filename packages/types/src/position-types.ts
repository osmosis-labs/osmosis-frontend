export type PositionAsset = {
  amount: string;
  denom: string;
};

export type LiquidityPosition = {
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
};
