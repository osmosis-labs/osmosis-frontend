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
  const parentRef = useRef<HTMLDivElement | null>(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => SIZE,
    overscan: 5,
  });

  return (
    <>
      <div ref={parentRef} className="my-5 h-[400px] w-full overflow-auto">
        <div
          className={`h-[${rowVirtualizer.getTotalSize()}px] relative w-full`}
        >
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} colSpan={header.colSpan}>
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
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<Pool>;
                return (
                  <Link
                    href={`/pool/${row.original[0].poolId}`}
                    key={virtualRow.index}
                  >
                    <a className="focus:outline-none">
                      <tr
                        style={{
                          position: "absolute",
                          top: SIZE,
                          left: 0,
                          width: "100%",
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        {row.getVisibleCells().map((cell) => {
                          return (
                            <td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </a>
                  </Link>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PaginatedTable;
