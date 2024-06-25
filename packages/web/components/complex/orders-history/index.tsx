import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import React from "react";

import { Icon } from "~/components/assets";
import { tableColumns } from "~/components/complex/orders-history/columns";
import { Spinner } from "~/components/loaders";
import { useOrderbookAllActiveOrders } from "~/hooks/limit-orders/use-orderbook";
import {
  AggregatedOrder,
  useAggregatedOrders,
} from "~/hooks/order-history/use-aggregated-orders";
import { useStore } from "~/stores";

export type Order = ReturnType<typeof useOrderbookAllActiveOrders>["orders"][0];

export const OrderHistory = observer(() => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  // In the future we need to merge in the past orders
  const { orders: _orders, isLoading } = useOrderbookAllActiveOrders({
    userAddress: wallet?.address ?? "",
  });

  const aggregated = useAggregatedOrders({ orders: _orders });

  const table = useReactTable<AggregatedOrder>({
    data: aggregated,
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
          <tr>
            <td className="relative flex items-end gap-3 !px-0 !pb-0 pt-5">
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
            </td>
            <td />
            <td />
            <td />
            <td className="flex justify-end !pl-0 pt-5 pr-4 !pb-0">
              <button className="flex items-center justify-center rounded-[48px] bg-wosmongton-700 py-3 px-4">
                <span className="subtitle1">Claim all</span>
              </button>
            </td>
          </tr>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="!px-0 !text-left">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {/**
           * When we will have the data available,
           * we will filter the data from the mapping
           * by a parameter which tells us the order type
           */}
          <h6 className="pb-4 pt-8">Pending</h6>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="!px-0 !text-left">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {/**
           * When we will have the data available,
           * we will filter the data from the mapping
           * by a parameter which tells us the order type
           */}
          <h6 className="pb-4 pt-8">Past</h6>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="!px-0 !text-left">
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
