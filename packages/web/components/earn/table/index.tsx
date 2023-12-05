import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import { useContext, useMemo } from "react";

import { FilterContext } from "~/components/earn/filters/filter-context";
import { tableColumns } from "~/components/earn/table/columns";
import {
  arrLengthEquals,
  getDefaultFiltersState,
  MOCK_tableData,
  strictEqualFilter,
} from "~/components/earn/table/utils";

interface StrategiesTableProps {
  showBalance: boolean;
}

const StrategiesTable = ({ showBalance }: StrategiesTableProps) => {
  const { filters, setFilter } = useContext(FilterContext);
  const columnFilters = useMemo(
    () => getDefaultFiltersState(filters),
    [filters]
  );
  const { search } = filters;

  const table = useReactTable({
    data: MOCK_tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility: {
        balance_quantity: showBalance,
      },
      globalFilter: search,
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
