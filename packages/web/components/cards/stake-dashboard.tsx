import React from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { GenericMainCard } from "~/components/cards/generic-main-card";
import { RewardsCard } from "~/components/cards/rewards-card";
import { ValidatorSquadCard } from "~/components/cards/validator-squad-card";

export const StakeDashboard: React.FC<{
  setShowValidatorModal: (val: boolean) => void;
}> = ({ setShowValidatorModal }) => {
  const t = useTranslation();

  const icon = (
    <div className="text-bullish-500">
      <Icon id="help-circle" height="14px" width="14px" />
    </div>
  );
  return (
    <GenericMainCard
      title={t("stake.dashboard")}
      titleIcon={icon}
      titleIconAction="www.google.com"
      width="45"
    >
      <div className="flex w-full flex-row justify-between py-10">
        <StakeBalances
          title={t("stake.stakeBalanceTitle")}
          dollarAmount="$89,102.57"
          osmoAmount="491,058.29"
        />
        <StakeBalances
          title={t("stake.rewardsTitle")}
          dollarAmount="$26.89"
          osmoAmount="20"
        />
      </div>
      <ValidatorSquadCard setShowValidatorModal={setShowValidatorModal} />
      <div className="flex w-full flex-row space-x-2">
        <RewardsCard
          title={t("stake.collectRewards")}
          titleIconUrl="www.google.com"
        />
        <RewardsCard
          title={t("stake.investRewards")}
          titleIconUrl="www.google.com"
        />
      </div>
    </GenericMainCard>
  );
};

const StakeBalances: React.FC<{
  title: string;
  dollarAmount: string;
  osmoAmount: string;
}> = ({ title, dollarAmount, osmoAmount }) => {
  return (
    <div className="flex w-full flex-col justify-center pl-10">
      <span className="caption text-sm text-osmoverse-200 md:text-xs">
        {title}
      </span>
      <h3>{dollarAmount}</h3>
      <span className="caption text-sm text-osmoverse-200 md:text-xs">
        {osmoAmount} OSMO
      </span>
    </div>
  );
};
