import {
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import { useContext, useMemo } from "react";

import {
  FilterContext,
  Filters,
} from "~/components/earn/filters/filter-context";
import { Strategy, tableColumns } from "~/components/earn/tabs/table-helpers";

const MOCK_tableData: Strategy[] = [
  {
    involvedTokens: ["OSMO", "MARS"],
    strategyMethod: {
      displayName: "LP",
      id: "lp",
    },
    platform: {
      displayName: "Quasar",
      id: "quasar",
    },
    strategyName: "ATOM Pro M+ Vault",
    tvl: {
      value: 10290316,
      fluctuation: 4.5,
    },
    apy: 10.94,
    daily: 0.0008,
    reward: ["OSMO", "MARS"],
    lock: 21,
    risk: 2,
    actions: {
      externalURL: "#",
    },
    balance: {
      quantity: 36849,
      converted: "$11,548.52",
    },
  },
  {
    involvedTokens: ["OSMO", "FDAI"],
    strategyMethod: {
      displayName: "Perp LP",
      id: "perp_lp",
    },
    platform: {
      displayName: "Levana",
      id: "levana",
    },
    strategyName: "OSMO Levana xLP",
    tvl: {
      value: 10290316,
      fluctuation: -2.5,
    },
    apy: 10.94,
    daily: 0.0008,
    reward: ["FDAI"],
    lock: 14,
    risk: 1,
    actions: {
      onClick: () => {},
    },
    balance: {
      quantity: 36849,
      converted: "$11,548.52",
    },
  },
];

const strictEqualFilter: FilterFn<Strategy> = (row, colID, _filterValue) => {
  const filterValue = _filterValue.value;
  if (filterValue === "") {
    return true;
  }
  return row.getValue(colID) === filterValue;
};

const arrLengthEquals: FilterFn<Strategy> = (row, colID, filterValue) => {
  const value = row.getValue(colID) as string[];

  switch (filterValue) {
    case "single":
      return value.length === 1;
    case "multi":
      return value.length > 1;
    default:
      return true;
  }
};

const _getKey = (k: keyof Filters) => {
  switch (k) {
    case "strategyMethod":
      return "strategyMethod_id";
    case "platform":
      return "platform_id";
    case "rewardType":
      return "reward";
    default:
      return k;
  }
};

const StrategiesTable = ({ showBalance }: { showBalance: boolean }) => {
  const { filters, setFilter } = useContext(FilterContext);
  const columnFilters = useMemo(
    () =>
      Object.entries(filters).map(([key, value]) => ({
        id: _getKey(key as keyof Filters),
        value,
      })),
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
        balance: showBalance,
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
