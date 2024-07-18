import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";

import { Icon } from "~/components/assets";
import { tableColumns } from "~/components/complex/orders-history/columns";
import { Spinner } from "~/components/loaders";
import {
  DisplayableLimitOrder,
  useOrderbookAllActiveOrders,
  useOrderbookClaimableOrders,
} from "~/hooks/limit-orders/use-orderbook";
import { useStore } from "~/stores";

export type Order = ReturnType<typeof useOrderbookAllActiveOrders>["orders"][0];

export const OrderHistory = observer(() => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  const { orders, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useOrderbookAllActiveOrders({
      userAddress: wallet?.address ?? "",
      pageSize: 10,
    });

  const table = useReactTable<DisplayableLimitOrder>({
    data: orders,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { count, claimAllOrders } = useOrderbookClaimableOrders({
    userAddress: wallet?.address ?? "",
  });

  const filledOrders = useMemo(
    () =>
      table
        .getRowModel()
        .rows.filter((row) => row.original.status === "filled"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, orders]
  );

  const pendingOrders = useMemo(
    () =>
      table
        .getRowModel()
        .rows.filter(
          (row) =>
            row.original.status === "open" ||
            row.original.status === "partiallyFilled"
        ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, orders]
  );
  const pastOrders = useMemo(
    () =>
      table
        .getRowModel()
        .rows.filter(
          (row) =>
            row.original.status === "cancelled" ||
            row.original.status === "fullyClaimed"
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, orders]
  );

  const { rows } = table.getRowModel();

  const filledOrdersCount = useMemo(() => filledOrders.length, [filledOrders]);
  const pendingOrdersCount = useMemo(
    () => pendingOrders.length,
    [pendingOrders]
  );
  // Whether a filled header was added
  const hasFilledOrders = useMemo(
    () => (filledOrdersCount > 0 ? 1 : 0),
    [filledOrdersCount]
  );
  // Whether a pending header was added
  const hasPendingOrders = useMemo(
    () => (pendingOrdersCount > 0 ? 1 : 0),
    [pendingOrdersCount]
  );
  // Whether a past orders header was added
  const hasPastOrders = useMemo(
    () => (pastOrders.length > 0 ? 1 : 0),
    [pastOrders]
  );

  const rowVirtualizer = useWindowVirtualizer({
    // To account for headers we add an additional row to virtualization per header added
    count: rows.length + (hasFilledOrders + hasPendingOrders + hasPastOrders),
    estimateSize: () => 84,
    paddingStart: 272,
    overscan: 3,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

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
      lastRow.index ===
        lastVirtualRow.index -
          hasFilledOrders -
          hasPendingOrders -
          (pastOrders.length > 0 ? 1 : 0) &&
      canLoadMore
    )
      fetchNextPage();
  }, [
    lastRow,
    lastVirtualRow,
    canLoadMore,
    fetchNextPage,
    pastOrders,
    hasFilledOrders,
    hasPendingOrders,
  ]);

  const filledOrderRows = useMemo(() => {
    const minIndex = hasFilledOrders;
    const maxIndex = filledOrdersCount + hasFilledOrders;
    return virtualRows
      .filter((row) => row.index > minIndex && row.index <= maxIndex)
      .map((virtualRow) => {
        const row = rows[virtualRow.index - 1];
        return row;
      });
  }, [filledOrdersCount, rows, virtualRows, hasFilledOrders]);

  const pendingOrderRows = useMemo(() => {
    // Pending orders only adjust for any filled orders and if there was a filled orders header
    const minIndex = filledOrdersCount + hasFilledOrders;
    const maxIndex = filledOrdersCount + hasFilledOrders + pendingOrdersCount;
    return virtualRows
      .filter((row) => row.index > minIndex && row.index <= maxIndex)
      .map((virtualRow) => {
        const row = rows[virtualRow.index - (1 + hasFilledOrders)];
        return row;
      });
  }, [
    filledOrdersCount,
    hasFilledOrders,
    pendingOrdersCount,
    rows,
    virtualRows,
  ]);
  const pastOrderRows = useMemo(() => {
    // For past orders we must account for all of the previous orders and if they added headers
    const minIndex =
      filledOrdersCount +
      hasFilledOrders +
      pendingOrdersCount +
      hasPendingOrders;
    // Past orders fill the rest of the array so we account for that plus and headers
    const maxIndex = virtualRows.length - 1;
    console.log(minIndex, maxIndex);
    return virtualRows
      .filter((row) => row.index > minIndex && row.index <= maxIndex)
      .map((virtualRow) => {
        console.log(virtualRow.index);
        const row =
          rows[virtualRow.index - (1 + hasFilledOrders + hasPendingOrders)];
        return row;
      });
  }, [
    filledOrdersCount,
    hasFilledOrders,
    hasPendingOrders,
    pendingOrdersCount,
    rows,
    virtualRows,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner className="!h-10 !w-10" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <Image
          src="/images/ion-thumbs-up.svg"
          alt="ion thumbs up"
          width={120}
          height={80}
        />
        <h6>No recent orders</h6>
        <p className="body2 inline-flex items-center gap-1 text-osmoverse-300">
          Your trade order history will appear here.
          <Link href={"/"} className="text-wosmongton-300">
            Start trading
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col">
      <table>
        <thead className="border-b border-osmoverse-700">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="!border-0 bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: `${header.getSize()}px` }}
                  className="!px-0"
                  colSpan={header.colSpan}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-transparent">
          {paddingTop > 0 && paddingTop - 272 > 0 && (
            <tr>
              <td style={{ height: paddingTop - 272 }} />
            </tr>
          )}
          {filledOrdersCount > 0 && (
            <>
              <tr className="h-[84px]">
                <td colSpan={5} className="!p-0">
                  <div className="flex w-full items-end justify-between pr-4">
                    <div className="relative flex items-end gap-3 pt-5">
                      <div className="flex items-center gap-2 pb-3">
                        <h6>Filled orders to claim</h6>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A51399]">
                          <span className="caption">{count}</span>
                        </div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center">
                        <Icon
                          id="question"
                          className="h-6 w-6 text-wosmongton-200"
                          width={24}
                          height={24}
                        />
                      </div>
                    </div>
                    <button
                      className="flex items-center justify-center rounded-[48px] bg-wosmongton-700 py-3 px-4"
                      onClick={claimAllOrders}
                    >
                      <span className="subtitle1">Claim all</span>
                    </button>
                  </div>
                </td>
              </tr>
              {filledOrderRows.map((row) => {
                return (
                  <tr key={row.id} className="h-[84px]">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="!px-0 !text-left">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </>
          )}
          {pendingOrdersCount > 0 && (
            <>
              <h6 className="h-[84px] pb-4 pt-8">Pending</h6>
              {pendingOrderRows.map((row) => {
                return (
                  <tr key={row.id} className="h-[84px]">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="!px-0 !text-left">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </>
          )}
          {pastOrders.length > 0 && (
            <>
              <h6 className="h-[84px] pb-4 pt-8">Past</h6>
              {pastOrderRows.map((row) => {
                return (
                  <tr key={row.id} className="h-[84px]">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="!px-0 !text-left">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </>
          )}
          {isFetchingNextPage && (
            <tr>
              <td className="!text-center" colSpan={5}>
                <Spinner />
              </td>
            </tr>
          )}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: paddingBottom - 272 }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});
