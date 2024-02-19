import { PricePretty } from "@keplr-wallet/unit";
import { CellContext } from "@tanstack/react-table";
import { ReactNode } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { ColumnCellCell } from "~/components/earn/table/columns";
import { useTranslation } from "~/hooks";
import { EarnStrategy } from "~/server/queries/numia/earn";
import { formatPretty } from "~/utils/formatter";

interface StrategyNameCellProps {
  name: string;
  strategyMethod: string;
  platformName: string;
}

export const StrategyTooltip = ({
  header,
  body,
}: {
  header: string;
  body: ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <p className="text-caption">{header}</p>
    {body}
  </div>
);

export const StrategyNameCell = ({
  name,
  platformName,
  strategyMethod,
}: StrategyNameCellProps) => {
  return (
    <div className="flex items-center">
      <div className="flex flex-col">
        <p className="text-white min-w-[270px] max-w-[270px] overflow-hidden text-ellipsis whitespace-nowrap text-left font-subtitle1 1.5xs:text-sm xs:min-w-[160px] xs:max-w-[160px]">
          {name}
        </p>
        <div className="flex items-center gap-2">
          <small className="text-sm font-subtitle1 text-osmoverse-400 1.5xs:text-xs">
            {platformName}
          </small>
          <div className="flex items-center justify-center rounded-xl bg-[#9D23E8] px-1.5">
            <span className="text-white text-sm font-subtitle1 leading-6 1.5xs:text-xs">
              {strategyMethod}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TVLCell = (item: CellContext<EarnStrategy, PricePretty>) => {
  // const fluctuation = item.row.original.tvl.fluctuation;
  // const depositCap = item.row.original.tvl.depositCap;
  // const depositCapOccupied = depositCap
  //   ? Math.round((depositCap.actual / depositCap.total) * 100)
  //   : 0;

  return (
    <div className="flex flex-col">
      <ColumnCellCell>{formatPretty(item.getValue())}</ColumnCellCell>
      {/* {fluctuation && (
        <small
          className={classNames("text-xs font-subtitle2 font-medium", {
            "text-bullish-400": fluctuation > 0,
            "text-osmoverse-500": fluctuation < 0,
          })}
        >
          {fluctuation}%
        </small>
      )}
      {depositCap && (
        <Tooltip
          content={
            <StrategyTooltip
              header="Deposit Cap"
              body={
                <p className="text-caption text-osmoverse-300">
                  {formatPretty(new Dec(depositCap.actual), {
                    unitDisplay: "narrow",
                  })}
                  /
                  {formatPretty(new Dec(depositCap.total), {
                    unitDisplay: "narrow",
                  })}
                </p>
              }
            />
          }
          className="justify-end"
        >
          <span className="inline-flex items-center justify-end gap-2">
            <div className="relative h-1.5 w-[70px] rounded-full bg-osmoverse-900">
              <div
                className={classNames(
                  "absolute h-1.5 rounded-full bg-gradient-earnpage-tvl-depositcap"
                )}
                style={{
                  width: `${depositCapOccupied * 0.7}px`,
                }}
              />
            </div>
            <p className="text-caption text-osmoverse-200">
              {depositCapOccupied}%
            </p>
          </span>
        </Tooltip>
      )} */}
    </div>
  );
};

export const LockCell = (item: CellContext<EarnStrategy, number>) => {
  const { t } = useTranslation();
  const hasLockingDuration = item.getValue() > 0;

  return (
    <div className="flex flex-col">
      <ColumnCellCell>
        {hasLockingDuration ? item.getValue() : "N/A"}
      </ColumnCellCell>
      {hasLockingDuration && (
        <small className="text-sm font-subtitle2 text-osmoverse-400">
          {t("earnPage.days")}
        </small>
      )}
    </div>
  );
};

export const ActionsCell = (_: CellContext<EarnStrategy, unknown>) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center">
      <Button
        onClick={() => {}}
        mode={"quaternary"}
        className="group/button mr-0 inline-flex max-h-10 w-24 transform items-center justify-center gap-1 rounded-3x4pxlinset border-0 !bg-[#19183A] transition-all duration-300 ease-in-out hover:!bg-wosmongton-700"
      >
        <p className="text-sm font-subtitle1 font-medium text-osmoverse-300">
          {t("earnPage.join")}
        </p>
        {true ? (
          <Icon
            id="arrow-up-right"
            className="h-4.5 w-0 opacity-0 transition-all duration-200 ease-in-out group-hover/button:w-4.5 group-hover/button:opacity-100"
          />
        ) : (
          <Icon
            id="arrow-up-right"
            className="h-4.5 w-0 rotate-45 opacity-0 transition-all duration-200 ease-in-out group-hover/button:w-4.5 group-hover/button:opacity-100"
          />
        )}
      </Button>
    </div>
  );
};
