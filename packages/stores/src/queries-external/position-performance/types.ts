import { CoinPrimitive } from "@keplr-wallet/stores";

export type Asset = {
  denom: string;
  amount: number;
  value: number;
};

export type Position = {
  pool_id: number;
  position_id: number;
  lower_tick: number;
  upper_tick: number;
};

export type PrincipalAction = {
  action: string;
  address: string;
  tx_hash: string;
  block: number;
  tx_time: string;
  value: number;
  position: Position;
  assets: Asset[];
};

export type PositionPerformance = {
  total_spread_rewards: CoinPrimitive[];
  total_incentives_rewards: CoinPrimitive[];
  total_forfeit_rewards: CoinPrimitive[];
  principal: PrincipalAction;
};
