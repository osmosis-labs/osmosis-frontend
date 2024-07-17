import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { AssetList, MinimalAsset } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  EarnStrategyBalance,
  queryEarnUserBalance,
  queryStrategyAPR,
  queryStrategyTVL,
  RawStrategyCMSData,
  RawStrategyTVL,
  StategyCMSCategory,
  StrategyAnnualPercentages,
  StrategyCMSData,
  StrategyTVL,
} from "../../../queries/data-services/earn";
import { queryOsmosisCMS } from "../../../queries/github";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { dayjs } from "../../../utils/dayjs";
import { captureIfError } from "../../../utils/error";
import { getAsset } from "../assets";
import { DEFAULT_VS_CURRENCY } from "../assets/config";
import { convertToPricePretty } from "../price";

const earnStrategyBalanceCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

const earnStrategyAnnualPercentagesCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

const earnStrategyTVLCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

const earnRawStrategyCMSDataCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);
export async function getStrategyBalance(
  strategyId: string,
  userOsmoAddress: string,
  rawBalanceUrl: string
) {
  const balanceUrl = rawBalanceUrl
    .replace("${id}", strategyId)
    .replace("${address}", userOsmoAddress);

  return await cachified({
    cache: earnStrategyBalanceCache,
    ttl: 1000 * 20,
    key: `earn-strategy-balance-${strategyId}-${userOsmoAddress}`,
    getFreshValue: async (): Promise<EarnStrategyBalance | undefined> => {
      try {
        const { balance, strategy, unclaimed_rewards } =
          await queryEarnUserBalance(balanceUrl);

        return {
          balance: {
            amount: balance.amount,
            usd: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(balance.usd)),
          },
          id: strategy,
          unclaimed_rewards: {
            usd: new PricePretty(
              DEFAULT_VS_CURRENCY,
              new Dec(unclaimed_rewards.total_usd)
            ),
          },
        };
      } catch (error) {
        throw new Error("Error while fetching strategy balance");
      }
    },
  });
}

export async function getStrategyAnnualPercentages(
  strategyId: string,
  rawAprUrl: string
) {
  const aprUrl = rawAprUrl.replace("${id}", strategyId);

  return await cachified({
    cache: earnStrategyAnnualPercentagesCache,
    ttl: 1000 * 20,
    key: `earn-strategy-annualPercentages-${aprUrl}`,
    getFreshValue: async (): Promise<StrategyAnnualPercentages> => {
      const { apr } = await queryStrategyAPR(aprUrl);
      return {
        apr: new RatePretty(apr),
        apy: new RatePretty(calculateAPY(apr)),
      };
    },
  });
}

export async function getStrategyTVL(strategyId: string, rawTvlUrl: string) {
  const tvlUrl = rawTvlUrl.replace("${id}", strategyId);

  return await cachified({
    cache: earnStrategyTVLCache,
    ttl: 1000 * 20,
    key: `earn-strategy-tvl-${tvlUrl}`,
    getFreshValue: async (): Promise<StrategyTVL> => {
      const rawTvl = await queryStrategyTVL(tvlUrl);
      return processTVL(rawTvl);
    },
  });
}

/**
 * Gets the (cached) strategies data from the CMS
 * @returns An array containing the strategies info from the CMS without TVL & APY, which needs to be calculated separately.
 */
export async function getStrategies({
  assetLists,
}: {
  assetLists: AssetList[];
}) {
  return await cachified({
    cache: earnRawStrategyCMSDataCache,
    ttl: 1000 * 60 * 30,
    key: "earn-strategy-cmsData",
    getFreshValue: async (): Promise<{
      riskReportUrl?: string;
      categories: StategyCMSCategory[];
      platforms: StategyCMSCategory[];
      strategies: StrategyCMSData[];
    }> => {
      try {
        const cmsData = await queryOsmosisCMS<{
          strategies: RawStrategyCMSData[];
          categories: StategyCMSCategory[];
          platforms: StategyCMSCategory[];
          riskReportUrl: string;
        }>({
          filePath: `cms/earn/strategies.json`,
        });

        const aggregatedStrategies: StrategyCMSData[] = [];

        for (const rawStrategy of cmsData.strategies) {
          const { depositDenoms, positionDenoms, rewardDenoms, lockDuration } =
            rawStrategy;

          const depositAssets = [];
          for (const token of depositDenoms) {
            const asset = captureIfError(() =>
              getAsset({ assetLists, anyDenom: token.coinMinimalDenom })
            );
            if (asset) depositAssets.push(asset);
          }

          const positionAssets = [];
          for (const token of positionDenoms) {
            const asset = captureIfError(() =>
              getAsset({ assetLists, anyDenom: token.coinMinimalDenom })
            );
            if (asset) positionAssets.push(asset);
          }

          const rewardAssets = [];
          for (const reward of rewardDenoms) {
            const asset = captureIfError(() =>
              getAsset({ assetLists, anyDenom: reward.coinMinimalDenom })
            );
            if (asset) rewardAssets.push(asset);
          }

          aggregatedStrategies.push({
            ...rawStrategy,
            depositAssets: depositAssets.filter(
              (deposit) => !!deposit
            ) as MinimalAsset[],
            positionAssets: positionAssets.filter(
              (position) => !!position
            ) as MinimalAsset[],
            rewardAssets: rewardAssets.filter(
              (reward) => !!reward
            ) as MinimalAsset[],
            hasLockingDuration:
              dayjs.duration(lockDuration).asMilliseconds() > 0,
          });
        }

        return {
          riskReportUrl: cmsData.riskReportUrl,
          categories: cmsData.categories,
          platforms: cmsData.platforms,
          strategies: aggregatedStrategies.filter((strat) => !strat.unlisted),
        };
      } catch (error) {
        throw new Error("Error while fetching strategy CMS data");
      }
    },
  });
}

/**
 * Calculation of daily %
 * @param apr The Annual Percentage Rate
 * @returns The daily income in percentage
 */
export function getDailyApr(apr?: RatePretty) {
  if (!apr) return undefined;

  const currentYear = dayjs().year();
  const januaryFirst = dayjs(`${currentYear}-01-01`);
  const nextYearJanuaryFirst = dayjs(`${currentYear + 1}-01-01`);

  const totalDaysOfTheYear = nextYearJanuaryFirst.diff(januaryFirst, "day");

  return new RatePretty(apr.quo(new Dec(totalDaysOfTheYear)));
}

/**
 * Converts a raw tvl object's values into PricePretty instances
 * @param rawTvl The raw strategy TVL
 * @returns The processed strategy TVL with PricePretty instances
 */
export function processTVL(rawTvl: RawStrategyTVL): StrategyTVL {
  const { tvlUsd, assets, maxTvlUsd } = rawTvl;
  return {
    tvlUsd: convertToPricePretty(tvlUsd),
    maxTvlUsd: maxTvlUsd ? convertToPricePretty(maxTvlUsd) : undefined,
    assets: assets.map(({ coinMinimalDenom, tvl, maxTvl }) => ({
      coinMinimalDenom,
      tvl: convertToPricePretty(tvl),
      maxTvl: maxTvl ? convertToPricePretty(maxTvl) : undefined,
    })),
  };
}

export function calculateAPY(apr: number): number {
  const dailyInterest = apr / 365;
  const apy = (1 + dailyInterest) ** 365 - 1;
  return apy;
}
