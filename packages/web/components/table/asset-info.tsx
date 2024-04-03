import type {
  Category,
  CommonPriceChartTimeFrame,
  Search,
  SortDirection,
} from "@osmosis-labs/server";
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
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Breakpoint,
  useTranslation,
  useUserFavoriteAssetDenoms,
  useWindowSize,
} from "~/hooks";
import { useSearchQueryInput } from "~/hooks/input/use-search-query-input";
import { useConst } from "~/hooks/use-const";
import { useShowPreviewAssets } from "~/hooks/use-show-preview-assets";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";
import { api, RouterInputs, RouterOutputs } from "~/utils/trpc";

import { Icon } from "../assets";
import { AssetCategoriesSelectors } from "../assets/categories";
import { SelectMenu } from "../control/select-menu";
import { SearchBox } from "../input";
import Spinner from "../loaders/spinner";
import { HistoricalPriceCell } from "./cells/price";
import { SortHeader } from "./headers/sort";

type AssetRow =
  RouterOutputs["edge"]["assets"]["getMarketAssets"]["items"][number];
type SortKey = NonNullable<
  RouterInputs["edge"]["assets"]["getMarketAssets"]["sort"]
>["keyPath"];

export const AssetsInfoTable: FunctionComponent<{
  /** Height of elements above the table in the window. Nav bar is already included. */
  tableTopPadding?: number;
}> = observer(({ tableTopPadding = 0 }) => {
  const { userSettings } = useStore();
  const { width, isMobile } = useWindowSize();
  const router = useRouter();

  // State
  const { favoritesList, onAddFavoriteDenom, onRemoveFavoriteDenom } =
    useUserFavoriteAssetDenoms();

  const [searchQuery, setSearchQuery] = useState<Search | undefined>();

  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<CommonPriceChartTimeFrame>("1D");

  const [sortKey, setSortKey_] = useState<SortKey>("volume24h");
  const setSortKey = useCallback((key: SortKey | undefined) => {
    if (key !== undefined) setSortKey_(key);
  }, []);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [selectedCategory, setCategory] = useState<Category | undefined>();
  const selectCategory = useCallback((category: Category) => {
    setCategory(category);
  }, []);
  const unselectCategory = useCallback(() => {
    setCategory(undefined);
  }, []);
  const categories = useMemo(
    () => (selectedCategory ? [selectedCategory] : undefined),
    [selectedCategory]
  );

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
  } = api.edge.assets.getMarketAssets.useInfiniteQuery(
    {
      preferredDenoms: favoritesList,
      limit: 50,
      search: searchQuery,
      onlyVerified: showUnverifiedAssets === false,
      includePreview: showPreviewAssets,
      sort: sortKey
        ? {
            keyPath: sortKey,
            direction: sortDirection,
          }
        : undefined,
      categories,
    },
    {
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
    const columnHelper = createColumnHelper<AssetRow>();
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
            label={`Price (${selectedTimeFrame})`}
            sortKey="currentPrice"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
        cell: (cell) => (
          <HistoricalPriceCell
            coinDenom={cell.row.original.coinDenom}
            priceChange24h={cell.row.original.priceChange24h}
            timeFrame={selectedTimeFrame}
          />
        ),
      }),
      columnHelper.accessor((row) => row, {
        id: "marketCap",
        header: () => (
          <SortHeader
            label="Market Cap"
            sortKey="marketCap"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
        cell: MarketCapCell,
      }),
      columnHelper.accessor((row) => row, {
        id: "volume24h",
        header: () => (
          <SortHeader
            label="Volume (24h)"
            sortKey="volume24h"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
        cell: Volume24hCell,
      }),
      columnHelper.accessor((row) => row, {
        id: "assetActions",
        header: "",
        cell: (cell) => <AssetActionsCell {...cell} onBuy={() => {}} />,
      }),
    ];
  }, [
    favoritesList,
    selectedTimeFrame,
    sortKey,
    sortDirection,
    setSortKey,
    onAddFavoriteDenom,
    onRemoveFavoriteDenom,
  ]);

  /** Columns collapsed for screen size responsiveness. */
  const collapsedColumns = useMemo(() => {
    const collapsedColIds: string[] = [];
    if (width < Breakpoint.xl) collapsedColIds.push("marketCap");
    if (width < Breakpoint.xlg) collapsedColIds.push("priceChart");
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
      <section className="mb-4">
        <AssetCategoriesSelectors
          selectedCategory={selectedCategory}
          onSelectCategory={selectCategory}
          unselectCategory={unselectCategory}
        />
      </section>
      <TableControls
        selectedTimeFrame={selectedTimeFrame}
        setSelectedTimeFrame={setSelectedTimeFrame}
        setSearchQuery={setSearchQuery}
      />
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

type AssetCellComponent<TProps = {}> = FunctionComponent<
  CellContext<AssetRow, AssetRow> & TProps
>;

const AssetCell: AssetCellComponent<{
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

const MarketCapCell: AssetCellComponent = ({
  row: {
    original: { marketCap, marketCapRank },
  },
}) => (
  <div className="ml-auto flex w-20 flex-col text-right">
    {marketCap && <span className="subtitle1">{formatPretty(marketCap)}</span>}
    {marketCapRank && (
      <span className="caption text-osmoverse-300">#{marketCapRank}</span>
    )}
  </div>
);

const Volume24hCell: AssetCellComponent = ({
  row: {
    original: { volume24h },
  },
}) =>
  volume24h ? (
    <span className="subtitle1">{formatPretty(volume24h)}</span>
  ) : null;

export const AssetActionsCell: AssetCellComponent<{
  onBuy: (coinMinimalDenom: string) => void;
}> = ({
  row: {
    original: { coinMinimalDenom },
  },
  onBuy,
}) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      onBuy(coinMinimalDenom);
    }}
  >
    <span className="text-wosmongton-200">Buy</span>
  </button>
);

const TableControls: FunctionComponent<{
  selectedTimeFrame: CommonPriceChartTimeFrame;
  setSelectedTimeFrame: (timeFrame: CommonPriceChartTimeFrame) => void;
  setSearchQuery: (searchQuery: Search | undefined) => void;
}> = ({ selectedTimeFrame, setSelectedTimeFrame, setSearchQuery }) => {
  const { t } = useTranslation();

  const { searchInput, setSearchInput, queryInput } = useSearchQueryInput();

  // Pass search query in an effect to prevent rendering the entire table on every input change
  // Only on debounced search query input
  useEffect(() => setSearchQuery(queryInput), [setSearchQuery, queryInput]);

  return (
    <div className="mb-4 flex h-12 w-full place-content-between items-center gap-5 md:h-fit md:flex-col md:justify-end">
      <SearchBox
        currentValue={searchInput}
        onInput={setSearchInput}
        placeholder={t("assets.table.search")}
      />
      <SelectMenu
        classes={useConst({ container: "h-full 1.5lg:hidden" })}
        options={useConst([
          { id: "1H", display: "1H" },
          { id: "1D", display: "1D" },
          { id: "1W", display: "1W" },
          { id: "1M", display: "1M" },
        ] as { id: CommonPriceChartTimeFrame; display: string }[])}
        defaultSelectedOptionId={selectedTimeFrame}
        onSelect={useCallback(
          (id: string) => setSelectedTimeFrame(id as CommonPriceChartTimeFrame),
          [setSelectedTimeFrame]
        )}
      />
    </div>
  );
};
