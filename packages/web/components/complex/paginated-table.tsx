import { flexRender, Table } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { IS_FRONTIER } from "../../config";
import useOnScreen from "../../hooks/use-on-screen";
import { Pool } from "./all-pools-table-set";

type Props = {
  paginate: () => void;
  table: Table<Pool>;
};

const PaginatedTable = ({ paginate, table }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const entry = useOnScreen(ref, {});
  const shouldLoad = !!entry?.isIntersecting;

  useEffect(() => {
    if (shouldLoad) paginate();
  }, [shouldLoad]);

  if (!table) return null;

  return (
    <table className="my-5 w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
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
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="h-20 transition-colors focus-within:bg-osmoverse-700 focus-within:outline-none  hover:cursor-pointer hover:bg-osmoverse-800"
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {row.original[0].poolId ? (
                  <Link href={`/pool/${row.original[0].poolId}`}>
                    <a className="focus:outline-none">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </a>
                  </Link>
                ) : (
                  flexRender(cell.column.columnDef.cell, cell.getContext())
                )}
              </td>
            ))}
          </tr>
        ))}
        <div ref={ref} />
      </tbody>
      <tfoot>
        {table.getFooterGroups().map((footerGroup) => (
          <tr key={footerGroup.id}>
            {footerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.footer,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </tfoot>
    </table>
  );
};

export default PaginatedTable;
