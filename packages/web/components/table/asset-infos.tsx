import {
  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useMemo } from "react";
import { FunctionComponent } from "react";

import {
  arrLengthEquals,
  boolEquals,
  boolEqualsString,
  listOptionValueEquals,
  strictEqualFilter,
} from "~/components/earn/table/utils";
import { useUserFavoriteAssetDenoms, useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api, RouterOutputs } from "~/utils/trpc";

import { Icon } from "../assets";

type AssetInfo =
  RouterOutputs["edge"]["assets"]["getAssetInfos"]["items"][number];

export const AssetsInfoTable: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  const { data: assetPagesData } =
    api.edge.assets.getAssetInfos.useInfiniteQuery(
      {
        userOsmoAddress: account?.address,
        limit: 20,
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
        cell: AssetCell,
      }),
      columnHelper.accessor((row) => row, {
        header: "Price (1D)",
        id: "price",
        cell: PriceCell,
      }),
      columnHelper.accessor((row) => row, {
        header: "",
        id: "priceChart",
        cell: () => <div>sparklines</div>,
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
    [columnHelper]
  );

  const table = useReactTable({
    data: assetsData,
    columns,
    manualSorting: true,
    manualFiltering: true,
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

  return (
    <table className="w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr className="bg-transparent" key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className={classNames("text-right first:bg-osmoverse-850", {
                  "sticky left-rewards-w bg-osmoverse-850 !text-left":
                    header.index === 1,
                  "sticky left-0 z-30 w-rewards-w bg-osmoverse-850":
                    header.index === 0,
                })}
                key={header.id}
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
        {table.getRowModel().rows.map((row) => (
          <>
            <tr
              className={classNames(
                "group bg-osmoverse-900 transition-colors duration-200 ease-in-out hover:bg-osmoverse-850"
              )}
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  className={classNames(
                    "bg-osmoverse-810 transition-colors duration-200 ease-in-out group-hover:bg-osmoverse-850"
                  )}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          </>
        ))}
      </tbody>
    </table>
  );
});

type AssetInfoCellComponent = FunctionComponent<
  CellContext<AssetInfo, AssetInfo>
>;

const AssetCell: AssetInfoCellComponent = ({
  row: {
    original: { coinDenom, coinName, coinImageUrl, isVerified },
  },
}) => {
  const { favoritesList, addFavoriteDenom, removeFavoriteDenom } =
    useUserFavoriteAssetDenoms();

  const isFavorite = favoritesList.includes(coinDenom);

  return (
    <div
      className={classNames("flex items-center gap-2", {
        "opacity-40": !isVerified,
      })}
    >
      {isFavorite ? (
        <div className="cursor-pointer">
          <Icon
            id="star"
            className="text-wosmongton-400"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              if (isFavorite) removeFavoriteDenom(coinDenom);
              else addFavoriteDenom(coinDenom);
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
          <span className="text-left text-osmoverse-400">{coinName}</span>
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

const MarketCapCell: AssetInfoCellComponent = ({
  row: {
    original: { marketCap, marketCapRank },
  },
}) => (
  <div className="flex flex-col">
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
  <div className="flex flex-col">
    {amount && (
      <span className="subtitle1">
        {formatPretty(amount.hideDenom(true), { maxDecimals: 8 })}
      </span>
    )}
    {usdValue && (
      <span className="caption text-osmoverse-300">{usdValue.toString()}</span>
    )}
  </div>
);
