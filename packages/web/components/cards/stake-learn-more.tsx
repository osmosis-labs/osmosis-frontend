import React from "react";
import { useTranslation } from "react-multi-lang";

import { GenericMainCard } from "~/components/cards/generic-main-card";
import { Step, Stepper, StepsIndicator } from "~/components/stepper";

export const StakeLearnMore: React.FC<{}> = () => {
  const t = useTranslation();
  return (
    <GenericMainCard title={t("stake.learnMore.getStarted")}>
      <Stepper
        className="relative flex flex-1 flex-col gap-2 text-center text-osmoverse-100"
        autoplay={{ stopOnHover: true, delayInMs: 4000 }}
      >
        <StepsIndicator className="order-1 mt-auto" />
        <Step>
          <p>
            Lock up your tokens and earn daily rewards. You may remove your
            tokens at any time, but will undergo a 14 day “unbonding” period.{" "}
          </p>
        </Step>
        <Step>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </Step>
      </Stepper>
    </GenericMainCard>
  );
};
