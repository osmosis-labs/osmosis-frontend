export type TokenHolder = "my" | "all";
export type RewardsTypes = "all" | "single" | "multi";
export type StrategyButtonResponsibility =
  | "stablecoins"
  | "correlated"
  | "bluechip";

export const STRATEGY_METHODS = {
  "": "",
  "quasar-cl-vault": "Vault",
  "osmosis-staking": "Staking",
  "liquid-osmosis-staking": "Liquid Staking",
  "levana-pool-lp": "Liquidity Pool",
  "levana-pool-xlp": "xLP",
};

export const STRATEGY_PROVIDERS = {
  "": "",
  quasar: "Quasar",
  stride: "Stride",
  osmosis: "Osmosis",
  levana: "Levana",
};

export type StrategyMethods = keyof typeof STRATEGY_METHODS | "";
export type StrategyProviders = keyof typeof STRATEGY_PROVIDERS | "";

export type ListOption<T> = { value: T; label: string };
