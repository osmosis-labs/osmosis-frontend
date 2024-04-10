import { EarnStrategy } from "@osmosis-labs/server";
import { createColumnHelper } from "@tanstack/react-table";
import classNames from "classnames";
import Image from "next/image";
import { PropsWithChildren } from "react";

import {
  ActionsCell,
  APYCell,
  LockCell,
  RiskCell,
  StrategyNameCell,
  StrategyTooltip,
  TVLCell,
} from "~/components/earn/table/cells";
import {
  arrLengthEquals,
  boolEqualsString,
  listOptionValueEquals,
  lockDurationFilter,
  multiListOptionValueEquals,
  sortDecValues,
  sortDurationValues,
} from "~/components/earn/table/utils";
import { Tooltip } from "~/components/tooltip";
import { TranslationPath, useTranslation } from "~/hooks";
import { formatPretty } from "~/utils/formatter";

const columnHelper = createColumnHelper<EarnStrategy>();

export const ColumnCellHeader = ({
  className,
  tKey,
  /**
   * Translation Key
   */
  tooltipDescription,
  tooltipClassname,
}: PropsWithChildren<{
  tKey: TranslationPath;
  tooltipDescription?: string;
  className?: string;
  tooltipClassname?: string;
}>) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      enablePropagation
      className={classNames("justify-end", tooltipClassname)}
      content={
        <StrategyTooltip
          header={t(tKey)}
          body={
            tooltipDescription && (
              <p className="text-caption text-osmoverse-300">
                {t(tooltipDescription)}
              </p>
            )
          }
        />
      }
    >
      <small
        className={classNames(
          "whitespace-nowrap text-base font-subtitle2 font-semibold text-osmoverse-300",
          className
        )}
      >
        {t(tKey)}
      </small>
    </Tooltip>
  );
};
export const ColumnCellCell = ({ children }: PropsWithChildren<unknown>) => (
  <p className="text-white font-subtitle2 font-semibold 1.5xs:text-sm">
    {children}
  </p>
);

export const tableColumns = [
  columnHelper.accessor("depositAssets", {
    header: () => {},
    cell: (item) => (
      <div
        className={classNames(
          "relative flex min-w-[56px] items-center justify-center"
        )}
      >
        {item.getValue().map(({ coinDenom, coinImageUrl }, i) => (
          <Image
            src={coinImageUrl ?? ""}
            alt={`${coinDenom} image`}
            key={`${coinDenom} ${i} ${item.cell.id}`}
            className={classNames("h-9 min-w-[36px] rounded-full", {
              "-ml-4": i > 0,
            })}
            width={36}
            height={36}
          />
        ))}
      </div>
    ),
    enableHiding: true,
  }),
  columnHelper.accessor("name", {
    header: () => (
      <ColumnCellHeader
        tooltipClassname="!justify-start"
        tooltipDescription={"earnPage.tooltips.strategy.description"}
        tKey={"earnPage.strategyPlatform"}
      />
    ),
    cell: StrategyNameCell,
    /* cell: (item) => (
      <StrategyNameCell
        name={item.getValue()}
        platformName={item.row.original.provider}
        strategyMethod={item.row.original.category}
      />
    ), */
  }),
  columnHelper.accessor("tvl.tvlUsd", {
    header: () => (
      <ColumnCellHeader
        tooltipDescription={"earnPage.tooltips.tvl.description"}
        tKey={"pools.TVL"}
      />
    ),
    cell: TVLCell,
    sortingFn: sortDecValues,
  }),
  columnHelper.accessor("annualPercentages.apy", {
    header: () => (
      <ColumnCellHeader
        tooltipDescription={"earnPage.tooltips.apr.description"}
        tKey={"earnPage.apy"}
      />
    ),
    cell: APYCell,
    sortingFn: sortDecValues,
  }),
  columnHelper.accessor("daily", {
    header: () => (
      <ColumnCellHeader
        tooltipDescription={"earnPage.tooltips.daily.description"}
        tKey={"earnPage.daily"}
      />
    ),
    // use the same logic as the APY cell
    cell: APYCell,
    sortingFn: sortDecValues,
  }),
  columnHelper.accessor("rewardAssets", {
    header: () => (
      <ColumnCellHeader
        tooltipDescription={"earnPage.tooltips.reward.description"}
        tKey={"earnPage.reward"}
      />
    ),
    cell: (item) => (
      <div className="relative flex items-center justify-end">
        {item.getValue().map(({ coinDenom, coinImageUrl }, i) => (
          <Image
            src={coinImageUrl ?? ""}
            alt={`${coinDenom} image`}
            key={`${coinDenom} ${i} ${item.cell.id}`}
            className={classNames("h-6 w-6 rounded-full", {
              "-ml-2": i > 0,
              "mr-2": item.getValue().length === 1,
            })}
            width={24}
            height={24}
          />
        ))}
      </div>
    ),
    filterFn: arrLengthEquals,
    enableSorting: false,
  }),
  columnHelper.accessor("lockDuration", {
    header: () => (
      <ColumnCellHeader
        tooltipDescription={"earnPage.tooltips.lock.description"}
        tKey={"earnPage.lock"}
      />
    ),
    cell: LockCell,
    sortingFn: sortDurationValues,
  }),
  columnHelper.accessor("riskLevel", {
    header: () => (
      <ColumnCellHeader
        tKey={"earnPage.risk"}
        tooltipDescription={"earnPage.tooltips.risk.description"}
        tooltipClassname="!justify-center"
      />
    ),
    cell: RiskCell,
  }),
  columnHelper.accessor("balance", {
    header: () => <ColumnCellHeader tKey={"assets.table.columns.balance"} />,
    cell: (item) => (
      <div className="flex flex-col">
        <ColumnCellCell>{formatPretty(item.getValue())}</ColumnCellCell>
        {/* <small className="text-xs font-subtitle2 font-medium text-osmoverse-300">
          {item.row.original.balance.converted}
        </small> */}
      </div>
    ),
    enableHiding: true,
  }),
  columnHelper.display({
    id: "strategyActions",
    cell: ActionsCell,
  }),
  columnHelper.accessor("type", {
    filterFn: listOptionValueEquals,
    enableHiding: true,
  }),
  columnHelper.accessor("depositAssets.coinDenom", {
    header: () => {},
    cell: () => {},
    filterFn: boolEqualsString,
    enableHiding: true,
  }),
  columnHelper.accessor("platform", {
    header: () => {},
    cell: () => {},
    filterFn: listOptionValueEquals,
    enableHiding: true,
  }),
  columnHelper.accessor("holdsTokens", {
    filterFn: boolEqualsString,
    enableHiding: true,
  }),
  columnHelper.accessor("hasLockingDuration", {
    filterFn: lockDurationFilter,
    enableHiding: true,
  }),
  columnHelper.accessor("categories", {
    filterFn: multiListOptionValueEquals,
    enableHiding: true,
  }),
];
