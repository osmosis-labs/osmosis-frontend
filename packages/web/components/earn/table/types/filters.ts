export type TokenHolder = "my" | "all";
export type RewardsTypes = "all" | "single" | "multi";
export type LockType = "all" | "lock" | "nolock";
export type StrategyButtonResponsibility =
  | "stablecoins"
  | "correlated"
  | "bluechip";

export type ListOption<T> = { value: T; label: string };
