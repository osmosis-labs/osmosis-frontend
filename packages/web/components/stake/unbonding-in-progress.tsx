import { CoinPretty } from "@keplr-wallet/unit";
import dayjs from "dayjs";
import React from "react";

import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";

export const UnbondingInProgress: React.FC<{
  unbondings: {
    completionTime: string;
    balance: CoinPretty;
  }[];
}> = ({ unbondings }) => {
  const { t } = useTranslation();
  const { priceStore } = useStore();

  function formatUnbondings(
    unbondings: { completionTime: string; balance: CoinPretty }[]
  ): { amountOsmo: string; amountUSD: string; remainingTime: string }[] {
    const currentDate = new Date();

    return (
      unbondings
        // Sort by completionTime
        .sort(
          (a, b) =>
            new Date(a.completionTime).getTime() -
            new Date(b.completionTime).getTime()
        )
        .map((unbonding) => {
          const completionDate = new Date(unbonding.completionTime);
          const timeDiff = dayjs.duration(
            completionDate.getTime() - currentDate.getTime()
          );

          const prettifiedAmount = unbonding.balance;
          return {
            amountOsmo: prettifiedAmount.trim(true).toString(),
            amountUSD:
              priceStore.calculatePrice(prettifiedAmount)?.toString() || "",
            remainingTime: timeDiff.humanize(),
          };
        })
        .filter((entry) => parseInt(entry.remainingTime) > 0)
    ); // Filter out entries with completion time in the past
  }

  const formattedUnbondings = formatUnbondings(unbondings);

  return (
    <div className="col-span-2 flex flex-col gap-3">
      <span className="px-10 text-osmoverse-100">
        {t("stake.unbondingInProgress")}
      </span>
      {formattedUnbondings.map((unbond, index) => {
        return <UnbondRow {...unbond} key={unbond.amountOsmo + index} />;
      })}
    </div>
  );
};

const UnbondRow: React.FC<{
  amountOsmo: string;
  amountUSD: string;
  remainingTime: string;
}> = ({ amountOsmo, amountUSD, remainingTime }) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between rounded-3xl bg-osmoverse-850 px-10 py-8">
      <div className="flex flex-col gap-3">
        <span className="caption text-sm text-osmoverse-200 md:text-xs">
          {t("stake.amount")}
        </span>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <h6 className="">{amountUSD}</h6>
            <span className="text-osmoverse-200">{amountOsmo}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <span className="caption text-sm text-osmoverse-200 md:text-xs">
          {t("stake.availableIn")}
        </span>
        <h6>{remainingTime}</h6>
      </div>
    </div>
  );
};
