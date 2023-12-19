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
  arrLengthEquals,
  boolEquals,
  boolEqualsString,
  listOptionValueEquals,
  strictEqualFilter,
} from "~/components/earn/table/utils";
import {
  useTranslation,
  useUserFavoriteAssetDenoms,
  useWalletSelect,
} from "~/hooks";
import { useSearchQueryInput } from "~/hooks/input/use-search-query-input";
import { useConst } from "~/hooks/use-const";
import type { CommonHistoricalPriceTimeFrame } from "~/server/queries/complex/assets";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";
import type { Search } from "~/utils/search";
import type { SortDirection } from "~/utils/sort";
import { api, RouterOutputs } from "~/utils/trpc";

import { Icon } from "../assets";
import { Sparkline } from "../chart/sparkline";
import { SelectMenu } from "../control/select-menu";
import { SearchBox } from "../input";
import Spinner from "../spinner";
import { CustomClasses } from "../types";

type AssetInfo =
  RouterOutputs["edge"]["assets"]["getAssetInfos"]["items"][number];
type SortKey = "currentPrice" | "marketCap" | "usdValue" | undefined;

export const AssetsInfoTable: FunctionComponent<{
  /** Height of elements above the table in the window. Nav bar is already included. */
  tableTopPadding?: number;
}> = observer(({ tableTopPadding = 0 }) => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  // State
  const { favoritesList, addFavoriteDenom, removeFavoriteDenom } =
    useUserFavoriteAssetDenoms();

  const [searchQuery, setSearchQuery] = useState<Search | undefined>();

  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<CommonHistoricalPriceTimeFrame>("1D");

  const [sortKey, setSortKey] = useState<SortKey>();
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Query
  const {
    data: assetPagesData,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = api.edge.assets.getAssetInfos.useInfiniteQuery(
    {
      userOsmoAddress: account?.address,
      preferredDenoms: favoritesList,
      limit: 20,
      search: searchQuery,
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
              removeFavoriteDenom(cell.row.original.coinDenom)
            }
            onSetFavorite={() => addFavoriteDenom(cell.row.original.coinDenom)}
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
        cell: () => <div>buttons</div>,
      }),
    ],
    [
      favoritesList,
      columnHelper,
      selectedTimeFrame,
      sortKey,
      sortDirection,
      addFavoriteDenom,
      removeFavoriteDenom,
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
    filterFns: {
      /**
       * these filters, even though they are not used in this table instance,
       * are necessary to suppress errors derived by the "@tanstack/table-core"
       * module declaration in the earn page.
       *
       * @fabryscript
       */
      arrLengthEquals,
      strictEqualFilter,
      boolEquals,
      boolEqualsString,
      listOptionValueEquals,
    },
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
      />
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className={classNames("subtitle1", {
                    "w-96 !text-left": header.index === 0,
                    "text-right": header.index > 0,
                  })}
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
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: paddingTop - topOffset }} />
            </tr>
          )}
          {isLoading && (
            <tr>
              <td className="text-center" colSpan={columns.length}>
                <Spinner />
              </td>
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];

            return (
              <tr
                className="group rounded-3xl transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-osmoverse-850"
                key={row.id}
              >
                {row.getVisibleCells().map((cell, cellIndex, cells) => (
                  <td
                    className={classNames(
                      "transition-colors duration-200 ease-in-out",
                      {
                        "rounded-l-3xl text-left": cellIndex === 0,
                        "text-right": cellIndex > 0,
                        "rounded-r-3xl": cellIndex === cells.length - 1,
                      }
                    )}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {isFetchingNextPage && (
            <tr>
              <td className="text-center" colSpan={columns.length}>
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
}) => {
  const [isHover, setHover] = useState(false);

  return (
    <div
      className={classNames("flex items-center gap-2", {
        "opacity-40": !isVerified,
      })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {isFavorite || isHover ? (
        <div className="cursor-pointer">
          <Icon
            id="star"
            className={classNames(
              isHover ? "text-osmoverse-600" : "text-wosmongton-400"
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
      ) : (
        <div style={{ height: 24, width: 24 }} />
      )}
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
};

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
  timeFrame: CommonHistoricalPriceTimeFrame;
}> = ({
  row: {
    original: { coinDenom, priceChange24h },
  },
  timeFrame,
}) => {
  const { data: recentPrices } =
    api.edge.assets.getAssetHistoricalPrice.useQuery({
      coinDenom,
      timeFrame,
    });

  const recentPriceCloses = useMemo(
    () => (recentPrices ? recentPrices.map((p) => p.close) : []),
    [recentPrices]
  );

  if (!recentPriceCloses || recentPriceCloses.length === 0)
    return <div className="w-20" />;

  const isBullish = priceChange24h && priceChange24h.toDec().isPositive();
  const isBearish = priceChange24h && priceChange24h.toDec().isNegative();

  return (
    <Sparkline
      width={80}
      height={50}
      lineWidth={2}
      data={recentPriceCloses}
      color={
        isBullish
          ? theme.colors.bullish[400]
          : isBearish
          ? theme.colors.ammelia[400]
          : theme.colors.wosmongton[200]
      }
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

const SortHeader: FunctionComponent<
  {
    label: string;
    sortKey: NonNullable<SortKey>;
    currentSortKey: SortKey;
    currentDirection: SortDirection;
    setSortKey: (key: SortKey) => void;
    setSortDirection: (direction: SortDirection) => void;
  } & CustomClasses
> = ({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  setSortDirection,
  setSortKey,
  className,
}) => (
  <button
    className={classNames(
      "ml-auto flex h-6 items-center justify-center gap-1",
      className
    )}
    onClick={() => {
      if (currentSortKey !== sortKey) {
        // select to sort and start descending
        setSortKey(sortKey as SortKey);
        setSortDirection("desc");
        return;
      } else if (currentSortKey === sortKey && currentDirection === "desc") {
        // toggle sort direction
        setSortDirection("asc");
        return;
      } else if (currentSortKey === sortKey && currentDirection === "asc") {
        // deselect
        setSortKey(undefined);
        setSortDirection("desc");
      }
    }}
  >
    <span>{label}</span>
    {currentSortKey === sortKey && (
      <Icon
        width={10}
        height={6}
        className={classNames(
          "ml-1 transform text-osmoverse-400 transition-transform",
          {
            "rotate-180": currentDirection === "asc",
          }
        )}
        id="triangle-down"
      />
    )}
  </button>
);

const TableControls: FunctionComponent<{
  selectedTimeFrame: CommonHistoricalPriceTimeFrame;
  setSelectedTimeFrame: (timeFrame: CommonHistoricalPriceTimeFrame) => void;
  setSearchQuery: (searchQuery: Search | undefined) => void;
}> = ({ selectedTimeFrame, setSelectedTimeFrame, setSearchQuery }) => {
  const { t } = useTranslation();

  const [searchInput, _, setSearchInput, searchQueryInput] =
    useSearchQueryInput();

  // Pass search query in an effect to prevent rendering the entire table on every input change
  // Only on debounced search query input
  useEffect(
    () => setSearchQuery(searchQueryInput),
    [setSearchQuery, searchQueryInput]
  );

  return (
    <div className="flex h-12 w-full items-center gap-2">
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
        ] as { id: CommonHistoricalPriceTimeFrame; display: string }[])}
        defaultSelectedOptionId={selectedTimeFrame}
        onSelect={useCallback(
          (id: string) =>
            setSelectedTimeFrame(id as CommonHistoricalPriceTimeFrame),
          [setSelectedTimeFrame]
        )}
      />
    </div>
  );
};
