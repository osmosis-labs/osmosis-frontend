import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PoolCard } from "../../components/cards";
import { Overview } from "../../components/overview";
import { LeftTime } from "../../components/left-time";
import { Table, PoolTable, ColumnDef, RowDef } from "../../components/table";

import { PoolCompositionCell } from "../../components/table/cells";
import { SearchBox } from "../../components/input";
import {
  MenuOption,
  MenuToggle,
  PageList,
  SortMenu,
} from "../../components/control";
import {
  useFilteredData,
  useSortedData,
  usePaginatedData,
} from "../../hooks/data";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { useEffect, useMemo, useState } from "react";
import { ObservablePool } from "@osmosis-labs/stores";
import { ExtraGaugeInPool } from "../../config";
import { useAllPoolsTable } from "../../hooks/use-all-pools-table";
import { useExternalIncentivizedPoolsTable } from "../../hooks/use-external-incentivized-pools-table";
import { AllPoolsTableSet } from "../../components/complex/all-pools-table-set";
import { ExternalIncentivizedPoolsTableSet } from "../../components/complex/external-incentivized-pools-table-set";

const TVL_FILTER_THRESHOLD = 1000;

const Pools: NextPage = observer(function () {
  const {
    chainStore,
    accountStore,
    priceStore,
    queriesOsmosisStore,
    queriesImperatorStore,
  } = useStore();

  const chainInfo = chainStore.getChain("osmosis");
  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);
  const queryImperator = queriesImperatorStore.get();
  const account = accountStore.getAccount(chainInfo.chainId);

  const myPoolIds = queryOsmosis.queryGammPoolShare.getOwnPools(
    account.bech32Address
  );
  const myPools = myPoolIds.map((poolId) => {
    const pool = queryOsmosis.queryGammPools.getPool(poolId);
    if (pool) {
      const apr = queryOsmosis.queryIncentivizedPools.computeMostAPY(
        pool.id,
        priceStore,
        priceStore.getFiatCurrency("usd")!
      );
      const poolLiquidity = pool.computeTotalValueLocked(
        priceStore,
        priceStore.getFiatCurrency("usd")!
      );
      const myLiquidity = poolLiquidity.mul(
        queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
          account.bech32Address,
          poolId
        )
      );
      const myBonded = queryOsmosis.queryGammPoolShare.getLockedGammShareValue(
        account.bech32Address,
        pool.id,
        poolLiquidity,
        priceStore.getFiatCurrency("usd")!
      );

      return {
        pool,
        apr,
        myLiquidity,
        poolLiquidity,
        myBonded,
      };
    }
  });

  const top3Pools = queryOsmosis.queryGammPools.getPoolsDescendingOrderTVL(
    priceStore,
    priceStore.getFiatCurrency("usd")!,
    3,
    1
  );

  const allPools = queryOsmosis.queryGammPools.getAllPools();
  const incentivizedPoolIds =
    queryOsmosis.queryIncentivizedPools.incentivizedPools;
  const incentivizedPools = useMemo(
    () =>
      allPools.reduce(
        (incentivizedPools: ObservablePool[], pool: ObservablePool) => {
          if (incentivizedPoolIds.some((poolId) => pool.id === poolId)) {
            incentivizedPools.push(pool);
          }
          return incentivizedPools;
        },
        []
      ),
    [incentivizedPoolIds, allPools]
  );
  const allPoolsWithMetric = queryImperator.queryGammPoolMetrics
    .makePoolsWithMetric(
      allPools,
      priceStore,
      priceStore.getFiatCurrency("usd")!
    )
    .map((poolWithMetric) => ({
      ...poolWithMetric,
      myLiquidity:
        myPools.find((myPool) => myPool?.pool.id === poolWithMetric.pool.id)
          ?.myLiquidity ||
        new PricePretty(priceStore.getFiatCurrency("usd")!, new Dec(0)),
    }));

  const extraIncentivizedPools = Object.keys(ExtraGaugeInPool)
    .map((poolId: string) => {
      const pool = queryOsmosis.queryGammPools.getPool(poolId);
      if (pool) {
        return pool;
      }
    })
    .filter((pool: ObservablePool | undefined): pool is ObservablePool => {
      if (!pool) {
        return false;
      }

      const inner = ExtraGaugeInPool[pool.id];
      const data = Array.isArray(inner) ? inner : [inner];

      if (data.length === 0) {
        return false;
      }
      const gaugeIds = data.map((d) => d.gaugeId);
      const gauges = gaugeIds.map((gaugeId) =>
        queryOsmosis.queryGauge.get(gaugeId)
      );

      let maxRemainingEpoch = 0;
      for (const gauge of gauges) {
        if (maxRemainingEpoch < gauge.remainingEpoch) {
          maxRemainingEpoch = gauge.remainingEpoch;
        }
      }

      return maxRemainingEpoch > 0;
    });
  const extraIncentivizedPoolsWithMetric = queryImperator.queryGammPoolMetrics
    .makePoolsWithMetric(
      extraIncentivizedPools,
      priceStore,
      priceStore.getFiatCurrency("usd")!
    )
    .map((poolWithMetric) => {
      const inner = ExtraGaugeInPool[poolWithMetric.pool.id];
      const data = Array.isArray(inner) ? inner : [inner];
      const gaugeIds = data.map((d) => d.gaugeId);
      const gauges = gaugeIds.map((gaugeId) => {
        return queryOsmosis.queryGauge.get(gaugeId);
      });
      const incentiveDenom = data[0].denom;
      const currency = chainStore
        .getChain(chainInfo.chainId)
        .forceFindCurrency(incentiveDenom);
      let sumRemainingBonus: CoinPretty = new CoinPretty(currency, new Dec(0));
      let maxRemainingEpoch = 0;
      for (const gauge of gauges) {
        sumRemainingBonus = sumRemainingBonus.add(
          gauge.getRemainingCoin(currency)
        );

        if (gauge.remainingEpoch > maxRemainingEpoch) {
          maxRemainingEpoch = gauge.remainingEpoch;
        }
      }

      return {
        ...poolWithMetric,
        epochsRemaining: maxRemainingEpoch,
        myLiquidity:
          myPools.find((myPool) => myPool?.pool.id === poolWithMetric.pool.id)
            ?.myLiquidity ||
          new PricePretty(priceStore.getFiatCurrency("usd")!, new Dec(0)),
      };
    });

  return (
    <main>
      <Overview
        title="Active Pools"
        titleButtons={[{ label: "Create New Pool", onClick: console.log }]}
        primaryOverviewLabels={[
          { label: "OSMO Price", value: "$10" },
          {
            label: "Reward distribution in",
            value: <LeftTime hour="08" minute="20" />,
          },
        ]}
      />
      <section className="bg-background">
        <div className="max-w-container mx-auto p-10 pb-[3.75rem]">
          <h5>My Pools</h5>
          <div className="mt-5 grid grid-cols-3 gap-10">
            {myPools.map((myPool) => {
              if (myPool) {
                return (
                  <PoolCard
                    key={myPool.pool.id}
                    pool={myPool.pool}
                    poolMetrics={[
                      {
                        label: "APR",
                        value: `${myPool.apr.toString()}%`,
                        isLoading:
                          queryOsmosis.queryIncentivizedPools.isAprFetching,
                      },
                      {
                        label: "Pool Liquidity",
                        value: myPool.poolLiquidity.toString(),
                        isLoading: myPool.poolLiquidity.toDec().isZero(),
                      },
                      {
                        label: "Bonded",
                        value: myPool.myBonded.toString(),
                        isLoading: myPool.poolLiquidity.toDec().isZero(),
                      },
                    ]}
                  />
                );
              }
            })}
          </div>
        </div>
      </section>
      <section className="bg-surface">
        <div className="max-w-container mx-auto p-10">
          <h5>Top Pools</h5>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {top3Pools.map((pool) => {
              if (pool) {
                const apr = queryOsmosis.queryIncentivizedPools.computeMostAPY(
                  pool.id,
                  priceStore,
                  priceStore.getFiatCurrency("usd")!
                );
                const poolLiquidity = pool.computeTotalValueLocked(
                  priceStore,
                  priceStore.getFiatCurrency("usd")!
                );
                return (
                  <PoolCard
                    key={pool.id}
                    pool={pool}
                    poolMetrics={[
                      {
                        label: "APR",
                        value: `${apr.toString()}%`,
                        isLoading:
                          queryOsmosis.queryIncentivizedPools.isAprFetching,
                      },
                      {
                        label: "Pool Liquidity",
                        value: poolLiquidity.toString(),
                        isLoading: poolLiquidity.toDec().isZero(),
                      },
                      {
                        label: "Fees",
                        value: pool.swapFee.toString(),
                      },
                    ]}
                  />
                );
              }
            })}
          </div>
        </div>
      </section>
      <section className="bg-surface shadow-separator">
        <div className="max-w-container mx-auto p-10 py-[3.75rem]">
          <AllPoolsTableSet
            allPools={allPoolsWithMetric}
            incentivizedPoolIds={incentivizedPoolIds}
          />
        </div>
      </section>
      <section className="bg-surface shadow-separator">
        <div className="max-w-container mx-auto p-10 py-[3.75rem]">
          <ExternalIncentivizedPoolsTableSet
            externalIncentivizedPools={extraIncentivizedPoolsWithMetric}
          />
        </div>
      </section>
    </main>
  );
});

export default Pools;
