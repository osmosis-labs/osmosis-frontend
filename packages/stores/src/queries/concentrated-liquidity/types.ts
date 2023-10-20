export type LiquidityNetInDirection = {
  liquidity_depths: {
    liquidity_net: string;
    tick_index: string;
  }[];
  current_tick: string;
  current_liquidity: string;
  current_sqrt_price: string;
};

export type LiquidityPerTickRange = {
  liquidity: {
    liquidity_amount: string;
    lower_tick: string;
    upper_tick: string;
  }[];
};

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

export type MergedLiquidityPositionData = {
  asset0: PositionAsset;
  asset1: PositionAsset;
  position: {
    address: string;
    join_time: string;
    liquidity: string;
    lower_tick: string;
    pool_id: string;
    position_id: string;
    upper_tick: string;
  };
};
