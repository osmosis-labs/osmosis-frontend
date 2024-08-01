import { Dec, PricePretty } from "@keplr-wallet/unit";
import { AllocationResponse } from "@osmosis-labs/server";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { FunctionComponent, useState } from "react";

import { RadioWithOptions } from "~/components/radio-with-options";

type AllocationOptions = "all" | "assets" | "available";

export const Allocation: FunctionComponent<{
  allocation?: AllocationResponse;
}> = ({ allocation }) => {
  console.log("allocation: ", allocation);

  const [selectedOption, setSelectedOption] =
    useState<AllocationOptions>("all");

  if (!allocation) {
    return null;
  }

  // const allocationList = Object.entries(allocation.categories).map(
  //   ([category, details]) => {
  //     const percentage = parseFloat(details.capitalization);
  //     return {
  //       category,
  //       percentage,
  //     };
  //   }
  // );

  const allList = [
    {
      category: "available",
      percentage: 20,
      color: "bg-wosmongton-500",
      amount: 400_946.78,
      label: "Available",
    },
    {
      category: "staked",
      percentage: 30,
      color: "bg-ammelia-500",
      anmount: 550_000.0,
      label: "Staked",
    },
    {
      category: "unstaking",
      percentage: 40,
      color: "bg-osmoverse-500",
      amount: 20_000,
      label: "Unstaking",
    },
    {
      category: "unclaimedRewards",
      percentage: 10,
      color: "bg-bullish-500",
      amount: 123,
      label: "UnclaimedRewards",
    },
    {
      category: "positions",
      percentage: 10,
      color: "bg-ion-500",
      amount: 54_321.0,
      label: "Positions",
    },
  ];

  const assetsList = [
    {
      category: "osmo",
      percentage: 58,
      color: "bg-[#9C01D4]",
      amount: 576_789.1,
      label: "OSMO",
    },
    {
      category: "btc",
      percentage: 23,
      color: "bg-[#E9983D]",
      amount: 234_567.89,
      label: "BTC",
    },
    {
      category: "eth",
      percentage: 12,
      color: "bg-[#7F7F7F]",
      amount: 123_456.78,
      label: "ETH",
    },
    {
      category: "usdc",
      percentage: 3,
      color: "bg-[#2775CA]",
      amount: 34_567.89,
      label: "USDC",
    },
    {
      category: "atom",
      percentage: 0.9,
      color: "bg-[#424667]",
      amount: 4_567.89,
      label: "ATOM",
    },
    {
      category: "usdt",
      percentage: 0.001,
      color: "bg-[#009393]",
      amount: 123.45,
      label: "USDT",
    },
    {
      category: "other",
      percentage: 1,
      color: "bg-osmoverse-500",
      amount: 5_432.1,
      label: "OTHER",
    },
  ];

  // console.log("Allocation List by Percentage:", allocationList);

  const selectedList = selectedOption === "all" ? allList : assetsList;

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
        {selectedList.map(({ category, percentage, color }) => (
          <div
            key={category}
            className={`h-full ${color} rounded-[4px]`}
            style={{ width: `${percentage}%` }}
          />
        ))}
      </div>
      <div className="flex flex-col space-y-3">
        {selectedList.map(({ category, percentage, color, amount, label }) => (
          <div key={category} className="body2 flex w-full justify-between">
            <div className="flex items-center space-x-1">
              <div
                className={`my-auto inline-block h-3 w-3 rounded-[4px] ${color}`}
              />
              <span>{label}</span>
              <span className="text-osmoverse-400">
                {percentage.toFixed(0)}%
              </span>
            </div>
            <div>
              {new PricePretty(
                DEFAULT_VS_CURRENCY,
                new Dec(amount || 0)
              ).toString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
