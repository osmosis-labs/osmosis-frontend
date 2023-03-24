import { ObservablePoolWithMetric } from "@osmosis-labs/stores";
import { flexRender, Row, Table } from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { useIntersection } from "react-use";

import { IS_FRONTIER } from "../../config";
import { useWindowSize } from "../../hooks";

type Props = {
  mobileSize?: number;
  paginate: () => void;
  renderMobileItem?: (row: Row<ObservablePoolWithMetric>) => React.ReactNode;
  size: number;
  table: Table<ObservablePoolWithMetric>;
  topOffset: number;
};

const PaginatedTable = ({
  mobileSize,
  paginate,
  renderMobileItem,
  size,
  table,
  topOffset,
}: Props) => {
  const { isMobile } = useWindowSize();

  const { rows } = table.getRowModel();
  const router = useRouter();

  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: "0px",
    threshold: 0,
  });

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => (isMobile ? mobileSize || 0 : size),
    paddingStart: topOffset,
    overscan: 5,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() -
        (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  useEffect(() => {
    if (intersection && intersection.intersectionRatio < 1) {
      paginate();
    }
  }, [intersection, paginate]);

  if (isMobile) {
    return (
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize() - topOffset}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index] as Row<ObservablePoolWithMetric>;
          return (
            <Link
              key={row.original.pool.id}
              href={`/pool/${row.original.pool.id}`}
            >
              <a
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start - topOffset}px)`,
                }}
              >
                {renderMobileItem?.(row)}
              </a>
            </Link>
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
            <td style={{ height: `${paddingTop - topOffset}px` }} />
          </tr>
        )}
        {virtualRows.map((virtualRow, i) => {
          const row = rows[virtualRow.index] as Row<ObservablePoolWithMetric>;
          return (
            <tr
              key={row.id}
              className="transition-colors focus-within:bg-osmoverse-700 focus-within:outline-none hover:cursor-pointer hover:bg-osmoverse-800"
              ref={i === virtualRows.length - 1 ? intersectionRef : null}
              onClick={() => router.push(`/pool/${row.original.pool.id}`)}
            >
              {row.getVisibleCells().map((cell) => {
                return (
                  <td key={cell.id} onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/pool/${row.original.pool.id}`}
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
            <td style={{ height: `${paddingBottom - topOffset}px` }} />
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default PaginatedTable;
