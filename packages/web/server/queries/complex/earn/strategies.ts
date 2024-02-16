import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { type Asset, getAsset } from "~/server/queries/complex/assets";
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

const earnStrategyBalanceCache = new LRUCache<string, CacheEntry>(
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
    cache: earnStrategyBalanceCache,
    ttl: 1000 * 60 * 5,
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
        return undefined;
      }
    },
  });
}
