import { AllocationResponse } from "@osmosis-labs/server";
import { FunctionComponent, useState } from "react";

import { RadioWithOptions } from "~/components/radio-with-options";

type AllocationOptions = "all" | "assets" | "available";

import { PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";

import { displayFiatPrice } from "~/components/transactions/transaction-utils";
import { useTranslation } from "~/hooks";

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
