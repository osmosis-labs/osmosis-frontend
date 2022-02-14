import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { IncentivizedPoolCard, MyPoolCard } from "../../components/cards";
import { Overview } from "../../components/overview";
import { LeftTime } from "../../components/left-time";
import { Table, BaseCell, ColumnDef, RowDef } from "../../components/table";

import { PoolCompositionCell } from "../../components/table/cells";
import { SortDirection } from "../../components/types";
import { useMemo, useState } from "react";

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

  const incentivizedPools =
    queryOsmosis.queryIncentivizedPools.incentivizedPools;

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
                return <MyPoolCard pool={pool} key={pool.id} />;
              }
            })}
          </div>
        </div>
      </section>
      <section className="bg-surface">
        <div className="max-w-container mx-auto px-10 py-[3.75rem]">
          <h5>Incentivized Pools</h5>
          <div className="mt-5 grid grid-cols-3 gap-4">
            {incentivizedPools.map((poolId) => {
              const pool = queryOsmosis.queryGammPools.getPool(poolId);
              if (pool) {
                return <IncentivizedPoolCard pool={pool} key={pool.id} />;
              }
            })}
          </div>
        </div>
      </section>
      <section className="bg-surface">
        <div className="max-w-container mx-auto p-10 py-[3.75rem] shadow-separator">
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
