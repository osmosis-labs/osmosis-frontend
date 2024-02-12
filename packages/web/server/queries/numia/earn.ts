import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_BASE_URL } from ".";

export const EarnStrategyCategories = [
  "LP",
  "staking",
  "liquid-staking",
] as const;

export type EarnStrategyCategory = (typeof EarnStrategyCategories)[number];

export const EarnStrategyProviders = ["quasar", "osmosis", "strider"] as const;

export type EarnStrategyProvider = (typeof EarnStrategyProviders)[number];

export const EarnStrategyTypes = [
  "quasar-cl-vault",
  "liquid-osmosis-staking",
  "osmosis-staking",
] as const;

export type EarnStrategyType = (typeof EarnStrategyProviders)[number];

export type EarnStrategyToken = {
  denom: string;
  symbol: string;
};

export type EarnStrategy = {
  /**
   * A unique identifier to the element, with some elements it has reference to the contract address but for example for a native pool it is the pool ID
   */
  id: string;
  name: string;
  category: EarnStrategyCategory;
  provider: EarnStrategyProvider;
  type: EarnStrategyType;
  lockDuration: number;
  tvl: number;
  apy: number;
  tokenDenoms: EarnStrategyToken[];
  rewardDenoms: EarnStrategyToken[];
};

/** Queries numia for a earn strategies list. */
export function queryEarnStrategies(): Promise<EarnStrategy[]> {
  const url = new URL("/earn/strategies", NUMIA_BASE_URL);
  return apiClient(url.toString());
}
