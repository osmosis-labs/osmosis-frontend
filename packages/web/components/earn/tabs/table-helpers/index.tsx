import { createColumnHelper } from "@tanstack/react-table";
import { PropsWithChildren } from "react";

import { Button } from "~/components/buttons";

const columnHelper = createColumnHelper<Strategy>();

export interface Strategy {
  involvedTokens: string[]; // Tokens[]
  strategyMethod: {
    displayName: string;
    id: string;
  }; // status?
  platform: {
    displayName: string;
    id: string;
  }; // Chain,
  strategyName: string;
  tvl: {
    value: number;
    fluctuation: number;
  };
  apy: number;
  daily: number;
  reward: string[]; // Coin[],
  lock: number; // or Date,
  risk: number; // 1, 2 or 3 ??
  actions: {
    externalURL?: string;
    onClick?: () => void;
  };
  balance: {
    quantity: number;
    converted: string; // $ / € ...
  };
}

const ColumnCellHeader = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <small
    className={`text-base font-subtitle2 font-semibold text-osmoverse-300 ${className}`}
  >
    {children}
  </small>
);
const ColumnCellCell = ({ children }: PropsWithChildren<unknown>) => (
  <p className="text-white font-subtitle2 font-semibold">{children}</p>
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
  }),
  columnHelper.accessor("name.strategyName", {
    header: () => <ColumnCellHeader>Name</ColumnCellHeader>,
    cell: (item) => (
      <div className="flex items-center">
        <div className="flex flex-col">
          <p className="text-white font-subtitle1">{item.getValue()}</p>
          <div className="flex gap-2">
            <small className="text-sm font-subtitle1 text-osmoverse-400">
              {item.row.original.name.chain}
            </small>
            <div className="flex items-center justify-center rounded-xl bg-[#9D23E8] px-1.5">
              <span className="text-white text-sm font-subtitle1 leading-6">
                {item.row.original.name.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("tvl.value", {
    header: () => <ColumnCellHeader>TVL</ColumnCellHeader>,
    cell: (item) => (
      <div className="flex flex-col">
        <ColumnCellCell>{item.getValue()}</ColumnCellCell>
        <small className="text-xs font-subtitle2 font-medium text-bullish-400">
          {item.row.original.tvl.fluctuation}%
        </small>
      </div>
    ),
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
    cell: () => (
      <div className="flex items-center justify-center">
        <Button
          mode={"quaternary"}
          className="max-h-10 max-w-[88px] !rounded-3x4pxlinset !border-0 !bg-[#19183A]"
        >
          <p className="text-sm font-subtitle1 font-medium text-osmoverse-300">
            Join
          </p>
        </Button>
      </div>
    ),
  }),
];
