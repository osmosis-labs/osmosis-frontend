export type TokenHolder = "my" | "all";
export type StrategyMethod =
  | ""
  | "lp"
  | "perp_lp"
  | "vaults"
  | "lending"
  | "staking";
export type Platform =
  | ""
  | "quasar"
  | "osmosis_dex"
  | "levana"
  | "mars"
  | "osmosis";
export type RewardsTypes = "all" | "single" | "multi";
export type StrategyButtonResponsibility =
  | "stablecoins"
  | "correlated"
  | "bluechip";

export type ListOption<T> = { value: T; label: string };

export interface Strategy {
  involvedTokens: string[]; // Tokens[]
  strategyMethod: {
    displayName: string;
    id: string;
  }; // status?
  platform: {
    displayName: string;
    id: string;
  }; // Chain,
  strategyName: string;
  tvl: {
    value: number;
    fluctuation: number;
  };
  apy: number;
  daily: number;
  reward: string[]; // Coin[],
  lock: number; // or Date,
  risk: number; // 1, 2 or 3 ??
  actions: {
    externalURL?: string;
    onClick?: () => void;
  };
  balance: {
    quantity: number;
    converted: string; // $ / € ...
  };
}
