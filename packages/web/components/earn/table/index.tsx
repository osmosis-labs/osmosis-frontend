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
    <div className="1.5lg:no-scrollbar w-full 1.5lg:overflow-scroll">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className={`bg-transparent`} key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className={classNames("text-right first:bg-osmoverse-850", {
                    "sticky left-0 bg-osmoverse-850 !text-left":
                      header.index === 1,
                    "w-[108px] md:sticky md:left-0 md:z-30": header.index === 0,
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
                "group bg-[#241E4B] transition-colors duration-200 ease-in-out first:bg-[#241E4B] hover:bg-osmoverse-850"
              )}
              key={row.id}
            >
              {row.getVisibleCells().map((cell, rowIndex) => {
                console.log(rowIndex);
                return (
                  <td
                    className={classNames(
                      "bg-[#241E4B] transition-colors duration-200 ease-in-out group-hover:bg-osmoverse-850",
                      {
                        "md:sticky md:left-0 md:z-30": rowIndex === 0,
                        "sticky left-0 z-30": rowIndex <= 1 && width > 768,
                      }
                    )}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default observer(StrategiesTable);
