import React, { useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import { StakeInfoCard } from "~/components/cards/stake-info-card";
import { ValidatorSquad } from "~/components/cards/validator-squad";
import { StakeTab } from "~/components/control/stake-tab";

import { useWindowSize } from "../../hooks";

export const Staking: React.FC = () => {
  const t = useTranslation();
  const { isMobile } = useWindowSize();
  const [activeTab, setActiveTab] = useState("Stake");

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="relative flex w-[27rem] flex-col gap-8 overflow-hidden rounded-[24px] bg-osmoverse-800 px-1 py-1 lg:mx-auto md:mt-mobile-header md:gap-6 md:px-3 md:pt-4 md:pb-4">
        <div className="relative flex flex-col gap-8 overflow-hidden rounded-[24px] bg-osmoverse-800 px-6 pt-8 pb-8 md:gap-6 md:px-3 md:pt-4 md:pb-4">
          <div className="relative flex w-full items-center justify-between">
            <Icon
              id="sandbox"
              width={isMobile ? 20 : 28}
              height={isMobile ? 20 : 28}
              className="text-osmoverse-400 hover:text-white-full"
            />

            <h6 className="text-center">{t("stake.title")}</h6>
            <div className="flex items-center">
              <IconButton
                aria-label="Open swap settings"
                className="z-40 w-fit py-0"
                size="unstyled"
                mode="unstyled"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                icon={
                  <Icon
                    id="setting"
                    width={isMobile ? 20 : 28}
                    height={isMobile ? 20 : 28}
                    className="text-osmoverse-400 hover:text-white-full"
                  />
                }
              />
            </div>
          </div>
          <div className="flex justify-around border-b-2 border-transparent">
            <StakeTab
              active={activeTab === "Stake"}
              onClick={() => setActiveTab("Stake")}
            >
              Stake OSMO
            </StakeTab>
            <StakeTab
              active={activeTab === "Unstake"}
              onClick={() => setActiveTab("Unstake")}
            >
              Unstake OSMO
            </StakeTab>
          </div>
          <StakeInfoCard />
          <ValidatorSquad />
        </div>
      </div>
    </main>
  );
};

export default Staking;
