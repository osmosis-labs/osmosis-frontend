import { ComponentProps, FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { DynamicLottieAnimation } from "~/components/animation";
import {
  Step,
  Stepper,
  StepperLeftChevronNavigation,
  StepperRightChevronNavigation,
  StepsIndicator,
} from "~/components/stepper";

export const ConcentratedLiquidityLearnMore: FunctionComponent = () => {
  const t = useTranslation();

  return (
    <Stepper
      className="px-6 pt-4"
      autoplay={{ delayInMs: 15_000, stopOnLastSlide: true }}
    >
      <StepsIndicator className="pt-4 pb-9" mode="pills" />
      <Step className="flex w-full items-center pl-3 text-center">
        <InfoSlide
          bodyText={t("addConcentratedLiquidityIntro.tutorialA.1")}
          futureLottieContents={import("./step1.json")}
        />
        <StepperRightChevronNavigation />
      </Step>
      <Step className="flex w-full items-center text-center">
        <StepperLeftChevronNavigation />
        <InfoSlide
          className="absolute"
          bodyText={t("addConcentratedLiquidityIntro.tutorialA.2")}
          futureLottieContents={import("./step2.json")}
        />
        <StepperRightChevronNavigation />
      </Step>
      <Step className="flex w-full items-center text-center">
        <StepperLeftChevronNavigation />
        <InfoSlide
          bodyText={t("addConcentratedLiquidityIntro.tutorialA.3")}
          futureLottieContents={import("./step3.json")}
        />
        <StepperRightChevronNavigation />
      </Step>
      <Step className="flex w-full items-center text-center">
        <StepperLeftChevronNavigation />
        <InfoSlide
          bodyText={t("addConcentratedLiquidityIntro.tutorialA.4")}
          futureLottieContents={import("./step4.json")}
        />
        <StepperRightChevronNavigation />
      </Step>
      <Step className="flex w-full items-center pr-3 text-center">
        <StepperLeftChevronNavigation />
        <InfoSlide
          bodyText={t("addConcentratedLiquidityIntro.tutorialA.5")}
          futureLottieContents={import("./step5.json")}
        />
      </Step>
    </Stepper>
  );
};

const InfoSlide: FunctionComponent<
  {
    bodyText: string;
  } & ComponentProps<typeof DynamicLottieAnimation>
> = ({ bodyText, futureLottieContents }) => {
  return (
    <section>
      <p className="body2 h-[50px]">{bodyText}</p>
      <DynamicLottieAnimation
        className="h-[340px]"
        futureLottieContents={futureLottieContents}
      />
    </section>
  );
};
