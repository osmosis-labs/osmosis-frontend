import React, { useCallback, useMemo } from "react";

import { Button } from "~/components/buttons";
import { GenericMainCard } from "~/components/cards/generic-main-card";
import {
  Step,
  Stepper,
  StepperLeftChevronNavigation,
  StepperRightChevronNavigation,
  StepsIndicator,
} from "~/components/stepper";
import { useTranslation } from "~/hooks";
import { useWalletSelect } from "~/hooks/wallet-select";
import { useStore } from "~/stores";

const BuildStakeSquadButton: React.FC<StakeLearnMoreProps> = ({
  isWalletConnected,
  setShowValidatorModal,
}) => {
  const { t } = useTranslation();
  const { chainStore } = useStore();
  const osmosisChainId = chainStore.osmosis.chainId;
  const { onOpenWalletSelect } = useWalletSelect();

  const onStakeButtonClick = useCallback(() => {
    if (isWalletConnected) {
      setShowValidatorModal();
    } else {
      onOpenWalletSelect(osmosisChainId);
    }
  }, [
    isWalletConnected,
    onOpenWalletSelect,
    osmosisChainId,
    setShowValidatorModal,
  ]);

  const buttonText = useMemo(() => {
    if (!isWalletConnected) return t("connectWallet");
    return "Build Stake Squad";
  }, [isWalletConnected, t]);

  return (
    <Button
      mode="primary"
      className="mb-8 w-1/2 self-center !border-osmoverse-800 !bg-osmoverse-800 hover:!border-osmoverse-700 hover:!bg-osmoverse-700 lg:w-full"
      onClick={onStakeButtonClick}
    >
      {buttonText}
    </Button>
  );
};

interface StakeLearnMoreProps {
  isWalletConnected: boolean;
  setShowValidatorModal: () => void;
}

export const StakeLearnMore: React.FC<StakeLearnMoreProps> = ({
  isWalletConnected,
  setShowValidatorModal,
}) => {
  const { t } = useTranslation();

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
        autoplay={{ stopOnHover: true, delayInMs: 4000, stopOnLastSlide: true }}
      >
        <StepsIndicator className="order-1 mt-auto" />
        {steps.map(({ title, bodyText, image }, index) => {
          const isFirstStep = index === 0;
          const isLastStep = index === steps.length - 1;
          return (
            <Step
              key={title}
              className="flex h-full w-full items-center text-center"
            >
              {!isFirstStep && <StepperLeftChevronNavigation />}
              <div className="flex h-full flex-col gap-8">
                <h6 className="text-center text-white-full">{title}</h6>
                {/* <p className="mt-8 text-sm text-osmoverse-200">{bodyText}</p> */}
                <p className="text-sm text-osmoverse-200">{bodyText}</p>
                <img
                  // className="my-auto max-h-[15rem] lg:my-8 lg:max-h-[10rem]"
                  className="my-auto max-h-[15rem]"
                  src={image}
                  alt={title}
                />
                {isLastStep && (
                  <BuildStakeSquadButton
                    isWalletConnected={isWalletConnected}
                    setShowValidatorModal={setShowValidatorModal}
                  />
                )}
              </div>
              {!isLastStep && <StepperRightChevronNavigation />}
            </Step>
          );
        })}
      </Stepper>
    </GenericMainCard>
  );
};
