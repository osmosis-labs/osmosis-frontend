import { PricePretty } from "@keplr-wallet/unit";
import { useMemo } from "react";

import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { EarnStrategy } from "~/server/queries/numia/earn";
import { api } from "~/utils/trpc";

const useGetEarnStrategies = (
  userOsmoAddress: string,
  isWalletConnected: boolean
) => {
  const {
    data: strategies,
    isLoading: areStrategiesLoading,
    isError,
  } = api.edge.earn.getEarnStrategies.useQuery(undefined, {
    trpc: { context: { skipBatch: true } },
  });

  const balanceQueries = api.useQueries((q) =>
    (isWalletConnected ? strategies ?? [] : []).map((strat) =>
      q.edge.earn.getStrategyBalance(
        {
          strategyId: strat.id,
          userOsmoAddress,
        },
        {
          enabled: userOsmoAddress !== "",
          staleTime: 1000 * 60 * 15,
          cacheTime: 1000 * 60 * 30,
        }
      )
    )
  );

  const areQueriesLoading = useMemo(
    () => balanceQueries.some((q) => q.isLoading === true),
    [balanceQueries]
  );

  const additionalStrategiesData = useMemo(() => {
    let accumulatedBalance = new PricePretty(DEFAULT_VS_CURRENCY, 0);
    let accumulatedUnclaimedRewards = new PricePretty(DEFAULT_VS_CURRENCY, 0);
    const myStrategies: EarnStrategy[] = [];

    balanceQueries.forEach((balanceQuery) => {
      if (!balanceQuery.data) return;
      if (!balanceQuery.data.balance.usd.toDec().isZero()) {
        const queriedStrategyId = balanceQuery.data.id;
        const earnStrategy = strategies?.find(
          (s) => s.id === queriedStrategyId
        );
        if (earnStrategy)
          myStrategies.push({
            ...earnStrategy,
            balance: balanceQuery.data.balance.usd,
          });
        accumulatedUnclaimedRewards = accumulatedUnclaimedRewards.add(
          balanceQuery.data.unclaimed_rewards.usd
        );
        accumulatedBalance = accumulatedBalance.add(
          balanceQuery.data.balance.usd
        );
      }
    });

    return {
      totalBalance: accumulatedBalance,
      myStrategies,
      totalUnclaimedRewards: accumulatedUnclaimedRewards,
    };
  }, [balanceQueries, strategies]);

  return {
    strategies,
    ...additionalStrategiesData,
    areQueriesLoading,
    areStrategiesLoading,
    isError,
  };
};

export default useGetEarnStrategies;
