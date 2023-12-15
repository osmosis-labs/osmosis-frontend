import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { FunctionComponent } from "react";

import {
  arrLengthEquals,
  boolEquals,
  boolEqualsString,
  listOptionValueEquals,
  strictEqualFilter,
} from "~/components/earn/table/utils";
import { useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { Intersection } from "../intersection";

export const AssetsInfoTable: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  const pageSize = 50;
  const {
    data: assetPagesData,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    fetchNextPage,
  } = api.edge.assets.getAssetInfos.useInfiniteQuery(
    {
      userOsmoAddress: account?.address,
      limit: pageSize,
    },
    {
      enabled: !isLoadingWallet,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
    }
  );
  const assetsData = assetPagesData?.pages.flatMap((page) => page?.items) ?? [];
  type AssetInfo = (typeof assetsData)[number];

  console.log({ isLoading });

  // Define columns
  const columnHelper = createColumnHelper<AssetInfo>();
  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row, {
        header: "Asset",
        id: "asset",
        cell: (cellProps) => {
          return <div>{cellProps.row.original.coinDenom}</div>;
        },
      }),
      columnHelper.accessor((row) => row, {
        header: "Price",
        id: "price",
        cell: (cellProps) => {
          return <div>{cellProps.row.original.coinDenom}</div>;
        },
      }),
      columnHelper.accessor((row) => row, {
        header: "",
        id: "priceChart",
        cell: (cellProps) => {
          return <div>{cellProps.row.original.coinDenom}</div>;
        },
      }),
      columnHelper.accessor((row) => row, {
        header: "Asset",
        id: "marketCap",
        cell: (cellProps) => {
          return <div>{cellProps.row.original.coinDenom}</div>;
        },
      }),
      columnHelper.accessor((row) => row, {
        header: "Balance",
        id: "balance",
        cell: (cellProps) => {
          return <div>{cellProps.row.original.coinDenom}</div>;
        },
      }),
      columnHelper.accessor((row) => row, {
        header: "",
        id: "assetActions",
        cell: (cellProps) => {
          return <div>{cellProps.row.original.coinDenom}</div>;
        },
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
          <tr
            className={classNames(
              "group bg-osmoverse-810 transition-colors duration-200 ease-in-out first:bg-osmoverse-810 hover:bg-osmoverse-850"
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
        ))}
        <Intersection
          onVisible={() => {
            console.log("onVisible");
            // If this element becomes visible at bottom of list, fetch next page
            if (!isFetchingNextPage && hasNextPage) {
              console.log("fetch next page");
              fetchNextPage();
            }
          }}
        />
      </tbody>
    </table>
  );
});
