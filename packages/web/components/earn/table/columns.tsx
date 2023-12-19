import { createColumnHelper, FilterFn } from "@tanstack/react-table";
import classNames from "classnames";
import { PropsWithChildren } from "react";

import {
  ActionsCell,
  LockCell,
  StrategyNameCell,
  TVLCell,
} from "~/components/earn/table/cells";
import { Strategy } from "~/components/earn/table/types/strategy";
import { TranslationPath, useTranslation } from "~/hooks";

declare module "@tanstack/table-core" {
  interface FilterFns {
    strictEqualFilter?: FilterFn<Strategy>;
    arrLengthEquals?: FilterFn<Strategy>;
    listOptionValueEquals?: FilterFn<Strategy>;
    boolEquals?: FilterFn<Strategy>;
    boolEqualsString?: FilterFn<Strategy>;
  }
}

const columnHelper = createColumnHelper<Strategy>();

export const ColumnCellHeader = ({
  className,
  tKey,
}: PropsWithChildren<{ tKey: TranslationPath; className?: string }>) => {
  const { t } = useTranslation();

  return (
    <small
      className={classNames(
        "whitespace-nowrap text-base font-subtitle2 font-semibold text-osmoverse-300",
        className
      )}
    >
      {t(tKey)}
    </small>
  );
};
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
            className={classNames("h-9 w-9 rounded-full bg-osmoverse-300", {
              "-ml-4": i > 0,
              "mr-2": item.getValue().length === 1,
            })}
          />
        ))}
      </div>
    ),
    enableHiding: true,
  }),
  columnHelper.accessor("strategyName", {
    header: () => <ColumnCellHeader tKey={"earnPage.strategyPlatform"} />,
    cell: (item) => (
      <StrategyNameCell
        name={item.getValue()}
        platformName={item.row.original.platform.displayName}
        strategyMethod={item.row.original.strategyMethod.displayName}
      />
    ),
  }),
  columnHelper.accessor("tvl.value", {
    header: () => <ColumnCellHeader tKey={"pools.TVL"} />,
    cell: TVLCell,
  }),
  columnHelper.accessor("apy", {
    header: () => <ColumnCellHeader tKey={"earnPage.apy"} />,
    cell: (item) => <ColumnCellCell>{item.getValue()}%</ColumnCellCell>,
  }),
  columnHelper.accessor("daily", {
    header: () => <ColumnCellHeader tKey={"earnPage.daily"} />,
    cell: (item) => <ColumnCellCell>{item.getValue()}%</ColumnCellCell>,
  }),
  columnHelper.accessor("reward", {
    header: () => <ColumnCellHeader tKey={"earnPage.reward"} />,
    cell: (item) => (
      <div className="relative flex items-center justify-end">
        {item.getValue().map((coin, i) => (
          <div
            key={`${coin} ${i} ${item.cell.id}`}
            className={classNames("h-9 w-9 rounded-full bg-osmoverse-300", {
              "-ml-4": i > 0,
              "mr-2": item.getValue().length === 1,
            })}
          />
        ))}
      </div>
    ),
    filterFn: "arrLengthEquals",
  }),
  columnHelper.accessor("lock", {
    header: () => <ColumnCellHeader tKey={"earnPage.lock"} />,
    cell: LockCell,
  }),
  columnHelper.accessor("risk", {
    header: () => <ColumnCellHeader tKey={"earnPage.risk"} />,
    cell: (item) => (
      <div className="flex items-center justify-end gap-1">
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <div
              key={`${item.cell.id} ${i} risk indicator`}
              className={classNames(`h-5 w-2 rounded-[10px] bg-osmoverse-700`, {
                "!bg-ion-400": i + 1 <= item.getValue(),
              })}
            />
          ))}
      </div>
    ),
  }),
  columnHelper.accessor("balance.quantity", {
    header: () => <ColumnCellHeader tKey={"assets.table.columns.balance"} />,
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
    cell: ActionsCell,
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
  columnHelper.accessor("hasLockingDuration", {
    header: () => {},
    cell: () => {},
    filterFn: "boolEquals",
    enableHiding: true,
  }),
  columnHelper.accessor("holdsTokens", {
    header: () => {},
    cell: () => {},
    filterFn: "boolEqualsString",
    enableHiding: true,
  }),
  columnHelper.accessor("chainType", {
    header: () => {},
    cell: () => {},
    filterFn: "listOptionValueEquals",
    enableHiding: true,
  }),
];
