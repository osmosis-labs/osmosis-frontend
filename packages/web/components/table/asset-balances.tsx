import type { Search, SortDirection } from "@osmosis-labs/server";
import {
  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AssetCell } from "~/components/table/cells/asset";
import {
  Breakpoint,
  useTranslation,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
import { useShowPreviewAssets } from "~/hooks/use-show-preview-assets";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";
import { api, RouterInputs, RouterOutputs } from "~/utils/trpc";

import { Icon } from "../assets";
import { SearchBox } from "../input";
import Spinner from "../loaders/spinner";
import { HistoricalPriceCell } from "./cells/price";
import { SortHeader } from "./headers/sort";

type AssetRow =
  RouterOutputs["edge"]["assets"]["getUserBridgeAssets"]["items"][number];
type SortKey = NonNullable<
  RouterInputs["edge"]["assets"]["getUserBridgeAssets"]["sort"]
>["keyPath"];

export const AssetBalancesTable: FunctionComponent<{
  /** Height of elements above the table in the window. Nav bar is already included. */
  tableTopPadding?: number;
  /** Memoized function for handling deposits from table row. */
  onDeposit: (coinMinimalDenom: string) => void;
  /** Memoized function for handling withdrawals from table row. */
  onWithdraw: (coinMinimalDenom: string) => void;
}> = observer(({ tableTopPadding = 0, onDeposit, onWithdraw }) => {
  const { accountStore, userSettings } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();
  const { width, isMobile } = useWindowSize();
  const router = useRouter();
  const { t } = useTranslation();

  // State
  const [searchQuery, setSearchQuery] = useState<Search | undefined>();
  const onSearchInput = useCallback((input: string) => {
    setSearchQuery(input ? { query: input } : undefined);
  }, []);

  const [sortKey, setSortKey_] = useState<SortKey>("usdValue");
  const setSortKey = useCallback((key: SortKey | undefined) => {
    if (key !== undefined) setSortKey_(key);
  }, []);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const showUnverifiedAssetsSetting =
    userSettings.getUserSettingById<UnverifiedAssetsState>("unverified-assets");
  const showUnverifiedAssets =
    showUnverifiedAssetsSetting?.state.showUnverifiedAssets;

  const { showPreviewAssets } = useShowPreviewAssets();

  // Query
  const {
    data: assetPagesData,
    hasNextPage,
    isLoading,
    isFetching,
    isPreviousData,
    isFetchingNextPage,
    fetchNextPage,
  } = api.edge.assets.getUserBridgeAssets.useInfiniteQuery(
    {
      userOsmoAddress: account?.address,
      limit: 50,
      search: searchQuery,
      onlyVerified: showUnverifiedAssets === false,
      includePreview: showPreviewAssets,
      sort: {
        keyPath: sortKey,
        direction: sortDirection,
      },
    },
    {
      enabled: !isLoadingWallet,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      keepPreviousData: true,

      // expensive query
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );
  const assetsData = useMemo(
    () => assetPagesData?.pages.flatMap((page) => page?.items) ?? [],
    [assetPagesData]
  );

  // Define columns
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<AssetRow>();
    return [
      columnHelper.accessor((row) => row, {
        id: "asset",
        header: "Name",
        cell: (cell) => <AssetCell {...cell.row.original} />,
      }),
      columnHelper.accessor((row) => row.currentPrice?.toString() ?? "-", {
        id: "price",
        header: () => (
          <SortHeader
            label="Price"
            sortKey="currentPrice"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
      }),
      columnHelper.accessor((row) => row, {
        id: "historicalPrice",
        header: () => (
          <SortHeader
            className="mx-auto"
            label="24h change"
            sortKey="priceChange24h"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
        cell: (cell) => (
          <HistoricalPriceCell {...cell.row.original} timeFrame="1D" />
        ),
      }),
      columnHelper.accessor((row) => row, {
        id: "balance",
        header: () => (
          <SortHeader
            label="Balance"
            sortKey="usdValue"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
        cell: (cell) => <BalanceCell {...cell.row.original} />,
      }),
      columnHelper.accessor((row) => row, {
        id: "assetActions",
        header: "",
        cell: (cell) => (
          <AssetActionsCell
            {...cell.row.original}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
          />
        ),
      }),
    ];
  }, [sortKey, sortDirection, onDeposit, onWithdraw, setSortKey]);

  /** Columns collapsed for screen size responsiveness. */
  const collapsedColumns = useMemo(() => {
    const collapsedColIds: string[] = [];
    if (width < Breakpoint.lg) collapsedColIds.push("price");
    if (width < Breakpoint.md) collapsedColIds.push("assetActions");
    return columns.filter(({ id }) => id && !collapsedColIds.includes(id));
  }, [columns, width]);

  const table = useReactTable({
    data: assetsData,
    columns: collapsedColumns,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    enableFilters: false,
    getCoreRowModel: getCoreRowModel(),
  });

  // Virtualization is used to render only the visible rows
  // and save on performance and memory.
  // As the user scrolls, invisible rows are removed from the DOM.
  const topOffset =
    Number(
      isMobile
        ? theme.extend.height["navbar-mobile"].replace("px", "")
        : theme.extend.height.navbar.replace("px", "")
    ) + tableTopPadding;
  const rowHeightEstimate = 80;
  const { rows } = table.getRowModel();
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => rowHeightEstimate,
    paddingStart: topOffset,
    overscan: 5,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  // These values are used to create dummy rows that fill the space above and below the table
  // that isn't visible. In place of the actual row elements.
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() -
        (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  // pagination
  const lastRow = rows[rows.length - 1];
  const lastVirtualRow = virtualRows[virtualRows.length - 1];
  const canLoadMore = !isLoading && !isFetchingNextPage && hasNextPage;
  useEffect(() => {
    if (
      lastRow &&
      lastVirtualRow &&
      lastRow.index === lastVirtualRow.index &&
      canLoadMore
    )
      fetchNextPage();
  }, [lastRow, lastVirtualRow, canLoadMore, fetchNextPage]);

  return (
    <div className="w-full">
      <SearchBox
        className="my-4"
        currentValue={searchQuery?.query ?? ""}
        onInput={onSearchInput}
        placeholder={t("assets.table.search")}
        debounce={500}
      />
      <table
        className={classNames(
          "w-full",
          isPreviousData &&
            isFetching &&
            "animate-[deepPulse_2s_ease-in-out_infinite] cursor-progress"
        )}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
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
          {paddingTop > 0 && paddingTop - topOffset > 0 && (
            <tr>
              <td style={{ height: paddingTop - topOffset }} />
            </tr>
          )}
          {isLoading && (
            <tr>
              <td className="!text-center" colSpan={collapsedColumns.length}>
                <Spinner />
              </td>
            </tr>
          )}
          {virtualRows.map((virtualRow) => (
            <tr
              className="group transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-osmoverse-850"
              key={rows[virtualRow.index].id}
              onClick={() =>
                router.push(
                  `/assets/${rows[virtualRow.index].original.coinDenom}`
                )
              }
            >
              {rows[virtualRow.index].getVisibleCells().map((cell) => (
                <td
                  className="transition-colors duration-200 ease-in-out"
                  key={cell.id}
                >
                  <Link
                    href={`/assets/${
                      rows[virtualRow.index].original.coinDenom
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    passHref
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Link>
                </td>
              ))}
            </tr>
          ))}
          {isFetchingNextPage && (
            <tr>
              <td className="!text-center" colSpan={collapsedColumns.length}>
                <Spinner />
              </td>
            </tr>
          )}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: paddingBottom - topOffset }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

type AssetCellComponent<TProps = {}> = FunctionComponent<
  CellContext<AssetRow, AssetRow>["row"]["original"] & TProps
>;

const BalanceCell: AssetCellComponent = ({ amount, usdValue }) => (
  <div className="ml-auto flex w-28 flex-col">
    <span>
      {amount ? formatPretty(amount.hideDenom(true), { maxDecimals: 8 }) : "0"}
    </span>
    {usdValue && (
      <span className="caption text-osmoverse-300">{usdValue.toString()}</span>
    )}
  </div>
);

export const AssetActionsCell: AssetCellComponent<{
  onDeposit: (coinMinimalDenom: string) => void;
  onWithdraw: (coinMinimalDenom: string) => void;
}> = ({ coinMinimalDenom, amount, onDeposit, onWithdraw }) => (
  <div className="flex items-center gap-2 text-wosmongton-200">
    <button
      className="h-11 w-11 rounded-full bg-osmoverse-825 p-1"
      onClick={(e) => {
        e.preventDefault();
        onDeposit(coinMinimalDenom);
      }}
    >
      <Icon className="m-auto" id="deposit" width={16} height={16} />
    </button>
    {amount?.toDec().isPositive() && (
      <button
        className="h-11 w-11 rounded-full bg-osmoverse-825 p-1"
        onClick={(e) => {
          e.preventDefault();
          onWithdraw(coinMinimalDenom);
        }}
      >
        <Icon className="m-auto" id="withdraw" width={16} height={16} />
      </button>
    )}
  </div>
);
