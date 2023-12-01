import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  discoverColumns,
  Strategy,
} from "~/components/earn/tabs/table-helpers";

const MOCK_tableData: Strategy[] = [
  {
    involvedTokens: ["OSMO", "MARS"],
    name: {
      chain: "Quasar",
      status: "LP",
      strategyName: "ATOM Pro M+ Vault",
    },
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
  },
  {
    involvedTokens: ["OSMO", "FDAI"],
    name: {
      chain: "Levana",
      status: "Perp LP",
      strategyName: "OSMO Levana xLP",
    },
    tvl: {
      value: 10290316,
      fluctuation: 4.5,
    },
    apy: 10.94,
    daily: 0.0008,
    reward: ["FDAI"],
    lock: 14,
    risk: 1,
    actions: {
      onClick: () => {},
    },
  },
];

export const StrategiesTable = () => {
  const table = useReactTable({
    data: MOCK_tableData,
    columns: discoverColumns,
    getCoreRowModel: getCoreRowModel(),
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
                } ${header.index === 0 ? "max-w-[108px]" : ""}`}
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
