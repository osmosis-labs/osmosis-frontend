export type LiquidityNetInDirection = {
  liquidity_depths: {
    liquidity_net: string;
    tick_index: string;
  }[];
  current_tick: string;
  current_liquidity: string;
};

export type Head<T extends any[]> = T extends [...infer Head, any]
  ? Head
  : any[];
