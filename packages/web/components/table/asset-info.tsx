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
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useTranslation,
  useUserFavoriteAssetDenoms,
  useWalletSelect,
} from "~/hooks";
import { useSearchQueryInput } from "~/hooks/input/use-search-query-input";
import { useConst } from "~/hooks/use-const";
import { useShowPreviewAssets } from "~/hooks/use-show-preview-assets";
import type { CommonPriceChartTimeFrame } from "~/server/queries/complex/assets";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";
import type { Search } from "~/utils/search";
import type { SortDirection } from "~/utils/sort";
import { api, RouterOutputs } from "~/utils/trpc";

import { Icon } from "../assets";
import { Sparkline } from "../chart/sparkline";
import { MenuToggle } from "../control";
import { SelectMenu } from "../control/select-menu";
import { SearchBox } from "../input";
import Spinner from "../loaders/spinner";
import { SortHeader } from "./headers/sort";

type AssetInfo =
  RouterOutputs["edge"]["assets"]["getMarketAssets"]["items"][number];
type SortKey = "currentPrice" | "marketCap" | "usdValue" | undefined;

export const AssetsInfoTable: FunctionComponent<{
  /** Height of elements above the table in the window. Nav bar is already included. */
  tableTopPadding?: number;
  onDeposit: (coinMinimalDenom: string) => void;
  onWithdraw: (coinMinimalDenom: string) => void;
}> = observer(({ tableTopPadding = 0, onDeposit, onWithdraw }) => {
  const { chainStore, accountStore, userSettings } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  // State
  const { favoritesList, onAddFavoriteDenom, onRemoveFavoriteDenom } =
    useUserFavoriteAssetDenoms();

  const [searchQuery, setSearchQuery] = useState<Search | undefined>();

  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<CommonPriceChartTimeFrame>("1D");

  const [sortKey, setSortKey] = useState<SortKey>();
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [selectedView, setSelectedView] = useState<"myTokens" | "allTokens">(
    "allTokens"
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
      onlyPositiveBalances: selectedView === "myTokens",
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
  const columnHelper = createColumnHelper<AssetInfo>();
  const columns = useMemo(
    () => [
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
            label={`Price (${selectedTimeFrame})`}
            sortKey="currentPrice"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
        cell: PriceCell,
      }),
      columnHelper.accessor((row) => row, {
        id: "priceChart",
        header: "",
        cell: (cell) => (
          <SparklineChartCell {...cell} timeFrame={selectedTimeFrame} />
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
    ],
    [
      favoritesList,
      columnHelper,
      selectedTimeFrame,
      sortKey,
      sortDirection,
      onAddFavoriteDenom,
      onRemoveFavoriteDenom,
      onDeposit,
      onWithdraw,
    ]
  );

  const table = useReactTable({
    data: assetsData,
    columns,
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
    Number(theme.extend.height.navbar.replace("px", "")) + tableTopPadding;
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
      <TableControls
        selectedTimeFrame={selectedTimeFrame}
        setSelectedTimeFrame={setSelectedTimeFrame}
        setSearchQuery={setSearchQuery}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
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
              <td className="!text-center" colSpan={columns.length}>
                <Spinner />
              </td>
            </tr>
          )}
          {virtualRows.map((virtualRow) => (
            <tr
              className="group transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-osmoverse-850"
              key={rows[virtualRow.index].id}
            >
              {rows[virtualRow.index].getVisibleCells().map((cell) => (
                <td
                  className="transition-colors duration-200 ease-in-out"
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {isFetchingNextPage && (
            <tr>
              <td className="!text-center" colSpan={columns.length}>
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
    className={classNames("group flex items-center gap-2", {
      "opacity-40": !isVerified,
    })}
  >
    <div className="cursor-pointer">
      <Icon
        id="star"
        className={classNames(
          "text-osmoverse-600 transition-opacity group-hover:opacity-100",
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
    <div className="flex items-center gap-4">
      <div className="h-10 w-10">
        {coinImageUrl && (
          <Image alt={coinDenom} src={coinImageUrl} height={40} width={40} />
        )}
      </div>
      <div className="subtitle1 flex max-w-[200px] flex-col place-content-center">
        <div className="flex">
          <span className="text-white-high">{coinDenom}</span>
        </div>
        <span className="overflow-hidden overflow-ellipsis whitespace-nowrap text-osmoverse-400">
          {coinName}
        </span>
      </div>
    </div>
  </div>
);

const PriceCell: AssetInfoCellComponent = ({
  row: {
    original: { currentPrice, priceChange24h },
  },
}) => (
  <div className="flex flex-col">
    {currentPrice && (
      <span className="subtitle1">{currentPrice?.toString()}</span>
    )}
    {priceChange24h && (
      <span
        className={classNames("caption", {
          "text-bullish-400":
            priceChange24h && priceChange24h.toDec().isPositive(),
          "text-ammelia-400":
            priceChange24h && priceChange24h.toDec().isNegative(),
        })}
      >
        {priceChange24h && priceChange24h.toDec().isPositive() ? "+" : null}
        {priceChange24h.maxDecimals(1).toString()}
      </span>
    )}
  </div>
);

const SparklineChartCell: AssetInfoCellComponent<{
  timeFrame: CommonPriceChartTimeFrame;
}> = ({
  row: {
    original: { coinDenom, priceChange24h },
  },
  timeFrame,
}) => {
  const { data: recentPrices } =
    api.edge.assets.getAssetHistoricalPrice.useQuery(
      {
        coinDenom,
        timeFrame,
      },
      {
        staleTime: 1000 * 30, // 30 secs
      }
    );

  const recentPriceCloses = useMemo(
    () => (recentPrices ? recentPrices.map((p) => p.close) : []),
    [recentPrices]
  );

  if (!recentPriceCloses || recentPriceCloses.length === 0)
    return <div className="w-20" />;

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

  return (
    <Sparkline
      width={80}
      height={50}
      lineWidth={2}
      data={recentPriceCloses}
      color={color}
    />
  );
};

const MarketCapCell: AssetInfoCellComponent = ({
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
      className="h-8 w-8 rounded-full bg-osmoverse-860 p-1"
      onClick={() => onDeposit(coinMinimalDenom)}
    >
      <Icon className="m-auto" id="deposit" width={16} height={16} />
    </button>
    <button
      className="h-8 w-8 rounded-full bg-osmoverse-860 p-1"
      onClick={() => onWithdraw(coinMinimalDenom)}
    >
      <Icon className="m-auto" id="withdraw" width={16} height={16} />
    </button>
  </div>
);

const TableControls: FunctionComponent<{
  selectedTimeFrame: CommonPriceChartTimeFrame;
  setSelectedTimeFrame: (timeFrame: CommonPriceChartTimeFrame) => void;
  setSearchQuery: (searchQuery: Search | undefined) => void;
  selectedView: "myTokens" | "allTokens";
  setSelectedView: (view: "myTokens" | "allTokens") => void;
}> = ({
  selectedTimeFrame,
  setSelectedTimeFrame,
  setSearchQuery,
  selectedView,
  setSelectedView,
}) => {
  const { t } = useTranslation();

  const { searchInput, setSearchInput, queryInput } = useSearchQueryInput();

  // Pass search query in an effect to prevent rendering the entire table on every input change
  // Only on debounced search query input
  useEffect(() => setSearchQuery(queryInput), [setSearchQuery, queryInput]);

  return (
    <div className="flex h-12 w-full items-center gap-5">
      <div className="flex h-12 w-full gap-3">
        <SearchBox
          className="!w-full"
          currentValue={searchInput}
          onInput={setSearchInput}
          placeholder={t("assets.table.search")}
        />
        <SelectMenu
          classes={useConst({ container: "h-full" })}
          options={useConst([
            { id: "1H", display: "1H" },
            { id: "1D", display: "1D" },
            { id: "1W", display: "1W" },
            { id: "1M", display: "1M" },
          ] as { id: CommonPriceChartTimeFrame; display: string }[])}
          defaultSelectedOptionId={selectedTimeFrame}
          onSelect={useCallback(
            (id: string) =>
              setSelectedTimeFrame(id as CommonPriceChartTimeFrame),
            [setSelectedTimeFrame]
          )}
        />
      </div>
      <MenuToggle
        options={useConst([
          { id: "myTokens", display: "My Tokens" },
          { id: "allTokens", display: "All Tokens" },
        ])}
        selectedOptionId={selectedView as string}
        onSelect={(optionId) =>
          setSelectedView(optionId as "myTokens" | "allTokens")
        }
      />
    </div>
  );
};
