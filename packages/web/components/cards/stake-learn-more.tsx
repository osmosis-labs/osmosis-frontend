import React from "react";

import { GenericMainCard } from "~/components/cards/generic-main-card";
import {
  Step,
  Stepper,
  StepperLeftChevronNavigation,
  StepperRightChevronNavigation,
  StepsIndicator,
} from "~/components/stepper";
import { useMultiLanguage } from "~/hooks";

export const StakeLearnMore: React.FC<{}> = () => {
  const { t } = useMultiLanguage();

  const steps = [
    {
      title: t("stake.learnMore.step1.title"),
      bodyText: t("stake.learnMore.step1.bodyText"),
      image: "/images/what-is-staking.svg",
    },
    {
      title: t("stake.learnMore.step2.title"),
      bodyText: t("stake.learnMore.step2.bodyText"),
      image: "/images/validators.svg",
    },
    {
      title: t("stake.learnMore.step3.title"),
      bodyText: t("stake.learnMore.step3.bodyText"),
      image: "/images/picking-validators.svg",
    },
    {
      title: t("stake.learnMore.step4.title"),
      bodyText: t("stake.learnMore.step4.bodyText"),
      image: "/images/unbonding-periods.svg",
    },
    {
      title: t("stake.learnMore.step5.title"),
      bodyText: t("stake.learnMore.step5.bodyText"),
      image: "/images/start-staking.svg",
    },
  ];

  return (
    <GenericMainCard>
      <Stepper
        className="relative flex flex-1 flex-col text-center text-osmoverse-100"
        autoplay={{ stopOnHover: true, delayInMs: 4000 }}
      >
        <StepsIndicator className="order-1 mt-auto" />
        {steps.map(({ title, bodyText, image }) => (
          <Step
            key={title}
            className="flex h-full w-full items-center text-center"
          >
            <StepperLeftChevronNavigation />
            <div className="flex h-full flex-col">
              <h6 className="text-center text-white-full">{title}</h6>
              <p className="mt-8">{bodyText}</p>
              <img
                className="my-auto max-h-[15rem] lg:my-8 lg:max-h-[10rem]"
                src={image}
                alt={title}
              />
            </div>
            <StepperRightChevronNavigation />
          </Step>
        ))}
      </Stepper>
    </GenericMainCard>
  );
};
