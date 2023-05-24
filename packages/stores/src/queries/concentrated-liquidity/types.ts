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
