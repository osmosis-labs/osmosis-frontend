import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PoolCard } from "../../components/cards";
import { Overview } from "../../components/overview";
import { LeftTime } from "../../components/left-time";
import { Table, PoolTable, ColumnDef, RowDef } from "../../components/table";

import { PoolCompositionCell } from "../../components/table/cells";
import { SearchBox } from "../../components/input";
import { MenuOption, SortMenu } from "../../components/control";
import { useFilteredData, useSortedData } from "../../hooks/data";
import { Dec, PricePretty } from "@keplr-wallet/unit";

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

  const allPoolsPerPage =
    queryOsmosis.queryGammPools.getPoolsDescendingOrderTVL(
      priceStore,
      priceStore.getFiatCurrency("usd")!,
      10,
      1
    );

  const queryImperator = queriesImperatorStore.get();

  const allPoolsWithMetric = queryImperator.queryGammPoolMetrics
    .getPoolsWithMetric(
      allPoolsPerPage,
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

  const [query, setQuery, filteredFruits] = useFilteredData(
    allPoolsWithMetric,
    ["pool.id", "pool.poolAssets.amount.currency.coinDenom"]
  );

  const [
    sortKeyPath,
    setSortKeyPath,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    sortedAllPoolsWithMetric,
  ] = useSortedData(filteredFruits);

  const tableCols: (ColumnDef<PoolCompositionCell> & MenuOption)[] = [
    {
      id: "pool.id",
      display: "Pool ID/Tokens",
      displayClassName: "!pl-[5.25rem]",
      sort:
        sortKeyPath === "pool.id"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("pool.id");
                setSortDirection("ascending");
              },
            },
      displayCell: PoolCompositionCell,
    },
    {
      id: "liquidity",
      display: "Liquidity",
      infoTooltip: "This is liquidity",
      sort:
        sortKeyPath === "liquidity"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("liquidity");
                setSortDirection("ascending");
              },
            },
    },
    {
      id: "volume24h",
      display: "Volume (24H)",
      sort:
        sortKeyPath === "volume24h"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("volume24h");
                setSortDirection("ascending");
              },
            },
    },
    {
      id: "fees7d",
      display: "Fees (7D)",
      sort:
        sortKeyPath === "fees7d"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("fees7d");
                setSortDirection("ascending");
              },
            },
    },
    {
      id: "myLiquidity",
      display: "My Liquidity",
      sort:
        sortKeyPath === "myLiquidity"
          ? {
              currentDirection: sortDirection,
              onClickHeader: toggleSortDirection,
            }
          : {
              onClickHeader: () => {
                setSortKeyPath("myLiquidity");
                setSortDirection("ascending");
              },
            },
    },
  ];

  const baseRow: RowDef = {
    makeHoverClass: () => "text-secondary-200",
  };

  const tableRows: RowDef[] = allPoolsWithMetric.map(() => ({
    ...baseRow,
    onClick: (i) => console.log(i),
  }));
  const tableData: Partial<PoolCompositionCell>[][] =
    sortedAllPoolsWithMetric.map((poolWithMetric) => {
      return [
        { poolId: poolWithMetric.pool.id },
        { value: poolWithMetric.liquidity },
        { value: poolWithMetric.volume24h },
        { value: poolWithMetric.fees7d },
        { value: poolWithMetric.myLiquidity },
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
          <div className="flex items-center justify-between">
            <h5>All Pools</h5>
            <div className="flex gap-8">
              <SearchBox
                currentValue={query}
                onInput={setQuery}
                placeholder="Search by pool id or tokens"
                className="!w-64"
              />
              <SortMenu
                options={tableCols}
                selectedOptionId={sortKeyPath}
                onSelect={(id) =>
                  id === sortKeyPath ? setSortKeyPath("") : setSortKeyPath(id)
                }
                onToggleSortDirection={toggleSortDirection}
              />
            </div>
          </div>
          <PoolTable
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
