import { FunctionComponent, useCallback, useMemo, useState } from "react";
import {
  IBCBalance,
  IBCCW20ContractBalance,
  CoinBalance,
} from "@osmosis-labs/stores";
import { Dec } from "@keplr-wallet/unit";
import { SearchBox } from "../input";
import { CheckBox, SortMenu } from "../control";
import { Table } from ".";
import { SortDirection } from "../types";
import {
  AssetNameCell,
  BalanceCell,
  TransferButtonCell,
  AssetCell as Cell,
} from "./cells";
import { useSortedData, useFilteredData } from "../../hooks/data";
import { DataSorter } from "../../hooks/data/data-sorter";
import { ShowMoreButton } from "../buttons/show-more";

interface Props {
  nativeBalances: CoinBalance[];
  ibcBalances: (IBCBalance | IBCCW20ContractBalance)[];
  onDeposit: (chainId: string) => void;
  onWithdraw: (chainId: string) => void;
}

const AssetsTable: FunctionComponent<Props> = ({
  nativeBalances,
  ibcBalances,
  onDeposit,
  onWithdraw,
}) => {
  const cells: Cell[] = useMemo(
    () => [
      ...nativeBalances.map(({ balance, fiatValue }) => {
        const value = fiatValue?.maxDecimals(2);

        return {
          value: balance.toString(),
          coinDenom: balance.denom,
          amount: balance.hideDenom(true).trim(true).maxDecimals(6).toString(),
          fiatValue:
            value && value.toDec().gt(new Dec(0))
              ? value.toString()
              : undefined,
          isCW20: false,
        };
      }),
      ...new DataSorter(
        ibcBalances.map((ibcBalance) => {
          const {
            chainInfo: { chainId, chainName },
            balance,
            fiatValue,
          } = ibcBalance;
          const value = fiatValue?.maxDecimals(2);
          const isCW20 = "ics20ContractAddress" in ibcBalance ?? false;
          const v =
            value && value.toDec().gt(new Dec(0))
              ? value?.toDec().toString()
              : "0";

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
            fiatValueRaw: v,
            isCW20,
            queryTags: [...(isCW20 ? ["CW20"] : [])],
            onWithdraw,
            onDeposit,
          };
        })
      )
        .process("fiatValueRaw")
        .reverse(), // sort IBC assets by value on initial load
    ],
    [nativeBalances, ibcBalances, onWithdraw, onDeposit]
  );

  const [
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    sortedCells,
  ] = useSortedData(cells);

  const sortColumnWithKeys = useCallback(
    (sortKeys: string[], onClickSortDirection: SortDirection = "ascending") => {
      const isSorting = sortKeys.some((key) => key === sortKey);
      const firstKey = sortKeys.find((_, i) => i === 0);

      return {
        currentDirection: isSorting ? sortDirection : undefined,
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

  const [showAllPools, setShowAllPools] = useState(false);
  const [hideZeroBalances, setHideZeroBalances] = useState(false);

  const [query, setQuery, filteredSortedCells] = useFilteredData(
    hideZeroBalances
      ? sortedCells.filter((cell) => cell.amount !== "0")
      : sortedCells,
    ["chainName", "chainId", "coinDenom", "amount", "fiatValue", "queryTags"]
  );

  const [showAll, setShowAll] = useState(false);

  return (
    <section className="bg-surface">
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
        <Table<Cell>
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
          data={filteredSortedCells.map((cell) => [cell, cell, cell, cell])}
        />
        <div className="relative flex gap-2 justify-center">
          <ShowMoreButton
            className="m-auto"
            isOn={showAllPools}
            onToggle={() => setShowAllPools(!showAllPools)}
          />
          <div className="flex gap-2 absolute right-24 bottom-1">
            <CheckBox
              className={
                hideZeroBalances
                  ? "after:bg-primary-200"
                  : "after:!border-2 after:!border-white-full"
              }
              isOn={hideZeroBalances}
              onToggle={() => setHideZeroBalances(!hideZeroBalances)}
            />
            <span className="text-body2">Hide zero balances</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssetsTable;
