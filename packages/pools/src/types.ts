export type PoolCommon = {
  taker_fee: string;
};

export type PoolMetricsRaw = {
  liquidityUsd: number;
  liquidity24hUsdChange: number;

  volume24hUsd: number;
  volume24hUsdChange: number;

  volume7dUsd: number;
};
