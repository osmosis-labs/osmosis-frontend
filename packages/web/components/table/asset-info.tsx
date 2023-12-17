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
import { FunctionComponent, useEffect, useMemo, useState } from "react";

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
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";
import { api, RouterOutputs } from "~/utils/trpc";

import { Icon } from "../assets";
import { Sparkline } from "../chart/sparkline";
import { SearchBox } from "../input";
import Spinner from "../spinner";

type AssetInfo =
  RouterOutputs["edge"]["assets"]["getAssetInfos"]["items"][number];

export const AssetsInfoTable: FunctionComponent<{
  /** Height of elements above the table in the window. Nav bar is already included. */
  tableTopPadding?: number;
}> = observer(({ tableTopPadding = 0 }) => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();
  const { t } = useTranslation();

  const { favoritesList, addFavoriteDenom, removeFavoriteDenom } =
    useUserFavoriteAssetDenoms();

  const [searchInput, _, setSearchInput, searchQueryInput] =
    useSearchQueryInput();

  const pageSize = 20;
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
      limit: pageSize,
      search: searchQueryInput,
    },
    {
      enabled: !isLoadingWallet,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
    }
  );
  const assetsData = assetPagesData?.pages.flatMap((page) => page?.items) ?? [];

  // Define columns
  const columnHelper = createColumnHelper<AssetInfo>();
  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row, {
        header: "Name",
        id: "asset",
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
        header: "Price (1D)",
        id: "price",
        cell: PriceCell,
      }),
      columnHelper.accessor((row) => row, {
        header: "",
        id: "priceChart",
        cell: SparklineChartCell,
      }),
      columnHelper.accessor((row) => row, {
        header: "Market Cap",
        id: "marketCap",
        cell: MarketCapCell,
      }),
      columnHelper.accessor((row) => row, {
        header: "Balance",
        id: "balance",
        cell: BalanceCell,
      }),
      columnHelper.accessor((row) => row, {
        header: "",
        id: "assetActions",
        cell: () => <div>buttons</div>,
      }),
    ],
    [favoritesList, columnHelper, addFavoriteDenom, removeFavoriteDenom]
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
      <div className="flex w-full items-center">
        <SearchBox
          className="!w-full"
          currentValue={searchInput}
          onInput={setSearchInput}
          placeholder={t("assets.table.search")}
        />
      </div>
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className={classNames({
                    "!text-left": header.index === 0,
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
        <div className="subtitle1 flex flex-col place-content-center">
          <div className="flex">
            <span className="text-white-high">{coinDenom}</span>
          </div>
          <span className="text-osmoverse-400">{coinName}</span>
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

const SparklineChartCell: AssetInfoCellComponent = ({
  row: {
    original: { coinDenom, priceChange24h },
  },
}) => {
  const { data: recentPrices } =
    api.edge.assets.getAssetHistoricalPrice.useQuery({
      coinDenom,
      timeFrame: "1D",
    });

  const recentPriceCloses = useMemo(
    () => (recentPrices ? recentPrices.map((p) => p.close) : []),
    [recentPrices]
  );

  if (!recentPriceCloses || recentPriceCloses.length === 0) return null;

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
