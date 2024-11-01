import { Dec } from "@keplr-wallet/unit";
import { GetAllocationResponse } from "@osmosis-labs/server";
import classNames from "classnames";
import { FunctionComponent, useEffect, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { AllocationTabs } from "~/components/complex/portfolio/allocation-tabs";
import { AllocationOptions } from "~/components/complex/portfolio/types";
import { EventName } from "~/config";
import {
  Breakpoint,
  MultiLanguageT,
  useAmplitudeAnalytics,
  useHideDustUserSetting,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import { formatFiatPrice } from "~/utils/formatter";

const COLORS: Record<AllocationOptions, string[]> = {
  all: [
    "bg-wosmongton-500",
    "bg-ammelia-400",
    "bg-osmoverse-500",
    "bg-bullish-500",
    "bg-ion-500",
  ],
  assets: [
    "bg-[#9C01D4]",
    "bg-[#E9983D]",
    "bg-[#2775CA]",
    "bg-[#424667]",
    "bg-[#009393]",
    "bg-osmoverse-500",
  ],
  available: [
    "bg-[#9C01D4]",
    "bg-[#E9983D]",
    "bg-[#2775CA]",
    "bg-[#424667]",
    "bg-[#009393]",
    "bg-osmoverse-500",
  ],
};

const getTranslation = (key: string, t: MultiLanguageT): string => {
  const translationMap: Record<string, string> = {
    available: t("portfolio.available"),
    staked: t("portfolio.staked"),
    unstaking: t("portfolio.unstaking"),
    unclaimedRewards: t("portfolio.unclaimedRewards"),
    pooled: t("portfolio.pooled"),
    other: t("portfolio.other"),
  };

  return translationMap[key] || key;
};

export const Allocation: FunctionComponent<{
  allocation?: GetAllocationResponse;
}> = ({ allocation }) => {
  const { logEvent } = useAmplitudeAnalytics();
  const { width } = useWindowSize();
  const [selectedOption, setSelectedOption] =
    useState<AllocationOptions>("all");
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (width > Breakpoint.xl) {
      setIsOpen(true);
    }
  }, [width]);

  const selectedList = useMemo(
    () => allocation?.[selectedOption] ?? [],
    [allocation, selectedOption]
  );

  const dustFilteredList = useHideDustUserSetting(
    selectedList,
    (item) => item.fiatValue
  );

  if (!allocation) return null;

  return (
    <div className="flex w-full flex-col py-3">
      <div
        className="flex cursor-pointer select-none items-center justify-between py-3"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h6>{t("portfolio.allocation")}</h6>
        {width > Breakpoint.xl && (
          <Icon
            id="chevron-down"
            className={classNames("transition-transform", {
              "rotate-180": isOpen,
            })}
          />
        )}
      </div>
      {isOpen && (
        <>
          <div className="my-4">
            <AllocationTabs
              setTab={(option) => {
                setSelectedOption(option);
                logEvent([
                  EventName.Portfolio.allocationClicked,
                  { allocationType: option },
                ]);
              }}
              activeTab={selectedOption}
            />
          </div>
          <div className="my-[8px] flex h-4 w-full gap-1">
            {dustFilteredList.map(({ key, percentage }, index) => {
              const colorClass =
                COLORS[selectedOption][index % COLORS[selectedOption].length];

              const isNegligiblePercent = percentage.toDec().lt(new Dec(0.01));

              const width = isNegligiblePercent
                ? "0.1%"
                : percentage.toString();

              return (
                <div
                  key={key}
                  className={classNames("h-full rounded-[4px]", colorClass)}
                  style={{ width }}
                />
              );
            })}
          </div>
          <div className="flex flex-col space-y-3">
            {dustFilteredList.map(({ key, percentage, fiatValue }, index) => {
              const colorClass =
                COLORS[selectedOption][index % COLORS[selectedOption].length];

              return (
                <div key={key} className="body2 flex w-full justify-between">
                  <div className="flex items-center space-x-1">
                    <div
                      className={classNames(
                        "my-auto inline-block h-3 w-3 rounded-[4px]",
                        colorClass
                      )}
                    />
                    <span>{getTranslation(key, t)}</span>
                    <span className="text-osmoverse-400">
                      {percentage.maxDecimals(0).toString()}
                    </span>
                  </div>
                  <div>{formatFiatPrice(fiatValue)}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
