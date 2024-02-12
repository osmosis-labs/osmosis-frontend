import { Dec } from "@keplr-wallet/unit";
import { createColumnHelper } from "@tanstack/react-table";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import { PropsWithChildren } from "react";

import {
  ActionsCell,
  LockCell,
  StrategyNameCell,
  StrategyTooltip,
  TVLCell,
} from "~/components/earn/table/cells";
import {
  arrLengthEquals,
  boolEquals,
  boolEqualsString,
  listOptionValueEquals,
  strictEqualFilter,
} from "~/components/earn/table/utils";
import { Tooltip } from "~/components/tooltip";
import { TranslationPath, useTranslation } from "~/hooks";
import { EarnStrategy } from "~/server/queries/numia/earn";
import { formatPretty } from "~/utils/formatter";

const columnHelper = createColumnHelper<EarnStrategy>();

export const ColumnCellHeader = ({
  className,
  tKey,
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
      className={classNames("justify-end", tooltipClassname)}
      content={
        <StrategyTooltip
          header={t(tKey)}
          body={
            tooltipDescription && (
              <p className="text-caption text-osmoverse-300">
                {tooltipDescription}
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
  columnHelper.accessor("tokenDenoms", {
    header: () => {},
    cell: (item) => (
      <div className="relative flex items-center justify-end">
        {item.getValue().map(({ coinDenom, coinImageUrl }, i) => (
          <Image
            src={coinImageUrl ?? ""}
            alt={`${coinDenom} image`}
            key={`${coinDenom} ${i} ${item.cell.id}`}
            className={classNames("h-9 w-9 rounded-full bg-osmoverse-300", {
              "-ml-4": i > 0,
              "mr-2": item.getValue().length === 1,
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
        tKey={"earnPage.strategyPlatform"}
      />
    ),
    cell: (item) => (
      <StrategyNameCell
        name={item.getValue()}
        platformName={item.row.original.provider}
        strategyMethod={item.row.original.type}
      />
    ),
  }),
  columnHelper.accessor("tvl", {
    header: () => (
      <ColumnCellHeader
        tooltipDescription="Description of TVL"
        tKey={"pools.TVL"}
      />
    ),
    cell: TVLCell,
  }),
  columnHelper.accessor("apy", {
    header: () => <ColumnCellHeader tKey={"earnPage.apy"} />,
    cell: (item) => (
      <ColumnCellCell>{formatPretty(item.getValue())}</ColumnCellCell>
    ),
  }),
  columnHelper.display({
    id: "daily",
    header: () => <ColumnCellHeader tKey={"earnPage.daily"} />,
    cell: (item) => {
      const currentYear = dayjs().year();
      const januaryFirst = dayjs(`${currentYear}-01-01`);
      const nextYearJanuaryFirst = dayjs(`${currentYear + 1}-01-01`);

      const totalDaysOfTheYear = nextYearJanuaryFirst.diff(januaryFirst, "day");

      return (
        <ColumnCellCell>
          {formatPretty(item.row.original.apy.quo(new Dec(totalDaysOfTheYear)))}
        </ColumnCellCell>
      );
    },
  }),
  columnHelper.accessor("rewardDenoms", {
    header: () => <ColumnCellHeader tKey={"earnPage.reward"} />,
    cell: (item) => (
      <div className="relative flex items-center justify-end">
        {item.getValue().map(({ coinDenom, coinImageUrl }, i) => (
          <Image
            src={coinImageUrl ?? ""}
            alt={`${coinDenom} image`}
            key={`${coinDenom} ${i} ${item.cell.id}`}
            className={classNames("h-6 w-6 rounded-full bg-osmoverse-300", {
              "-ml-4": i > 0,
              "mr-2": item.getValue().length === 1,
            })}
            width={24}
            height={24}
          />
        ))}
      </div>
    ),
    filterFn: arrLengthEquals,
  }),
  columnHelper.accessor("lockDuration", {
    header: () => <ColumnCellHeader tKey={"earnPage.lock"} />,
    cell: LockCell,
    filterFn: boolEquals,
  }),
  columnHelper.accessor("risk", {
    header: () => <ColumnCellHeader tKey={"earnPage.risk"} />,
    cell: (item) => (
      <div className="flex items-center justify-end gap-1">
        {[
          "bg-wosmongton-900",
          "bg-wosmongton-800",
          "bg-wosmongton-700",
          "bg-wosmongton-500",
          "bg-wosmongton-300",
        ].map((bgColor, i) => (
          <div
            key={`${item.cell.id} ${i} risk indicator`}
            className={classNames(`h-5 w-2 rounded-lg`, {
              [bgColor]: i + 1 <= item.getValue(),
              "bg-osmoverse-700": i + 1 > item.getValue(),
            })}
          />
        ))}
      </div>
    ),
  }),
  columnHelper.accessor("balance", {
    header: () => <ColumnCellHeader tKey={"assets.table.columns.balance"} />,
    cell: (item) => (
      <div className="flex flex-col">
        <ColumnCellCell>{item.getValue()}</ColumnCellCell>
        {/* <small className="text-xs font-subtitle2 font-medium text-osmoverse-300">
          {item.row.original.balance.converted}
        </small> */}
      </div>
    ),
    enableHiding: true,
  }),
  columnHelper.accessor("type", {
    header: () => {},
    cell: ActionsCell,
    filterFn: strictEqualFilter,
  }),
  // columnHelper.accessor("type", {
  //   // here we need to take the type, strip and take the last word, which will correspond to valut | lp | perp lp ecc...
  //   header: () => {},
  //   cell: () => {},
  //   filterFn: strictEqualFilter,
  //   enableHiding: true,
  // }),
  columnHelper.accessor("tokenDenoms.coinDenom", {
    header: () => {},
    cell: () => {},
    filterFn: boolEqualsString,
    enableHiding: true,
  }),
  columnHelper.accessor("provider", {
    header: () => {},
    cell: () => {},
    filterFn: listOptionValueEquals,
    enableHiding: true,
  }),
];
