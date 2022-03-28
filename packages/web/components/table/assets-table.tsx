import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { Dec } from "@keplr-wallet/unit";
import {
  IBCBalance,
  IBCCW20ContractBalance,
  CoinBalance,
} from "../../stores/assets";
import { SearchBox } from "../input";
import { CheckBox, SortMenu } from "../control";
import { Table } from ".";
import { SortDirection } from "../types";
import {
  AssetNameCell,
  BalanceCell,
  TransferButtonCell,
  AssetCell as TableCell,
} from "./cells";
import { useStore } from "../../stores";
import { useSortedData, useFilteredData } from "../../hooks/data";
import { ShowMoreButton } from "../buttons/show-more";
import { DataSorter } from "../../hooks/data/data-sorter";

interface Props {
  nativeBalances: CoinBalance[];
  ibcBalances: (IBCBalance | IBCCW20ContractBalance)[];
  onWithdraw: (chainId: string, coinDenom: string) => void;
  onDeposit: (chainId: string, coinDenom: string) => void;
}

export const AssetsTable: FunctionComponent<Props> = ({
  nativeBalances,
  ibcBalances,
  onDeposit,
  onWithdraw,
}) => {
  const { chainStore } = useStore();
  // Assemble cells with all data needed for any place in the table.
  const cells: TableCell[] = useMemo(
    () => [
      // hardcode native Osmosis assets (OSMO, ION) at the top initially
      ...nativeBalances.map(({ balance, fiatValue }) => {
        const value = fiatValue?.maxDecimals(2);

        return {
          value: balance.toString(),
          chainId: chainStore.osmosis.chainId,
          chainName: "",
          coinDenom: balance.denom,
          coinImageUrl: balance.currency.coinImageUrl,
          amount: balance.hideDenom(true).trim(true).maxDecimals(6).toString(),
          fiatValue:
            value && value.toDec().gt(new Dec(0))
              ? value.toString()
              : undefined,
          isCW20: false,
        };
      }),
      // add ibc assets, initially sorted by fiat value at top
      ...new DataSorter(
        ibcBalances.map((ibcBalance) => {
          const {
            chainInfo: { chainId, chainName },
            balance,
            fiatValue,
          } = ibcBalance;
          const value = fiatValue?.maxDecimals(2);
          const isCW20 = "ics20ContractAddress" in ibcBalance;

          return {
            value: balance.toString(),
            chainName: chainName,
            chainId: chainId,
            coinDenom: balance.denom,
            coinImageUrl: balance.currency.coinImageUrl,
            amount: balance
              .hideDenom(true)
              .trim(true)
              .maxDecimals(6)
              .toString(),
            fiatValue:
              value && value.toDec().gt(new Dec(0))
                ? value.toString()
                : undefined,
            fiatValueRaw:
              value && value.toDec().gt(new Dec(0))
                ? value?.toDec().toString()
                : "0",
            isCW20,
            queryTags: [...(isCW20 ? ["CW20"] : [])],
            onWithdraw,
            onDeposit,
          };
        })
      )
        .process("fiatValueRaw")
        .reverse(),
    ],
    [
      nativeBalances,
      chainStore.osmosis.chainId,
      ibcBalances,
      onWithdraw,
      onDeposit,
    ]
  );

  // Sort data based on user's input either with the table column headers or the sort menu.
  const [
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    sortedCells,
  ] = useSortedData(cells);

  // Table column def to determine how the first 2 column headers handle user click.
  const sortColumnWithKeys = useCallback(
    (
      /** Possible cell keys/members this column can sort on. First key is default
       *  sort key if this column header is selected.
       */
      sortKeys: string[],
      /** Default sort direction when this column is first selected. */
      onClickSortDirection: SortDirection = "descending"
    ) => {
      const isSorting = sortKeys.some((key) => key === sortKey);
      const firstKey = sortKeys.find((_, i) => i === 0);

      return {
        currentDirection: isSorting ? sortDirection : undefined,
        // Columns can sort by more than one key. If the column is already sorting by
        // one of it's sort keys (one that the user may have selected from the sort menu),
        // then it will toggle sort direction on that key.
        // If it wasn't sorting (aka first time it is clicked), then it will sort on the first
        // key by default.
        onClickHeader: isSorting
          ? toggleSortDirection
          : () => {
              if (firstKey) {
                setSortKey(firstKey);
                setSortDirection(onClickSortDirection);
              }
            },
      };
    },
    [sortKey, sortDirection, toggleSortDirection, setSortKey, setSortDirection]
  );

  // User toggles for showing 10+ pools and assets with > 0 fiat value
  const [showAllPools, setShowAllPools] = useState(false);
  const [hideZeroBalances, setHideZeroBalances] = useState(false);

  // Filter data based on user's input in the search box.
  const [query, setQuery, filteredSortedCells] = useFilteredData(
    hideZeroBalances
      ? sortedCells.filter((cell) => cell.amount !== "0")
      : sortedCells,
    ["chainName", "chainId", "coinDenom", "amount", "fiatValue", "queryTags"]
  );

  const tableData = showAllPools
    ? filteredSortedCells
    : filteredSortedCells.slice(0, 10);

  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-container mx-auto p-10">
        <div className="flex place-content-between">
          <h5>Osmosis Assets</h5>
          <div className="flex gap-5">
            <SearchBox
              currentValue={query}
              onInput={(query) => {
                setHideZeroBalances(false);
                setQuery(query);
              }}
              placeholder="Filter by symbol"
            />
            <SortMenu
              selectedOptionId={sortKey}
              onSelect={setSortKey}
              onToggleSortDirection={toggleSortDirection}
              options={[
                {
                  id: "coinDenom",
                  display: "Symbol",
                },
                {
                  /** These ids correspond to keys in `Cell` type and are later used for sorting. */
                  id: "chainName",
                  display: "Network",
                },
                {
                  id: "amount",
                  display: "Balance",
                },
              ]}
            />
          </div>
        </div>
        <Table<TableCell>
          className="w-full my-5"
          columnDefs={[
            {
              display: "Asset / Chain",
              displayCell: AssetNameCell,
              sort: sortColumnWithKeys(["coinDenom", "chainName"]),
            },
            {
              display: "Balance",
              displayCell: BalanceCell,
              sort: sortColumnWithKeys(["amount", "fiatValue"], "descending"),
              className: "text-right pr-24",
            },
            {
              display: "Deposit",
              displayCell: (cell) => (
                <TransferButtonCell type="deposit" {...cell} />
              ),
              className: "text-center max-w-[5rem]",
            },
            {
              display: "Withdraw",
              displayCell: (cell) => (
                <TransferButtonCell type="withdraw" {...cell} />
              ),
              className: "text-center max-w-[5rem]",
            },
          ]}
          rowDefs={tableData.map(() => ({ makeHoverClass: () => " " }))}
          data={tableData.map((cell) => [cell, cell, cell, cell])}
          headerTrClassName="!h-12 !body2"
        />
        <div className="relative flex h-12 justify-center">
          {filteredSortedCells.length > 10 && (
            <ShowMoreButton
              className="m-auto"
              isOn={showAllPools}
              onToggle={() => setShowAllPools(!showAllPools)}
            />
          )}
          <div className="flex gap-2 absolute body2 right-24 bottom-1">
            <CheckBox
              className="mr-2 after:!bg-transparent after:!border-2 after:!border-white-full"
              isOn={hideZeroBalances}
              onToggle={() => setHideZeroBalances(!hideZeroBalances)}
            >
              Hide zero balances
            </CheckBox>
          </div>
        </div>
      </div>
    </section>
  );
};
