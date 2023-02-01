import { flexRender, Row, Table } from "@tanstack/react-table";
import Image from "next/image";
import { useRef } from "react";
import { useVirtual } from "react-virtual";
import { IS_FRONTIER } from "../../config";
import { Pool } from "./all-pools-table-set";

type Props = {
  paginate: () => void;
  table: Table<Pool>;
};

const PaginatedTable = ({ table }: Props) => {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtual({
    parentRef,
    size: rows.length,
    overscan: 5,
  });
  const { virtualItems: virtualRows } = rowVirtualizer;

  return (
    <div
      ref={parentRef}
      style={{
        height: "400px",
      }}
      className="my-5 w-full overflow-auto"
    >
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ width: header.getSize() }}
                >
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
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<Pool>;
            return (
              <tr key={row.id}>
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PaginatedTable;
