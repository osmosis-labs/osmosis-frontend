export type LiquidityNetInDirection = {
  liquidity_depths: {
    liquidity_net: string;
    tick_index: string;
  }[];
  current_tick: string;
  current_liquidity: string;
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
  claimable_fees: {
    denom: string;
    amount: string;
  }[];
  claimable_incentives: {
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
