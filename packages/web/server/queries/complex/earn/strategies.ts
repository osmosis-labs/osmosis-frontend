import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import dayjs from "dayjs";
import { LRUCache } from "lru-cache";

import { type Asset, getAsset } from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { convertToPricePretty } from "~/server/queries/complex/price";
import {
  EarnStrategyBalance,
  queryEarnUserBalance,
  queryStrategyAPR,
  queryStrategyTVL,
  RawStrategyCMSData,
  RawStrategyTVL,
  StrategyAnnualPercentages,
  StrategyCMSData,
  StrategyTVL,
} from "~/server/queries/numia/earn";
import { queryOsmosisCMS } from "~/server/queries/osmosis/cms";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

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
  userOsmoAddress: string
) {
  return await cachified({
    cache: earnStrategyBalanceCache,
    ttl: 1000 * 20,
    key: `earn-strategy-balance-${strategyId}-${userOsmoAddress}`,
    getFreshValue: async (): Promise<EarnStrategyBalance | undefined> => {
      try {
        const { balance, strategy, unclaimed_rewards } =
          await queryEarnUserBalance(strategyId, userOsmoAddress);

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
        throw new Error("Error while fetching strategy balance", {
          cause: error as Error,
        });
      }
    },
  });
}

export async function getStrategyAnnualPercentages(aprUrl: string) {
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

export async function getStrategyTVL(tvlUrl: string) {
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
export async function getStrategies() {
  return await cachified({
    cache: earnRawStrategyCMSDataCache,
    ttl: 1000 * 60 * 30,
    key: "earn-strategy-cmsData",
    getFreshValue: async (): Promise<{
      riskReportUrl?: string;
      strategies: StrategyCMSData[];
    }> => {
      try {
        const cmsData = await queryOsmosisCMS<{
          strategies: RawStrategyCMSData[];
          riskReportUrl: string;
        }>({ filePath: `cms/earn/strategies.json` });

        const aggregatedStrategies: StrategyCMSData[] = [];

        for (let rawStrategy of cmsData.strategies) {
          const { depositDenoms, positionDenoms, rewardDenoms, lockDuration } =
            rawStrategy;

          const depositAssets = await Promise.all(
            depositDenoms.map((token) =>
              getAsset({ anyDenom: token.coinMinimalDenom }).catch(
                console.error
              )
            )
          );

          const positionAssets = await Promise.all(
            positionDenoms.map((token) =>
              getAsset({ anyDenom: token.coinMinimalDenom }).catch(
                console.error
              )
            )
          );

          const rewardAssets = await Promise.all(
            rewardDenoms.map((reward) =>
              getAsset({ anyDenom: reward.coinMinimalDenom }).catch(
                console.error
              )
            )
          );

          aggregatedStrategies.push({
            ...rawStrategy,
            depositAssets: depositAssets.filter(
              (deposit) => !!deposit
            ) as Asset[],
            positionAssets: positionAssets.filter(
              (position) => !!position
            ) as Asset[],
            rewardAssets: rewardAssets.filter((reward) => !!reward) as Asset[],
            hasLockingDuration:
              dayjs.duration(lockDuration).asMilliseconds() > 0,
          });
        }

        return {
          riskReportUrl: cmsData.riskReportUrl,
          strategies: aggregatedStrategies.filter((strat) => !strat.unlisted),
        };
      } catch (error) {
        throw new Error("Error while fetching strategy CMS data", {
          cause: error as Error,
        });
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
