import { Dec, Int } from "@keplr-wallet/unit";

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

export type PositionData = {
  address: string;
  joinTime: Date;
  liquidity: Dec;
  lowerTick: Int;
  poolId: string;
  positionId: string;
  upperTick: Int;
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
