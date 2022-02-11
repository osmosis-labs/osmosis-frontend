import { FunctionComponent, useCallback, useMemo } from "react";
import {
  IBCBalance,
  IBCCW20ContractBalance,
  CoinBalance,
} from "@osmosis-labs/stores";
import { Dec } from "@keplr-wallet/unit";
import { SearchBox } from "../../components/input";
import { PageList, SortMenu } from "../../components/control";
import { Table } from "../../components/table";
import { SortDirection } from "../../components/types";
import {
  Cell,
  BalanceCell,
  AssetCell,
  DepositButtonCell,
  WidthrawButtonCell,
} from "./cells";
import {
  useSortedData,
  useFilteredData,
  usePaginatedData,
} from "../../hooks/data";
import { DataSorter } from "../../hooks/data/data-sorter";

interface Props {
  nativeBalances: CoinBalance[];
  ibcBalances: (IBCBalance | IBCCW20ContractBalance)[];
  onDeposit: (chainId: string) => void;
  onWithdraw: (chainId: string) => void;
}

export const AssetsTable: FunctionComponent<Props> = ({
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
    [nativeBalances, ibcBalances]
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
      const firstKey = sortKeys.at(0);

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

  const [query, setQuery, filteredSortedCells] = useFilteredData(sortedCells, [
    "chainName",
    "chainId",
    "coinDenom",
    "amount",
    "fiatValue",
    "queryTags",
  ]);

  const [curPage, setPage, minPage, maxPage, pageData] = usePaginatedData(
    filteredSortedCells,
    11
  );

  return (
    <section className="bg-surface">
      <div className="max-w-container mx-auto p-10">
        <div className="flex place-content-between">
          <h5>Osmosis Assets</h5>
          <div className="flex gap-5">
            <SearchBox
              currentValue={query}
              onInput={(query) => {
                setPage(1);
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
              displayCell: AssetCell,
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
              displayCell: DepositButtonCell,
              className: "text-center max-w-[5rem]",
            },
            {
              display: "Withdraw",
              displayCell: WidthrawButtonCell,
              className: "text-center max-w-[5rem]",
            },
          ]}
          data={pageData.map((cell) => [cell, cell, cell, cell])}
        />
        <PageList
          currentValue={curPage}
          onInput={setPage}
          min={minPage}
          max={maxPage}
          editField
        />
      </div>
    </section>
  );
};
