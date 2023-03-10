import { flexRender, Row, Table } from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { IS_FRONTIER } from "../../config";
import { useWindowSize } from "../../hooks";
import { useOnScreen } from "../../hooks/use-on-screen";
import { Pool } from "./all-pools-table";

type Props = {
  mobileSize?: number;
  paginate: () => void;
  renderMobileItem?: (row: Row<Pool>) => React.ReactNode;
  size: number;
  table: Table<Pool>;
};

const PaginatedTable = ({
  mobileSize,
  paginate,
  renderMobileItem,
  size,
  table,
}: Props) => {
  const { isMobile } = useWindowSize();

  const { rows } = table.getRowModel();
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => (isMobile ? mobileSize || 0 : size),
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
    if (shouldLoad) {
      console.log("fetching more");
      paginate();
    }
  }, [paginate, shouldLoad, table, virtualRows.length]);

  if (isMobile) {
    return (
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index] as Row<Pool>;
          return (
            <div
              key={row.original[0].poolId}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderMobileItem?.(row)}
            </div>
          );
        })}
      </div>
    );
  }

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
        {virtualRows.map((virtualRow, i) => {
          const row = rows[virtualRow.index] as Row<Pool>;
          return (
            <tr
              key={row.id}
              className="transition-colors focus-within:bg-osmoverse-700 focus-within:outline-none hover:cursor-pointer hover:bg-osmoverse-800"
              ref={i === virtualRows.length - 1 ? loaderRef : null}
            >
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
  );
};

export default PaginatedTable;
