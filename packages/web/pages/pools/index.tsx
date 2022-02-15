import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PoolCard } from "../../components/cards";
import { Overview } from "../../components/overview";
import { LeftTime } from "../../components/left-time";
import { Table, BaseCell, ColumnDef, RowDef } from "../../components/table";

import { PoolCompositionCell } from "../../components/table/cells";
import { SortDirection } from "../../components/types";
import { useState } from "react";

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
  const account = accountStore.getAccount(chainInfo.chainId);

  const myPools = queryOsmosis.queryGammPoolShare.getOwnPools(
    account.bech32Address
  );

  const top3Pools = queryOsmosis.queryGammPools.getPoolsDescendingOrderTVL(
    priceStore,
    priceStore.getFiatCurrency("usd")!,
    3,
    1
  );

  const allPools = queryOsmosis.queryGammPools.getPools(10, 1);

  const queryImperator = queriesImperatorStore.get();

  const allPoolsWithMetric =
    queryImperator.queryGammPoolMetrics.getPoolsWithMetric(
      allPools,
      priceStore,
      priceStore.getFiatCurrency("usd")!
    );

  const [sortDirection, setSortDirection] = useState<SortDirection | undefined>(
    undefined
  );

  const tableCols: ColumnDef<BaseCell & PoolCompositionCell>[] = [
    {
      display: "Pool Name",
      displayClassName: "!pl-[5.25rem]",
      sort: {
        currentDirection: sortDirection,
        onClickHeader: () =>
          setSortDirection(
            sortDirection === "ascending" ? "descending" : "ascending"
          ),
      },
      displayCell: PoolCompositionCell,
    },
    {
      display: "Liquidity",
      infoTooltip: "This is liquidity",
      sort: {
        currentDirection: sortDirection,
        onClickHeader: () =>
          setSortDirection(
            sortDirection === "ascending" ? "descending" : "ascending"
          ),
      },
    },
    {
      display: "Volume (24H)",
    },
    {
      display: "Fees (7D)",
    },
    {
      display: "My Liquidity",
    },
  ];

  const baseRow: RowDef = {
    makeHoverClass: () => "text-secondary-200",
  };

  const tableRows: RowDef[] = allPoolsWithMetric.map(() => ({
    ...baseRow,
    onClick: (i) => console.log(i),
  }));
  const tableData: Partial<BaseCell & PoolCompositionCell>[][] =
    allPoolsWithMetric.map((poolWithMetric) => {
      return [
        { poolId: poolWithMetric.pool.id },
        { value: poolWithMetric.liqudity },
        { value: poolWithMetric.volume24h },
        { value: poolWithMetric.fees7d },
        { value: "not yet" },
      ];
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
            {myPools.map((poolId) => {
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
                const bonded =
                  queryOsmosis.queryGammPoolShare.getLockedGammShareValue(
                    account.bech32Address,
                    pool.id,
                    poolLiquidity,
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
                        label: "Bonded",
                        value: bonded.toString(),
                        isLoading: poolLiquidity.toDec().isZero(),
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
          <div className="flex items-center justify-between">
            <h5>All Pools</h5>
            <label
              htmlFor="show-all-pools"
              className="text-base flex items-center"
            >
              <input className="mr-2" id="show-all-pools" type="checkbox" />
              Show pools less then $1,000 TVL
            </label>
          </div>
          <Table
            className="mt-5 w-full"
            columnDefs={tableCols}
            rowDefs={tableRows}
            data={tableData}
          />
        </div>
      </section>
    </main>
  );
});

export default Pools;
