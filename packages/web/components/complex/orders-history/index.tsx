import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";

import { Icon } from "~/components/assets";
import { tableColumns } from "~/components/complex/orders-history/columns";
import { Spinner } from "~/components/loaders";
import {
  DisplayableLimitOrder,
  useOrderbookAllActiveOrders,
} from "~/hooks/limit-orders/use-orderbook";
import { useStore } from "~/stores";

export type Order = ReturnType<typeof useOrderbookAllActiveOrders>["orders"][0];

export const OrderHistory = observer(() => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  // In the future we need to merge in the past orders
  const { orders, isLoading } = useOrderbookAllActiveOrders({
    userAddress: wallet?.address ?? "",
  });

  const table = useReactTable<DisplayableLimitOrder>({
    data: orders,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
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
          {filledOrders.length > 0 && (
            <>
              <tr>
                <td colSpan={5} className="!p-0">
                  <div className="flex w-full items-end justify-between pr-4">
                    <div className="relative flex items-end gap-3 pt-5">
                      <div className="flex items-center gap-2 pb-3">
                        <h6>Filled orders to claim</h6>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A51399]">
                          <span className="caption">1</span>
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
                    <button className="flex items-center justify-center rounded-[48px] bg-wosmongton-700 py-3 px-4">
                      <span className="subtitle1">Claim all</span>
                    </button>
                  </div>
                </td>
              </tr>
              {filledOrders.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="!px-0 !text-left">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          )}
          {pendingOrders.length > 0 && (
            <>
              <h6 className="pb-4 pt-8">Pending</h6>
              {pendingOrders.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="!px-0 !text-left">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          )}
          {pastOrders.length > 0 && (
            <>
              <h6 className="pb-4 pt-8">Past</h6>
              {pastOrders.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="!px-0 !text-left">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
});
