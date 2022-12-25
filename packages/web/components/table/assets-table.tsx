import { Dec } from "@keplr-wallet/unit";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";
import { BUY_OSMO_TRANSAK, initialAssetsSort, IS_FRONTIER } from "../../config";
import { EventName } from "../../config/user-analytics-v2";
import {
  useAmplitudeAnalytics,
  useLocalStorageState,
  useShowDustUserSetting,
  useWindowSize,
} from "../../hooks";
import { useFilteredData, useSortedData } from "../../hooks/data";
import { useStore } from "../../stores";
import {
  CoinBalance,
  IBCBalance,
  IBCCW20ContractBalance,
} from "../../stores/assets";
import { ShowMoreButton } from "../buttons/show-more";
import { Switch } from "../control";
import { SortMenu } from "./sort-menu";
import { SearchBox } from "../input";
import {
  AssetCell as TableCell,
  AssetNameCell,
  BalanceCell,
  TransferButtonCell,
} from "./cells";
import { TransferHistoryTable } from "./transfer-history";

const columnHelper = createColumnHelper<TableCell>();

const columns = [
  columnHelper.accessor("coinDenom", {
    cell: (props) => <AssetNameCell {...props.row.original} />,
    header: "Asset/Chain",
  }),
  columnHelper.accessor("fiatValueRaw", {
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
  columnHelper.accessor("chainName", {
    cell: () => <></>,
    header: "",
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
    const { isMobile } = useWindowSize();
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

    // TODO: use TanStack Table sort api
    // Sort data based on user's input either with the table column headers or the sort menu.
    const [
      sortKey,
      do_setSortKey,
      sortDirection,
      // setSortDirection,
      _,
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

    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
      data: filteredSortedCells,
      columns,
      state: {
        sorting,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      debugTable: true,
    });
    console.log("🚀 ~ filteredSortedCells", filteredSortedCells);
    console.log(table.getAllColumns());
    useEffect(() => {
      table.getColumn("chainName").toggleSorting(false);
    }, [table]);

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
                {/* TODO: manage state for sorting in this component, create dict of handlers and currKey, pass functions as props to sort-menu */}
                {/* Basically maintain API of sort-menu, probably can reuse same component */}
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
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <Image
                              alt="ascending"
                              src={
                                IS_FRONTIER
                                  ? "/icons/sort-up-white.svg"
                                  : "/icons/sort-up.svg"
                              }
                              height={16}
                              width={16}
                            />
                          ),
                          desc: (
                            <Image
                              alt="descending"
                              src={
                                IS_FRONTIER
                                  ? "/icons/sort-down-white.svg"
                                  : "/icons/sort-down.svg"
                              }
                              height={16}
                              width={16}
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row
                  .getVisibleCells()
                  .slice(0, showAllAssets ? undefined : 10)
                  .map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
