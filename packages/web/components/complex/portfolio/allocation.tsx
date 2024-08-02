import { AllocationResponse } from "@osmosis-labs/server";
import { FunctionComponent, useState } from "react";

import { RadioWithOptions } from "~/components/radio-with-options";

type AllocationOptions = "all" | "assets" | "available";

import { PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { FunctionComponent, useMemo } from "react";

import { displayFiatPrice } from "~/components/transactions/transaction-utils";
import { useTranslation } from "~/hooks";
import { useTranslation } from "~/hooks";

export enum SwapToolTab {
  SWAP = "swap",
  BUY = "buy",
  SELL = "sell",
}

export interface SwapToolTabsProps {
  setTab: (tab: SwapToolTab) => void;
  activeTab: SwapToolTab;
}

/**
 * Component for swapping between tabs on the swap modal.
 * Has three tabs:
 * - Buy
 * - Sell
 * - Swap
 */
export const SwapToolTabs: FunctionComponent<SwapToolTabsProps> = ({
  setTab,
  activeTab,
}) => {
  const { t } = useTranslation();

  const tabs = useMemo(
    () => [
      {
        label: t("portfolio.buy"),
        value: SwapToolTab.BUY,
      },
      {
        label: t("limitOrders.sell"),
        value: SwapToolTab.SELL,
      },
      {
        label: t("swap.title"),
        value: SwapToolTab.SWAP,
      },
    ],
    [t]
  );

  return (
    <div className="flex w-max items-center rounded-3xl border border-osmoverse-700">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={`swap-tab-${tab.value}`}
            onClick={() => setTab(tab.value)}
            className={classNames("rounded-3xl px-4 py-3 transition-colors", {
              "hover:bg-osmoverse-850": !isActive,
              "bg-wosmongton-100": isActive,
            })}
          >
            <p
              className={classNames("font-semibold", {
                "text-wosmongton-100": !isActive,
                "text-osmoverse-900": isActive,
              })}
            >
              {tab.label}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export const Allocation: FunctionComponent<{
  allocation?: AllocationResponse;
}> = ({ allocation }) => {
  console.log("allocation: ", allocation);

  const [selectedOption, setSelectedOption] =
    useState<AllocationOptions>("all");

  const { t } = useTranslation();

  if (!allocation) {
    return null;
  }

  const selectedList = allocation[selectedOption];

  console.log("Selected List:", selectedList);
  console.log("Selected Option:", selectedOption);

  return (
    <div className="flex w-1/2 flex-col">
      <div className="text-h6">Allocation</div>
      <div className="my-2">
        <SwapToolTabs
          setTab={(tab) => setSelectedOption(tab)}
          activeTab={selectedOption}
        />
        <RadioWithOptions
          mode="secondary"
          variant="small"
          value={selectedOption}
          onChange={(value) => setSelectedOption(value as AllocationOptions)}
          options={
            [
              { label: "All", value: "all" },
              { label: "Assets", value: "assets" },
              { label: "Available", value: "available" },
            ] as { label: string; value: AllocationOptions }[]
          }
        />
      </div>
      <div className="my-4 flex h-4 w-full gap-1">
        {selectedList.map(({ key, percentage, amount, color }) =>
          percentage === 0 ? null : (
            <div
              key={key}
              className={`h-full ${color} rounded-[4px]`}
              style={{ width: `${percentage.toString()}%` }}
            />
          )
        )}
      </div>
      <div className="flex flex-col space-y-3">
        {selectedList.map(({ key, percentage, amount, color }) => (
          <div key={key} className="body2 flex w-full justify-between">
            <div className="flex items-center space-x-1">
              <div
                className={`my-auto inline-block h-3 w-3 rounded-[4px] ${color}`}
              />
              <span>{key}</span>
              <span className="text-osmoverse-400">
                {(+percentage.toString()).toFixed(0)}%
              </span>
            </div>
            <div>
              {displayFiatPrice(
                new PricePretty(DEFAULT_VS_CURRENCY, amount),
                "",
                t
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
