import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { type EarnStrategy } from "@osmosis-labs/server";
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
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";

export const StrategyTooltip = ({
  header,
  body,
}: {
  header?: string;
  body: ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    {header && <p className="text-caption">{header}</p>}
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

    return {
      depositCapOccupied: Math.min(depositCapOccupied, 100),
      depositCap,
    };
  }, [item.row.original.tvl, tvlUsd]);

  if (isLoadingTVL) {
    return (
      <div className="flex justify-end">
        <SkeletonLoader isLoaded={false} className="h-8 w-11" />
      </div>
    );
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
            <p className="w-8 text-caption text-osmoverse-200">
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
    return (
      <div className="flex justify-end">
        <SkeletonLoader isLoaded={false} className="h-8 w-11" />
      </div>
    );
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

  const isGeoblocked = item.row.original.geoblocked;
  const isDisabled = item.row.original.disabled;
  const isLoadingGeoblock = item.row.original.isLoadingGeoblock;
  const isErrorGeoblock = item.row.original.isErrorGeoblock;

  const isOsmosisStrategy = useMemo(
    () => item.row.original.link.includes("app.osmosis.zone"),
    [item]
  );

  const target = useMemo(
    () => (isOsmosisStrategy ? undefined : "_blank"),
    [isOsmosisStrategy]
  );

  const href = useMemo(() => {
    return item.row.original.link.replace("https://app.osmosis.zone", "");
  }, [item]);

  const isBalanceVisible = useMemo(
    () => item.table.getColumn("balance")?.getIsVisible(),
    [item.table]
  );

  const { logEvent } = useAmplitudeAnalytics();

  return (
    <div className="flex items-center justify-center">
      <Tooltip
        content={
          <StrategyTooltip
            body={
              <p className="text-caption text-osmoverse-200">
                {t("earnPage.strategyGeoblocked")}
              </p>
            }
          />
        }
        rootClassNames="-translate-x-[80%] translate-y-[110%]"
        maxWidth={"200px"}
        disabled={!isGeoblocked}
      >
        <Button asChild>
          <Link
            href={href}
            target={target}
            className={classNames(
              "group/button inline-flex max-h-10 items-center justify-center gap-1 rounded-3x4pxlinset border-0 !bg-osmoverse-860 transition-all hover:!bg-wosmongton-700",
              {
                "w-28": !isBalanceVisible,
                "w-32": isBalanceVisible,
                "pointer-events-none opacity-50": isDisabled || isErrorGeoblock,
              }
            )}
            onClick={() => {
              // This means that we are not in the "My Stragegies" tab
              if (!isBalanceVisible) {
                logEvent([
                  EventName.EarnPage.joinStrategyClicked,
                  { strategyId: item.row.original.id },
                ]);
              }
            }}
          >
            {isLoadingGeoblock ? (
              <Image
                src={"/images/loading-gradient.svg"}
                alt="Loading spinner"
                width={18}
                height={18}
                className="animate-spin"
              />
            ) : (
              <div className="inline-flex items-center gap-1">
                <p className="text-sm font-subtitle1 font-medium text-osmoverse-300">
                  {isBalanceVisible ? (
                    <span>{t("earnPage.manage")}</span>
                  ) : isGeoblocked ? (
                    <span className="inline-flex h-4.5">
                      <span className="w-full opacity-100 group-hover/button:w-0 group-hover/button:opacity-0">
                        {t("earnPage.join")}
                      </span>
                      <span className="w-0 opacity-0 group-hover/button:w-full group-hover/button:opacity-100">
                        {t("frontierMigration.proceed")}
                      </span>
                    </span>
                  ) : (
                    <span>{t("earnPage.join")}</span>
                  )}
                </p>
                {isGeoblocked ? (
                  <div className="inline-flex items-center">
                    <Icon
                      id="geoblock"
                      className="h-4.5 w-4.5 opacity-100 group-hover/button:w-0 group-hover/button:opacity-0"
                      color={theme.colors.osmoverse[300]}
                    />
                    <Icon
                      id="arrow-up-right"
                      className="h-4.5 w-0 opacity-0 group-hover/button:w-4.5 group-hover/button:opacity-100"
                      color={theme.colors.osmoverse[300]}
                    />
                  </div>
                ) : isOsmosisStrategy ? (
                  <Icon
                    id="arrow-up-right"
                    className="h-4.5 w-0 rotate-45 opacity-0 group-hover/button:w-4.5 group-hover/button:opacity-100"
                    color={theme.colors.osmoverse[300]}
                  />
                ) : (
                  <Icon
                    id="arrow-up-right"
                    className="h-4.5 w-0 opacity-0 group-hover/button:w-4.5 group-hover/button:opacity-100"
                    color={theme.colors.osmoverse[300]}
                  />
                )}
              </div>
            )}
          </Link>
        </Button>
      </Tooltip>
    </div>
  );
};
