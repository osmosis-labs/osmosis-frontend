import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { IncentivizedPoolCard, MyPoolCard } from "../../components/cards";
import { Overview } from "../../components/overview";
import { LeftTime } from "../../components/left-time";
import { Table, BaseCell, ColumnDef, RowDef } from "../../components/table";

import { PoolCompositionCell } from "../../components/table/cells";
import { SortDirection } from "../../components/types";
import { useState } from "react";

const Pools: NextPage = observer(function () {
  const { chainStore, accountStore, queriesOsmosisStore } = useStore();

  const chainInfo = chainStore.getChain("osmosis");

  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);
  const account = accountStore.getAccount(chainInfo.chainId);

  const myPools = queryOsmosis.queryGammPoolShare.getOwnPools(
    account.bech32Address
  );

  const incentivizedPools =
    queryOsmosis.queryIncentivizedPools.incentivizedPools;
  // const allPools = queryOsmosis.queryGammPools.getPoolsDescendingOrderTVL();

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
      display: "Volume",
    },
    {
      display: "Fees (7D)",
    },
    {
      display: "APR",
    },
  ];

  const baseRow: RowDef = {
    makeHoverClass: () => "text-secondary-200",
  };

  const tableRows: RowDef[] = [
    { ...baseRow, onClick: (i) => console.log(i) },
    { ...baseRow, onClick: (i) => console.log(i) },
    { ...baseRow, onClick: (i) => console.log(i) },
    { ...baseRow, onClick: (i) => console.log(i) },
    { ...baseRow, onClick: (i) => console.log(i) },
    { ...baseRow, onClick: (i) => console.log(i) },
  ];

  const tableData: Partial<BaseCell & PoolCompositionCell>[][] = [
    [
      { poolId: "1" },
      { value: "hi" },
      { value: "asf" },
      { value: "fff" },
      { value: "fjd" },
    ],
    [
      { poolId: "2" },
      { value: "A" },
      { value: "asf" },
      { value: "fff" },
      { value: "fjd" },
    ],
  ];
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
