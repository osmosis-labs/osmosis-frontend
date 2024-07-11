import Image from "next/image";
import React from "react";

import {
  Step,
  Stepper,
  StepperLeftChevronNavigation,
  StepperRightChevronNavigation,
  StepsIndicator,
} from "~/components/stepper";
import { MultiLanguageT, useTranslation } from "~/hooks";

const OnboardingSteps = (t: MultiLanguageT) => [
  {
    title: t("walletSelect.step1Title"),
    content: t("walletSelect.step1Content"),
  },
  {
    title: t("walletSelect.step2Title"),
    content: t("walletSelect.step2Content"),
  },
  {
    title: t("walletSelect.step3Title"),
    content: t("walletSelect.step3Content"),
  },
  {
    title: t("walletSelect.step4Title"),
    content: t("walletSelect.step4Content"),
  },
];

export const WalletTutorial = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col px-8 pt-1.5">
      <h1 className="mb-10 w-full text-center text-h6 font-h6 tracking-wider">
        {t("walletSelect.gettingStarted")}
      </h1>
      <Stepper
        className="relative flex h-full flex-col justify-between gap-2"
        autoplay={{ stopOnHover: true, delayInMs: 4000 }}
      >
        <StepperLeftChevronNavigation className="absolute left-0 top-1/2 z-50 -translate-y-1/2 transform" />
        {OnboardingSteps(t).map(({ title, content }) => (
          <Step key={title} className="my-auto">
            <div className="flex flex-col items-center justify-center gap-10 text-center">
              <div className="h-[186px] w-[186px]">
                <Image
                  src="/images/wallet-showcase.svg"
                  alt="Wallet showcase"
                  width={186}
                  height={186}
                />
              </div>
              <div className="flex max-w-sm flex-col gap-3">
                <h1 className="subtitle1">{title}</h1>
                <p className="body2 text-osmoverse-200">{content}</p>
              </div>
            </div>
          </Step>
        ))}
        <StepperRightChevronNavigation className="absolute right-0 top-1/2 z-50 -translate-y-1/2 transform" />
        <StepsIndicator className="mt-16" />
      </Stepper>
    </div>
  );
};
