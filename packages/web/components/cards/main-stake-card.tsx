import { CoinPretty } from "@keplr-wallet/unit";
import React from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { EstimatedEarningCard } from "~/components/cards/estimated-earnings-card";
import { GenericMainCard } from "~/components/cards/generic-main-card";
import { StakeInfoCard } from "~/components/cards/stake-info-card";
import { StakeTab } from "~/components/control/stake-tab";

export const MainStakeCard: React.FC<{
  inputAmount?: string;
  setInputAmount: (amount: string | undefined) => void;
  setShowValidatorNextStepModal: (val: boolean) => void;
  stakeAmount?: CoinPretty;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  balance?: string;
}> = ({
  inputAmount,
  activeTab,
  setActiveTab,
  balance,
  setInputAmount,
  setShowValidatorNextStepModal,
  stakeAmount,
}) => {
  const t = useTranslation();
  return (
    <>
      <GenericMainCard title={t("stake.stake")}>
        <div className="flex justify-around border-b-2 border-transparent">
          <StakeTab
            active={activeTab === "Stake"}
            onClick={() => setActiveTab("Stake")}
          >
            {t("stake.stake")}
          </StakeTab>
          <StakeTab
            active={activeTab === "Unstake"}
            onClick={() => setActiveTab("Unstake")}
          >
            {t("stake.unstake")}
          </StakeTab>
        </div>
        <StakeInfoCard
          balance={balance}
          setInputAmount={setInputAmount}
          inputAmount={inputAmount}
        />
        <EstimatedEarningCard stakeAmount={stakeAmount} />
        <Button
          mode="special-1"
          onClick={() => {
            if (activeTab === "Stake") {
              setShowValidatorNextStepModal(true);
            } else {
              alert("make unstake call now");
            }
          }}
        >
          Stake
        </Button>
      </GenericMainCard>
    </>
  );
};
