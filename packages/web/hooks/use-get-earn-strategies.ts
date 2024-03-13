import { Dec, PricePretty } from "@keplr-wallet/unit";
import { apiClient } from "@osmosis-labs/utils";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { LevanaGeoBlockedResponse } from "~/pages/_app";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { getDailyApr } from "~/server/queries/complex/earn/strategies";
import type { EarnStrategy } from "~/server/queries/numia/earn";
import { api } from "~/utils/trpc";

const useGetEarnStrategies = (
  userOsmoAddress: string,
  isWalletConnected: boolean
) => {
  const {
    data: cmsData,
    isLoading: areStrategiesLoading,
    isError,
    refetch,
  } = api.edge.earn.getStrategies.useQuery(undefined, {
    trpc: { context: { skipBatch: true } },
  });

  const {
    data: holdenDenoms,
    isLoading: isAssetsBreakdownLoading,
    isError: isAssetsBreakdownError,
  } = api.edge.assets.getUserAssetsBreakdown.useQuery(
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
      (cmsData?.strategies ?? []).map((_strategy) => {
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
          geoblocked: undefined,
        };
      }),
    [cmsData?.strategies, holdenDenoms]
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

  const annualPercentagesQueries = api.useQueries((q) =>
    (_strategies ?? []).map((strat) =>
      q.edge.earn.getStrategyAnnualPercentages(
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

  const geoblockQueries = useQueries({
    queries: (_strategies ?? []).map((strat) => ({
      queryKey: ["geoblocked", strat.geoblock, strat.id],
      queryFn: async () => {
        if (strat.geoblock === "") {
          return {
            response: undefined,
            id: strat.id,
          };
        }

        return {
          response: await apiClient<LevanaGeoBlockedResponse>(strat.geoblock),
          id: strat.id,
        };
      },
    })),
  });

  const strategies: EarnStrategy[] = useMemo(
    () =>
      _strategies.map((strat) => {
        const tvlQuery = tvlQueries.find(
          (tvlQuery) => tvlQuery.data?.strategyId === strat.id
        );
        const annualPercentagesQuery = annualPercentagesQueries.find(
          (annualPercentagesQuery) =>
            annualPercentagesQuery.data?.strategyId === strat.id
        );
        const geoblockQuery = geoblockQueries.find(
          (geoblockQuery) => geoblockQuery.data?.id === strat.id
        );

        return {
          ...strat,
          tvl: tvlQuery?.data,
          annualPercentages: annualPercentagesQuery?.data,
          daily: getDailyApr(annualPercentagesQuery?.data?.apr),
          geoblocked: geoblockQuery?.data?.response?.allowed === false,
          isLoadingTVL: tvlQuery?.isLoading,
          isLoadingAPR: annualPercentagesQuery?.isLoading,
          isErrorTVL: tvlQuery?.isError,
          isErrorAPR: annualPercentagesQuery?.isError,
          isLoadingGeoblock: geoblockQuery?.isLoading,
          isErrorGeoblock: geoblockQuery?.isError,
        };
      }),
    [_strategies, annualPercentagesQueries, geoblockQueries, tvlQueries]
  );

  const areBalancesLoading = useMemo(
    () => balanceQueries.some((q) => q.isLoading === true),
    [balanceQueries]
  );

  const additionalBalanceData = useMemo(() => {
    let accumulatedBalance = new PricePretty(DEFAULT_VS_CURRENCY, 0);
    let accumulatedUnclaimedRewards = new PricePretty(DEFAULT_VS_CURRENCY, 0);
    const unclaimedRewards: {
      platform: EarnStrategy["platform"];
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
            platform:
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
    isAssetsBreakdownLoading,
    isError,
    isAssetsBreakdownError,
    refetch,
  };
};

export default useGetEarnStrategies;
