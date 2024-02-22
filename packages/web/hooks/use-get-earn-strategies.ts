import { PricePretty } from "@keplr-wallet/unit";
import { useMemo } from "react";

import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import type { EarnStrategy } from "~/server/queries/numia/earn";
import { api } from "~/utils/trpc";

const useGetEarnStrategies = (
  userOsmoAddress: string,
  isWalletConnected: boolean
) => {
  const {
    data: _strategies,
    isLoading: areStrategiesLoading,
    isError,
    refetch,
  } = api.edge.earn.getEarnStrategies.useQuery(undefined, {
    trpc: { context: { skipBatch: true } },
  });

  const { data: holdenDenoms } =
    api.edge.assets.getUserAssetsBreakdown.useQuery(
      { userOsmoAddress },
      {
        trpc: { context: { skipBatch: true } },
        enabled: !!userOsmoAddress,
        select: (assetsBreakdown): string[] =>
          assetsBreakdown.aggregated.map((coin) => coin.denom),
      }
    );

  const strategies: EarnStrategy[] = useMemo(
    () =>
      (_strategies ?? []).map((_strategy) => {
        const involvedDenoms = _strategy.involvedTokens.map(
          (asset) => asset.coinDenom
        );
        return {
          ..._strategy,
          holdsTokens: involvedDenoms.every((involvedDenom) =>
            holdenDenoms?.includes(involvedDenom)
          ),
        };
      }),
    [_strategies, holdenDenoms]
  );

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
    const unclaimedRewards: {
      provider: EarnStrategy["provider"];
      id: string;
    }[] = [];
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

        if (!balanceQuery.data.unclaimed_rewards.usd.toDec().isZero()) {
          unclaimedRewards.push({
            id: balanceQuery.data.id,
            provider:
              earnStrategy?.provider ?? ("" as EarnStrategy["provider"]),
          });
        }
      }
    });

    return {
      totalBalance: accumulatedBalance,
      myStrategies,
      totalUnclaimedRewards: accumulatedUnclaimedRewards,
      unclaimedRewards,
    };
  }, [balanceQueries, strategies]);

  return {
    strategies,
    ...additionalStrategiesData,
    areQueriesLoading,
    areStrategiesLoading,
    isError,
    refetch,
  };
};

export default useGetEarnStrategies;
