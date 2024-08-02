import { PricePretty } from "@keplr-wallet/unit";
import { AllocationResponse } from "@osmosis-labs/server";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { FunctionComponent, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { displayFiatPrice } from "~/components/transactions/transaction-utils";
import { useTranslation } from "~/hooks";

type AllocationOptions = "all" | "assets" | "available";

export interface SwapToolTabsProps {
  setTab: (tab: AllocationOptions) => void;
  activeTab: AllocationOptions;
}

// Note - merge with Swap Tool Tabs once Orderbook is implemented
export const AllocationTabs: FunctionComponent<SwapToolTabsProps> = ({
  setTab,
  activeTab,
}) => {
  const tabs = useMemo(
    () =>
      [
        {
          label: "All",
          value: "all",
        },
        {
          label: "Assets",
          value: "assets",
        },
        {
          label: "Available",
          value: "available",
        },
      ] as { label: string; value: AllocationOptions }[],
    []
  );

  return (
    <div className="flex h-8 w-full items-center rounded-3xl border border-osmoverse-700">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={`swap-tab-${tab.value}`}
            onClick={() => setTab(tab.value)}
            className={classNames(
              "h-full w-1/3 rounded-3xl transition-colors",
              {
                "hover:bg-osmoverse-850": !isActive,
                "bg-osmoverse-700": isActive,
              }
            )}
          >
            <p
              className={classNames("body2", {
                "text-wosmongton-100": !isActive,
                "text-white": isActive,
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
  const [isOpen, setIsOpen] = useState(true);

  const { t } = useTranslation();

  if (!allocation) {
    return null;
  }

  // @ts-ignore
  const selectedList = allocation[selectedOption];

  console.log("Selected List:", selectedList);
  console.log("Selected Option:", selectedOption);

  return (
    <div className="flex w-full max-w-[320px] flex-col">
      <div
        className="flex cursor-pointer items-center justify-between py-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h6>Allocation</h6>
        <Icon
          id="chevron-down"
          className={classNames("transition-transform", {
            "rotate-180": isOpen,
          })}
        />
      </div>
      {isOpen && (
        <>
          <div className="my-4">
            <AllocationTabs
              setTab={(tab) => setSelectedOption(tab)}
              // @ts-ignore
              activeTab={selectedOption}
            />
          </div>
          <div className="my-[8px] flex h-4 w-full gap-1">
            {selectedList.map(
              // @ts-ignore
              ({ key, percentage, amount, color }) =>
                percentage === 0 ? null : (
                  <div
                    key={key}
                    className={classNames("h-full rounded-[4px]", color)}
                    style={{ width: `${percentage.toString()}%` }}
                  />
                )
            )}
          </div>
          <div className="flex flex-col space-y-3">
            {selectedList.map(
              // @ts-ignore
              ({ key, percentage, amount, color }) => (
                <div key={key} className="body2 flex w-full justify-between">
                  <div className="flex items-center space-x-1">
                    <div
                      className={classNames(
                        "my-auto inline-block h-3 w-3 rounded-[4px]",
                        color
                      )}
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
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};
