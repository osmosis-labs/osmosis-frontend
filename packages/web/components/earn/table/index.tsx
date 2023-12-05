import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { observer } from "mobx-react-lite";

import { tableColumns } from "~/components/earn/table/columns";
import {
  arrLengthEquals,
  MOCK_tableData,
  strictEqualFilter,
} from "~/components/earn/table/utils";
import { useStrategyTableConfig } from "~/hooks/use-strategy-table-config";

interface StrategiesTableProps {
  showBalance: boolean;
}

const StrategiesTable = ({ showBalance }: StrategiesTableProps) => {
  const { columnFilters, globalFilter, setFilter } = useStrategyTableConfig();

  const table = useReactTable({
    data: MOCK_tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility: {
        balance_quantity: showBalance,
      },
      globalFilter,
      columnFilters,
    },
    filterFns: {
      strictEqualFilter,
      arrLengthEquals,
    },
    globalFilterFn: "includesString",
    onGlobalFilterChange: (e) => setFilter("search", e),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr className={`bg-transparent`} key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className={`${
                  header.index === 1 ? "text-left" : "text-right"
                } ${header.index === 0 ? "w-[108px]" : ""}`}
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
            className="bg-[#241E4B] transition-all duration-200 ease-in-out hover:bg-[#201A43]"
            key={row.id}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default observer(StrategiesTable);
