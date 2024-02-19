import { flexRender, useReactTable } from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

import { useStrategyTableConfig } from "~/hooks/use-strategy-table-config";
import { EarnStrategy } from "~/server/queries/numia/earn";
import { theme } from "~/tailwind.config";

interface StrategiesTableProps {
  showBalance: boolean;
  strategies: EarnStrategy[];
}

const StrategiesTable = ({ showBalance, strategies }: StrategiesTableProps) => {
  const { tableConfig } = useStrategyTableConfig(strategies ?? [], showBalance);
  const table = useReactTable(tableConfig);

  const { rows } = table.getRowModel();

  const topOffset = Number(theme.extend.height.navbar.replace("px", ""));

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 80,
    overscan: 10,
    paddingStart: topOffset,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const paddingTop = useMemo(
    () => (virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0),
    [virtualRows]
  );
  const paddingBottom = useMemo(
    () =>
      virtualRows.length > 0
        ? rowVirtualizer.getTotalSize() -
          (virtualRows?.[virtualRows.length - 1]?.end || 0)
        : 0,
    [rowVirtualizer, virtualRows]
  );

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
      }}
      className="overflow-x-auto overflow-y-hidden"
    >
      <table className="mb-12 w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className={classNames("text-right first:bg-osmoverse-850", {
                    "sticky left-[88px] bg-osmoverse-850 !text-left md:static md:left-0":
                      header.index === 1,
                    "sticky left-0 z-30 bg-osmoverse-850 !pl-4":
                      header.index === 0,
                  })}
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-osmoverse-810">
          {paddingTop > 0 && paddingTop - topOffset > 0 && (
            <tr>
              <td style={{ height: paddingTop - topOffset }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];

            return (
              <tr
                className={classNames(
                  "group transition-colors duration-200 ease-in-out first:bg-osmoverse-810 hover:bg-osmoverse-850"
                )}
                key={row.id}
              >
                {row.getVisibleCells().map((cell, rowIndex) => (
                  <td
                    className={classNames(
                      "!rounded-none bg-osmoverse-810 transition-colors duration-200 ease-in-out group-hover:bg-osmoverse-850",
                      {
                        "sticky left-0 z-30": rowIndex === 0,
                        "sticky left-[88px] z-30 md:static md:left-0":
                          rowIndex === 1,
                      }
                    )}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: paddingBottom - topOffset }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default observer(StrategiesTable);
