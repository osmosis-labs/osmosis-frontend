import { flexRender, Row, Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { IS_FRONTIER } from "../../config";
import { Pool } from "./all-pools-table-set";

const SIZE = 80;

type Props = {
  paginate: () => void;
  table: Table<Pool>;
};

const PaginatedTable = ({ table }: Props) => {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => SIZE,
    overscan: 5,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <div className="my-5 h-[500px] overflow-auto" ref={tableContainerRef}>
      <table className="w-full">
        <thead className="sticky top-0 z-20 m-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                  >
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
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
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
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaginatedTable;
