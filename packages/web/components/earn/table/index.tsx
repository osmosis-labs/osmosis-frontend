import { flexRender, useReactTable } from "@tanstack/react-table";
import classNames from "classnames";
import { observer } from "mobx-react-lite";

import { useWindowSize } from "~/hooks";
import { useStrategyTableConfig } from "~/hooks/use-strategy-table-config";

interface StrategiesTableProps {
  showBalance: boolean;
}

const StrategiesTable = ({ showBalance }: StrategiesTableProps) => {
  const { tableConfig } = useStrategyTableConfig(showBalance);
  const table = useReactTable(tableConfig);
  const { width } = useWindowSize();

  return (
    <div className="xl:no-scrollbar w-full xl:overflow-scroll">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className={classNames("text-right first:bg-osmoverse-850", {
                    "sticky left-rewards-w bg-osmoverse-850 !text-left":
                      header.index === 1,
                    "sticky left-0 z-30 w-rewards-w bg-osmoverse-850":
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
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              className={classNames(
                "group bg-osmoverse-810 transition-colors duration-200 ease-in-out first:bg-osmoverse-810 hover:bg-osmoverse-850"
              )}
              key={row.id}
            >
              {row.getVisibleCells().map((cell, rowIndex) => (
                <td
                  className={classNames(
                    "bg-osmoverse-810 transition-colors duration-200 ease-in-out group-hover:bg-osmoverse-850",
                    {
                      "md:sticky md:left-0 md:z-30": rowIndex === 0,
                      "sticky left-0 z-30": rowIndex === 0 && width > 768,
                      "sticky left-rewards-w z-30":
                        rowIndex === 1 && width > 768,
                    }
                  )}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default observer(StrategiesTable);
