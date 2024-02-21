import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import { apiClient } from "@osmosis-labs/utils";

import { Asset } from "~/server/queries/complex/assets";

import { NUMIA_BASE_URL } from ".";

export const EarnStrategyCategories = [
  "Perps Liquidity",
  "Staking",
  "Liquid Staking",
  "Managed Liquidity",
] as const;

export type EarnStrategyCategory = (typeof EarnStrategyCategories)[number];

export const EarnStrategyProviders = [
  "quasar",
  "osmosis",
  "stride",
  "levana",
] as const;

export type EarnStrategyProvider = (typeof EarnStrategyProviders)[number];

export const EarnStrategyTypes = [
  "levana-pool-xlp",
  "levana-pool-lp",
  "quasar-cl-vault",
  "liquid-osmosis-staking",
  "osmosis-staking",
] as const;

export type EarnStrategyType = (typeof EarnStrategyProviders)[number];

export type EarnStrategyToken = {
  denom: string;
  symbol: string;
};

export type RawEarnStrategy = {
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
  link: string;
};

export interface RawEarnStrategyBalance {
  strategy: string;
  balance: {
    amount: string;
    usd: number;
  };
  token?: {
    name: string;
    symbol: string;
    decimals: string;
    total_supply: string;
  };
  unclaimed_rewards: {
    total_usd: number;
  };
}

export interface EarnStrategyBalance {
  balance: {
    amount: string;
    usd: PricePretty;
  };
  id: string;
  unclaimed_rewards: {
    usd: PricePretty;
  };
}

export type tokensType = "stablecoins" | "correlated" | "bluechip";

export interface EarnStrategy {
  id: string;
  name: string;
  category: EarnStrategyCategory;
  provider: EarnStrategyProvider;
  type: EarnStrategyType;
  involvedTokens: Asset[];
  rewardTokens: Asset[];
  lockDuration: number;
  tvl: PricePretty;
  apy: RatePretty;
  risk: number;
  balance: PricePretty;
  holdsTokens?: boolean;
  hasLockingDuration: boolean;
  tokensType: tokensType;
  link: string;
}

/** Queries numia for a earn strategies list. */
export function queryEarnStrategies(): Promise<RawEarnStrategy[]> {
  const url = new URL("/earn/strategies", NUMIA_BASE_URL);
  return apiClient(url.toString());
}

export function queryEarnUserBalance(
  strategyId: string,
  userOsmoAddress: string
): Promise<RawEarnStrategyBalance> {
  const url = new URL(
    `/earn/strategies/${strategyId}/balance/${userOsmoAddress}`,
    NUMIA_BASE_URL
  );
  return apiClient(url.toString());
}
