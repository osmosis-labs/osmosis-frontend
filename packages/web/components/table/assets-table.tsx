import Image from "next/image";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { Dec } from "@keplr-wallet/unit";
import { BUY_OSMO_TRANSAK, initialAssetsSort } from "../../config";
import {
  IBCBalance,
  IBCCW20ContractBalance,
  CoinBalance,
} from "../../stores/assets";
import { useStore } from "../../stores";
import { useSortedData, useFilteredData } from "../../hooks/data";
import {
  useLocalStorageState,
  useWindowSize,
  useAmplitudeAnalytics,
  useShowDustUserSetting,
} from "../../hooks";
import { ShowMoreButton } from "../buttons/show-more";
import { SearchBox } from "../input";
import { SortMenu, Switch } from "../control";
import { SortDirection } from "../types";
import {
  AssetNameCell,
  BalanceCell,
  TransferButtonCell,
  AssetCell as TableCell,
} from "./cells";
import { TransferHistoryTable } from "./transfer-history";
import { ColumnDef } from "./types";
import { Table } from ".";
import { EventName } from "../../config/user-analytics-v2";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-multi-lang";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper<TableCell>();

const columns = [
  columnHelper.accessor("coinDenom", {
    cell: (props) => <AssetNameCell {...props.row.original} />,
    header: "Asset/Chain",
  }),
  columnHelper.accessor("amount", {
    cell: (props) => <BalanceCell {...props.row.original} />,
    header: "Balance",
  }),
  columnHelper.display({
    id: "deposit",
    cell: (props) => (
      <TransferButtonCell type="deposit" {...props.row.original} />
    ),
    header: "Deposit",
  }),
  columnHelper.display({
    id: "withdraw",
    cell: (props) => (
      <TransferButtonCell type="withdraw" {...props.row.original} />
    ),
    header: "Withdraw",
  }),
];

interface Props {
  nativeBalances: CoinBalance[];
  ibcBalances: ((IBCBalance | IBCCW20ContractBalance) & {
    depositUrlOverride?: string;
    withdrawUrlOverride?: string;
    sourceChainNameOverride?: string;
  })[];
  onWithdraw: (
    chainId: string,
    coinDenom: string,
    externalUrl?: string
  ) => void;
  onDeposit: (chainId: string, coinDenom: string, externalUrl?: string) => void;
  onBuyOsmo: () => void;
}

export const AssetsTable: FunctionComponent<Props> = observer(
  ({
    nativeBalances,
    ibcBalances,
    onDeposit: do_onDeposit,
    onWithdraw: do_onWithdraw,
    onBuyOsmo,
  }) => {
    const { chainStore } = useStore();
    const { width, isMobile } = useWindowSize();
    const t = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();

    const onDeposit = useCallback(
      (...depositParams: Parameters<typeof do_onDeposit>) => {
        do_onDeposit(...depositParams);
        logEvent([
          EventName.Assets.assetsItemDepositClicked,
          {
            tokenName: depositParams[1],
            hasExternalUrl: !!depositParams[2],
          },
        ]);
      },
      [do_onDeposit, logEvent]
    );
    const onWithdraw = useCallback(
      (...withdrawParams: Parameters<typeof do_onWithdraw>) => {
        do_onWithdraw(...withdrawParams);
        logEvent([
          EventName.Assets.assetsItemWithdrawClicked,
          {
            tokenName: withdrawParams[1],
            hasExternalUrl: !!withdrawParams[2],
          },
        ]);
      },
      [do_onWithdraw, logEvent]
    );

    const dustIbcBalances = useShowDustUserSetting(ibcBalances, (ibcBalance) =>
      !ibcBalance.balance.toDec().isZero() ? ibcBalance.fiatValue : undefined
    );

    const mergeWithdrawCol = width < 1000 && !isMobile;
    // Assemble cells with all data needed for any place in the table.
    const cells: TableCell[] = useMemo(
      () => [
        // hardcode native Osmosis assets (OSMO, ION) at the top initially
        ...nativeBalances.map(({ balance, fiatValue }) => {
          const value = fiatValue?.maxDecimals(2);

          return {
            value: balance.toString(),
            currency: balance.currency,
            chainId: chainStore.osmosis.chainId,
            chainName: "",
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
            isCW20: false,
            onBuyOsmo:
              balance.denom === "OSMO" && BUY_OSMO_TRANSAK
                ? onBuyOsmo
                : undefined,
          };
        }),
        ...initialAssetsSort(
          dustIbcBalances.map((ibcBalance) => {
            const {
              chainInfo: { chainId, chainName },
              balance,
              fiatValue,
              depositUrlOverride,
              withdrawUrlOverride,
              sourceChainNameOverride,
            } = ibcBalance;
            const value = fiatValue?.maxDecimals(2);
            const isCW20 = "ics20ContractAddress" in ibcBalance;
            const pegMechanism = balance.currency.originCurrency?.pegMechanism;

            return {
              value: balance.toString(),
              currency: balance.currency,
              chainName: sourceChainNameOverride
                ? sourceChainNameOverride
                : chainName,
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
              queryTags: [
                ...(isCW20 ? ["CW20"] : []),
                ...(pegMechanism ? ["stable", pegMechanism] : []),
              ],
              isUnstable: ibcBalance.isUnstable === true,
              depositUrlOverride,
              withdrawUrlOverride,
              onWithdraw,
              onDeposit,
            };
          })
        ),
      ],
      [
        nativeBalances,
        chainStore.osmosis.chainId,
        dustIbcBalances,
        onDeposit,
        onWithdraw,
      ]
    );

    // Sort data based on user's input either with the table column headers or the sort menu.
    const [
      sortKey,
      do_setSortKey,
      sortDirection,
      setSortDirection,
      toggleSortDirection,
      sortedCells,
    ] = useSortedData(cells);
    const setSortKey = useCallback(
      (term: string) => {
        logEvent([
          EventName.Assets.assetsListSorted,
          {
            sortedBy: term,
            sortDirection,

            sortedOn: "dropdown",
          },
        ]);
        do_setSortKey(term);
      },
      [sortDirection]
    );

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
            ? () => {
                logEvent([
                  EventName.Assets.assetsListSorted,
                  {
                    sortedBy: firstKey,
                    sortDirection:
                      sortDirection === "descending"
                        ? "ascending"
                        : "descending",
                    sortedOn: "table-head",
                  },
                ]);
                toggleSortDirection();
              }
            : () => {
                if (firstKey) {
                  logEvent([
                    EventName.Assets.assetsListSorted,
                    {
                      sortedBy: firstKey,
                      sortDirection: onClickSortDirection,
                      sortedOn: "table-head",
                    },
                  ]);
                  setSortKey(firstKey);
                  setSortDirection(onClickSortDirection);
                }
              },
        };
      },
      [sortKey, sortDirection]
    );

    // User toggles for showing 10+ pools and assets with > 0 fiat value
    const [showAllAssets, setShowAllAssets] = useState(false);
    const [hideZeroBalances, setHideZeroBalances] = useLocalStorageState(
      "assets_hide_zero_balances",
      false
    );
    const canHideZeroBalances = cells.some((cell) => cell.amount !== "0");

    // Filter data based on user's input in the search box.
    const [query, setQuery, filteredSortedCells] = useFilteredData(
      hideZeroBalances
        ? sortedCells.filter((cell) => cell.amount !== "0")
        : sortedCells,
      ["chainName", "chainId", "coinDenom", "amount", "fiatValue", "queryTags"]
    );

    const tableData = showAllAssets
      ? filteredSortedCells
      : filteredSortedCells.slice(0, 10);

    const table = useReactTable({
      data: tableData ? tableData : [],
      columns,
      getCoreRowModel: getCoreRowModel(),
    });
    return (
      <section>
        {isMobile ? (
          <div className="flex flex-col gap-5">
            <h6 className="px-3">{t("assets.table.title")}</h6>
            <SearchBox
              className="!w-full h-11"
              currentValue={query}
              onInput={(query) => {
                setHideZeroBalances(false);
                setQuery(query);
              }}
              placeholder={t("assets.table.search")}
            />
            <div className="flex flex-wrap gap-3 items-center place-content-between">
              <Switch
                isOn={hideZeroBalances}
                disabled={!canHideZeroBalances}
                onToggle={() => {
                  logEvent([
                    EventName.Assets.assetsListFiltered,
                    {
                      filteredBy: "Hide zero balances",
                      isFilterOn: !hideZeroBalances,
                    },
                  ]);

                  setHideZeroBalances(!hideZeroBalances);
                }}
              >
                <span className="text-osmoverse-200">
                  {t("assets.table.hideZero")}
                </span>
              </Switch>
              <SortMenu
                selectedOptionId={sortKey}
                onSelect={setSortKey}
                onToggleSortDirection={toggleSortDirection}
                options={[
                  {
                    id: "coinDenom",
                    display: t("assets.table.sort.symbol"),
                  },
                  {
                    /** These ids correspond to keys in `Cell` type and are later used for sorting. */
                    id: "chainName",
                    display: t("assets.table.sort.network"),
                  },
                  {
                    id: "fiatValueRaw",
                    display: t("assets.table.sort.balance"),
                  },
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center place-content-between">
              <h5 className="shrink-0 mr-5">{t("assets.table.title")}</h5>
              <div className="flex items-center gap-3 lg:gap-2">
                <Switch
                  isOn={hideZeroBalances}
                  disabled={!canHideZeroBalances}
                  onToggle={() => {
                    setHideZeroBalances(!hideZeroBalances);
                  }}
                >
                  {t("assets.table.hideZero")}
                </Switch>
                <SearchBox
                  currentValue={query}
                  onInput={(query) => {
                    setHideZeroBalances(false);
                    setQuery(query);
                  }}
                  placeholder={t("assets.table.search")}
                />
                <SortMenu
                  selectedOptionId={sortKey}
                  onSelect={setSortKey}
                  onToggleSortDirection={() => {
                    logEvent([
                      EventName.Assets.assetsListSorted,
                      {
                        sortedBy: sortKey,
                        sortDirection:
                          sortDirection === "descending"
                            ? "ascending"
                            : "descending",
                        sortedOn: "dropdown",
                      },
                    ]);
                    toggleSortDirection();
                  }}
                  options={[
                    {
                      id: "coinDenom",
                      display: t("assets.table.sort.symbol"),
                    },
                    {
                      /** These ids correspond to keys in `Cell` type and are later used for sorting. */
                      id: "chainName",
                      display: t("assets.table.sort.network"),
                    },
                    {
                      id: "fiatValueRaw",
                      display: t("assets.table.sort.balance"),
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        <table className="w-full my-5">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="relative flex h-12 justify-center">
          {filteredSortedCells.length > 10 && (
            <ShowMoreButton
              className="m-auto"
              isOn={showAllAssets}
              onToggle={() => {
                logEvent([
                  EventName.Assets.assetsListMoreClicked,
                  {
                    isOn: !showAllAssets,
                  },
                ]);
                setShowAllAssets(!showAllAssets);
              }}
            />
          )}
        </div>
        <TransferHistoryTable className="mt-8 md:w-screen md:-mx-4" />
      </section>
    );
  }
);

{
  /* 
        {isMobile ? (
          <div className="flex flex-col gap-3 my-7">
            {tableData.map((assetData) => (
              <div
                key={assetData.coinDenom}
                className="w-full flex items-center place-content-between bg-osmoverse-800 rounded-xl px-3 py-3"
                onClick={
                  assetData.chainId === undefined ||
                  (assetData.chainId &&
                    assetData.chainId === chainStore.osmosis.chainId)
                    ? undefined
                    : () => {
                        if (assetData.chainId && assetData.coinDenom) {
                          onDeposit(assetData.chainId, assetData.coinDenom);
                        }
                      }
                }
              >
                <div className="flex items-center gap-2">
                  {assetData.coinImageUrl && (
                    <div className="flex items-center w-10 shrink-0">
                      <Image
                        alt="token icon"
                        src={assetData.coinImageUrl}
                        height={40}
                        width={40}
                      />
                    </div>
                  )}
                  <div className="flex flex-col shrink gap-1 text-ellipsis">
                    <h6>{assetData.coinDenom}</h6>
                    {assetData.chainName && (
                      <span className="caption text-osmoverse-400">
                        {assetData.chainName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <h5 className="sm:text-h6 sm:font-h6 xs:text-subtitle2 xs:font-subtitle2">
                      {assetData.amount}
                    </h5>
                    {assetData.fiatValue && (
                      <span className="caption">{assetData.fiatValue}</span>
                    )}
                  </div>
                  {!(
                    assetData.chainId === undefined ||
                    (assetData.chainId &&
                      assetData.chainId === chainStore.osmosis.chainId)
                  ) && (
                    <Image
                      alt="select asset"
                      src="/icons/chevron-right-disabled.svg"
                      width={30}
                      height={30}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table<TableCell>
            className="w-full my-5"
            columnDefs={[
              {
                display: t("assets.table.columns.assetChain"),
                displayCell: AssetNameCell,
                sort: sortColumnWithKeys(["coinDenom", "chainName"]),
              },
              {
                display: t("assets.table.columns.balance"),
                displayCell: BalanceCell,
                sort: sortColumnWithKeys(["fiatValueRaw"], "descending"),
                className: "text-right pr-24 lg:pr-8 1.5md:pr-1",
              },
              ...(mergeWithdrawCol
                ? ([
                    {
                      display: t("assets.table.columns.transfer"),
                      displayCell: (cell) => (
                        <div>
                          <TransferButtonCell type="deposit" {...cell} />
                          <TransferButtonCell type="withdraw" {...cell} />
                        </div>
                      ),
                      className: "text-left max-w-[5rem]",
                    },
                  ] as ColumnDef<TableCell>[])
                : ([
                    {
                      display: t("assets.table.columns.deposit"),
                      displayCell: (cell) => (
                        <TransferButtonCell type="deposit" {...cell} />
                      ),
                      className: "text-left max-w-[5rem]",
                    },
                    {
                      display: t("assets.table.columns.withdraw"),
                      displayCell: (cell) => (
                        <TransferButtonCell type="withdraw" {...cell} />
                      ),
                      className: "text-left max-w-[5rem]",
                    },
                  ] as ColumnDef<TableCell>[])),
            ]}
            data={tableData.map((cell) => [
              cell,
              cell,
              ...(mergeWithdrawCol ? [cell] : [cell, cell]),
            ])}
            headerTrClassName="!h-12 !body2"
          />
        )} */
}
