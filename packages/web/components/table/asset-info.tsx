import { type Search, type SortDirection } from "@osmosis-labs/server";
import {
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

import { HighlightsCategories } from "~/components/assets/highlights-categories";
import { AssetCell } from "~/components/table/cells/asset";
import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";
import { useConst } from "~/hooks/use-const";
import { useShowPreviewAssets } from "~/hooks/use-show-preview-assets";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";
import { api, RouterInputs, RouterOutputs } from "~/utils/trpc";

import { AssetCategoriesSelectors, Category } from "../assets/categories";
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
  const { t } = useTranslation();

  // State

  // category
  const [selectedCategory, setCategory] = useState<Category | undefined>();
  const selectCategory = useCallback((category: Category) => {
    setCategory(category);
  }, []);
  const unselectCategory = useCallback(() => {
    setCategory(undefined);
  }, []);
  const onSelectTopGainers = useCallback(() => {
    setCategory("topGainers");
  }, []);
  const categories = useMemo(
    () =>
      selectedCategory && selectedCategory !== "topGainers"
        ? [selectedCategory]
        : undefined,
    [selectedCategory]
  );

  // search
  const [searchQuery, setSearchQuery] = useState<Search | undefined>();
  const onSearchInput = useCallback((input: string) => {
    setSearchQuery(input ? { query: input } : undefined);
  }, []);
  const search = useMemo(
    () => (Boolean(selectedCategory) ? undefined : searchQuery),
    [selectedCategory, searchQuery]
  );

  // sorting
  const [sortKey_, setSortKey_] = useState<SortKey>("volume24h");
  const sortKey = useMemo(() => {
    // handle topGainers category on client
    if (selectedCategory === "topGainers") return "priceChange24h";
    else return sortKey_;
  }, [selectedCategory, sortKey_]);
  const setSortKey = useCallback((key: SortKey | undefined) => {
    if (key !== undefined) setSortKey_(key);
  }, []);
  const [sortDirection_, setSortDirection] = useState<SortDirection>("desc");
  const sortDirection = useMemo(() => {
    // handle topGainers category on client
    if (selectedCategory === "topGainers") return "desc";
    else return sortDirection_;
  }, [selectedCategory, sortDirection_]);
  const sort = useMemo(
    () =>
      !Boolean(search)
        ? {
            keyPath: sortKey,
            direction: sortDirection,
          }
        : undefined,
    [search, sortKey, sortDirection]
  );

  const showUnverifiedAssetsSetting =
    userSettings.getUserSettingById<UnverifiedAssetsState>("unverified-assets");
  const showUnverifiedAssets =
    showUnverifiedAssetsSetting?.state.showUnverifiedAssets;

  const { showPreviewAssets: includePreview } = useShowPreviewAssets();

  // Query
  const {
    data: assetPagesData,
    hasNextPage,
    isLoading,
    isFetching,
    isPreviousData,
    isFetchingNextPage,
    fetchNextPage,
  } = api.edge.assets.getMarketAssets.useInfiniteQuery(
    {
      limit: 50,
      search,
      onlyVerified: showUnverifiedAssets === false,
      includePreview,
      sort,
      categories,
    },
    {
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
  const assetsData = useMemo(() => {
    const assets = assetPagesData?.pages.flatMap((page) => page?.items) ?? [];
    if (selectedCategory === "topGainers") {
      return assets.slice(undefined, 10);
    }
    return assets;
  }, [selectedCategory, assetPagesData]);
  const clientCategoryImageSamples = useMemo(() => {
    if (selectedCategory === "topGainers") {
      const topGainers = assetsData.slice(undefined, 3);
      return {
        topGainers: topGainers
          .map((asset) => asset.coinImageUrl)
          .filter((url): url is string => !!url),
      };
    } else return { topGainers: [] };
  }, [assetsData, selectedCategory]);

  // Define columns
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<AssetRow>();
    return [
      columnHelper.accessor((row) => row, {
        id: "asset",
        header: t("assets.table.name"),
        cell: (cell) => <AssetCell {...cell.row.original} />,
      }),
      columnHelper.accessor((row) => row.currentPrice?.toString() ?? "-", {
        id: "price",
        header: () => (
          <SortHeader
            label={t("assets.table.price")}
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
            label={t("assets.table.priceChange24h")}
            sortKey="priceChange24h"
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
            timeFrame="1D"
          />
        ),
      }),
      columnHelper.accessor(
        (row) => (row.volume24h ? formatPretty(row.volume24h) : "-"),
        {
          id: "volume24h",
          header: () => (
            <SortHeader
              label={t("assets.table.volume24h")}
              sortKey="volume24h"
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              setSortDirection={setSortDirection}
              setSortKey={setSortKey}
            />
          ),
        }
      ),
      columnHelper.accessor(
        (row) => (row.marketCap ? formatPretty(row.marketCap) : "-"),
        {
          id: "marketCap",
          header: () => (
            <SortHeader
              label={t("assets.table.marketCap")}
              sortKey="marketCap"
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              setSortDirection={setSortDirection}
              setSortKey={setSortKey}
            />
          ),
        }
      ),
      columnHelper.accessor((row) => row, {
        id: "assetActions",
        header: "",
        cell: () => (
          <button>
            <span className="text-wosmongton-200">{t("portfolio.trade")}</span>
          </button>
        ),
      }),
    ];
  }, [sortKey, sortDirection, setSortKey, t]);

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
        <HighlightsCategories
          isCategorySelected={!!selectedCategory}
          onSelectCategory={selectCategory}
          onSelectAllTopGainers={onSelectTopGainers}
        />
      </section>
      <section className="mb-4">
        <AssetCategoriesSelectors
          selectedCategory={selectedCategory}
          hiddenCategories={useConst(["new", "topGainers"])}
          onSelectCategory={selectCategory}
          unselectCategory={unselectCategory}
          clientCategoryImageSamples={clientCategoryImageSamples}
        />
      </section>
      <SearchBox
        className="mb-4 h-12 !w-96"
        currentValue={searchQuery?.query ?? ""}
        onInput={onSearchInput}
        placeholder={t("assets.table.search")}
        debounce={500}
        disabled={Boolean(selectedCategory)}
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
