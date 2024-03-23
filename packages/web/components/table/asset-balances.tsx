import { RatePretty } from "@keplr-wallet/unit";
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
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useMemo, useState } from "react";

import {
  Breakpoint,
  useTranslation,
  useUserFavoriteAssetDenoms,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
import { useSearchQueryInput } from "~/hooks/input/use-search-query-input";
import { useShowPreviewAssets } from "~/hooks/use-show-preview-assets";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";
import { api, RouterInputs, RouterOutputs } from "~/utils/trpc";

import { Icon } from "../assets";
import { Sparkline } from "../chart/sparkline";
import { SearchBox } from "../input";
import Spinner from "../loaders/spinner";
import { SortHeader } from "./headers/sort";

type AssetInfo =
  RouterOutputs["edge"]["assets"]["getUserBridgeAssets"]["items"][number];
type SortKey =
  | NonNullable<
      RouterInputs["edge"]["assets"]["getUserBridgeAssets"]["sort"]
    >["keyPath"]
  | undefined;

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

  // State
  const { favoritesList, onAddFavoriteDenom, onRemoveFavoriteDenom } =
    useUserFavoriteAssetDenoms();

  const [searchQuery, setSearchQuery] = useState<Search | undefined>();

  const [sortKey, setSortKey] = useState<SortKey>();
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
    isFetchingNextPage,
    fetchNextPage,
  } = api.edge.assets.getUserBridgeAssets.useInfiniteQuery(
    {
      userOsmoAddress: account?.address,
      preferredDenoms: favoritesList,
      limit: 20,
      search: searchQuery,
      onlyVerified: showUnverifiedAssets === false,
      includePreview: showPreviewAssets,
      sort: sortKey
        ? {
            keyPath: sortKey,
            direction: sortDirection,
          }
        : undefined,
    },
    {
      enabled: !isLoadingWallet,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,

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
    const columnHelper = createColumnHelper<AssetInfo>();
    return [
      columnHelper.accessor((row) => row, {
        id: "asset",
        header: "Name",
        cell: (cell) => (
          <AssetCell
            {...cell}
            isFavorite={favoritesList.includes(cell.row.original.coinDenom)}
            onRemoveFavorite={() =>
              onRemoveFavoriteDenom(cell.row.original.coinDenom)
            }
            onSetFavorite={() =>
              onAddFavoriteDenom(cell.row.original.coinDenom)
            }
          />
        ),
      }),
      columnHelper.accessor((row) => row, {
        id: "price",
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
        cell: Price24hCell,
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
        cell: BalanceCell,
      }),
      columnHelper.accessor((row) => row, {
        id: "assetActions",
        header: "",
        cell: (cell) => (
          <AssetActionsCell
            {...cell}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
          />
        ),
      }),
    ];
  }, [
    favoritesList,
    sortKey,
    sortDirection,
    onAddFavoriteDenom,
    onRemoveFavoriteDenom,
    onDeposit,
    onWithdraw,
  ]);

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
      <TableControls setSearchQuery={setSearchQuery} />
      <table className="w-full">
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
                    prefetch={false}
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

type AssetInfoCellComponent<TProps = {}> = FunctionComponent<
  CellContext<AssetInfo, AssetInfo> & TProps
>;

const AssetCell: AssetInfoCellComponent<{
  isFavorite: boolean;
  onSetFavorite: () => void;
  onRemoveFavorite: () => void;
}> = ({
  row: {
    original: { coinDenom, coinName, coinImageUrl, isVerified },
  },
  isFavorite,
  onSetFavorite,
  onRemoveFavorite,
}) => (
  <div
    className={classNames("group flex items-center gap-2 md:gap-1", {
      "opacity-40": !isVerified,
    })}
  >
    <div className="cursor-pointer">
      <Icon
        id="star"
        className={classNames(
          "text-osmoverse-600 transition-opacity group-hover:opacity-100 md:hidden",
          isFavorite ? "text-wosmongton-400" : "opacity-0"
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (isFavorite) onRemoveFavorite();
          else onSetFavorite();
        }}
        height={24}
        width={24}
      />
    </div>
    <div className="flex items-center gap-4 md:gap-2">
      <div className="h-10 w-10">
        {coinImageUrl && (
          <Image alt={coinDenom} src={coinImageUrl} height={40} width={40} />
        )}
      </div>
      <div className="subtitle1 flex max-w-[200px] flex-col place-content-center">
        <div className="flex">
          <span className="text-white-high">{coinDenom}</span>
        </div>
        <span className="md:caption overflow-hidden overflow-ellipsis whitespace-nowrap text-osmoverse-400 md:w-28">
          {coinName}
        </span>
      </div>
    </div>
  </div>
);

const Price24hCell: AssetInfoCellComponent = ({
  row: {
    original: { coinDenom, priceChange24h },
  },
}) => {
  const { data: recentPrices } =
    api.edge.assets.getAssetHistoricalPrice.useQuery(
      {
        coinDenom,
        timeFrame: "1D",
      },
      {
        staleTime: 1000 * 30, // 30 secs
      }
    );

  const recentPriceCloses = useMemo(
    () => (recentPrices ? recentPrices.map((p) => p.close) : []),
    [recentPrices]
  );

  if (recentPriceCloses.length === 0) return <div className="w-20" />;

  const isBullish = priceChange24h && priceChange24h.toDec().isPositive();
  const isBearish = priceChange24h && priceChange24h.toDec().isNegative();

  let color: string;
  if (isBullish) {
    color = theme.colors.bullish[400];
  } else if (isBearish) {
    color = theme.colors.ammelia[400];
  } else {
    color = theme.colors.wosmongton[200];
  }

  // remove negative symbol since we're using arrows
  if (isBearish)
    priceChange24h = priceChange24h
      ? priceChange24h.mul(new RatePretty(-1))
      : undefined;

  return (
    <div className="flex items-center gap-4">
      <Sparkline
        width={80}
        height={50}
        lineWidth={2}
        data={recentPriceCloses}
        color={color}
      />
      {priceChange24h && (
        <div className="flex items-center gap-1">
          {isBullish && (
            <Icon
              className="text-bullish-400"
              id="bullish-arrow"
              height={9}
              width={9}
            />
          )}
          {isBearish && (
            <Icon
              className="text-ammelia-400"
              id="bearish-arrow"
              height={9}
              width={9}
            />
          )}
          <span
            className={classNames("caption", {
              "text-bullish-400": isBullish,
              "text-ammelia-400": isBearish,
              "text-wosmongton-200": !isBullish && !isBearish,
            })}
          >
            {priceChange24h.maxDecimals(1).toString()}
          </span>
        </div>
      )}
    </div>
  );
};

const BalanceCell: AssetInfoCellComponent = ({
  row: {
    original: { amount, usdValue },
  },
}) => (
  <div className="ml-auto flex w-28 flex-col">
    <span className="subtitle1">
      {amount ? formatPretty(amount.hideDenom(true), { maxDecimals: 8 }) : "0"}
    </span>
    {usdValue && (
      <span className="caption text-osmoverse-300">{usdValue.toString()}</span>
    )}
  </div>
);

export const AssetActionsCell: AssetInfoCellComponent<{
  onDeposit: (coinMinimalDenom: string) => void;
  onWithdraw: (coinMinimalDenom: string) => void;
}> = ({
  row: {
    original: { coinMinimalDenom },
  },
  onDeposit,
  onWithdraw,
}) => (
  <div className="flex items-center gap-2">
    <button
      className="h-11 w-11 rounded-xl bg-osmoverse-825 p-1"
      onClick={(e) => {
        e.preventDefault();
        onDeposit(coinMinimalDenom);
      }}
    >
      <Icon className="m-auto" id="down-arrow-thin" width={24} height={24} />
    </button>
    <button
      className="h-11 w-11 rounded-xl bg-osmoverse-825 p-1"
      onClick={(e) => {
        e.preventDefault();
        onWithdraw(coinMinimalDenom);
      }}
    >
      <Icon className="m-auto" id="up-arrow-thin" width={24} height={24} />
    </button>
  </div>
);

const TableControls: FunctionComponent<{
  setSearchQuery: (searchQuery: Search | undefined) => void;
}> = ({ setSearchQuery }) => {
  const { t } = useTranslation();

  const { searchInput, setSearchInput, queryInput } = useSearchQueryInput();

  // Pass search query in an effect to prevent rendering the entire table on every input change
  // Only on debounced search query input
  useEffect(() => setSearchQuery(queryInput), [setSearchQuery, queryInput]);

  return (
    <div className="flex h-12 w-full items-center gap-5 md:h-fit md:flex-col md:justify-end">
      <SearchBox
        className="!w-full"
        currentValue={searchInput}
        onInput={setSearchInput}
        placeholder={t("assets.table.search")}
      />
    </div>
  );
};
