import { flexRender, Row, Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import Link from "next/link";
import { MutableRefObject, useEffect, useRef } from "react";

import { useOnScreen } from "~/hooks/use-on-screen";

import { IS_FRONTIER } from "../../config";
import { Pool } from "./all-pools-table";

const SIZE = 80;

type Props = {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  paginate: () => void;
  table: Table<Pool>;
};

const PaginatedTable = ({ containerRef, paginate, table }: Props) => {
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => SIZE,
    overscan: 10,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  const loaderRef: any = useRef<HTMLDivElement>();
  const entry = useOnScreen(loaderRef, {});
  const shouldLoad = !!entry?.isIntersecting;

  useEffect(() => {
    if (
      virtualRows.length &&
      table.getRowModel().rows.length - virtualRows.length < 10 &&
      shouldLoad
    ) {
      paginate();
    }
  }, [paginate, shouldLoad, table, virtualRows.length]);

  return (
    <table className="w-full">
      <thead className="z-[51] m-0">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : "",
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: (
                          <Image
                            alt="ascending"
                            src={
                              IS_FRONTIER
                                ? "/icons/sort-up-white.svg"
                                : "/icons/sort-up.svg"
                            }
                            height={16}
                            width={16}
                          />
                        ),
                        desc: (
                          <Image
                            alt="descending"
                            src={
                              IS_FRONTIER
                                ? "/icons/sort-down-white.svg"
                                : "/icons/sort-down.svg"
                            }
                            height={16}
                            width={16}
                          />
                        ),
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {paddingTop > 0 && (
          <tr>
            <td style={{ height: `${paddingTop}px` }} />
          </tr>
        )}
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index] as Row<Pool>;
          return (
            <tr
              key={row.id}
              className="transition-colors focus-within:bg-osmoverse-700 focus-within:outline-none hover:cursor-pointer hover:bg-osmoverse-800"
            >
              {row.getVisibleCells().map((cell, i) => {
                return (
                  <td key={cell.id}>
                    <Link
                      href={`/pool/${row.original[0].poolId}`}
                      key={virtualRow.index}
                    >
                      <a className="focus:outline-none">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </a>
                    </Link>
                  </td>
                );
              })}
            </tr>
          );
        })}
        <div ref={loaderRef}>Should load</div>
        {paddingBottom > 0 && (
          <tr>
            <td style={{ height: `${paddingBottom}px` }} />
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default PaginatedTable;
