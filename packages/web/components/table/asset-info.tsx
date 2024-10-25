import { type Search } from "@osmosis-labs/server";
import { type SortDirection } from "@osmosis-labs/utils";
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

import { HighlightsCategories } from "~/components/assets/highlights-categories";
import { AssetCell } from "~/components/table/cells/asset";
import { EventName } from "~/config";
import {
  Breakpoint,
  useAmplitudeAnalytics,
  useDimension,
  useFeatureFlags,
  useTranslation,
  useUserWatchlist,
  useWindowSize,
} from "~/hooks";
import { useConst } from "~/hooks/use-const";
import { useShowPreviewAssets } from "~/hooks/use-show-preview-assets";
import { ActivateUnverifiedTokenConfirmation } from "~/modals";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";
import { api, RouterInputs, RouterOutputs } from "~/utils/trpc";

import { AssetCategoriesSelectors } from "../assets/categories";
import { HistoricalPriceSparkline, PriceChange } from "../assets/price";
import { SubscriptDecimal } from "../chart";
import { NoSearchResultsSplash, SearchBox } from "../input";
import { Spinner } from "../loaders/spinner";
import { Button } from "../ui/button";
import { SortHeader } from "./headers/sort";

type AssetRow =
  RouterOutputs["edge"]["assets"]["getMarketAssets"]["items"][number];
type SortKey =
  | NonNullable<
      RouterInputs["edge"]["assets"]["getMarketAssets"]["sort"]
    >["keyPath"]
  | undefined;

export const AssetsInfoTable: FunctionComponent<{
  /** Height of elements above the table in the window. Nav bar is already included. */
  tableTopPadding?: number;
}> = observer(({ tableTopPadding = 0 }) => {
  const { userSettings } = useStore();
  const { width, isMobile } = useWindowSize();
  const router = useRouter();
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();
  const featureFlags = useFeatureFlags();

  // State

  // category
  const [selectedCategory, setCategory] = useState<string | undefined>();
  const selectCategory = useCallback(
    (category: string, highlight?: string) => {
      setCategory(category);
      logEvent([
        EventName.Assets.categorySelected,
        {
          assetCategory: category,
          highlight,
        },
      ]);
    },
    [logEvent]
  );
  const unselectCategory = useCallback(() => {
    setCategory(undefined);
  }, []);
  const onSelectTopGainers = useCallback(() => {
    selectCategory("topGainers", "topGainers");
  }, [selectCategory]);
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

  // sorting
  const [sortKey_, setSortKey_] = useState<SortKey>(undefined);
  const sortKey = useMemo(() => {
    // handle topGainers category on client, but other categories can still sort
    if (selectedCategory === "topGainers") return "priceChange24h";
    else return sortKey_;
  }, [selectedCategory, sortKey_]);
  const [sortDirection_, setSortDirection] = useState<SortDirection>("desc");
  const sortDirection = useMemo(() => {
    // handle topGainers category on client, but other categories can still sort
    if (selectedCategory === "topGainers") return "desc";
    else return sortDirection_;
  }, [selectedCategory, sortDirection_]);
  const setSortKey = useCallback(
    (key: SortKey | undefined) => {
      setSortKey_(key);
      if (key !== undefined) {
        logEvent([
          EventName.Assets.assetsListSorted,
          {
            sortedBy: key,
            sortDirection,
          },
        ]);
      }
    },
    [logEvent, sortDirection]
  );
  const sort = useMemo(
    () =>
      // disable sorting while searching on client to remove sort UI while searching
      !Boolean(searchQuery) && sortKey
        ? {
            keyPath: sortKey,
            direction: sortDirection,
          }
        : undefined,
    [searchQuery, sortKey, sortDirection]
  );

  // unverified assets
  const showUnverifiedAssetsSetting =
    userSettings.getUserSettingById<UnverifiedAssetsState>("unverified-assets");
  const showUnverifiedAssets = Boolean(
    showUnverifiedAssetsSetting?.state.showUnverifiedAssets
  );
  const [verifyAsset, setVerifiedAsset] = useState<{
    coinDenom: string;
    coinImageUrl?: string;
  } | null>(null);

  const { showPreviewAssets: includePreview } = useShowPreviewAssets();

  const { watchListDenoms, toggleWatchAssetDenom } = useUserWatchlist();

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
      search: searchQuery,
      onlyVerified: showUnverifiedAssets === false && !searchQuery,
      includePreview,
      sort,
      watchListDenoms,
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
      const topGainers = assetsData
        .filter((asset) => asset.isVerified)
        .slice(undefined, 3);
      return {
        topGainers: topGainers
          .map((asset) => asset.coinImageUrl)
          .filter((url): url is string => !!url),
      };
    } else return { topGainers: [] };
  }, [assetsData, selectedCategory]);
  const noSearchResults = Boolean(searchQuery) && !assetsData.length;

  // Define columns
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<AssetRow>();
    return [
      columnHelper.accessor((row) => row, {
        id: "asset",
        header: t("assets.table.asset"),
        cell: ({ row: { original } }) => (
          <AssetCell
            {...original}
            warnUnverified={showUnverifiedAssets && !original.isVerified}
            isInUserWatchlist={watchListDenoms.includes(original.coinDenom)}
            onClickWatchlist={() => toggleWatchAssetDenom(original.coinDenom)}
          />
        ),
      }),
      columnHelper.accessor((row) => row, {
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
        cell: ({
          row: {
            original: { currentPrice },
          },
        }) =>
          currentPrice && (
            <div>
              {currentPrice.symbol}
              <SubscriptDecimal decimal={currentPrice.toDec()} />
            </div>
          ),
      }),
      columnHelper.accessor((row) => row, {
        id: "priceChange1h",
        header: () => (
          <SortHeader
            label="1h"
            sortKey="priceChange1h"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
        cell: ({
          row: {
            original: { priceChange1h },
          },
        }) =>
          priceChange1h && (
            <PriceChange
              className="h-fit justify-end"
              priceChange={priceChange1h}
            />
          ),
      }),
      columnHelper.accessor((row) => row, {
        id: "priceChange24h",
        header: () => (
          <SortHeader
            label="24h"
            sortKey="priceChange24h"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
        cell: ({
          row: {
            original: { priceChange24h },
          },
        }) =>
          priceChange24h && (
            <PriceChange
              className="h-fit justify-end"
              priceChange={priceChange24h}
            />
          ),
      }),
      columnHelper.accessor((row) => row, {
        id: "priceChange7d",
        header: () => (
          <SortHeader
            label="7d"
            sortKey="priceChange7d"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
        cell: ({
          row: {
            original: { priceChange7d },
          },
        }) =>
          priceChange7d && (
            <PriceChange
              className="h-fit justify-end"
              priceChange={priceChange7d}
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
        header: t("assets.table.lastWeek"),
        cell: ({ row: { original } }) => (
          <AssetActionsCell
            {...original}
            showUnverifiedAssetsSetting={showUnverifiedAssets}
            confirmUnverifiedAsset={setVerifiedAsset}
          />
        ),
      }),
    ];
  }, [
    sortKey,
    sortDirection,
    showUnverifiedAssets,
    watchListDenoms,
    toggleWatchAssetDenom,
    setSortKey,
    t,
  ]);

  /** Columns collapsed for screen size responsiveness. */
  const collapsedColumns = useMemo(() => {
    const collapsedColIds: string[] = [];
    if (width < Breakpoint.xxl) collapsedColIds.push("priceChange7d");
    if (width < Breakpoint.xlhalf) collapsedColIds.push("priceChange1h");
    if (width < Breakpoint.xl) collapsedColIds.push("marketCap");
    if (width < Breakpoint.xlg) collapsedColIds.push("priceChart");
    if (width < Breakpoint.lg) collapsedColIds.push("priceChange24h");
    if (width < Breakpoint.md) collapsedColIds.push("assetActions");
    if (width < Breakpoint.sm) collapsedColIds.push("volume24h");
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
  // collect height of elements above table to inform virtualizer
  const [highlightsRef, { height: highlightsHeight }] =
    useDimension<HTMLDivElement>();
  const [categoriesRef, { height: categoriesHeight }] =
    useDimension<HTMLDivElement>();
  const [searchRef, { height: searchBoxHeight }] =
    useDimension<HTMLInputElement>();

  const totalTopOffset =
    highlightsHeight + categoriesHeight + searchBoxHeight + tableTopPadding;
  const navBarOffset = Number(
    isMobile
      ? theme.extend.height["navbar-mobile"].replace("px", "")
      : theme.extend.height.navbar.replace("px", "")
  );
  const topOffset = navBarOffset + totalTopOffset;
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
      <ActivateUnverifiedTokenConfirmation
        {...verifyAsset}
        isOpen={Boolean(verifyAsset)}
        onConfirm={() => {
          if (!verifyAsset) return;
          showUnverifiedAssetsSetting?.setState({
            showUnverifiedAssets: true,
          });
        }}
        onRequestClose={() => {
          setVerifiedAsset(null);
        }}
      />
      <section ref={highlightsRef} className="mb-4">
        <HighlightsCategories
          className="lg:-mx-4 lg:px-4"
          isCategorySelected={!!selectedCategory}
          onSelectAllTopGainers={onSelectTopGainers}
        />
      </section>
      <section ref={categoriesRef} className="mb-4">
        <AssetCategoriesSelectors
          selectedCategory={selectedCategory}
          hiddenCategories={useConst(["new", "topGainers"])}
          onSelectCategory={selectCategory}
          unselectCategory={unselectCategory}
          clientCategoryImageSamples={clientCategoryImageSamples}
        />
      </section>
      <SearchBox
        ref={searchRef}
        className="my-4 !w-[33.25rem] xl:!w-96 md:!w-full"
        currentValue={searchQuery?.query ?? ""}
        onInput={onSearchInput}
        placeholder={t("assets.table.search")}
        debounce={500}
      />
      <table
        className={classNames(
          "mt-3",
          isPreviousData &&
            isFetching &&
            "animate-[deepPulse_2s_ease-in-out_infinite] cursor-progress"
        )}
      >
        <thead className="sm:hidden">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <th
                  className={classNames(
                    // apply to all columns
                    "sm:w-fit",
                    {
                      // defines column widths after first column
                      "w-28": index !== 0,
                    }
                  )}
                  key={header.id}
                  colSpan={header.colSpan}
                >
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
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const { coinDenom, isVerified } = row.original;
            const unverified = !isVerified && !showUnverifiedAssets;

            return (
              <tr
                className="group transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-osmoverse-850"
                key={row.id}
                onClick={() => {
                  router.push(`/assets/${coinDenom}`);
                  logEvent([
                    EventName.Assets.assetClicked,
                    { tokenName: coinDenom },
                  ]);
                }}
              >
                {row.getVisibleCells().map((cell, index, cells) => (
                  <td
                    className={classNames(
                      "transition-colors duration-200 ease-in-out",
                      {
                        // unverified assets: opaque except for last cell with asset actions
                        "opacity-40": unverified && index !== cells.length - 1,
                      }
                    )}
                    key={cell.id}
                  >
                    <Link
                      href={`/assets/${coinDenom}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        logEvent([
                          EventName.Assets.assetClicked,
                          { tokenName: coinDenom },
                        ]);
                      }}
                      passHref
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Link>
                  </td>
                ))}
              </tr>
            );
          })}
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
      {noSearchResults && searchQuery?.query && (
        <NoSearchResultsSplash
          className="mx-auto w-fit py-8"
          query={searchQuery.query}
        />
      )}
    </div>
  );
});

// table cells

type AssetCellComponent<TProps = {}> = FunctionComponent<
  CellContext<AssetRow, AssetRow>["row"]["original"] & TProps
>;

export const AssetActionsCell: AssetCellComponent<{
  showUnverifiedAssetsSetting?: boolean;
  confirmUnverifiedAsset: (asset: {
    coinDenom: string;
    coinImageUrl?: string;
  }) => void;
}> = ({
  coinDenom,
  coinMinimalDenom,
  coinImageUrl,
  isVerified,
  showUnverifiedAssetsSetting,
  confirmUnverifiedAsset,
}) => {
  const { t } = useTranslation();

  const needsActivation = !isVerified && !showUnverifiedAssetsSetting;

  return (
    <div className="flex items-center gap-2 text-wosmongton-200">
      {needsActivation ? (
        <Button
          variant="ghost"
          className="flex gap-2 text-wosmongton-200 hover:text-rust-200"
          onClick={(e) => {
            e.preventDefault();

            confirmUnverifiedAsset({ coinDenom, coinImageUrl });
          }}
        >
          {t("assets.table.activate")}
        </Button>
      ) : (
        <HistoricalPriceSparkline
          coinMinimalDenom={coinMinimalDenom}
          timeFrame="1W"
        />
      )}
    </div>
  );
};
