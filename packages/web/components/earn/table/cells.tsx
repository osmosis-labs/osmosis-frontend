import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { CellContext } from "@tanstack/react-table";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useMemo } from "react";

import { Icon } from "~/components/assets";
import { ColumnCellCell } from "~/components/earn/table/columns";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { type EarnStrategy } from "~/server/queries/numia/earn";
import { formatPretty } from "~/utils/formatter";

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

export const StrategyNameCell = (item: CellContext<EarnStrategy, string>) => {
  return (
    <>
      <p className="text-white min-w-[270px] max-w-[270px] overflow-hidden text-ellipsis whitespace-nowrap text-left font-subtitle1 1.5xs:text-sm xs:min-w-[160px] xs:max-w-[160px]">
        {item.getValue()}
      </p>
      <div className="flex items-center gap-2">
        <small className="text-left text-sm font-subtitle1 capitalize text-osmoverse-400 1.5xs:text-xs">
          {item.row.original.platform}
        </small>
        <div className="flex items-center justify-center rounded-xl bg-[#9D23E8] px-2">
          <span className="text-white overflow-hidden text-ellipsis whitespace-nowrap text-sm font-subtitle1 leading-6 1.5xs:text-xs">
            {item.row.original.category}
          </span>
        </div>
      </div>
    </>
  );
};

export const TVLCell = (item: CellContext<EarnStrategy, PricePretty>) => {
  const tvlUsd = item.getValue();
  const isLoadingTVL = item.row.original.isLoadingTVL;

  const { depositCap, depositCapOccupied } = useMemo(() => {
    if (!item.row.original.tvl)
      return { depositCapOccupied: undefined, depositCap: undefined };
    const depositCap = item.row.original.tvl.maxTvlUsd;
    const depositCapOccupied =
      depositCap && depositCap.toDec().gt(new Dec(0))
        ? Math.round(
            (Number(tvlUsd.toDec().toString()) /
              Number(depositCap.toDec().toString())) *
              100
          )
        : 0;

    return { depositCapOccupied, depositCap };
  }, [item.row.original.tvl, tvlUsd]);

  if (isLoadingTVL) {
    return <SkeletonLoader isLoaded={false} className="h-8 w-11" />;
  }

  return (
    <div className="flex flex-col">
      <ColumnCellCell>{tvlUsd ? formatPretty(tvlUsd) : "N/A"}</ColumnCellCell>
      {/* {fluctuation && (
        <small
          className={classNames("text-xs font-subtitle2 font-medium", {
            "text-bullish-400": fluctuation > 0,
            "text-osmoverse-500": fluctuation < 0,
          })}
        >
          {fluctuation}%
        </small>
      )} */}
      {depositCap && (
        <Tooltip
          content={
            <StrategyTooltip
              header="Deposit Cap"
              body={
                <p className="text-caption text-osmoverse-300">
                  {formatPretty(tvlUsd, {
                    unitDisplay: "narrow",
                  })}
                  /
                  {formatPretty(depositCap, {
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
      )}
    </div>
  );
};

export const APYCell = (item: CellContext<EarnStrategy, RatePretty>) => {
  const isLoadingAPR = item.row.original.isLoadingAPR;

  if (isLoadingAPR) {
    return <SkeletonLoader isLoaded={false} className="h-8 w-11" />;
  }

  return (
    <ColumnCellCell>
      {item.getValue() ? formatPretty(item.getValue()) : "N/A"}
    </ColumnCellCell>
  );
};

export const LockCell = (item: CellContext<EarnStrategy, string>) => {
  const { t } = useTranslation();
  const lockingDuration = dayjs.duration(item.getValue()).asDays();
  const hasLockingDuration = item.row.original.hasLockingDuration;

  return (
    <div className="flex flex-col">
      <ColumnCellCell>
        {hasLockingDuration ? lockingDuration : "N/A"}
      </ColumnCellCell>
      {hasLockingDuration && (
        <small className="text-sm font-subtitle2 text-osmoverse-400">
          {t("earnPage.days")}
        </small>
      )}
    </div>
  );
};

function _getRiskLabel(risk: number) {
  if (risk <= 0.25) return "Low";
  else if (risk <= 0.5) return "Medium";
  else if (risk <= 0.75) return "High";
  else if (risk <= 1) return "Very High";
  else return "Very Low";
}

export const RiskCell = (item: CellContext<EarnStrategy, number>) => {
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center gap-1">
        <div className="relative h-6">
          <Image
            src={"/images/risk-indicator-bg.svg"}
            alt="Risk indicator background"
            width={36}
            height={36}
          />
          <Image
            src={"/images/risk-indicator-dial.svg"}
            alt="Risk indicator background"
            width={44}
            height={8}
            className="absolute left-3.5 -top-1 h-11 w-2"
            style={{ rotate: `${item.getValue() * 180 - 90}deg` }}
          />
        </div>
        <p className="text-caption text-osmoverse-200">
          {_getRiskLabel(item.getValue())}
        </p>
      </div>
    </div>
  );
};

export const ActionsCell = (item: CellContext<EarnStrategy, unknown>) => {
  const { t } = useTranslation();

  const isOsmosisStrategy = useMemo(
    () =>
      item.row.original.platform === "Cosmos SDK (Staking Module on Osmosis)",
    [item]
  );

  const target = useMemo(
    () => (isOsmosisStrategy ? undefined : "_blank"),
    [isOsmosisStrategy]
  );

  const href = useMemo(() => {
    if (isOsmosisStrategy) {
      return item.row.original.link.replace("https://app.osmosis.zone", "");
    }

    return item.row.original.link;
  }, [item, isOsmosisStrategy]);

  const isBalanceVisible = useMemo(
    () => item.table.getColumn("balance")?.getIsVisible(),
    [item.table]
  );

  return (
    <div className="flex items-center justify-center">
      <Button asChild>
        <Link
          href={href}
          target={target}
          className={classNames(
            "group/button inline-flex max-h-10 transform items-center justify-center gap-1 rounded-3x4pxlinset border-0 !bg-[#19183A] transition-all duration-300 ease-in-out hover:!bg-wosmongton-700",
            { "w-24": !isBalanceVisible, "w-32": isBalanceVisible }
          )}
        >
          <p className="text-sm font-subtitle1 font-medium text-osmoverse-300">
            {isBalanceVisible ? t("earnPage.manage") : t("earnPage.join")}
          </p>
          {isOsmosisStrategy ? (
            <Icon
              id="arrow-up-right"
              className="h-4.5 w-0 rotate-45 opacity-0 transition-all duration-200 ease-in-out group-hover/button:w-4.5 group-hover/button:opacity-100"
            />
          ) : (
            <Icon
              id="arrow-up-right"
              className="h-4.5 w-0 opacity-0 transition-all duration-200 ease-in-out group-hover/button:w-4.5 group-hover/button:opacity-100"
            />
          )}
        </Link>
      </Button>
    </div>
  );
};
