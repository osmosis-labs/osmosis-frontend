export type TokenHolder = "my" | "all";
export type StrategyMethod =
  | ""
  | "lp"
  | "perp_lp"
  | "vaults"
  | "lending"
  | "staking";

export type RewardsTypes = "all" | "single" | "multi";
export type StrategyButtonResponsibility =
  | "stablecoins"
  | "correlated"
  | "bluechip";

export const STRATEGY_METHODS = {
  "quasar-cl-vault": "Vault",
  "osmosis-staking": "Staking",
  "liquid-osmosis-staking": "Liquid Staking",
};

export const STRATEGY_PROVIDERS = {
  quasar: "Quasar",
  stride: "Stride",
  osmosis: "Osmosis",
};

export type ListOption<T> = { value: T; label: string };
