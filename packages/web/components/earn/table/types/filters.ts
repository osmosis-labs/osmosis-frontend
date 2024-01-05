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
