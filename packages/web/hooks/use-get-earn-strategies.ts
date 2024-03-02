import { Dec, PricePretty } from "@keplr-wallet/unit";
import { useMemo } from "react";

import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { getDailyApr } from "~/server/queries/complex/earn/strategies";
import type { EarnStrategy } from "~/server/queries/numia/earn";
import { api } from "~/utils/trpc";

const useGetEarnStrategies = (
  userOsmoAddress: string,
  isWalletConnected: boolean
) => {
  const {
    data: cmsStrategies,
    isLoading: areStrategiesLoading,
    isError,
    refetch,
  } = api.edge.earn.getStrategiesCMSData.useQuery(undefined, {
    trpc: { context: { skipBatch: true } },
  });

  const { data: holdenDenoms } =
    api.edge.assets.getUserAssetsBreakdown.useQuery(
      { userOsmoAddress },
      {
        trpc: { context: { skipBatch: true } },
        enabled: !!userOsmoAddress,
        select: (assetsBreakdown): string[] =>
          assetsBreakdown.available.map((coin) => coin.denom),
      }
    );

  const _strategies: EarnStrategy[] = useMemo(
    () =>
      (cmsStrategies ?? []).map((_strategy) => {
        const involvedDenoms = _strategy.depositAssets.map(
          (asset) => asset.coinDenom
        );
        return {
          ..._strategy,
          holdsTokens: involvedDenoms.every((involvedDenom) =>
            holdenDenoms?.includes(involvedDenom)
          ),
          balance: new PricePretty(DEFAULT_VS_CURRENCY, 0),
          tvl: undefined,
          apr: undefined,
        };
      }),
    [cmsStrategies, holdenDenoms]
  );

  const balanceQueries = api.useQueries((q) =>
    (isWalletConnected ? _strategies ?? [] : []).map((strat) =>
      q.edge.earn.getStrategyBalance(
        {
          strategyId: strat.id,
          userOsmoAddress,
        },
        {
          enabled: userOsmoAddress !== "",
          staleTime: 1000 * 60 * 15,
          cacheTime: 1000 * 60 * 30,
          trpc: { context: { skipBatch: true } },
        }
      )
    )
  );

  const aprQueries = api.useQueries((q) =>
    (_strategies ?? []).map((strat) =>
      q.edge.earn.getStrategyAPR(
        {
          strategyId: strat.id,
        },
        {
          staleTime: 1000 * 60 * 15,
          cacheTime: 1000 * 60 * 30,
          select: (data) => ({ ...data, strategyId: strat.id }),
          trpc: { context: { skipBatch: true } },
        }
      )
    )
  );

  const tvlQueries = api.useQueries((q) =>
    (_strategies ?? []).map((strat) =>
      q.edge.earn.getStrategyTVL(
        {
          strategyId: strat.id,
        },
        {
          staleTime: 1000 * 60 * 15,
          cacheTime: 1000 * 60 * 30,
          select: (data) => ({ ...data, strategyId: strat.id }),
          trpc: { context: { skipBatch: true } },
        }
      )
    )
  );

  const strategies: EarnStrategy[] = useMemo(
    () =>
      _strategies.map((strat) => {
        const tvlQuery = tvlQueries.find(
          (tvlQuery) => tvlQuery.data?.strategyId === strat.id
        );
        const aprQuery = aprQueries.find(
          (aprQuery) => aprQuery.data?.strategyId === strat.id
        );
        return {
          ...strat,
          tvl: tvlQuery?.data,
          apr: aprQuery?.data,
          daily: getDailyApr(aprQuery?.data?.apr),
          isLoadingTVL: tvlQuery?.isLoading,
          isLoadingAPR: aprQuery?.isLoading,
          isErrorTVL: tvlQuery?.isError,
          isErrorAPR: aprQuery?.isError,
        };
      }),
    [_strategies, aprQueries, tvlQueries]
  );

  const areBalancesLoading = useMemo(
    () => balanceQueries.some((q) => q.isLoading === true),
    [balanceQueries]
  );

  const additionalBalanceData = useMemo(() => {
    let accumulatedBalance = new PricePretty(DEFAULT_VS_CURRENCY, 0);
    let accumulatedUnclaimedRewards = new PricePretty(DEFAULT_VS_CURRENCY, 0);
    const unclaimedRewards: {
      provider: EarnStrategy["platform"];
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
        accumulatedBalance = accumulatedBalance.add(
          balanceQuery.data.balance.usd
        );

        if (
          balanceQuery.data.unclaimed_rewards.usd.toDec().gte(new Dec(0.01))
        ) {
          accumulatedUnclaimedRewards = accumulatedUnclaimedRewards.add(
            balanceQuery.data.unclaimed_rewards.usd
          );
          unclaimedRewards.push({
            id: balanceQuery.data.id,
            provider:
              earnStrategy?.platform ?? ("" as EarnStrategy["platform"]),
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
    ...additionalBalanceData,
    areBalancesLoading,
    areStrategiesLoading,
    isError,
    refetch,
  };
};

export default useGetEarnStrategies;
