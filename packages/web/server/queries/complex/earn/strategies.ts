import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import dayjs from "dayjs";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { type Asset, getAsset } from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import {
  EarnStrategy,
  EarnStrategyBalance,
  queryEarnStrategies,
  queryEarnUserBalance,
  queryStrategyAPY,
  queryStrategyTVL,
  RawStrategyCMSData,
  RawStrategyTVL,
  StrategyAPY,
  StrategyCMSData,
  StrategyTVL,
} from "~/server/queries/numia/earn";
import { queryOsmosisCMS } from "~/server/queries/osmosis/cms";

const earnStrategiesCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

const earnStrategyBalanceCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

const earnStrategyAPYCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

const earnStrategyTVLCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

const earnRawStrategyCMSDataCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export async function getEarnStrategies() {
  return await cachified({
    cache: earnStrategiesCache,
    ttl: 1000 * 60 * 60,
    key: "earn-strategies",
    getFreshValue: async (): Promise<EarnStrategy[]> => {
      try {
        const strategies = await queryEarnStrategies();
        const aggregatedStrategies: EarnStrategy[] = [];

        for (let rawStrategy of strategies) {
          const {
            rewardDenoms,
            tokenDenoms,
            apy,
            tvl,
            id,
            category,
            lockDuration,
            name,
            provider,
            type,
            link,
          } = rawStrategy;

          const rewards = await Promise.all(
            rewardDenoms.map((reward) =>
              getAsset({ anyDenom: reward.symbol }).catch((_) => undefined)
            )
          );
          const token = await Promise.all(
            tokenDenoms.map((token) =>
              getAsset({ anyDenom: token.symbol }).catch((_) => undefined)
            )
          );

          const processedApr = new RatePretty(new Dec(apy));

          // Calculation of daily %
          const currentYear = dayjs().year();
          const januaryFirst = dayjs(`${currentYear}-01-01`);
          const nextYearJanuaryFirst = dayjs(`${currentYear + 1}-01-01`);

          const totalDaysOfTheYear = nextYearJanuaryFirst.diff(
            januaryFirst,
            "day"
          );

          const processedDaily = new RatePretty(
            processedApr.quo(new Dec(totalDaysOfTheYear))
          );

          aggregatedStrategies.push({
            id,
            name,
            category,
            provider,
            type,
            involvedTokens: token.filter((reward) => !!reward) as Asset[],
            rewardTokens: rewards.filter((reward) => !!reward) as Asset[],
            lockDuration,
            tvl: processTVL(tvl),
            apy: processedApr,
            risk: 0,
            balance: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)),
            hasLockingDuration: lockDuration > 0,
            tokensType: "stablecoins", // todo
            link,
            daily: processedDaily,
          });
        }
        return aggregatedStrategies;
      } catch (error) {
        throw new Error("Error while fetching strategies");
      }
    },
  });
}

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
        throw new Error("Error while fetching strategy balance");
      }
    },
  });
}

export async function getStrategyAPY(strategyId: string) {
  return await cachified({
    cache: earnStrategyAPYCache,
    ttl: 1000 * 20,
    key: `earn-strategy-apy-${strategyId}`,
    getFreshValue: async (): Promise<StrategyAPY> => {
      try {
        const { apy } = await queryStrategyAPY(strategyId);
        return {
          apy: new RatePretty(apy),
        };
      } catch (error) {
        throw new Error("Error while fetching strategy APY");
      }
    },
  });
}

export async function getStrategyTVL(strategyId: string) {
  return await cachified({
    cache: earnStrategyTVLCache,
    ttl: 1000 * 20,
    key: `earn-strategy-tvl-${strategyId}`,
    getFreshValue: async (): Promise<StrategyTVL> => {
      try {
        const rawTvl = await queryStrategyTVL(strategyId);
        return processTVL(rawTvl);
      } catch (error) {
        throw new Error("Error while fetching strategy TVL");
      }
    },
  });
}

/**
 * Gets the (cached) strategies data from the CMS
 * @returns An array containing the strategies info from the CMS without TVL & APY, which needs to be calculated separately.
 */
export async function getStrategiesCMSData() {
  return await cachified({
    cache: earnRawStrategyCMSDataCache,
    ttl: 1000 * 60 * 30,
    key: "earn-strategy-cmsData",
    getFreshValue: async (): Promise<StrategyCMSData[]> => {
      try {
        const cmsData = await queryOsmosisCMS<{
          strategies: RawStrategyCMSData[];
        }>({ filePath: `cms/earn/strategies.json` });

        const aggregatedStrategies: StrategyCMSData[] = [];

        for (let rawStrategy of cmsData.strategies) {
          const { depositDenoms, positionDenoms, rewardDenoms, lockDuration } =
            rawStrategy;

          const depositAssets = await Promise.all(
            depositDenoms.map((token) =>
              getAsset({ anyDenom: token.coinMinimalDenom }).catch(
                (_) => undefined
              )
            )
          );

          const positionAssets = await Promise.all(
            positionDenoms.map((token) =>
              getAsset({ anyDenom: token.coinMinimalDenom }).catch(
                (_) => undefined
              )
            )
          );

          const rewardAssets = await Promise.all(
            rewardDenoms.map((reward) =>
              getAsset({ anyDenom: reward.coinMinimalDenom }).catch(
                (_) => undefined
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
            hasLockingDuration: dayjs.duration(lockDuration).milliseconds() > 0,
          });
        }

        return aggregatedStrategies;
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
export function getDailyApr(apr: RatePretty) {
  const currentYear = dayjs().year();
  const januaryFirst = dayjs(`${currentYear}-01-01`);
  const nextYearJanuaryFirst = dayjs(`${currentYear + 1}-01-01`);

  const totalDaysOfTheYear = nextYearJanuaryFirst.diff(januaryFirst, "day");

  return new RatePretty(apr.quo(new Dec(totalDaysOfTheYear)));
}

/**
 * Converts a Dec or BigNumber to a PricePretty instance
 * @param value The value to convert
 * @returns A PricePretty instance representing the passed value
 */
export function convertToPricePretty(
  value:
    | Dec
    | {
        toDec(): Dec;
      }
    | bigInt.BigNumber
) {
  return new PricePretty(DEFAULT_VS_CURRENCY, value);
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
