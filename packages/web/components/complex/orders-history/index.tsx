import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import React from "react";

import { tableColumns } from "~/components/complex/orders-history/columns";
import { Spinner } from "~/components/loaders";
import { useOrderbookAllActiveOrders } from "~/hooks/limit-orders/use-orderbook";
import { useAggregatedOrders } from "~/hooks/order-history/use-aggregated-orders";
import { useStore } from "~/stores";

export type Order = ReturnType<typeof useOrderbookAllActiveOrders>["orders"][0];

export const OrderHistory = observer(() => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  // In the future we need to merge in the past orders
  const { orders: _orders, isLoading } = useOrderbookAllActiveOrders({
    userAddress: wallet?.address ?? "",
  });

  const { orders } = useAggregatedOrders({ orders: _orders });

  const table = useReactTable<Order>({
    data: orders,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner className="!h-10 !w-10" />
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
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="!px-0">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
