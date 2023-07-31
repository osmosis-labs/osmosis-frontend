import { flexRender, Row, Table } from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { Icon } from "~/components/assets";
import { AssetCard } from "~/components/cards";
import { IS_FRONTIER } from "~/config";
import { useWindowSize } from "~/hooks";
import { ObservablePoolWithMetric } from "~/stores/derived-data";

type Props = {
  mobileSize?: number;
  paginate: () => void;
  size: number;
  table: Table<ObservablePoolWithMetric>;
  topOffset: number;
};

export const PaginatedTable = ({
  mobileSize,
  paginate,
  size,
  table,
  topOffset,
}: Props) => {
  const { isMobile } = useWindowSize();

  const { rows } = table.getRowModel();
  const router = useRouter();

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

  const lastRow = rows[rows.length - 1];
  const lastVirtualRow = virtualRows[virtualRows.length - 1];
  useEffect(() => {
    let isMounted = true; // helps us avoid react console warnings

    if (
      isMounted &&
      lastRow &&
      lastVirtualRow &&
      lastRow.index === lastVirtualRow.index
    ) {
      paginate();
    }

    return () => {
      isMounted = false; // cleanup
    };
  }, [lastRow, lastVirtualRow, paginate]);

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
              key={row.original.queryPool.id}
              href={`/pool/${row.original.queryPool.id}`}
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
                <MobileTableRow row={row} />
              </a>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, i) => (
              <th key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder ? null : (
                  <div
                    className={classNames(
                      {
                        "flex cursor-pointer select-none items-center gap-2":
                          header.column.getCanSort(),
                      },
                      i === 0 ? "justify-start" : "justify-end"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: (
                        <Icon
                          id="sort-up"
                          className={classNames(
                            "h-[16px] w-[7px]",
                            IS_FRONTIER
                              ? "text-white-full"
                              : "text-osmoverse-300"
                          )}
                        />
                      ),
                      desc: (
                        <Icon
                          id="sort-down"
                          className={classNames(
                            "h-[16px] w-[7px]",
                            IS_FRONTIER
                              ? "text-white-full"
                              : "text-osmoverse-300"
                          )}
                        />
                      ),
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {paddingTop > 0 && (
          <tr>
            <td style={{ height: `${paddingTop - topOffset}px` }} />
          </tr>
        )}
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index] as Row<ObservablePoolWithMetric>;
          return (
            <tr
              key={row.id}
              className="transition-colors focus-within:bg-osmoverse-700 focus-within:outline-none hover:cursor-pointer hover:bg-osmoverse-800"
              onClick={() => router.push(`/pool/${row.original.queryPool.id}`)}
            >
              {row.getVisibleCells().map((cell) => {
                return (
                  <td key={cell.id}>
                    <Link
                      href={`/pool/${row.original.queryPool.id}`}
                      key={virtualRow.index}
                      passHref
                    >
                      <a onClick={(e) => e.stopPropagation()}>
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

const MobileTableRow = observer(
  ({ row }: { row: Row<ObservablePoolWithMetric> }) => {
    const poolAssets = row.original.queryPool.poolAssets.map((poolAsset) => ({
      coinImageUrl: poolAsset.amount.currency.coinImageUrl,
      coinDenom: poolAsset.amount.currency.coinDenom,
    }));

    return (
      <AssetCard
        coinDenom={poolAssets.map((asset) => asset.coinDenom).join("/")}
        metrics={[
          {
            label: "TVL",
            value: row.original.liquidity.toString(),
          },
          {
            label: "APR",
            value: row.original.apr.toString(),
          },
        ]}
        coinImageUrl={poolAssets}
      />
    );
  }
);
