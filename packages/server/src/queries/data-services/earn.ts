import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_BASE_URL } from "../../env";
import { Asset } from "../../queries/complex/assets";

export const EarnStrategyCategories = [
  "Staking",
  "Perp LP",
  "LP (Vault)",
] as const;

export type EarnStrategyType = (typeof EarnStrategyCategories)[number];

export const EarnStrategyProviders = [
  "Quasar",
  "Osmosis",
  "Stride",
  "Levana",
  "Cosmos SDK",
] as const;

export type EarnStrategyProvider = (typeof EarnStrategyProviders)[number];

export const EarnStrategyTypes = [
  "levana-pool-xlp",
  "levana-pool-lp",
  "quasar-cl-vault",
  "liquid-osmosis-staking",
  "osmosis-staking",
] as const;

export type EarnStrategyMethod = (typeof EarnStrategyTypes)[number];

export type EarnStrategyToken = {
  denom: string;
  symbol: string;
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

export interface RawStrategyAPR {
  apr: number;
}

export interface RawStrategyTVL {
  tvlUsd: string;
  maxTvlUsd?: string;
  assets: { coinMinimalDenom: string; tvl: string; maxTvl?: string }[];
}

export interface StrategyAnnualPercentages {
  apr?: RatePretty;
  apy?: RatePretty;
  strategyId?: string;
}

export interface StrategyTVL {
  tvlUsd?: PricePretty;
  maxTvlUsd?: PricePretty;
  assets: {
    coinMinimalDenom: string;
    tvl: PricePretty;
    maxTvl?: PricePretty;
  }[];
  strategyId?: string;
}

/**
 * Raw response data from the GitHub CMS.
 */
export interface RawStrategyCMSData {
  id: string;
  name: string;
  platform: string;
  type: EarnStrategyType;
  method: EarnStrategyMethod;
  link: string;
  contract: string;
  tvl: string;
  apr: string;
  geoblock: string;
  lockDuration: string;
  riskLevel: number;
  riskReportUrl: string;
  startDateTimeUtc: string;
  unlisted: boolean;
  disabled: boolean;
  message: string;
  depositDenoms: { coinMinimalDenom: string }[];
  positionDenoms: { coinMinimalDenom: string }[];
  rewardDenoms: { coinMinimalDenom: string }[];
  categories: string[];
}

export interface StategyCMSCategory {
  name: string;
  description: string;
  iconURL: string;
}

/**
 * Processed response data from the GitHub CMS.
 */
export interface StrategyCMSData {
  /**
   * Unique identifier for the strategy
   */
  id: string;
  /**
   * Display name for the strategy
   */
  name: string;
  /**
   * Platform providing the earn strategy.
   */
  platform: string;
  /**
   * Broad category classification for the strategy.
   *
   * The currently accepted 'categories' are:
   * - Lending: The assets are lent out to borrowers.
   * - Trading Vault: The assets are actively managed by a vault controller. The assets are under complete control of the agent, and can be traded, lent, staked, provided as liquidity, etc.
   * - Staking: The assets are locked into a crypto platfrom specifically for concensus.
   * - Liquid Staking: The assets are staked and an economically representative derivative asset is also minted.
   * - Perp LP: The assets provide liquidity for a perpetual futures contract market.
   * - LP: The assets provide liquidity for a liquidity pool.
   */
  type: EarnStrategyType;
  /**
   * Further classification of the strategy.
   */
  method: EarnStrategyMethod;
  /**
   * URL for user participation interface.
   */
  link: string;
  /**
   * Primary contract for the strategy
   */
  contract: string;
  /**
   * Duration assets are locked (ISO 8601).
   */
  lockDuration: string;
  /**
   * Risk level indicator (0 to 1).
   */
  riskLevel: number;
  /**
   * URL to risk report on Google Sheets.
   */
  riskReportUrl?: string;
  /**
   * Start date and time (UTC) of the strategy.
   */
  startDateTimeUtc: string;
  /**
   * Visibility status of the strategy.
   */
  unlisted: boolean;
  /**
   * Interaction status with the strategy.
   */
  disabled: boolean;
  /**
   * URL for querying APR
   */
  apr: string;
  /**
   * URL for querying TVL
   */
  tvl: string;
  /**
   * Link for geoblocking check
   */
  geoblock: string;
  /**
   * Important messaging related to the strategy.
   */
  message: string;
  /**
   * Array describing assets deposited for participation in the strategy.
   */
  depositAssets: Asset[];
  /**
   * Array describing assets representing a position in the strategy.
   */
  positionAssets: Asset[];
  /**
   * Array describing rewarded assets for participating in the strategy.
   */
  rewardAssets: Asset[];
  /**
   * Array of tags associated with the strategy.
   * The currently accepted tags are:
   *
   * - Stablecoin: indicating that the asset(s) required by the strategy is a stablecoin of a world fiat currency.
   * - Blue Chip: (top 50 mcap) indicating that one or more of the assets required for deposit in the strategy are of a high Market Capitalization--in this case, ranked among the top 50 on CoinGecko.
   * - Correlated: indicating that all assets that are deposited or represent the position would follow a similar price action due to having a common relative asset. For example:
   * - - USDC/USDT LP is correlated because both the USDC and USDT prices are meant to follow the same asset (i.e., U.S. Dollar), or
   * - - Liquid Staking strategies are also considered correlated, because the staked token and the LST are closely related, even though only the LST is accruing relative value. In contrast, dpeositing, say, ETH tokens to mint FRAX tokens is not correlated, because FRAX price follows USD--not ETH.
   */
  categories: string[];
  hasLockingDuration?: boolean;
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

export type TokensType = "stablecoins" | "correlated" | "bluechip";

export interface EarnStrategy extends Omit<StrategyCMSData, "tvl"> {
  balance: PricePretty;
  holdsTokens: boolean;
  daily?: RatePretty;
  tvl?: StrategyTVL;
  annualPercentages?: StrategyAnnualPercentages;
  aprUrl?: string;
  tvlUrl?: string;
  geoblocked?: boolean;
  isLoadingTVL?: boolean;
  isLoadingAPR?: boolean;
  isLoadingGeoblock?: boolean;
  isErrorTVL?: boolean;
  isErrorAPR?: boolean;
  isErrorGeoblock?: boolean;
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

export function queryStrategyAPR(url: string): Promise<RawStrategyAPR> {
  return apiClient(url.toString());
}

export function queryStrategyTVL(url: string): Promise<RawStrategyTVL> {
  return apiClient(url.toString());
}
