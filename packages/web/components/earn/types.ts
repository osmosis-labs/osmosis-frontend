export type TokenHolder = "my" | "all";
export type StrategyMethod =
  | "All"
  | "LP"
  | "Perp LP"
  | "Vaults"
  | "Lending"
  | "Staking";
export type Platform =
  | "All"
  | "Quasar"
  | "Osmosis DEX"
  | "Levana"
  | "Mars"
  | "Osmosis";
export type RewardsTypes = "all" | "single" | "multi";
export type StrategyButtonResponsibility =
  | "stablecoins"
  | "correlated"
  | "bluechip";

export type ListOption<T> = { name: T; id: number };
