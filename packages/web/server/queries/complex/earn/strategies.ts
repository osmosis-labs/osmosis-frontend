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
} from "~/server/queries/numia/earn";

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

          const processedApy = new RatePretty(new Dec(apy));
          const processedTvl = new PricePretty(
            DEFAULT_VS_CURRENCY,
            new Dec(tvl)
          );

          // Calculation of daily %
          const currentYear = dayjs().year();
          const januaryFirst = dayjs(`${currentYear}-01-01`);
          const nextYearJanuaryFirst = dayjs(`${currentYear + 1}-01-01`);

          const totalDaysOfTheYear = nextYearJanuaryFirst.diff(
            januaryFirst,
            "day"
          );

          const processedDaily = new RatePretty(
            processedApy.quo(new Dec(totalDaysOfTheYear))
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
            tvl: processedTvl,
            apy: processedApy,
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
    getFreshValue: async () => {
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
    getFreshValue: async () => {
      try {
        const { tvl } = await queryStrategyTVL(strategyId);
        return {
          tvl: new PricePretty(DEFAULT_VS_CURRENCY, tvl),
        };
      } catch (error) {
        throw new Error("Error while fetching strategy TVL");
      }
    },
  });
}
