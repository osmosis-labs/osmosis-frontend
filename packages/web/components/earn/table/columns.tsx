import { createColumnHelper, FilterFn } from "@tanstack/react-table";
import { PropsWithChildren } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { StrategyNameCell, TVLCell } from "~/components/earn/table/cells";
import { Strategy } from "~/components/earn/table/types/strategy";

declare module "@tanstack/table-core" {
  interface FilterFns {
    strictEqualFilter?: FilterFn<Strategy>;
    arrLengthEquals?: FilterFn<Strategy>;
  }
}

const columnHelper = createColumnHelper<Strategy>();

export const ColumnCellHeader = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <small
    className={`whitespace-nowrap text-base font-subtitle2 font-semibold text-osmoverse-300 ${className}`}
  >
    {children}
  </small>
);
export const ColumnCellCell = ({ children }: PropsWithChildren<unknown>) => (
  <p className="text-white font-subtitle2 font-semibold 1.5xs:text-sm">
    {children}
  </p>
);

export const tableColumns = [
  columnHelper.accessor("involvedTokens", {
    header: () => {},
    cell: (item) => (
      <div className="relative flex items-center justify-end">
        {item.getValue().map((coin, i) => (
          <div
            key={`${coin} ${i} ${item.cell.id}`}
            className={`h-9 w-9 rounded-full bg-osmoverse-300 ${
              i > 0 ? "-ml-4" : ""
            }`}
          />
        ))}
      </div>
    ),
    enableHiding: true,
  }),
  columnHelper.accessor("strategyName", {
    header: () => <ColumnCellHeader>Strategy / Platform</ColumnCellHeader>,
    cell: (item) => (
      <StrategyNameCell
        name={item.getValue()}
        platformName={item.row.original.platform.displayName}
        strategyMethod={item.row.original.strategyMethod.displayName}
      />
    ),
  }),
  columnHelper.accessor("strategyMethod.id", {
    header: () => {},
    cell: () => {},
    filterFn: "strictEqualFilter",
    enableHiding: true,
  }),
  columnHelper.accessor("platform.id", {
    header: () => {},
    cell: () => {},
    filterFn: "strictEqualFilter",
    enableHiding: true,
  }),
  columnHelper.accessor("tvl.value", {
    header: () => <ColumnCellHeader>TVL</ColumnCellHeader>,
    cell: TVLCell,
  }),
  columnHelper.accessor("apy", {
    header: () => <ColumnCellHeader>APY</ColumnCellHeader>,
    cell: (item) => <ColumnCellCell>{item.getValue()}%</ColumnCellCell>,
  }),
  columnHelper.accessor("daily", {
    header: () => <ColumnCellHeader>Daily</ColumnCellHeader>,
    cell: (item) => <ColumnCellCell>{item.getValue()}%</ColumnCellCell>,
  }),
  columnHelper.accessor("reward", {
    header: () => (
      <ColumnCellHeader className="text-center">Reward</ColumnCellHeader>
    ),
    cell: (item) => (
      <div className={`relative flex items-center justify-end`}>
        {item.getValue().map((coin, i) => (
          <div
            key={`${coin} ${i} ${item.cell.id}`}
            className={`h-9 w-9 rounded-full bg-osmoverse-300 ${
              i > 0 ? "-ml-4" : item.getValue().length === 1 ? "mr-2" : ""
            }`}
          />
        ))}
      </div>
    ),
    filterFn: "arrLengthEquals",
  }),
  columnHelper.accessor("lock", {
    header: () => <ColumnCellHeader>Lock</ColumnCellHeader>,
    cell: (item) => (
      <div className="flex flex-col">
        <ColumnCellCell>{item.getValue()}</ColumnCellCell>
        <small className="text-sm font-subtitle2 text-osmoverse-400">
          days
        </small>
      </div>
    ),
  }),
  columnHelper.accessor("risk", {
    header: () => (
      <ColumnCellHeader className="text-center">Risk</ColumnCellHeader>
    ),
    cell: (item) => (
      <div className="flex items-center justify-end gap-1">
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <div
              key={`${item.cell.id} ${i} risk indicator`}
              className={`h-5 w-2 rounded-[10px] ${
                i + 1 <= item.getValue() ? "bg-ion-400" : "bg-osmoverse-700"
              }`}
            />
          ))}
      </div>
    ),
  }),
  columnHelper.accessor("balance.quantity", {
    header: () => (
      <ColumnCellHeader className="text-center">Balance</ColumnCellHeader>
    ),
    cell: (item) => (
      <div className="flex flex-col">
        <ColumnCellCell>{item.getValue()}</ColumnCellCell>
        <small className="text-xs font-subtitle2 font-medium text-osmoverse-300">
          {item.row.original.balance.converted}
        </small>
      </div>
    ),
    enableHiding: true,
  }),
  columnHelper.accessor("actions", {
    header: () => {},
    cell: (item) => (
      <div className="flex items-center justify-center">
        <Button
          onClick={item.getValue().onClick}
          mode={"quaternary"}
          className="group/button mr-0 inline-flex max-h-10 w-24 transform items-center justify-center gap-1 rounded-3x4pxlinset border-0 !bg-[#19183A] transition-all duration-300 ease-in-out hover:!bg-wosmongton-700"
        >
          <p className="text-sm font-subtitle1 font-medium text-osmoverse-300">
            Join
          </p>
          {item.getValue().externalURL ? (
            <Icon
              id="arrow-up-right"
              className="h-4.5 w-0 opacity-0 transition-all duration-200 ease-in-out group-hover/button:w-4.5 group-hover/button:opacity-100"
            />
          ) : (
            <Icon
              id="arrow-right"
              className="h-4.5 w-0 opacity-0 transition-all duration-200 ease-in-out group-hover/button:w-4.5 group-hover/button:opacity-100"
            />
          )}
        </Button>
      </div>
    ),
  }),
];
