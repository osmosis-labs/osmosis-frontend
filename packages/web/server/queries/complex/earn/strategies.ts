import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { getAsset } from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import {
  EarnStrategy,
  EarnStrategyBalance,
  queryEarnStrategies,
  queryEarnUserBalance,
} from "~/server/queries/numia/earn";

const earnStrategiesCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

const earnStrategiesBalanceCache = new LRUCache<string, CacheEntry>(
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
          } = rawStrategy;

          const rewards = await Promise.all(
            rewardDenoms.map((reward) => getAsset({ anyDenom: reward.symbol }))
          );
          const token = await Promise.all(
            tokenDenoms.map((token) => getAsset({ anyDenom: token.symbol }))
          );

          const processedApy = new RatePretty(new Dec(apy));
          const processedTvl = new PricePretty(
            DEFAULT_VS_CURRENCY,
            new Dec(tvl)
          );

          aggregatedStrategies.push({
            id,
            name,
            category,
            provider,
            type,
            involvedTokens: token,
            rewardTokens: rewards,
            lockDuration,
            tvl: processedTvl,
            apy: processedApy,
            risk: 0,
            balance: 0,
            holdsTokens: false,
            hasLockingDuration: lockDuration > 0,
            tokensType: "stablecoins", // todo
          });
        }
        return aggregatedStrategies;
      } catch (error) {
        return [];
      }
    },
  });
}

export async function getStrategyBalance(
  strategyId: string,
  userOsmoAddress: string
) {
  return await cachified({
    cache: earnStrategiesBalanceCache,
    ttl: 1000 * 60 * 60,
    key: "earn-strategies-balance",
    getFreshValue: async (): Promise<EarnStrategyBalance | undefined> => {
      try {
        const earnIds = (await getEarnStrategies()).map(
          (strategies) => strategies.id
        );
        const queriedId = earnIds.find((id) => id === strategyId);

        if (!queriedId) return undefined;

        const { balance, strategy } = await queryEarnUserBalance(
          strategyId,
          userOsmoAddress
        );

        return {
          balance: {
            amount: balance.amount,
            usd: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(balance.usd)),
          },
          id: strategy,
        };
      } catch (error) {
        return undefined;
      }
    },
  });
}
