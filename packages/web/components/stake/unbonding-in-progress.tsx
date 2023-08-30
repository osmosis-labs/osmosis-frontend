import React from "react";
import { useTranslation } from "react-multi-lang";

export const UnbondingInProgress: React.FC = () => {
  const t = useTranslation();
  const unbonds = [
    { amountOsmo: 100, amountUSD: 221, remainingTime: "13 days" },
    { amountOsmo: 25394, amountUSD: 10289.23, remainingTime: "6 days" },
  ];

  return (
    <div className="col-span-2 flex flex-col gap-3">
      <span className="px-10">{t("stake.unbondingInProgress")}</span>
      {unbonds.map((unbond, index) => {
        return <UnbondRow {...unbond} key={unbond.amountUSD + index} />;
      })}
    </div>
  );
};

const UnbondRow: React.FC<{
  amountOsmo: number;
  amountUSD: number;
  remainingTime: string;
}> = ({ amountOsmo, amountUSD, remainingTime }) => {
  const t = useTranslation();
  return (
    <div className="flex justify-between rounded-3xl bg-osmoverse-800 px-10 py-8">
      <div>
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
