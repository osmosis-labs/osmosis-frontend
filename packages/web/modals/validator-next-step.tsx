import Link from "next/link";
import { useCallback } from "react";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
interface ExtendedModalBaseProps extends ModalBaseProps {
  setShowValidatorModal: (val: boolean) => void;
  isNewUser: boolean;
  stakeCall: () => void;
}

export const ValidatorNextStepModal: FunctionComponent<
  ExtendedModalBaseProps
> = ({
  onRequestClose,
  isOpen,
  setShowValidatorModal,
  isNewUser,
  stakeCall,
}) => {
  const t = useTranslation();

  const { logEvent } = useAmplitudeAnalytics();

  const title = isNewUser
    ? t("stake.validatorNextStep.newUser.title")
    : t("stake.validatorNextStep.existingUser.title");

  const handleNewUserClick = useCallback(() => {
    logEvent([EventName.Stake.buildSquadClicked]);
    onRequestClose();
    setShowValidatorModal(true);
  }, [logEvent, setShowValidatorModal, onRequestClose]);

  const handleExistingUserKeepClick = useCallback(() => {
    logEvent([EventName.Stake.squadOptionClicked, { option: "keep" }]);
    localStorage.setItem("keepValidators", "true");
    onRequestClose();
    stakeCall();
  }, [logEvent, onRequestClose, stakeCall]);

  const handleExistingUserSelectClick = useCallback(() => {
    logEvent([EventName.Stake.squadOptionClicked, { option: "new" }]);
    onRequestClose();
    setShowValidatorModal(true);
  }, [logEvent, onRequestClose, setShowValidatorModal]);

  return (
    <ModalBase
      title={title}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex flex-col items-center gap-[32px] text-center"
      hideCloseButton
    >
      {isNewUser ? (
        <>
          <p className="text-base font-thin">
            {t("stake.validatorNextStep.newUser.description")}{" "}
            <Link href="">
              <a className="text-bullish-200 whitespace-nowrap underline">
                {/* TODO - add link to learn here */}
                {t("stake.validatorNextStep.newUser.learnMore")} {"->"}
              </a>
            </Link>
          </p>
          <Button
            mode="primary-bullish"
            onClick={handleNewUserClick}
            className="max-w-[23.938rem]" // 383px
          >
            {t("stake.validatorNextStep.newUser.button")}
          </Button>
        </>
      ) : (
        <>
          <p className="text-base font-thin">
            {t("stake.validatorNextStep.existingUser.description")}
          </p>
          <div className="flex w-full gap-8 md:gap-2">
            <Button
              className="w-full md:h-[4.688rem]" // 75px
              mode="primary-bullish"
              onClick={handleExistingUserKeepClick}
            >
              {t("stake.validatorNextStep.existingUser.buttonKeep")}
            </Button>
            <Button
              className="w-full md:h-[4.688rem]" // 75px
              mode="secondary-bullish"
              onClick={handleExistingUserSelectClick}
            >
              {t("stake.validatorNextStep.existingUser.buttonSelect")}
            </Button>
          </div>
        </>
      )}
    </ModalBase>
  );
};
