import React from "react";
import { useTranslation } from "react-multi-lang";

import { GenericMainCard } from "~/components/cards/generic-main-card";
import {
  Step,
  Stepper,
  StepperLeftChevronNavigation,
  StepperRightChevronNavigation,
  StepsIndicator,
} from "~/components/stepper";

export const StakeLearnMore: React.FC<{}> = () => {
  const t = useTranslation();

  const steps = [
    {
      title: t("stake.learnMore.step1.title"),
      bodyText: t("stake.learnMore.step1.bodyText"),
      image: "/images/staking-learn-more-step-1.svg",
    },
    {
      title: t("stake.learnMore.step2.title"),
      bodyText: t("stake.learnMore.step2.bodyText"),
      image: "/images/staking-learn-more-step-2.svg",
    },
    {
      title: t("stake.learnMore.step3.title"),
      bodyText: t("stake.learnMore.step3.bodyText"),
      image: "/images/staking-learn-more-step-3.svg",
    },
    {
      title: t("stake.learnMore.step4.title"),
      bodyText: t("stake.learnMore.step4.bodyText"),
      image: "/images/staking-learn-more-step-4.svg",
    },
    {
      title: t("stake.learnMore.step5.title"),
      bodyText: t("stake.learnMore.step5.bodyText"),
      image: "/images/staking-learn-more-step-5.svg",
    },
  ];

  return (
    <GenericMainCard>
      <Stepper
        className="relative flex flex-1 flex-col gap-2 text-center text-osmoverse-100"
        autoplay={{ stopOnHover: true, delayInMs: 4000 }}
      >
        <StepsIndicator className="order-1 mt-auto" />
        {steps.map(({ title, bodyText, image }) => (
          <Step key={title} className="flex w-full items-center text-center">
            <StepperLeftChevronNavigation />
            <div className="flex flex-col gap-8">
              <h6 className="text-center text-white-full">{title}</h6>
              <p>{bodyText}</p>
              <img src={image} alt={title} />
            </div>
            <StepperRightChevronNavigation />
          </Step>
        ))}
      </Stepper>
    </GenericMainCard>
  );
};
